import { app, firebaseStorage, mockLayer, shouldUseEmulators, useMock } from './firebaseCore';

const storageProvider = useMock ? mockLayer : firebaseStorage;

export const storage = storageProvider.getStorage(app);
export const ref = (...args) => storageProvider.ref(...args);
export const uploadBytes = (...args) => storageProvider.uploadBytes(...args);
export const getDownloadURL = (...args) => storageProvider.getDownloadURL(...args);

if (shouldUseEmulators && !globalThis.__styleshiftFirebaseStorageEmulatorConnected__) {
  const storagePort = Number(import.meta.env.VITE_FIREBASE_STORAGE_PORT || 9199);
  const host = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname;

  firebaseStorage.connectStorageEmulator(storage, host, storagePort);

  globalThis.__styleshiftFirebaseStorageEmulatorConnected__ = true;
}