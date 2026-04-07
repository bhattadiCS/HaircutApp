export const createStudioSlice = (set) => ({
  userVibe: null,
  originalImage: null,
  generatedImage: null,
  selectedStyle: null,
  analysisResult: null,
  isProcessing: false,
  processStep: '',
  history: [],
  historyIndex: -1,
  show360: false,
  setUserVibe: (userVibe) => set({ userVibe }),
  setOriginalImage: (originalImage) =>
    set({
      originalImage,
      generatedImage: null,
      selectedStyle: null,
      analysisResult: null,
    }),
  clearOriginalImage: () =>
    set({
      originalImage: null,
      generatedImage: null,
      selectedStyle: null,
      analysisResult: null,
    }),
  setGeneratedLook: ({ image, style, analysisResult }) =>
    set((state) => ({
      generatedImage: image,
      selectedStyle: style,
      analysisResult,
      history: [image, ...state.history.filter((entry) => entry !== image)].slice(0, 10),
      historyIndex: 0,
    })),
  setProcessing: (isProcessing, processStep = '') => set({ isProcessing, processStep }),
  setProcessStep: (processStep) => set({ processStep }),
  setHistory: (history) =>
    set({
      history,
      historyIndex: history.length ? 0 : -1,
    }),
  setHistoryIndex: (historyIndex) => set({ historyIndex }),
  toggle360: () => set((state) => ({ show360: !state.show360 })),
  resetStudioSession: () =>
    set({
      originalImage: null,
      generatedImage: null,
      selectedStyle: null,
      analysisResult: null,
      isProcessing: false,
      processStep: '',
      history: [],
      historyIndex: -1,
      show360: false,
    }),
});