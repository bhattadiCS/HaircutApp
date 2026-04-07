import { app, firebaseFirestore, mockLayer, shouldUseEmulators, useMock } from './firebaseCore';

const firestoreProvider = useMock ? mockLayer : firebaseFirestore;

export const db = firestoreProvider.getFirestore(app);

export const {
  doc,
  collection,
  addDoc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
} = firestoreProvider;

if (shouldUseEmulators && !globalThis.__styleshiftFirebaseFirestoreEmulatorConnected__) {
  const firestorePort = Number(import.meta.env.VITE_FIREBASE_FIRESTORE_PORT || 8080);

  firebaseFirestore.connectFirestoreEmulator(db, '127.0.0.1', firestorePort);

  globalThis.__styleshiftFirebaseFirestoreEmulatorConnected__ = true;
}