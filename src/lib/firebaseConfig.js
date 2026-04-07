export const REQUIRED_FIREBASE_CONFIG_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

export const FIREBASE_CONFIG_ERROR_PREFIX = 'Missing required Firebase configuration:';

export function getMissingFirebaseConfigKeys(env) {
  return REQUIRED_FIREBASE_CONFIG_KEYS.filter((key) => {
    const value = env?.[key];
    return typeof value !== 'string' || value.trim() === '';
  });
}

export function createMissingFirebaseConfigError(missingKeys = REQUIRED_FIREBASE_CONFIG_KEYS) {
  return new Error(
    `${FIREBASE_CONFIG_ERROR_PREFIX} ${missingKeys.join(', ')}. ${getFirebaseConfigSetupMessage(missingKeys)}`,
  );
}

export function isMissingFirebaseConfigError(error) {
  return typeof error?.message === 'string' && error.message.startsWith(FIREBASE_CONFIG_ERROR_PREFIX);
}

export function getFirebaseConfigSetupMessage(missingKeys = REQUIRED_FIREBASE_CONFIG_KEYS) {
  return `This deployment is missing Firebase web config. Add these GitHub Actions repository secrets before deploying: ${missingKeys.join(', ')}.`;
}

export function getFirebaseBuildGuardMessage(missingKeys = REQUIRED_FIREBASE_CONFIG_KEYS) {
  return `Production builds require Firebase web config. Add these GitHub Actions repository secrets before deploying: ${missingKeys.join(', ')}.`;
}