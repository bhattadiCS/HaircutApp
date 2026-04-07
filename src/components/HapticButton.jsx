import React from 'react';
import { motion as Motion } from 'framer-motion';
import { BUTTON_SPRING } from '../Constants';

const HapticButton = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  disabled = false,
  ...props
}) => {
  const baseStyles = 'relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60';
  const variants = {
    primary: 'rounded-full bg-white px-6 py-3 font-semibold tracking-[-0.01em] text-slate-950 shadow-[0_18px_45px_rgba(255,255,255,0.12)] hover:bg-white/95',
    secondary: 'rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-white backdrop-blur-xl hover:bg-white/[0.14]',
    icon: 'rounded-full border border-white/10 bg-black/40 p-3 text-white backdrop-blur-xl hover:bg-black/55',
    ghost: 'px-4 py-2 font-medium text-white/70 hover:text-white',
  };

  return (
    <Motion.button
      type={props.type || 'button'}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      transition={BUTTON_SPRING}
      onClick={(e) => {
        if (disabled) {
          return;
        }

        if (navigator.vibrate) {
          navigator.vibrate(10);
        }

        onClick && onClick(e);
      }}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Motion.button>
  );
};

export default HapticButton;
