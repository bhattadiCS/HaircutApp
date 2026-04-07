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
        const { setUser, setUserProfile, setView, resetStudioSession } = get();
        setUser(null);
        setUserProfile(null);
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