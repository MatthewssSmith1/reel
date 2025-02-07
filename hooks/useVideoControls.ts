import { MutableRefObject, useRef, useState, useEffect } from 'react';
import { Video, AVPlaybackStatus } from 'expo-av';
import { getScreenWidth } from '@/lib/utils';
import { MaterialIcons } from '@expo/vector-icons';
import { Animated } from 'react-native';

type IconName = keyof typeof MaterialIcons.glyphMap;

const DOUBLE_TAP_DELAY = 250;
const SKIP_OFFSET_MS = 5000;

export function useVideoControls(videoRef: MutableRefObject<Video | null>) {
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const [feedbackIcon, setFeedbackIcon] = useState<IconName>('pause');

  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(feedbackOpacity, {
      toValue: isFeedbackVisible ? 1 : 0,
      duration: 75,
      useNativeDriver: true,
    }).start();
  }, [isFeedbackVisible]);

  const showFeedback = (iconName: IconName) => {
    setFeedbackIcon(iconName);
    setIsFeedbackVisible(true);
    setTimeout(() => setIsFeedbackVisible(false), 350);
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const singleTapTimeoutRef = useRef<NodeJS.Timeout>();
  const lastTapRef = useRef<number>(0);

  const onSingleTap = () => {
    const video = videoRef.current;
    if (!video || isLoading) return;

    isPlaying ? video.pauseAsync() : video.playAsync();

    showFeedback(isPlaying ? 'pause' : 'play-arrow');
  };

  const onDoubleTap = async (event: any) => {
    const status = await videoRef.current?.getStatusAsync();
    if (!status?.isLoaded) return;

    const duration = status.durationMillis;
    if (!duration) return;

    const isRightSide = event.nativeEvent.locationX > getScreenWidth() / 2;

    const newPos = status.positionMillis + SKIP_OFFSET_MS * (isRightSide ? 1 : -1);
    videoRef.current?.setPositionAsync(Math.max(0, Math.min(newPos, duration)));

    progressAnim.setValue((newPos - 100) / duration);

    showFeedback(isRightSide ? 'forward-10' : 'replay-10');
  }

  const onPress = async (event: any) => {
    event.persist();
    if (singleTapTimeoutRef.current) clearTimeout(singleTapTimeoutRef.current);

    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) 
      return onDoubleTap(event);

    singleTapTimeoutRef.current = setTimeout(onSingleTap, DOUBLE_TAP_DELAY);

    lastTapRef.current = now;
  };

  const onStatusChange = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    setIsPlaying(status.isPlaying);
    if (isLoading) setIsLoading(!status.isPlaying);
    
    const duration = status.durationMillis;
    if (!status.positionMillis || !duration) return;

    Animated.timing(progressAnim, {
      toValue: Math.min(1, status.positionMillis / duration),
      duration: 1500,
      useNativeDriver: true,
    }).start();
  };

  return { 
    onPress, 
    onStatusChange, 
    isLoading, 
    progressAnim,
    feedbackIcon, 
    feedbackOpacity,
  };
}
