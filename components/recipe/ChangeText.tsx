import Animated, { useAnimatedStyle, useSharedValue, withTiming, withDelay, Easing, interpolateColor } from 'react-native-reanimated';
import { useEffect } from 'react';
import { Change } from 'diff';

export const ChangeText = ({ change, index }: { change: Change; index: number; }) => {
  const highlightProgress = useSharedValue(change.added ? 1 : 0);

  useEffect(() => {
    if (change.added) {
      highlightProgress.value = 1;
      highlightProgress.value = withDelay(
        1000, 
        withTiming(0, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease)
        })
      );
    }
  }, []);

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
