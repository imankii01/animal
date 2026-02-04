import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TimerRingProps {
  seconds: number;
  maxSeconds?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

export function TimerRing({ 
  seconds, 
  maxSeconds = 3600, // 1 hour default max
  size = 280,
  strokeWidth = 8,
  className,
  children 
}: TimerRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(seconds / maxSeconds, 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-secondary/50 dark:text-secondary/30"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#timer-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="50%" stopColor="hsl(var(--accent))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-full opacity-20 blur-xl"
        style={{
          background: `conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))`,
          transform: `rotate(${progress * 360}deg)`,
        }}
      />
    </div>
  );
}
