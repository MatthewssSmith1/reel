import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";
import { llm } from "./openai";
import { z } from "zod";

const searchPhotoSchema = z.object({
  photo: z.string().min(1),
});

type SearchPhoto = z.infer<typeof searchPhotoSchema>;

type Recipe = {
  id: string;
  parent_id: string | null;
  author_id: string;
  title: string;
  ingredients: string[];
};

const searchPostsByPhoto = onCall<SearchPhoto>(async (request) => {
  try {
    const result = searchPhotoSchema.safeParse(request.data);
    
    if (!result.success) {
      throw new Error(`Invalid input: ${result.error.message}`);
    }

    const { photo } = result.data;
    
    const db = admin.firestore();
    const recipesSnapshot = await db.collection('recipes').get();
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
        content: "You are a culinary expert. You will receive an image of ingredients followed by a list of recipes with their ingredients. Your task is to identify which recipes could be made (or partially made) with the ingredients shown in the image. Consider that the image might not show all ingredients needed for a recipe - that's okay. Focus on recipes where the image shows key/main ingredients. Return ONLY a comma-separated list of recipe IDs, nothing else. Example response format: 'recipe_id_1,recipe_id_2,recipe_id_3'"
      }),
      new HumanMessage({
        content: [
          {
            type: "text",
            text: "What recipes from this list could be made (or partially made) with the ingredients shown in this image?\n\n" + recipesList
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

    const recipeIds = response.content.toString().split(',').map(id => id.trim());
    logger.info(`Matched recipe IDs: ${recipeIds.join(', ')}`);

    const postsSnapshot = await db.collection('posts')
      .where('recipe_id', 'in', recipeIds)
      .get();
    
    const postIds = postsSnapshot.docs.map(doc => doc.id);
    logger.info(`Found ${postIds.length} posts matching recipes`);

    return { postIds };
  } catch (error) {
    logger.error('Search posts by photo error:', error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.message}`);
    }
    throw new Error('Failed to search posts by photo');
  }
});

export default searchPostsByPhoto;