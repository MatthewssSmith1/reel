import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing, interpolate } from 'react-native-reanimated';
import { StyleSheet, ScrollView, TextInput, View} from 'react-native';
import { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { RecipeList, ANIM_DURATION } from '@/components/RecipeList';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText as Text } from '@/components/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecipeStore } from '@/lib/recipeStore';
import { ChatModal } from '@/components/ChatModal';
import { Badge } from '@/components/Badge';

export default function RecipeModal() {
  const { currentRecipe, modifyRecipe, isLoading } = useRecipeStore();
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
      submitDisabled={instructionLength === 0}
      aboveTextInput={isLoading && <LoadingIndicator />}
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

const LoadingIndicator = () => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: ANIM_DURATION,
          easing: Easing.inOut(Easing.ease)
        }),
        withTiming(0, {
          duration: ANIM_DURATION,
          easing: Easing.inOut(Easing.ease)
        })
      ),
      -1,
      false
    );

    return () => {
      progress.value = 0;
    };
  }, []);

  const createAnimatedStyle = useCallback(() =>
    useAnimatedStyle(() => ({
      opacity: interpolate(
        progress.value,
        [0, 0.5, 1],
        [1, 0.25, 1]
      )
    })), []);

  const animatedStyle = createAnimatedStyle();

  return (
    <View style={styles.loadingIndicator}>
      <Animated.View style={animatedStyle}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.loadingText}>Thinking...</Text>
          <MaterialCommunityIcons name="brain" size={24} color="#555" />
        </View>
      </Animated.View>
    </View>
  );
};

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
  loadingIndicator: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  loadingText: {
    color: '#555',
  },
});