import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useRecipeStore } from '@/lib/recipeStore';
import { Change } from 'diff';

const ANIM_DURATION = 100;

export const ChangeText = ({ change }: { change: Change; }) => {
  const { showRemovedText, showDiff } = useRecipeStore();

  const animatedStyles = useAnimatedStyle(() => {
    const backgroundColor = (() => {
      if (!showDiff) return 'transparent';
      if (change.added) return showRemovedText ? '#4db344' : '#fff';
      if (change.removed) return '#eb4646';
      return 'transparent';
    })();

    const color = (() => {
      if (!showDiff) return '#fff';
      if (change.added && !showRemovedText) return '#000';
      return '#fff';
    })();

    return {
      backgroundColor: withTiming(backgroundColor, { duration: ANIM_DURATION }),
      color: withTiming(color, { duration: ANIM_DURATION }),
    };
  }, [showRemovedText, showDiff]);

  if (change.removed && !(showDiff && showRemovedText)) return null;

  return (
    <Animated.Text style={animatedStyles}>
      {change.value}
    </Animated.Text>
  );
};
