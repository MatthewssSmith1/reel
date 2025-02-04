import { StyleSheet, TouchableOpacity, TextInput, View, FlatList } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getScreenHeight } from '@/lib/utils';
import { useCommentStore } from '@/lib/commentStore';
import { usePostStore } from '@/lib/postStore';
import { IconSymbol } from './ui/IconSymbol';
import { ThemedText } from './ThemedText';
import { useState } from 'react';
import { BlurView } from 'expo-blur';
import { Comment } from './Comment';

export function CommentsSheet() {
  const { isMessagesOpen, toggleMessages, comments, submitComment } = useCommentStore();
  const { currentPost } = usePostStore();
  const [comment, setComment] = useState('');
  const { bottom } = useSafeAreaInsets();

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ 
      translateY: withTiming(0, { duration: 300 })
    }],
  }));

  if (!isMessagesOpen || !currentPost) return null;

  return (
    <Animated.View 
      style={[styles.container, rStyle]}
      pointerEvents="box-none"
    >
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.sheet, { paddingBottom: bottom }]}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>{comments?.length} comments</ThemedText>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => toggleMessages(false)}
          >
            <IconSymbol name="xmark" color="white" size={24} />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={comments}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Comment comment={item} />
          )}
          style={styles.commentsList}
          contentContainerStyle={styles.commentsContent}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor="#666"
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={async () => {
              await submitComment(currentPost.id, comment);
              setComment('');
            }}
          >
            <IconSymbol name="paperplane.fill" color="white" size={20} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: getScreenHeight() * 0.7,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  sheet: {
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(27, 27, 27, 0.9)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#333',
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1f1f1f',
    borderRadius: 20,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentsList: {
    flex: 1,
  },
  commentsContent: {
    paddingTop: 8,
  },
}); 