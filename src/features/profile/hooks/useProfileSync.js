import { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import { startProfileSync } from '../lib/startProfileSync';

const idleState = {
  status: 'idle',
  error: null,
};

export function useProfileSync(user, database = db) {
  const [syncState, setSyncState] = useState(idleState);

  useEffect(() => {
    return startProfileSync({
      user,
      database,
      onStatusChange: setSyncState,
    });
  }, [database, user]);

  return syncState;
}