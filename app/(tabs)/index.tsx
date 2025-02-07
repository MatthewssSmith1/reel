import { StyleSheet, View, ActivityIndicator, Text, Pressable } from 'react-native';
import { VideoScrollView } from '@/components/VideoScrollView';
import { useFollowStore } from '@/lib/followStore';
import { useUserStore } from '@/lib/userStore';
import { usePostStore } from '@/lib/postStore';
import { create } from 'zustand';

type Feed = 'following' | 'for-you';

type FeedStore = { currentFeed: Feed; setCurrentFeed: (feed: Feed) => void; }

const useFeedStore = create<FeedStore>((set) => ({
  currentFeed: 'for-you',
  setCurrentFeed: (feed: Feed) => set({ currentFeed: feed }),
}));


export default function FeedScreen() {
  const { followedUsers, isInitialized } = useFollowStore();
  const { posts, isLoading } = usePostStore();
  const { currentFeed } = useFeedStore();
  const { authUser } = useUserStore();

  const displayedPosts = currentFeed === 'following' 
    ? posts.filter(post => followedUsers.has(post.author_id))
    : posts.filter(post => post.author_id !== authUser?.uid);

  if (isLoading || !isInitialized) return (
    <View style={[styles.container, styles.loading]}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );

  return (
    <View style={styles.container}>
      <VideoScrollView posts={displayedPosts} shouldPlay={true} />
      <View style={styles.tabContainer}>
        <TabButton title="Following" feed="following" />
        <View style={styles.divider} />
        <TabButton title="For You" feed="for-you" />
      </View>
    </View>
  );
}

function TabButton({ title, feed }: { title: string; feed: Feed }) {
  const { currentFeed, setCurrentFeed } = useFeedStore();
  return (
    <Pressable style={styles.tabButton} onPress={() => setCurrentFeed(feed)}>
      <Text style={[styles.tabText, currentFeed === feed && styles.activeTabText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    marginTop: 70,
    backgroundColor: 'transparent',
  },
  tabButton: {
    padding: 16,
  },
  tabText: {
    color: '#ffffff66',
    fontSize: 16,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: 15,
    backgroundColor: '#fff',
    marginHorizontal: 2,
  },
});