import Animated, { useAnimatedStyle, useSharedValue, withTiming, withDelay, Easing, interpolateColor } from 'react-native-reanimated';
import { useCallback, useEffect } from 'react';
import { useRecipeStore } from '@/lib/recipeStore';
import { Change } from 'diff';

const VISIBLE_DURATION = 1500;
const FADE_DURATION = 500;

export const ChangeText = ({ change, index }: { change: Change; index: number; }) => {
  const { flashTimestamp } = useRecipeStore();
  const highlightProgress = useSharedValue(change.added ? 1 : 0);

  const flashAnimation = useCallback(() => {
    if (!change.added) return;
    
    highlightProgress.value = 1;
    highlightProgress.value = withDelay(
      VISIBLE_DURATION, 
      withTiming(0, {
        duration: FADE_DURATION,
        easing: Easing.inOut(Easing.ease)
      })
    );
  }, []);

  useEffect(() => {
    flashAnimation();
  }, [flashAnimation, flashTimestamp]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      highlightProgress.value,
      [0, 1],
      ['transparent', '#999']
    ),
    color: interpolateColor(
      highlightProgress.value,
      [0, 1],
      ['#fff', '#000']
    ),
  }));

  return (
    <Animated.Text key={index} style={[change.added && animatedStyle]}>
      {change.value}
    </Animated.Text>
  );
};
