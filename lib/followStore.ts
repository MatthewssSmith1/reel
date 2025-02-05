import { collection, deleteDoc, doc, getDocs, increment, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { useUserStore } from './userStore';
import { db, Follow } from '@/lib/firebase';
import { create } from 'zustand';

type FollowStore = {
  followedUsers: Set<string>;
  isInitialized: boolean;
  loadFollows: (userId: string) => Promise<void>;
  isFollowing: (targetUserId: string) => boolean;
  toggleFollow: (authUserId: string, targetUserId: string) => Promise<void>;
};

export const useFollowStore = create<FollowStore>((set, get) => ({
  followedUsers: new Set(),
  isInitialized: false,

  loadFollows: async (userId: string) => {
    if (!userId) {
      set({ followedUsers: new Set(), isInitialized: false });
      return;
    }

    try {
      const followsRef = collection(db, 'follows');
      const q = query(followsRef, where('follower_id', '==', userId));
      const snapshot = await getDocs(q);
      const followedUsers = new Set<string>();
      
      snapshot.forEach((doc) => {
        const follow = doc.data() as Follow;
        followedUsers.add(follow.following_id);
      });
      
      set({ followedUsers, isInitialized: true });
    } catch (error) {
      console.error('Error loading follows:', error);
      set({ followedUsers: new Set(), isInitialized: false });
    }
  },

  isFollowing: (targetUserId: string) => get().followedUsers.has(targetUserId),

  toggleFollow: async (authUserId: string, targetUserId: string) => {
    if (!authUserId) return;

    const { followedUsers } = get();
    const isCurrentlyFollowing = followedUsers.has(targetUserId);
    const newFollowedUsers = new Set(followedUsers);

    // Optimistic update
    if (isCurrentlyFollowing) {
      newFollowedUsers.delete(targetUserId);
    } else {
      newFollowedUsers.add(targetUserId);
    }
    set({ followedUsers: newFollowedUsers });

    try {
      const followId = `${authUserId}_${targetUserId}`;
      const followRef = doc(db, 'follows', followId);
      const followerRef = doc(db, 'users', authUserId);
      const followingRef = doc(db, 'users', targetUserId);

      if (isCurrentlyFollowing) {
        await deleteDoc(followRef);
        await updateDoc(followerRef, {
          following_count: increment(-1)
        });
        await updateDoc(followingRef, {
          followers_count: increment(-1)
        });
        useUserStore.getState().updateFollowCounts(authUserId, targetUserId, false);
      } else {
        await setDoc(followRef, {
          id: followId,
          follower_id: authUserId,
          following_id: targetUserId,
          created_at: new Date()
        });
        await updateDoc(followerRef, {
          following_count: increment(1)
        });
        await updateDoc(followingRef, {
          followers_count: increment(1)
        });
        useUserStore.getState().updateFollowCounts(authUserId, targetUserId, true);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      // Revert optimistic update on error
      if (isCurrentlyFollowing) {
        newFollowedUsers.add(targetUserId);
      } else {
        newFollowedUsers.delete(targetUserId);
      }
      set({ followedUsers: newFollowedUsers });
    }
  },
})); 