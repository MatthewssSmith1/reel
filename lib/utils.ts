import { Platform, StatusBar, Dimensions } from 'react-native';

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