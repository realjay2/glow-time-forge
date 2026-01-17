import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  velocity: { x: number; y: number };
  rotationSpeed: number;
  opacity: number;
}

interface ConfettiProps {
  isActive: boolean;
  onComplete?: () => void;
}

const COLORS = [
  'hsl(0, 0%, 100%)',
  'hsl(0, 0%, 85%)',
  'hsl(0, 0%, 70%)',
  'hsl(0, 0%, 95%)',
];

export function Confetti({ isActive, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    // Create particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: 50 + (Math.random() - 0.5) * 20,
        y: 50,
        size: Math.random() * 8 + 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        velocity: {
          x: (Math.random() - 0.5) * 15,
          y: -Math.random() * 20 - 10,
        },
        rotationSpeed: (Math.random() - 0.5) * 20,
        opacity: 1,
      });
    }
    setParticles(newParticles);

    // Animate particles
    let frame: number;
    let startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed > 2000) {
        setParticles([]);
        onComplete?.();
        return;
      }

      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.velocity.x * 0.1,
        y: p.y + p.velocity.y * 0.1,
        velocity: {
          x: p.velocity.x * 0.98,
          y: p.velocity.y + 0.5,
        },
        rotation: p.rotation + p.rotationSpeed,
        opacity: Math.max(0, 1 - elapsed / 2000),
      })));

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [isActive, onComplete]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            opacity: particle.opacity,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            boxShadow: `0 0 ${particle.size}px ${particle.color}`,
          }}
        />
      ))}
    </div>
  );
}