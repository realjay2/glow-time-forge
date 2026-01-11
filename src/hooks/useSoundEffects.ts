import { useCallback, useRef, useMemo } from 'react';

type SoundType = 'taskComplete' | 'timeExtension' | 'click' | 'success';

// Singleton audio context to prevent recreation
let globalAudioContext: AudioContext | null = null;

const getGlobalAudioContext = () => {
  if (!globalAudioContext && typeof window !== 'undefined') {
    try {
      globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return globalAudioContext;
};

export function useSoundEffects() {
  const lastPlayedRef = useRef<number>(0);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) => {
    try {
      const ctx = getGlobalAudioContext();
      if (!ctx) return;
      
      // Resume context if suspended (mobile browsers require user interaction)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
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
    } catch {
      // Silently fail - audio not critical
    }
  }, []);

  const playSound = useCallback((sound: SoundType) => {
    // Debounce rapid calls
    const now = Date.now();
    if (now - lastPlayedRef.current < 100) return;
    lastPlayedRef.current = now;

    try {
      switch (sound) {
        case 'taskComplete':
          playTone(523.25, 0.15, 'sine', 0.2);
          setTimeout(() => playTone(659.25, 0.15, 'sine', 0.2), 100);
          setTimeout(() => playTone(783.99, 0.2, 'sine', 0.25), 200);
          break;
          
        case 'timeExtension':
          playTone(523.25, 0.2, 'sine', 0.15);
          setTimeout(() => playTone(659.25, 0.2, 'sine', 0.15), 150);
          setTimeout(() => playTone(783.99, 0.2, 'sine', 0.15), 300);
          setTimeout(() => playTone(1046.50, 0.4, 'sine', 0.2), 450);
          setTimeout(() => {
            playTone(1318.51, 0.3, 'sine', 0.1);
            playTone(1567.98, 0.3, 'sine', 0.08);
          }, 550);
          break;
          
        case 'click':
          playTone(800, 0.05, 'square', 0.1);
          break;
          
        case 'success':
          playTone(880, 0.15, 'sine', 0.2);
          setTimeout(() => playTone(1108.73, 0.25, 'sine', 0.2), 120);
          break;
      }
    } catch {
      // Silently fail
    }
  }, [playTone]);

  return useMemo(() => ({ playSound }), [playSound]);
}
