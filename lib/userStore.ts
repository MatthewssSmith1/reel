import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db, User } from '@/lib/firebase'
import { create } from 'zustand'

type UserStore = {
  users: Record<string, User>
  isLoading: boolean
  authUser: User | null
  loadUsers: (authUserId?: string) => Promise<void>
  updateFollowCounts: (followerId: string, followingId: string, increment: boolean) => void
  updateBio: (userId: string, bio: string) => Promise<void>
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: {},
  isLoading: false,
  authUser: null,
  loadUsers: async (authUserId?: string) => {
    set({ isLoading: true })
    try {
      const usersRef = collection(db, 'users')
      const snapshot = await getDocs(usersRef)
      
      const users: Record<string, User> = snapshot.docs.reduce((acc, doc) => ({
        ...acc,
        [doc.id]: { uid: doc.id, ...doc.data() } as User
      }), {})

      const authUser = authUserId ? users[authUserId] : null
      set({ users, authUser, isLoading: false })
    } catch (error) {
      console.log(error)
      set({ isLoading: false })
    }
  },
  updateFollowCounts: (followerId: string, followingId: string, increment: boolean) => {
    const { users, authUser } = get()
    const delta = increment ? 1 : -1

    set({
      users: {
        ...users,
        [followerId]: { ...users[followerId], following_count: (users[followerId]?.following_count || 0) + delta },
        [followingId]: { ...users[followingId], followers_count: (users[followingId]?.followers_count || 0) + delta }
      },
      authUser: authUser?.uid === followerId 
        ? { ...authUser, following_count: (authUser.following_count || 0) + delta }
        : authUser?.uid === followingId
        ? { ...authUser, followers_count: (authUser.followers_count || 0) + delta }
        : authUser
    })
  },
  updateBio: async (userId: string, bio: string) => {
    const { users, authUser } = get()
    try {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, { bio })
      
      set({
        users: {
          ...users,
          [userId]: { ...users[userId], bio }
        },
        authUser: authUser?.uid === userId 
          ? { ...authUser, bio }
          : authUser
      })
    } catch (error) {
      console.error('Failed to update bio:', error)
      throw error
    }
  }
})) 