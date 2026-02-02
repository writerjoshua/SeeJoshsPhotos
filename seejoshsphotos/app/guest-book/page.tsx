'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getGuestBookPosts, createGuestBookPost, getUser } from '@/lib/firestore';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import type { GuestBookPost } from '@/types';

interface EnrichedPost extends GuestBookPost {
  userName?: string;
  userAvatar?: string;
}

export default function GuestBookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const photoRef = searchParams.get('photoRef');
  
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<EnrichedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const guestBookPosts = await getGuestBookPosts();
        
        // Enrich posts with user info
        const enriched = await Promise.all(
          guestBookPosts.map(async post => {
            const userData = await getUser(post.userId);
            return {
              ...post,
              userName: userData?.displayName,
              userAvatar: userData?.avatarUrl,
            };
          })
        );
        
        setPosts(enriched);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/auth?action=comment');
      return;
    }

    if (!message.trim()) return;

    setSubmitting(true);
    try {
      await createGuestBookPost(user.uid, message, photoRef || undefined);
      
      // Optimistic update
      const newPost: EnrichedPost = {
        id: Date.now().toString(),
        userId: user.uid,
        message,
        createdAt: new Date(),
        photoRef: photoRef || undefined,
        moderated: false,
        userName: user.displayName,
        userAvatar: user.photoURL,
      };
      
      setPosts([newPost, ...posts]);
      setMessage('');
    } catch (error) {
      console.error('Error posting message:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black-base pb-24 md:pb-8">
      <Header user={user} />
      
      <main className="pt-24 px-6 max-w-3xl mx-auto">
        <h1 className="text-display text-gold mb-4">Guest Book</h1>
        <p className="text-body text-silver mb-8">
          Share your thoughts, reflections, and experiences. All messages are moderated by Josh.
        </p>

        {/* Post form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={user ? "Share your thoughts..." : "Sign in to leave a message"}
            disabled={!user || submitting}
            className="w-full p-4 rounded-lg bg-black-base border border-silver/30 text-offwhite placeholder:text-silver/50 focusable resize-none"
            rows={4}
          />
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={!user || !message.trim() || submitting}
              className="px-6 py-2 bg-gold text-black-base rounded-lg font-medium interactive focusable disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post Message'}
            </button>
          </div>
        </form>

        {/* Posts list */}
        {loading ? (
          <div className="text-center text-silver">Loading messages...</div>
        ) : posts.length === 0 ? (
          <div className="text-center text-silver">No messages yet. Be the first!</div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <article key={post.id} className="card p-6">
                <div className="flex items-start gap-4">
                  {post.userAvatar ? (
                    <img
                      src={post.userAvatar}
                      alt={post.userName || 'User'}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-deep flex items-center justify-center">
                      <span className="text-gold text-sm">
                        {post.userName?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-gold font-medium">
                        {post.userName || 'Anonymous'}
                      </span>
                      <span className="text-xs text-silver">
                        {post.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-body text-offwhite">{post.message}</p>
                    {post.photoRef && (
                      <div className="mt-2 text-xs text-gold/70">
                        Referenced a photo
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
