import { StyleSheet, Pressable, Image, ScrollView, Dimensions } from 'react-native';
import { ThemedText as Text } from '@/components/ThemedText';
import { ThemedView as View } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/lib/userStore';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

type ProfileProps = {
  userId: string;
  showBackButton?: boolean;
};

const StatDisplay = ({ value, label }: { value: number; label: string }) => (
  <View style={styles.statContainer}>
    <Text style={styles.statValue}>{value.toLocaleString()}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export function Profile({ userId, showBackButton = false }: ProfileProps) {
  const { signOut } = useAuth();
  const { users } = useUserStore();
  const user = users[userId];

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        {/* Header with navigation */}
        <View style={styles.header}>
          {showBackButton ? (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </Pressable>
          ) : (
            <View style={{ flex: 1 }} />
          )}
          <Pressable onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="menu-outline" size={24} color="#fff" />
          </Pressable>
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

        {/* Bio */}
        <Text style={styles.bio}>{user.bio}</Text>

        {/* Placeholder Grid */}
        <View style={styles.gridContainer}>
          {Array(6).fill(0).map((_, i) => (
            <View key={i} style={styles.gridItem}>
              <View style={styles.placeholderVideo} />
            </View>
          ))}
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
  backButton: {
    padding: 8,
  },
  logoutButton: {
    padding: 8,
  },
  profileInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
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
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
  },
}); 