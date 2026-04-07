import { describe, expect, test } from 'vitest';
import { startProfileSync } from '../../src/features/profile/lib/startProfileSync';
import { useAppStore } from '../../src/store/useAppStore';
import { buildUserProfile } from '../factories/userFactory';
import {
  disposeFirebaseTestClient,
  signInFirebaseTestClient,
} from '../support/firebaseClient';
import { getAdminDb } from '../support/firebaseAdmin';
import { provisionUserProfile } from '../support/profileSeeder';

async function waitForState(assertion, timeout = 5_000) {
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < timeout) {
    try {
      assertion();
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => {
        window.setTimeout(resolve, 50);
      });
    }
  }

  throw lastError;
}

describe('useProfileSync', () => {
  test('streams profile and history updates from Firestore into Zustand', async () => {
    const seededHistory = [
      {
        id: 'history-seed-a',
        image: 'https://styleshift.local/history/seed-a.png',
        styleId: 'fade' as const,
        barberBrief: 'Keep the ridge compact and preserve temple softness.',
        createdAt: new Date('2026-04-04T08:00:00.000Z'),
      },
    ];
    const liveHistoryEntry = {
      id: 'history-seed-b',
      image: 'https://styleshift.local/history/seed-b.png',
      styleId: 'middle' as const,
      barberBrief: 'Open the fringe and retain movement through the top.',
      createdAt: new Date('2026-04-04T10:00:00.000Z'),
    };
    const profile = buildUserProfile({
      vibe: 'classic',
      history: seededHistory,
    });

    await provisionUserProfile(profile, { historyEntries: seededHistory });
    const client = await signInFirebaseTestClient(profile);
    const statusEvents = [];

    useAppStore.setState(
      {
        ...useAppStore.getInitialState(),
        user: {
          uid: profile.uid,
          email: profile.email,
        },
        view: 'quiz',
      },
      true,
    );

    const stopSync = startProfileSync({
      user: {
        uid: profile.uid,
        email: profile.email,
      },
      database: client.db,
      onStatusChange: (nextStatus) => {
        statusEvents.push(nextStatus);
      },
    });

    try {
      await waitForState(() => {
        const lastStatus = statusEvents.at(-1);
        expect(
          lastStatus?.status === 'error'
            ? `error:${lastStatus.error}`
            : lastStatus?.status,
        ).toBe('ready');
      });

      await waitForState(() => {
        const state = useAppStore.getState();

        expect(state.userProfile?.uid).toBe(profile.uid);
        expect(state.userVibe).toBe('classic');
        expect(state.view).toBe('mirror');
        expect(state.history).toEqual(['https://styleshift.local/history/seed-a.png']);
      });

      await getAdminDb().collection('users').doc(profile.uid).set(
        {
          vibe: 'flow',
          occupation: 'Creative/Musician',
        },
        { merge: true },
      );
      await getAdminDb()
        .collection('users')
        .doc(profile.uid)
        .collection('history')
        .doc(liveHistoryEntry.id)
        .set({
          image: liveHistoryEntry.image,
          styleId: liveHistoryEntry.styleId,
          barberBrief: liveHistoryEntry.barberBrief,
          timestamp: liveHistoryEntry.createdAt,
        });

      await waitForState(() => {
        const state = useAppStore.getState();

        expect(state.userVibe).toBe('flow');
        expect(state.userProfile?.occupation).toBe('Creative/Musician');
        expect(state.history[0]).toBe('https://styleshift.local/history/seed-b.png');
      });
    } finally {
      stopSync();
      await disposeFirebaseTestClient(client);
    }
  });
});