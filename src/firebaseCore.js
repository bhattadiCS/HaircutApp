import { getApps, initializeApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import * as firebaseFirestore from 'firebase/firestore';
import * as firebaseStorage from 'firebase/storage';
import * as mockLayer from './lib/firebaseMock';

const env = import.meta.env;

export const shouldUseEmulators =
  env.VITE_USE_FIREBASE_EMULATORS === 'true' ||
  env.MODE === 'test' ||
  Boolean(env.VITEST);

export const useMock =
  (env.DEV || env.MODE === 'development') &&
  env.VITE_USE_MOCK_FIREBASE === 'true';

function resolveFirebaseConfigValue(key, fallbackValue) {
  const value = env[key]?.trim();

  if (value) {
    return value;
  }

  if (useMock || shouldUseEmulators) {
    return fallbackValue;
  }

  throw new Error(`Missing required Firebase configuration: ${key}`);
}

const firebaseConfig = {
  apiKey: resolveFirebaseConfigValue('VITE_FIREBASE_API_KEY', 'local-emulator-api-key'),
  authDomain: resolveFirebaseConfigValue('VITE_FIREBASE_AUTH_DOMAIN', 'styleshift.local'),
  projectId: resolveFirebaseConfigValue('VITE_FIREBASE_PROJECT_ID', 'styleshift-local'),
  storageBucket: resolveFirebaseConfigValue('VITE_FIREBASE_STORAGE_BUCKET', 'styleshift-local.appspot.com'),
  messagingSenderId: resolveFirebaseConfigValue('VITE_FIREBASE_MESSAGING_SENDER_ID', '000000000'),
  appId: resolveFirebaseConfigValue('VITE_FIREBASE_APP_ID', 'local-app-id'),
};

export const app = getApps()[0] ?? initializeApp(firebaseConfig);
export { firebaseAuth, firebaseFirestore, firebaseStorage, mockLayer };