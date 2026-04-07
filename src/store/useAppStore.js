import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createAuthSlice } from './slices/createAuthSlice';
import { createStudioSlice } from './slices/createStudioSlice';
import { createVisualSlice } from './slices/createVisualSlice';

export const useAppStore = create(
  persist(
    (set, get, ...args) => ({
      ...createAuthSlice(set, get, ...args),
      ...createStudioSlice(set, get, ...args),
      ...createVisualSlice(set, get, ...args),
      signOutReset: () => {
        const {
          clearToast,
          closeEditProfile,
          closeSettings,
          resetStudioSession,
          setUser,
          setUserProfile,
          setUserVibe,
          setView,
        } = get();
        clearToast();
        closeSettings();
        closeEditProfile();
        setUser(null);
        setUserProfile(null);
        setUserVibe(null);
        setView('auth');
        resetStudioSession();
      },
    }),
    {
      name: 'styleshift-storage',
      partialize: (state) => ({
        userVibe: state.userVibe,
        userProfile: state.userProfile,
        localOnlyMode: state.localOnlyMode,
      }),
    }
  )
);