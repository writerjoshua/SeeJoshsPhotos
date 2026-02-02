# Quick Start Guide

## Getting Your Portfolio Live in 3 Steps

### Step 1: Firebase Setup (15 min)

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com
   - Click "Add project"
   - Name it "seejoshsphotos"
   - Disable Google Analytics (optional)

2. **Enable Authentication**
   - In Firebase console, go to Authentication
   - Click "Get started"
   - Enable Google provider:
     - Click Google
     - Toggle "Enable"
     - Add support email (your email)
     - Save
   - Enable GitHub provider:
     - Click GitHub
     - Toggle "Enable"
     - You'll need to create a GitHub OAuth App:
       - Go to GitHub Settings → Developer settings → OAuth Apps
       - New OAuth App
       - Homepage URL: `https://seejoshsphotos.vercel.app`
       - Callback URL: (copy from Firebase)
       - Copy Client ID & Secret to Firebase
     - Save

3. **Create Firestore Database**
   - In Firebase console, go to Firestore Database
   - Click "Create database"
   - Start in **production mode**
   - Choose location (us-central1 recommended)
   - Update security rules (copy from README)

4. **Get Firebase Config**
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps"
   - Click web icon (</>)
   - Copy the config object
   - Save these values—you'll need them for `.env.local`

### Step 2: Cloudinary Setup (10 min)

1. **Create Cloudinary Account**
   - Go to https://cloudinary.com
   - Sign up for free account

2. **Upload Your Photos**
   - Go to Media Library
   - Upload photos
   - Note the "Public ID" for each photo (you'll need this)
   - Organize in folders if you want: roses/, garden/, travel/

3. **Get Cloud Name**
   - Dashboard → Account Details
   - Copy your "Cloud name"

### Step 3: Deploy to Vercel (10 min)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Configure Environment Variables**
   - Create `.env.local` file
   - Copy from `.env.example`
   - Fill in Firebase & Cloudinary values

3. **Deploy**
   ```bash
   cd seejoshsphotos
   vercel
   ```
   
   - Follow prompts
   - Choose "yes" to deploy

4. **Add Environment Variables to Vercel**
   - Go to vercel.com/dashboard
   - Select your project
   - Settings → Environment Variables
   - Add all variables from `.env.local`

5. **Redeploy**
   ```bash
   vercel --prod
   ```

---

## Adding Photos

### Method 1: Manual (For First 10-20 Photos)

1. Upload to Cloudinary (get Public IDs)
2. Go to Firebase Console → Firestore
3. Open `photos` collection
4. Click "Add document"
5. Fill in fields:
   ```
   title: "Pink Rose in Morning Light"
   description: "..."
   shotDate: [timestamp]
   tags: ["pink", "morning", "garden"]
   cloudinaryId: "roses/pink-rose-morning-001"
   collectionId: "roses"
   appreciations: { count: 0, userIds: [] }
   saves: { count: 0, userIds: [] }
   ```

### Method 2: Bulk Upload Script (For 20+ Photos)

1. Upload all photos to Cloudinary first
2. Create a `photos.json` file:
   ```json
   [
     {
       "title": "Pink Rose",
       "description": "...",
       "cloudinaryId": "roses/pink-001",
       "collectionId": "roses",
       "tags": ["pink", "garden"]
     }
   ]
   ```
3. Run upload script:
   ```bash
   node scripts/upload-photos.js photos.json
   ```

---

## Managing Content

### Guest Book Moderation

1. Go to Firebase Console → Firestore → `guest_book`
2. Find unmoderated posts (`moderated: false`)
3. Review content
4. If approved, change `moderated` to `true`
5. If rejected, delete document

### Setting Collection Cover Photos

1. Upload photos first
2. Note the photo ID (in Firestore)
3. Go to Collections → [collection name]
4. Update `coverPhotoId` field with photo ID

---

## Testing Checklist

Before sharing with anyone:

- [ ] Can browse anonymously
- [ ] Can sign in with Google
- [ ] Can sign in with GitHub
- [ ] Photos load and display correctly
- [ ] Can swipe between photos on mobile
- [ ] Can appreciate photos (when logged in)
- [ ] Can save photos
- [ ] Can post to guest book
- [ ] Search works
- [ ] Collections work
- [ ] Install as PWA on mobile

---

## Common Issues

**Photos not loading?**
- Check Cloudinary public IDs match exactly
- Verify Cloudinary cloud name in `.env`

**Authentication fails?**
- Verify OAuth redirect URLs in Firebase & GitHub
- Check Firebase config in `.env`

**Guest book posts not showing?**
- Posts must be moderated first
- Check `moderated: true` in Firestore

**Site looks broken?**
- Run `npm run build` locally first
- Check browser console for errors
- Verify all environment variables are set in Vercel

---

## Getting Help

1. Check README.md for detailed docs
2. Check browser console for errors
3. Check Vercel deployment logs
4. Check Firebase console for errors

---

**Your site will be live at: `https://seejoshsphotos.vercel.app`**

(You can add a custom domain later in Vercel settings)
