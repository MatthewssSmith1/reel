import { initializeAuth, getReactNativePersistence, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Timestamp } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { firebaseConfig, LOCAL_IP } from '@/config';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import * as firebaseJsonConfig from '../firebase.json';

export const app: FirebaseApp = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

if (__DEV__) {
  const emulators = firebaseJsonConfig.emulators;
  connectAuthEmulator(auth, `http://${LOCAL_IP}:9099`);
  connectFirestoreEmulator(db, LOCAL_IP, emulators.firestore.port);
  connectStorageEmulator(storage, LOCAL_IP, emulators.storage.port);
  connectFunctionsEmulator(functions, LOCAL_IP, emulators.functions.port);
}

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

export type Recipe = {
  id: string
  parent_id?: string
  title: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  tags: string[];
  ingredients: string[];
  equipment: string[];
  steps: string[];
};

export type Post = {
  id: string
  author_id: string
  video_id: string
  description: string
  recipe_id: string
  created_at: Timestamp
  likes_count: number
  comments_count: number
}

export type Like = {
  id: string;
  user_id: string;
  created_at: Timestamp;
};
export type PostLike = Like & { post_id: string };
export type CommentLike = Like & { comment_id: string };

export type Comment = {
  id: string
  post_id: string
  user_id: string
  text: string
  created_at: Timestamp
  likes_count: number
  parent_id: string | null
  replies_count: number
  children?: Comment[] // not in db, derived on load via `parent_id`
}

export type Follow = {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: Timestamp;
};