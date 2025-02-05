import { doc, setDoc, Timestamp, collection, getDocs, deleteDoc, getFirestore } from 'firebase/firestore';
import { User, Post, Like, Comment } from '@/lib/firebase';
import { firebaseConfig } from '../config';
import { initializeApp } from 'firebase/app';

const MAX_LIKES_PER_POST = 6;
const MAX_COMMENTS_PER_POST = 6;

const db = getFirestore(initializeApp(firebaseConfig));

const generateId = (length: number = 20) => Math.random().toString(36).substring(2, 2 + length);

const getRandomFloat = (min: number, max: number) => (Math.random() * (max - min)) + min;
const getRandomInt = (min: number, max: number) => Math.floor(getRandomFloat(min, max + 1));

const getRandomItems = <T>(array: T[], n: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

const ONE_DAY = 24 * 60 * 60 * 1000;
const getRandomTimestamp = (minDaysAgo: number, maxDaysAgo: number): Timestamp => {
  const randomDays = getRandomFloat(minDaysAgo, maxDaysAgo);
  return Timestamp.fromDate(new Date(Date.now() - randomDays * ONE_DAY));
};

async function clearCollection(collectionName: string) {
  const querySnapshot = await getDocs(collection(db, collectionName));
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
  console.log(`Cleared collection: ${collectionName}`);
}

function createUser(username: string, bio: string, id?: string): User {
  return {
    uid: id || generateId(),
    username,
    avatar_url: `https://api.dicebear.com/7.x/avataaars/png?seed=${username}`,
    bio,
    created_at: getRandomTimestamp(30, 60),
    followers_count: 0,
    following_count: 0,
    posts_count: 0
  }
}

let users: User[] = [
  createUser('paul_miller', '🥘 Comfort food enthusiast & weekend baker', '5ddX4HwqJbbeqzgut2qeLXU1HfM2'),
  createUser('sarah_parker', '🌮 Street food adventures & recipe collector'),
  createUser('mike_chen', '📸 Food photographer & noodle hunter'),
  createUser('alex_rodriguez', '🍝 Italian cuisine & pasta making'),
  createUser('jane_smith', '🌱 Plant-based recipes & mindful eating'),
  createUser('chef_maria', '👩‍🍳 Cooking up stories, one dish at a time'),
  createUser('tom_nguyen', '🔪 Home cook exploring flavors')
];

let posts: Post[] = Array.from({ length: 15 }, (_, i) => ({
  id: generateId(),
  author_id: users[i % users.length].uid,
  video_id: i.toString(),
  created_at: getRandomTimestamp(i, i + 3),
  likes_count: 0,
  comments_count: 0
}));

const COMMENTS = [
  "This looks absolutely delicious! 🤤",
  "The plating is gorgeous 👨‍🍳",
  "How did you get that perfect sear?! 🔥",
  "Making this for dinner tonight 💯",
  "Your knife skills are insane",
  "That sauce looks incredible ✨",
  "Pro chef vibes right here 👌",
  "Keep the recipes coming! 🍳",
  "Those colors are making me hungry 😍",
  "What heat setting did you use? 🔪",
  "This is food art at its finest ⭐",
  "My stomach is growling rn 🍽️",
  "Weekend meal prep inspiration 📝",
  "Need that recipe ASAP 🙏",
  "The texture looks perfect 👩‍🍳",
  "Love the fresh ingredients 🌿",
  "That seasoning blend though 🧂",
  "Master class in presentation 🎯",
  "Could smell this through the screen 🍴",
  "Gordon Ramsay would approve 🔥"
];

const getOtherUsers = (authorId: string) => 
  users.filter(user => user.uid !== authorId);

function generateLikes(): Like[] {
  const likes: Like[] = [];
  
  for (const post of posts) {
    const otherUsers = getOtherUsers(post.author_id);
    const likerCount = getRandomInt(1, MAX_LIKES_PER_POST);
    const likers = getRandomItems(otherUsers, likerCount);
    
    for (const liker of likers) {
      const likeId = `${liker.uid}_${post.id}`;
      likes.push({
        id: likeId,
        user_id: liker.uid,
        post_id: post.id,
        created_at: getRandomTimestamp(0, 7)
      });
      post.likes_count++;
    }
  }
  
  return likes;
}

function generateComments(): Comment[] {
  const comments: Comment[] = [];
  
  for (const post of posts) {
    const otherUsers = getOtherUsers(post.author_id);
    const commenterCount = getRandomInt(1, MAX_COMMENTS_PER_POST);
    const commenters = getRandomItems(otherUsers, commenterCount);
    
    for (const commenter of commenters) {
      const commentId = generateId();
      comments.push({
        id: commentId,
        post_id: post.id,
        user_id: commenter.uid,
        text: getRandomItems(COMMENTS, 1)[0],
        created_at: getRandomTimestamp(0, 7),
        likes_count: 0
      });
      post.comments_count++;
    }
  }
  
  return comments;
}

function updateUserCounts() {
  for (const user of users) {
    user.posts_count = posts.filter(p => p.author_id === user.uid).length;
  }
}

async function seedDatabase() {
  try {
    const likes = generateLikes();
    const comments = generateComments();
    updateUserCounts();

    await clearCollection('users');
    for (const user of users) await setDoc(doc(db, 'users', user.uid), user);

    await clearCollection('posts');
    for (const post of posts) await setDoc(doc(db, 'posts', post.id), post);

    await clearCollection('likes');
    for (const like of likes) await setDoc(doc(db, 'likes', like.id), like);

    await clearCollection('comments');
    for (const comment of comments) await setDoc(doc(db, 'comments', comment.id), comment);

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
