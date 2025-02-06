import { useLocalSearchParams, router } from 'expo-router';
import { StyleSheet, Pressable, View } from 'react-native';
import { usePostStore } from '@/lib/postStore';
import { Ionicons } from '@expo/vector-icons';
import { usePostLikeStore } from '@/lib/likeStore';
import { VideoScrollView } from '@/components/VideoScrollView';

export default function PostModal() {
  const { postId, userId, type } = useLocalSearchParams<{ 
    postId: string; 
    userId: string;
    type: 'posts' | 'liked';
  }>();
  const { posts } = usePostStore();
  const { likedItems } = usePostLikeStore();

  const displayedPosts = type === 'liked'
    ? posts.filter(p => likedItems.get(p.id))
    : posts.filter(p => p.author_id === userId);
  
  const sortedPosts = displayedPosts.sort((a, b) => b.created_at.seconds - a.created_at.seconds);
  
  const initialIndex = sortedPosts.findIndex(p => p.id === postId);
  if (initialIndex === -1) return null;

  return (
    <View style={styles.container}>
      <Pressable 
        onPress={() => router.back()} 
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </Pressable>
      <VideoScrollView
        posts={sortedPosts}
        shouldPlay={true}
        initialIndex={initialIndex}
        hideProfileButton
      />
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
    top: 16,
    left: 16,
    zIndex: 1,
    padding: 8,
  },
});