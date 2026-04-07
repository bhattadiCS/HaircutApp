import { useEffect } from 'react';
import { useProfileSync } from '../../profile/hooks/useProfileSync';
import { useAppStore } from '../../../store/useAppStore';

let firebaseModulePromise;
let firestoreModulePromise;

function loadFirebaseModule() {
  firebaseModulePromise ??= import('../../../firebaseAuth');
  return firebaseModulePromise;
}

function loadFirestoreModule() {
  firestoreModulePromise ??= import('../../../firebaseFirestore');
  return firestoreModulePromise;
}

function shouldPreferRedirectSignIn() {
  const userAgent = globalThis.navigator?.userAgent || '';
  const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
  const isStandalone =
    globalThis.navigator?.standalone === true ||
    globalThis.matchMedia?.('(display-mode: standalone)').matches === true;

  return isMobile || isStandalone;
}

function getGoogleAuthErrorMessage(error) {
  switch (error?.code) {
    case 'auth/unauthorized-domain':
      return 'Google sign-in is blocked until this domain is added to Firebase Authentication.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is disabled in Firebase Authentication for this project.';
    case 'auth/operation-not-supported-in-this-environment':
      return 'This browser cannot complete Google sign-in with a popup. Redirect sign-in will be used instead.';
    default:
      return 'Google sign-in is unavailable. Check Firebase auth or use email instead.';
  }
}

export function useAuthBootstrap() {
  const user = useAppStore((state) => state.user);
  const userVibe = useAppStore((state) => state.userVibe);
  const view = useAppStore((state) => state.view);
  const setUser = useAppStore((state) => state.setUser);
  const setView = useAppStore((state) => state.setView);
  const setUserVibe = useAppStore((state) => state.setUserVibe);
  const setToast = useAppStore((state) => state.setToast);
  const setProcessing = useAppStore((state) => state.setProcessing);
  const signOutReset = useAppStore((state) => state.signOutReset);

  const shouldSyncProfile = Boolean(user) && !['auth', 'quiz', 'mirror', 'magic'].includes(view);

  useProfileSync(shouldSyncProfile ? user : null);

  useEffect(() => {
    let isCancelled = false;
    let unsubscribe = () => {};

    loadFirebaseModule()
      .then(async ({ auth, onAuthStateChanged, getRedirectResult }) => {
        if (isCancelled) {
          return;
        }

        // Handle redirect result if coming back from Google Sign-In on mobile
        try {
          const result = await getRedirectResult(auth);
          if (result?.user) {
            setUser(result.user);
            setView(userVibe ? 'mirror' : 'quiz');
          }
        } catch (error) {
          console.error('Redirect auth error:', error);
          setToast({
            message: 'Sign-in failed. Please try again.',
            type: 'error',
          });
        }

        unsubscribe = onAuthStateChanged(auth, (nextUser) => {
          if (nextUser) {
            setUser(nextUser);
            setView(userVibe ? 'mirror' : 'quiz');
            return;
          }

          signOutReset();
        });
      })
      .catch(() => {
        signOutReset();
      });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [setToast, signOutReset, setUser, setView, userVibe]);

  async function loginWithGoogle() {
    setProcessing(true, 'Opening secure sign-in...');

    try {
      const { auth, GoogleAuthProvider, signInWithPopup, signInWithRedirect } = await loadFirebaseModule();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters?.({ prompt: 'select_account' });

      if (shouldPreferRedirectSignIn()) {
        await signInWithRedirect(auth, provider);
      } else {
        try {
          await signInWithPopup(auth, provider);
        } catch (error) {
          if (
            error?.code === 'auth/popup-blocked' ||
            error?.code === 'auth/cancelled-popup-request' ||
            error?.code === 'auth/operation-not-supported-in-this-environment'
          ) {
            await signInWithRedirect(auth, provider);
            return;
          }

          throw error;
        }
      }
    } catch (error) {
      if (error?.code !== 'auth/popup-closed-by-user') {
        console.error('Google sign-in failed:', error);
        setToast({
          message: getGoogleAuthErrorMessage(error),
          type: 'error',
        });
      }
    } finally {
      setProcessing(false);
    }
  }


  async function persistVibeSelection(vibeId) {
    setUserVibe(vibeId);
    setView('mirror');

    const { auth } = await loadFirebaseModule();

    if (typeof auth.authStateReady === 'function') {
      await auth.authStateReady();
    }

    const activeUser = user ?? auth.currentUser;

    if (!activeUser) {
      return;
    }

    try {
      if (typeof activeUser.getIdToken === 'function') {
        await activeUser.getIdToken();
      }

      const { db, doc, setDoc } = await loadFirestoreModule();

      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          await setDoc(doc(db, 'users', activeUser.uid), { vibe: vibeId }, { merge: true });
          return;
        } catch (error) {
          if (attempt === 2) {
            throw error;
          }

          await new Promise((resolve) => globalThis.setTimeout(resolve, 250 * (attempt + 1)));
        }
      }
    } catch (error) {
      console.error('Error saving vibe selection:', error);
    }
  }

  return {
    loginWithGoogle,
    persistVibeSelection,
  };
}