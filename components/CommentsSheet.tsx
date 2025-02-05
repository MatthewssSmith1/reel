import { StyleSheet, TouchableOpacity, TextInput, View, FlatList, Platform, Keyboard } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getScreenHeight } from '@/lib/utils';
import { useCommentStore } from '@/lib/commentStore';
import { usePostStore } from '@/lib/postStore';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { BlurView } from 'expo-blur';
import { Comment } from './Comment';

export function CommentsSheet() {
  const { isMessagesOpen, toggleMessages, comments, submitComment } = useCommentStore();
  const { currentPost } = usePostStore();
  const [comment, setComment] = useState('');
  const { bottom } = useSafeAreaInsets();
  
  const keyboardPadding = useSharedValue(0);
  const sheetHeight = useSharedValue(getScreenHeight() * 0.7);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        keyboardPadding.value = e.endCoordinates.height;
        sheetHeight.value = getScreenHeight() * 0.9;
      }
    );
    
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        keyboardPadding.value = 0;
        sheetHeight.value = getScreenHeight() * 0.7;
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const rStyle = useAnimatedStyle(() => ({
    height: withTiming(sheetHeight.value, { duration: 300 }),
    paddingBottom: withTiming(keyboardPadding.value, { duration: 300 }),
  }));

  if (!isMessagesOpen || !currentPost) return null;

  return (
    <Animated.View 
      style={[styles.container, rStyle]}
      pointerEvents="box-none"
    >
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>{comments?.length} comments</ThemedText>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => {
              Keyboard.dismiss();
              toggleMessages(false);
            }}
          >
            <Ionicons name="close" color="white" size={24} />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={comments}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Comment comment={item} />
          )}
          style={styles.commentsList}
          contentContainerStyle={{ paddingBottom: bottom + 60 }}
          keyboardShouldPersistTaps="handled"
        />

        <View style={[styles.inputContainer, { paddingBottom: Math.max(bottom, 10) }]}>
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
            <Ionicons name="paper-plane" color="white" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
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
    backgroundColor: 'rgba(40, 40, 40, 0.95)',
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
}); 