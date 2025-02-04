import { StyleSheet, View, Dimensions, FlatList } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useCallback, useRef } from 'react';

const { width, height } = Dimensions.get('window');

// Video data array with the available videos
const VIDEOS = [
  { id: 'a', source: require('../../assets/videos/a.mp4') },
  { id: 'b', source: require('../../assets/videos/b.mp4') },
  { id: 'c', source: require('../../assets/videos/c.mp4') },
  { id: 'd', source: require('../../assets/videos/d.mp4') },
  { id: 'e', source: require('../../assets/videos/e.mp4') },
  { id: 'f', source: require('../../assets/videos/f.mp4') },
  { id: 'g', source: require('../../assets/videos/g.mp4') },
  { id: 'h', source: require('../../assets/videos/h.mp4') },
];

export default function FeedScreen() {
  const videoRefs = useRef<{ [key: string]: Video | null }>({});

  const onViewableItemsChanged = useCallback(({ changed }: { changed: any[] }) => {
    changed.forEach(item => {
      const video = videoRefs.current[item.item.id];
      if (!video) return;
      
      if (item.isViewable) video.playAsync();
      else video.pauseAsync();
    });
  }, []);

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  const renderVideo = ({ item }: { item: { id: string; source: number } }) => (
    <View style={[styles.videoContainer, { backgroundColor: '#FF0000' }]}>
      <Video
        ref={ref => (videoRefs.current[item.id] = ref)}
        source={item.source}
        style={[styles.video, { backgroundColor: '#00FF00' }]}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay={false}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: '#FFFF00' }]}>
      <FlatList
        data={VIDEOS}
        renderItem={renderVideo}
        keyExtractor={item => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    width,
    height: height - 49, // Subtracting tab bar height
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  loading: {
    flex: 1,
    backgroundColor: '#000',
  },
}); 