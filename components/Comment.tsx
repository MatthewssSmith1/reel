import { StyleSheet, View, Image } from 'react-native';
import { Comment as CommentType } from '@/lib/firebase';
import { useUserStore } from '@/lib/userStore'
import { formatCount } from '@/lib/utils';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';

export function Comment({ comment }: { comment: CommentType }) {
  const user = useUserStore(state => state.users[comment.user_id])

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
          <ThemedText style={styles.timestamp}>2h</ThemedText>
        </View>
        <ThemedText style={styles.text}>{comment.text}</ThemedText>
      </View>
      <View style={styles.likeContainer}>
        <IconSymbol name="heart" size={12} color="#999" />
        <ThemedText style={styles.likes}>{formatCount(comment.likes_count)}</ThemedText>
      </View>
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
    fontWeight: '600',
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  text: {
    fontSize: 14,
    color: '#fff',
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
}); 