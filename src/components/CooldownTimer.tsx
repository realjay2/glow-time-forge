import { useState, useEffect } from 'react';
import { Clock, Timer } from 'lucide-react';

interface CooldownTimerProps {
  endTime: number;
  onComplete: () => void;
}

export function CooldownTimer({ endTime, onComplete }: CooldownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        onComplete();
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [endTime, onComplete]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return { minutes, seconds };
  };

  if (timeLeft === 0) return null;

  const { minutes, seconds } = formatTime(timeLeft);
  const totalDuration = 30 * 60 * 1000; // 30 minutes in ms
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="glass-card glow-border p-8 text-center relative overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-glow-secondary/5" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-glow-secondary/20 flex items-center justify-center">
            <Timer className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div className="text-left">
            <p className="font-display font-bold text-lg text-foreground">Cooldown Active</p>
            <p className="text-muted-foreground text-sm">Complete more tasks when ready</p>
          </div>
        </div>
        
        {/* Large timer display */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="bg-muted/50 rounded-2xl p-4 min-w-[80px]">
            <div className="font-display text-4xl font-black text-gradient">
              {minutes.toString().padStart(2, '0')}
            </div>
            <div className="text-muted-foreground text-xs uppercase tracking-wider mt-1">Min</div>
          </div>
          <div className="font-display text-4xl font-bold text-muted-foreground animate-pulse">:</div>
          <div className="bg-muted/50 rounded-2xl p-4 min-w-[80px]">
            <div className="font-display text-4xl font-black text-gradient">
              {seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-muted-foreground text-xs uppercase tracking-wider mt-1">Sec</div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-glow-secondary rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}