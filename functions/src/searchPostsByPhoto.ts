import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";
import { llm } from "./openai";
import { z } from "zod";

type Recipe = {
  id: string;
  parent_id: string | null;
  author_id: string;
  title: string;
  ingredients: string[];
};

const photoToIngredientsSchema = z.object({
  photo: z.string().min(1),
});

type PhotoToIngredients = z.infer<typeof photoToIngredientsSchema>;

export const photoToIngredients = onCall<PhotoToIngredients>(async (request) => {
  try {
    const result = photoToIngredientsSchema.safeParse(request.data);
    
    if (!result.success) {
      throw new Error(`Invalid input: ${result.error.message}`);
    }

    const { photo } = result.data;

    const response = await llm.invoke([
      new SystemMessage({
        content: "You are a culinary expert. You will receive an image of ingredients. Your task is to identify all ingredients shown in the image. Return ONLY a comma-separated list of ingredient names, nothing else. Be specific but concise. Example response format: 'tomatoes,onions,garlic,olive oil'"
      }),
      new HumanMessage({
        content: [
          {
            type: "text",
            text: "What ingredients do you see in this image?"
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${photo}`
            }
          }
        ]
      })
    ]);

    const ingredients = response.content.toString().split(',').map(i => i.trim());
    logger.info(`Detected ingredients: ${ingredients.join(', ')}`);

    return { ingredients };
  } catch (error) {
    logger.error('Photo to ingredients error:', error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.message}`);
    }
    throw new Error('Failed to extract ingredients from photo');
  }
});

const ingredientsToPostsSchema = z.object({
  ingredients: z.array(z.string()),
});

type IngredientsToPosts = z.infer<typeof ingredientsToPostsSchema>;

export const ingredientsToPosts = onCall<IngredientsToPosts>(async (request) => {
  try {
    const result = ingredientsToPostsSchema.safeParse(request.data);
    
    if (!result.success) {
      throw new Error(`Invalid input: ${result.error.message}`);
    }

    const { ingredients } = result.data;
    
    const db = admin.firestore();
    const recipesSnapshot = await db.collection('recipes')
      .where('parent_id', '==', null)
      .get();
    const recipes = recipesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Recipe[];

    const recipesList = recipes.map(recipe => `
### ${recipe.title} (ID: ${recipe.id})
Ingredients:
${recipe.ingredients.map(i => `- ${i}`).join('\n')}`).join('\n\n');

    const response = await llm.invoke([
      new SystemMessage({
        content: `You are a helpful assistant. You will receive a series of recipes: each one will be a recipe ID and ingredients list. 
        
Your task is to identify the IDs of recipes that could be made (or partially made) with these available ingredients: ${ingredients.join(', ')}.

Return your response as an unordered markdown list where each line is formatted as \`- \${recipeID} (\${matchingIngredients})\` where \`matchingIngredients\` is the number of the available ingredients above that appear in the corresponding recipe.

For example:
- 2mEE2dx4AT3 (5)
- yse3qc452lg (3)

Only include IDs for recipes where there is at least one ingredient match. If there are no recipes that match the provided ingredients, just respond 'NO MATCHES'.`
      }),
      new HumanMessage({
        content: `# RECIPES:\n${recipesList}\n\n# AVAILABLE INGREDIENTS:\nKeep in mind that the available ingredients are:${ingredients.join(', ')}`
      })
    ]);

    try {
      const matches = response.content.toString()
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const match = line.match(/^- (\w+)\s*\((\d+)\)\s*$/);
          if (!match) {
            logger.warn(`Skipping invalid line format: ${line}`);
            return null;
          }
          const [, id, matchCount] = match;
          if (matchCount === '0') return null;
          
          const recipe = recipes.find(r => r.id === id);
          if (!recipe) {
            logger.warn(`Recipe not found for id: ${id}`);
            return null;
          }
          
          return {
            id,
            matchCount: parseInt(matchCount),
            totalCount: recipe.ingredients.length
          };
        })
        .filter((match): match is NonNullable<typeof match> => match !== null);

      if (matches.length === 0) {
        logger.warn('No valid matches found in response');
        return { postIds: [], matchScores: [] };
      }

      const recipeIds = matches.map(match => match.id);
      const matchScores = matches.map(match => match.matchCount / match.totalCount);
      
      const recipeScores = new Map(
        recipeIds.map((id, i) => [id, matchScores[i]])
      );

      const postsSnapshot = await db.collection('posts')
        .where('recipe_id', 'in', recipeIds)
        .get();

      const postIdsAndScores = postsSnapshot.docs.map(doc => ({
        postId: doc.id,
        score: recipeScores.get(doc.data().recipe_id) ?? 0
      }));

      postIdsAndScores.sort((a, b) => b.score - a.score);

      return {
        postIds: postIdsAndScores.map(p => p.postId),
        matchScores: postIdsAndScores.map(p => p.score)
      };
    } catch (error) {
      logger.error('Failed to parse LLM response:', error);
      return { postIds: [], matchScores: [] };
    }
  } catch (error) {
    logger.error('Ingredients to posts error:', error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.message}`);
    }
    throw new Error('Failed to search posts by ingredients');
  }
});