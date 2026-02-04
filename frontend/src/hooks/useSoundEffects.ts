import { useCallback, useRef, useEffect, useState } from 'react';

// Sound effect types
type SoundType = 'click' | 'start' | 'stop' | 'success' | 'pause' | 'resume';

// Get saved sound effects preference
const getSoundEnabled = (): boolean => {
  const saved = localStorage.getItem('moo-sound-effects');
  return saved !== 'false'; // Default to true
};

interface UseSoundEffectsReturn {
  playSound: (type: SoundType) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

export function useSoundEffects(): UseSoundEffectsReturn {
  const [soundEnabled, setSoundEnabled] = useState(getSoundEnabled);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize AudioContext
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Create a simple beep sound
  const createBeep = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
    if (!audioContextRef.current || !soundEnabled) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    // Envelope for smooth sound
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, [soundEnabled]);

  const playSound = useCallback((type: SoundType) => {
    if (!soundEnabled) return;

    // Resume audio context if suspended (browser autoplay policy)
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }

    switch (type) {
      case 'click':
        // Short click sound
        createBeep(800, 0.08, 'sine', 0.15);
        break;
      case 'start':
        // Ascending start sound
        createBeep(440, 0.15, 'sine', 0.25);
        setTimeout(() => createBeep(550, 0.15, 'sine', 0.25), 100);
        setTimeout(() => createBeep(660, 0.2, 'sine', 0.3), 200);
        break;
      case 'stop':
        // Descending stop sound
        createBeep(660, 0.15, 'sine', 0.25);
        setTimeout(() => createBeep(550, 0.15, 'sine', 0.25), 100);
        setTimeout(() => createBeep(440, 0.2, 'sine', 0.3), 200);
        break;
      case 'success':
        // Happy success jingle
        createBeep(523, 0.12, 'sine', 0.3); // C
        setTimeout(() => createBeep(659, 0.12, 'sine', 0.3), 100); // E
        setTimeout(() => createBeep(784, 0.12, 'sine', 0.3), 200); // G
        setTimeout(() => createBeep(1047, 0.25, 'sine', 0.35), 300); // C (high)
        break;
      case 'pause':
        // Double beep for pause
        createBeep(600, 0.1, 'sine', 0.2);
        setTimeout(() => createBeep(600, 0.1, 'sine', 0.2), 150);
        break;
      case 'resume':
        // Rising tone for resume
        createBeep(400, 0.1, 'sine', 0.2);
        setTimeout(() => createBeep(600, 0.15, 'sine', 0.25), 100);
        break;
    }
  }, [soundEnabled, createBeep]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('moo-sound-effects', newValue.toString());
      return newValue;
    });
  }, []);

  return { playSound, soundEnabled, toggleSound };
}
