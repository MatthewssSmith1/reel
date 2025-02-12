import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { Post, db } from '@/lib/firebase'
import { create } from 'zustand'

type PostStore = {
  posts: Post[]
  isLoading: boolean
  loadPosts: () => Promise<void>
  offsetCommentCount: (postId: string, diff?: number) => void
}

export const usePostStore = create<PostStore>((set, get) => ({
  posts: [],
  isLoading: false,
  loadPosts: async () => {
    set({ isLoading: true })
    try {
      const postsRef = collection(db, 'posts')
      const q = query(postsRef, orderBy('created_at', 'desc'))
      const snapshot = await getDocs(q)
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post))
      set({ posts, isLoading: false })
    } catch (error) {
      console.log(error)
      set({ isLoading: false })
    }
  },
  offsetCommentCount: (postId: string, diff = 1) => set(state => ({
    posts: state.posts.map(post => 
      post.id === postId 
        ? { ...post, comments_count: post.comments_count + diff }
        : post
    )
  })),
}))
