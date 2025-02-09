import { useLocalSearchParams, router } from 'expo-router';
import { StyleSheet, Pressable, View } from 'react-native';
import { usePostLikeStore } from '@/lib/likeStore';
import { VideoScrollView } from '@/components/VideoScrollView';
import { usePostStore } from '@/lib/postStore';
import { Ionicons } from '@expo/vector-icons';

export default function PostModal() {
  const { postId, userId, type } = useLocalSearchParams<{ 
    postId: string; 
    userId: string;
    type: 'all' | 'author' | 'likes';
  }>();
  const { posts } = usePostStore();
  const { likedItems } = usePostLikeStore();

  let displayedPosts = posts;
  if (type === 'likes') displayedPosts = posts.filter(p => likedItems.get(p.id));
  if (type === 'author') displayedPosts = posts.filter(p => p.author_id === userId);
  
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
        hideProfileButton={type !== 'all'}
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