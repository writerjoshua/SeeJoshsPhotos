'use client';

import { useRef, useEffect } from 'react';
import type { FeedTab } from '@/types';

interface FeedTabsProps {
  tabs: FeedTab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
}

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

export default function FeedTabs({ tabs = FEED_TABS, activeTabId, onTabChange }: FeedTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to active tab
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const activeButton = activeRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      
      const offset = buttonRect.left - containerRect.left - (containerRect.width / 2) + (buttonRect.width / 2);
      
      container.scrollTo({
        left: container.scrollLeft + offset,
        behavior: 'smooth',
      });
    }
  }, [activeTabId]);

  return (
    <div className="sticky top-16 z-40 bg-black-base/95 backdrop-blur-md border-b border-silver/10">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide px-4 gap-2 py-3"
      >
        {tabs.map(tab => {
          const isActive = tab.id === activeTabId;
          
          return (
            <button
              key={tab.id}
              ref={isActive ? activeRef : null}
              onClick={() => onTabChange(tab.id)}
              className={`
                px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium
                transition-all duration-200 focusable
                ${isActive 
                  ? 'bg-gold text-black-base' 
                  : 'bg-black-base border border-silver/30 text-silver hover:border-gold/50'
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
