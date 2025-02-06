import { collection, getDocs, orderBy, query, where, addDoc, increment, doc, updateDoc, Timestamp } from 'firebase/firestore'
import { Comment, auth, db } from '@/lib/firebase'
import { usePostStore } from '@/lib/postStore'
import { create } from 'zustand'

type CommentStore = {
  comments: Comment[]
  isLoading: boolean
  replyTarget: Comment | null
  setReplyTarget: (comment: Comment | null) => void
  loadComments: (postId: string) => Promise<void>
  submitComment: (postId: string, text: string) => Promise<void>
}

export const useCommentStore = create<CommentStore>((set, get) => ({
  comments: [],
  isLoading: false,
  replyTarget: null,
  setReplyTarget: (comment) => set({ replyTarget: comment }),
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
      const flatComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)).reverse()
      
      const commentMap = new Map<string, Comment>()
      const topLevelComments: Comment[] = []

      flatComments.forEach(comment => {
        comment.children = []
        commentMap.set(comment.id, comment)
      })

      flatComments.forEach(comment => {
        if (comment.parent_id) commentMap.get(comment.parent_id)?.children!.push(comment)
        else topLevelComments.push(comment)
      })
      
      set({ comments: topLevelComments, isLoading: false })
    } catch (error) {
      console.log(error)
      set({ isLoading: false })
    }
  },
  submitComment: async (postId: string, text: string) => {
    if (!text.trim()) return;
    
    try {
      const { replyTarget } = get()
      
      const newComment: Omit<Comment, 'id'> = {
        post_id: postId,
        user_id: auth.currentUser!.uid,
        text: text.trim(),
        created_at: Timestamp.now(),
        replies_count: 0,
        likes_count: 0,
        parent_id: replyTarget?.id ?? null
      };

      const commentsRef = collection(db, 'comments');
      const commentDoc = await addDoc(commentsRef, newComment);
      const comment = { id: commentDoc.id, ...newComment };

      if (replyTarget) {
        const parentCommentRef = doc(db, 'comments', replyTarget.id);
        await updateDoc(parentCommentRef, {
          replies_count: increment(1)
        });

        set(state => ({
          comments: state.comments.map(c => 
            c.id === replyTarget.id
              ? { ...c, children: [...(c.children || []), comment], replies_count: (c.replies_count || 0) + 1 }
              : c
          )
        }));
      } else {
        set(state => ({ comments: [...state.comments, { ...comment, children: [] }] }));
      }

      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments_count: increment(1)
      });

      usePostStore.getState().offsetCommentCount(postId);
    } catch (error) {
      console.log(error);
    }
  }
}))
