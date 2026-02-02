# SeeJoshsPhotos PWA

Dark, sensual photography portfolio for Josh, a legally blind photographer. Built with Next.js 14, Firebase, and Cloudinary.

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Cloud Messaging)
- **Images**: Cloudinary (optimization, transformations, CDN)
- **Deployment**: Vercel (recommended) or any Node.js host

### Key Features
- PWA with offline support and installability
- Dark mode only design with gold/silver/purple accents
- Vertical snap scroll on mobile (magazine layout on desktop)
- Google/GitHub OAuth authentication
- Real-time photo feeds by collection
- Tag-based search
- Community guest book (moderated)
- Emoji appreciations & saves
- Push notifications for gallery drops

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project
- Cloudinary account

### Setup

1. **Clone and install:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Firebase and Cloudinary credentials.

3. **Firebase setup:**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Google & GitHub providers)
   - Create Firestore database
   - Enable Cloud Messaging
   - Copy config values to `.env.local`

4. **Cloudinary setup:**
   - Create account at https://cloudinary.com
   - Note your cloud name
   - Upload photos to Cloudinary
   - Add cloud name to `.env.local`

5. **Run development server:**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:3000

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read all public profiles
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Photos are public read, admin write only
    match /photos/{photoId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
      
      // Allow users to update their own appreciations/saves
      allow update: if request.auth != null &&
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['appreciations', 'saves']);
    }
    
    // Collections are public read, admin write
    match /collections/{collectionId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Guest book posts
    match /guest_book/{postId} {
      allow read: if resource.data.moderated == true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

## Production Deployment

### Vercel (Recommended)

1. **Deploy to Vercel:**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Configure environment variables** in Vercel dashboard

3. **Enable PWA caching** in `vercel.json`:
   ```json
   {
     "headers": [
       {
         "source": "/sw.js",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, max-age=0, must-revalidate"
           }
         ]
       }
     ]
   }
   ```

### Database Schema Setup

**Collections to create in Firestore:**

1. **collections** (manual setup):
   ```javascript
   {
     id: 'roses',
     title: 'Roses',
     theme: 'Sensual exploration of garden roses',
     description: 'My primary work...',
     photoIds: [],
     coverPhotoId: 'cloudinary_id',
     order: 0
   }
   ```
   
   Create for: roses, garden-home, miami, chicago, san-diego, montana, new-mexico

2. **photos** (add via admin interface or script):
   ```javascript
   {
     id: 'auto',
     title: 'Pink Rose in Morning Light',
     description: 'Shot summary...',
     shotDate: Timestamp,
     tags: ['pink', 'morning', 'garden'],
     colorTags: ['pink'],
     roseType: 'garden',
     mood: ['sensual', 'tender'],
     season: 'spring',
     location: 'Seattle',
     collectionId: 'roses',
     cloudinaryId: 'your_cloudinary_id',
     appreciations: { count: 0, userIds: [] },
     saves: { count: 0, userIds: [] },
     createdAt: Timestamp
   }
   ```

### Image Upload Workflow

1. **Upload to Cloudinary** via their dashboard or API
2. **Note the public_id** for each image
3. **Add photo document** to Firestore with the Cloudinary ID
4. Images are automatically optimized via our Cloudinary helper

### Push Notifications Setup

1. **Generate VAPID keys:**
   ```bash
   npx web-push generate-vapid-keys
   ```

2. **Add to Firebase Cloud Messaging** config

3. **Create Cloud Function** for sending notifications:
   ```javascript
   // functions/src/index.ts
   exports.sendNewGalleryNotification = functions.firestore
     .document('collections/{collectionId}')
     .onUpdate(async (change, context) => {
       // Send FCM notification to all subscribers
     });
   ```

## File Structure

```
seejoshsphotos/
├── app/
│   ├── layout.tsx           # Root layout with PWA config
│   ├── page.tsx             # Homepage with For You feed
│   ├── globals.css          # Global styles + utilities
│   ├── auth/
│   │   └── page.tsx         # OAuth login
│   ├── collections/
│   │   ├── page.tsx         # Collections grid
│   │   └── [id]/page.tsx    # Individual collection feed
│   ├── guest-book/
│   │   └── page.tsx         # Community message board
│   ├── search/
│   │   └── page.tsx         # Tag search
│   └── profile/
│       └── page.tsx         # User profile & settings
├── components/
│   ├── Header.tsx           # Top nav with logo/profile
│   ├── BottomNav.tsx        # Mobile bottom navigation
│   ├── FeedTabs.tsx         # Horizontal scrollable tabs
│   ├── Feed.tsx             # Vertical snap scroll container
│   └── PhotoCard.tsx        # Individual photo with engagement
├── lib/
│   ├── firebase.ts          # Firebase initialization
│   ├── firestore.ts         # Database operations
│   └── cloudinary.ts        # Image optimization
├── types/
│   └── index.ts             # TypeScript types
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── icon-192.png         # App icons
│   └── icon-512.png
└── package.json
```

## Performance Optimizations

### Images
- Cloudinary auto-format (WebP for supported browsers)
- Responsive srcsets for different viewport sizes
- Blur placeholders for instant perceived loading
- Lazy loading below fold

### Code
- Next.js automatic code splitting
- Server components where possible
- Client components only for interactivity
- Tree-shaking unused Tailwind classes

### Caching
- Cloudinary CDN for images
- Next.js static generation for collection pages
- Service worker for offline support
- Firestore query result caching

## Edge Cases & Production Considerations

### Concurrent Updates
- Firestore uses optimistic locking—in production, use Cloud Functions for atomic increments on appreciations/saves counts
- Current implementation: client-side count updates (works for MVP, race conditions possible at scale)

### Moderation
- Guest book posts require `moderated: true` to display
- Create admin dashboard or use Firestore UI to moderate
- Consider Cloud Function to notify Josh of new posts

### Rate Limiting
- Firestore has quota limits—monitor usage in production
- Consider adding client-side throttling for appreciation spam
- Cloud Functions can enforce rate limits server-side

### Image Optimization
- Cloudinary has bandwidth limits on free tier
- Monitor usage and upgrade plan as needed
- Consider image compression before upload

### SEO (Future)
- Add metadata to photo pages for social sharing
- Generate static sitemap
- Implement structured data (JSON-LD)

## Testing Checklist

- [ ] OAuth flow (Google & GitHub)
- [ ] Anonymous browsing
- [ ] Feed scrolling (mobile snap, desktop magazine)
- [ ] Tab switching
- [ ] Search by tags
- [ ] Appreciations (logged in vs anonymous)
- [ ] Saves
- [ ] Guest book posting
- [ ] Responsive layouts (mobile, tablet, desktop)
- [ ] PWA install prompt
- [ ] Offline fallback
- [ ] Push notification permissions

## Future Features (Post-MVP)

- [ ] Premium subscription tiers
- [ ] Private conversation rooms
- [ ] Scheduled gallery releases
- [ ] Merch integration (prints, books)
- [ ] Admin analytics dashboard
- [ ] Dark/light mode toggle (if requested)
- [ ] Email notifications
- [ ] Advanced search filters
- [ ] User collections/favorites
- [ ] Share photos to social media

## License

All photography © Josh. Code provided for portfolio development.
