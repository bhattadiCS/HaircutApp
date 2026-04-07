import { describe, expect, it } from 'vitest';
import {
  createMissingFirebaseConfigError,
  getFirebaseConfigSetupMessage,
  getFirebaseBuildGuardMessage,
  getMissingFirebaseConfigKeys,
  isMissingFirebaseConfigError,
  REQUIRED_FIREBASE_CONFIG_KEYS,
} from '../../src/lib/firebaseConfig';

function buildFirebaseEnv(overrides: Record<string, string> = {}) {
  return REQUIRED_FIREBASE_CONFIG_KEYS.reduce<Record<string, string>>((env, key) => {
    env[key] = overrides[key] ?? `${key.toLowerCase()}-value`;
    return env;
  }, {});
}

describe('firebase config helpers', () => {
  it('reports every missing Firebase config key', () => {
    expect(getMissingFirebaseConfigKeys({})).toEqual(REQUIRED_FIREBASE_CONFIG_KEYS);
  });

  it('ignores keys with non-empty values', () => {
    const env = buildFirebaseEnv({
      VITE_FIREBASE_API_KEY: 'api-key',
      VITE_FIREBASE_PROJECT_ID: 'styleshift-prod',
    });

    expect(getMissingFirebaseConfigKeys(env)).toEqual([]);
  });

  it('detects runtime Firebase config errors', () => {
    const error = createMissingFirebaseConfigError(['VITE_FIREBASE_API_KEY']);

    expect(isMissingFirebaseConfigError(error)).toBe(true);
    expect(error.message).toContain('VITE_FIREBASE_API_KEY');
    expect(getFirebaseConfigSetupMessage()).toContain('GitHub Actions repository secrets');
  });

  it('formats a production build guard message with the missing secret names', () => {
    expect(getFirebaseBuildGuardMessage(['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_APP_ID'])).toContain(
      'VITE_FIREBASE_API_KEY, VITE_FIREBASE_APP_ID',
    );
  });
});