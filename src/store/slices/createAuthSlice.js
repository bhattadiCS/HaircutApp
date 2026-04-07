export const createAuthSlice = (set) => ({
  user: null,
  userProfile: null,
  view: 'auth',
  localOnlyMode: false,
  showSettings: false,
  showEditProfile: false,
  setUser: (user) => set({ user }),
  setUserProfile: (userProfile) => set({ userProfile }),
  setView: (view) => set({ view }),
  setLocalOnlyMode: (localOnlyMode) => set({ localOnlyMode }),
  toggleLocalOnlyMode: () =>
    set((state) => ({ localOnlyMode: !state.localOnlyMode })),
  openSettings: () => set({ showSettings: true }),
  closeSettings: () => set({ showSettings: false }),
  openEditProfile: () => set({ showEditProfile: true }),
  closeEditProfile: () => set({ showEditProfile: false }),
});