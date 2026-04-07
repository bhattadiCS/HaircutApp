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

// Removed refinementTools, replaced with slider logic internally

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
  const [refinements, setRefinements] = useState({ length: 0, volume: 0, texture: 0 });
  const activeImage = isComparing ? originalImage : generatedImage;
  const previewLabel = analysisResult?.renderMode === 'ai-simulation' ? 'AI Simulation' : 'AI Preview';

  // Update parent with constructed note
  const handleSliderChange = (key, value) => {
    let nextR;
    if (key === 'reset') {
      nextR = { length: 0, volume: 0, texture: 0 };
    } else {
      nextR = { ...refinements, [key]: parseFloat(value) };
    }
    setRefinements(nextR);
    
    const parts = [];
    if (nextR.length < 0) parts.push('Make shorter');
    if (nextR.length > 0) parts.push('Keep longer');
    if (nextR.volume < 0) parts.push('Reduce volume');
    if (nextR.volume > 0) parts.push('Add volume');
    if (nextR.texture < 0) parts.push('Straighten texture');
    if (nextR.texture > 0) parts.push('Enhance texture');
    
    if (parts.length > 0) {
      onRefine(parts.join(', '));
    } else {
      onRefine('');
    }
  };

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
        className="relative flex-none min-h-[45vh] h-[50vh] shrink-0 overflow-hidden bg-black"
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

      <div className="flex-1 overflow-y-auto flex flex-col w-full relative z-10">

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
            const isActive = refinementNote?.includes(suggestion);

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
        className="border-t border-white/5 bg-zinc-900 px-6 py-6 flex flex-col gap-5"
        style={{ paddingBottom: 'calc(var(--safe-area-bottom) + 1.5rem)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs uppercase tracking-[0.26em] text-white/45">
            Fine Tune
          </div>
          <button 
            className="text-xs text-cyan-200/80 uppercase tracking-widest hover:text-cyan-50"
            onClick={() => handleSliderChange('reset', 0)}
          >
            Reset
          </button>
        </div>

        {[
          { key: 'length', icon: Ruler, label: 'Length', minL: 'Shorter', maxL: 'Longer' },
          { key: 'volume', icon: Volume2, label: 'Volume', minL: 'Less', maxL: 'More' },
          { key: 'texture', icon: Scissors, label: 'Texture', minL: 'Straight', maxL: 'Wavy' },
        ].map(({ key, icon: Icon, label, minL, maxL }) => (
          <div key={key} className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-white/80">
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40 w-12 text-right">{minL}</span>
              <input 
                type="range" 
                min="-1" 
                max="1" 
                step="1"
                value={refinements[key]}
                onChange={(e) => handleSliderChange(key, e.target.value)}
                className="flex-1 accent-cyan-400 opacity-80 transition-opacity hover:opacity-100"
              />
              <span className="text-xs text-white/40 w-12 text-left">{maxL}</span>
            </div>
          </div>
        ))}
        </div>
      </div>
    </Motion.div>
  );
}