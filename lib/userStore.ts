import { collection, getDocs } from 'firebase/firestore'
import { db, User } from '@/lib/firebase'
import { create } from 'zustand'

type UserStore = {
  users: Record<string, User>
  isLoading: boolean
  loadUsers: () => Promise<void>
}

export const useUserStore = create<UserStore>((set) => ({
  users: {},
  isLoading: false,
  loadUsers: async () => {
    set({ isLoading: true })
    try {
      const usersRef = collection(db, 'users')
      const snapshot = await getDocs(usersRef)
      
      const users = snapshot.docs.reduce((acc, doc) => ({
        ...acc,
        [doc.id]: { uid: doc.id, ...doc.data() } as User
      }), {})

      set({ users, isLoading: false })
    } catch (error) {
      console.log(error)
      set({ isLoading: false })
    }
  }
})) 