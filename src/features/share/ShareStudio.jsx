import { useState } from 'react';
import { ChevronLeft, Clock, Download, DollarSign, Share2, Sparkles } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import HapticButton from '../../components/HapticButton';
import { BUTTON_SPRING } from '../../Constants';
import { drawFocusedCover } from '../vision/lib/faceFocus';

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

function downloadBlob(blob, filename) {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(blobUrl);
}

export default function ShareStudio({
  selectedStyle,
  originalImage,
  generatedImage,
  originalFaceFocus,
  originalImageStyle,
  analysisResult,
  onBack,
  onShare,
}) {
  const [downloadStatus, setDownloadStatus] = useState('idle');
  const supportsNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  async function handleDownloadPng() {
    setDownloadStatus('working');

    try {
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
      const lines = [barberBrief, summary];
      let cursorY = 1340;

      for (const line of lines) {
        context.fillText(line.slice(0, 92), 110, cursorY);
        cursorY += 54;
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

      downloadBlob(blob, `styleshift-${selectedStyle?.id || 'preview'}.png`);
      setDownloadStatus('done');
    } catch (error) {
      console.error('PNG export failed:', error);
      setDownloadStatus('error');
    }
  }

  return (
    <Motion.div
      key="share"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      className="app-screen flex w-full flex-col bg-zinc-950 px-6 py-6"
      style={{
        paddingTop: 'calc(var(--safe-area-top) + 1.5rem)',
        paddingBottom: 'calc(var(--safe-area-bottom) + 1.5rem)',
        paddingLeft: 'max(1.5rem, calc(var(--safe-area-left) + 1.5rem))',
        paddingRight: 'max(1.5rem, calc(var(--safe-area-right) + 1.5rem))',
      }}
    >
      <div className="mb-8 flex items-center justify-between">
        <HapticButton
          variant="icon"
          onClick={onBack}
          aria-label="Back to refine studio"
        >
          <ChevronLeft className="h-5 w-5" />
        </HapticButton>
        <h2 className="text-xl font-semibold text-white">Share Your Look</h2>
        <div className="w-10" />
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto">
        <Motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.15 }}
          className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-white shadow-2xl"
        >
          <div className="absolute left-4 top-4 z-10 rounded-full bg-black/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-md">
            StyleShift Simulation
          </div>

          <div className="grid h-full grid-cols-2">
            <img
              src={originalImage}
              alt="Original portrait"
              style={originalImageStyle}
              className="h-full w-full object-cover"
            />
            <img
              src={generatedImage}
              alt="Locally simulated hairstyle preview"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-6 text-white">
            <h3 className="text-2xl font-semibold">{selectedStyle?.name}</h3>
            <p className="mt-1 text-sm text-white/75">
              Rendered locally from your portrait with the StyleShift concierge stack
            </p>
          </div>
        </Motion.div>

        <div className="glass-panel rounded-3xl p-6">
          <div className="mb-4 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-fuchsia-300" />
            <h3 className="font-semibold text-white">Barber Brief</h3>
          </div>

          <p className="text-sm leading-relaxed text-white/75">
            {analysisResult?.barberBrief ||
              'Section at the parietal ridge, preserve weight through the top, and finish with a soft perimeter.'}
          </p>

          {analysisResult?.technicalSummary ? (
            <p className="mt-4 text-xs leading-relaxed text-white/50">
              {analysisResult.technicalSummary}
            </p>
          ) : null}

          {analysisResult?.previewDescriptor ? (
            <p className="mt-3 text-xs leading-relaxed text-cyan-100/70">
              {analysisResult.previewDescriptor.summary}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel rounded-3xl p-4">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/45">
              <DollarSign className="h-4 w-4" />
              Est. Cost
            </div>
            <div className="text-xl font-semibold text-white">$120 - $180</div>
          </div>

          <div className="glass-panel rounded-3xl p-4">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/45">
              <Clock className="h-4 w-4" />
              Maintenance
            </div>
            <div className="text-xl font-semibold text-white">
              {selectedStyle?.maintenance}
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-4">
          <div className="mb-2 text-xs uppercase tracking-[0.22em] text-white/45">
            Balance Score
          </div>
          <div className="text-xl font-semibold text-white">
            {analysisResult?.goldenRatioScore ?? 82}/100
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {supportsNativeShare ? (
          <HapticButton className="flex w-full items-center justify-center gap-2" onClick={onShare}>
            <Share2 className="h-5 w-5" /> Share Preview
          </HapticButton>
        ) : (
          <Motion.button
            type="button"
            transition={BUTTON_SPRING}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadPng}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-slate-950"
          >
            <Download className="h-5 w-5" />
            {downloadStatus === 'working'
              ? 'Building PNG...'
              : downloadStatus === 'done'
                ? 'PNG Downloaded'
                : downloadStatus === 'error'
                  ? 'Retry Download PNG'
                  : 'Download PNG'}
          </Motion.button>
        )}

        {!supportsNativeShare ? (
          <p className="text-center text-xs text-white/45">
            Native sharing is unavailable here, so the consultation card exports as a PNG instead.
          </p>
        ) : null}
      </div>
    </Motion.div>
  );
}