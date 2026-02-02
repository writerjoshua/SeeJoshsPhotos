'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '@/lib/firebase';
import { createUser } from '@/lib/firestore';
import { Github } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const [loading, setLoading] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (provider: typeof googleProvider | typeof githubProvider, providerName: 'google' | 'github') => {
    setLoading(providerName);
    setError(null);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create user document if new
      await createUser(user.uid, {
        id: user.uid,
        authProvider: providerName,
        displayName: user.displayName || 'Anonymous',
        avatarUrl: user.photoURL || undefined,
        publicProfile: true,
        createdAt: new Date(),
        stats: {
          appreciationsGiven: 0,
          visits: 0,
          savedPhotos: 0,
        },
      });

      router.push('/');
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const actionText = action === 'appreciate' 
    ? 'Sign in to appreciate photos'
    : action === 'save'
    ? 'Sign in to save photos'
    : action === 'comment'
    ? 'Sign in to comment in the guest book'
    : 'Sign in to continue';

  return (
    <div className="min-h-screen flex items-center justify-center bg-black-base p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="text-6xl mb-4">👁️</div>
        <h1 className="text-display text-gold">Welcome</h1>
        <p className="text-body text-silver">{actionText}</p>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => handleAuth(googleProvider, 'google')}
            disabled={loading !== null}
            className="w-full px-6 py-3 bg-white text-black-base rounded-lg font-medium flex items-center justify-center gap-3 interactive focusable disabled:opacity-50"
          >
            {loading === 'google' ? (
              <span>Signing in...</span>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleAuth(githubProvider, 'github')}
            disabled={loading !== null}
            className="w-full px-6 py-3 bg-silver text-black-base rounded-lg font-medium flex items-center justify-center gap-3 interactive focusable disabled:opacity-50"
          >
            {loading === 'github' ? (
              <span>Signing in...</span>
            ) : (
              <>
                <Github className="w-6 h-6" />
                <span>Continue with GitHub</span>
              </>
            )}
          </button>
        </div>

        <button
          onClick={() => router.back()}
          className="text-silver text-sm interactive focusable"
        >
          Go back
        </button>
      </div>
    </div>
  );
}
