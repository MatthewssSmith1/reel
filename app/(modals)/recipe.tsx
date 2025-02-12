import { StyleSheet, ScrollView, TextInput, View} from 'react-native';
import { useRef, useState, useMemo } from 'react';
import { RecipeLoadingIndicator } from '@/components/recipe/RecipeLoadingIndicator';
import { ThemedText as Text } from '@/components/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecipeStore } from '@/lib/recipeStore';
import { RecipeList } from '@/components/recipe/RecipeList';
import { ChatModal } from '@/components/ChatModal';
import { Change } from 'diff';
import { Badge } from '@/components/recipe/Badge';

export default function RecipeModal() {
  const { currentRecipe, modifyRecipe, isLoading, diff } = useRecipeStore();
  const [instruction, setInstruction] = useState('');
  const { bottom } = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const instructionLength = useMemo(() => instruction.trim().length, [instruction]);

  const onSubmit = async () => {
    if (!currentRecipe || instructionLength === 0) return;
    modifyRecipe(instruction.trim());
    setInstruction('');
  };

  if (!currentRecipe) return (
    <View style={styles.container}>
      <Text>Recipe not found</Text>
    </View>
  );

  const convertToChangeArray = (items: string[]): Change[][] => items.map(item => [{
    added: false,
    removed: false,
    count: 1,
    value: item
  }])

  const ingredientCount = currentRecipe.ingredients.length;
  const stepCount = currentRecipe.steps.length;
  const equipmentCount = currentRecipe.equipment.length;

  const ingredientChanges = diff 
    ? diff.slice(0, ingredientCount)
    : convertToChangeArray(currentRecipe.ingredients);

  const stepChanges = diff
    ? diff.slice(ingredientCount, ingredientCount + stepCount)
    : convertToChangeArray(currentRecipe.steps);

  const equipmentChanges = diff
    ? diff.slice(ingredientCount + stepCount, ingredientCount + stepCount + equipmentCount)
    : convertToChangeArray(currentRecipe.equipment);

  return (
    <ChatModal
      ref={inputRef}
      value={instruction}
      onChangeText={setInstruction}
      onSubmit={onSubmit}
      placeholder="Modify this recipe..."
      iconName="color-wand"
      disabled={isLoading}
      submitDisabled={instructionLength === 0}
      aboveTextInput={isLoading && <RecipeLoadingIndicator />}
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

        <RecipeList title="Ingredients" icon="leaf" items={ingredientChanges} />
        <RecipeList title="Steps" icon="document-text" items={stepChanges} animOffset={ingredientCount} ordered />
        <RecipeList title="Equipment" icon="cube" items={equipmentChanges} animOffset={ingredientCount + stepCount} />
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