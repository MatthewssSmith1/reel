import { StyleSheet, ScrollView, TextInput, View } from 'react-native';
import { ThemedText as Text } from '@/components/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRef, useState } from 'react';
import { useRecipeStore } from '@/lib/recipeStore';
import { RecipeList } from '@/components/RecipeList';
import { ChatModal } from '@/components/ChatModal';
import { Badge } from '@/components/Badge';

export default function RecipeModal() {
  const { currentRecipe, modifyRecipe, isLoading } = useRecipeStore();
  const [instruction, setInstruction] = useState('');
  const { bottom } = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const onSubmit = async () => {
    if (!instruction || !currentRecipe) return;
    modifyRecipe(instruction.trim());
    setInstruction('');
  };

  if (!currentRecipe) return (
    <View style={styles.container}>
      <Text>Recipe not found</Text>
    </View>
  );

  const ingredientCount = currentRecipe.ingredients.length;
  const stepCount = currentRecipe.steps.length;

  return (
    <ChatModal
      ref={inputRef}
      value={instruction}
      onChangeText={setInstruction}
      onSubmit={onSubmit}
      placeholder="Modify this recipe..."
      iconName="color-wand"
      disabled={isLoading}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: 'transparent' }]}
        contentContainerStyle={{ paddingBottom: bottom + 60 }}
      >
        <Text style={styles.title}>{currentRecipe.title}</Text>
        <View style={[styles.section, { gap: 10 }]}>
          <View style={styles.badgeRow}>
            <Badge icon="time-outline" text={`Prep: ${currentRecipe.prepTime}`} />
            <Badge icon="time-outline" text={`Cook: ${currentRecipe.cookTime}`} />
            <Badge icon="people-outline" text={`Serves: ${currentRecipe.servings}`} />
          </View>
          <View style={styles.badgeRow}>
            {currentRecipe.tags.map((tag, index) => (
              <Badge key={index} text={tag} bgColor="#333" color="#fff" />
            ))}
          </View>
        </View>

        <RecipeList title="Ingredients" icon="leaf" items={currentRecipe.ingredients} />
        <RecipeList title="Steps" icon="document-text" items={currentRecipe.steps} animOffset={ingredientCount} ordered />
        <RecipeList title="Equipment" icon="cube" items={currentRecipe.equipment} animOffset={ingredientCount + stepCount} />
      </ScrollView>
    </ChatModal>
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
});