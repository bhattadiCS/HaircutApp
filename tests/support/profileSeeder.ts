import { getAdminDb, getAdminAuth } from './firebaseAdmin';
import type {
  StyleShiftTestHistoryEntry,
  StyleShiftTestProfile,
} from '../factories/userFactory';

type ProvisionOptions = {
  historyEntries?: StyleShiftTestHistoryEntry[];
};

export async function provisionUserProfile(
  profile: StyleShiftTestProfile,
  options: ProvisionOptions = {},
) {
  const adminAuth = getAdminAuth();
  const adminDb = getAdminDb();

  try {
    await adminAuth.createUser({
      uid: profile.uid,
      email: profile.email,
      password: profile.password,
      displayName: profile.displayName,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    if (!message.includes('uid-already-exists') && !message.includes('email-already-exists')) {
      throw error;
    }
  }

  await adminDb.collection('users').doc(profile.uid).set(
    {
      uid: profile.uid,
      displayName: profile.displayName,
      email: profile.email,
      vibe: profile.vibe,
      bio: profile.bio,
      occupation: profile.occupation,
      facialFeatures: profile.facialFeatures,
      preferences: profile.preferences,
      createdAt: new Date(),
    },
    { merge: true },
  );

  const historyEntries = options.historyEntries ?? profile.history;
  await Promise.all(
    historyEntries.map((entry) =>
      adminDb
        .collection('users')
        .doc(profile.uid)
        .collection('history')
        .doc(entry.id)
        .set({
          image: entry.image,
          styleId: entry.styleId,
          barberBrief: entry.barberBrief,
          timestamp: entry.createdAt,
        }),
    ),
  );

  return profile;
}