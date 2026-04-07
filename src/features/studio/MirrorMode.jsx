import React from 'react';
import { ChevronLeft, User, X, RotateCw, Upload, Camera, SwitchCamera, Trash2, Sparkles } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import HapticButton from '../../components/HapticButton';
import { ImageWithSkeleton } from '../../components/Skeleton';
import { BUTTON_SPRING, STYLES } from '../../Constants';
import VisionStatusCard from '../vision/components/VisionStatusCard';

const MirrorMode = ({ 
  user, 
  originalImage, 
  isCameraOpen, 
  videoRef, 
  canvasRef, 
  analysisResult, 
  show360,
  visionState,
  imageFocusStyle,
  aiRuntime,
  onBack,
  onOpenSettings,
  onStartCamera,
  onStopCamera,
  onTakePhoto,
  onImageUpload,
  onClearImage,
  onToggle360,
  onGenerate
}) => {
  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="app-screen relative flex min-h-0 w-full flex-col bg-zinc-950"
    >
      {/* Header */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-40 flex items-center justify-between bg-gradient-to-b from-black/65 to-transparent px-4 pb-4"
        style={{
          paddingTop: 'calc(var(--safe-area-top) + 0.9rem)',
          paddingLeft: 'max(1rem, calc(var(--safe-area-left) + 1rem))',
          paddingRight: 'max(1rem, calc(var(--safe-area-right) + 1rem))',
        }}
      >
        <HapticButton
          variant="icon"
          onClick={(event) => {
            event.stopPropagation();
            onBack();
          }}
          className="pointer-events-auto relative z-50"
          aria-label="Back to vibe selection"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </HapticButton>

        <div className="glass-chip rounded-full px-4 py-1 pointer-events-none">
          <span className="text-xs font-semibold tracking-[0.3em] text-white/80">MIRROR MODE</span>
        </div>

        <HapticButton
          variant="icon"
          onClick={onOpenSettings}
          className="pointer-events-auto"
          aria-label="Open settings"
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="w-6 h-6 rounded-full border border-white/20"
            />
          ) : (
            <User className="w-5 h-5" />
          )}
        </HapticButton>
      </div>

      {/* Canvas */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-zinc-900"
        data-testid="mirror-canvas"
      >
        {isCameraOpen ? (
          <div className="relative w-full h-full bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute top-4 left-4 z-30">
              <HapticButton
                variant="icon"
                onClick={onStopCamera}
                className="bg-black/50 border-white/20"
                aria-label="Close camera"
              >
                <X className="w-5 h-5 text-white" />
              </HapticButton>
            </div>
          </div>
        ) : originalImage ? (
          <Motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={originalImage}
            alt="Uploaded portrait preview"
            style={imageFocusStyle}
            className={`w-full h-full transition-transform duration-500 ${imageFocusStyle ? 'object-cover' : 'object-contain object-top'}`}
          />
        ) : (
          <div className="glass-panel flex h-80 w-64 flex-col items-center justify-center rounded-[3rem] border-dashed text-zinc-400 animate-pulse">
            <User className="w-20 h-20 mb-4 opacity-50" />
            <span>Fill the frame</span>
          </div>
        )}

        <AnimatePresence>
          {originalImage && !isCameraOpen && visionState.status === 'loading' ? (
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_42%),linear-gradient(180deg,rgba(2,6,23,0.24),rgba(2,6,23,0.74))]" />
              <div className="relative flex flex-col items-center gap-5 px-6 text-center">
                <div className="relative h-40 w-40">
                  {[0, 1, 2].map((ring) => (
                    <Motion.div
                      key={ring}
                      className="absolute inset-0 rounded-full border border-cyan-200/40"
                      animate={{
                        scale: [0.72 + ring * 0.08, 1.08 + ring * 0.08],
                        opacity: [0.15, 0.5, 0],
                      }}
                      transition={{
                        duration: 1.8,
                        ease: 'easeInOut',
                        repeat: Infinity,
                        delay: ring * 0.2,
                      }}
                    />
                  ))}
                  <Motion.div
                    className="absolute inset-6 rounded-full border border-amber-300/45"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, ease: 'linear', repeat: Infinity }}
                  >
                    <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.8)]" />
                    <div className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.75)]" />
                  </Motion.div>
                </div>

                <div className="glass-panel rounded-[1.75rem] px-6 py-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-100/80">
                    Analyzing Features...
                  </p>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/78">
                    Mapping the hairline, facial balance, and crop so the preview lands on your face first.
                  </p>
                </div>
              </div>
            </Motion.div>
          ) : null}
        </AnimatePresence>

        <VisionStatusCard visionState={visionState} aiRuntime={aiRuntime} />

        <AnimatePresence>
          {show360 && (
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none animate-spin-slow bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:28px_28px]"
            />
          )}
        </AnimatePresence>

        <div className="absolute bottom-4 right-4 z-10">
          <HapticButton
            variant="icon"
            onClick={onToggle360}
            className={show360 ? 'border-cyan-300/45 bg-cyan-300/15' : ''}
            aria-label="Toggle 360 overlay"
          >
            <RotateCw className={`w-5 h-5 ${show360 ? 'text-cyan-200' : 'text-white/70'}`} />
          </HapticButton>
        </div>
      </div>

      {/* Controls */}
      <div
        className="absolute bottom-0 left-0 right-0 flex flex-col gap-6 bg-gradient-to-t from-black via-black/80 to-transparent px-8 pt-8"
        style={{
          paddingBottom: 'calc(var(--safe-area-bottom) + 1.25rem)',
          paddingLeft: 'max(1.25rem, calc(var(--safe-area-left) + 1.25rem))',
          paddingRight: 'max(1.25rem, calc(var(--safe-area-right) + 1.25rem))',
        }}
      >
        {originalImage && !isCameraOpen ? (
          <>
            {analysisResult && (
              <div className="glass-panel mb-4 rounded-[1.75rem] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <h3 className="font-bold text-sm text-white">Stylist Notes</h3>
                </div>
                <div className="flex gap-2 text-xs text-zinc-400 mb-3">
                  <span className="glass-chip rounded-full px-3 py-1">{analysisResult.faceShape} Face</span>
                  <span className="glass-chip rounded-full px-3 py-1">{analysisResult.hairTexture} Hair</span>
                </div>
                <p className="text-sm italic text-zinc-300 leading-relaxed">"{analysisResult.advice}"</p>
                {analysisResult.previewDescriptor ? (
                  <p className="mt-3 text-xs uppercase tracking-[0.24em] text-cyan-100/70">
                    {analysisResult.previewDescriptor.label} | Rendered locally
                  </p>
                ) : null}
              </div>
            )}

            <div className="flex gap-4 mb-8 overflow-x-auto pb-2 no-scrollbar px-4">
              {STYLES.map((style, i) => (
                <Motion.button
                  type="button"
                  key={style.id}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ ...BUTTON_SPRING, delay: i * 0.05 }}
                  onClick={() => onGenerate(style)}
                  aria-label={`Generate ${style.name}`}
                  className="group relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-[1.35rem] border border-white/10 bg-zinc-800/70 hover:border-cyan-300/55"
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ImageWithSkeleton
                    src={style.preview}
                    alt=""
                    className="absolute inset-0 w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-2">
                    <p className="text-xs font-bold text-white text-center">{style.name}</p>
                  </div>
                </Motion.button>
              ))}
              <Motion.button
                type="button"
                transition={BUTTON_SPRING}
                whileHover={{ scale: 1.04, y: -3 }}
                whileTap={{ scale: 0.96 }}
                onClick={onClearImage}
                className="glass-panel flex h-32 w-24 flex-shrink-0 items-center justify-center rounded-[1.35rem] text-white/50 hover:text-white"
                aria-label="Clear selected portrait"
              >
                <Trash2 className="w-6 h-6" />
                <span className="sr-only">Clear</span>
              </Motion.button>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center gap-8">
            {!isCameraOpen && (
              <label className="cursor-pointer group flex flex-col items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={onImageUpload}
                  aria-label="Upload portrait"
                />
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-white/70">Upload</span>
              </label>
            )}

            <Motion.button
              type="button"
              transition={BUTTON_SPRING}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.94 }}
              onClick={isCameraOpen ? onTakePhoto : onStartCamera}
              aria-label={isCameraOpen ? 'Capture portrait' : 'Open camera'}
              className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-transparent bg-white shadow-[0_0_40px_rgba(255,255,255,0.28)]"
            >
              {isCameraOpen ? (
                <div className="w-16 h-16 rounded-full border-2 border-black" />
              ) : (
                <Camera className="w-8 h-8 text-black" />
              )}
            </Motion.button>

            {!isCameraOpen && (
              <Motion.button
                type="button"
                transition={BUTTON_SPRING}
                whileTap={{ scale: 1 }}
                className="flex cursor-not-allowed flex-col items-center gap-2 opacity-50"
                aria-label="Switch camera unavailable"
                disabled
              >
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <SwitchCamera className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-white/70">Flip</span>
              </Motion.button>
            )}
          </div>
        )}
      </div>
    </Motion.div>
  );
};

export default MirrorMode;
