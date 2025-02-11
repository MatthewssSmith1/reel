import { collection, getDocs } from 'firebase/firestore'
import { Recipe, db } from '@/lib/firebase'
import { create } from 'zustand'

type RecipeStore = {
  recipes: Recipe[]
  isLoading: boolean
  loadRecipes: () => Promise<void>
}

export const useRecipeStore = create<RecipeStore>((set) => ({
  recipes: [],
  isLoading: false,
  loadRecipes: async () => {
    set({ isLoading: true })
    try {
      const recipesRef = collection(db, 'recipes')
      const snapshot = await getDocs(recipesRef)
      const recipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe))
      set({ recipes, isLoading: false })
    } catch (error) {
      console.log(error)
      set({ isLoading: false })
    }
  }
})) 