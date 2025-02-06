import { collection, getDocs, orderBy, query, where, addDoc, increment, doc, updateDoc, Timestamp } from 'firebase/firestore'
import { Comment, auth, db } from '@/lib/firebase'
import { usePostStore } from '@/lib/postStore'
import { create } from 'zustand'

type CommentStore = {
  comments: Comment[]
  isLoading: boolean
  loadComments: (postId: string) => Promise<void>
  submitComment: (postId: string, text: string) => Promise<void>
}

export const useCommentStore = create<CommentStore>((set) => ({
  comments: [],
  isLoading: false,
  loadComments: async (postId: string) => {
    set({ isLoading: true })
    try {
      const commentsRef = collection(db, 'comments')
      const q = query(
        commentsRef,
        where('post_id', '==', postId),
        orderBy('created_at', 'desc')
      )
      const snapshot = await getDocs(q)
      // TODO: process comments by nesting replies inside their parents' `children` arrays
      const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)).reverse()
      
      set({ comments, isLoading: false })
    } catch (error) {
      console.log(error)
      set({ isLoading: false })
    }
  },
  // TODO: handle submitting comment replies (db insertion is similar, 
  // but append them to their parent's `children` array rather than insert a top level comment)
  submitComment: async (postId: string, text: string) => {
    if (!text.trim()) return;
    
    try {
      const commentsRef = collection(db, 'comments');
      const postRef = doc(db, 'posts', postId);
      
      const newComment: Omit<Comment, 'id'> = {
        post_id: postId,
        user_id: auth.currentUser!.uid,
        text: text.trim(),
        created_at: Timestamp.now(),
        replies_count: 0,
        likes_count: 0,
        parent_id: null
      };
      
      const docRef = await addDoc(commentsRef, newComment);
      await updateDoc(postRef, {
        comments_count: increment(1)
      });
      
      const comment = { id: docRef.id, ...newComment } as Comment;
      usePostStore.getState().offsetCommentCount(postId);
      
      set(state => ({ comments: [...state.comments, comment] }));
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  }
}))
