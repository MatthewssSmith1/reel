import { FlatList, ListRenderItem, View } from 'react-native';
import { useCallback, useRef, useEffect } from 'react';
import { getScreenHeight } from '@/lib/utils';
import { useRecipeStore } from '@/lib/recipeStore';
import { VideoView } from '@/components/VideoView';
import { Video } from 'expo-av';
import { Post } from '@/lib/firebase';

type Props = {
  posts: Post[];
  shouldPlay: boolean;
  initialIndex?: number;
  hideProfileButton?: boolean;
};

export function VideoScrollView({ posts, shouldPlay, initialIndex = 0, hideProfileButton = false }: Props) {
  const videoRefs = useRef<{ [key: string]: Video | null }>({});
  const flatListRef = useRef<FlatList>(null);

  const height = getScreenHeight();

  const { currentRecipe, openRecipe } = useRecipeStore();

  useEffect(() => {
    if (!currentRecipe && posts.length > 0) openRecipe(posts[0].recipe_id);
  }, [currentRecipe, posts]);

  const onScroll = useCallback(({ nativeEvent }: any) => {
    const index = Math.round(nativeEvent.contentOffset.y / height);
    const post = posts[index];
    if (!post) return;

    openRecipe(post.recipe_id);

    Object.entries(videoRefs.current).forEach(([id, video]) => {
      if (!video) return;
      if (id === post.id) video.playAsync();
      else video.pauseAsync();
    });
  }, [posts]);

  const renderItem: ListRenderItem<Post> = useCallback(({ item: post, index }) => (
    <VideoView
      key={post.id}
      post={post}
      hideProfileButton={hideProfileButton}
      shouldPlay={shouldPlay && index === initialIndex}
      setVideoRef={ref => (videoRefs.current[post.id] = ref)}
    />
  ), [hideProfileButton, shouldPlay, initialIndex]);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: height,
    offset: height * index,
    index,
  }), []);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <FlatList
        ref={flatListRef}
        data={posts}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={height}  
        snapToAlignment="start"
        initialScrollIndex={initialIndex}
        windowSize={3}
        maxToRenderPerBatch={3}
        removeClippedSubviews={true}
      />
    </View>
  );
}
