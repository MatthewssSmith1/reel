import { StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useCallback, useRef } from 'react';
import { getScreenHeight } from '@/lib/utils';
import { VideoView } from '@/components/VideoView';
import { Video } from 'expo-av';
import { Post } from '@/lib/firebase';

interface VideoScrollViewProps {
  posts: Post[];
  shouldPlay: boolean;
  initialIndex?: number;
  hideProfileButton?: boolean;
}

export function VideoScrollView({ 
  posts, 
  shouldPlay, 
  initialIndex = 0,
  hideProfileButton = false 
}: VideoScrollViewProps) {
  const videoRefs = useRef<{ [key: string]: Video | null }>({});
  const flatListRef = useRef<FlatList>(null);

  const height = getScreenHeight();

  const onScroll = useCallback(({ nativeEvent }: any) => {
    const index = Math.round(nativeEvent.contentOffset.y / height);
    const post = posts[index];
    if (!post) return;

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
    <GestureHandlerRootView style={styles.container}>
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
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
