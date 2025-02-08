import { StyleSheet, View, ActivityIndicator, Pressable, Image, Animated, TouchableOpacity } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { getScreenHeight, getScreenWidth } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { useOptimisticLikes } from '@/hooks/useOptimisticLikes';
import { useVideoControls } from '@/hooks/useVideoControls';
import { MaterialIcons } from '@expo/vector-icons';
import { ToolbarButton, styles as toolbarStyles } from './ToolbarButton';
import { Post, storage } from '@/lib/firebase';
import { useThumbnail } from '@/hooks/useThumbnails';
import { useUserStore } from '@/lib/userStore';
import { ThemedText } from './ThemedText';
import { router } from 'expo-router';

const VIDEO_ASSETS: { [key: string]: number } = {
  '0': require('../assets/videos/0.mp4'),
  '1': require('../assets/videos/1.mp4'),
  '2': require('../assets/videos/2.mp4'),
  '3': require('../assets/videos/3.mp4'),
  '4': require('../assets/videos/4.mp4'),
  '5': require('../assets/videos/5.mp4'),
  '6': require('../assets/videos/6.mp4'),
  '7': require('../assets/videos/7.mp4'),
  '8': require('../assets/videos/8.mp4'),
  '9': require('../assets/videos/9.mp4'),
  '10': require('../assets/videos/10.mp4'),
  '11': require('../assets/videos/11.mp4'),
  '12': require('../assets/videos/12.mp4'),
  '13': require('../assets/videos/13.mp4'),
  '14': require('../assets/videos/14.mp4'),
};

type VideoViewProps = {
  post: Post;
  shouldPlay: boolean;
  hideProfileButton?: boolean;
  setVideoRef: (ref: Video | null) => void;
};

export function VideoView({ post, shouldPlay, setVideoRef, hideProfileButton = false }: VideoViewProps) {
  const { liked, optimisticCount, toggleLike } = useOptimisticLikes(post.id, post.likes_count, 'post');
  const { users } = useUserStore();
  const videoRef = useRef<Video | null>(null);
  const thumbnailUri = useThumbnail(post); 

  const controls = useVideoControls(videoRef);

  const author = users[post.author_id];
  if (!author) return null;

  // const [videoUri, setVideoUri] = useState<string | null>(null);
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   const loadVideo = async () => {
  //     try {
  //       setIsLoading(true);
  //       setError(null);
  //       const videoRef = ref(storage, `videos/${post.video_id}.mp4`);
  //       const url = await getDownloadURL(videoRef);
  //       setVideoUri(url);
  //     } catch (error) {
  //       console.error('Error loading video:', error);
  //       setError('Failed to load video');
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   loadVideo();
  // }, [post.video_id]);

  return (
    <View style={styles.videoContainer}>
      {/* {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      )}
      {videoUri && ( */}
      <Pressable onPress={controls.onPress} style={styles.video}>
        <Video
          isLooping
          ref={ref => {
            videoRef.current = ref;
            setVideoRef(ref);
          }}
          // source={{ uri: videoUri }}
          source={VIDEO_ASSETS[post.video_id]}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          shouldPlay={shouldPlay}
          onPlaybackStatusUpdate={controls.onStatusChange}
        />
        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <Animated.View 
            style={[
              styles.progressBar, 
              { 
                transform: [{
                  scaleX: controls.progressAnim
                }],
                width: '100%',
                transformOrigin: 'left'
              }
            ]} 
          />
        </View>
      </Pressable>
      {/* )} */}
      {controls.isLoading && ( 
        <View style={styles.loadingContainer}>
          {thumbnailUri && <Image source={{ uri: thumbnailUri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />}
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      <Animated.View style={[styles.feedbackOverlay, { opacity: controls.feedbackOpacity }]} pointerEvents="none">
        <MaterialIcons name={controls.feedbackIcon} size={48} color="white" style={{ marginBottom: 50}} />
      </Animated.View>
      <View style={styles.textContainer}>
        <ThemedText style={styles.usernameText}>@{author.username}</ThemedText>
        <ThemedText style={styles.descriptionText}>{post.description}</ThemedText>
      </View>
      <View style={styles.toolbarContainer}>
        {!hideProfileButton && (
          <TouchableOpacity 
            style={toolbarStyles.container} 
            onPress={() => router.push({ pathname: '/(modals)/user-profile', params: { userId: post.author_id } })}
          >
            <Image 
              source={{ uri: author.avatar_url }} 
              style={styles.avatarImage}
            />
          </TouchableOpacity>
        )}
        <ToolbarButton
          name={"heart"}
          count={optimisticCount}
          color={liked ? '#FF2D55' : '#fff'}
          onPress={toggleLike}
        />
        <ToolbarButton
          name="chatbubble"
          count={post.comments_count}
          onPress={() => router.push({ pathname: '/(modals)/comments', params: { postId: post.id } })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    width: getScreenWidth(),
    height: getScreenHeight(),
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  toolbarContainer: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    alignItems: 'center',
    zIndex: 3,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  feedbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    left: 16,
    bottom: 110,
    right: 90,
    zIndex: 3,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 4,
  },
  usernameText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  descriptionText: {
    color: '#fff',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 83,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
}); 