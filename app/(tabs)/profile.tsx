import { StyleSheet, Pressable, Image, ScrollView, Dimensions } from 'react-native';
import { User as FirebaseUser } from '@/lib/firebase';
import { ThemedText as Text } from '@/components/ThemedText';
import { ThemedView as View } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { signOut, user } = useAuth();
  const placeholderUser: FirebaseUser = {
    uid: user?.uid || '',
    username: 'paul_miller',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/png?seed=paul_miller',
    bio: 'Welcome to my profile! 📱✨ #MobileDev',
    created_at: new Date() as any,
    followers_count: 1234,
    following_count: 567,
    posts_count: 42
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const StatDisplay = ({ value, label }: { value: number; label: string }) => (
    <View style={styles.statContainer}>
      <Text style={styles.statValue}>{value.toLocaleString()}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        {/* Header with logout */}
        <View style={styles.header}>
          <View style={{ flex: 1 }} />
          <Pressable onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="menu-outline" size={24} color="#fff" />
          </Pressable>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Image 
            source={{ uri: placeholderUser.avatar_url }} 
            style={styles.avatar}
          />
          <Text style={styles.username}>@{placeholderUser.username}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatDisplay value={placeholderUser.following_count} label="Following" />
          <StatDisplay value={placeholderUser.followers_count} label="Followers" />
          <StatDisplay value={placeholderUser.posts_count} label="Posts" />
        </View>

        {/* Bio */}
        <Text style={styles.bio}>{placeholderUser.bio}</Text>

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
    justifyContent: 'flex-end',
    padding: 16,
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