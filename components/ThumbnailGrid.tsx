import { StyleSheet, Pressable, Image, FlatList, Dimensions, View } from 'react-native';
import { ref, getDownloadURL } from 'firebase/storage';
import { useState, useEffect } from 'react';
import { Post, storage } from '@/lib/firebase';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';

type ThumbnailGridProps = {
  posts: Post[];
  ListEmptyComponent?: React.ComponentType | React.ReactElement;
  onScroll?: () => void;
  isScrollable?: boolean;
};

export function ThumbnailGrid({ 
  posts, 
  ListEmptyComponent, 
  onScroll, 
  isScrollable = true 
}: ThumbnailGridProps) {
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadThumbnails = async () => {
      const thumbnailUrls: Record<string, string> = {};
      await Promise.all(
        posts.map(async (post) => {
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

    if (posts.length > 0) loadThumbnails();
  }, [posts]);

  const handlePostPress = (post: Post) => {
    router.push({
      pathname: '/(modals)/post',
      params: { postId: post.id, userId: post.author_id }
    });
  };

  const renderThumbnail = (post: Post) => (
    <Pressable 
      key={post.id}
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
  );

  if (!isScrollable) {
    return (
      <View style={styles.wrappedGrid}>
        {posts.map(renderThumbnail)}
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => renderThumbnail(item)}
      keyExtractor={post => post.id}
      numColumns={GRID_ITEMS_PER_ROW}
      onScroll={onScroll}
      ListEmptyComponent={ListEmptyComponent}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContainer}
    />
  );
}

const { width } = Dimensions.get('window');
const GRID_SPACING = 1;
const GRID_ITEMS_PER_ROW = 3;
const GRID_ITEM_WIDTH = (width - GRID_SPACING * (GRID_ITEMS_PER_ROW + 1)) / GRID_ITEMS_PER_ROW;

const styles = StyleSheet.create({
  wrappedGrid: {
    padding: GRID_SPACING,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  listContainer: {
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
}); 