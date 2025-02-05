import { collection, getDocs } from 'firebase/firestore'
import { db, User } from '@/lib/firebase'
import { create } from 'zustand'

type UserStore = {
  users: Record<string, User>
  isLoading: boolean
  authUser: User | null
  loadUsers: (authUserId?: string) => Promise<void>
}

export const useUserStore = create<UserStore>((set) => ({
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
  }
})) 