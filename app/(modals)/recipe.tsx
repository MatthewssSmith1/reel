import { StyleSheet, ScrollView, TextInput, View, ActivityIndicator } from 'react-native';
import { useMemo, useRef, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText as Text } from '@/components/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecipeStore } from '@/lib/recipeStore';
import { httpsCallable } from 'firebase/functions';
import { usePostStore } from '@/lib/postStore';
import { RecipeList } from '@/components/RecipeList';
import { ChatModal } from '@/components/ChatModal';
import { functions } from '@/lib/firebase';
import { Ionicons } from '@expo/vector-icons'
import { Recipe } from '@/lib/firebase';


function usePostRecipe(postId: string) {
  const { posts } = usePostStore();
  const { recipes, addRecipe } = useRecipeStore();
  
  const recipe = useMemo(() => {
    const post = posts.find(p => p.id === postId);
    if (!post) return null;
    return recipes.find(r => r.parent_id === post.recipe_id)
        || recipes.find(r => r.id === post.recipe_id)
  }, [posts, postId, recipes]);

  return { recipe, addRecipe };
}

export default function RecipeModal() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { recipe, addRecipe } = usePostRecipe(postId);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const { bottom } = useSafeAreaInsets();
  const [instruction, setInstruction] = useState('');

  const onSubmit = async () => {
    if (!instruction || !recipe) return;
    
    setIsLoading(true);
    try {
      const modifyRecipeFn = httpsCallable(functions, 'modifyRecipe');
      const result = await modifyRecipeFn({
        recipeId: recipe.id,
        instruction: instruction.trim(),
      });

      const newRecipe = result.data as Recipe;
      addRecipe(newRecipe);
      setInstruction('');
    } catch (error) {
      console.error('Failed to modify recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text>Recipe not found</Text>
      </View>
    );
  }

  return (
    <ChatModal
      ref={inputRef}
      value={instruction}
      onChangeText={setInstruction}
      onSubmit={onSubmit}
      placeholder="Modify this recipe..."
      iconName="color-wand"
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: 'transparent' }]}
        contentContainerStyle={{ paddingBottom: bottom + 60 }}
      >
        <Text style={styles.title}>{recipe.title}</Text>
        <View style={[styles.section, { gap: 10 }]}>
          <View style={styles.badgeRow}>
            <Badge icon="time-outline" text={`Prep: ${recipe.prepTime}`} />
            <Badge icon="time-outline" text={`Cook: ${recipe.cookTime}`} />
            <Badge icon="people-outline" text={`Serves: ${recipe.servings}`} />
          </View>
          <View style={styles.badgeRow}>
            {recipe.tags.map((tag, index) => (
              <Badge key={index} text={tag} bgColor="#333" color="#fff" />
            ))}
          </View>
        </View>

        <RecipeList title="Ingredients" items={recipe.ingredients} icon="leaf" />
        <RecipeList title="Steps" items={recipe.steps} ordered icon="document-text" />
        <RecipeList title="Equipment" items={recipe.equipment} icon="cube" />
      </ScrollView>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </ChatModal>
  );
}

type BadgeProps = {
  text: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  color?: string;
  bgColor?: string;
}

function Badge({ text, icon, color, bgColor }: BadgeProps) {
  return (
    <View style={[styles.badge, bgColor ? { backgroundColor: bgColor } : undefined]}>
      {icon && <Ionicons name={icon} size={16} color={color ?? '#000'} />}
      <Text style={[styles.badgeText, color ? { color } : undefined]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    paddingTop: 8,
    marginBottom: 20,
    color: '#fff',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    color: '#000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});