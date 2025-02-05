import { StyleSheet, Pressable, Image, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { ref, getDownloadURL } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { ThemedText as Text } from '@/components/ThemedText';
import { ThemedView as View } from '@/components/ThemedView';
import { useFollowStore } from '@/lib/followStore';
import { Post, storage } from '@/lib/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/lib/userStore';
import { usePostStore } from '@/lib/postStore';
import { router } from 'expo-router';

type ProfileProps = {
  userId: string;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
};

const StatDisplay = ({ value, label }: { value: number; label: string }) => (
  <View style={styles.statContainer}>
    <Text style={styles.statValue}>{value.toLocaleString()}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export function Profile({ userId, headerLeft, headerRight }: ProfileProps) {
  const { users, authUser } = useUserStore();
  const { posts } = usePostStore();
  const { isFollowing, toggleFollow } = useFollowStore();
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const userPosts = posts.filter(post => post.author_id === userId);

  const isAuthUser = authUser?.uid === userId;

  useEffect(() => {
    const loadThumbnails = async () => {
      try {
        const thumbnailUrls: Record<string, string> = {};
        await Promise.all(
          userPosts.map(async (post) => {
            try {
              const thumbnailRef = ref(storage, `thumbnails/${post.video_id}.jpg`);
              const url = await getDownloadURL(thumbnailRef);
              thumbnailUrls[post.id] = url;
            } catch (error) {
              console.error('Error loading thumbnail:', error);
            }
          })
        );
        setThumbnails(thumbnailUrls);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading thumbnails:', error);
        setIsLoading(false);
      }
    };

    if (userPosts.length > 0) loadThumbnails();
    else setIsLoading(false);
  }, [userPosts]);

  const handlePostPress = (post: Post) => {
    router.push({
      pathname: '/(modals)/post',
      params: { postId: post.id, userId }
    });
  };

  const user = users[userId];
  if (!user || !authUser) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        {/* Header with navigation */}
        <View style={styles.header}>
          {headerLeft ?? <View style={{ width: 40 }} />}
          {headerRight}
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Image 
            source={{ uri: user.avatar_url }} 
            style={styles.avatar}
          />
          <Text style={styles.username}>@{user.username}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatDisplay value={user.following_count} label="Following" />
          <StatDisplay value={user.followers_count} label="Followers" />
          <StatDisplay value={user.posts_count} label="Posts" />
        </View>

        {/* Action Button */}
        <Pressable 
          style={styles.actionButton}
          onPress={() => isAuthUser ? console.log('Edit profile') : toggleFollow(authUser?.uid, userId)}
        >
          <Text style={styles.actionButtonText}>
            {isAuthUser ? 'Edit Profile' : (isFollowing(userId) ? 'Unfollow' : 'Follow')}
          </Text>
        </Pressable>

        {/* Bio */}
        <Text style={styles.bio}>{user.bio}</Text>

        {/* Posts Grid */}
        <View style={styles.gridContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : (
            userPosts.map((post) => (
              <Pressable 
                key={post.id} 
                style={styles.gridItem}
                onPress={() => handlePostPress(post)}
              >
                {thumbnails[post.id] ? (
                  <Image 
                    source={{ uri: thumbnails[post.id] }}
                    style={styles.thumbnail}
                  />
                ) : (
                  <View style={styles.placeholderVideo} />
                )}
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const GRID_SPACING = 1;
const GRID_ITEMS_PER_ROW = 3;
const GRID_ITEM_WIDTH = (width - GRID_SPACING * (GRID_ITEMS_PER_ROW + 1)) / GRID_ITEMS_PER_ROW;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  profileInfo: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 30,
    paddingBottom: 20,
    marginBottom: 20,
  },
  statContainer: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  bio: {
    paddingHorizontal: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: GRID_SPACING,
  },
  gridItem: {
    width: GRID_ITEM_WIDTH,
    height: GRID_ITEM_WIDTH * 1.5,
    padding: GRID_SPACING,
  },
  placeholderVideo: {
    flex: 1,
    // backgroundColor: '#2a2a2a',
    borderRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: GRID_ITEM_WIDTH * 2,
    width: '100%',
  },
  thumbnail: {
    flex: 1,
    borderRadius: 4,
  },
  actionButton: {
    backgroundColor: '#333',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 