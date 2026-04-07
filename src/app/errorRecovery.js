const ASSET_LOAD_ERROR_PATTERN = /Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError|Loading chunk [^\s]+ failed/i;
const ASSET_RECOVERY_SESSION_KEY = 'styleshift:asset-recovery';

async function unregisterServiceWorkers() {
  const registrations = await globalThis.navigator?.serviceWorker?.getRegistrations?.();

  if (!registrations?.length) {
    return;
  }

  await Promise.allSettled(registrations.map((registration) => registration.unregister()));
}

async function clearCacheStorage() {
  const cacheKeys = await globalThis.caches?.keys?.();

  if (!cacheKeys?.length) {
    return;
  }

  await Promise.allSettled(cacheKeys.map((cacheKey) => globalThis.caches.delete(cacheKey)));
}

export function isRecoverableAssetLoadError(error) {
  const message = typeof error?.message === 'string' ? error.message : String(error || '');

  return ASSET_LOAD_ERROR_PATTERN.test(message);
}

export function hasAttemptedAssetRecovery() {
  try {
    return globalThis.sessionStorage?.getItem(ASSET_RECOVERY_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function resetAssetRecoveryMarker() {
  try {
    globalThis.sessionStorage?.removeItem(ASSET_RECOVERY_SESSION_KEY);
  } catch {
    // Ignore storage failures in private browsing or restricted contexts.
  }
}

export async function recoverFromAssetLoadError() {
  if (!globalThis.location?.href || hasAttemptedAssetRecovery()) {
    return false;
  }

  try {
    globalThis.sessionStorage?.setItem(ASSET_RECOVERY_SESSION_KEY, '1');
  } catch {
    // Ignore storage failures in private browsing or restricted contexts.
  }

  await Promise.allSettled([unregisterServiceWorkers(), clearCacheStorage()]);

  const reloadUrl = new URL(globalThis.location.href);
  reloadUrl.searchParams.set('reload', Date.now().toString());

  if (typeof globalThis.location.replace === 'function') {
    globalThis.location.replace(reloadUrl.toString());
    return true;
  }

  if (typeof globalThis.location.reload === 'function') {
    globalThis.location.reload();
    return true;
  }

  return false;
}