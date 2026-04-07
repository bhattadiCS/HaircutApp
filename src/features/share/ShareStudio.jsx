import { useMemo, useState } from 'react';
import { ChevronLeft, Clock, Download, DollarSign, Share2, Sparkles } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import HapticButton from '../../components/HapticButton';
import { BUTTON_SPRING } from '../../Constants';
import {
  buildShareRequest,
  createShareCardBlob,
  createShareCardFile,
  downloadBlob,
  getShareFilenameForDownload,
  supportsFileShare,
} from './lib/shareExport';

export default function ShareStudio({
  selectedStyle,
  originalImage,
  generatedImage,
  originalFaceFocus,
  originalImageStyle,
  analysisResult,
  refinementNote,
  onBack,
  onShareLink,
}) {
  const [downloadStatus, setDownloadStatus] = useState('idle');
  const [shareStatus, setShareStatus] = useState('idle');
  const supportsNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  const canShareNativeFiles = useMemo(() => supportsFileShare(), []);
  const shareButtonLabel = supportsNativeShare
    ? canShareNativeFiles
      ? 'Share Image'
      : 'Share Link'
    : 'Copy Link';

  const shareTitle = selectedStyle?.name ? `${selectedStyle.name} | StyleShift` : 'StyleShift Preview';
  const shareText = refinementNote
    ? `StyleShift consultation card. Requested adjustment: ${refinementNote}.`
    : 'StyleShift consultation card exported locally.';

  async function handleShare() {
    setShareStatus('working');

    try {
      if (supportsNativeShare) {
        if (canShareNativeFiles) {
          const file = await createShareCardFile({
            analysisResult,
            generatedImage,
            originalFaceFocus,
            originalImage,
            refinementNote,
            selectedStyle,
          });

          await navigator.share(
            buildShareRequest({
              file,
              shareUrl: window.location.href,
              title: shareTitle,
              text: shareText,
              supportsNativeFileShare: true,
            }),
          );
        } else {
          await navigator.share(
            buildShareRequest({
              shareUrl: window.location.href,
              title: shareTitle,
              text: shareText,
              supportsNativeFileShare: false,
            }),
          );
        }
      } else {
        await onShareLink?.();
      }

      setShareStatus('done');
    } catch (error) {
      if (error?.name === 'AbortError') {
        setShareStatus('idle');
        return;
      }

      console.error('Share failed:', error);

      if (supportsNativeShare && canShareNativeFiles) {
        try {
          await onShareLink?.();
          setShareStatus('done');
          return;
        } catch {
          // Fall through to the shared error state.
        }
      }

      setShareStatus('error');
    }
  }

  async function handleDownloadPng() {
    setDownloadStatus('working');

    try {
      const blob = await createShareCardBlob({
        analysisResult,
        generatedImage,
        originalFaceFocus,
        originalImage,
        refinementNote,
        selectedStyle,
      });

      downloadBlob(blob, getShareFilenameForDownload(selectedStyle));
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

          {refinementNote ? (
            <p className="mt-3 text-xs leading-relaxed text-amber-100/75">
              Requested adjustment: {refinementNote}
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
        <HapticButton className="flex w-full items-center justify-center gap-2" onClick={handleShare}>
          <Share2 className="h-5 w-5" />
          {shareStatus === 'working'
            ? 'Preparing Share...'
            : shareStatus === 'done'
              ? canShareNativeFiles
                ? 'Image Shared'
                : 'Link Shared'
              : shareStatus === 'error'
                ? `Retry ${shareButtonLabel}`
                : shareButtonLabel}
        </HapticButton>

        <Motion.button
          type="button"
          transition={BUTTON_SPRING}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownloadPng}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-6 py-3 font-semibold text-white backdrop-blur-xl"
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

        <p className="text-center text-xs text-white/45">
          {supportsNativeShare && canShareNativeFiles
            ? 'On supported devices the share sheet receives the exported consultation card as an image file.'
            : supportsNativeShare
              ? 'This browser can only share a link, so use Download PNG for the image file.'
              : 'Native sharing is unavailable here, so copy the link and use Download PNG for the image file.'}
        </p>
      </div>
    </Motion.div>
  );
}