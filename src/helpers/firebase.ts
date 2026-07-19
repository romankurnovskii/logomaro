/**
 * @file firebase.ts
 * @description Firebase app initialization and service exports.
 *
 * @features
 * - Initializes Firebase app with env-based config
 * - Exports auth, Firestore (with persistent cache), and Storage instances
 *
 * @dependencies Firebase v12
 * @sideEffects Initializes Firebase on module import
 */
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, indexedDBLocalPersistence, type User } from 'firebase/auth';

export type { User };
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Initialize Firebase - check if already initialized to prevent double initialization
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase app only if not already initialized
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Fallback to default app if available
  app = getApp();
}

export { app };
export const auth = getAuth(app);
auth.setPersistence(indexedDBLocalPersistence); // TODO  Verify if anon user will get same id

// Initialize Firestore with persistent local cache
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});

export const storage = getStorage(app);

export const appId = import.meta.env.VITE_APP_ID;

console.log('🚀 projectId:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
