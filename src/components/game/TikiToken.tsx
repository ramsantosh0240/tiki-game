import { motion } from 'framer-motion';
import tikiFaceLava from '@/assets/tiki-face-lava.png';
import tikiFaceSun from '@/assets/tiki-face-sun.png';
import tikiFaceWave from '@/assets/tiki-face-wave.png';
import tikiFaceJungle from '@/assets/tiki-face-jungle.png';

interface TikiTokenProps {
  player: number;
  size?: 'sm' | 'md' | 'lg';
  highlighted?: boolean;
  rank?: number;
  className?: string;
}

const PLAYER_GRADIENTS = [
  { from: '#FF4500', to: '#FF8C00', glow: 'rgba(255,69,0,0.5)' },
  { from: '#FFB300', to: '#FFD54F', glow: 'rgba(255,179,0,0.5)' },
  { from: '#00BFA5', to: '#4DD0E1', glow: 'rgba(0,191,165,0.5)' },
  { from: '#C2185B', to: '#E91E63', glow: 'rgba(194,24,91,0.5)' },
];

const TIKI_FACES = [tikiFaceLava, tikiFaceSun, tikiFaceWave, tikiFaceJungle];

const sizes = { sm: 32, md: 48, lg: 64 };

const TikiToken = ({ player, size = 'md', highlighted = false, rank, className = '' }: TikiTokenProps) => {
  const s = sizes[size];
  const grad = PLAYER_GRADIENTS[player];

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      whileHover={{ scale: 1.12 }}
      animate={highlighted ? {
        scale: [1, 1.06, 1],
        transition: { repeat: Infinity, duration: 1.5 }
      } : {}}
      style={{
        width: s,
        height: s,
        filter: highlighted
          ? `drop-shadow(0 0 10px ${grad.glow}) drop-shadow(0 0 20px ${grad.glow})`
          : `drop-shadow(0 2px 4px rgba(0,0,0,0.5))`,
      }}
    >
      <img
        src={TIKI_FACES[player]}
        alt={`Tiki ${player}`}
        className="w-full h-full object-contain"
        draggable={false}
      />
      {rank !== undefined && (
        <div
          className="absolute -top-1 -left-1 rounded-full flex items-center justify-center font-black"
          style={{
            width: size === 'sm' ? 14 : 18,
            height: size === 'sm' ? 14 : 18,
            background: 'linear-gradient(135deg, #FFD700, #FFA000)',
            color: '#1a1a1a',
            boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
            fontSize: size === 'sm' ? '0.5rem' : '0.6rem',
            border: '1px solid #fff3',
          }}
        >
          {rank}
        </div>
      )}
    </motion.div>
  );
};

export default TikiToken;
export { PLAYER_GRADIENTS };
