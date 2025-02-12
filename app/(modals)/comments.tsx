import { StyleSheet, TouchableOpacity, View, FlatList, Keyboard, ActivityIndicator, TextInput } from 'react-native';
import { ChatModal, styles as modalStyles, ICON_SIZE } from '@/components/ChatModal';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCommentStore } from '@/lib/commentStore';
import { usePostStore } from '@/lib/postStore';
import { CommentView } from '@/components/CommentView';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

export default function CommentsModal() {
  const { comments, isLoading, submitComment, loadComments, replyTarget, setReplyTarget } = useCommentStore();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { bottom } = useSafeAreaInsets();
  const { posts } = usePostStore();
  const inputRef = useRef<TextInput>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadComments(postId);
  }, [postId]);

  useEffect(() => {
    setComment('');
    if (replyTarget) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [replyTarget]);

  const onSubmit = async () => {
    if (!comment.trim()) return;
    try {
      await submitComment(postId, comment.trim());
      setComment('');
      setReplyTarget(null);
    } catch (error) {
      console.error('Failed to submit comment:', error);
    }
  };

  const post = posts.find(p => p.id === postId);
  if (!post) return null;

  const replyButton = replyTarget && (
    <TouchableOpacity style={modalStyles.button} onPress={() => setReplyTarget(null)}>
      <Ionicons name="chevron-back" color="white" size={ICON_SIZE} />
    </TouchableOpacity>
  );

  return (
    <ChatModal
      ref={inputRef}
      value={comment}
      onChangeText={setComment}
      onSubmit={onSubmit}
      leftButton={replyButton}
      placeholder={replyTarget ? "Write a reply..." : "Write a comment..."}
      iconName={replyTarget ? "arrow-redo" : "paper-plane"}
      paddingTop={36}
    >
      <ThemedText style={styles.title}>{post.comments_count} comments</ThemedText>
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={() => {
          setComment('');
          setReplyTarget(null);
          Keyboard.dismiss();
          router.back();
        }}
      >
        <Ionicons name="close" color="white" size={ICON_SIZE} />
      </TouchableOpacity>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <FlatList
          data={comments}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <CommentView comment={item} />
          )}
          style={styles.commentsList}
          contentContainerStyle={{ paddingTop: 0, paddingBottom: bottom + 60 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        />
      )}
    </ChatModal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: 1,
  },
  closeButton: {
    padding: 4,
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentsList: {
    flex: 1,
  },
}); 