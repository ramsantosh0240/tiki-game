import React from 'react';
import { motion } from 'framer-motion';
import fireFrame from '@/assets/fire-frame.png';

interface FireFrameButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  delay?: number;
  variant?: 'primary' | 'secondary' | 'action';
  className?: string;
}

const FireFrameButton = ({ children, onClick, delay = 0, variant = 'primary', className = '' }: FireFrameButtonProps) => {
  const bgColor = variant === 'primary'
    ? 'linear-gradient(135deg, #FF4500cc, #FF8C00cc)'
    : variant === 'secondary'
    ? 'linear-gradient(135deg, #5D3A1Acc, #8B6914cc)'
    : 'linear-gradient(135deg, #00BFA5cc, #4DD0E1cc)';

  return (
    <motion.button
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay, type: 'spring', damping: 18 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative w-full border-none cursor-pointer bg-transparent p-0 ${className}`}
      style={{ minHeight: 56 }}
    >
      {/* Fire frame image as border */}
      <img
        src={fireFrame}
        alt=""
        className="absolute inset-0 w-full h-full object-fill pointer-events-none"
        style={{ filter: variant === 'action' ? 'hue-rotate(140deg)' : variant === 'secondary' ? 'saturate(0.6) brightness(0.8)' : 'none' }}
        draggable={false}
      />
      {/* Inner content */}
      <div
        className="relative z-10 flex items-center justify-center font-black tracking-widest"
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: variant === 'primary' ? '1.2rem' : '1rem',
          color: '#fff',
          textShadow: '0 2px 8px rgba(0,0,0,0.7), 0 0 20px rgba(255,100,0,0.4)',
          padding: '14px 24px',
          background: bgColor,
          margin: '6px 8px',
          borderRadius: '4px',
        }}
      >
        {children}
      </div>
    </motion.button>
  );
};

export default FireFrameButton;
