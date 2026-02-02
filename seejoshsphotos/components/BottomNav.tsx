'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid3x3, Search, BookOpen } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/collections', label: 'Collections', icon: Grid3x3 },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/guest-book', label: 'Guest Book', icon: BookOpen },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black-base/95 backdrop-blur-md border-t border-silver/10 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname?.startsWith(href + '/');
          
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 h-full interactive focusable ${
                isActive ? 'text-gold' : 'text-silver'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
