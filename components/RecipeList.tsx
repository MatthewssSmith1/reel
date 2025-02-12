import Animated, { useAnimatedStyle, useSharedValue, withTiming, withRepeat, withSequence, withDelay, Easing, interpolate, interpolateColor } from 'react-native-reanimated';
import { useEffect, useCallback } from 'react';
import { ThemedText as Text } from '@/components/ThemedText';
import { StyleSheet, View } from 'react-native';
import { useRecipeStore } from '@/lib/recipeStore';
import { Ionicons } from '@expo/vector-icons';

export const ANIM_DURATION = 3000;
export const ANIM_DELAY = 100;

type Props = {
  title: string;
  items: string[];
  icon: React.ComponentProps<typeof Ionicons>['name'];
  ordered?: boolean;
  animOffset?: number;
}

export const RecipeList = ({ title, items, icon, ordered = false, animOffset = 0 }: Props) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={20} color="#fff" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.list}>
        {items.map((item, index) => (
          <Item
            key={index}
            item={item}
            index={index}
            ordered={ordered}
            animOffset={animOffset}
          />
        ))}
      </View>
    </View>
  );
};

type ItemProps = {
  item: string;
  index: number;
  ordered: boolean;
  animOffset: number;
}

const Item = ({ item, index, ordered, animOffset }: ItemProps) => {
  const { isLoading } = useRecipeStore();

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    if (isLoading) {
      const startDelay = (index + animOffset) * ANIM_DELAY;

      animatedProgress.value = withDelay(
        startDelay,
        withRepeat(
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
      [0, 0.05, 0]
    )
  })), []);

  const createPrefixAnimatedStyle = useCallback(() => useAnimatedStyle(() => ({
    transform: [{
      scale: interpolate(
        animatedProgress.value,
        KEYFRAMES,
        ordered ? [0.95, 1.05, 0.95] : [1.4, 1.75, 1.4]
      )
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
      <Text style={styles.itemText}>{item}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  list: {
    gap: 12,
    width: '100%',
  },
  item: {
    flexDirection: 'row',
    gap: 14,
    width: '100%',
    paddingRight: 35,
    marginLeft: 6,
    position: 'relative',
  },
  itemText: {
    paddingRight: 8,
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
    transform: [{ scale: 1.75 }]
  }
});