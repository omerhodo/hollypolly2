import { type FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { type Firestore, getFirestore, initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate config
if (!firebaseConfig.projectId || !firebaseConfig.apiKey) {
  throw new Error('Firebase configuration is incomplete. Check environment variables.');
}

let app: FirebaseApp;
let db: Firestore;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

  // Use long polling for better Vercel performance
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true, // Vercel için kritik
  });
} catch (error) {
  console.error('Firebase initialization error:', error);
  app = getApps()[0] || initializeApp(firebaseConfig);
  db = getFirestore(app);
}

export { db };
