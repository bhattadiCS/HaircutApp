const functions = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');

initializeApp();

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