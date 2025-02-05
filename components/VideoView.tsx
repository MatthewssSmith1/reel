import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { getScreenHeight, getScreenWidth } from '@/lib/utils';
import { ref, getDownloadURL } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { useOptimisticLikes } from '@/hooks/useOptimisticLikes';
import { Video, ResizeMode } from 'expo-av';
import { useCommentStore } from '@/lib/commentStore';
import { ToolbarButton } from './ToolbarButton';
import { Post, storage } from '@/lib/firebase';
import { ThemedText } from './ThemedText';

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
  videoRef: (ref: Video | null) => void;
};

// commented lines are for loading videos from the storage bucket (excluded to save on bandwidth by using static assets for now)
export function VideoView({ post, shouldPlay, videoRef }: VideoViewProps) {
  const { toggleMessages } = useCommentStore();
  const { liked, optimisticCount, toggleLike } = useOptimisticLikes(post.id, post.likes_count, 'post');
  // const [videoUri, setVideoUri] = useState<string | null>(null);
  // const [isLoading, setIsLoading] = useState(true);
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
        <Video
          ref={videoRef}
          // source={{ uri: videoUri }}
          source={VIDEO_ASSETS[post.video_id]}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay={shouldPlay}
        />
      {/* )} */}
      <View style={styles.toolbarContainer}>
        <ToolbarButton name="person-circle" />
        <ToolbarButton 
          name={liked ? "heart" : "heart-outline"}
          count={optimisticCount} 
          color={liked ? '#FF2D55' : '#fff'}
          onPress={toggleLike}
        />
        <ToolbarButton 
          name="chatbubble" 
          count={post.comments_count} 
          onPress={() => toggleMessages(true)}
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
    bottom: 110,
    alignItems: 'center',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
  },
}); 