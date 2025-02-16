import { photoToIngredients, ingredientsToPosts } from './searchPostsByPhoto';
import searchPostDescriptions from './searchPostDescriptions';
import modifyRecipe from './modifyRecipe';
import * as admin from "firebase-admin";

admin.initializeApp();

export { 
  searchPostDescriptions, 
  photoToIngredients, 
  ingredientsToPosts, 
  modifyRecipe 
};