import { beforeEach, describe, expect, test } from 'vitest';
import { useAppStore } from '../../src/store/useAppStore';

describe('session isolation store reset', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true);
  });

  test('clears persisted vibe, overlays, toasts, and studio state on sign out', () => {
    useAppStore.setState(
      {
        ...useAppStore.getInitialState(),
        user: { uid: 'user-a', email: 'user-a@example.com' },
        userProfile: { uid: 'user-a', vibe: 'street', bio: 'Keeps the blend clean.' },
        userVibe: 'street',
        view: 'share',
        showSettings: true,
        showEditProfile: true,
        originalImage: 'data:image/png;base64,one',
        generatedImage: 'data:image/png;base64,two',
        history: ['data:image/png;base64,two'],
        refinementNote: 'More volume',
        toast: { message: 'Saved.', type: 'success' },
      },
      true,
    );

    useAppStore.getState().signOutReset();

    const state = useAppStore.getState();

    expect(state.user).toBeNull();
    expect(state.userProfile).toBeNull();
    expect(state.userVibe).toBeNull();
    expect(state.view).toBe('auth');
    expect(state.showSettings).toBe(false);
    expect(state.showEditProfile).toBe(false);
    expect(state.originalImage).toBeNull();
    expect(state.generatedImage).toBeNull();
    expect(state.history).toEqual([]);
    expect(state.refinementNote).toBe('');
    expect(state.toast).toBeNull();
  });
});