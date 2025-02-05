import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/components/Profile';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  if (!user?.uid) return null;
  
  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const LogoutButton = (
    <Pressable onPress={handleLogout} style={{ padding: 8 }}>
      <Ionicons name="menu-outline" size={24} color="#fff" />
    </Pressable>
  );
  
  return <Profile userId={user.uid} headerRight={LogoutButton} />;
} 