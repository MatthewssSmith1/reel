import { tool } from "@langchain/core/tools"
import { z } from "zod"

const schema = z.object({
  title: z.string(),
  prepTime: z.string(),
  cookTime: z.string(),
  servings: z.number(),
  tags: z.array(z.string()),
  ingredients: z.array(z.string()),
  equipment: z.array(z.string()),
  steps: z.array(z.string())
});

export const buildRecipeFormatterTool = () => tool(
  async (recipe: z.infer<typeof schema>) => JSON.stringify(schema.parse(recipe)),
  {
    name: "recipeFormatter",
    description: "Formats a recipe into the standard structure. Use this as the final step before responding to format your modified recipe.",
    schema
  }
);
