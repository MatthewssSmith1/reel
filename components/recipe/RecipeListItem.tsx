import Animated, { useAnimatedStyle, useSharedValue, withTiming, withRepeat, withSequence, withDelay, Easing, interpolate, interpolateColor } from 'react-native-reanimated';
import { useEffect, useCallback } from 'react';
import { ThemedText as Text } from '@/components/ThemedText';
import { StyleSheet, View } from 'react-native';
import { useRecipeStore } from '@/lib/recipeStore';
import { ChangeText } from '@/components/recipe/ChangeText';
import { Change } from 'diff';

export const BREATHE_ANIM_DURATION = 3000;
const BREATHE_ANIM_GAP = 100;

type Props = {
  item: Change[];
  index: number;
  ordered: boolean;
  animOffset: number;
}

export const RecipeListItem = ({ item, index, ordered, animOffset }: Props) => {
  const { isLoading } = useRecipeStore();
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    if (isLoading) {
      const startDelay = (index + animOffset) * BREATHE_ANIM_GAP;

      animatedProgress.value = withDelay(
        startDelay,
        withRepeat(
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
        )
      );
    } else {
      animatedProgress.value = withTiming(0, { duration: 150 });
    }

    return () => {
      animatedProgress.value = 0;
    };
  }, [isLoading, index, animOffset]);

  const KEYFRAMES = [0, 0.5, 1];

  const createBgAnimatedStyle = useCallback(() => useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedProgress.value,
      KEYFRAMES,
      [0, 0.15, 0]
    )
  })), []);

  const createPrefixAnimatedStyle = useCallback(() => useAnimatedStyle(() => ({
    transform: [{
      scale: interpolate(
        animatedProgress.value,
        KEYFRAMES,
        ordered ? [0.95, 1.05, 0.95] : [1.4, 1.75, 1.4]
      )
    }, {
      translateY: ordered ? 0 : -2
    }],
    color: interpolateColor(
      animatedProgress.value,
      KEYFRAMES,
      ['#555', '#ccc', '#555']
    )
  })), [ordered]);

  const bgAnimatedStyle = createBgAnimatedStyle();
  const prefixAnimatedStyle = createPrefixAnimatedStyle();

  return (
    <View style={styles.item}>
      <Animated.View
        style={[
          styles.itemBackground,
          bgAnimatedStyle
        ]}
      />
      <View style={[styles.prefixContainer, ordered && { paddingTop: 2}]}>
        <Animated.Text style={[styles.prefixText, !ordered && styles.unorderedPrefix, isLoading && prefixAnimatedStyle]}>
          {ordered ? `${index + 1}.` : '•'}
        </Animated.Text>
      </View>
      <Text style={styles.itemText}>
        {item.map((change, index) => <ChangeText key={index} change={change} />)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    gap: 14,
    width: '100%',
    paddingRight: 35,
    marginLeft: 6,
    position: 'relative',
  },
  itemText: {
    color: '#fff',
    flex: 1,
  },
  itemBackground: {
    position: 'absolute',
    top: -4,
    left: -10,
    right: 8,
    bottom: -4,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  prefixContainer: {
    width: 14,
    height: 21,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -3 }],
  },
  prefixText: {
    color: '#777',
    fontWeight: 'bold',
  },
  unorderedPrefix: {
    fontSize: 20,
    transform: [{ translateY: -1 }]
  }
});
