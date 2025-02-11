import { User, Post, Comment, Follow, PostLike, CommentLike, Recipe } from '@/lib/firebase';
import { RECIPES } from './seedRecipes';
import * as utils from './seedUtils';

const MAX_LIKES_PER_POST = 6;
const MAX_LIKES_PER_COMMENT = 5;
const MAX_COMMENTS_PER_POST = 10;
const COMMENT_HAS_REPLIES_PROBABILITY = 0.5;
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

const VIDEO_DESCRIPTIONS = [
  "Smashed beef patty with caramelized onions, aged cheddar & secret sauce on brioche, served with crispy fries",
  "San Marzano tomatoes simmered with garlic, basil & olive oil for 2hrs until rich and velvety",
  "Cherry tomatoes blistered in cast iron with garlic, thyme & flaky salt, finished with aged balsamic",
  "Steamed edamame pods tossed in Maldon salt, togarashi & sesame oil, served with charred lemon",
  "Classic spaghetti cacio e pepe with fresh pecorino, cracked black pepper & pasta water emulsion",
  "Handmade orecchiette with broccoli, Italian sausage, chili flakes & toasted breadcrumbs",
  "Fluffy Japanese soufflé pancakes with maple butter, fresh berries & whipped mascarpone cream",
  "Ancient grain quinoa bowl with roasted vegetables, crispy chickpeas & lemon-tahini dressing",
  "72-hour cold-fermented pizza dough with 00 flour, yielding perfect leopard-spotted crust",
  "Charred broccoli florets with garlic confit, chili flakes & lemon zest, finished with aged parmesan",
  "Artisanal sourdough toast topped with whipped honey-peanut butter, caramelized bananas & Maldon salt",
  "Silky fettuccine alfredo with 24-month aged parmigiano, fresh cream & nutmeg, garnished with chives",
  "Triple-layer chocolate cake with Valrhona ganache, salted caramel & fresh raspberry compote",
  "Fresh guacamole with hand-crushed Hass avocados, lime, cilantro & serrano chilies, topped with pomegranate seeds",
  "Wild mushroom soup with shiitake, porcini & cremini blend, finished with truffle oil & fresh thyme"
];

function generatePosts(recipes: Recipe[]): Post[] {
  const posts: Post[] = [];
  
  VIDEO_DESCRIPTIONS.forEach((description, i) => {
    const author = users[i % users.length];
    posts.push({
      id: utils.generateId(),
      author_id: author.uid,
      video_id: i.toString(),
      description,
      recipe_id: recipes[i].id,
      created_at: utils.randomTimestamp(i, i + 3),
      likes_count: 0,
      comments_count: 0
    });
    author.posts_count++;
  });
  
  return posts;
}

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
  "Can't wait to try this out! 🍴",
  "Weekend meal prep inspiration 📝",
  "Need that recipe ASAP 🙏",
  "The texture looks perfect 👩‍🍳",
  "Love the fresh ingredients 🌿",
  "That seasoning blend though 🧂",
  "Master class in presentation 🎯",
  "Could smell this through the screen 🍴",
  "Gordon Ramsay would approve 🔥",
  "Would you like some more? 🤔",
  "This is my go-to recipe for the week 🍽️",
];

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
  try {
    const recipes = RECIPES.map(recipe => ({
      ...recipe,
      id: utils.generateId()
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
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
