import { StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import { ThemedText as Text } from '@/components/ThemedText';
import { ThemedView as View } from '@/components/ThemedView';
import { useFollowStore } from '@/lib/followStore';
import { ThumbnailGrid } from '@/components/ThumbnailGrid';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/lib/userStore';
import { usePostStore } from '@/lib/postStore';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { usePostLikeStore } from '@/lib/likeStore';

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
  const isAuthUser = authUser?.uid === userId;

  const { posts } = usePostStore();
  const { isFollowing, toggleFollow } = useFollowStore();
  const { likedItems } = usePostLikeStore();
  const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts');

  const userPosts = posts.filter(post => post.author_id === userId);
  const likedPosts = posts.filter(post => likedItems.get(post.id));
  const displayedPosts = activeTab === 'posts' ? userPosts : likedPosts;

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
          onPress={() => isAuthUser 
            ? router.push('/(modals)/edit-profile')
            : toggleFollow(authUser?.uid, userId)
          }
        >
          <Text style={styles.actionButtonText}>
            {isAuthUser ? 'Edit Profile' : (isFollowing(userId) ? 'Unfollow' : 'Follow')}
          </Text>
        </Pressable>

        {/* Bio */}
        <Text style={styles.bio}>{user.bio}</Text>

        {/* Tab Bar - only shown on auth user's profile */}
        {isAuthUser && (
          <View style={styles.tabBar}>
            <Pressable 
              style={[styles.tab, activeTab === 'posts' && styles.activeTab]} 
              onPress={() => setActiveTab('posts')}
            >
              <MaterialIcons 
                name="grid-on" 
                size={24} 
                color={activeTab === 'posts' ? '#fff' : '#aaa'} 
              />
            </Pressable>
            <Pressable 
              style={[styles.tab, activeTab === 'likes' && styles.activeTab]}
              onPress={() => setActiveTab('likes')}
            >
              <MaterialIcons 
                name="favorite" 
                size={24} 
                color={activeTab === 'likes' ? '#fff' : '#aaa'} 
              />
            </Pressable>
          </View>
        )}

        {/* Posts Grid */}
        <ThumbnailGrid 
          posts={isAuthUser ? displayedPosts : userPosts} 
          isScrollable={false}
          onPostPress={(post) => {
            router.push({
              pathname: '/(modals)/post',
              params: { 
                postId: post.id, 
                userId: post.author_id,
                type: isAuthUser && activeTab === 'likes' ? 'liked' : 'posts'
              }
            });
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

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
  tabBar: {
    flexDirection: 'row',
    // borderTopWidth: StyleSheet.hairlineWidth,
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // borderColor: '#ccc',
    marginBottom: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    // borderBottomColor: '#000',
  },
}); 