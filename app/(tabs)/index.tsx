import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { useCallback, useRef } from 'react';
import { useCommentStore } from '@/lib/commentStore';
import { getScreenHeight } from '@/lib/utils';
import { CommentsSheet } from '@/components/CommentsSheet';
import { usePostStore } from '@/lib/postStore';
import { VideoView } from '@/components/VideoView';
import { Video } from 'expo-av';

export default function FeedScreen() {
  const { posts, isLoading, setCurrentPost } = usePostStore();
  const { toggleMessages, loadComments } = useCommentStore();
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
    
    setCurrentPost(post);

    toggleMessages(false);
    loadComments(post.id);
  }, [posts, setCurrentPost]);

  if (isLoading) return (
    <View style={[styles.container, styles.loading]}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );

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
      >
        {posts.map((post, index) => (
          <VideoView
            key={post.id}
            post={post}
            shouldPlay={index === 0}
            videoRef={ref => (videoRefs.current[post.id] = ref)}
          />
        ))}
      </ScrollView>
      <CommentsSheet />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 