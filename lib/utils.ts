import { Platform, StatusBar, Dimensions } from 'react-native';
import { Timestamp } from 'firebase/firestore';

const { height, width } = Dimensions.get('window');

export const getScreenWidth = () => width;

export const getScreenHeight = () => Platform.select({
  android: height - (StatusBar.currentHeight ?? 0),
  ios: height,
}) ?? height; 

export function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toString()
}

export function formatTimestamp(timestamp: Timestamp | null): string {
  if (!timestamp) return '';
  
  const now = new Date();
  const date = timestamp.toDate();
  const diff = (now.getTime() - date.getTime()) / 1000;

  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w`;
  return `${Math.floor(diff / 2592000)}mo`;
}