import { describe, expect, it } from 'vitest';
import {
  getFirebaseConfigSetupMessage,
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
    const error = new Error('Missing required Firebase configuration: VITE_FIREBASE_API_KEY');

    expect(isMissingFirebaseConfigError(error)).toBe(true);
    expect(getFirebaseConfigSetupMessage()).toContain('VITE_FIREBASE_*');
  });
});