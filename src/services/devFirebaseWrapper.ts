// Wrapper around Firebase Auth: uses real Firebase when available, otherwise a simple in-memory mock for dev/demo.
import { auth } from '../firebase';
import {
  onAuthStateChanged as realOnAuthStateChanged,
  signInWithEmailAndPassword as realSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as realCreateUserWithEmailAndPassword,
  signOut as realSignOut,
} from 'firebase/auth';

export type FirebaseUser = {
  uid: string;
  email?: string | null;
};

let mockCurrentUser: FirebaseUser | null = null;
const subscribers: Array<(user: FirebaseUser | null) => void> = [];

function notify(user: FirebaseUser | null) {
  subscribers.forEach((subscriber) => subscriber(user));
}

export async function signInWithEmailAndPassword(authInstance: any, email: string, password: string) {
  if (authInstance) {
    return realSignInWithEmailAndPassword(authInstance, email, password);
  }

  mockCurrentUser = { uid: `mock-${Date.now()}`, email };
  notify(mockCurrentUser);
  return { user: mockCurrentUser };
}

export async function createUserWithEmailAndPassword(authInstance: any, email: string, password: string) {
  if (authInstance) {
    return realCreateUserWithEmailAndPassword(authInstance, email, password);
  }

  mockCurrentUser = { uid: `mock-${Date.now()}`, email };
  notify(mockCurrentUser);
  return { user: mockCurrentUser };
}

export async function signOut(authInstance: any) {
  if (authInstance) {
    return realSignOut(authInstance);
  }

  mockCurrentUser = null;
  notify(null);
}

export function onAuthStateChanged(authInstance: any, cb: (user: FirebaseUser | null) => void) {
  if (authInstance) {
    return realOnAuthStateChanged(authInstance, cb);
  }

  subscribers.push(cb);
  queueMicrotask(() => cb(mockCurrentUser));

  return () => {
    const idx = subscribers.indexOf(cb);
    if (idx >= 0) subscribers.splice(idx, 1);
  };
}

export const firebaseAuthAvailable = Boolean(auth);
