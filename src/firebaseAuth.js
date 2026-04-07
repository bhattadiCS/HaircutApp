import { app, firebaseAuth, mockLayer, shouldUseEmulators, useMock } from './firebaseCore';

const authProvider = useMock ? mockLayer : firebaseAuth;

function createAuthInstance() {
  if (useMock) {
    return authProvider.getAuth(app);
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
export const GoogleAuthProvider = authProvider.GoogleAuthProvider || firebaseAuth.GoogleAuthProvider;
export const googleProvider = new GoogleAuthProvider();

// Export functions directly to avoid TDZ issues with top-level destructuring
export const signInWithEmailAndPassword = (...args) => authProvider.signInWithEmailAndPassword(...args);
export const createUserWithEmailAndPassword = (...args) => authProvider.createUserWithEmailAndPassword(...args);
export const signInWithPopup = (...args) => authProvider.signInWithPopup(...args);
export const signInWithRedirect = (...args) => authProvider.signInWithRedirect(...args);
export const getRedirectResult = (...args) => authProvider.getRedirectResult(...args);
export const updateProfile = (...args) => authProvider.updateProfile(...args);
export const sendPasswordResetEmail = (...args) => authProvider.sendPasswordResetEmail(...args);
export const signOut = (...args) => authProvider.signOut(...args);
export const onAuthStateChanged = (...args) => authProvider.onAuthStateChanged(...args);

if (shouldUseEmulators && !globalThis.__styleshiftFirebaseAuthEmulatorConnected__) {
  const authPort = Number(import.meta.env.VITE_FIREBASE_AUTH_PORT || 9099);
  // Use window.location.hostname for mobile connectivity to emulators
  const host = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname;

  firebaseAuth.connectAuthEmulator(auth, `http://${host}:${authPort}`, {
    disableWarnings: true,
  });

  globalThis.__styleshiftFirebaseAuthEmulatorConnected__ = true;
}
