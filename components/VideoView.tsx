import { getScreenHeight, getScreenWidth } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Video, ResizeMode } from 'expo-av';
import { StyleSheet, View } from 'react-native';
import { useCommentStore } from '@/lib/commentStore';
import { ToolbarButton } from './ToolbarButton';
import { useLikeStore } from '@/lib/likeStore';
import { Post } from '@/lib/firebase';

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
  videoRef: (ref: Video | null) => void;
};

export function VideoView({ post, videoRef }: VideoViewProps) {
  const { toggleMessages } = useCommentStore();
  const { toggleLike, isLiked } = useLikeStore();
  const liked = isLiked(post.id);
  const [otherUsersLikeCount, setOtherUsersLikeCount] = useState(0);

  useEffect(() => {
    setOtherUsersLikeCount(post.likes_count - (liked ? 1 : 0));
  }, [post.id]);

  return (
    <View style={styles.videoContainer}>
      <Video
        ref={videoRef}
        source={VIDEO_ASSETS[post.video_id]}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay={false}
      />
      <View style={styles.toolbarContainer}>
        <ToolbarButton name="person.circle.fill" />
        <ToolbarButton 
          name="heart.fill" 
          count={otherUsersLikeCount + (liked ? 1 : 0)} 
          color={liked ? '#FF2D55' : '#fff'}
          onPress={() => toggleLike(post.id)}
        />
        <ToolbarButton 
          name="message.fill" 
          count={post.comments_count} 
          onPress={() => toggleMessages(true)}
        />
        <ToolbarButton name="square.and.arrow.up" />
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
    gap: 20,
  },
}); 