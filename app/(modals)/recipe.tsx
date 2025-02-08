import { StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText as Text } from '@/components/ThemedText';
import { ThemedView as View } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { usePostStore } from '@/lib/postStore';
import { useMemo } from 'react';

export default function RecipeModal() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const backgroundColor = useThemeColor({}, 'background');
  const iconColor = useThemeColor({light: '#fff', dark: '#000'}, 'text');
  const posts = usePostStore(state => state.posts);
  
  const recipe = useMemo(() => {
    const post = posts.find(p => p.id === postId);
    return post?.recipe;
  }, [posts, postId]);

  if (!recipe) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text>Recipe not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <View style={styles.section}>
        <Text style={styles.title}>{recipe.title}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Ionicons name="time-outline" size={16} color={iconColor} />
            <Text style={styles.badgeText}>Prep: {recipe.prepTime}</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="time-outline" size={16} color={iconColor} />
            <Text style={styles.badgeText}>Cook: {recipe.cookTime}</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="people-outline" size={16} color={iconColor} />
            <Text style={styles.badgeText}>Serves: {recipe.servings}</Text>
          </View>
        </View>
        <View style={styles.badgeRow}>
          {recipe.tags.map((tag, index) => (
            <View style={[styles.badge, { backgroundColor: '#333' }]} key={index}>
              <Text style={[styles.badgeText, { color: '#fff' }]}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <List title="Ingredients" items={recipe.ingredients} />
      <List title="Equipment" items={recipe.equipment} />
      <List title="Steps" items={recipe.steps} ordered />

    </ScrollView>
  );
}

interface ListProps {
  title: string;
  items: string[];
  ordered?: boolean;
}

function List({ title, items, ordered = false }: ListProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.list}>
        {items.map((item, index) => (
          <View key={index} style={styles.item}>
            <Text style={ordered ? styles.orderedPrefix : styles.unorderedPrefix}>
              {ordered ? `${index + 1}.` : '•'}
            </Text>
            <Text>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    padding: 6,
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
    marginBottom: 12,
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#fff',
  },
  list: {
    gap: 14,
    width: '100%',
  },
  item: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    paddingRight: 35,
  },
  orderedPrefix: {
    color: '#777',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  unorderedPrefix: {
    color: '#777',
    fontWeight: 'bold',
    marginLeft: 4,
    transform: [{ scale: 1.5 }],
  },
});