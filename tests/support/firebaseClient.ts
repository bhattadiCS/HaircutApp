import { deleteApp, initializeApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  connectFirestoreEmulator,
  initializeFirestore,
} from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import type { StyleShiftTestProfile } from '../factories/userFactory';
import {
  applyTestEnvironment,
  TEST_ENV,
  TEST_FIREBASE_PORTS,
} from '../test-setup';

applyTestEnvironment();

type FirebaseTestClient = ReturnType<typeof createFirebaseTestClient>;

export function createFirebaseTestClient(
  appName = `styleshift-test-${crypto.randomUUID()}`,
) {
  const app = initializeApp(
    {
      apiKey: TEST_ENV.VITE_FIREBASE_API_KEY,
      authDomain: TEST_ENV.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: TEST_ENV.VITE_FIREBASE_PROJECT_ID,
      storageBucket: TEST_ENV.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: TEST_ENV.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: TEST_ENV.VITE_FIREBASE_APP_ID,
    },
    appName,
  );

  const auth = getAuth(app);
  const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
  });
  const storage = getStorage(app);

  connectAuthEmulator(
    auth,
    `http://127.0.0.1:${TEST_FIREBASE_PORTS.auth}`,
    { disableWarnings: true },
  );
  connectFirestoreEmulator(db, '127.0.0.1', TEST_FIREBASE_PORTS.firestore);
  connectStorageEmulator(storage, '127.0.0.1', TEST_FIREBASE_PORTS.storage);

  return {
    app,
    auth,
    db,
    storage,
  };
}

export async function signInFirebaseTestClient(
  profile: StyleShiftTestProfile,
  appName?: string,
) {
  const client = createFirebaseTestClient(appName);
  await signInWithEmailAndPassword(client.auth, profile.email, profile.password);

  if (typeof client.auth.authStateReady === 'function') {
    await client.auth.authStateReady();
  }

  if (client.auth.currentUser) {
    await client.auth.currentUser.getIdToken();
  }

  return client;
}

export async function disposeFirebaseTestClient(client: FirebaseTestClient) {
  try {
    await client.auth.signOut();
  } catch {
    // Ignore sign-out cleanup failures.
  }

  await deleteApp(client.app);
}