import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { User, Photo, Collection, GuestBookPost, PhotoEngagement } from '@/types';

// User operations
export const createUser = async (userId: string, userData: Partial<User>): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    ...userData,
    createdAt: Timestamp.now(),
    stats: {
      appreciationsGiven: 0,
      visits: 0,
      savedPhotos: 0,
    },
  });
};

export const getUser = async (userId: string): Promise<User | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return null;
  
  const data = userSnap.data();
  return {
    id: userSnap.id,
    ...data,
    createdAt: data.createdAt.toDate(),
  } as User;
};

export const updateUserStats = async (
  userId: string,
  stat: keyof User['stats'],
  increment: number = 1
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    [`stats.${stat}`]: increment,
  });
};

// Photo operations
export const getPhoto = async (photoId: string): Promise<Photo | null> => {
  const photoRef = doc(db, 'photos', photoId);
  const photoSnap = await getDoc(photoRef);
  
  if (!photoSnap.exists()) return null;
  
  const data = photoSnap.data();
  return {
    id: photoSnap.id,
    ...data,
    shotDate: data.shotDate.toDate(),
    createdAt: data.createdAt.toDate(),
  } as Photo;
};

export const getPhotosByCollection = async (
  collectionId: string,
  maxCount?: number
): Promise<Photo[]> => {
  const photosRef = collection(db, 'photos');
  const q = query(
    photosRef,
    where('collectionId', '==', collectionId),
    orderBy('shotDate', 'desc'),
    ...(maxCount ? [limit(maxCount)] : [])
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    shotDate: doc.data().shotDate.toDate(),
    createdAt: doc.data().createdAt.toDate(),
  })) as Photo[];
};

export const getForYouFeed = async (maxCount: number = 50): Promise<Photo[]> => {
  const photosRef = collection(db, 'photos');
  const q = query(
    photosRef,
    orderBy('createdAt', 'desc'),
    limit(maxCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    shotDate: doc.data().shotDate.toDate(),
    createdAt: doc.data().createdAt.toDate(),
  })) as Photo[];
};

export const searchPhotosByTags = async (tags: string[]): Promise<Photo[]> => {
  const photosRef = collection(db, 'photos');
  const q = query(
    photosRef,
    where('tags', 'array-contains-any', tags),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    shotDate: doc.data().shotDate.toDate(),
    createdAt: doc.data().createdAt.toDate(),
  })) as Photo[];
};

// Engagement operations
export const addAppreciation = async (
  photoId: string,
  userId: string
): Promise<void> => {
  const photoRef = doc(db, 'photos', photoId);
  await updateDoc(photoRef, {
    'appreciations.userIds': arrayUnion(userId),
  });
  
  // Update count (in production, use Cloud Function for atomic increment)
  const photo = await getPhoto(photoId);
  if (photo) {
    await updateDoc(photoRef, {
      'appreciations.count': photo.appreciations.userIds.length + 1,
    });
  }
};

export const removeAppreciation = async (
  photoId: string,
  userId: string
): Promise<void> => {
  const photoRef = doc(db, 'photos', photoId);
  await updateDoc(photoRef, {
    'appreciations.userIds': arrayRemove(userId),
  });
  
  const photo = await getPhoto(photoId);
  if (photo) {
    await updateDoc(photoRef, {
      'appreciations.count': Math.max(0, photo.appreciations.userIds.length - 1),
    });
  }
};

export const savePhoto = async (photoId: string, userId: string): Promise<void> => {
  const photoRef = doc(db, 'photos', photoId);
  await updateDoc(photoRef, {
    'saves.userIds': arrayUnion(userId),
  });
  
  const photo = await getPhoto(photoId);
  if (photo) {
    await updateDoc(photoRef, {
      'saves.count': photo.saves.userIds.length + 1,
    });
  }
};

export const unsavePhoto = async (photoId: string, userId: string): Promise<void> => {
  const photoRef = doc(db, 'photos', photoId);
  await updateDoc(photoRef, {
    'saves.userIds': arrayRemove(userId),
  });
  
  const photo = await getPhoto(photoId);
  if (photo) {
    await updateDoc(photoRef, {
      'saves.count': Math.max(0, photo.saves.userIds.length - 1),
    });
  }
};

// Collection operations
export const getCollection = async (collectionId: string): Promise<Collection | null> => {
  const collectionRef = doc(db, 'collections', collectionId);
  const collectionSnap = await getDoc(collectionRef);
  
  if (!collectionSnap.exists()) return null;
  
  return {
    id: collectionSnap.id,
    ...collectionSnap.data(),
  } as Collection;
};

export const getAllCollections = async (): Promise<Collection[]> => {
  const collectionsRef = collection(db, 'collections');
  const q = query(collectionsRef, orderBy('order', 'asc'));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Collection[];
};

// Guest Book operations
export const createGuestBookPost = async (
  userId: string,
  message: string,
  photoRef?: string,
  collectionRef?: string
): Promise<string> => {
  const postRef = doc(collection(db, 'guest_book'));
  await setDoc(postRef, {
    userId,
    message,
    createdAt: Timestamp.now(),
    photoRef,
    collectionRef,
    moderated: false,
  });
  
  return postRef.id;
};

export const getGuestBookPosts = async (
  maxCount: number = 50,
  collectionRef?: string
): Promise<GuestBookPost[]> => {
  const postsRef = collection(db, 'guest_book');
  const q = collectionRef
    ? query(
        postsRef,
        where('collectionRef', '==', collectionRef),
        where('moderated', '==', true),
        orderBy('createdAt', 'desc'),
        limit(maxCount)
      )
    : query(
        postsRef,
        where('moderated', '==', true),
        orderBy('createdAt', 'desc'),
        limit(maxCount)
      );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  })) as GuestBookPost[];
};
