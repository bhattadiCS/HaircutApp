import { describe, expect, it } from 'vitest';
import { isRecoverableAssetLoadError } from '../../src/app/errorRecovery';

describe('asset recovery helpers', () => {
  it('treats failed dynamic imports as recoverable deploy errors', () => {
    expect(
      isRecoverableAssetLoadError(new Error('Failed to fetch dynamically imported module: /assets/AuthenticatedStudioShell-old.js')),
    ).toBe(true);
    expect(isRecoverableAssetLoadError(new Error('ChunkLoadError: Loading chunk 42 failed.'))).toBe(true);
  });

  it('ignores non-asset runtime errors', () => {
    expect(isRecoverableAssetLoadError(new Error('TypeError: Cannot read properties of undefined'))).toBe(false);
  });
});