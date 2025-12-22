import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

interface ProgressBarProps {
  completed: number;
  total: number;
}

export function ProgressBar({ completed, total }: ProgressBarProps) {
  const percentage = (completed / total) * 100;
  const isComplete = completed === total;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Zap className={cn(
            "w-4 h-4 transition-colors",
            isComplete ? "text-success" : "text-primary"
          )} />
          <span className="text-sm font-medium text-foreground">Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-display text-lg font-bold",
            isComplete ? "text-success" : "text-gradient"
          )}>
            {completed}/{total}
          </span>
          <span className="text-muted-foreground text-sm">Tasks</span>
        </div>
      </div>
      
      <div className="h-4 bg-muted/50 rounded-full overflow-hidden border border-border/50">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden",
            isComplete 
              ? "bg-gradient-to-r from-success to-glow-secondary" 
              : "bg-gradient-to-r from-primary via-glow-secondary to-glow-accent"
          )}
          style={{ width: `${percentage}%` }}
        >
          {/* Animated shine */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          
          {/* Glow effect */}
          {isComplete && (
            <div className="absolute inset-0 animate-pulse-glow" />
          )}
        </div>
      </div>
      
      {/* Step indicators */}
      <div className="flex justify-between mt-2 px-1">
        {Array.from({ length: total }).map((_, i) => (
          <div 
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              i < completed 
                ? "bg-primary shadow-[0_0_8px_hsl(210_100%_55%/0.6)]" 
                : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
}