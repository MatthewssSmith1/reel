import modifyRecipe from './modifyRecipe';
import searchPosts from './searchPosts';
import * as admin from "firebase-admin";

admin.initializeApp();

export { searchPosts, modifyRecipe };