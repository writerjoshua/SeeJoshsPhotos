'use client';

import { useEffect, useRef } from 'react';
import PhotoCard from './PhotoCard';
import type { Photo, EmojiAppreciation } from '@/types';

interface FeedProps {
  photos: Photo[];
  userId: string | null;
  onAppreciate: (photoId: string, emoji: EmojiAppreciation) => void;
  onSave: (photoId: string) => void;
  onComment: (photoId: string) => void;
}

export default function Feed({
  photos,
  userId,
  onAppreciate,
  onSave,
  onComment,
}: FeedProps) {
  const feedRef = useRef<HTMLDivElement>(null);

  // Mobile: vertical snap scroll
  // Desktop: will be different (magazine layout)
  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;

    // Prevent scroll chaining on mobile
    const preventOverscroll = (e: TouchEvent) => {
      const scrollTop = feed.scrollTop;
      const scrollHeight = feed.scrollHeight;
      const clientHeight = feed.clientHeight;

      if (scrollTop === 0 && e.touches[0].clientY > 0) {
        e.preventDefault();
      }

      if (scrollTop + clientHeight >= scrollHeight && e.touches[0].clientY < 0) {
        e.preventDefault();
      }
    };

    feed.addEventListener('touchmove', preventOverscroll, { passive: false });

    return () => {
      feed.removeEventListener('touchmove', preventOverscroll);
    };
  }, []);

  if (photos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-silver text-body">No photos yet. Check back soon.</p>
      </div>
    );
  }

  return (
    <div
      ref={feedRef}
      className="h-screen overflow-y-auto snap-y snap-mandatory scrollbar-hide md:snap-none"
    >
      {photos.map(photo => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          userId={userId}
          onAppreciate={onAppreciate}
          onSave={onSave}
          onComment={onComment}
        />
      ))}
    </div>
  );
}
