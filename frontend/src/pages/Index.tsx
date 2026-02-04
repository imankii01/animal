import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Timer } from '@/components/Timer';
import { TimerRing } from '@/components/TimerRing';
import { MilkQuantityDialog } from '@/components/MilkQuantityDialog';
import { useTimer } from '@/hooks/useTimer';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { createSession } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Play, Pause, Square, Clock, Music, History, Sparkles, Volume2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FloatingParticles } from '@/components/FloatingParticles';
import { triggerMilkConfetti } from '@/components/Confetti';
import { VolumeControl } from '@/components/VolumeControl';
import { LanguageToggle } from '@/components/LanguageToggle';

const Index = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const timer = useTimer();
  const audio = useAudioPlayer();
  const { playSound } = useSoundEffects();
  
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [finalDuration, setFinalDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = () => {
    playSound('start');
    setSessionStartTime(new Date());
    timer.start();
    audio.play();
  };

  const handlePause = () => {
    playSound('pause');
    timer.pause();
    audio.pause();
  };

  const handleResume = () => {
    playSound('resume');
    timer.resume();
    audio.play();
  };

  const handleStop = () => {
    playSound('stop');
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

      playSound('success');
      toast({
        title: t.sessionSaved,
        description: `${t.recorded} ${quantity}L in ${Math.floor(finalDuration / 60)}m ${finalDuration % 60}s`,
      });

      // Trigger celebration confetti
      triggerMilkConfetti();

      timer.reset();
      setSessionStartTime(null);
      setShowQuantityDialog(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t.errorSaving,
        description: error instanceof Error ? error.message : t.checkConnection,
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
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30 flex flex-col relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        </div>
        
        {/* Floating particles */}
        <FloatingParticles count={15} />

        {/* Header */}
        <header className="p-4 sm:p-6 flex justify-between items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <span className="text-xl">🐄</span>
            <span className="font-semibold text-foreground hidden sm:inline">{t.appName}</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <LanguageToggle />
            <ThemeToggle />
            <Link to="/history">
              <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary/80">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">{t.viewHistory}</span>
              </Button>
            </Link>
          </motion.div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-12 sm:pb-20 relative z-10">
          {/* Cow Icon with glow effect */}
          <motion.div 
            className="relative mb-6 sm:mb-8"
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 15,
              duration: 0.8
            }}
          >
            {/* Glow ring */}
            <motion.div 
              className="absolute inset-0 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary/20 blur-xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.3, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-glow relative">
              <motion.span 
                className="text-4xl sm:text-5xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
              >
                🐄
              </motion.span>
            </div>
          </motion.div>

          {/* Title with gradient */}
          <motion.div
            className="text-center mb-6 sm:mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">
              {t.milkingTracker}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xs sm:max-w-md px-2">
              {t.tagline}
            </p>
          </motion.div>

          {/* Start Button with enhanced styling */}
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
              className="gap-2 sm:gap-3 text-base sm:text-lg px-8 sm:px-12 py-6 sm:py-8 rounded-2xl shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
            >
              <Play className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" />
              {t.startMilking}
            </Button>
          </motion.div>

          {/* Feature Cards with glass effect */}
          <motion.div 
            className="grid grid-cols-2 gap-3 sm:gap-4 mt-10 sm:mt-16 w-full max-w-xs sm:max-w-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.03, y: -4 }} transition={{ duration: 0.2 }}>
              <Card className="glass-card border-0 overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                    <Music className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">{t.calmingMusic}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t.calmingMusicDesc}</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03, y: -4 }} transition={{ duration: 0.2 }}>
              <Card className="glass-card border-0 overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">{t.sessionTimer}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t.sessionTimerDesc}</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </main>

        {/* Footer */}
        <motion.footer 
          className="p-4 sm:p-6 text-center relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t.funFact}
            </p>
          </div>
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], x: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {/* Floating particles */}
      <FloatingParticles count={12} />

      {/* Timer Circle with ring progress */}
      <motion.div 
        className="relative mb-8 sm:mb-12"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, duration: 0.6 }}
      >
        <TimerRing 
          seconds={timer.seconds} 
          maxSeconds={1800} 
          size={280}
          strokeWidth={10}
          className="sm:scale-110 md:scale-125"
        >
          <div className="flex flex-col items-center justify-center">
            <Timer seconds={timer.seconds} className="text-foreground text-3xl sm:text-4xl md:text-5xl" />
            <motion.div 
              className="flex items-center gap-2 text-muted-foreground mt-2"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Music className="h-4 w-4" />
              <span className="text-xs sm:text-sm font-medium">{t.milkingInProgress}</span>
            </motion.div>
          </div>
        </TimerRing>
      </motion.div>

      {/* Control Buttons with improved styling */}
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
              className="w-full gap-2 text-base sm:text-lg py-6 sm:py-7 rounded-2xl shadow-soft hover:shadow-lg transition-all"
            >
              <Play className="h-5 w-5" />
              {t.resume}
            </Button>
          </motion.div>
        ) : (
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={handlePause}
              className="w-full gap-2 text-base sm:text-lg py-6 sm:py-7 rounded-2xl shadow-soft hover:shadow-lg transition-all"
            >
              <Pause className="h-5 w-5" />
              {t.pause}
            </Button>
          </motion.div>
        )}
        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            size="lg" 
            variant="destructive"
            onClick={handleStop}
            className="w-full gap-2 text-base sm:text-lg py-6 sm:py-7 rounded-2xl shadow-soft hover:shadow-lg transition-all"
          >
            <Square className="h-5 w-5" />
            {t.stop}
          </Button>
        </motion.div>
      </motion.div>

      {/* Volume control with slider */}
      {audio.isPlaying && (
        <motion.div 
          className="mt-10 px-5 py-3 rounded-2xl bg-secondary/80 backdrop-blur-sm shadow-soft flex items-center gap-4"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <Music className="h-5 w-5 text-primary" />
          </motion.div>
          <span className="text-sm text-muted-foreground">{t.musicPlaying}</span>
          <VolumeControl
            volume={audio.volume}
            isMuted={audio.isMuted}
            onVolumeChange={audio.setVolume}
            onToggleMute={audio.toggleMute}
          />
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
