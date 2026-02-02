# Deploy Without Installing Node.js Locally

## Option 1: Deploy via GitHub + Vercel (Recommended - Easiest)

### Step 1: Push to GitHub
1. Go to https://github.com/new
2. Create a new repository (name it `seejoshsphotos`)
3. Don't initialize with README

```bash
# In your project directory
git init
git add .
git commit -m "Initial commit - SeeJoshsPhotos PWA"
git remote add origin https://github.com/YOUR_USERNAME/seejoshsphotos.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your `seejoshsphotos` repository
5. Vercel auto-detects Next.js - click "Deploy"
6. Add environment variables:
   - Go to Settings → Environment Variables
   - Add all variables from `.env.example`
7. Redeploy

✅ **Done!** Your site is live at `https://seejoshsphotos.vercel.app`

---

## Option 2: GitHub Codespaces (Free Cloud IDE)

1. Go to your GitHub repo
2. Click green "Code" button → Codespaces tab → Create codespace
3. Wait for environment to load (includes Node.js automatically)
4. In terminal:
   ```bash
   npm install
   npm run dev
   ```
5. Codespaces gives you a preview URL

---

## Option 3: Netlify (Alternative to Vercel)

1. Go to https://netlify.com
2. Sign up with GitHub
3. "Add new site" → "Import from Git"
4. Select your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables in Site Settings
7. Deploy

---

## Option 4: Railway.app

1. Go to https://railway.app
2. Sign up with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Select `seejoshsphotos`
5. Add environment variables
6. Railway auto-detects Next.js and deploys

---

## Setting Up Firebase (No Local Install Needed)

### 1. Create Firebase Project
- Go to https://console.firebase.google.com
- Click "Add project"
- Name: `seejoshsphotos`
- Disable Google Analytics (optional)

### 2. Enable Authentication
- Authentication → Get started
- Enable Google provider:
  - Toggle "Enable"
  - Add support email
  - Save
- Enable GitHub provider:
  - Go to GitHub Settings → Developer settings → OAuth Apps
  - New OAuth App:
    - Name: `SeeJoshsPhotos`
    - Homepage: `https://seejoshsphotos.vercel.app`
    - Callback: Copy from Firebase console
  - Copy Client ID & Secret to Firebase
  - Save

### 3. Create Firestore Database
- Firestore Database → Create database
- Start in **production mode**
- Location: us-central1 (or nearest to you)
- Click "Enable"

### 4. Update Security Rules
Copy this into Firestore Rules tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /photos/{photoId} {
      allow read: if true;
      allow update: if request.auth != null &&
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['appreciations', 'saves']);
    }
    
    match /collections/{collectionId} {
      allow read: if true;
    }
    
    match /guest_book/{postId} {
      allow read: if resource.data.moderated == true;
      allow create: if request.auth != null;
    }
  }
}
```

### 5. Get Firebase Config
- Project Settings (gear icon) → Your apps
- Click web icon `</>`
- Register app name: `SeeJoshsPhotos`
- Copy the config values

---

## Setting Up Cloudinary

1. Go to https://cloudinary.com
2. Sign up (free tier is fine for MVP)
3. Dashboard → Account Details
4. Copy your **Cloud name**
5. Media Library → Upload your photos
6. Note the **Public ID** for each photo

---

## Environment Variables Template

Add these to your deployment platform (Vercel/Netlify/Railway):

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seejoshsphotos.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seejoshsphotos
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seejoshsphotos.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

---

## Adding Photos to Firestore (Web UI)

1. Go to Firebase Console → Firestore
2. Click "Start collection"
3. Collection ID: `photos`
4. Add first document:

```
Document ID: [Auto-ID]

Fields:
title: "Pink Garden Rose"
description: "Morning light on delicate petals..."
shotDate: [timestamp] - Click calendar icon
tags: ["pink", "garden", "morning"]
colorTags: ["pink"]
collectionId: "roses"
cloudinaryId: "your_cloudinary_public_id"
appreciations: {
  count: 0
  userIds: []
}
saves: {
  count: 0
  userIds: []
}
createdAt: [timestamp] - Use "now"
```

5. Repeat for each photo

---

## Initialize Collections

In Firebase Console → Firestore:

1. Create collection: `collections`
2. Add document with ID: `roses`
   ```
   title: "Roses"
   description: "Intimate portraits of garden roses..."
   photoIds: []
   order: 0
   ```
3. Repeat for: `garden-home`, `miami`, `chicago`, `san-diego`, `montana`, `new-mexico`

---

## You're Live! 🎉

Your site should be accessible at your deployment URL. Test:

1. Browse anonymously
2. Sign in with Google/GitHub
3. View photos
4. Try appreciations (requires login)
5. Post to guest book

---

## Troubleshooting

**"Firebase config error"**
- Double-check environment variables are set in deployment platform
- Make sure all `NEXT_PUBLIC_` prefix variables are included

**"Photos not loading"**
- Verify Cloudinary public IDs match exactly
- Check browser console for errors

**"Can't sign in"**
- Add your deployment URL to Firebase authorized domains
- Firebase Console → Authentication → Settings → Authorized domains

**"Guest book posts don't show"**
- Posts need `moderated: true` to be visible
- Set this manually in Firestore for now

---

## Next Steps

1. Upload more photos
2. Customize collection descriptions
3. Moderate guest book posts
4. Add custom domain (in Vercel/Netlify settings)
5. Monitor usage in Firebase Console

Need help? Check the full README.md for detailed documentation.
