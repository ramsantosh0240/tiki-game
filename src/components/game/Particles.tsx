import { useMemo } from 'react';

const Particles = () => {
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 60 + Math.random() * 40,
      size: Math.random() * 3 + 1.5,
      duration: 4 + Math.random() * 4,
      delay: Math.random() * 4,
      type: i < 5 ? 'ember' : i < 9 ? 'firefly' : 'smoke' as const,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background:
              p.type === 'ember'
                ? 'radial-gradient(circle, #FF6B35, #FF4500 50%, transparent)'
                : p.type === 'firefly'
                ? 'radial-gradient(circle, #FFD700, #FFB300 50%, transparent)'
                : 'radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)',
            animation: `particle-rise ${p.duration}s ${p.delay}s ease-out infinite`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
};

export default Particles;
