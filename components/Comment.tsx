import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { formatCount, formatTimestamp } from '@/lib/utils';
import { Comment as CommentType } from '@/lib/firebase';
import { useOptimisticLikes } from '@/hooks/useOptimisticLikes';
import { useUserStore } from '@/lib/userStore'
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';

export function Comment({ comment }: { comment: CommentType }) {
  const user = useUserStore(state => state.users[comment.user_id])
  const { liked, optimisticCount, toggleLike } = useOptimisticLikes(comment.id, comment.likes_count, 'comment');

  if (!user) return null

  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: user.avatar_url }} 
        style={styles.avatar}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={styles.username}>{user.username}</ThemedText>
          <ThemedText style={styles.timestamp}>{formatTimestamp(comment.created_at)}</ThemedText>
        </View>
        <ThemedText style={styles.text}>{comment.text}</ThemedText>
      </View>
      <TouchableOpacity style={styles.likeContainer} onPress={toggleLike}>
        <Ionicons 
          name={liked ? "heart" : "heart-outline"} 
          size={12} 
          color={liked ? '#FF2D55' : '#999'} 
        />
        <ThemedText style={[styles.likes, liked && styles.likedText]}>
          {formatCount(optimisticCount)}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    marginTop: 6,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  text: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 18,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 2,
    paddingRight: 10,
  },
  likes: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  likedText: {
    color: '#FF2D55',
  },
}); 