import React, { useEffect } from 'react';
import { useCommentStore } from '@/lib/commentStore';
import { useColorScheme } from '@/hooks/useColorScheme';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useUserStore } from '@/lib/userStore';
import { useLikeStore } from '@/lib/likeStore';
import { usePostStore } from '@/lib/postStore';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { HapticTab } from '@/components/HapticTab';
import { Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isMessagesOpen } = useCommentStore();
  const { loadUsers } = useUserStore();
  const { loadLikes } = useLikeStore();
  const { loadPosts } = usePostStore();

  useEffect(() => {
    loadUsers();
    loadLikes();
    loadPosts();
  }, []); 

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            display: isMessagesOpen ? 'none' : 'flex',
          },
          default: {
            display: isMessagesOpen ? 'none' : 'flex',
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
