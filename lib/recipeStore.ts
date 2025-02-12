import { collection, getDocs, query, where, or } from 'firebase/firestore'
import { diffLines, diffWords, Change } from 'diff'
import { Recipe, db, Post } from '@/lib/firebase'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'
import { create } from 'zustand'

type RecipeStore = {
  recipes: Recipe[]
  currentRecipe: Recipe | null
  diff: Change[][] | null 
  isLoading: boolean
  loadRecipes: (userId: string) => Promise<void>
  openRecipe: (recipeId: string) => void
  modifyRecipe: (instruction: string) => Promise<void>
}

// TODO: refactor to use diffLines(...) from diff
function diffRecipes(recipeA: Recipe, recipeB: Recipe): Change[][] {
  // Convert recipes to arrays of lines for comparison
  const linesA = [...recipeA.ingredients, ...recipeA.steps, ...recipeA.equipment]
  const linesB = [...recipeB.ingredients, ...recipeB.steps, ...recipeB.equipment]

  // First diff the lines to identify which ones changed
  const lineDiffs = diffWords(linesA.join('\n'), linesB.join('\n'))

  // Split the diffs back into lines and process each line
  const result: Change[][] = []
  let currentLine: Change[] = []

  // Helper to add a line to result and start a new one
  const finishLine = () => {
    if (currentLine.length > 0) {
      // Filter out removed content as we only want to show unchanged and new
      const filteredLine = currentLine.filter(change => !change.removed)
      if (filteredLine.length > 0) {
        result.push(filteredLine)
      }
      currentLine = []
    }
  }

  for (const change of lineDiffs) {
    if (change.value.includes('\n')) {
      // Handle multi-line changes
      const lines = change.value.split('\n')
      lines.forEach((line, i) => {
        if (line.length > 0) {
          currentLine.push({
            value: line,
            added: change.added || false,
            removed: change.removed || false,
            count: 1
          })
        }
        if (i < lines.length - 1) {
          finishLine()
        }
      })
    } else if (change.value.length > 0) {
      // Handle single-line changes
      currentLine.push(change)
    }
  }
  
  // Make sure to add the last line if there is one
  finishLine()

  return result
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [],
  currentRecipe: null,
  diff: null,
  isLoading: false,
  loadRecipes: async (userId: string) => {
    set({ isLoading: true })
    try {
      const recipesRef = collection(db, 'recipes')
      const snapshot = await getDocs(query(recipesRef, 
        or(
          where('parent_id', '==', null),
          where('author_id', '==', userId)
        )
      ))
      const recipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe))
      set({ recipes, isLoading: false })
    } catch (error) {
      console.error('Error in loadRecipes:', error)
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

      const diff = diffRecipes(currentRecipe, newRecipe)

      console.log('Recipe diff:', diff)

      set((state) => {
        const recipes = [...state.recipes]
        const existingIndex = recipes.findIndex(r => r.id === newRecipe.id)
        
        if (existingIndex !== -1) recipes[existingIndex] = newRecipe
        else recipes.push(newRecipe)
        
        return { recipes, currentRecipe: newRecipe, diff, isLoading: false }
      })
    } catch (error) {
      console.error('Error modifying recipe:', error)
      set({ isLoading: false })
    }
  },
}))