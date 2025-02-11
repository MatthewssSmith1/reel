import { StyleSheet, TextInput, Keyboard, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThumbnailGrid } from '@/components/ThumbnailGrid';
import { httpsCallable } from 'firebase/functions';
import { usePostStore } from '@/lib/postStore';
import { ThemedView } from '@/components/ThemedView';
import { functions } from '@/lib/firebase';
import { router } from 'expo-router';
import debounce from 'lodash/debounce';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [matchingIds, setMatchingIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { top } = useSafeAreaInsets();
  const { posts } = usePostStore();

  const searchPosts = httpsCallable(functions, 'searchPosts');

  const callSearch = async (query: string) => {
    if (!query.trim()) {
      setMatchingIds([]);
      return;
    }

    setIsLoading(true);
    try {
      const result = await searchPosts({ query });
      const { postIds } = result.data as { postIds: string[] };
      setMatchingIds(postIds);
    } catch (error) {
      console.error('Search failed:', error);
      setMatchingIds([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((text: string) => {
      setSearchQuery(text);
      callSearch(text);
    }, 300),
    []
  );

  const displayedPosts = searchQuery.trim()
    ? posts.filter(post => matchingIds.includes(post.id))
    : posts;

  const onPostPress = (post: any) => {
    router.push({
      pathname: '/(modals)/post',
      params: { 
        postId: post.id, 
        userId: post.author_id,
        type: 'all'
      }
    });
  };

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

      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#666" />
        </ThemedView>
      ) : (
        <ThumbnailGrid 
          posts={displayedPosts} 
          onScroll={() => Keyboard.dismiss()} 
          onPostPress={onPostPress} 
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
