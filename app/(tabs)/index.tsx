import { StyleSheet, View, ActivityIndicator, Text, Pressable } from 'react-native';
import { VideoScrollView } from '@/components/VideoScrollView';
import { useFollowStore } from '@/lib/followStore';
import { useUserStore } from '@/lib/userStore';
import { usePostStore } from '@/lib/postStore';
import { create } from 'zustand';
import Toast from 'react-native-toast-message';

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
    ? posts.filter(post => followedUsers.has(post.author_id)).toReversed()
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
        <TabButton title="Following" feed="following" disabled={followedUsers.size === 0} />
        <View style={styles.divider} />
        <TabButton title="For You" feed="for-you" />
      </View>
    </View>
  );
}

function TabButton({ title, feed, disabled }: { title: string; feed: Feed; disabled?: boolean }) {
  const { currentFeed, setCurrentFeed } = useFeedStore();

  const onPress = () => {
    if (disabled) return Toast.show({
      type: 'info',
      text1: 'Start Following People!',
      text2: 'Follow other users to see their posts in this feed.',
    });

    setCurrentFeed(feed);
  };

  return (
    <Pressable style={styles.tabButton} onPress={onPress}>
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
    marginTop: 55,
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