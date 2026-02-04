import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface FloatingParticlesProps {
  count?: number;
  className?: string;
}

export function FloatingParticles({ count = 20, className }: FloatingParticlesProps) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.3 + 0.1,
    }));
  }, [count]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/30 dark:bg-primary/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      {/* Add some accent colored particles */}
      {particles.slice(0, Math.floor(count / 3)).map((particle) => (
        <motion.div
          key={`accent-${particle.id}`}
          className="absolute rounded-full bg-accent/20 dark:bg-accent/15"
          style={{
            left: `${(particle.x + 50) % 100}%`,
            top: `${(particle.y + 30) % 100}%`,
            width: particle.size * 0.8,
            height: particle.size * 0.8,
          }}
          animate={{
            y: [0, -25, 0],
            x: [0, Math.random() * 15 - 7, 0],
            opacity: [particle.opacity * 0.8, particle.opacity, particle.opacity * 0.8],
          }}
          transition={{
            duration: particle.duration * 1.2,
            delay: particle.delay + 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
