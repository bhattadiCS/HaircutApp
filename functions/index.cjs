const functions = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

initializeApp();

function resolveStoragePath(photoUrl) {
  if (typeof photoUrl !== 'string' || !photoUrl) {
    return null;
  }

  if (photoUrl.startsWith('gs://')) {
    const [, ...segments] = photoUrl.replace('gs://', '').split('/');
    return segments.join('/');
  }

  try {
    const decodedUrl = decodeURIComponent(photoUrl);
    const match = decodedUrl.match(/\/o\/([^?]+)/);
    return match?.[1] || null;
  } catch {
    return null;
  }
}

exports.syncUserHistoryMetadata = functions.firestore
  .document('users/{userId}/history/{historyId}')
  .onWrite(async (_change, context) => {
    const database = getFirestore();
    const userRef = database.collection('users').doc(context.params.userId);
    const historySnapshot = await userRef.collection('history').get();

    await userRef.set(
      {
        historyCount: historySnapshot.size,
        lastHistorySyncAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });

exports.deleteAccountCascade = functions.https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', request.headers.origin || '*');
  response.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'method-not-allowed' });
    return;
  }

  const authHeader = request.get('authorization') || '';
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);

  if (!tokenMatch) {
    response.status(401).json({ error: 'unauthenticated' });
    return;
  }

  let decodedToken;

  try {
    decodedToken = await getAuth().verifyIdToken(tokenMatch[1]);
  } catch {
    response.status(401).json({ error: 'invalid-token' });
    return;
  }

  const body = typeof request.body === 'string'
    ? JSON.parse(request.body || '{}')
    : (request.body || {});
  const uid = decodedToken.uid;
  const database = getFirestore();
  const userRef = database.collection('users').doc(uid);
  const storagePath = resolveStoragePath(body.photoURL);

  if (storagePath) {
    await getStorage().bucket().file(storagePath).delete({ ignoreNotFound: true }).catch(() => undefined);
  }

  const historySnapshot = await userRef.collection('history').get();
  const batch = database.batch();

  historySnapshot.docs.forEach((entry) => {
    batch.delete(entry.ref);
  });
  batch.delete(userRef);

  await batch.commit();

  await getAuth().deleteUser(uid);

  response.status(200).json({ ok: true });
});