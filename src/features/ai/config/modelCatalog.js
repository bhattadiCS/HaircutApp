const configuredModelId = import.meta.env.VITE_LOCAL_LLM_MODEL?.trim() ?? '';

const gemma4LocalTarget = Object.freeze({
  key: 'gemma4Local',
  displayName: 'Gemma 4 Local Concierge',
  modelId: configuredModelId,
  task: 'text-generation',
  preferredDevice: 'webgpu',
  fallbackDevice: 'wasm',
  dtype: 'q4',
  ragCollection: 'barber_vdb',
  targetWeights: 'Gemma 4 quantized WebGPU target',
  warmupPrompt: 'You are StyleShift, a concise local salon strategist.',
  isConfigured: Boolean(configuredModelId),
  loraAdapters: [
    { key: 'fade-textures', label: 'Fade Textures', status: 'planned' },
    { key: 'long-hair-flow', label: 'Long Hair Flow', status: 'planned' },
    { key: 'beard-grooming', label: 'Beard Grooming', status: 'planned' },
  ],
});

export const MODEL_CATALOG = Object.freeze({
  gemma4Local: gemma4LocalTarget,
});

export function resolveModelConfig(key = 'gemma4Local') {
  return MODEL_CATALOG[key] ?? gemma4LocalTarget;
}