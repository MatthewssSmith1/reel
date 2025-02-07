import { MutableRefObject, useRef, useState } from 'react';
import { Video, AVPlaybackStatus } from 'expo-av';
import { getScreenWidth } from '@/lib/utils';

export function useVideoControls(videoRef: MutableRefObject<Video | null>) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const singleTapTimeoutRef = useRef<NodeJS.Timeout>();
  const lastTapRef = useRef<number>(0);
  const DOUBLE_TAP_DELAY = 250;
  const SEEK_TIME = 5000;

  const onSingleTap = () => {
    const video = videoRef.current;
    if (!video || isLoading) return;
    isPlaying ? video.pauseAsync() : video.playAsync();
  };

  const onDoubleTap = async (event: any) => {
    const status = await videoRef.current?.getStatusAsync();
    if (!status?.isLoaded) return;

    const isRightSide = event.nativeEvent.locationX > getScreenWidth() / 2;

    const newPos = status.positionMillis + (isRightSide ? SEEK_TIME : -SEEK_TIME);
    videoRef.current?.setPositionAsync(Math.max(0, Math.min(newPos, status.durationMillis ?? 0)));
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

  return { onPress, onStatusChange, isLoading };
}
