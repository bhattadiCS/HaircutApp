import { useEffect, useState } from 'react';
import { startProfileSync } from '../lib/startProfileSync';
import { useAppStore } from '../../../store/useAppStore';

const idleState = {
  status: 'idle',
  error: null,
};

function scheduleIdleTask(callback) {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    const idleCallbackId = window.requestIdleCallback(callback, { timeout: 2000 });

    return () => window.cancelIdleCallback(idleCallbackId);
  }

  const timeoutId = window.setTimeout(callback, 1200);

  return () => window.clearTimeout(timeoutId);
}

export function useProfileSync(user, database) {
  useAppStore((state) => state.setHistory);
  useAppStore((state) => state.setUserProfile);
  useAppStore((state) => state.setUserVibe);
  useAppStore((state) => state.setView);
  const [syncState, setSyncState] = useState(idleState);
  const [resolvedDatabase, setResolvedDatabase] = useState(database ?? null);

  useEffect(() => {
    if (!user) {
      setResolvedDatabase(database ?? null);
      return undefined;
    }

    if (database) {
      setResolvedDatabase(database);
      return undefined;
    }

    let isCancelled = false;
    let cancelScheduledImport = () => {};

    cancelScheduledImport = scheduleIdleTask(() => {
      import('../../../firebaseFirestore')
        .then((firebaseModule) => {
          if (!isCancelled) {
            setResolvedDatabase(firebaseModule.db);
          }
        })
        .catch((error) => {
          const message =
            error instanceof Error ? error.message : 'Unable to load Firestore.';

          setSyncState({
            status: 'error',
            error: message,
          });
        });
    });

    return () => {
      isCancelled = true;
      cancelScheduledImport();
    };
  }, [database, user]);

  useEffect(() => {
    if (!resolvedDatabase) {
      return undefined;
    }

    return startProfileSync({
      user,
      database: resolvedDatabase,
      onStatusChange: setSyncState,
    });
  }, [resolvedDatabase, user]);

  return syncState;
}