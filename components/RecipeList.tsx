import { StyleSheet, View, Animated } from 'react-native';
import { ThemedText as Text } from '@/components/ThemedText';
import { useEffect, useRef } from 'react';
import { useRecipeStore } from '@/lib/recipeStore';
import { Ionicons } from '@expo/vector-icons';

const ANIM_DURATION = 750;
const ANIM_DELAY = 75;

type Props = {
  title: string;
  items: string[];
  icon: React.ComponentProps<typeof Ionicons>['name'];
  ordered?: boolean;
  animOffset?: number;
}

export const RecipeList = ({ title, items, icon, ordered = false, animOffset = 0 }: Props) => {
  const { isLoading } = useRecipeStore();
  const animRefs = useRef<Animated.Value[]>([]);

  useEffect(() => {
    animRefs.current = items.map(() => new Animated.Value(0));
  }, [items.length]);

  useEffect(() => {
    if (!isLoading) {
      animRefs.current.forEach(anim => {
        anim.stopAnimation();
        anim.setValue(0);
      });

      return () => {};
    }

    const animations = animRefs.current.map((anim, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: ANIM_DURATION,
            delay: (index + animOffset) * ANIM_DELAY,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: ANIM_DURATION,
            useNativeDriver: true,
          }),
        ])
      )
    );

    Animated.parallel(animations).start();

    return () => {
      animations.forEach(anim => anim.stop());
      animRefs.current.forEach(anim => anim.setValue(0));
    };
  }, [isLoading, animOffset]);

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
            pulseAnim={animRefs.current[index]} 
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
  pulseAnim: Animated.Value;
}

const Item = ({ item, index, ordered, pulseAnim }: ItemProps) => {
  const opacity = pulseAnim ? pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  }) : 0;

  return (
    <View style={styles.item}>
      <Animated.View 
        style={[
          styles.itemBackground,
          { opacity }
        ]} 
      />
      <Text style={ordered ? styles.orderedPrefix : styles.unorderedPrefix}>
        {ordered ? `${index + 1}.` : '•'}
      </Text>
      <Text>{item}</Text>
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
  itemBackground: {
    position: 'absolute',
    top: -4,
    left: -8,
    right: 8,
    bottom: -4,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  orderedPrefix: {
    color: '#777',
    fontWeight: 'bold',
    minWidth: 15,
  },
  unorderedPrefix: {
    color: '#777',
    fontWeight: 'bold',
    marginRight: 7,
    transform: [{ scale: 1.5 }],
  },
});