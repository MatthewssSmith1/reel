import { doc, setDoc, Timestamp, collection, getDocs, deleteDoc, getFirestore } from 'firebase/firestore';
import { User, Post, Like, Comment } from '@/lib/firebase';
import { firebaseConfig } from '@/config';
import { initializeApp } from 'firebase/app';

const db = getFirestore(initializeApp(firebaseConfig));

const generateId = (length: number = 20) => Math.random().toString(36).substring(2, 2 + length);

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
    created_at: Timestamp.now(),
    followers_count: 0,
    following_count: 0,
    posts_count: 0
  }
}

let users: User[] = [
  createUser('sarah_parker', '🛹 Living life one trick at a time'),
  createUser('mike_chen', '🌆 Finding beauty in city streets'),
  createUser('alex_rodriguez', '💃 Dancing through life'),
  createUser('jane_smith', '🌸 Embracing every moment'),
  createUser('paul_miller', '🏃‍♂️ Running for joy', '5ddX4HwqJbbeqzgut2qeLXU1HfM2'),
];

const ONE_DAY = 24 * 60 * 60 * 1000;
let posts: Post[] = Array.from({ length: 15 }, (_, i) => ({
  id: generateId(),
  author_id: users[i % users.length].uid,
  video_id: i.toString(),
  created_at: Timestamp.fromDate(new Date(Date.now() - i * ONE_DAY)),
  likes_count: 0,
  comments_count: 0
}));

const COMMENTS = [
  "This is amazing! 🔥",
  "Love your style 👏",
  "Can't stop watching this",
  "How did you do that?! 😮",
  "Perfect execution 💯",
  "This made my day",
  "Incredible work!",
  "Need to try this",
  "You're so talented!",
  "Keep them coming! 🙌"
];

const getRandomCount = (min: number, max: number) => 
  Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomItems = <T>(array: T[], n: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

const getOtherUsers = (authorId: string) => 
  users.filter(user => user.uid !== authorId);

function generateLikes(): Like[] {
  const likes: Like[] = [];
  
  for (const post of posts) {
    const otherUsers = getOtherUsers(post.author_id);
    const likerCount = getRandomCount(1, 4);
    const likers = getRandomItems(otherUsers, likerCount);
    
    for (const liker of likers) {
      const likeId = `${liker.uid}_${post.id}`;
      likes.push({
        id: likeId,
        user_id: liker.uid,
        post_id: post.id,
        created_at: Timestamp.now()
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
    const commenterCount = getRandomCount(1, 4);
    const commenters = getRandomItems(otherUsers, commenterCount);
    
    for (const commenter of commenters) {
      const commentId = generateId();
      comments.push({
        id: commentId,
        post_id: post.id,
        user_id: commenter.uid,
        text: getRandomItems(COMMENTS, 1)[0],
        created_at: Timestamp.now(),
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
    // Generate all data first
    const likes = generateLikes();
    const comments = generateComments();
    updateUserCounts();

    // Then perform database operations
    await clearCollection('users');
    for (const user of users) {
      await setDoc(doc(db, 'users', user.uid), user);
    }

    await clearCollection('posts');
    for (const post of posts) {
      await setDoc(doc(db, 'posts', post.id), post);
    }

    await clearCollection('likes');
    for (const like of likes) {
      await setDoc(doc(db, 'likes', like.id), like);
    }

    await clearCollection('comments');
    for (const comment of comments) {
      await setDoc(doc(db, 'comments', comment.id), comment);
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
