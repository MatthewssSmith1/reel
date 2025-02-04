import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { create } from 'zustand'
import { Post } from '@/lib/firebase'
import { db } from '@/lib/firebase'

type PostStore = {
  posts: Post[]
  isLoading: boolean
  loadPosts: () => Promise<void>
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
    }
  },
}))
