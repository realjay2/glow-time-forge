import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

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
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (timeLeft === 0) return null;

  return (
    <div className="glass-card glow-border p-6 text-center animate-pulse-glow">
      <div className="flex items-center justify-center gap-3 mb-2">
        <Clock className="w-6 h-6 text-primary animate-pulse" />
        <span className="text-muted-foreground font-medium">Cooldown Active</span>
      </div>
      <div className="font-display text-4xl font-bold text-gradient tracking-wider">
        {formatTime(timeLeft)}
      </div>
      <p className="text-muted-foreground text-sm mt-2">
        Complete more tasks after cooldown expires
      </p>
    </div>
  );
}
