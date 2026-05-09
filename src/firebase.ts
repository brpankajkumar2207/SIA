import { initializeApp } from "firebase/app";
<<<<<<< HEAD
import { getAuth } from "firebase/auth";
import { getFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";
=======
import { getAuth, type Auth } from "firebase/auth";
>>>>>>> 591a4e4163c901acb896777bd04e45ad8c70b41d

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

<<<<<<< HEAD
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable Multi-Tab Persistence for local dev syncing
enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn("Firestore Persistence: Multiple tabs open, persistence can only be enabled in one tab at a time.");
    } else if (err.code === 'unimplemented') {
        console.warn("Firestore Persistence: The current browser does not support all of the features required to enable persistence.");
    }
});

export default app;
=======
const requiredKeys = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
] as const;

const missingKeys = requiredKeys.filter((key) => !import.meta.env[key]);

export const firebaseInitError =
  missingKeys.length > 0
    ? `Missing Firebase environment variables: ${missingKeys.join(", ")}`
    : null;

let authInstance: Auth | null = null;

if (!firebaseInitError) {
  try {
    const app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
  } catch (error) {
    console.error("Firebase auth initialization failed:", error);
  }
}

export const auth = authInstance;
>>>>>>> 591a4e4163c901acb896777bd04e45ad8c70b41d
