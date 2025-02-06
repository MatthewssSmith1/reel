import { ref, getDownloadURL } from 'firebase/storage';
import { useState, useEffect } from 'react';
import { Post, storage } from '@/lib/firebase';

export function useThumbnails(posts: Post[]) {
  const [uris, setUris] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadThumbnails = async () => {
      const uris: Record<string, string> = {};
      await Promise.all(
        posts.map(async (post) => {
          try {
            const thumbnailRef = ref(storage, `thumbnails/${post.video_id}.jpg`);
            const url = await getDownloadURL(thumbnailRef);
            uris[post.id] = url;
          } catch (error) {
            console.error('Error loading thumbnail:', error);
          }
        })
      );
      setUris(uris);
    };

    if (posts.length > 0) loadThumbnails();
  }, [posts]);

  return uris;
}

export const useThumbnail = (post: Post) => 
  useThumbnails([post])[post.id] ?? null;