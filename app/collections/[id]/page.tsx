'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getCollection, getPhotosByCollection, addAppreciation, savePhoto } from '@/lib/firestore';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Feed from '@/components/Feed';
import type { Collection, Photo, EmojiAppreciation } from '@/types';

export default function CollectionPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadCollectionData = async () => {
      try {
        const [collectionData, collectionPhotos] = await Promise.all([
          getCollection(collectionId),
          getPhotosByCollection(collectionId),
        ]);
        
        setCollection(collectionData);
        setPhotos(collectionPhotos);
      } catch (error) {
        console.error('Error loading collection:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCollectionData();
  }, [collectionId]);

  const handleAppreciate = async (photoId: string, emoji: EmojiAppreciation) => {
    if (!user) {
      router.push('/auth?action=appreciate');
      return;
    }

    try {
      await addAppreciation(photoId, user.uid);
      setPhotos(prev =>
        prev.map(p =>
          p.id === photoId
            ? { ...p, appreciations: { ...p.appreciations, userIds: [...p.appreciations.userIds, user.uid] } }
            : p
        )
      );
    } catch (error) {
      console.error('Error appreciating photo:', error);
    }
  };

  const handleSave = async (photoId: string) => {
    if (!user) {
      router.push('/auth?action=save');
      return;
    }

    try {
      await savePhoto(photoId, user.uid);
      setPhotos(prev =>
        prev.map(p =>
          p.id === photoId
            ? { ...p, saves: { ...p.saves, userIds: [...p.saves.userIds, user.uid] } }
            : p
        )
      );
    } catch (error) {
      console.error('Error saving photo:', error);
    }
  };

  const handleComment = (photoId: string) => {
    router.push(`/guest-book?photoRef=${photoId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black-base">
        <div className="text-gold text-2xl">Loading collection...</div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black-base">
        <div className="text-silver text-2xl mb-4">Collection not found</div>
        <button
          onClick={() => router.push('/collections')}
          className="px-6 py-2 bg-gold text-black-base rounded-lg interactive focusable"
        >
          Browse Collections
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black-base">
      <Header user={user} />
      
      {/* Collection header */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-black-base/95 backdrop-blur-md border-b border-silver/10 px-6 py-4">
        <button
          onClick={() => router.push('/collections')}
          className="text-silver text-sm mb-2 interactive focusable"
        >
          ← Back to Collections
        </button>
        <h1 className="text-heading text-gold">{collection.title}</h1>
        <p className="text-caption text-silver">{collection.description}</p>
      </div>

      <div className="pt-32">
        {photos.length === 0 ? (
          <div className="flex items-center justify-center h-[60vh]">
            <p className="text-silver text-body">No photos in this collection yet.</p>
          </div>
        ) : (
          <Feed
            photos={photos}
            userId={user?.uid || null}
            onAppreciate={handleAppreciate}
            onSave={handleSave}
            onComment={handleComment}
          />
        )}
      </div>

      <BottomNav />
    </div>
  );
}
