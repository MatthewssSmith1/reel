import { StyleSheet, TextInput, Pressable, Image, Dimensions, Text, FlatList, Keyboard } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getScreenWidth } from '@/lib/utils';
import { usePostStore } from '@/lib/postStore';
import { ThemedView } from '@/components/ThemedView';
import { storage } from '@/lib/firebase';
import { router } from 'expo-router';
import debounce from 'lodash/debounce';
import { Post } from '@/lib/firebase';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { top } = useSafeAreaInsets();
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
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

  const loadThumbnails = async (postsToLoad: Post[]) => {
    const thumbnailUrls: Record<string, string> = {};
    await Promise.all(
      postsToLoad.map(async (post) => {
        try {
          const thumbnailRef = ref(storage, `thumbnails/${post.video_id}.jpg`);
          const url = await getDownloadURL(thumbnailRef);
          thumbnailUrls[post.id] = url;
        } catch (error) {
          console.error('Error loading thumbnail:', error);
        }
      })
    );
    setThumbnails(thumbnailUrls);
  };

  useEffect(() => {
    if (filteredPosts.length) loadThumbnails(filteredPosts);
  }, [filteredPosts]);

  const handlePostPress = (post: Post) => {
    router.push({
      pathname: '/(modals)/post',
      params: { postId: post.id, userId: post.author_id }
    });
  };

  const renderItem = useCallback(({ item: post }: { item: Post }) => (
    <Pressable 
      style={styles.gridItem}
      onPress={() => handlePostPress(post)}
    >
      {thumbnails[post.id] ? (
        <Image 
          source={{ uri: thumbnails[post.id] }}
          style={styles.thumbnail}
        />
      ) : (
        <ThemedView style={styles.placeholderVideo} />
      )}
    </Pressable>
  ), [thumbnails]);

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

      <FlatList
        data={filteredPosts}
        renderItem={renderItem}
        keyExtractor={post => post.id}
        numColumns={GRID_ITEMS_PER_ROW}
        onScroll={() => Keyboard.dismiss()}
        keyboardShouldPersistTaps="never"
        ListEmptyComponent={ListEmptyComponent}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContainer}
      />
    </ThemedView>
  );
}

const GRID_SPACING = 1;
const GRID_ITEMS_PER_ROW = 3;
const GRID_ITEM_WIDTH = (getScreenWidth() - GRID_SPACING * (GRID_ITEMS_PER_ROW + 1)) / GRID_ITEMS_PER_ROW;

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
  gridContainer: {
    flexGrow: 1,
    padding: GRID_SPACING,
  },
  row: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  gridItem: {
    width: GRID_ITEM_WIDTH,
    height: GRID_ITEM_WIDTH * 1.5,
    padding: GRID_SPACING,
  },
  thumbnail: {
    flex: 1,
    borderRadius: 4,
  },
  placeholderVideo: {
    flex: 1,
    borderRadius: 4,
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: GRID_ITEM_WIDTH * 2,
    width: '100%',
  }
});
