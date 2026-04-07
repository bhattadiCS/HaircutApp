export const createVisualSlice = (set) => ({
  toast: null,
  setToast: (toast) => set({ toast }),
  clearToast: () => set({ toast: null }),
});