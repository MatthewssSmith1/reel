import { User, Post, Comment, Follow, PostLike, CommentLike, Recipe } from '@/lib/firebase';
import { TITLES, DESCRIPTIONS, RECIPES } from './data/recipes';
import { COMMENTS } from './data/comments';
import * as utils from './seedUtils';

const MAX_LIKES_PER_POST = 6;
const MAX_LIKES_PER_COMMENT = 4;
const MAX_COMMENTS_PER_POST = 12;
const COMMENT_HAS_REPLIES_PROBABILITY = 0.4;
const MAX_REPLIES_PER_COMMENT = 5;
const MAX_FOLLOWERS_PER_USER = 5;

function createUser(username: string, bio: string): User {
  return {
    uid: utils.generateId(28),
    username,
    avatar_url: `https://api.dicebear.com/7.x/avataaars/png?seed=${username}`,
    bio,
    created_at: utils.randomTimestamp(30, 60),
    followers_count: 0,
    following_count: 0,
    posts_count: 0
  }
}

const users: User[] = [
  createUser('josef_whitney', '🥘 Comfort food enthusiast & weekend baker'),
  createUser('aleks_mack', '🌮 Street food adventures & recipe collector'),
  createUser('mike_chen', '📸 Food photographer & noodle hunter'),
  createUser('alex_rodriguez', '🍝 Italian cuisine & pasta making'),
  createUser('marika_payne', '🌱 Plant-based recipes & mindful eating'),
  createUser('yannick_pokorni', '👩‍🍳 Cooking up stories, one dish at a time'),
  createUser('cynthia_amsel', '🔪 Home cook exploring flavors')
];

function generatePosts(recipes: Recipe[]): Post[] {
  const posts: Post[] = [];
  
  TITLES.forEach((title, i) => {
    const author = users[i % users.length];
    posts.push({
      id: utils.generateId(),
      author_id: author.uid,
      video_id: title,
      description: DESCRIPTIONS[title],
      recipe_id: recipes[i].id,
      created_at: utils.randomTimestamp(i, i + 3),
      likes_count: 0,
      comments_count: 0
    });
    author.posts_count++;
  });
  
  return posts;
}

function generateComments(posts: Post[]): Comment[] {
  const comments: Comment[] = [];
  
  for (const post of posts) {
    const otherUsers = users.filter(u => u.uid !== post.author_id);
    const commenterCount = utils.randomInt(1, MAX_COMMENTS_PER_POST);
    const commenters = utils.randomItems(otherUsers, commenterCount);
    
    for (const commenter of commenters) {
      const comment: Comment = {
        id: utils.generateId(),
        post_id: post.id,
        user_id: commenter.uid,
        text: utils.randomItems(COMMENTS, 1)[0],
        created_at: utils.randomTimestamp(0, 7),
        likes_count: 0,
        replies_count: 0,
        parent_id: null,
      };
      
      comments.push(comment);
      post.comments_count++;
    }
  }
  
  return comments;
}

function generateReplies(posts: Post[], comments: Comment[]): Comment[] {
  const replies: Comment[] = [];

  for (const comment of comments) {
    if (Math.random() > COMMENT_HAS_REPLIES_PROBABILITY) continue;
    
    const numReplies = Math.floor(Math.random() * MAX_REPLIES_PER_COMMENT) + 1;
    comment.replies_count += numReplies;
    posts.find(p => p.id === comment.post_id)!.comments_count += numReplies;

    for (let i = 0; i < numReplies; i++) {
      const reply: Comment = {
        id: utils.generateId(),
        post_id: comment.post_id,
        user_id: utils.randomItems(users, 1)[0].uid,
        text: utils.randomItems(COMMENTS, 1)[0],
        created_at: utils.randomTimestamp(0, 7),
        likes_count: 0,
        parent_id: comment.id,
        replies_count: 0,
      };
      replies.push(reply);
    }
  }

  return replies;
}

function generateFollows(users: User[]): Follow[] {
  const follows: Follow[] = [];
  
  for (const user of users) {
    const otherUsers = users.filter(u => u.uid !== user.uid);
    const followCount = utils.randomInt(1, MAX_FOLLOWERS_PER_USER);
    const followedUsers = utils.randomItems(otherUsers, followCount);
    
    for (const followedUser of followedUsers) {
      follows.push({
        id: `${user.uid}_${followedUser.uid}`,
        follower_id: user.uid,
        following_id: followedUser.uid,
        created_at: utils.randomTimestamp(0, 30)
      });
      user.following_count++;
      followedUser.followers_count++;
    }
  }
  
  return follows;
}

function generateLikes<T extends { likes_count: number }>(
  items: T[],
  users: User[],
  maxLikes: number,
  createLike: (item: T, user: User) => PostLike | CommentLike
): (PostLike | CommentLike)[] {
  const likes: (PostLike | CommentLike)[] = [];
  
  for (const item of items) {
    const otherUsers = users.filter(u => 
      'author_id' in item ? u.uid !== item.author_id : 
      'user_id' in item ? u.uid !== item.user_id : true
    );
    
    const likerCount = utils.randomInt(1, maxLikes);
    const likers = utils.randomItems(otherUsers, likerCount);
    
    for (const liker of likers) {
      likes.push(createLike(item, liker));
      item.likes_count++;
    }
  }
  
  return likes;
}

async function seedDatabase() {
  console.log('Seeding database...');

  const recipes = TITLES.map((title, i) => ({
    ...RECIPES[title],
    id: utils.generateId(),
    author_id: users[i % users.length].uid
  }));

  const posts = generatePosts(recipes);
  let comments = generateComments(posts);
  comments = [...comments, ...generateReplies(posts, comments)];
  
  const postLikes = generateLikes(
    posts, 
    users, 
    MAX_LIKES_PER_POST,
    (post, user) => ({
      id: `${user.uid}_${post.id}`,
      user_id: user.uid,
      post_id: post.id,
      created_at: utils.randomTimestamp(0, 7)
    })
  );
  
  const commentLikes = generateLikes(
    comments,
    users,
    MAX_LIKES_PER_COMMENT,
    (comment, user) => ({
      id: `${user.uid}_${comment.id}`,
      user_id: user.uid,
      comment_id: comment.id,
      created_at: utils.randomTimestamp(0, 7)
    })
  );

  const follows = generateFollows(users);

  await Promise.all([
    utils.seedCollection('users', users),
    utils.seedCollection('recipes', recipes),
    utils.seedCollection('posts', posts),
    utils.seedCollection('comments', comments),
    utils.seedCollection('post_likes', postLikes as PostLike[]),
    utils.seedCollection('comment_likes', commentLikes as CommentLike[]),
    utils.seedCollection('follows', follows)
  ]);

  console.log('Seeding completed successfully');
  process.exit(0);
}

seedDatabase();
