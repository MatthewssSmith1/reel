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
        </View>
        <ThemedText style={styles.text}>{comment.text}</ThemedText>
        <View style={styles.footer}>
          <ThemedText style={styles.timestamp}>{formatTimestamp(comment.created_at)}</ThemedText>
          <TouchableOpacity 
            style={styles.replyButton}
            onPress={() => console.log('Reply to comment:', comment.id)}
          >
            <ThemedText style={styles.replyText}>Reply</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.likeContainer} onPress={toggleLike}>
        <Ionicons 
          name={liked ? "heart" : "heart-outline"} 
          size={16} 
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    marginBottom: 8,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    gap: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  username: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  text: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 18,
  },
  likeContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 2,
    paddingRight: 8,
  },
  likes: {
    fontSize: 12,
    color: '#999',
  },
  likedText: {
    color: '#FF2D55',
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replyText: {
    fontSize: 12,
    color: '#666',
  },
}); 