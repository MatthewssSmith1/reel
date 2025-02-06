import { StyleSheet, TouchableOpacity, TextInput, View, FlatList, Keyboard, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { useKeyboardVisibility } from '@/hooks/useKeyboardVisibility';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCommentStore } from '@/lib/commentStore';
import { usePostStore } from '@/lib/postStore';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { CommentView } from '@/components/CommentView';

export default function CommentsModal() {
  const { comments, isLoading, submitComment, loadComments, replyTarget, setReplyTarget } = useCommentStore();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const isKeyboardVisible = useKeyboardVisibility();
  const { bottom } = useSafeAreaInsets();
  const { posts } = usePostStore();

  const [comment, setComment] = useState('');
  const inputRef = useRef<TextInput>(null);

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
    await submitComment(postId, comment.trim());
    setComment('');
    setReplyTarget(null);
  };

  const post = posts.find(p => p.id === postId);
  if (!post) return null;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
      style={styles.container}
    >
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.sheet}>
        <ThemedText style={styles.title}>{comments?.length ?? 0} comments</ThemedText>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => {
            setComment('');
            setReplyTarget(null);
            Keyboard.dismiss();
            router.back();
          }}
        >
          <Ionicons name="close" color="white" size={18} />
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
        <View style={[styles.inputContainer, { paddingBottom: Math.max(bottom, 10) }]}>
          {replyTarget && (
            <TouchableOpacity style={styles.sendButton} onPress={() => setReplyTarget(null)}>
              <Ionicons name="chevron-back" color="white" size={18} />
            </TouchableOpacity>
          )}
          {!replyTarget && (
            <TouchableOpacity 
              style={[styles.sendButton, !isKeyboardVisible && { opacity: 0.5 }]} 
              onPress={() => Keyboard.dismiss()}
              disabled={!isKeyboardVisible}
            >
              <Ionicons name="chevron-down" color="white" size={18} />
            </TouchableOpacity>
          )}
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={replyTarget ? "Write a reply..." : "Write a comment..."}
            placeholderTextColor="#666"
            value={comment}
            onChangeText={setComment}
            onSubmitEditing={onSubmit}
            multiline
          />
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={onSubmit}
          >
            <Ionicons name={replyTarget ? "arrow-redo" : "paper-plane"} color="white" size={18} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  sheet: {
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(27, 27, 27, 0.9)',
    paddingTop: 36,
  },
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
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    padding: 10,
    backgroundColor: 'rgba(40, 40, 40, 0.95)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#333',
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1f1f1f',
    borderRadius: 20,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentsList: {
    flex: 1,
  },
  replyText: {
    fontSize: 13,
    color: '#999',
  },
}); 