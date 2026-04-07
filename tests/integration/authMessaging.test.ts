import { describe, expect, it } from 'vitest';
import {
  getEmailPasswordAuthErrorMessage,
  getGoogleAuthErrorMessage,
  isLikelyNonProductionFirebaseProjectId,
} from '../../src/features/auth/lib/authMessaging';

const publicTestEnv = {
  PROD: true,
  VITE_FIREBASE_PROJECT_ID: 'test-ahutma',
};

describe('auth messaging helpers', () => {
  it('flags disabled email/password auth with the configured project id', () => {
    const message = getEmailPasswordAuthErrorMessage(
      { code: 'auth/operation-not-allowed' },
      { mode: 'signup', env: publicTestEnv },
    );

    expect(message).toContain('Email/password sign-up is disabled');
    expect(message).toContain('test-ahutma');
    expect(message).toContain('GitHub Pages Firebase secrets');
  });

  it('normalizes invalid credential failures for email login', () => {
    expect(
      getEmailPasswordAuthErrorMessage({ code: 'auth/invalid-credential' }, { mode: 'login', env: publicTestEnv }),
    ).toBe('Incorrect email or password.');
  });

  it('explains Google auth domain configuration failures', () => {
    const message = getGoogleAuthErrorMessage({ code: 'auth/unauthorized-domain' }, { env: publicTestEnv });

    expect(message).toContain('authorized domains');
    expect(message).toContain('test-ahutma');
  });

  it('recognizes non-production Firebase project ids', () => {
    expect(isLikelyNonProductionFirebaseProjectId('test-ahutma')).toBe(true);
    expect(isLikelyNonProductionFirebaseProjectId('styleshift-prod')).toBe(false);
  });
});