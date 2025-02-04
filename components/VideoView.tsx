import { StyleSheet, View, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { ToolbarButton } from './ToolbarButton';
import { Post } from '@/lib/firebase';

const { width, height } = Dimensions.get('window');

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
        <ToolbarButton name="heart.fill" count={10} />
        <ToolbarButton name="message.fill" count={15} />
        <ToolbarButton name="square.and.arrow.up" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    width,
    height: height,
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