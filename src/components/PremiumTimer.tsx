import { useState, useEffect } from 'react';
import { Crown, Clock } from 'lucide-react';

interface PremiumTimerProps {
  expiresAt: string;
}

export function PremiumTimer({ expiresAt }: PremiumTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-14 h-16 sm:w-16 sm:h-20 md:w-24 md:h-28 glass-card glow-border flex items-center justify-center overflow-hidden">
          <span className="font-display text-2xl sm:text-3xl md:text-5xl font-black text-gradient animate-pulse">
            {value.toString().padStart(2, '0')}
          </span>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
        </div>
        {/* Animated ring */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary via-glow-secondary to-primary opacity-20 blur-sm animate-spin-slow" style={{ animationDuration: '8s' }} />
      </div>
      <span className="text-muted-foreground text-[10px] sm:text-xs md:text-sm font-medium mt-2 sm:mt-3 uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className="glass-card glow-border-intense p-8 md:p-12">
      {/* Header */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <Crown className="w-6 h-6 text-white" />
        </div>
        <div className="text-center">
          <h2 className="font-display text-2xl md:text-3xl font-black text-gradient">PREMIUM ACTIVE</h2>
          <p className="text-muted-foreground text-sm">Time remaining on your subscription</p>
        </div>
      </div>

      {/* Timer Grid */}
      <div className="flex justify-center gap-1 sm:gap-2 md:gap-4 mb-8">
        <TimeBlock value={timeLeft.days} label="Days" />
        <div className="flex items-center text-lg sm:text-2xl md:text-3xl text-muted-foreground font-bold self-start mt-5 sm:mt-6 md:mt-8">:</div>
        <TimeBlock value={timeLeft.hours} label="Hours" />
        <div className="flex items-center text-lg sm:text-2xl md:text-3xl text-muted-foreground font-bold self-start mt-5 sm:mt-6 md:mt-8">:</div>
        <TimeBlock value={timeLeft.minutes} label="Mins" />
        <div className="flex items-center text-lg sm:text-2xl md:text-3xl text-muted-foreground font-bold self-start mt-5 sm:mt-6 md:mt-8">:</div>
        <TimeBlock value={timeLeft.seconds} label="Secs" />
      </div>

      {/* Status indicator */}
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span className="text-sm">Your premium access is active and running</span>
        <span className="relative flex h-2 w-2 ml-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
        </span>
      </div>
    </div>
  );
}
