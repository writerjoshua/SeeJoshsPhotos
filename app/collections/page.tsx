'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getAllCollections } from '@/lib/firestore';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import type { Collection } from '@/types';
import { cloudinaryPresets } from '@/lib/cloudinary';

export default function CollectionsPage() {
  const [user, setUser] = useState<any>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const allCollections = await getAllCollections();
        setCollections(allCollections);
      } catch (error) {
        console.error('Error loading collections:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCollections();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black-base">
        <div className="text-gold text-2xl">Loading collections...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black-base pb-24 md:pb-8">
      <Header user={user} />
      
      <main className="pt-24 px-6">
        <h1 className="text-display text-gold mb-8">Collections</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map(collection => (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}`}
              className="group relative aspect-[4/5] rounded-lg overflow-hidden interactive focusable"
            >
              {collection.coverPhotoId && (
                <Image
                  src={cloudinaryPresets.collectionCover(collection.coverPhotoId)}
                  alt={collection.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black-base via-black-base/50 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h2 className="text-heading text-gold mb-2">{collection.title}</h2>
                <p className="text-caption text-silver">{collection.description}</p>
                <p className="text-xs text-gold/70 mt-2">{collection.photoIds.length} photos</p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
