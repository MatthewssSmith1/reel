import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { useLocalSearchParams, router } from 'expo-router';
import { StyleSheet, Pressable, View } from 'react-native';
import { useCallback, useRef } from 'react';
import { getScreenHeight } from '@/lib/utils';
import { usePostStore } from '@/lib/postStore';
import { VideoView } from '@/components/VideoView';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';

export default function PostModal() {
  const { postId, userId } = useLocalSearchParams<{ postId: string; userId: string }>();
  const { posts } = usePostStore();
  const videoRefs = useRef<{ [key: string]: Video | null }>({});
  const scrollRef = useRef<ScrollView>(null);

  const userPosts = posts
    .filter(p => p.author_id === userId)
    .sort((a, b) => b.created_at.seconds - a.created_at.seconds);
  
  const initialIndex = userPosts.findIndex(p => p.id === postId);
  if (initialIndex === -1) return null;

  const onScroll = useCallback(({ nativeEvent }: any) => {
    const index = Math.round(nativeEvent.contentOffset.y / getScreenHeight());
    const post = userPosts[index];
    if (!post) return;

    Object.entries(videoRefs.current).forEach(([id, video]) => {
      if (!video) return;
      if (id === post.id) video.playAsync();
      else video.pauseAsync();
    });
  }, [userPosts]);

  return (
    <View style={styles.container}>
      <Pressable 
        onPress={() => router.back()} 
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </Pressable>
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
          {userPosts.map((post, index) => (
            <VideoView
              key={post.id}
              post={post}
              shouldPlay={index === initialIndex}
              videoRef={ref => (videoRefs.current[post.id] = ref)}
            />
          ))}
        </ScrollView>
      </GestureHandlerRootView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 1,
    padding: 8,
  },
}); 