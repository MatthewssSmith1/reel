import { collection, getDocs } from 'firebase/firestore'
import { Recipe, db, Post } from '@/lib/firebase'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'
import { create } from 'zustand'

type RecipeStore = {
  recipes: Recipe[]
  currentRecipe: Recipe | null
  isLoading: boolean
  loadRecipes: () => Promise<void>
  openRecipe: (recipeId: string) => void
  modifyRecipe: (instruction: string) => Promise<void>
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [],
  currentRecipe: null,
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
  },
  openRecipe: (recipeId: string) => {
    const { recipes } = get()
    const recipe = recipes.find(r => r.parent_id === recipeId)
                || recipes.find(r => r.id === recipeId)
    set({ currentRecipe: recipe || null })
  },
  modifyRecipe: async (instruction: string) => {
    set({ isLoading: true })
    const { currentRecipe } = get()
    if (!currentRecipe) return

    try {
      const modifyRecipeFn = httpsCallable(functions, 'modifyRecipe')
      const result = await modifyRecipeFn({
        recipeId: currentRecipe.id,
        instruction: instruction.trim(),
      })

      const newRecipe = result.data as Recipe
      set((state) => {
        const recipes = [...state.recipes]
        const existingIndex = recipes.findIndex(r => r.id === newRecipe.id)
        
        if (existingIndex !== -1) recipes[existingIndex] = newRecipe
        else recipes.push(newRecipe)
        
        return { recipes, currentRecipe: newRecipe, isLoading: false }
      })
    } catch (error) {
      console.error('Error modifying recipe:', error)
      set({ isLoading: false })
    }
  },
}))