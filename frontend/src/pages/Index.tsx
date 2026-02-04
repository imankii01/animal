import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Timer } from '@/components/Timer';
import { MilkQuantityDialog } from '@/components/MilkQuantityDialog';
import { useTimer } from '@/hooks/useTimer';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { createSession } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, Square, Clock, Music, Volume2 } from 'lucide-react';

const Index = () => {
  const { toast } = useToast();
  const timer = useTimer();
  const audio = useAudioPlayer();
  
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [finalDuration, setFinalDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = () => {
    setSessionStartTime(new Date());
    timer.start();
    audio.play();
  };

  const handlePause = () => {
    timer.pause();
    audio.pause();
  };

  const handleResume = () => {
    timer.resume();
    audio.play();
  };

  const handleStop = () => {
    const duration = timer.stop();
    setFinalDuration(duration);
    audio.stop();
    setShowQuantityDialog(true);
  };

  const handleSubmitQuantity = async (quantity: number) => {
    if (!sessionStartTime) return;

    const endTime = new Date();
    setIsLoading(true);

    try {
      await createSession({
        start_time: sessionStartTime.toISOString(),
        end_time: endTime.toISOString(),
        duration: finalDuration,
        milk_quantity: quantity,
      });

      toast({
        title: 'Session Saved! 🎉',
        description: `Recorded ${quantity}L of milk in ${Math.floor(finalDuration / 60)}m ${finalDuration % 60}s`,
      });

      timer.reset();
      setSessionStartTime(null);
      setShowQuantityDialog(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error saving session',
        description: error instanceof Error ? error.message : 'Please check your API connection',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDialog = () => {
    setShowQuantityDialog(false);
    timer.reset();
    setSessionStartTime(null);
  };

  // Landing page view
  if (!timer.isRunning && !timer.isPaused && timer.seconds === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="p-4 flex justify-end items-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Link to="/history" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Clock className="h-4 w-4" />
              <span className="text-sm">View History</span>
            </Link>
          </motion.div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-12 sm:pb-20">
          {/* Cow Icon - Spinning entrance animation */}
          <motion.div 
            className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-primary flex items-center justify-center mb-6 sm:mb-8"
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 15,
              duration: 0.8
            }}
          >
            <motion.span 
              className="text-3xl sm:text-5xl"
              animate={{ 
                rotate: [0, 10, -10, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
            >
              🐄
            </motion.span>
          </motion.div>

          {/* Title */}
          <motion.h1 
            className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Milking Tracker
          </motion.h1>
          
          <motion.p 
            className="text-sm sm:text-base text-muted-foreground text-center max-w-xs sm:max-w-md mb-6 sm:mb-10 px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Track your milking sessions with soothing music for happier, more productive cattle
          </motion.p>

          {/* Start Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              onClick={handleStart}
              className="gap-2 sm:gap-3 text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-7 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Play className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" />
              Start Milking
            </Button>
          </motion.div>

          {/* Feature Cards */}
          <motion.div 
            className="grid grid-cols-2 gap-3 sm:gap-4 mt-8 sm:mt-16 w-full max-w-xs sm:max-w-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
              <Card className="bg-card border-border">
                <CardContent className="p-3 sm:pt-6 sm:px-6">
                  <Music className="h-5 w-5 sm:h-6 sm:w-6 text-accent mb-2 sm:mb-3" />
                  <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Calming Music</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Relaxing sounds for stress-free milking</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
              <Card className="bg-card border-border">
                <CardContent className="p-3 sm:pt-6 sm:px-6">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-accent mb-2 sm:mb-3" />
                  <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Session Timer</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Track duration with precision</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </main>

        {/* Footer */}
        <motion.footer 
          className="p-4 sm:p-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-2 px-2">
            <Music className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>Studies show calming music can increase milk yield by up to 3%</span>
          </p>
        </motion.footer>

        <MilkQuantityDialog
          open={showQuantityDialog}
          onSubmit={handleSubmitQuantity}
          onCancel={handleCancelDialog}
          duration={finalDuration}
        />
      </div>
    );
  }

  // Active session view
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 sm:px-6">
      {/* Timer Circle with pulse animation */}
      <motion.div 
        className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full bg-primary flex flex-col items-center justify-center shadow-xl mb-6 sm:mb-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 20,
          duration: 0.6
        }}
      >
        {/* Pulsing ring effect */}
        <motion.div
          className="absolute w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full border-4 border-primary/30"
          animate={ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <Timer seconds={timer.seconds} className="text-primary-foreground" />
        <motion.div 
          className="flex items-center gap-2 text-primary-foreground/80 mt-2"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Music className="h-4 w-4" />
          <span className="text-sm">Milking in progress...</span>
        </motion.div>
      </motion.div>

      {/* Control Buttons */}
      <motion.div 
        className="flex gap-3 sm:gap-4 w-full max-w-xs sm:max-w-md px-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {timer.isPaused ? (
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={handleResume}
              className="w-full gap-2 text-base sm:text-lg py-5 sm:py-7 rounded-xl"
            >
              <Play className="h-4 w-4 sm:h-5 sm:w-5" />
              Resume
            </Button>
          </motion.div>
        ) : (
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={handlePause}
              className="w-full gap-2 text-base sm:text-lg py-5 sm:py-7 rounded-xl"
            >
              <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
              Pause
            </Button>
          </motion.div>
        )}
        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            size="lg" 
            variant="destructive"
            onClick={handleStop}
            className="w-full gap-2 text-base sm:text-lg py-5 sm:py-7 rounded-xl"
          >
            <Square className="h-4 w-4 sm:h-5 sm:w-5" />
            Stop
          </Button>
        </motion.div>
      </motion.div>

      {/* Volume indicator */}
      {audio.isPlaying && (
        <motion.div 
          className="mt-8 p-3 rounded-full bg-secondary"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <Volume2 className="h-5 w-5 text-muted-foreground" />
          </motion.div>
        </motion.div>
      )}

      <MilkQuantityDialog
        open={showQuantityDialog}
        onSubmit={handleSubmitQuantity}
        onCancel={handleCancelDialog}
        duration={finalDuration}
      />
    </div>
  );
};

export default Index;
