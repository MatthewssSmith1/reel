import { useLocalSearchParams, router } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Profile } from '@/components/Profile';

export default function UserProfileModal() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  if (!userId) return null;
  
  const BackButton = (
    <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
      <Ionicons name="chevron-back" size={24} color="#fff" />
    </Pressable>
  );
  
  return <Profile userId={userId} headerLeft={BackButton} />;
} 