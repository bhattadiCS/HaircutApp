import React from 'react';
import { User } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import HapticButton from '../../components/HapticButton';
import { BUTTON_SPRING, VIBES } from '../../Constants';

const VibeCheck = ({ user, onVibeSelect, onOpenSettings }) => {
  return (
    <div className="app-screen relative flex w-full flex-col bg-zinc-950 p-6">
      <div
        className="absolute z-20"
        style={{
          top: 'calc(var(--safe-area-top) + 1.5rem)',
          right: 'max(1.5rem, calc(var(--safe-area-right) + 1.5rem))',
        }}
      >
        <HapticButton
          variant="icon"
          onClick={onOpenSettings}
          aria-label="Open settings"
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full border border-white/20" />
          ) : (
            <User className="w-5 h-5" />
          )}
        </HapticButton>
      </div>

      <div className="mb-8" style={{ paddingTop: 'calc(var(--safe-area-top) + 1rem)' }}>
        <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Vibe Check</h2>
        <p className="text-zinc-400 text-lg">What's your aesthetic?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 pb-8 px-2">
        {VIBES.map((vibe) => (
          <Motion.button
            type="button"
            key={vibe.id}
            transition={BUTTON_SPRING}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onVibeSelect(vibe.id)}
            className="glass-panel group h-64 cursor-pointer overflow-hidden rounded-3xl text-left shadow-2xl md:h-full"
            aria-label={`Choose ${vibe.label} vibe`}
          >
            <div className="h-full w-full relative">
              <img
                src={vibe.img}
                alt={`${vibe.label} vibe inspiration`}
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent flex flex-col justify-end p-6">
                <span className="text-3xl font-bold text-white mb-1">
                  {vibe.label}
                </span>
                <span className="text-sm text-zinc-300 font-medium opacity-80">
                  {vibe.desc}
                </span>
              </div>
            </div>
          </Motion.button>
        ))}
      </div>
    </div>
  );
};

export default VibeCheck;
