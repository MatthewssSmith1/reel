import { collection, deleteDoc, doc, getDocs, increment, query, setDoc, updateDoc, where } from 'firebase/firestore'
import { auth, db } from './firebase'
import { create } from 'zustand'

type LikeStore = {
  likedPosts: Map<string, boolean>
  isInitialized: boolean
  loadLikes: () => Promise<void>
  toggleLike: (postId: string) => Promise<void>
  isLiked: (postId: string) => boolean
}

export const useLikeStore = create<LikeStore>((set, get) => ({
  likedPosts: new Map(),
  isInitialized: false,

  loadLikes: async () => {
    const userId = auth.currentUser?.uid
    if (!userId) {
      set({ likedPosts: new Map(), isInitialized: false })
      return
    }

    try {
      const likesRef = collection(db, 'likes')
      const q = query(likesRef, where('user_id', '==', userId))
      const snapshot = await getDocs(q)
      const likedPosts = new Map(
        snapshot.docs.map(doc => [doc.data().post_id, true])
      )
      set({ likedPosts, isInitialized: true })
    } catch (error) {
      console.error('Failed to initialize likes:', error)
      set({ likedPosts: new Map(), isInitialized: false })
    }
  },

  toggleLike: async (postId: string) => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    const { likedPosts } = get()
    const isCurrentlyLiked = likedPosts.get(postId) ?? false
    const newLikedPosts = new Map(likedPosts)

    newLikedPosts.set(postId, !isCurrentlyLiked)
    set({ likedPosts: newLikedPosts })

    try {
      const likeId = `${userId}_${postId}`
      const likeRef = doc(db, 'likes', likeId)
      const postRef = doc(db, 'posts', postId)

      if (isCurrentlyLiked) {
        await deleteDoc(likeRef)
        await updateDoc(postRef, {
          likes_count: increment(-1)
        })
      } else {
        await setDoc(likeRef, {
          user_id: userId,
          post_id: postId,
          created_at: new Date()
        })
        await updateDoc(postRef, {
          likes_count: increment(1)
        })
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
      newLikedPosts.set(postId, isCurrentlyLiked)
      set({ likedPosts: newLikedPosts })
    }
  },

  isLiked: (postId: string) => get().likedPosts.get(postId) ?? false,
})) 