'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUser } from '@/lib/firestore';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import type { User } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth');
        return;
      }

      setFirebaseUser(user);
      
      try {
        const data = await getUser(user.uid);
        setUserData(data);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black-base">
        <div className="text-gold text-2xl">Loading profile...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-screen bg-black-base">
        <div className="text-silver">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black-base pb-24 md:pb-8">
      <Header user={firebaseUser} />
      
      <main className="pt-24 px-6 max-w-2xl mx-auto">
        <div className="text-center mb-12">
          {firebaseUser.photoURL ? (
            <img
              src={firebaseUser.photoURL}
              alt={userData.displayName}
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gold/50"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-purple-deep border-4 border-gold/50 flex items-center justify-center mx-auto mb-4">
              <span className="text-gold text-3xl">
                {userData.displayName.charAt(0)}
              </span>
            </div>
          )}
          
          <h1 className="text-display text-gold mb-2">{userData.displayName}</h1>
          {userData.bio && (
            <p className="text-body text-silver">{userData.bio}</p>
          )}
          <p className="text-caption text-silver/70 mt-2">
            Member since {new Date(userData.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="card p-6 text-center">
            <div className="text-3xl text-gold font-bold mb-2">
              {userData.stats.visits}
            </div>
            <div className="text-sm text-silver">Visits</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl text-gold font-bold mb-2">
              {userData.stats.appreciationsGiven}
            </div>
            <div className="text-sm text-silver">Appreciations</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl text-gold font-bold mb-2">
              {userData.stats.savedPhotos}
            </div>
            <div className="text-sm text-silver">Saved</div>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <h2 className="text-subheading text-silver mb-4">Settings</h2>
          
          <div className="card p-6">
            <label className="flex items-center justify-between">
              <span className="text-body text-offwhite">Public Profile</span>
              <input
                type="checkbox"
                checked={userData.publicProfile}
                className="w-6 h-6 rounded bg-black-base border-2 border-gold/30 text-gold focus:ring-2 focus:ring-gold focusable"
                readOnly
              />
            </label>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full px-6 py-3 bg-silver/10 text-silver rounded-lg font-medium border border-silver/30 interactive focusable"
          >
            Sign Out
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
