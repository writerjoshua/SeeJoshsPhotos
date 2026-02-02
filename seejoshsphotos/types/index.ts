// Domain types for SeeJoshsPhotos

export type AuthProvider = 'google' | 'github';

export interface User {
  id: string;
  authProvider: AuthProvider;
  createdAt: Date;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  publicProfile: boolean;
  stats: {
    appreciationsGiven: number;
    visits: number;
    savedPhotos: number;
  };
}

export type Mood = 'sensual' | 'intimate' | 'joyful' | 'contemplative' | 'defiant' | 'tender';
export type ColorTag = 'pink' | 'red' | 'white' | 'yellow' | 'orange' | 'purple' | 'mixed';
export type RoseType = 'garden' | 'wild' | 'climbing' | 'miniature' | 'hybrid';
export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export interface Photo {
  id: string;
  title: string;
  description: string;
  shotDate: Date;
  tags: string[];
  colorTags?: ColorTag[];
  roseType?: RoseType;
  mood?: Mood[];
  season?: Season;
  location: string;
  collectionId: string;
  cloudinaryId: string;
  appreciations: {
    count: number;
    userIds: string[];
  };
  saves: {
    count: number;
    userIds: string[];
  };
  createdAt: Date;
}

export type CollectionId = 
  | 'roses'
  | 'garden-home'
  | 'miami'
  | 'chicago'
  | 'san-diego'
  | 'montana'
  | 'new-mexico';

export interface Collection {
  id: CollectionId;
  title: string;
  theme: string;
  description: string;
  photoIds: string[];
  coverPhotoId?: string;
  order: number;
}

export type EmojiAppreciation = '❤️' | '🔥' | '✨' | '💜' | '🌹' | '👁️';

export interface GuestBookPost {
  id: string;
  userId: string;
  message: string;
  createdAt: Date;
  collectionRef?: string;
  photoRef?: string;
  moderated: boolean;
}

export interface FeedTab {
  id: 'for-you' | CollectionId;
  label: string;
  active: boolean;
}

export interface PhotoEngagement {
  userId: string;
  photoId: string;
  appreciation?: EmojiAppreciation;
  saved: boolean;
  viewedAt: Date;
}

export type NotificationType = 'new-gallery' | 'weekly-highlights' | 'guest-book' | 'monthly-digest';

export interface PushNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  photoId?: string;
  collectionId?: string;
  createdAt: Date;
}
