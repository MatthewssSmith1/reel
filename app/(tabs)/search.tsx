import { StyleSheet, TextInput, Keyboard } from 'react-native';
import { useState, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThumbnailGrid } from '@/components/ThumbnailGrid';
import { usePostStore } from '@/lib/postStore';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import debounce from 'lodash/debounce';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { top } = useSafeAreaInsets();
  const { posts } = usePostStore();

  const filteredPosts = searchQuery.trim()
    ? posts.filter(post => 
        post.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts;

  const debouncedSearch = useCallback(
    debounce((text: string) => setSearchQuery(text), 300),
    []
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: top }]}>
      <ThemedView style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search posts"
          placeholderTextColor="#666"
          onChangeText={debouncedSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </ThemedView>

      <ThumbnailGrid 
        posts={filteredPosts} 
        onScroll={() => Keyboard.dismiss()} 
        onPostPress={(post) => {
          router.push({
            pathname: '/(modals)/post',
            params: { 
              postId: post.id, 
              userId: post.author_id,
              type: 'all'
            }
          });
        }} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 12,
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});
