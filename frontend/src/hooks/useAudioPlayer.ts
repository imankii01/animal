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

// Get saved volume from localStorage
const getSavedVolume = (): number => {
  const saved = localStorage.getItem('moo-music-volume');
  return saved ? parseFloat(saved) : 0.7;
};

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  currentTrack: string;
  volume: number;
  isMuted: boolean;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('');
  const [volume, setVolumeState] = useState(getSavedVolume);
  const [isMuted, setIsMuted] = useState(false);
  const previousVolumeRef = useRef(volume);

  const initializeAudio = useCallback((track: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    audioRef.current = new Audio(track);
    audioRef.current.loop = true;
    audioRef.current.volume = isMuted ? 0 : volume;
    setCurrentTrack(track);
  }, [volume, isMuted]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

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

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    localStorage.setItem('moo-music-volume', clampedVolume.toString());
    if (clampedVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      setVolumeState(previousVolumeRef.current > 0 ? previousVolumeRef.current : 0.7);
    } else {
      previousVolumeRef.current = volume;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  return { isPlaying, currentTrack, volume, isMuted, play, pause, stop, setVolume, toggleMute };
}
