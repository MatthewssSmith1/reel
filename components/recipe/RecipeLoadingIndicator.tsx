import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing, interpolate } from 'react-native-reanimated';
import { useEffect, useCallback } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BREATHE_ANIM_DURATION } from '@/components/recipe/RecipeListItem';
import { ThemedText as Text } from '@/components/ThemedText';
import { StyleSheet, View} from 'react-native';

export const RecipeLoadingIndicator = () => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: BREATHE_ANIM_DURATION,
          easing: Easing.inOut(Easing.ease)
        }),
        withTiming(0, {
          duration: BREATHE_ANIM_DURATION,
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
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: '#555' }}>Thinking...</Text>
          <MaterialCommunityIcons name="brain" size={24} color="#555" />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
});