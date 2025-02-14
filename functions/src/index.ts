import searchPostDescriptions from './searchPostDescriptions';
import searchPostsByPhoto from './searchPostsByPhoto';
import modifyRecipe from './modifyRecipe';
import * as admin from "firebase-admin";

admin.initializeApp();

export { searchPostDescriptions, searchPostsByPhoto, modifyRecipe };