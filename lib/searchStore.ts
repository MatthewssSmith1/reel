import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { create } from 'zustand';

type SearchStore = {
  isLoading: boolean;
  searchText: string;
  matchingIds: string[];
  matchScores: number[];
  ingredients: string[] | null;
  setSearchText: (text: string) => void;
  setIngredients: (ingredients: string[] | null) => void;
  handleTextSearch: () => Promise<void>;
  handlePhotoSearch: (base64Image: string) => Promise<void>;
  handleIngredientsSearch: () => Promise<void>;
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  isLoading: false,
  searchText: '',
  matchingIds: [],
  matchScores: [],
  ingredients: null,
  setSearchText: (text: string) => set({ searchText: text }),
  setIngredients: (ingredients: string[] | null) => set({ ingredients }),
  handleTextSearch: async () => {
    const { searchText } = get();
    if (!searchText.trim()) {
      set({ matchingIds: [], matchScores: [] });
      return;
    }

    set({ isLoading: true });
    try {
      const searchPostDescriptions = httpsCallable(functions, 'searchPostDescriptions');
      const result = await searchPostDescriptions({ query: searchText });
      const { postIds } = result.data as { postIds: string[] };
      set({ matchingIds: postIds, matchScores: [] });
    } catch (error) {
      console.error('Text search failed:', error);
      set({ matchingIds: [], matchScores: [] });
    } finally {
      set({ isLoading: false });
    }
  },
  handlePhotoSearch: async (base64Image: string) => {
    set({ searchText: '', isLoading: true });
    
    try {
      const photoToIngredients = httpsCallable(functions, 'photoToIngredients');
      const result = await photoToIngredients({ photo: base64Image });
      const { ingredients } = result.data as { ingredients: string[] };
      set({ 
        ingredients,
        isLoading: false
      });
    } catch (error) {
      console.error('Photo to ingredients failed:', error);
      set({ 
        ingredients: null,
        isLoading: false
      });
    }
  },
  handleIngredientsSearch: async () => {
    let { ingredients } = get();
    ingredients = ingredients?.filter(i => i.trim() !== '') || [];
    if (ingredients.length === 0) {
      set({ matchingIds: [], matchScores: [], searchText: '' });
      return;
    }

    set({ isLoading: true, ingredients: null, searchText: '' });
    try {
      const ingredientsToPosts = httpsCallable(functions, 'ingredientsToPosts');
      const result = await ingredientsToPosts({ ingredients });
      const { postIds, matchScores } = result.data as { postIds: string[], matchScores: number[] };
      set({ matchingIds: postIds, matchScores });
    } catch (error) {
      console.error('Ingredients search failed:', error);
      set({ matchingIds: [], matchScores: [] });
    } finally {
      set({ isLoading: false });
    }
  },
}));