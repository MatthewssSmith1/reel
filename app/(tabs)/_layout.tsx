import { usePostLikeStore, useCommentLikeStore } from '@/lib/likeStore';
import React, { useEffect } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFollowStore } from '@/lib/followStore';
import { useRecipeStore } from '@/lib/recipeStore';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useUserStore } from '@/lib/userStore';
import { usePostStore } from '@/lib/postStore';
import { HapticTab } from '@/components/HapticTab';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/lib/colors';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { loadUsers } = useUserStore();
  const { loadLikes: loadPostLikes } = usePostLikeStore();
  const { loadLikes: loadCommentLikes } = useCommentLikeStore();
  const { loadFollows } = useFollowStore();
  const { loadRecipes } = useRecipeStore();
  const { loadPosts } = usePostStore();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    loadUsers(user.uid);
    loadPostLikes();
    loadCommentLikes();
    loadPosts();
    loadRecipes(user.uid);
    loadFollows(user.uid);
  }, [user?.uid]); 

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="search" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
