import { StyleSheet, Pressable, Image, FlatList, View, Text } from 'react-native';
import { getScreenWidth } from '@/lib/utils';
import { useThumbnails } from '@/hooks/useThumbnails';
import { ThemedView } from '@/components/ThemedView';
import { Post } from '@/lib/firebase';
import { interpolateColor } from 'react-native-reanimated';

type ThumbnailGridProps = {
  posts: Post[];
  onPostPress: (post: Post) => void;
  onScroll?: () => void;
  isScrollable?: boolean;
  scores?: number[];
};

export function ThumbnailGrid({ 
  posts, 
  onPostPress, 
  onScroll, 
  isScrollable = true,
  scores,
}: ThumbnailGridProps) {
  const thumbnails = useThumbnails(posts);

  const getInterpolatedColor = (score: number) => {
    return interpolateColor(
      score,
      [0, 0.5, 1],
      ['#FF0000', '#FFA500', '#00FF00']
    );
  };

  const renderThumbnail = (post: Post, index: number) => (
    <Pressable 
      key={post.id}
      style={styles.gridItem}
      onPress={() => onPostPress(post)}
    >
      <View style={styles.thumbnailContainer}>
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
        {thumbnails[post.id] && (
          <Image 
            source={{ uri: thumbnails[post.id] }}
            style={[styles.thumbnail, styles.thumbnailImage]}
          />
        )}
        {scores && scores[index] !== undefined && (
          <View style={[
            styles.scoreBar,
            { 
              width: `${scores[index] * 100}%`,
              backgroundColor: getInterpolatedColor(scores[index]),
              borderBottomRightRadius: scores[index] > 0.99 ? 4 : 0,
              borderBottomLeftRadius: 4,
            }
          ]} />
        )}
      </View>
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
        {posts.map((post, index) => renderThumbnail(post, index))}
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      renderItem={({ item, index }) => renderThumbnail(item, index)}
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
  thumbnailContainer: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.5,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  thumbnailPlaceholder: {
    position: 'absolute',
    backgroundColor: '#333',
  },
  thumbnailImage: {
    position: 'absolute',
  },
  scoreBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 4,
  },
  placeholderVideo: {
    width: '100%',
    height: '100%',
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