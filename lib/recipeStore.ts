import { collection, getDocs, query, where, or, doc, deleteDoc } from 'firebase/firestore'
import { diffLines, diffWords, Change } from 'diff'
import { Recipe, db, functions } from '@/lib/firebase'
import { httpsCallable } from 'firebase/functions'
import { create } from 'zustand'

type RecipeStore = {
  recipes: Recipe[]
  currentRecipe: Recipe | null
  diff: Change[][][] | null 
  isLoading: boolean
  flashTimestamp: number
  loadRecipes: (userId: string) => Promise<void>
  openRecipe: (recipeId: string) => void
  modifyRecipe: (instruction: string) => Promise<void>
  resetRecipe: () => void
  flashChanges: () => void
}

function diffRecipes(recipeA: Recipe, recipeB: Recipe): Change[][][] {
  const sections = [
    { a: recipeA.ingredients, b: recipeB.ingredients },
    { a: recipeA.steps, b: recipeB.steps },
    { a: recipeA.equipment, b: recipeB.equipment }
  ]

  return sections.map(({ a, b }) => {
    const lineDiffs = diffWords(a.join('\n'), b.join('\n'))
    const result: Change[][] = []
    let currentLine: Change[] = []

    const finishLine = () => {
      if (currentLine.length > 0) {
        const filteredLine = currentLine.filter(change => !change.removed)
        if (filteredLine.length > 0) {
          result.push(filteredLine)
        }
        currentLine = []
      }
    }

    for (const change of lineDiffs) {
      if (change.value.includes('\n')) {
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
        currentLine.push(change)
      }
    }
    
    finishLine()
    return result
  })
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [],
  currentRecipe: null,
  diff: null,
  isLoading: false,
  flashTimestamp: 0,
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
    const modified = recipes.find(r => r.parent_id === recipeId)
    const original = recipes.find(r => r.id === recipeId)
    
    set({
      currentRecipe: modified || original || null,
      diff: modified && original ? diffRecipes(original, modified) : null
    })
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
  resetRecipe: async () => {
    const { currentRecipe, recipes } = get()
    if (!currentRecipe || !currentRecipe.parent_id) return

    const originalRecipe = recipes.find(r => r.id === currentRecipe.parent_id)
    if (!originalRecipe)
      return console.error('Original recipe not found')

    try {
      const recipeRef = doc(db, 'recipes', currentRecipe.id)
      await deleteDoc(recipeRef)

      set(state => ({
        recipes: state.recipes.filter(r => r.id !== currentRecipe.id),
        currentRecipe: originalRecipe,
        diff: null
      }))
    } catch (error) {
      console.error('Error resetting recipe:', error)
    }
  },
  flashChanges: () => {
    set({ flashTimestamp: Date.now() })
  },
}))