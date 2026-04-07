import { useEffect } from 'react';
import {
  auth,
  db,
  doc,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  setDoc,
  signInWithPopup,
  signInWithRedirect,
} from '../../../firebase';
import { useProfileSync } from '../../profile/hooks/useProfileSync';
import { useAppStore } from '../../../store/useAppStore';
import {
  getFirebaseConfigSetupMessage,
  isMissingFirebaseConfigError,
} from '../../../lib/firebaseConfig';
import { getGoogleAuthErrorMessage } from '../lib/authMessaging';

function shouldPreferRedirectSignIn() {
  const userAgent = globalThis.navigator?.userAgent || '';
  const platform = globalThis.navigator?.platform || '';
  const touchPoints = Number(globalThis.navigator?.maxTouchPoints || 0);
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent) || (/Mac/i.test(platform) && touchPoints > 1);
  const isSafari = /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(userAgent);
  const isStandalone =
    globalThis.navigator?.standalone === true ||
    globalThis.matchMedia?.('(display-mode: standalone)').matches === true;

  return isStandalone || (isIOS && isSafari);
}
export function useAuthBootstrap() {
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const setView = useAppStore((state) => state.setView);
  const setUserVibe = useAppStore((state) => state.setUserVibe);
  const setToast = useAppStore((state) => state.setToast);
  const setProcessing = useAppStore((state) => state.setProcessing);
  const signOutReset = useAppStore((state) => state.signOutReset);

  useProfileSync(user);

  useEffect(() => {
    let isCancelled = false;
    let unsubscribe = () => {};

    const bootstrapAuth = async () => {
      try {
        const result = await getRedirectResult(auth);

        if (!isCancelled && result?.user) {
          setUser(result.user);
          setView('quiz');
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Redirect auth error:', error);
          setToast({
            message: getGoogleAuthErrorMessage(error),
            type: 'error',
          });
        }
      }

      if (isCancelled) {
        return;
      }

      try {
        unsubscribe = onAuthStateChanged(auth, (nextUser) => {
          if (isCancelled) {
            return;
          }

          if (nextUser) {
            setUser(nextUser);
            setView('quiz');
            return;
          }

          signOutReset();
        });
      } catch (error) {
        if (!isCancelled && isMissingFirebaseConfigError(error)) {
          setToast({
            message: getFirebaseConfigSetupMessage(),
            type: 'error',
          });
        }

        signOutReset();
      }
    };

    bootstrapAuth();

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [setToast, signOutReset, setUser, setView]);

  async function loginWithGoogle() {
    setProcessing(true, 'Opening secure sign-in...');

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters?.({ prompt: 'select_account' });

      if (shouldPreferRedirectSignIn()) {
        await signInWithRedirect(auth, provider);
        return;
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