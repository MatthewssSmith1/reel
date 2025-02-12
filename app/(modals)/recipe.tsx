import { StyleSheet, ScrollView, TextInput, View } from 'react-native';
import { useRef, useState, useMemo } from 'react';
import { RecipeLoadingIndicator } from '@/components/recipe/RecipeLoadingIndicator';
import { ThemedText as Text } from '@/components/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RecipeActionMenu } from '@/components/recipe/RecipeActionMenu';
import { useRecipeStore } from '@/lib/recipeStore';
import { RecipeList } from '@/components/recipe/RecipeList';
import { ChatModal } from '@/components/ChatModal';
import { Change } from 'diff';
import { Badge } from '@/components/recipe/Badge';

export default function RecipeModal() {
  const { currentRecipe, modifyRecipe, isLoading, diff, resetRecipe } = useRecipeStore();
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

  const sections = [
    { 
      items: currentRecipe.ingredients,
      title: "Ingredients",
      icon: "leaf" as const
    },
    { 
      items: currentRecipe.steps,
      title: "Steps",
      icon: "document-text" as const,
      ordered: true
    },
    { 
      items: currentRecipe.equipment,
      title: "Equipment",
      icon: "cube" as const
    }
  ]

  const changes = diff || sections.map(section => convertToChangeArray(section.items))

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
      <RecipeActionMenu />

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
            {currentRecipe.tags.map((tag, index) => <Badge key={index} text={tag} bgColor="#333" color="#fff" />)}
          </View>
        </View>

        {sections.map((section, i) => (
          <RecipeList
            key={section.title}
            title={section.title}
            icon={section.icon}
            items={changes[i]}
            ordered={section.ordered}
            animOffset={sections.slice(0, i).reduce((sum, s) => sum + s.items.length, 0)}
          />
        ))}
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