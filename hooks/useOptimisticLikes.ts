import { usePostLikeStore, useCommentLikeStore, ItemType } from '@/lib/likeStore';
import { useEffect, useState } from 'react';

export function useOptimisticLikes(itemId: string, totalLikesCount: number, type: ItemType) {
  const store = type === 'post' ? usePostLikeStore() : useCommentLikeStore();
  const { isLiked, toggleLike } = store;
  const [otherUsersLikeCount, setOtherUsersLikeCount] = useState(0);
  const liked = isLiked(itemId);

  // compute other users' likes once on mount
  useEffect(() => {
    setOtherUsersLikeCount(totalLikesCount - (liked ? 1 : 0));
  }, []);

  return {
    liked,
    optimisticCount: otherUsersLikeCount + (liked ? 1 : 0),
    toggleLike: () => toggleLike(itemId)
  };
} 