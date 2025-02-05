import { useLocalSearchParams } from 'expo-router';
import { Profile } from '@/components/Profile';

export default function UserProfileModal() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  if (!userId) return null;
  
  return <Profile userId={userId} showBackButton />;
} 