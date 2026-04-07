import {
  getFirebaseConfigSetupMessage,
  isMissingFirebaseConfigError,
} from '../../../lib/firebaseConfig';

const NON_PRODUCTION_PROJECT_PATTERN = /(^|[-_])(test|dev|demo|staging|local)([-_]|$)/i;

function stripFirebasePrefix(message, fallbackMessage) {
  const normalizedMessage = typeof message === 'string' ? message.replace(/^Firebase:\s*/i, '').trim() : '';

  return normalizedMessage || fallbackMessage;
}

function getProjectReference(projectId) {
  return projectId ? `Firebase project "${projectId}"` : 'the configured Firebase project';
}

function getPublicDeployHint(projectId) {
  if (!isLikelyNonProductionFirebaseProjectId(projectId)) {
    return '';
  }

  return ' This deployment appears to be using a non-production Firebase project. Update the GitHub Pages Firebase secrets if that is not intended.';
}

export function getFirebaseProjectId(env = import.meta.env) {
  const projectId = env?.VITE_FIREBASE_PROJECT_ID;

  return typeof projectId === 'string' && projectId.trim() ? projectId.trim() : 'unknown';
}

export function isLikelyNonProductionFirebaseProjectId(projectId) {
  return typeof projectId === 'string' && NON_PRODUCTION_PROJECT_PATTERN.test(projectId.trim());
}

export function getEmailPasswordAuthErrorMessage(error, { mode = 'login', env = import.meta.env } = {}) {
  if (isMissingFirebaseConfigError(error)) {
    return getFirebaseConfigSetupMessage();
  }

  const projectId = getFirebaseProjectId(env);
  const flowLabel = mode === 'signup' ? 'Email/password sign-up' : 'Email/password login';
  const publicDeployHint = getPublicDeployHint(projectId);

  switch (error?.code) {
    case 'auth/operation-not-allowed':
      return `${flowLabel} is disabled in ${getProjectReference(projectId)}. Enable the Email/Password provider in Firebase Authentication or update the GitHub Pages Firebase secrets.${publicDeployHint}`;
    case 'auth/configuration-not-found':
      return `Authentication is not fully configured in ${getProjectReference(projectId)}.${publicDeployHint}`;
    case 'auth/email-already-in-use':
      return 'That email is already in use. Log in instead or reset the password.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Incorrect email or password.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/weak-password':
      return 'Use a password with at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a minute and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return stripFirebasePrefix(error?.message, 'An unexpected error occurred during sign-in.');
  }
}

export function getGoogleAuthErrorMessage(error, { env = import.meta.env } = {}) {
  if (isMissingFirebaseConfigError(error)) {
    return getFirebaseConfigSetupMessage();
  }

  const projectId = getFirebaseProjectId(env);
  const publicDeployHint = getPublicDeployHint(projectId);
  const currentHost = globalThis.location?.hostname;

  switch (error?.code) {
    case 'auth/unauthorized-domain':
      return `Google sign-in is blocked until ${currentHost || 'this domain'} is added to Firebase Authentication authorized domains for ${getProjectReference(projectId)}.${publicDeployHint}`;
    case 'auth/operation-not-allowed':
      return `Google sign-in is disabled in ${getProjectReference(projectId)}. Enable the Google provider in Firebase Authentication or update the GitHub Pages Firebase secrets.${publicDeployHint}`;
    case 'auth/configuration-not-found':
      return `Google sign-in is not fully configured in ${getProjectReference(projectId)}.${publicDeployHint}`;
    case 'auth/operation-not-supported-in-this-environment':
      return 'This browser cannot finish Google sign-in in a popup. Redirect sign-in will be used instead.';
    case 'auth/popup-blocked':
      return 'The Google sign-in popup was blocked. Try again and allow the popup, or continue with redirect sign-in.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return stripFirebasePrefix(error?.message, `Google sign-in is unavailable in ${getProjectReference(projectId)}.`);
  }
}