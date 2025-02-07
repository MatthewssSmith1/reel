import { MutableRefObject, useRef, useState } from 'react';
import { Video, AVPlaybackStatus } from 'expo-av';
import { getScreenWidth } from '@/lib/utils';
import { MaterialIcons } from '@expo/vector-icons';

type IconName = keyof typeof MaterialIcons.glyphMap;

const DOUBLE_TAP_DELAY = 250;
const SEEK_TIME = 5000;

export function useVideoControls(videoRef: MutableRefObject<Video | null>) {
  const [feedbackIcon, setFeedbackIcon] = useState<IconName>('pause');
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);

  const showFeedback = (iconName: IconName) => {
    setFeedbackIcon(iconName);
    setIsFeedbackVisible(true);
    setTimeout(() => setIsFeedbackVisible(false), 500);
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

    const isRightSide = event.nativeEvent.locationX > getScreenWidth() / 2;

    const newPos = status.positionMillis + (isRightSide ? SEEK_TIME : -SEEK_TIME);
    videoRef.current?.setPositionAsync(Math.max(0, Math.min(newPos, status.durationMillis ?? 0)));

    showFeedback(isRightSide ? 'forward-10' : 'replay-10');
  }

  const onPress = async (event: any) => {
    if (singleTapTimeoutRef.current) clearTimeout(singleTapTimeoutRef.current);

    const now = Date.now();
    const timeDiff = now - lastTapRef.current;

    event.persist();

    if (timeDiff < DOUBLE_TAP_DELAY) onDoubleTap(event);
    else singleTapTimeoutRef.current = setTimeout(onSingleTap, DOUBLE_TAP_DELAY);

    lastTapRef.current = now;
  };

  const onStatusChange = (status: AVPlaybackStatus) => {
    const isPlaying = status.isLoaded && status.isPlaying;
    setIsPlaying(isPlaying);

    if (isLoading) setIsLoading(!isPlaying);
  };

  return { onPress, onStatusChange, isLoading, feedbackIcon, isFeedbackVisible };
}
