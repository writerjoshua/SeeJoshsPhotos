/**
 * Photo Upload Utility
 * 
 * Helper script to batch upload photo metadata to Firestore
 * after uploading images to Cloudinary.
 * 
 * Usage: node scripts/upload-photos.js
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as fs from 'fs';

// Initialize Firebase Admin
const serviceAccount = require('../path-to-your-service-account.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Example photo data structure
// You can modify this array or read from a CSV/JSON file
const PHOTOS_TO_UPLOAD = [
  {
    title: 'Pink Garden Rose',
    description: 'Morning light catching the delicate petals of a pink garden rose. The dew still fresh, the color saturated and alive.',
    shotDate: new Date('2024-06-15'),
    tags: ['pink', 'garden', 'morning', 'dew', 'close-up'],
    colorTags: ['pink'],
    roseType: 'garden',
    mood: ['sensual', 'tender'],
    season: 'summer',
    location: 'Seattle',
    collectionId: 'roses',
    cloudinaryId: 'your_cloudinary_public_id_here', // Replace with actual Cloudinary ID
  },
  // Add more photos here...
];

async function uploadPhotos() {
  console.log(`Uploading ${PHOTOS_TO_UPLOAD.length} photos to Firestore...\n`);

  try {
    const batch = db.batch();
    let uploadCount = 0;

    for (const photo of PHOTOS_TO_UPLOAD) {
      const docRef = db.collection('photos').doc();
      
      batch.set(docRef, {
        ...photo,
        shotDate: Timestamp.fromDate(photo.shotDate),
        appreciations: {
          count: 0,
          userIds: [],
        },
        saves: {
          count: 0,
          userIds: [],
        },
        createdAt: Timestamp.now(),
      });

      console.log(`✓ Prepared: ${photo.title} (${photo.cloudinaryId})`);
      uploadCount++;
    }

    await batch.commit();
    console.log(`\n✅ Successfully uploaded ${uploadCount} photos!`);
    
    // Update collection photoIds
    console.log('\nUpdating collection photoIds...');
    for (const collection of ['roses', 'garden-home', 'miami', 'chicago', 'san-diego', 'montana', 'new-mexico']) {
      const photosSnapshot = await db.collection('photos')
        .where('collectionId', '==', collection)
        .get();
      
      const photoIds = photosSnapshot.docs.map(doc => doc.id);
      
      await db.collection('collections').doc(collection).update({
        photoIds,
      });
      
      console.log(`✓ Updated ${collection}: ${photoIds.length} photos`);
    }
    
    console.log('\n✅ All done! Photos are live.');
    
  } catch (error) {
    console.error('❌ Error uploading photos:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Uncomment to run
// uploadPhotos();

// Alternative: Read from JSON file
function uploadFromJSON(filePath: string) {
  const photosData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  PHOTOS_TO_UPLOAD.push(...photosData);
  uploadPhotos();
}

// Export for use in other scripts
export { uploadPhotos, uploadFromJSON };
