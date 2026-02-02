'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Feed from '@/components/Feed';
import FeedTabs from '@/components/FeedTabs';
import type { Photo, EmojiAppreciation, FeedTab } from '@/types';
import { getForYouFeed, addAppreciation, savePhoto } from '@/lib/firestore';

const FEED_TABS: FeedTab[] = [
  { id: 'for-you', label: 'For You', active: true },
  { id: 'roses', label: 'Roses', active: false },
  { id: 'garden-home', label: 'Garden & Home', active: false },
  { id: 'miami', label: 'Miami', active: false },
  { id: 'chicago', label: 'Chicago', active: false },
  { id: 'san-diego', label: 'San Diego', active: false },
  { id: 'montana', label: 'Montana', active: false },
  { id: 'new-mexico', label: 'New Mexico', active: false },
];

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBio, setShowBio] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeTab, setActiveTab] = useState<string>('for-you');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      
      // Show bio to new visitors (not logged in)
      if (!firebaseUser) {
        const hasVisited = localStorage.getItem('hasVisited');
        if (!hasVisited) {
          setShowBio(true);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const feedPhotos = await getForYouFeed();
        setPhotos(feedPhotos);
      } catch (error) {
        console.error('Error loading photos:', error);
      }
    };

    loadPhotos();
  }, [activeTab]);

  const handleAppreciate = async (photoId: string, emoji: EmojiAppreciation) => {
    if (!user) {
      router.push('/auth?action=appreciate');
      return;
    }

    try {
      await addAppreciation(photoId, user.uid);
      // Optimistic update
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

  const handleBioClose = () => {
    localStorage.setItem('hasVisited', 'true');
    setShowBio(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black-base">
        <div className="text-gold text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black-base">
      <Header user={user} />
      
      {showBio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black-base/95 backdrop-blur-md p-6">
          <div className="max-w-2xl space-y-6 text-center">
            <div className="text-6xl mb-4">👁️</div>
            <h1 className="text-display text-gold">SeeJoshsPhotos</h1>
            <p className="text-subheading text-offwhite leading-relaxed">
              I'm Josh, a legally blind photographer. I choose to see deeply—not despite my vision, but because of it.
            </p>
            <p className="text-body text-silver">
              My work explores sensual roses, intimate gardens, and occasional travels. 
              Each photograph is an act of presence, vulnerability, and defiance. 
              An investment in beauty and meaning.
            </p>
            <button
              onClick={handleBioClose}
              className="px-8 py-3 bg-gold text-black-base rounded-lg font-medium interactive focusable"
            >
              Browse Gallery
            </button>
          </div>
        </div>
      )}

      <FeedTabs
        tabs={FEED_TABS}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      />

      <Feed
        photos={photos}
        userId={user?.uid || null}
        onAppreciate={handleAppreciate}
        onSave={handleSave}
        onComment={handleComment}
      />

      <BottomNav />
    </div>
  );
}
