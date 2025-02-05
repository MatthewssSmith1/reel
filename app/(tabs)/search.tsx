import { StyleSheet, TextInput, Text, Keyboard } from 'react-native';
import { useState, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostStore } from '@/lib/postStore';
import { ThemedView } from '@/components/ThemedView';
import { ThumbnailGrid } from '@/components/ThumbnailGrid';
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

  const ListEmptyComponent = useCallback(() => (
    <ThemedView style={styles.noResults}>
      <Text style={{ color: 'white' }}>{!searchQuery.trim() ? 'Enter a search term' : 'No results found'}</Text>
    </ThemedView>
  ), [searchQuery]);

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
        ListEmptyComponent={ListEmptyComponent}
      />
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
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    width: '100%',
  }
});
