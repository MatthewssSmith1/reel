import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { useCallback, useRef } from 'react';
import { getScreenHeight } from '@/lib/utils';
import { StyleSheet } from 'react-native';
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
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = useCallback(({ nativeEvent }: any) => {
    const index = Math.round(nativeEvent.contentOffset.y / getScreenHeight());
    const post = posts[index];
    if (!post) return;

    Object.entries(videoRefs.current).forEach(([id, video]) => {
      if (!video) return;
      if (id === post.id) video.playAsync();
      else video.pauseAsync();
    });
  }, [posts]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView
        ref={scrollRef}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={getScreenHeight()}
        snapToAlignment="start"
        contentOffset={{ x: 0, y: initialIndex * getScreenHeight() }}
      >
        {posts.map((post, index) => (
          <VideoView
            key={post.id}
            post={post}
            hideProfileButton={hideProfileButton}
            shouldPlay={shouldPlay && index === initialIndex}
            videoRef={ref => (videoRefs.current[post.id] = ref)}
          />
        ))}
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
