export const REQUIRED_FIREBASE_CONFIG_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

export function getMissingFirebaseConfigKeys(env) {
  return REQUIRED_FIREBASE_CONFIG_KEYS.filter((key) => {
    const value = env?.[key];
    return typeof value !== 'string' || value.trim() === '';
  });
}

export function isMissingFirebaseConfigError(error) {
  return typeof error?.message === 'string' && error.message.startsWith('Missing required Firebase configuration:');
}

export function getFirebaseConfigSetupMessage() {
  return 'This deployment is missing Firebase web config. Login is unavailable until the VITE_FIREBASE_* values are added to the GitHub Pages build.';
}