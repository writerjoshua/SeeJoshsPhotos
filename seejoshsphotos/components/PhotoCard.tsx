'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, Bookmark, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { Photo, EmojiAppreciation } from '@/types';
import { getCloudinaryUrl, getBlurDataUrl } from '@/lib/cloudinary';

interface PhotoCardProps {
  photo: Photo;
  userId: string | null;
  onAppreciate: (photoId: string, emoji: EmojiAppreciation) => void;
  onSave: (photoId: string) => void;
  onComment: (photoId: string) => void;
}

const EMOJI_OPTIONS: EmojiAppreciation[] = ['❤️', '🔥', '✨', '💜', '🌹', '👁️'];

export default function PhotoCard({
  photo,
  userId,
  onAppreciate,
  onSave,
  onComment,
}: PhotoCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  
  const isAppreciated = userId ? photo.appreciations.userIds.includes(userId) : false;
  const isSaved = userId ? photo.saves.userIds.includes(userId) : false;

  const handleEmojiSelect = (emoji: EmojiAppreciation) => {
    onAppreciate(photo.id, emoji);
    setShowEmojiMenu(false);
  };

  return (
    <article className="relative w-full min-h-screen snap-start flex flex-col">
      {/* Full-bleed image */}
      <div className="relative w-full h-[70vh] md:h-[80vh]">
        <Image
          src={getCloudinaryUrl(photo.cloudinaryId, { 
            width: 1200, 
            quality: 'auto',
            format: 'auto' 
          })}
          alt={photo.title}
          fill
          className="object-cover"
          placeholder="blur"
          blurDataURL={getBlurDataUrl(photo.cloudinaryId)}
          sizes="100vw"
          priority
        />
        
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black-base via-black-base/50 to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-24 md:pb-8">
        {/* Title */}
        <h2 className="text-heading text-gold mb-2">
          {photo.title}
        </h2>

        {/* Shot summary (expandable) */}
        <div className="mb-4">
          <p className={`text-body text-offwhite ${expanded ? '' : 'line-clamp-2'}`}>
            {photo.description}
          </p>
          {photo.description.length > 120 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-sm text-gold mt-1 interactive focusable"
            >
              {expanded ? (
                <>
                  <span>Show less</span>
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Show more</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Tags & Collection */}
        <div className="flex flex-wrap gap-2 mb-4">
          {photo.tags.slice(0, 5).map(tag => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded bg-silver/10 text-silver border border-silver/20"
            >
              #{tag}
            </span>
          ))}
          <span className="px-2 py-1 text-xs rounded bg-gold/10 text-gold border border-gold/30">
            {photo.collectionId}
          </span>
        </div>

        {/* Engagement actions */}
        <div className="flex items-center gap-4">
          {/* Appreciation with emoji menu */}
          <div className="relative">
            <button
              onClick={() => userId ? setShowEmojiMenu(!showEmojiMenu) : onAppreciate(photo.id, '❤️')}
              className={`interactive focusable p-2 rounded-full ${
                isAppreciated ? 'text-gold bg-gold/10' : 'text-silver'
              }`}
              aria-label="Appreciate photo"
            >
              <Heart className={`w-6 h-6 ${isAppreciated ? 'fill-current' : ''}`} />
            </button>
            
            {showEmojiMenu && (
              <div className="absolute bottom-full mb-2 left-0 flex gap-2 p-2 rounded-lg bg-black-base/95 backdrop-blur-md border border-gold/30">
                {EMOJI_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="text-2xl hover:scale-110 transition-transform focusable"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Save */}
          <button
            onClick={() => onSave(photo.id)}
            className={`interactive focusable p-2 rounded-full ${
              isSaved ? 'text-gold bg-gold/10' : 'text-silver'
            }`}
            aria-label="Save photo"
          >
            <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          {/* Comment */}
          <button
            onClick={() => onComment(photo.id)}
            className="interactive focusable p-2 rounded-full text-silver"
            aria-label="Comment in guest book"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>
      </div>
    </article>
  );
}
