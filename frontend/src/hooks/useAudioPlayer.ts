import { useRef, useState, useCallback, useEffect } from 'react';

// Music tracks for random selection
const MUSIC_TRACKS = [
  '/After-the-Rain-Inspiring-Atmospheric-Music.mp3',
  '/Moon-Waltz.mp3',
  '/sb_adriftamonginfinitestars.mp3',
  '/scott-buckley-moonlight.mp3',
];

// Get a random track
const getRandomTrack = () => {
  const randomIndex = Math.floor(Math.random() * MUSIC_TRACKS.length);
  return MUSIC_TRACKS[randomIndex];
};

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  currentTrack: string;
  play: () => void;
  pause: () => void;
  stop: () => void;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('');

  const initializeAudio = useCallback((track: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    audioRef.current = new Audio(track);
    audioRef.current.loop = true;
    setCurrentTrack(track);
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const play = useCallback(() => {
    // Select random track when starting
    const track = getRandomTrack();
    initializeAudio(track);
    
    if (audioRef.current) {
      audioRef.current.play().catch(err => {
        console.error('Failed to play audio:', err);
      });
      setIsPlaying(true);
    }
  }, [initializeAudio]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  return { isPlaying, currentTrack, play, pause, stop };
}
