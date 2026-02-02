'use client';

import Link from 'next/link';
import { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  user: FirebaseUser | null;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black-base/95 backdrop-blur-md border-b border-silver/10">
      <div className="flex items-center justify-between px-4 md:px-6 h-16">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center space-x-2 interactive focusable"
        >
          <div className="text-gold text-2xl">👁️</div>
          <span className="text-heading text-gold hidden md:inline">
            @SeeJoshsPhotos
          </span>
          <span className="text-heading text-gold md:hidden">
            @SJP
          </span>
        </Link>

        {/* User Profile */}
        <Link
          href="/profile"
          className="interactive focusable"
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-10 h-10 rounded-full border-2 border-gold/50"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-purple-deep border-2 border-gold/50 flex items-center justify-center">
              <span className="text-gold text-sm">
                {user?.displayName?.charAt(0) || '?'}
              </span>
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}
