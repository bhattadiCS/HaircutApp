import { drawFocusedCover } from '../../vision/lib/faceFocus';

function loadShareImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    if (!source.startsWith('data:')) {
      image.crossOrigin = 'anonymous';
    }

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('One of the preview images could not be prepared for export.'));
    image.src = source;
  });
}

function getShareFilename(selectedStyle) {
  return `styleshift-${selectedStyle?.id || 'preview'}.png`;
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let cursorY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, cursorY);
      line = words[n] + ' ';
      cursorY += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, cursorY);
  return cursorY + lineHeight;
}

export function supportsFileShare() {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.canShare !== 'function' ||
    typeof File === 'undefined'
  ) {
    return false;
  }

  try {
    return navigator.canShare({
      files: [new File(['styleshift'], 'styleshift.txt', { type: 'text/plain' })],
    });
  } catch {
    return false;
  }
}

export function buildShareRequest({ file, shareUrl, title, text, supportsNativeFileShare }) {
  if (supportsNativeFileShare && file) {
    return {
      title,
      text,
      files: [file],
    };
  }

  return {
    title,
    text,
    url: shareUrl,
  };
}

export function downloadBlob(blob, filename) {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(blobUrl);
}

export async function createShareCardBlob({
  analysisResult,
  generatedImage,
  originalFaceFocus,
  originalImage,
  refinementNote,
  selectedStyle,
}) {
  const [beforeImage, afterImage] = await Promise.all([
    loadShareImage(originalImage),
    loadShareImage(generatedImage),
  ]);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas export is unavailable in this browser.');
  }

  canvas.width = 1600;
  canvas.height = 2000;

  const background = context.createLinearGradient(0, 0, 0, canvas.height);
  background.addColorStop(0, '#020617');
  background.addColorStop(1, '#111827');
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = 'rgba(255,255,255,0.08)';
  context.fillRect(60, 80, 1480, 1840);

  drawFocusedCover(
    context,
    beforeImage,
    { x: 110, y: 170, width: 650, height: 980 },
    originalFaceFocus,
  );
  drawFocusedCover(
    context,
    afterImage,
    { x: 840, y: 170, width: 650, height: 980 },
    null,
  );

  context.fillStyle = 'rgba(2, 6, 23, 0.72)';
  context.fillRect(110, 1030, 1380, 120);
  context.fillStyle = '#F8FAFC';
  context.font = '700 72px Outfit';
  context.fillText(selectedStyle?.name || 'StyleShift Preview', 110, 1105);
  context.font = '400 28px Outfit';
  context.fillStyle = 'rgba(248,250,252,0.78)';
  context.fillText('Before and after consultation preview', 110, 1148);

  context.fillStyle = '#F8FAFC';
  context.font = '600 34px Outfit';
  context.fillText('Barber Brief', 110, 1285);
  context.font = '400 28px Outfit';
  context.fillStyle = 'rgba(248,250,252,0.78)';

  const barberBrief =
    analysisResult?.barberBrief ||
    'Section at the parietal ridge, preserve weight through the top, and finish with a soft perimeter.';
  const summary = analysisResult?.technicalSummary || 'Local concierge preview exported from StyleShift.';

  let cursorY = 1330;
  
  cursorY = wrapText(context, barberBrief, 110, cursorY, 1380, 42);
  cursorY += 10;
  
  context.fillStyle = 'rgba(248,250,252,0.55)';
  cursorY = wrapText(context, summary, 110, cursorY, 1380, 42);

  if (refinementNote) {
    cursorY += 15;
    context.fillStyle = '#FDE68A';
    cursorY = wrapText(context, `Requested adjustment: ${refinementNote}`, 110, cursorY, 1380, 42);
  }

  context.font = '600 28px Outfit';
  context.fillStyle = '#FCD34D';
  context.fillText(`Maintenance: ${selectedStyle?.maintenance || 'Low'}`, 110, 1545);
  context.fillStyle = '#67E8F9';
  context.fillText(`Balance Score: ${analysisResult?.goldenRatioScore ?? 82}/100`, 650, 1545);
  context.fillStyle = '#E2E8F0';
  context.fillText('StyleShift', 1280, 1545);

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });

  if (!blob) {
    throw new Error('The preview card could not be converted to PNG.');
  }

  return blob;
}

export async function createShareCardFile(options) {
  const blob = await createShareCardBlob(options);

  return new File([blob], getShareFilename(options.selectedStyle), {
    type: 'image/png',
  });
}

export function getShareFilenameForDownload(selectedStyle) {
  return getShareFilename(selectedStyle);
}