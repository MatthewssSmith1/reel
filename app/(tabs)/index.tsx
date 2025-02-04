import { StyleSheet, View, FlatList, ActivityIndicator } from 'react-native';
import { useCallback, useRef, useEffect } from 'react';
import { usePostStore } from '@/lib/postStore';
import { VideoView } from '@/components/VideoView';
import { Video } from 'expo-av';
import { Post } from '@/lib/firebase';

const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

export default function FeedScreen() {
  const videoRefs = useRef<{ [key: string]: Video | null }>({});
  const { posts, isLoading, loadPosts } = usePostStore();
  
  useEffect(() => {
    if (!posts.length) loadPosts();
  }, [posts.length]);

  const onViewableItemsChanged = useCallback(({ changed }: { changed: any[] }) => {
    changed.forEach(item => {
      const video = videoRefs.current[item.item.id];
      if (!video) return;
      
      if (item.isViewable) video.playAsync();
      else video.pauseAsync();
    });
  }, []);

  const renderVideo = useCallback(({ item }: { item: Post }) => (
    <VideoView
      post={item}
      videoRef={ref => (videoRefs.current[item.id] = ref)}
    />
  ), []);

  if (isLoading) return (
    <View style={[styles.container, styles.loading]}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderVideo}
        keyExtractor={item => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loading: {
    flex: 1,
    backgroundColor: '#000',
  },
}); 