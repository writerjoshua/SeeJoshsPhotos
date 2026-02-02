# SeeJoshsPhotos — Technical Architecture

## System Design

### High-Level Architecture

```
┌─────────────────┐
│   User Browser  │
│   (PWA Client)  │
└────────┬────────┘
         │
         ├──── Next.js App (Vercel Edge)
         │     ├── SSR/SSG Pages
         │     ├── API Routes
         │     └── Client Components
         │
         ├──── Firebase
         │     ├── Authentication (OAuth)
         │     ├── Firestore (Database)
         │     └── Cloud Messaging (Push)
         │
         └──── Cloudinary CDN
               └── Image Optimization
```

### Key Technical Decisions

#### 1. **Next.js App Router (not Pages Router)**
   - **Why**: Better for this immersive, app-like experience
   - Server Components reduce JS bundle
   - Nested layouts perfect for feed structure
   - Built-in image optimization
   - **Tradeoff**: Newer API, fewer Stack Overflow answers

#### 2. **Firebase for Backend**
   - **Why**: No server to manage, scales automatically
   - Real-time updates for guest book
   - OAuth built-in (Google/GitHub)
   - Free tier generous for MVP
   - **Tradeoff**: Vendor lock-in, less control vs custom API
   - **Edge case**: Firestore has eventual consistency—appreciations/saves might have slight delay

#### 3. **Cloudinary for Images**
   - **Why**: Best-in-class image CDN
   - Auto format conversion (WebP)
   - Responsive transformations
   - Global CDN
   - **Tradeoff**: Free tier has bandwidth limits (upgrade at scale)

#### 4. **Dark Mode Only**
   - **Why**: Matches Josh's vision, reduces complexity
   - No theme toggle = smaller bundle
   - Consistent experience
   - Better for photography viewing

#### 5. **Type Safety (TypeScript)**
   - Every domain model typed
   - Catches bugs at compile time
   - Better IDE support
   - Small runtime cost, massive dev benefit

---

## Data Flow

### Photo Feed Flow

```
User swipes → 
  Component reads from Firestore → 
    Fetches photo metadata → 
      Cloudinary URL generated → 
        Image loaded with blur placeholder → 
          User sees photo
```

### Engagement Flow (Appreciate/Save)

```
User clicks heart →
  Check auth status →
    If not logged in: redirect to /auth
    If logged in:
      Optimistic UI update (instant) →
      Firestore write (background) →
        If fails: revert UI
```

**Production consideration**: This is optimistic locking. At scale, use Cloud Functions for atomic increments to avoid race conditions.

---

## Performance Strategy

### Images
- **Blur placeholders**: Instant perceived load (10px @ 30% quality)
- **Responsive srcset**: Right size for viewport
- **Lazy loading**: Below-fold images load on demand
- **Format optimization**: WebP for Chrome/Edge, fallback for Safari

### Code
- **Code splitting**: Each route gets own bundle
- **Server Components**: Reduce client JS by ~40%
- **Tree-shaking**: Tailwind purges unused classes
- **Edge caching**: Vercel CDN for static assets

### Database
- **Indexed queries**: All common queries have indexes
- **Query limits**: Cap at 50 results per feed load
- **Client-side caching**: React Query for repeated requests (future)

---

## Security Model

### Authentication
- OAuth only (no password storage)
- Firebase handles token refresh
- httpOnly cookies for session
- CSRF protection via Firebase

### Firestore Rules
```javascript
// Users can only edit their own data
match /users/{userId} {
  allow read: if true;
  allow write: if request.auth.uid == userId;
}

// Photos are public read, admin write
match /photos/{photoId} {
  allow read: if true;
  allow write: if isAdmin();
  // Exception: users can update their own appreciations
  allow update: if isOwnEngagement();
}

// Guest book requires moderation
match /guest_book/{postId} {
  allow read: if resource.data.moderated == true;
  allow create: if request.auth != null;
  allow update: if isAdmin();
}
```

### Content Security
- CSP headers in Vercel config
- XSS protection headers
- No inline scripts
- Image sources restricted to Cloudinary

---

## Scalability Considerations

### Current Architecture (MVP)
- **Users**: 100-1,000
- **Photos**: 500-2,000
- **Requests**: <10k/day
- **Cost**: Free tier + ~$20/mo

### At Scale (10k+ users)
**Bottlenecks to watch**:
1. Firestore read quota (50k/day free → upgrade)
2. Cloudinary bandwidth (25GB/mo free → upgrade)
3. Vercel function executions (100k/mo free → upgrade)

**Solutions**:
1. Add Redis cache for hot queries
2. Use Cloudinary's fetch API to auto-optimize
3. Migrate to serverless functions on AWS if needed

---

## Future Enhancements

### Phase 2 (Premium Features)
- Subscription with Stripe
- Private conversation rooms
- Advanced analytics

### Phase 3 (Community)
- User-curated collections
- Social sharing
- Weekly/monthly digests

### Phase 4 (Monetization)
- Print shop (integrate Printful)
- Digital downloads
- Photography workshops

---

## Development Workflow

### Local Development
```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run lint          # ESLint check
npm run type-check    # TypeScript check
```

### Git Workflow
```
main → production (Vercel auto-deploy)
dev → staging (manual deploy)
feature/* → PR to dev
```

### Testing Strategy
- **Manual**: Core user flows (auth, feed, engagement)
- **Automated** (future): Jest + React Testing Library
- **E2E** (future): Playwright for critical paths

---

## Monitoring & Observability

### Current (MVP)
- Vercel Analytics (page views, Web Vitals)
- Firebase Console (auth, database usage)
- Cloudinary Dashboard (bandwidth, transformations)

### Production (recommended)
- Sentry for error tracking
- Mixpanel for user analytics
- Custom Cloud Function for engagement metrics

---

## Edge Cases Handled

1. **Concurrent updates**: Optimistic UI with rollback
2. **Network offline**: Service worker caches visited pages
3. **Image load failure**: Fallback to placeholder
4. **Auth token expiry**: Firebase auto-refreshes
5. **Moderation bypass**: Server-side rules enforce moderation flag

---

## Known Limitations

1. **No real-time feed updates**: Requires manual refresh (could add with Firestore listeners)
2. **No pagination**: Loads first 50 photos (fine for MVP, add infinite scroll later)
3. **No image upload**: Admin must use Cloudinary dashboard
4. **No comment threading**: Guest book is flat (by design)
5. **No desktop magazine layout**: Mobile-first for MVP

---

## Tech Debt to Address

- [ ] Add integration tests
- [ ] Implement proper error boundaries
- [ ] Add loading skeletons (not just spinners)
- [ ] Optimize bundle size (analyze with @next/bundle-analyzer)
- [ ] Add rate limiting to prevent appreciation spam
- [ ] Implement proper pagination vs limit(50)
- [ ] Add image upload interface for admin

---

## Dependencies

### Core
- `next@14.1.0` - Framework
- `react@18` - UI library
- `typescript@5` - Type safety
- `tailwindcss@3.3` - Styling

### Backend
- `firebase@10.8` - Auth + Database
- `firebase-admin` - Server-side SDK

### Images
- `cloudinary@2.0` - Image optimization
- `next/image` - Image component

### Future
- `framer-motion@11` - Animations
- `react-query` - Data fetching
- `zustand` - State management (if needed)

---

**Built with care by Maya. Ship it.**
