import { doc, setDoc } from 'firebase/firestore';
import { describe, expect, test } from 'vitest';
import { buildUserProfile } from '../factories/userFactory';
import {
  disposeFirebaseTestClient,
  signInFirebaseTestClient,
} from '../support/firebaseClient';
import { getAdminDb } from '../support/firebaseAdmin';
import { provisionUserProfile } from '../support/profileSeeder';

describe('Firestore security rules', () => {
  test('blocks a signed-in user from writing to another user profile', async () => {
    const victim = buildUserProfile({ vibe: 'classic' });
    const intruder = buildUserProfile({ vibe: 'street' });

    await provisionUserProfile(victim, { historyEntries: [] });
    await provisionUserProfile(intruder, { historyEntries: [] });

    const intruderClient = await signInFirebaseTestClient(intruder);

    try {
      await expect(
        setDoc(
          doc(intruderClient.db, 'users', victim.uid),
          {
            vibe: 'flow',
            occupation: 'Creative/Musician',
          },
          { merge: true },
        ),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      });

      const victimSnapshot = await getAdminDb()
        .collection('users')
        .doc(victim.uid)
        .get();

      expect(victimSnapshot.data()?.vibe).toBe('classic');
    } finally {
      await disposeFirebaseTestClient(intruderClient);
    }
  });
});