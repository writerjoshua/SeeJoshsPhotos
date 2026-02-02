'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { searchPhotosByTags } from '@/lib/firestore';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import type { Photo } from '@/types';
import { cloudinaryPresets } from '@/lib/cloudinary';

const POPULAR_TAGS = [
  'pink', 'red', 'white', 'yellow', 'garden', 'wild', 'climbing',
  'sensual', 'intimate', 'joyful', 'spring', 'summer', 'fall', 'winter',
  'beach', 'urban', 'landscape', 'close-up', 'morning', 'evening',
];

export default function SearchPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [results, setResults] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedTags.length > 0) {
      handleSearch();
    } else {
      setResults([]);
    }
  }, [selectedTags]);

  const handleSearch = async () => {
    if (selectedTags.length === 0 && !searchQuery.trim()) return;

    setLoading(true);
    try {
      const searchTags = [...selectedTags];
      if (searchQuery.trim()) {
        searchTags.push(searchQuery.trim().toLowerCase());
      }
      
      const photos = await searchPhotosByTags(searchTags);
      setResults(photos);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-black-base pb-24 md:pb-8">
      <Header user={user} />
      
      <main className="pt-24 px-6">
        <h1 className="text-display text-gold mb-8">Search</h1>

        {/* Search bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by keyword..."
            className="w-full p-4 rounded-lg bg-black-base border border-silver/30 text-offwhite placeholder:text-silver/50 focusable"
          />
        </div>

        {/* Tag cloud */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-subheading text-silver mb-4">Popular Tags</h2>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TAGS.map(tag => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium interactive focusable
                    ${isSelected
                      ? 'bg-gold text-black-base'
                      : 'bg-black-base border border-silver/30 text-silver hover:border-gold/50'
                    }
                  `}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected tags */}
        {selectedTags.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-silver text-sm">Active filters:</span>
              {selectedTags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded bg-gold/10 text-gold border border-gold/30 text-sm"
                >
                  #{tag}
                </span>
              ))}
              <button
                onClick={() => setSelectedTags([])}
                className="text-xs text-silver underline interactive focusable"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="text-center text-silver">Searching...</div>
        ) : results.length === 0 && selectedTags.length > 0 ? (
          <div className="text-center text-silver">No photos found with these tags.</div>
        ) : results.length > 0 ? (
          <div>
            <h2 className="text-subheading text-silver mb-4">
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map(photo => (
                <button
                  key={photo.id}
                  onClick={() => router.push(`/?photoId=${photo.id}`)}
                  className="group relative aspect-square rounded-lg overflow-hidden interactive focusable"
                >
                  <Image
                    src={cloudinaryPresets.feedThumbnail(photo.cloudinaryId)}
                    alt={photo.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black-base/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-sm text-gold font-medium truncate">{photo.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </main>

      <BottomNav />
    </div>
  );
}
