/**
 * Firestore Database Initialization Script
 * 
 * Run this once to set up initial collections in Firestore.
 * Requires Firebase Admin SDK credentials.
 * 
 * Usage: node scripts/init-firestore.js
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const serviceAccount = require('../path-to-your-service-account.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const INITIAL_COLLECTIONS = [
  {
    id: 'roses',
    title: 'Roses',
    theme: 'Sensual exploration of garden roses',
    description: 'My primary work—intimate portraits of roses in their full sensuality. Each photograph is an act of attention, a study in color, texture, and light.',
    photoIds: [],
    order: 0,
  },
  {
    id: 'garden-home',
    title: 'Garden & Home',
    theme: 'Daily practice of tending and cultivating',
    description: 'iPhone moments from my garden and home. The practice of seeing, the ritual of care.',
    photoIds: [],
    order: 1,
  },
  {
    id: 'miami',
    title: 'Miami',
    theme: 'Travels: Ocean, light, vibrance',
    description: 'Occasional travels to Miami—where the light is different, the colors more saturated.',
    photoIds: [],
    order: 2,
  },
  {
    id: 'chicago',
    title: 'Chicago',
    theme: 'Travels: Architecture, urban landscapes',
    description: 'Chicago in all its architectural glory and urban rhythms.',
    photoIds: [],
    order: 3,
  },
  {
    id: 'san-diego',
    title: 'San Diego',
    theme: 'Travels: Coast, home',
    description: 'San Diego—where I grew up, where the coast meets memory.',
    photoIds: [],
    order: 4,
  },
  {
    id: 'montana',
    title: 'Montana',
    theme: 'Travels: Wide open spaces',
    description: 'Montana's vast landscapes—a different kind of intimacy.',
    photoIds: [],
    order: 5,
  },
  {
    id: 'new-mexico',
    title: 'New Mexico',
    theme: 'Travels: Desert, light, color',
    description: 'New Mexico's high desert—where light becomes tangible.',
    photoIds: [],
    order: 6,
  },
];

async function initializeCollections() {
  console.log('Initializing Firestore collections...');

  try {
    const batch = db.batch();

    for (const collection of INITIAL_COLLECTIONS) {
      const docRef = db.collection('collections').doc(collection.id);
      batch.set(docRef, collection);
      console.log(`✓ Created collection: ${collection.title}`);
    }

    await batch.commit();
    console.log('\n✅ All collections initialized successfully!');
    
    console.log('\nNext steps:');
    console.log('1. Upload photos to Cloudinary');
    console.log('2. Add photo documents to Firestore (see README for schema)');
    console.log('3. Update coverPhotoId for each collection');
    
  } catch (error) {
    console.error('❌ Error initializing collections:', error);
    process.exit(1);
  }

  process.exit(0);
}

initializeCollections();
