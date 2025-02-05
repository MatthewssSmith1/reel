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

  const rInputStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboardPadding.value > 0 ? 10 : Math.max(bottom, 10),
  }));

  if (!isMessagesOpen || !currentPost) return null;

  return (
    <Animated.View 
      style={[styles.container, rStyle]}
      pointerEvents="box-none"
    >
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.sheet}>
        <ThemedText style={styles.title}>{comments?.length} comments</ThemedText>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => {
            Keyboard.dismiss();
            toggleMessages(false);
          }}
        >
          <Ionicons name="close" color="white" size={18} />
        </TouchableOpacity>
        
        <FlatList
          data={comments}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Comment comment={item} />
          )}
          style={styles.commentsList}
          contentContainerStyle={{ paddingTop: 0, paddingBottom: bottom + 60 }}
          keyboardShouldPersistTaps="handled"
        />

        <Animated.View style={[styles.inputContainer, rInputStyle]}>
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
        </Animated.View>
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
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentsList: {
    flex: 1,
  },
}); 