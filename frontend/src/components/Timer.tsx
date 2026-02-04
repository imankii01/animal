import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TimerProps {
  seconds: number;
  className?: string;
}

export function Timer({ seconds, className }: TimerProps) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <motion.div 
      className={cn('font-mono text-6xl md:text-7xl font-bold tracking-tight', className)}
      animate={{ 
        scale: [1, 1.02, 1],
      }}
      transition={{ 
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <span>{formatNumber(minutes)}</span>
      <span className="animate-pulse">:</span>
      <span>{formatNumber(secs)}</span>
    </motion.div>
  );
}
