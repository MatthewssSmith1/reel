import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { initializeApp, FirebaseApp } from 'firebase/app';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBdjuagWZ_z6TqlJcrwsCIjfodVN1_CAMU",
  authDomain: "reel-a0034.firebaseapp.com",
  projectId: "reel-a0034",
  storageBucket: "reel-a0034.firebasestorage.app",
  messagingSenderId: "343261960145",
  appId: "1:343261960145:web:7d983edaabf83a0cba72f0"
};

export const app: FirebaseApp = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app);
