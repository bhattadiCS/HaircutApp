import { summarizeVisionFrame } from '../lib/visionMetrics';
import {
  FACE_LANDMARKER_TASK,
  VISION_WASM_ROOT,
} from '../lib/visionRuntimeConfig';

let visionRuntimePromise = null;
let visionResolverPromise = null;
let imageLandmarkerPromise = null;
let videoLandmarkerPromise = null;

async function loadVisionRuntime() {
  if (!visionRuntimePromise) {
    visionRuntimePromise = import('@mediapipe/tasks-vision');
  }

  return visionRuntimePromise;
}

async function getVisionResolver() {
  if (!visionResolverPromise) {
    visionResolverPromise = loadVisionRuntime().then(({ FilesetResolver }) =>
      FilesetResolver.forVisionTasks(VISION_WASM_ROOT),
    );
  }

  return visionResolverPromise;
}

async function createLandmarker(runningMode) {
  const vision = await getVisionResolver();
  const { FaceLandmarker } = await loadVisionRuntime();

  return FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: FACE_LANDMARKER_TASK,
      delegate: 'CPU',
    },
    runningMode,
    numFaces: 1,
    outputFaceBlendshapes: true,
    minFaceDetectionConfidence: 0.55,
    minTrackingConfidence: 0.55,
  });
}

async function ensureImageLandmarker() {
  if (!imageLandmarkerPromise) {
    imageLandmarkerPromise = createLandmarker('IMAGE');
  }

  return imageLandmarkerPromise;
}

async function ensureVideoLandmarker() {
  if (!videoLandmarkerPromise) {
    videoLandmarkerPromise = createLandmarker('VIDEO');
  }

  return videoLandmarkerPromise;
}

async function bitmapFromSource(imageSource) {
  const response = await fetch(imageSource);

  if (!response.ok) {
    throw new Error('The uploaded portrait could not be loaded for analysis.');
  }

  const blob = await response.blob();
  return createImageBitmap(blob);
}

async function analyzeImage(imageSource) {
  const landmarker = await ensureImageLandmarker();
  const bitmap = await bitmapFromSource(imageSource);

  try {
    return summarizeVisionFrame(landmarker.detect(bitmap));
  } finally {
    bitmap.close?.();
  }
}

async function analyzeVideoFrame(frame, timestamp) {
  const landmarker = await ensureVideoLandmarker();

  try {
    return summarizeVisionFrame(landmarker.detectForVideo(frame, timestamp));
  } finally {
    frame.close?.();
  }
}

async function disposeLandmarkers() {
  const imageLandmarker = await imageLandmarkerPromise?.catch(() => null);
  const videoLandmarker = await videoLandmarkerPromise?.catch(() => null);

  imageLandmarker?.close?.();

  if (videoLandmarker && videoLandmarker !== imageLandmarker) {
    videoLandmarker.close?.();
  }

  imageLandmarkerPromise = null;
  videoLandmarkerPromise = null;
}

self.onmessage = async (event) => {
  const { id, type, payload } = event.data ?? {};

  try {
    if (type === 'init') {
      await Promise.all([ensureImageLandmarker(), ensureVideoLandmarker()]);
      self.postMessage({ id, type: 'ready' });
      return;
    }

    if (type === 'detect-image') {
      const summary = await analyzeImage(payload.imageSource);
      self.postMessage({ id, type: 'summary', payload: summary });
      return;
    }

    if (type === 'detect-video-frame') {
      const summary = await analyzeVideoFrame(payload.frame, payload.timestamp);
      self.postMessage({ id, type: 'summary', payload: summary });
      return;
    }

    if (type === 'dispose') {
      await disposeLandmarkers();
      self.postMessage({ id, type: 'disposed' });
      return;
    }

    throw new Error(`Unknown vision worker message: ${type}`);
  } catch (error) {
    self.postMessage({
      id,
      type: 'error',
      payload: {
        message:
          error instanceof Error ? error.message : 'Vision worker execution failed.',
      },
    });
  }
};