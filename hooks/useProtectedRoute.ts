import { useSegments, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export function useProtectedRoute() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      const inAuthGroup = segments[0] === '(auth)';
      
      if (!user && !inAuthGroup) router.replace('/(auth)/login');
      else if (user && inAuthGroup) router.replace('/(tabs)');
    }
  }, [user, segments, isLoading]);

  return { isLoading };
} 