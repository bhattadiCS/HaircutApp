import { describe, expect, test } from 'vitest';
import { buildShareRequest } from '../../src/features/share/lib/shareExport';

describe('share export payloads', () => {
  test('includes an image file when native file sharing is available', () => {
    const file = new File(['png-data'], 'styleshift-preview.png', { type: 'image/png' });

    const payload = buildShareRequest({
      file,
      shareUrl: 'https://styleshift.local/look',
      title: 'StyleShift Preview',
      text: 'StyleShift consultation card exported locally.',
      supportsNativeFileShare: true,
    });

    expect(payload).toEqual({
      title: 'StyleShift Preview',
      text: 'StyleShift consultation card exported locally.',
      files: [file],
    });
    expect('url' in payload).toBe(false);
  });

  test('falls back to a link payload when file sharing is unavailable', () => {
    const payload = buildShareRequest({
      shareUrl: 'https://styleshift.local/look',
      title: 'StyleShift Preview',
      text: 'StyleShift consultation card exported locally.',
      supportsNativeFileShare: false,
    });

    expect(payload).toEqual({
      title: 'StyleShift Preview',
      text: 'StyleShift consultation card exported locally.',
      url: 'https://styleshift.local/look',
    });
  });
});