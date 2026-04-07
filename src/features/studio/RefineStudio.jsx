import { useState } from 'react';
import { ChevronLeft, Palette, Ruler, Scissors, Volume2 } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import HapticButton from '../../components/HapticButton';
import { BUTTON_SPRING } from '../../Constants';

const smartSuggestions = [
  'Make it shorter',
  'More volume',
  'Sharpen the taper',
  'Soften the fringe',
];

const refinementTools = [
  { icon: Ruler, label: 'Length' },
  { icon: Volume2, label: 'Volume' },
  { icon: Palette, label: 'Color' },
  { icon: Scissors, label: 'Texture' },
];

export default function RefineStudio({
  generatedImage,
  originalImage,
  originalImageStyle,
  analysisResult,
  onBack,
  onContinueToShare,
  onRefine,
  refinementNote,
}) {
  const [isComparing, setIsComparing] = useState(false);
  const activeImage = isComparing ? originalImage : generatedImage;
  const previewLabel = analysisResult?.renderMode === 'ai-simulation' ? 'AI Simulation' : 'AI Preview';

  return (
    <Motion.div
      key="refine"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="app-screen flex w-full flex-col bg-zinc-950"
    >
      <div
        className="glass-quiet flex items-center justify-between px-4 pb-4"
        style={{
          paddingTop: 'calc(var(--safe-area-top) + 1rem)',
          paddingLeft: 'max(1rem, calc(var(--safe-area-left) + 1rem))',
          paddingRight: 'max(1rem, calc(var(--safe-area-right) + 1rem))',
        }}
      >
        <HapticButton
          variant="icon"
          onClick={onBack}
          aria-label="Back to mirror mode"
        >
          <ChevronLeft className="h-5 w-5" />
        </HapticButton>

        <div className="glass-chip rounded-full px-3 py-1 text-xs uppercase tracking-[0.28em] text-white/55">
          Hold to compare
        </div>

        <HapticButton
          variant="primary"
          className="px-4 py-2 text-sm"
          onClick={onContinueToShare}
        >
          Continue to Share
        </HapticButton>
      </div>

      <div
        className="relative flex-1 overflow-hidden bg-black"
        onMouseDown={() => setIsComparing(true)}
        onMouseUp={() => setIsComparing(false)}
        onMouseLeave={() => setIsComparing(false)}
        onTouchStart={() => setIsComparing(true)}
        onTouchEnd={() => setIsComparing(false)}
      >
        <Motion.img
          key={activeImage}
          initial={{ opacity: 0.2, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          src={activeImage}
          alt={isComparing ? 'Original portrait' : 'Locally rendered hairstyle simulation'}
          style={isComparing ? originalImageStyle : undefined}
          className="h-full w-full object-cover"
        />

        <div className="glass-chip absolute left-4 top-4 rounded-full px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/75">
          {isComparing ? 'Original' : previewLabel}
        </div>
      </div>

      {analysisResult?.barberBrief ? (
        <div className="glass-panel mx-4 -mt-8 rounded-[1.7rem] px-5 py-4">
          <div className="mb-2 text-xs uppercase tracking-[0.24em] text-fuchsia-200/60">
            Barber Brief
          </div>
          <p className="text-sm leading-relaxed text-white/80">
            {analysisResult.barberBrief}
          </p>
          {analysisResult?.previewDescriptor ? (
            <p className="mt-3 text-xs leading-relaxed text-cyan-100/70">
              {analysisResult.previewDescriptor.summary}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mx-4 mt-4 rounded-[1.7rem] border border-white/10 bg-white/[0.03] px-5 py-4">
        <div className="mb-2 text-xs uppercase tracking-[0.24em] text-white/45">
          Export Note
        </div>
        <p className="text-sm leading-relaxed text-white/72">
          {refinementNote
            ? `Requested adjustment: ${refinementNote}. This note is added to the export and does not change the preview image.`
            : 'Add a note below if you want the exported brief to call out a specific adjustment. These presets do not re-render the preview.'}
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t border-white/5 bg-black/40 px-4 py-3 backdrop-blur-sm">
        <div className="text-xs uppercase tracking-[0.26em] text-white/45">
          Quick Notes
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {smartSuggestions.map((suggestion) => {
            const isActive = refinementNote === suggestion;

            return (
              <Motion.button
                key={suggestion}
                transition={BUTTON_SPRING}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onRefine(suggestion)}
                className={`glass-chip whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${isActive ? 'border-cyan-300/45 bg-cyan-300/15 text-cyan-50' : 'text-white hover:bg-white/20'}`}
              >
                {suggestion}
              </Motion.button>
            );
          })}
        </div>
      </div>

      <div
        className="border-t border-white/5 bg-zinc-900 px-6 py-6"
        style={{ paddingBottom: 'calc(var(--safe-area-bottom) + 1.5rem)' }}
      >
        <div className="mb-6 text-xs uppercase tracking-[0.26em] text-white/45">
          Note Presets
        </div>

        <div className="flex justify-between gap-4">
          {refinementTools.map((tool) => {
            const isActive = refinementNote === tool.label;

            return (
              <Motion.button
                key={tool.label}
                transition={BUTTON_SPRING}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onRefine(tool.label)}
                className="flex flex-col items-center gap-2"
              >
                <div className={`glass-panel flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${isActive ? 'border-cyan-300/45 bg-cyan-300/15' : 'hover:bg-white/[0.12]'}`}>
                  <tool.icon className={`h-6 w-6 ${isActive ? 'text-cyan-50' : 'text-white'}`} />
                </div>
                <span className={`text-xs ${isActive ? 'text-cyan-50' : 'text-white/60'}`}>{tool.label}</span>
              </Motion.button>
            );
          })}
        </div>
      </div>
    </Motion.div>
  );
}