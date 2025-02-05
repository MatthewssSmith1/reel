import { collection, deleteDoc, doc, getDocs, increment, query, setDoc, updateDoc, where } from 'firebase/firestore'
import { auth, db } from './firebase'
import { create } from 'zustand'

export type ItemType = 'post' | 'comment'

type LikeStore = {
  likedItems: Map<string, boolean>
  isInitialized: boolean
  loadLikes: () => Promise<void>
  toggleLike: (itemId: string) => Promise<void>
  isLiked: (itemId: string) => boolean
}

const createLikeStore = (itemType: ItemType) => create<LikeStore>((set, get) => ({
  likedItems: new Map(),
  isInitialized: false,

  loadLikes: async () => {
    const userId = auth.currentUser?.uid
    if (!userId) {
      set({ likedItems: new Map(), isInitialized: false })
      return
    }

    try {
      const likesRef = collection(db, `${itemType}_likes`)
      const q = query(likesRef, where('user_id', '==', userId))
      const snapshot = await getDocs(q)
      const likedItems = new Map(
        snapshot.docs.map(doc => [doc.data()[`${itemType}_id`], true])
      )
      set({ likedItems, isInitialized: true })
    } catch (error) {
      console.error(`Failed to initialize ${itemType} likes:`, error)
      set({ likedItems: new Map(), isInitialized: false })
    }
  },

  toggleLike: async (itemId: string) => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    const { likedItems } = get()
    const isCurrentlyLiked = likedItems.get(itemId) ?? false
    const newLikedItems = new Map(likedItems)

    newLikedItems.set(itemId, !isCurrentlyLiked)
    set({ likedItems: newLikedItems })

    try {
      const likeId = `${userId}_${itemId}`
      const likeRef = doc(db, `${itemType}_likes`, likeId)
      const itemRef = doc(db, `${itemType}s`, itemId)

      if (isCurrentlyLiked) {
        await deleteDoc(likeRef)
        await updateDoc(itemRef, {
          likes_count: increment(-1)
        })
      } else {
        await setDoc(likeRef, {
          user_id: userId,
          [`${itemType}_id`]: itemId,
          created_at: new Date()
        })
        await updateDoc(itemRef, {
          likes_count: increment(1)
        })
      }
    } catch (error) {
      console.error(`Failed to toggle ${itemType} like:`, error)
      newLikedItems.set(itemId, isCurrentlyLiked)
      set({ likedItems: newLikedItems })
    }
  },

  isLiked: (itemId: string) => get().likedItems.get(itemId) ?? false,
}))

export const usePostLikeStore = createLikeStore('post')
export const useCommentLikeStore = createLikeStore('comment') 