import { collection, doc, onSnapshot, orderBy, query } from '../../../firebase';
import { useAppStore } from '../../../store/useAppStore';

const idleState = {
  status: 'idle',
  error: null,
};

export function startProfileSync({ user, database, onStatusChange }) {
  const emitStatus = onStatusChange || (() => {});
  const setHistory = useAppStore.getState().setHistory;
  const setUserProfile = useAppStore.getState().setUserProfile;
  const setUserVibe = useAppStore.getState().setUserVibe;
  const setView = useAppStore.getState().setView;

  if (!user) {
    setHistory([]);
    setUserProfile(null);
    emitStatus(idleState);
    return () => {};
  }

  emitStatus({
    status: 'loading',
    error: null,
  });

  let profileLoaded = false;
  let historyLoaded = false;

  const markReady = () => {
    if (profileLoaded && historyLoaded) {
      emitStatus({
        status: 'ready',
        error: null,
      });
    }
  };

  const profileRef = doc(database, 'users', user.uid);
  const historyQuery = query(
    collection(database, 'users', user.uid, 'history'),
    orderBy('timestamp', 'desc'),
  );

  const unsubscribeProfile = onSnapshot(
    profileRef,
    (snapshot) => {
      const profile = snapshot.exists()
        ? {
            id: snapshot.id,
            ...snapshot.data(),
          }
        : null;

      setUserProfile(profile);

      if (profile?.vibe) {
        setUserVibe(profile.vibe);

        const currentView = useAppStore.getState().view;
        if (currentView === 'auth' || currentView === 'quiz') {
          setView('mirror');
        }
      }

      profileLoaded = true;
      markReady();
    },
    (error) => {
      const message =
        error instanceof Error ? error.message : 'Profile sync failed.';

      emitStatus({
        status: 'error',
        error: message,
      });
    },
  );

  const unsubscribeHistory = onSnapshot(
    historyQuery,
    (snapshot) => {
      setHistory(
        snapshot.docs
          .map((entry) => entry.data().image)
          .filter(Boolean),
      );

      historyLoaded = true;
      markReady();
    },
    (error) => {
      const message =
        error instanceof Error ? error.message : 'History sync failed.';

      emitStatus({
        status: 'error',
        error: message,
      });
    },
  );

  return () => {
    unsubscribeProfile();
    unsubscribeHistory();
  };
}