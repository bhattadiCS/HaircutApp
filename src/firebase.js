import { getApps, initializeApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import * as firebaseFirestore from 'firebase/firestore';
import * as firebaseFunctions from 'firebase/functions';
import * as firebaseStorage from 'firebase/storage';
import * as mockLayer from './lib/firebaseMock';
import {
  createMissingFirebaseConfigError,
  getMissingFirebaseConfigKeys,
} from './lib/firebaseConfig';

const env = import.meta.env;

const isTestRuntime = env.MODE === 'test' || Boolean(env.VITEST);

export const shouldUseEmulators =
  env.VITE_USE_FIREBASE_EMULATORS === 'true' ||
  isTestRuntime;

export const useMock =
  !shouldUseEmulators &&
  (env.DEV || env.MODE === 'development') &&
  env.VITE_USE_MOCK_FIREBASE === 'true';

const fallbackFirebaseConfig = {
  apiKey: 'local-emulator-api-key',
  authDomain: 'styleshift.local',
  projectId: 'styleshift-local',
  storageBucket: 'styleshift-local.appspot.com',
  messagingSenderId: '000000000',
  appId: 'local-app-id',
};

function getFirebaseConfig() {
  const missingKeys = getMissingFirebaseConfigKeys(env);

  if (missingKeys.length === 0) {
    return {
      apiKey: env.VITE_FIREBASE_API_KEY.trim(),
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN.trim(),
      projectId: env.VITE_FIREBASE_PROJECT_ID.trim(),
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET.trim(),
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID.trim(),
      appId: env.VITE_FIREBASE_APP_ID.trim(),
    };
  }

  if (useMock || shouldUseEmulators) {
    return fallbackFirebaseConfig;
  }

  throw createMissingFirebaseConfigError(missingKeys);
}

function resolveEmulatorHost() {
  const hostname = globalThis.location?.hostname;

  if (!hostname || hostname === 'localhost') {
    return '127.0.0.1';
  }

  return hostname;
}

const firebaseConfig = getFirebaseConfig();

export const app = getApps()[0] ?? initializeApp(firebaseConfig);

const authProvider = useMock ? mockLayer : firebaseAuth;
const firestoreProvider = useMock ? mockLayer : firebaseFirestore;
const functionsProvider = useMock ? mockLayer : firebaseFunctions;
const storageProvider = useMock ? mockLayer : firebaseStorage;

function createAuthInstance() {
  if (useMock) {
    return authProvider.getAuth(app);
  }

  if (isTestRuntime) {
    return firebaseAuth.getAuth(app);
  }

  try {
    return firebaseAuth.initializeAuth(app, {
      persistence: [
        firebaseAuth.indexedDBLocalPersistence,
        firebaseAuth.browserLocalPersistence,
        firebaseAuth.inMemoryPersistence,
      ],
      popupRedirectResolver: firebaseAuth.browserPopupRedirectResolver,
    });
  } catch {
    return firebaseAuth.getAuth(app);
  }
}

export const auth = createAuthInstance();
export const db = firestoreProvider.getFirestore(app);
export const functionsRuntime = functionsProvider.getFunctions(app);
export const storage = storageProvider.getStorage(app);
export const GoogleAuthProvider = authProvider.GoogleAuthProvider || firebaseAuth.GoogleAuthProvider;
export const googleProvider = new GoogleAuthProvider();

export const signInWithEmailAndPassword = (...args) => authProvider.signInWithEmailAndPassword(...args);
export const createUserWithEmailAndPassword = (...args) => authProvider.createUserWithEmailAndPassword(...args);
export const signInWithPopup = (...args) => authProvider.signInWithPopup(...args);
export const signInWithRedirect = (...args) => authProvider.signInWithRedirect(...args);
export const getRedirectResult = (...args) => authProvider.getRedirectResult(...args);
export const updateProfile = (...args) => authProvider.updateProfile(...args);
export const deleteUser = (...args) => authProvider.deleteUser(...args);
export const sendPasswordResetEmail = (...args) => authProvider.sendPasswordResetEmail(...args);
export const signOut = (...args) => authProvider.signOut(...args);
export const onAuthStateChanged = (...args) => authProvider.onAuthStateChanged(...args);

export const doc = (...args) => firestoreProvider.doc(...args);
export const collection = (...args) => firestoreProvider.collection(...args);
export const addDoc = (...args) => firestoreProvider.addDoc(...args);
export const getDoc = (...args) => firestoreProvider.getDoc(...args);
export const getDocs = (...args) => firestoreProvider.getDocs(...args);
export const setDoc = (...args) => firestoreProvider.setDoc(...args);
export const updateDoc = (...args) => firestoreProvider.updateDoc(...args);
export const deleteDoc = (...args) => firestoreProvider.deleteDoc(...args);
export const query = (...args) => firestoreProvider.query(...args);
export const orderBy = (...args) => firestoreProvider.orderBy(...args);
export const onSnapshot = (...args) => firestoreProvider.onSnapshot(...args);

export const httpsCallable = (...args) => functionsProvider.httpsCallable(...args);

function getFunctionsBaseUrl() {
  if (shouldUseEmulators) {
    const functionsPort = Number(env.VITE_FIREBASE_FUNCTIONS_PORT || 5001);
    return `http://${resolveEmulatorHost()}:${functionsPort}/${firebaseConfig.projectId}/us-central1`;
  }

  return `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net`;
}

export async function requestDeleteAccountCascade({ idToken, photoURL = '' }) {
  if (useMock && typeof mockLayer.deleteAccountCascadeRequest === 'function') {
    return mockLayer.deleteAccountCascadeRequest({ idToken, photoURL });
  }

  const response = await fetch(`${getFunctionsBaseUrl()}/deleteAccountCascade`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ photoURL }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.error || `Account deletion request failed with HTTP ${response.status}.`;

    throw new Error(message);
  }

  return response.json().catch(() => ({ ok: true }));
}

export const ref = (...args) => storageProvider.ref(...args);
export const uploadBytes = (...args) => storageProvider.uploadBytes(...args);
export const getDownloadURL = (...args) => storageProvider.getDownloadURL(...args);
export const deleteObject = (...args) => storageProvider.deleteObject(...args);

if (shouldUseEmulators && !useMock && !globalThis.__styleshiftFirebaseAuthEmulatorConnected__) {
  const authPort = Number(env.VITE_FIREBASE_AUTH_PORT || 9099);

  firebaseAuth.connectAuthEmulator(auth, `http://${resolveEmulatorHost()}:${authPort}`, {
    disableWarnings: true,
  });

  globalThis.__styleshiftFirebaseAuthEmulatorConnected__ = true;
}

if (shouldUseEmulators && !useMock && !globalThis.__styleshiftFirebaseFirestoreEmulatorConnected__) {
  const firestorePort = Number(env.VITE_FIREBASE_FIRESTORE_PORT || 8080);

  firebaseFirestore.connectFirestoreEmulator(db, resolveEmulatorHost(), firestorePort);

  globalThis.__styleshiftFirebaseFirestoreEmulatorConnected__ = true;
}

if (shouldUseEmulators && !useMock && !globalThis.__styleshiftFirebaseStorageEmulatorConnected__) {
  const storagePort = Number(env.VITE_FIREBASE_STORAGE_PORT || 9199);

  firebaseStorage.connectStorageEmulator(storage, resolveEmulatorHost(), storagePort);

  globalThis.__styleshiftFirebaseStorageEmulatorConnected__ = true;
}

if (shouldUseEmulators && !useMock && !globalThis.__styleshiftFirebaseFunctionsEmulatorConnected__) {
  const functionsPort = Number(env.VITE_FIREBASE_FUNCTIONS_PORT || 5001);

  firebaseFunctions.connectFunctionsEmulator(functionsRuntime, resolveEmulatorHost(), functionsPort);

  globalThis.__styleshiftFirebaseFunctionsEmulatorConnected__ = true;
}

