import { useState } from 'react';
import { aiFactory } from '../core/AIFactory';
import { LocalLLMContext } from '../context/LocalLLMContext';
import { buildOfflineLookPlan } from '../lib/offlineLookPlanner';

export function LocalLLMProvider({ children }) {
  const [service] = useState(() => aiFactory.createLocalLLM());
  const [runtime, setRuntime] = useState(() => ({
    status: service.profile.isConfigured ? 'idle' : 'unconfigured',
    modelLabel: service.profile.displayName,
    device: service.profile.preferredDevice,
    loadProgress: 0,
    ragCollection: service.profile.ragCollection,
    loraAdapters: service.profile.loraAdapters,
    error: null,
  }));

  async function warmup() {
    if (runtime.status === 'ready') {
      return runtime;
    }

    setRuntime((currentRuntime) => ({
      ...currentRuntime,
      status: currentRuntime.status === 'ready' ? 'ready' : 'warming',
      error: null,
    }));

    try {
      const nextRuntime = await service.warmup((progress) => {
        setRuntime((current) => ({ ...current, loadProgress: progress }));
      });

      setRuntime((currentRuntime) => ({
        ...currentRuntime,
        status: nextRuntime.status,
        device: nextRuntime.device,
        loadProgress: 100,
        error: null,
      }));

      return nextRuntime;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Local model warmup failed.';

      setRuntime((currentRuntime) => ({
        ...currentRuntime,
        status: 'degraded',
        error: message,
      }));

      return {
        status: 'degraded',
        error: message,
      };
    }
  }

  async function generateLookPlan(input) {
    const fallbackPlan = buildOfflineLookPlan(input);

    try {
      const generatedPlan = await service.generateLookPlan(
        input,
        fallbackPlan,
      );

      return generatedPlan ?? fallbackPlan;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Local plan generation failed.';

      setRuntime((currentRuntime) => ({
        ...currentRuntime,
        status:
          currentRuntime.status === 'unconfigured' ? 'unconfigured' : 'degraded',
        error: message,
      }));

      return fallbackPlan;
    }
  }

  return (
    <LocalLLMContext.Provider
      value={{
        ...runtime,
        warmup,
        generateLookPlan,
        targetProfile: service.profile,
      }}
    >
      {children}
    </LocalLLMContext.Provider>
  );
}
