import { StyleSheet, View, ActivityIndicator, Pressable, Image } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { getScreenHeight, getScreenWidth } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { useOptimisticLikes } from '@/hooks/useOptimisticLikes';
import { useVideoControls } from '@/hooks/useVideoControls';
import { ToolbarButton } from './ToolbarButton';
import { Post, storage } from '@/lib/firebase';
import { useThumbnail } from '@/hooks/useThumbnails';
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
  const videoRef = useRef<Video | null>(null);
  const thumbnailUri = useThumbnail(post); 

  const { onPress, onStatusChange, isLoading } = useVideoControls(videoRef);

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
      <Pressable onPress={onPress} style={styles.video}>
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
          onPlaybackStatusUpdate={onStatusChange}
        />
      </Pressable>
      {/* )} */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          {thumbnailUri && <Image source={{ uri: thumbnailUri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />}
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      <View style={styles.descriptionContainer}>
        <ThemedText style={styles.descriptionText} numberOfLines={3}>
          {post.description}
        </ThemedText>
      </View>
      <View style={styles.toolbarContainer}>
        {!hideProfileButton && (
          <ToolbarButton
            name="person-circle"
            onPress={() => router.push({ pathname: '/(modals)/user-profile', params: { userId: post.author_id } })}
          />
        )}
        <ToolbarButton
          name={liked ? "heart" : "heart-outline"}
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
  descriptionContainer: {
    position: 'absolute',
    left: 16,
    bottom: 110,
    right: 90,
    zIndex: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  descriptionText: {
    color: '#fff',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
}); 