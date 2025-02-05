import { collection, getDocs, orderBy, query, where, addDoc } from 'firebase/firestore'
import { Timestamp } from 'firebase/firestore'
import { Comment } from '@/lib/firebase'
import { create } from 'zustand'
import { auth } from '@/lib/firebase'
import { db } from '@/lib/firebase'

type CommentStore = {
  comments: Comment[] | null
  isLoading: boolean
  isMessagesOpen: boolean
  loadComments: (postId: string) => Promise<void>
  toggleMessages: (isOpen: boolean) => void
  submitComment: (postId: string, text: string) => Promise<void>
}

export const useCommentStore = create<CommentStore>((set, get) => ({
  comments: null,
  isLoading: false,
  isMessagesOpen: false,
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
      const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)).reverse()
      
      set({ comments, isLoading: false })
    } catch (error) {
      console.log(error)
      set({ isLoading: false })
    }
  },
  toggleMessages: (isOpen: boolean) => set({ isMessagesOpen: isOpen }),
  submitComment: async (postId: string, text: string) => {
    if (!text.trim()) return;
    
    try {
      const commentsRef = collection(db, 'comments');
      const newComment: Omit<Comment, 'id'> = {
        post_id: postId,
        user_id: auth.currentUser!.uid,
        text: text.trim(),
        created_at: Timestamp.now(),
        likes_count: 0
      };
      
      const docRef = await addDoc(commentsRef, newComment);
      const comment = { id: docRef.id, ...newComment } as Comment;
      
      set(state => ({
        comments: state.comments ? [...state.comments, comment] : [comment]
      }));
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  }
}))
