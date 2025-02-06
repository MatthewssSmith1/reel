import { StyleSheet, Pressable, Image, FlatList, View, Text } from 'react-native';
import { getScreenWidth } from '@/lib/utils';
import { useThumbnails } from '@/hooks/useThumbnails';
import { ThemedView } from '@/components/ThemedView';
import { Post } from '@/lib/firebase';

type ThumbnailGridProps = {
  posts: Post[];
  onPostPress: (post: Post) => void;
  onScroll?: () => void;
  isScrollable?: boolean;
};

export function ThumbnailGrid({ 
  posts, 
  onPostPress, 
  onScroll, 
  isScrollable = true,
}: ThumbnailGridProps) {
  const thumbnails = useThumbnails(posts);

  const renderThumbnail = (post: Post) => (
    <Pressable 
      key={post.id}
      style={styles.gridItem}
      onPress={() => onPostPress(post)}
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

  const EmptyComponent = () => (
    <ThemedView style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No posts found</Text>
    </ThemedView>
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
      numColumns={NUM_COLUMNS}
      onScroll={onScroll}
      ListEmptyComponent={EmptyComponent}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContainer}
    />
  );
}

const GRID_SPACING = 1;
const NUM_COLUMNS = 3;
const ITEM_WIDTH = (getScreenWidth() - GRID_SPACING * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

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
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.5,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    width: '100%',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  }
}); 