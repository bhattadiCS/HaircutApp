import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { applyTestEnvironment, TEST_FIREBASE_PROJECT_ID } from '../test-setup';

applyTestEnvironment();

function getAdminApp() {
  return (
    getApps()[0] ||
    initializeApp({
      projectId: TEST_FIREBASE_PROJECT_ID,
    })
  );
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}