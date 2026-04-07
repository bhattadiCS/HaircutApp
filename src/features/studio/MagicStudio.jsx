import React from 'react';
import { motion as Motion } from 'framer-motion';

const MagicStudio = ({ originalImage, imageFocusStyle, processStep }) => {
  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="app-screen relative flex w-full flex-col items-center justify-center overflow-hidden bg-black"
    >
      <img
        src={originalImage}
        alt=""
        style={imageFocusStyle}
        className="absolute inset-0 h-full w-full scale-[1.03] object-cover opacity-32 blur-[2px]"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_bottom,rgba(245,158,11,0.12),transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.5),rgba(2,6,23,0.9))]" />

      <div className="absolute inset-0 overflow-hidden">
        {[0, 1].map((ring) => (
          <Motion.div
            key={ring}
            className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/25"
            animate={{
              scale: [0.82 + ring * 0.08, 1.02 + ring * 0.08],
              opacity: [0.1, 0.28, 0],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              delay: ring * 0.22,
              ease: 'easeInOut',
            }}
          />
        ))}

        <Motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.9)]" />
          <div className="absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 translate-y-1/2 rounded-full bg-amber-300 shadow-[0_0_20px_rgba(252,211,77,0.85)]" />
        </Motion.div>
      </div>

      <div className="z-10 px-6 text-center" style={{ paddingTop: 'calc(var(--safe-area-top) + 1rem)' }}>
        <div className="glass-panel rounded-[2rem] px-8 py-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-100/80">
            Analyzing Features...
          </p>
        <Motion.h3
          key={processStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
            className="mt-3 text-2xl font-semibold text-white"
        >
            {processStep || 'Building your next preview'}
        </Motion.h3>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/72">
            Calibrating face balance, crop framing, and finish details before the reveal.
          </p>
        </div>
      </div>
    </Motion.div>
  );
};

export default MagicStudio;
