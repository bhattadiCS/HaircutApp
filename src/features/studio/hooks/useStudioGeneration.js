import { startTransition, useCallback, useEffect, useRef } from 'react';
import { addDoc, collection, db } from '../../../firebase';
import { useAppStore } from '../../../store/useAppStore';
import { generateStudioSimulation } from '../lib/localPreviewGenerator';

function delay(timeout, signal) {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort);
      resolve();
    }, timeout);

    function handleAbort() {
      window.clearTimeout(timeoutId);
      reject(signal?.reason ?? new DOMException('Generation cancelled.', 'AbortError'));
    }

    if (signal?.aborted) {
      handleAbort();
      return;
    }

    signal?.addEventListener('abort', handleAbort, { once: true });
  });
}

function isAbortError(error) {
  return error instanceof DOMException
    ? error.name === 'AbortError'
    : error?.name === 'AbortError';
}

export function useStudioGeneration({ aiRuntime, getVisionSnapshot }) {
  const user = useAppStore((state) => state.user);
  const userVibe = useAppStore((state) => state.userVibe);
  const view = useAppStore((state) => state.view);
  const originalImage = useAppStore((state) => state.originalImage);
  const localOnlyMode = useAppStore((state) => state.localOnlyMode);
  const setView = useAppStore((state) => state.setView);
  const setProcessing = useAppStore((state) => state.setProcessing);
  const setProcessStep = useAppStore((state) => state.setProcessStep);
  const setRefinementNote = useAppStore((state) => state.setRefinementNote);
  const setGeneratedLook = useAppStore((state) => state.setGeneratedLook);
  const setToast = useAppStore((state) => state.setToast);
  const activeGenerationRef = useRef(null);

  const cancelActiveGeneration = useCallback((reason = 'Generation cancelled.') => {
    if (!activeGenerationRef.current) {
      return;
    }

    activeGenerationRef.current.abort(new DOMException(reason, 'AbortError'));
    activeGenerationRef.current = null;
    setProcessing(false);
    setProcessStep('');
  }, [setProcessing, setProcessStep]);

  useEffect(() => {
    if (view !== 'magic') {
      cancelActiveGeneration('Generation stopped after leaving Magic Studio.');
    }
  }, [cancelActiveGeneration, view]);

  useEffect(() => {
    return () => {
      cancelActiveGeneration('Generation stopped while unmounting.');
    };
  }, [cancelActiveGeneration]);

  async function handleGenerate(style) {
    if (!originalImage) {
      setToast({ message: 'Add a portrait before rendering a simulation.', type: 'error' });
      return;
    }

    cancelActiveGeneration('Replaced by a newer generation request.');

    const controller = new AbortController();
    activeGenerationRef.current = controller;

    setView('magic');
    setProcessing(true, 'Analyzing features...');

    try {
      const visionSnapshot = getVisionSnapshot();

      await delay(420, controller.signal);

      if (aiRuntime.status === 'idle') {
        await aiRuntime.warmup();
      }

      if (controller.signal.aborted) {
        return;
      }

      const plan = await aiRuntime.generateLookPlan({
        style,
        vibe: userVibe,
        visionSnapshot,
      });

      if (controller.signal.aborted) {
        return;
      }

      for (const step of plan.processSteps) {
        setProcessStep(step);
        await delay(650, controller.signal);
      }

      if (controller.signal.aborted) {
        return;
      }

      setProcessStep('Rendering on-device simulation...');
      await delay(260, controller.signal);

      const generatedImage = await generateStudioSimulation({
        sourceImage: originalImage,
        style,
        visionSnapshot,
        analysisPlan: plan,
      });

      const analysisResult = {
        ...plan,
        renderMode: 'ai-simulation',
        previewDescriptor: {
          label: 'AI Simulation',
          summary:
            'Rendered locally from your portrait with hairstyle masking and face-focus framing.',
        },
      };

      setGeneratedLook({
        image: generatedImage,
        style,
        analysisResult,
      });
      setProcessing(false);
      setProcessStep('');

      startTransition(() => {
        if (!controller.signal.aborted) {
          setView('refine');
        }
      });

      if (!user || localOnlyMode) {
        return;
      }

      try {
        await addDoc(collection(db, 'users', user.uid, 'history'), {
          image: generatedImage,
          style: style.id,
          source: analysisResult.source,
          renderMode: analysisResult.renderMode,
          compatibility: analysisResult.compatibility,
          goldenRatioScore: analysisResult.goldenRatioScore,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error saving preview history:', error);
      }
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }

      console.error('Style generation failed:', error);
      setProcessing(false);
      setProcessStep('');
      setView('mirror');
      setToast({
        message: 'The on-device simulation stalled before the preview was ready.',
        type: 'error',
      });
    } finally {
      if (activeGenerationRef.current === controller) {
        activeGenerationRef.current = null;
      }
    }
  }

  function handleRefine(modifier) {
    setRefinementNote(modifier);
    setToast({
      message: `"${modifier}" added to the barber note. The preview image stays the same.`,
      type: 'success',
    });
  }

  return {
    handleGenerate,
    handleRefine,
  };
}