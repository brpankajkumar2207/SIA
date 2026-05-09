import { initializeApp } from "firebase/app";
import { getFirestore, enableMultiTabIndexedDbPersistence, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_CAPSULE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_CAPSULE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_CAPSULE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_CAPSULE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_CAPSULE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_CAPSULE_FIREBASE_APP_ID,
};

const requiredKeys = [
  "VITE_CAPSULE_FIREBASE_API_KEY",
  "VITE_CAPSULE_FIREBASE_AUTH_DOMAIN",
  "VITE_CAPSULE_FIREBASE_PROJECT_ID",
  "VITE_CAPSULE_FIREBASE_STORAGE_BUCKET",
  "VITE_CAPSULE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_CAPSULE_FIREBASE_APP_ID",
] as const;

const missingKeys = requiredKeys.filter((key) => !import.meta.env[key]);

export const capsuleFirebaseInitError =
  missingKeys.length > 0
    ? `Missing Capsule Firebase environment variables: ${missingKeys.join(", ")}`
    : null;

let firestoreInstance: Firestore | null = null;

if (!capsuleFirebaseInitError) {
  try {
    const app = initializeApp(firebaseConfig, "capsule");
    firestoreInstance = getFirestore(app);

    enableMultiTabIndexedDbPersistence(firestoreInstance).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn("Capsule Firestore Persistence: Multiple tabs open.");
      } else if (err.code === 'unimplemented') {
        console.warn("Capsule Firestore Persistence: Browser does not support persistence.");
      }
    });
  } catch (error) {
    console.error("Capsule Firestore initialization failed:", error);
  }
}

export const capsuleDb = firestoreInstance;
