import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import tikiBg from '@/assets/tiki-bg.jpg';
import tikiIdol from '@/assets/tiki-idol.png';
import TikiToken, { PLAYER_GRADIENTS } from './TikiToken';
import Particles from './Particles';

const BOARD_SIZE = 10;
const MAX_TURNS = 25;
const PLAYER_NAMES = ['Lava', 'Sun', 'Wave', 'Jungle'];

interface Token { id: string; player: number; position: number; }
interface Score { player: number; score: number; }
type Screen = 'menu' | 'playerSelect' | 'howToPlay' | 'settings' | 'game' | 'gameOver';

/* ── Smoke Overlay ── */
const SmokeTransition = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onComplete, 900);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div className="fixed inset-0 z-[100] pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 120 + Math.random() * 160,
            height: 120 + Math.random() * 160,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, rgba(70,40,15,0.7) 0%, transparent 70%)`,
            filter: 'blur(25px)',
            animation: `smoke-puff 0.9s ${Math.random() * 0.3}s ease-out forwards`,
          }}
        />
      ))}
    </motion.div>
  );
};

/* ── Door Transition ── */
const DoorTransition = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onComplete, 800);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div className="fixed inset-0 z-[99]" style={{ perspective: '1200px' }}>
      {/* Left door */}
      <motion.div
        className="absolute top-0 left-0 w-1/2 h-full"
        style={{
          background: 'linear-gradient(90deg, #1a0d05, #2d1a0a, #1a0d05)',
          transformOrigin: 'left center',
          borderRight: '4px solid #8B6914',
          boxShadow: 'inset -20px 0 60px rgba(0,0,0,0.8), 0 0 40px rgba(139,105,20,0.3)',
        }}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: -110 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1], delay: 0.05 }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <div className="w-16 h-32 rounded-full border-4 border-amber-700" />
        </div>
        {/* Door handle */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-12 rounded-full"
          style={{ background: 'linear-gradient(180deg, #FFD700, #8B6914, #FFD700)', boxShadow: '0 0 15px rgba(255,215,0,0.4)' }} />
      </motion.div>
      {/* Right door */}
      <motion.div
        className="absolute top-0 right-0 w-1/2 h-full"
        style={{
          background: 'linear-gradient(270deg, #1a0d05, #2d1a0a, #1a0d05)',
          transformOrigin: 'right center',
          borderLeft: '4px solid #8B6914',
          boxShadow: 'inset 20px 0 60px rgba(0,0,0,0.8), 0 0 40px rgba(139,105,20,0.3)',
        }}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: 110 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1], delay: 0.05 }}
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-12 rounded-full"
          style={{ background: 'linear-gradient(180deg, #FFD700, #8B6914, #FFD700)', boxShadow: '0 0 15px rgba(255,215,0,0.4)' }} />
      </motion.div>
      {/* Light rays */}
      <motion.div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(255,180,50,0.3) 0%, transparent 70%)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.6] }}
        transition={{ duration: 0.6, delay: 0.2 }}
      />
    </motion.div>
  );
};

/* ── 3D Text Button ── */
const RomanButton = ({ children, onClick, delay = 0, size = 'lg', glow = false }: {
  children: React.ReactNode; onClick: () => void; delay?: number; size?: 'sm' | 'md' | 'lg'; glow?: boolean;
}) => {
  const fontSize = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm';
  return (
    <motion.button
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, type: 'spring', damping: 20 }}
      whileHover={{ scale: 1.08, textShadow: '0 0 40px rgba(255,200,50,0.8)' }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`block w-full border-none bg-transparent cursor-pointer font-black tracking-[0.2em] uppercase ${fontSize}`}
      style={{
        fontFamily: 'var(--font-heading)',
        color: glow ? '#FFD700' : '#e8d5b0',
        textShadow: glow
          ? '0 0 30px rgba(255,215,0,0.6), 0 0 60px rgba(255,140,0,0.3), 0 4px 8px rgba(0,0,0,0.8)'
          : '0 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(255,200,100,0.15)',
        padding: size === 'lg' ? '16px 0' : size === 'md' ? '12px 0' : '8px 0',
        letterSpacing: '0.25em',
      }}
    >
      {children}
    </motion.button>
  );
};

/* ──────────── MAIN MENU ──────────── */
const MainMenu = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => (
  <div className="tiki-fullscreen" style={{ background: '#0a0604' }}>
    <div className="absolute inset-0" style={{ backgroundImage: `url(${tikiBg})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.4, filter: 'blur(2px)' }} />
    <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(255,100,0,0.15) 0%, transparent 60%), linear-gradient(to top, rgba(0,0,0,0.95), transparent 40%)' }} />
    <Particles />

    <div className="relative z-10 flex flex-col h-full" style={{ perspective: '800px' }}>
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ rotateX: 20, y: -60, opacity: 0 }}
          animate={{ rotateX: 0, y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, delay: 0.3 }}
          className="text-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <motion.img
            src={tikiIdol}
            alt="Tiki Idol"
            className="w-28 h-auto mx-auto"
            loading="eager"
            animate={{ y: [0, -12, 0], rotateY: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              filter: 'drop-shadow(0 0 50px rgba(255,100,0,0.5)) drop-shadow(0 20px 40px rgba(0,0,0,0.9))',
            }}
          />
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 12vw, 4rem)',
              color: '#FFD700',
              textShadow: '0 0 60px rgba(255,140,0,0.5), 0 0 120px rgba(255,69,0,0.3), 0 6px 0 #5D3A1A, 0 8px 20px rgba(0,0,0,0.9)',
              letterSpacing: '0.15em',
              lineHeight: 1,
              marginTop: '0.5rem',
            }}
          >
            TIKI
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.75, type: 'spring' }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.5rem, 8vw, 2.5rem)',
              color: '#e8b84a',
              textShadow: '0 0 40px rgba(255,140,0,0.3), 0 4px 0 #3d2510, 0 6px 12px rgba(0,0,0,0.9)',
              letterSpacing: '0.3em',
              lineHeight: 1,
            }}
          >
            TOPPLE
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="h-px mx-auto mt-3 mb-1"
            style={{ width: '60%', background: 'linear-gradient(90deg, transparent, #FFD70066, transparent)' }}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 1.1 }}
            className="text-xs tracking-[0.4em] uppercase"
            style={{ fontFamily: 'var(--font-heading)', color: '#b8956a' }}
          >
            Conquer the Island
          </motion.p>
        </motion.div>
      </div>

      <div className="px-8 pb-10 space-y-1 max-w-xs mx-auto w-full">
        <RomanButton onClick={() => onNavigate('playerSelect')} delay={0.9} size="lg" glow>
          Play
        </RomanButton>
        <RomanButton onClick={() => onNavigate('howToPlay')} delay={1.0} size="md">
          How to Play
        </RomanButton>
        <RomanButton onClick={() => onNavigate('settings')} delay={1.1} size="sm">
          Settings
        </RomanButton>
      </div>
    </div>
  </div>
);

/* ──────────── PLAYER SELECT ──────────── */
const PlayerSelect = ({ onStart, onBack }: { onStart: (n: number) => void; onBack: () => void }) => (
  <div className="tiki-fullscreen" style={{ background: '#0a0604' }}>
    <div className="absolute inset-0" style={{ backgroundImage: `url(${tikiBg})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3 }} />
    <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(255,100,0,0.1) 0%, transparent 60%), linear-gradient(to top, rgba(0,0,0,0.9), transparent 40%)' }} />
    <Particles />

    <div className="relative z-10 flex flex-col h-full p-5" style={{ perspective: '600px' }}>
      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onBack}
        className="self-start border-none bg-transparent cursor-pointer text-sm tracking-[0.15em] uppercase"
        style={{ fontFamily: 'var(--font-heading)', color: '#8a7a60', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
        ‹ Back
      </motion.button>

      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.h2
          initial={{ rotateX: 30, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 6vw, 2rem)',
            color: '#FFD700',
            textShadow: '0 0 30px rgba(255,215,0,0.4), 0 4px 0 #3d2510, 0 6px 10px rgba(0,0,0,0.8)',
            letterSpacing: '0.2em',
            marginBottom: '0.5rem',
          }}
        >
          Choose Warriors
        </motion.h2>
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
          className="h-px mb-6" style={{ width: 120, background: 'linear-gradient(90deg, transparent, #FFD70055, transparent)' }} />

        <div className="space-y-4 w-full max-w-xs">
          {[2, 3, 4].map((n, i) => (
            <motion.button
              key={n}
              initial={{ x: 80, opacity: 0, rotateY: 30 }}
              animate={{ x: 0, opacity: 1, rotateY: 0 }}
              transition={{ delay: 0.3 + i * 0.15, type: 'spring', damping: 18 }}
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onStart(n)}
              className="w-full border-none cursor-pointer rounded-xl p-4 flex items-center gap-4"
              style={{
                background: 'linear-gradient(135deg, rgba(30,18,8,0.9), rgba(50,30,15,0.9))',
                border: '1px solid rgba(139,105,20,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,215,0,0.1)',
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="flex -space-x-2">
                {Array.from({ length: n }, (_, j) => (
                  <TikiToken key={j} player={j} size="sm" />
                ))}
              </div>
              <div className="flex-1 text-left">
                <div className="font-black tracking-[0.15em] uppercase"
                  style={{ fontFamily: 'var(--font-heading)', color: '#FFD700', fontSize: '1.1rem',
                    textShadow: '0 0 15px rgba(255,215,0,0.3), 0 2px 4px rgba(0,0,0,0.8)' }}>
                  {n} Players
                </div>
                <div className="text-xs" style={{ color: '#8a7a60', fontFamily: 'var(--font-heading)', letterSpacing: '0.1em' }}>
                  1 Human + {n - 1} AI
                </div>
              </div>
              <div style={{ color: '#5a4a30', fontSize: '1.5rem', fontFamily: 'var(--font-display)' }}>›</div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ──────────── HOW TO PLAY ──────────── */
const HowToPlay = ({ onBack }: { onBack: () => void }) => (
  <div className="tiki-fullscreen" style={{ background: '#0a0604' }}>
    <div className="absolute inset-0" style={{ backgroundImage: `url(${tikiBg})`, backgroundSize: 'cover', opacity: 0.2 }} />
    <div className="absolute inset-0 bg-black/80" />
    <div className="relative z-10 flex flex-col h-full p-5">
      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onBack}
        className="self-start border-none bg-transparent cursor-pointer text-sm tracking-[0.15em] uppercase"
        style={{ fontFamily: 'var(--font-heading)', color: '#8a7a60' }}>
        ‹ Back
      </motion.button>
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto">
        <motion.h2 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          style={{ fontFamily: 'var(--font-display)', color: '#FFD700', fontSize: '1.6rem', letterSpacing: '0.2em',
            textShadow: '0 0 20px rgba(255,215,0,0.3), 0 3px 0 #3d2510', marginBottom: '2rem' }}>
          How to Play
        </motion.h2>
        {[
          { icon: '⬆', title: 'MOVE', desc: 'Push the top 1-3 tokens forward on the track', color: '#4DD0E1' },
          { icon: '⇄', title: 'REORDER', desc: 'Rearrange the top 2-3 tokens in the stack', color: '#FF6B35' },
          { icon: '★', title: 'WIN', desc: 'Get your tokens furthest to score the most!', color: '#FFD700' },
        ].map((rule, i) => (
          <motion.div key={rule.title} initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.15 }} className="flex items-start gap-4 mb-6 w-full">
            <div className="w-11 h-11 rounded-lg flex items-center justify-center text-xl font-black shrink-0"
              style={{ background: `${rule.color}15`, border: `1px solid ${rule.color}44`, color: rule.color,
                boxShadow: `0 0 20px ${rule.color}22` }}>
              {rule.icon}
            </div>
            <div>
              <div className="font-black tracking-[0.15em]" style={{ fontFamily: 'var(--font-heading)', color: '#e8d5b0' }}>{rule.title}</div>
              <div className="text-sm" style={{ color: '#8a7a60' }}>{rule.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

/* ──────────── SETTINGS ──────────── */
const Settings = ({ onBack }: { onBack: () => void }) => (
  <div className="tiki-fullscreen" style={{ background: '#0a0604' }}>
    <div className="absolute inset-0" style={{ backgroundImage: `url(${tikiBg})`, backgroundSize: 'cover', opacity: 0.2 }} />
    <div className="absolute inset-0 bg-black/80" />
    <div className="relative z-10 flex flex-col h-full p-5">
      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onBack}
        className="self-start border-none bg-transparent cursor-pointer text-sm tracking-[0.15em] uppercase"
        style={{ fontFamily: 'var(--font-heading)', color: '#8a7a60' }}>
        ‹ Back
      </motion.button>
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.h2 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          style={{ fontFamily: 'var(--font-display)', color: '#FFD700', fontSize: '1.6rem', letterSpacing: '0.2em',
            textShadow: '0 0 20px rgba(255,215,0,0.3), 0 3px 0 #3d2510' }}>
          Settings
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ color: '#8a7a60', fontFamily: 'var(--font-heading)', marginTop: '1rem' }}>Coming soon...</motion.p>
      </div>
    </div>
  </div>
);

/* ──────────── REORDER ──────────── */
const ReorderInterface = ({ tokens, onComplete, onCancel }: {
  tokens: Token[];
  onComplete: (order: number[]) => void;
  onCancel: () => void;
}) => {
  const [reordered, setReordered] = useState([...tokens]);
  const swap = (a: number, b: number) => {
    const next = [...reordered];
    [next[a], next[b]] = [next[b], next[a]];
    setReordered(next);
  };

  return (
    <div className="space-y-1">
      {reordered.map((t, i) => (
        <motion.div key={t.id} layout className="flex items-center gap-2 p-2 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(30,18,8,0.9), rgba(50,30,15,0.9))',
            border: '1px solid rgba(139,105,20,0.2)',
          }}>
          <TikiToken player={t.player} size="sm" />
          <span className="font-bold text-xs flex-1" style={{ fontFamily: 'var(--font-heading)', color: PLAYER_GRADIENTS[t.player].from }}>
            {PLAYER_NAMES[t.player]}
          </span>
          <div className="flex gap-1">
            {i > 0 && (
              <button onClick={() => swap(i, i - 1)} className="w-6 h-6 rounded border-none cursor-pointer text-xs font-black"
                style={{ background: 'rgba(255,215,0,0.2)', color: '#FFD700' }}>▲</button>
            )}
            {i < reordered.length - 1 && (
              <button onClick={() => swap(i, i + 1)} className="w-6 h-6 rounded border-none cursor-pointer text-xs font-black"
                style={{ background: 'rgba(255,215,0,0.2)', color: '#FFD700' }}>▼</button>
            )}
          </div>
        </motion.div>
      ))}
      <div className="flex gap-2 mt-2">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { onComplete(reordered.map((t) => tokens.findIndex((o) => o.id === t.id))); }}
          className="flex-1 py-2 rounded-lg border-none cursor-pointer font-black tracking-[0.15em] uppercase text-sm"
          style={{ fontFamily: 'var(--font-heading)', background: 'rgba(255,215,0,0.15)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)',
            textShadow: '0 0 10px rgba(255,215,0,0.3)' }}>
          Confirm
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={onCancel}
          className="py-2 px-4 rounded-lg border-none cursor-pointer text-sm tracking-[0.1em] uppercase"
          style={{ fontFamily: 'var(--font-heading)', background: 'rgba(100,80,50,0.2)', color: '#8a7a60' }}>
          Back
        </motion.button>
      </div>
    </div>
  );
};

/* ──────────── GAME OVER ──────────── */
const GameOverScreen = ({ scores, onRestart, onMenu }: { scores: Score[]; onRestart: () => void; onMenu: () => void }) => (
  <div className="tiki-fullscreen" style={{ background: '#0a0604' }}>
    <div className="absolute inset-0" style={{ backgroundImage: `url(${tikiBg})`, backgroundSize: 'cover', opacity: 0.3 }} />
    <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(255,215,0,0.1) 0%, transparent 60%)' }} />
    <Particles />
    <div className="relative z-10 flex flex-col h-full p-5 items-center justify-center" style={{ perspective: '600px' }}>
      <motion.div initial={{ rotateX: 30, scale: 0.7, opacity: 0 }} animate={{ rotateX: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }} className="w-full max-w-sm" style={{ transformStyle: 'preserve-3d' }}>
        <motion.img src={tikiIdol} alt="" className="w-16 h-auto mx-auto mb-2" loading="eager"
          animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity }}
          style={{ filter: 'drop-shadow(0 0 40px rgba(255,215,0,0.6))' }} />
        <motion.h1
          animate={{ scale: [1, 1.03, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
          style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#FFD700', textAlign: 'center',
            textShadow: '0 0 40px rgba(255,215,0,0.5), 0 4px 0 #3d2510', letterSpacing: '0.3em', marginBottom: '1rem' }}>
          Victory
        </motion.h1>

        <div className="space-y-2 mb-5">
          {scores.map((s, idx) => (
            <motion.div key={s.player} initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + idx * 0.12, type: 'spring' }}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{
                background: idx === 0
                  ? 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(139,105,20,0.15))'
                  : 'linear-gradient(135deg, rgba(30,18,8,0.8), rgba(50,30,15,0.8))',
                border: idx === 0 ? '1px solid rgba(255,215,0,0.4)' : '1px solid rgba(139,105,20,0.15)',
                boxShadow: idx === 0 ? '0 0 30px rgba(255,215,0,0.15)' : 'none',
              }}>
              <div className="w-7 text-center font-black text-lg"
                style={{ fontFamily: 'var(--font-display)', color: idx === 0 ? '#FFD700' : '#5a4a30',
                  textShadow: idx === 0 ? '0 0 15px rgba(255,215,0,0.5)' : 'none' }}>
                {idx === 0 ? '♛' : `${idx + 1}`}
              </div>
              <TikiToken player={s.player} size="md" highlighted={idx === 0} />
              <span className="font-black flex-1 tracking-wide" style={{
                color: PLAYER_GRADIENTS[s.player].from, fontFamily: 'var(--font-heading)',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
              }}>{PLAYER_NAMES[s.player]}</span>
              <span className="text-xl font-black" style={{ color: '#e8d5b0', fontFamily: 'var(--font-display)', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{s.score}</span>
            </motion.div>
          ))}
        </div>

        <div className="space-y-2">
          <RomanButton onClick={onRestart} size="md" glow>Play Again</RomanButton>
          <RomanButton onClick={onMenu} size="sm">Main Menu</RomanButton>
        </div>
      </motion.div>
    </div>
  </div>
);

/* ──────────── GAME SCREEN ──────────── */
const GameScreen = ({ numPlayers, onGameOver, onMenu }: {
  numPlayers: number;
  onGameOver: (scores: Score[]) => void;
  onMenu: () => void;
}) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [turnCount, setTurnCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [activeTab, setActiveTab] = useState<'board' | 'stack'>('board');

  useEffect(() => {
    const all: Token[] = [];
    for (let p = 0; p < numPlayers; p++)
      for (let i = 0; i < 4; i++)
        all.push({ id: `p${p}-t${i}`, player: p, position: 0 });
    setTokens(all.sort(() => Math.random() - 0.5));
    setMessage(`${PLAYER_NAMES[0]}'s turn`);
  }, [numPlayers]);

  const getTopTokens = (n: number) => tokens.slice(0, n);

  const calculateScores = useCallback((): Score[] => {
    const sorted = [...tokens].sort((a, b) => b.position - a.position);
    const pm = new Map<number, number>();
    sorted.forEach((t, i) => { pm.set(t.player, (pm.get(t.player) || 0) + tokens.length - i); });
    return Array.from({ length: numPlayers }, (_, i) => ({ player: i, score: pm.get(i) || 0 })).sort((a, b) => b.score - a.score);
  }, [tokens, numPlayers]);

  const endGame = useCallback(() => { setGameOver(true); onGameOver(calculateScores()); }, [calculateScores, onGameOver]);

  useEffect(() => {
    if (tokens.length === 0 || gameOver) return;
    if (tokens.every((t) => t.position >= BOARD_SIZE - 1) || turnCount >= MAX_TURNS) endGame();
  }, [tokens, turnCount, gameOver, endGame]);

  const nextTurn = useCallback(() => {
    setSelectedAction(null);
    const next = (currentPlayer + 1) % numPlayers;
    setCurrentPlayer(next);
    setTurnCount((c) => c + 1);
    setMessage(`${PLAYER_NAMES[next]}'s turn`);
  }, [currentPlayer, numPlayers]);

  const executeMove = useCallback((count: number) => {
    const nt = [...tokens];
    for (let i = 0; i < count; i++) nt[i] = { ...nt[i], position: Math.min(nt[i].position + 1, BOARD_SIZE - 1) };
    setTokens(nt);
    nextTurn();
  }, [tokens, nextTurn]);

  const executeReorder = useCallback((order: number[]) => {
    const nt = [...tokens]; const top = getTopTokens(order.length);
    for (let i = 0; i < order.length; i++) nt[i] = top[order[i]];
    setTokens(nt);
    nextTurn();
  }, [tokens, nextTurn]);

  const makeAIMove = useCallback(async () => {
    setIsAIThinking(true);
    setMessage('AI thinking...');
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 300));
    if (Math.random() > 0.5) executeMove(Math.floor(Math.random() * 3) + 1);
    else {
      const c = Math.random() > 0.5 ? 2 : 3;
      executeReorder(Array.from({ length: c }, (_, i) => i).sort(() => Math.random() - 0.5));
    }
    setIsAIThinking(false);
  }, [executeMove, executeReorder]);

  useEffect(() => {
    if (tokens.length > 0 && !gameOver && currentPlayer > 0 && !isAIThinking) {
      const t = setTimeout(() => makeAIMove(), 400);
      return () => clearTimeout(t);
    }
  }, [currentPlayer, gameOver, isAIThinking, makeAIMove, tokens.length]);

  const topTokens = getTopTokens(3);
  const turnPct = ((turnCount + 1) / MAX_TURNS) * 100;
  const isMyTurn = currentPlayer === 0 && !isAIThinking;

  return (
    <div className="tiki-fullscreen flex flex-col" style={{ background: '#0a0604' }}>
      <div className="absolute inset-0" style={{ backgroundImage: `url(${tikiBg})`, backgroundSize: 'cover', opacity: 0.25, filter: 'blur(3px)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(10,6,4,0.95))' }} />

      <div className="relative z-10 flex flex-col h-full overflow-hidden">
        {/* HUD */}
        <div className="px-3 pt-2 pb-1 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <motion.button whileTap={{ scale: 0.9 }} onClick={onMenu}
              className="border-none bg-transparent cursor-pointer text-sm"
              style={{ fontFamily: 'var(--font-heading)', color: '#8a7a60', letterSpacing: '0.1em' }}>☰</motion.button>
            <motion.div key={message} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="flex items-center gap-2 px-3 py-1 rounded-full"
              style={{ background: `${PLAYER_GRADIENTS[currentPlayer].from}15`, border: `1px solid ${PLAYER_GRADIENTS[currentPlayer].from}33` }}>
              <TikiToken player={currentPlayer} size="sm" className="w-5 h-5" />
              <span className="font-bold text-xs tracking-wide" style={{ fontFamily: 'var(--font-heading)', color: '#e8d5b0' }}>{message}</span>
            </motion.div>
            <div className="text-xs font-bold tracking-wider" style={{ fontFamily: 'var(--font-heading)', color: '#5a4a30' }}>{turnCount + 1}/{MAX_TURNS}</div>
          </div>
          {/* Turn bar */}
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(139,105,20,0.15)' }}>
            <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #FF4500, #FFD700)' }}
              animate={{ width: `${turnPct}%` }} transition={{ type: 'spring', damping: 25 }} />
          </div>
          {/* Player strip */}
          <div className="flex gap-1 mt-1">
            {Array.from({ length: numPlayers }, (_, i) => {
              const avg = tokens.filter((t) => t.player === i).reduce((s, t) => s + t.position, 0) / 4;
              return (
                <div key={i} className="flex-1 flex items-center gap-1 px-1 py-0.5 rounded"
                  style={{
                    background: currentPlayer === i ? `${PLAYER_GRADIENTS[i].from}12` : 'transparent',
                    border: currentPlayer === i ? `1px solid ${PLAYER_GRADIENTS[i].from}33` : '1px solid transparent',
                  }}>
                  <TikiToken player={i} size="sm" className="w-4 h-4" />
                  <span className="text-[9px] font-bold tracking-wide" style={{ color: PLAYER_GRADIENTS[i].from, fontFamily: 'var(--font-heading)' }}>
                    {PLAYER_NAMES[i].slice(0, 3)}
                  </span>
                  <span className="text-[8px] ml-auto" style={{ color: '#5a4a30' }}>{avg.toFixed(1)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex mx-3 mt-1 shrink-0" style={{ borderBottom: '1px solid rgba(139,105,20,0.2)' }}>
          {(['board', 'stack'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-1.5 text-xs font-black border-none cursor-pointer uppercase tracking-[0.15em]"
              style={{
                background: 'transparent',
                color: activeTab === tab ? '#FFD700' : '#5a4a30',
                borderBottom: activeTab === tab ? '2px solid #FFD700' : '2px solid transparent',
                fontFamily: 'var(--font-heading)',
                textShadow: activeTab === tab ? '0 0 10px rgba(255,215,0,0.3)' : 'none',
              }}>
              {tab === 'board' ? 'Island Track' : 'Token Stack'}
            </button>
          ))}
        </div>

        {/* Content - no scroll, compressed to fit */}
        <div className="flex-1 px-3 py-1 overflow-hidden min-h-0">
          <AnimatePresence mode="wait">
            {activeTab === 'board' ? (
              <motion.div key="board" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="h-full flex flex-col gap-[2px]">
                {Array.from({ length: BOARD_SIZE }, (_, pos) => {
                  const here = tokens.filter((t) => t.position === pos);
                  const isFinish = pos === BOARD_SIZE - 1;
                  return (
                    <div key={pos} className="flex-1 flex items-center px-2 rounded-md min-h-0"
                      style={{
                        background: isFinish
                          ? 'linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,140,0,0.08))'
                          : 'linear-gradient(135deg, rgba(30,18,8,0.6), rgba(40,25,12,0.4))',
                        border: isFinish ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(139,105,20,0.1)',
                        boxShadow: isFinish ? '0 0 15px rgba(255,215,0,0.1)' : 'none',
                      }}>
                      <div className="w-4 text-center font-black text-[10px]"
                        style={{
                          color: isFinish ? '#FFD700' : '#5a4a30',
                          fontFamily: 'var(--font-heading)',
                          textShadow: isFinish ? '0 0 8px rgba(255,215,0,0.4)' : 'none',
                        }}>
                        {isFinish ? '★' : pos}
                      </div>
                      <div className="flex gap-1 ml-auto">
                        <AnimatePresence>
                          {here.map((t) => (
                            <motion.div key={t.id}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ type: 'spring', damping: 15 }}>
                              <TikiToken player={t.player} size="sm" highlighted={isFinish} />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div key="stack" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col gap-[2px]">
                {tokens.map((t, idx) => (
                  <motion.div key={t.id} layout className="flex-1 flex items-center px-2 rounded-md min-h-0"
                    style={{
                      background: idx < 3
                        ? 'linear-gradient(135deg, rgba(30,18,8,0.8), rgba(50,30,15,0.6))'
                        : 'rgba(20,12,6,0.3)',
                      border: idx < 3 ? '1px solid rgba(139,105,20,0.15)' : '1px solid transparent',
                      opacity: idx < 3 ? 1 : 0.35,
                    }}>
                    <TikiToken player={t.player} size="sm" rank={idx < 3 ? idx + 1 : undefined} />
                    <span className="font-bold text-[10px] ml-2 tracking-wide" style={{
                      color: idx < 3 ? PLAYER_GRADIENTS[t.player].from : '#5a4a30',
                      fontFamily: 'var(--font-heading)',
                    }}>
                      {PLAYER_NAMES[t.player]}
                    </span>
                    <span className="ml-auto text-[8px]" style={{ color: '#5a4a30', fontFamily: 'var(--font-heading)' }}>pos {t.position}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Action Bar */}
        <div className="px-3 pb-3 pt-1 shrink-0" style={{ background: 'linear-gradient(to top, rgba(10,6,4,0.95), transparent)' }}>
          {isMyTurn ? (
            <AnimatePresence mode="wait">
              {!selectedAction ? (
                <motion.div key="actions" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex gap-3">
                  <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedAction('move')}
                    className="flex-1 py-3 rounded-lg border-none cursor-pointer font-black tracking-[0.15em] uppercase"
                    style={{ fontFamily: 'var(--font-heading)', background: 'rgba(0,191,165,0.12)', color: '#4DD0E1',
                      border: '1px solid rgba(0,191,165,0.3)', textShadow: '0 0 15px rgba(0,191,165,0.3)', fontSize: '0.9rem' }}>
                    ⬆ Move
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedAction('reorder')}
                    className="flex-1 py-3 rounded-lg border-none cursor-pointer font-black tracking-[0.15em] uppercase"
                    style={{ fontFamily: 'var(--font-heading)', background: 'rgba(255,69,0,0.12)', color: '#FF6B35',
                      border: '1px solid rgba(255,69,0,0.3)', textShadow: '0 0 15px rgba(255,69,0,0.3)', fontSize: '0.9rem' }}>
                    ⇄ Reorder
                  </motion.button>
                </motion.div>
              ) : selectedAction === 'move' ? (
                <motion.div key="move" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
                  <div className="flex gap-2 mb-2">
                    {[1, 2, 3].map((n) => (
                      <motion.button key={n} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => executeMove(n)}
                        className="flex-1 py-2.5 rounded-lg border-none cursor-pointer font-black text-lg"
                        style={{ fontFamily: 'var(--font-display)', background: 'rgba(255,215,0,0.12)', color: '#FFD700',
                          border: '1px solid rgba(255,215,0,0.3)', textShadow: '0 0 10px rgba(255,215,0,0.3)' }}>
                        {n}
                      </motion.button>
                    ))}
                  </div>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setSelectedAction(null)}
                    className="w-full py-1.5 rounded-lg border-none cursor-pointer text-xs tracking-[0.1em] uppercase"
                    style={{ fontFamily: 'var(--font-heading)', background: 'rgba(100,80,50,0.15)', color: '#8a7a60' }}>
                    ← Back
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div key="reorder" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
                  <ReorderInterface tokens={topTokens} onComplete={executeReorder} onCancel={() => setSelectedAction(null)} />
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-3 py-3">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                <TikiToken player={currentPlayer} size="md" />
              </motion.div>
              <span className="font-bold text-sm tracking-wider" style={{ fontFamily: 'var(--font-heading)', color: '#8a7a60' }}>
                {isAIThinking ? 'AI thinking...' : 'Waiting...'}
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ──────────── CONTROLLER ──────────── */
const TikiTopple = () => {
  const [screen, setScreen] = useState<Screen>('menu');
  const [numPlayers, setNumPlayers] = useState(2);
  const [scores, setScores] = useState<Score[]>([]);
  const [transition, setTransition] = useState<'door' | 'smoke' | null>(null);
  const [pendingScreen, setPendingScreen] = useState<Screen | null>(null);
  const [pendingPlayers, setPendingPlayers] = useState<number | null>(null);

  const navigateWithTransition = useCallback((target: Screen, players?: number) => {
    setPendingScreen(target);
    if (players) setPendingPlayers(players);
    setTransition('door');
  }, []);

  const handleDoorComplete = useCallback(() => {
    setTransition('smoke');
  }, []);

  const handleSmokeComplete = useCallback(() => {
    if (pendingScreen) {
      if (pendingPlayers) setNumPlayers(pendingPlayers);
      setScreen(pendingScreen);
    }
    setTransition(null);
    setPendingScreen(null);
    setPendingPlayers(null);
  }, [pendingScreen, pendingPlayers]);

  const navigateSimple = useCallback((target: Screen) => {
    setScreen(target);
  }, []);

  return (
    <>
      <AnimatePresence>
        {transition === 'door' && <DoorTransition onComplete={handleDoorComplete} />}
        {transition === 'smoke' && <SmokeTransition onComplete={handleSmokeComplete} />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div key={screen} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          {screen === 'menu' && (
            <MainMenu onNavigate={(s) => {
              if (s === 'playerSelect') navigateWithTransition(s);
              else navigateSimple(s);
            }} />
          )}
          {screen === 'playerSelect' && (
            <PlayerSelect
              onStart={(n) => navigateWithTransition('game', n)}
              onBack={() => navigateSimple('menu')}
            />
          )}
          {screen === 'howToPlay' && <HowToPlay onBack={() => navigateSimple('menu')} />}
          {screen === 'settings' && <Settings onBack={() => navigateSimple('menu')} />}
          {screen === 'game' && (
            <GameScreen numPlayers={numPlayers}
              onGameOver={(s) => { setScores(s); navigateWithTransition('gameOver'); }}
              onMenu={() => navigateSimple('menu')} />
          )}
          {screen === 'gameOver' && (
            <GameOverScreen scores={scores}
              onRestart={() => navigateWithTransition('game')}
              onMenu={() => navigateSimple('menu')} />
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default TikiTopple;
