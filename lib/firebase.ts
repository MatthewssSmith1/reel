import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Timestamp } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from '@/config';
import { getStorage } from 'firebase/storage';

export const app: FirebaseApp = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app);

export type User = {
  uid: string
  username: string
  avatar_url: string
  bio: string
  created_at: Timestamp
  followers_count: number
  following_count: number
  posts_count: number
}

export type Post = {
  id: string
  author_id: string
  video_id: string
  created_at: Timestamp
  likes_count: number
  comments_count: number
}

export type Like = {
  id: string
  user_id: string
  post_id: string
  created_at: Timestamp
}

export type Comment = {
  id: string
  post_id: string
  user_id: string
  text: string
  created_at: Timestamp
  likes_count: number
}
