import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { formatCount, formatTimestamp } from '@/lib/utils';
import { useOptimisticLikes } from '@/hooks/useOptimisticLikes';
import { useCommentStore } from '@/lib/commentStore';
import { useUserStore } from '@/lib/userStore'
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Comment } from '@/lib/firebase';

export function CommentView({ comment, level = 0 }: { comment: Comment; level?: number }) {
  const { liked, optimisticCount, toggleLike } = useOptimisticLikes(comment.id, comment.likes_count, 'comment');
  const { users, authUser } = useUserStore()
  const { setReplyTarget, replyTarget } = useCommentStore()
  const [showReplies, setShowReplies] = useState(false);

  const user = users[comment.user_id]
  if (!user) return null

  const name = (user.uid === authUser?.uid ? 'You' : user.username)

  return (
    <>
      <View style={[
        styles.container, 
        comment === replyTarget && styles.highlightedContainer
      ]}>
        <Image 
          source={{ uri: user.avatar_url }} 
          style={styles.avatar}
        />
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText style={styles.username}>{name}</ThemedText>
          </View>
          <ThemedText style={styles.text}>{comment.text}</ThemedText>
          <View style={styles.footer}>
            <ThemedText style={styles.timestamp}>{formatTimestamp(comment.created_at)}</ThemedText>
            {level === 0 && (
              <TouchableOpacity style={styles.replyButton} onPress={() => setReplyTarget(comment)}>
                <ThemedText style={styles.replyText}>Reply</ThemedText>
              </TouchableOpacity>
            )}
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
      {comment.children && comment.children.length > 0 && (
        <>
          <TouchableOpacity 
            style={styles.toggleReplies}
            onPress={() => setShowReplies(!showReplies)}
          >
            <ThemedText style={styles.toggleText}>
              {showReplies 
                ? 'Hide replies' 
                : `Show ${comment.children.length} ${comment.children.length === 1 ? 'reply' : 'replies'}`
              }
            </ThemedText>
            <Ionicons 
              name={showReplies ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#999"
            />
          </TouchableOpacity>
          {showReplies && (
            <View style={styles.repliesContainer}>
              {comment.children.map(reply => (
                <CommentView key={reply.id} comment={reply} level={level + 1} />
              ))}
            </View>
          )}
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  highlightedContainer: {
    backgroundColor: 'rgba(135, 206, 250, 0.15)', // Light blue with low opacity
    // borderRadius: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    marginBottom: 12,
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
  repliesContainer: {
    marginLeft: 44,
  },
  toggleReplies: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    // paddingVertical: 4,
    marginLeft: 44,
    gap: 4,
  },
  toggleText: {
    fontSize: 13,
    color: '#999',
  },
}); 