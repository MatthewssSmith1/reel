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

const SECTIONS = ['ingredients', 'steps', 'equipment'] as const
const SECTION_ICONS = ['leaf', 'document-text', 'cube'] as const

export default function RecipeModal() {
  const { currentRecipe, modifyRecipe, isLoading, diff, showRemovedText, showDiff } = useRecipeStore();
  const [instruction, setInstruction] = useState('');
  const { bottom } = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const instructionLength = useMemo(() => instruction.trim().length, [instruction]);

  const onSubmit = async () => {
    if (!currentRecipe || instructionLength === 0) return;
    setInstruction('');
    modifyRecipe(instruction.trim());
  };

  const sectionChanges = useMemo(() => {
    if (!currentRecipe) return [];

    function convertToChangeArray(items: string[]): Change[][] {
      return items.map(item => [{
        added: false,
        removed: false,
        count: 1,
        value: item
      }]);
    }

    const sectionChanges = diff || SECTIONS.map(section => convertToChangeArray(currentRecipe[section]))

    if (showDiff && showRemovedText) return sectionChanges;
    
    return sectionChanges.map(itemList => 
      itemList.filter(item => item.some(change => !change.removed))
    );
  }, [diff, showRemovedText, currentRecipe, showDiff]);

  if (!currentRecipe) return (
    <View style={styles.container}>
      <Text>Recipe not found</Text>
    </View>
  );

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

        {SECTIONS.map((section, idx) => (
          <RecipeList
            key={idx}
            title={section}
            icon={SECTION_ICONS[idx]}
            items={sectionChanges[idx]}
            ordered={section === 'steps'}
            animOffset={sectionChanges.slice(0, idx).reduce((sum, s) => sum + s.length, 0)}
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