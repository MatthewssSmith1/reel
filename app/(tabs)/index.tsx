import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { VideoScrollView } from '@/components/VideoScrollView';
import { usePostStore } from '@/lib/postStore';

export default function FeedScreen() {
  const { posts, isLoading } = usePostStore();

  if (isLoading) return (
    <View style={[styles.container, styles.loading]}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );

  return (
    <View style={styles.container}>
      <VideoScrollView posts={posts} shouldPlay={true} />
    </View>
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