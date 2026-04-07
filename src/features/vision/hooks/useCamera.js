import { useEffect, useRef, useState } from 'react';
import { cloneVisionSnapshot } from '../lib/visionMetrics';
import { MAX_VIDEO_ANALYSIS_FPS } from '../lib/visionRuntimeConfig';

const idleVisionState = {
  status: 'idle',
  faceCount: 0,
  faceShape: 'Unknown',
  focusBox: null,
  metrics: null,
  topBlendshapes: [],
};

export function useCamera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const workerRef = useRef(null);
  const workerReadyRef = useRef(false);
  const workerInitPromiseRef = useRef(null);
  const pendingRequestsRef = useRef(new Map());
  const requestIdRef = useRef(0);
  const frameHandleRef = useRef(null);
  const detectionInFlightRef = useRef(false);
  const lastDetectionTimestampRef = useRef(0);
  const lastVideoTimeRef = useRef(-1);
  const latestVisionRef = useRef(idleVisionState);
  const cameraStateRef = useRef('idle');

  const [cameraState, setCameraState] = useState('idle');
  const [visionState, setVisionState] = useState(idleVisionState);
  const [error, setError] = useState(null);

  function updateCameraState(nextState) {
    cameraStateRef.current = nextState;
    setCameraState(nextState);
  }

  function stopDetectionLoop() {
    if (frameHandleRef.current) {
      cancelAnimationFrame(frameHandleRef.current);
      frameHandleRef.current = null;
    }
  }

  function applyVisionSummary(summary) {
    latestVisionRef.current = summary;
    setVisionState(summary);
  }

  function resetWorker(message = 'Vision worker is unavailable.') {
    const pendingError = new Error(message);

    pendingRequestsRef.current.forEach(({ reject }) => reject(pendingError));
    pendingRequestsRef.current.clear();

    workerRef.current?.terminate();
    workerRef.current = null;
    workerReadyRef.current = false;
    workerInitPromiseRef.current = null;
    detectionInFlightRef.current = false;
  }

  function requestVisionWorker(type, payload, transfer = []) {
    const worker = workerRef.current;

    if (!worker) {
      return Promise.reject(new Error('Vision worker is not initialized.'));
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    return new Promise((resolve, reject) => {
      pendingRequestsRef.current.set(requestId, { resolve, reject });
      worker.postMessage({ id: requestId, type, payload }, transfer);
    });
  }

  async function ensureVisionWorker() {
    if (workerReadyRef.current && workerRef.current) {
      return workerRef.current;
    }

    if (workerInitPromiseRef.current) {
      return workerInitPromiseRef.current;
    }

    setVisionState((currentState) => ({
      ...currentState,
      status: 'loading',
    }));

    const worker = new Worker(
      new URL('../workers/visionWorker.js', import.meta.url),
      { type: 'module' },
    );

    worker.onmessage = (event) => {
      const { id, type, payload } = event.data ?? {};
      const pendingRequest = pendingRequestsRef.current.get(id);

      if (!pendingRequest) {
        return;
      }

      pendingRequestsRef.current.delete(id);

      if (type === 'error') {
        pendingRequest.reject(
          new Error(payload?.message ?? 'Vision worker request failed.'),
        );
        return;
      }

      pendingRequest.resolve(payload);
    };

    worker.onerror = () => {
      resetWorker('Vision worker crashed before completing analysis.');
      setError('Live stylist coaching is unavailable right now.');
      applyVisionSummary({
        ...idleVisionState,
        status: 'error',
      });
    };

    workerRef.current = worker;
    workerInitPromiseRef.current = requestVisionWorker('init')
      .then(() => {
        workerReadyRef.current = true;
        applyVisionSummary({
          ...idleVisionState,
          status: 'ready',
        });
        return worker;
      })
      .catch((workerError) => {
        resetWorker(
          workerError instanceof Error
            ? workerError.message
            : 'Vision worker failed to initialize.',
        );
        throw workerError;
      });

    return workerInitPromiseRef.current;
  }

  async function analyzeVideoFrame(video) {
    if (typeof createImageBitmap !== 'function') {
      throw new Error('This browser does not support worker-based live framing.');
    }

    const frame = await createImageBitmap(video);
    return requestVisionWorker(
      'detect-video-frame',
      {
        frame,
        timestamp: performance.now(),
      },
      [frame],
    );
  }

  function runDetectionLoop() {
    const video = videoRef.current;

    if (!video || cameraStateRef.current !== 'live') {
      return;
    }

    if (!workerReadyRef.current || detectionInFlightRef.current || video.readyState < 2) {
      frameHandleRef.current = requestAnimationFrame(runDetectionLoop);
      return;
    }

    if (lastVideoTimeRef.current === video.currentTime) {
      frameHandleRef.current = requestAnimationFrame(runDetectionLoop);
      return;
    }

    const now = performance.now();

    if (now - lastDetectionTimestampRef.current < 1000 / MAX_VIDEO_ANALYSIS_FPS) {
      frameHandleRef.current = requestAnimationFrame(runDetectionLoop);
      return;
    }

    lastVideoTimeRef.current = video.currentTime;
    lastDetectionTimestampRef.current = now;
    detectionInFlightRef.current = true;

    void analyzeVideoFrame(video)
      .then((summary) => {
        if (cameraStateRef.current === 'live') {
          applyVisionSummary(summary);
        }
      })
      .catch((cameraError) => {
        console.warn('Live camera analysis failed:', cameraError);
        setError('Live stylist coaching is unavailable right now.');
        applyVisionSummary({
          ...idleVisionState,
          status: 'error',
        });
      })
      .finally(() => {
        detectionInFlightRef.current = false;
        if (cameraStateRef.current === 'live') {
          frameHandleRef.current = requestAnimationFrame(runDetectionLoop);
        }
      });
  }

  async function analyzeImage(imageSource) {
    try {
      await ensureVisionWorker();
      const summary = await requestVisionWorker('detect-image', { imageSource });

      applyVisionSummary(summary);
      return summary;
    } catch (cameraError) {
      console.warn('Image analysis failed, falling back to manual framing:', cameraError);
      applyVisionSummary({
        ...idleVisionState,
        status: 'no-face',
      });
      return null;
    }
  }

  async function startCamera() {
    if (cameraStateRef.current === 'starting' || cameraStateRef.current === 'live') {
      return;
    }

    setError(null);
    updateCameraState('starting');

    try {
      void ensureVisionWorker().catch((workerError) => {
        const message =
          workerError instanceof Error
            ? workerError.message
            : 'Live stylist coaching is unavailable right now.';

        console.error('Vision worker init failed:', workerError);
        setError(message);
        applyVisionSummary({
          ...idleVisionState,
          status: 'error',
        });
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (!videoRef.current) {
        throw new Error('Camera element is not mounted yet.');
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      lastVideoTimeRef.current = -1;
      lastDetectionTimestampRef.current = 0;
      updateCameraState('live');
      runDetectionLoop();
    } catch (cameraError) {
      const message =
        cameraError instanceof Error
          ? cameraError.message
          : 'Unable to access the camera.';

      console.error('Camera start failed:', cameraError);
      setError(message);
      applyVisionSummary({
        ...idleVisionState,
        status: 'error',
      });
      stopCamera();
    }
  }

  function stopCamera({ preserveVisionState = false } = {}) {
    stopDetectionLoop();
    detectionInFlightRef.current = false;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    lastVideoTimeRef.current = -1;

    if (!preserveVisionState) {
      applyVisionSummary(idleVisionState);
    }

    updateCameraState('idle');
  }

  function resetVisionState() {
    setError(null);
    applyVisionSummary(idleVisionState);
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current || cameraStateRef.current !== 'live') {
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');

    if (!context) {
      return null;
    }

    context.save();
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.restore();

    return {
      image: canvas.toDataURL('image/png'),
      visionSnapshot: cloneVisionSnapshot(latestVisionRef.current),
    };
  }

  function getVisionSnapshot() {
    return cloneVisionSnapshot(latestVisionRef.current);
  }

  useEffect(() => {
    return () => {
      stopDetectionLoop();

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (workerRef.current) {
        void requestVisionWorker('dispose').catch(() => undefined);
      }

      resetWorker('Vision worker shut down.');
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    cameraState,
    isCameraOpen: cameraState === 'starting' || cameraState === 'live',
    visionState,
    error,
    startCamera,
    stopCamera,
    resetVisionState,
    analyzeImage,
    capturePhoto,
    getVisionSnapshot,
  };
}