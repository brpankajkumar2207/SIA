// Wrapper around Firestore: uses real Firestore when available, otherwise a simple in-memory mock for dev/demo.
import { db } from './firebaseConfig';
import {
  collection as realCollection,
  getDocs as realGetDocs,
  addDoc as realAddDoc,
  query as realQuery,
  where as realWhere,
  orderBy as realOrderBy,
  onSnapshot as realOnSnapshot,
  doc as realDoc,
  updateDoc as realUpdateDoc,
  increment as realIncrement,
  setDoc as realSetDoc,
  runTransaction as realRunTransaction
} from 'firebase/firestore';

type Doc = { id: string; data: any };

const mockStore: Record<string, Doc[]> = {};
const listeners: Record<string, Array<(snapshot: any) => void>> = {};

function trigger(collectionName: string) {
  const col = mockStore[collectionName] || [];
  const subs = listeners[collectionName] || [];
  const snapshot = {
    size: col.length,
    metadata: { fromCache: true },
    docs: col.map((doc) => ({ id: doc.id, data: () => doc.data })),
    forEach(cb: (d: any) => void) {
      col.forEach((doc) => cb({ id: doc.id, data: () => doc.data }));
    }
  };
  subs.forEach((s) => s(snapshot));
}

export function collection(dbInstance: any, name: string) {
  if (dbInstance) {
    return realCollection(dbInstance, name);
  }
  mockStore[name] = mockStore[name] || [];
  return name;
}

export async function addDoc(collRef: any, data: any) {
  if (db) {
    return realAddDoc(collRef, data);
  }
  const collectionName = collRef as string;
  const id = 'mock-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  mockStore[collectionName].unshift({ id, data });
  trigger(collectionName);
  return { id };
}

export function query(...args: any[]) {
  if (db) {
    return realQuery(...args);
  }
  return args[0]; // our mock query is just the collection name
}

export function where(...args: any[]) { return realWhere(...args); }
export function orderBy(...args: any[]) { return realOrderBy(...args); }

export function onSnapshot(queryRef: any, cb: (snapshot: any) => void, errCb?: (e: any) => void) {
  if (db) {
    return realOnSnapshot(queryRef, cb, errCb);
  }
  const collectionName = queryRef as string;
  listeners[collectionName] = listeners[collectionName] || [];
  listeners[collectionName].push(cb);
  // call immediately with current data
  setTimeout(() => {
    const col = mockStore[collectionName] || [];
    const snapshot = {
      size: col.length,
      metadata: { fromCache: true },
      docs: col.map((doc) => ({ id: doc.id, data: () => doc.data })),
      forEach(fn: (d: any) => void) { col.forEach((doc) => fn({ id: doc.id, data: () => doc.data })); }
    };
    cb(snapshot);
  }, 0);
  return () => {
    const arr = listeners[collectionName] || [];
    const idx = arr.indexOf(cb);
    if (idx >= 0) arr.splice(idx, 1);
  };
}

export function doc(dbInstance: any, collectionName: string, id: string) {
  if (dbInstance) {
    return realDoc(dbInstance, collectionName, id);
  }
  return { collectionName, id };
}

export async function updateDoc(docRef: any, update: any) {
  if (db) {
    return realUpdateDoc(docRef, update);
  }
  const { collectionName, id } = docRef;
  const col = mockStore[collectionName] || [];
  const idx = col.findIndex((d) => d.id === id);
  if (idx >= 0) {
    const existing = col[idx].data;
    // simple increment handling
    for (const k of Object.keys(update)) {
      const val = update[k];
      if (val && val._method === 'increment') {
        existing[k] = (existing[k] || 0) + val._by;
      } else {
        existing[k] = val;
      }
    }
    trigger(collectionName);
  }
}

export function increment(by = 1) {
  if (db) {
    return realIncrement(by);
  }
  return { _method: 'increment', _by: by };
}

export async function setDoc(docRef: any, data: any) {
  if (db) {
    return realSetDoc(docRef, data);
  }
  const { collectionName, id } = docRef;
  mockStore[collectionName] = mockStore[collectionName] || [];
  const idx = mockStore[collectionName].findIndex((d) => d.id === id);
  if (idx >= 0) mockStore[collectionName][idx].data = data;
  else mockStore[collectionName].push({ id, data });
  trigger(collectionName);
}

export { Doc };

export async function getDocs(queryRef: any) {
  if (db) {
    return realGetDocs(queryRef);
  }
  const collectionName = queryRef as string;
  const col = mockStore[collectionName] || [];
  return {
    size: col.length,
    metadata: { fromCache: true },
    docs: col.map(d => ({ id: d.id, data: () => d.data })),
    forEach(cb: (doc: any) => void) {
      col.forEach((d) => cb({ id: d.id, data: () => d.data }));
    }
  };
}

export async function runTransaction(dbInstance: any, callback: (t: any) => Promise<any>) {
  if (dbInstance) {
    return realRunTransaction(dbInstance, callback);
  }
  // naive transaction: provide a transaction object with get/update/set
  const tx = {
    async get(docRef: any) {
      const { collectionName, id } = docRef;
      const col = mockStore[collectionName] || [];
      const item = col.find(d => d.id === id);
      return { exists: !!item, data: () => (item ? item.data : undefined) };
    },
    async update(docRef: any, data: any) {
      return updateDoc(docRef, data);
    },
    async set(docRef: any, data: any) {
      return setDoc(docRef, data);
    }
  };
  return callback(tx);
}
