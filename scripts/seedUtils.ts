import { doc, setDoc, Timestamp, collection, getDocs, deleteDoc, getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../config';
import { initializeApp } from 'firebase/app';

const ONE_DAY = 24 * 60 * 60 * 1000;

export const generateId = (length: number = 20) => Math.random().toString(36).substring(2, 2 + length);

export const randomFloat = (min: number, max: number) => (Math.random() * (max - min)) + min;

export const randomInt = (min: number, max: number) => Math.floor(randomFloat(min, max + 1));

export const randomItems = <T>(array: T[], n: number): T[] => [...array].sort(() => 0.5 - Math.random()).slice(0, n);

export const randomTimestamp = (minDaysAgo: number, maxDaysAgo: number): Timestamp => {
  const randomDays = randomFloat(minDaysAgo, maxDaysAgo);
  return Timestamp.fromDate(new Date(Date.now() - randomDays * ONE_DAY));
};

const db = getFirestore(initializeApp(firebaseConfig));

const clearCollection = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  await Promise.all(querySnapshot.docs.map(doc => deleteDoc(doc.ref)));
  console.log(`Cleared collection: ${collectionName}`);
};

export const seedCollection = async <T extends Record<string, any>>(
  collectionName: string, 
  items: T[]
) => {
  await clearCollection(collectionName);
  await Promise.all(items.map(item => 
    setDoc(doc(db, collectionName, item.id || item.uid), item)
  ));
};