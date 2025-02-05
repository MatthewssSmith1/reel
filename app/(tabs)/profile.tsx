import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/components/Profile';

export default function ProfileScreen() {
  const { user } = useAuth();
  if (!user?.uid) return null;
  
  return <Profile userId={user.uid} />;
} 