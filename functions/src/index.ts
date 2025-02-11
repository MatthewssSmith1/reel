import { onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { z } from "zod";

const searchQuerySchema = z.object({
  query: z.string().min(1),
});

type SearchQuery = z.infer<typeof searchQuerySchema>;

admin.initializeApp();

export const searchPosts = onCall<SearchQuery>(async (request) => {
  try {
    const result = searchQuerySchema.safeParse(request.data);
    
    if (!result.success) {
      throw new Error(`Invalid input: ${result.error.message}`);
    }
    
    const { query } = result.data;
    const searchQuery = query.toLowerCase();
    
    const db = admin.firestore();
    const postsRef = db.collection('posts');
    const snapshot = await postsRef.get();
    
    const postIds = snapshot.docs
      .filter(doc => doc.data().description?.toLowerCase().includes(searchQuery))
      .map(doc => doc.id);
    
    logger.info(`Found ${postIds.length} posts matching query: ${query}`);

    return { postIds };
  } catch (error) {
    logger.error('Search posts error:', error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.message}`);
    }
    throw new Error('Failed to search posts');
  }
});