import { useCallback, useRef } from 'react';

type SoundType = 'taskComplete' | 'timeExtension' | 'click' | 'success';

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.log('Audio not supported');
    }
  }, [getAudioContext]);

  const playSound = useCallback((sound: SoundType) => {
    try {
      const ctx = getAudioContext();
      
      switch (sound) {
        case 'taskComplete':
          // Cheerful ascending arpeggio
          playTone(523.25, 0.15, 'sine', 0.2); // C5
          setTimeout(() => playTone(659.25, 0.15, 'sine', 0.2), 100); // E5
          setTimeout(() => playTone(783.99, 0.2, 'sine', 0.25), 200); // G5
          break;
          
        case 'timeExtension':
          // Triumphant fanfare-like sound
          playTone(523.25, 0.2, 'sine', 0.15); // C5
          setTimeout(() => playTone(659.25, 0.2, 'sine', 0.15), 150); // E5
          setTimeout(() => playTone(783.99, 0.2, 'sine', 0.15), 300); // G5
          setTimeout(() => playTone(1046.50, 0.4, 'sine', 0.2), 450); // C6
          // Add shimmer effect
          setTimeout(() => {
            playTone(1318.51, 0.3, 'sine', 0.1); // E6
            playTone(1567.98, 0.3, 'sine', 0.08); // G6
          }, 550);
          break;
          
        case 'click':
          // Simple click
          playTone(800, 0.05, 'square', 0.1);
          break;
          
        case 'success':
          // Two-note success chime
          playTone(880, 0.15, 'sine', 0.2); // A5
          setTimeout(() => playTone(1108.73, 0.25, 'sine', 0.2), 120); // C#6
          break;
      }
    } catch (e) {
      console.log('Audio playback failed');
    }
  }, [getAudioContext, playTone]);

  return { playSound };
}
