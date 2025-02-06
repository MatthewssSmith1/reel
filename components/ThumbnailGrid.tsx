import { StyleSheet, Pressable, Image, FlatList, Dimensions, View } from 'react-native';
import { useThumbnails } from '@/hooks/useThumbnails';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { Post } from '@/lib/firebase';

type ThumbnailGridProps = {
  posts: Post[];
  ListEmptyComponent?: React.ComponentType | React.ReactElement;
  onScroll?: () => void;
  isScrollable?: boolean;
  onPostPress?: (post: Post) => void;
};

export function ThumbnailGrid({ 
  posts, 
  ListEmptyComponent, 
  onScroll, 
  isScrollable = true,
  onPostPress 
}: ThumbnailGridProps) {
  const thumbnails = useThumbnails(posts);

  const handlePostPress = (post: Post) => {
    if (onPostPress) {
      onPostPress(post);
    } else {
      router.push({
        pathname: '/(modals)/post',
        params: { 
          postId: post.id, 
          userId: post.author_id,
          type: 'posts'
        }
      });
    }
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