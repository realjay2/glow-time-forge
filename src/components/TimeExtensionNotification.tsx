import { useState, useEffect } from 'react';
import { Clock, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeExtensionNotificationProps {
  oldExpiry: string;
  newExpiry: string;
  hoursAdded: number;
  onClose: () => void;
}

export function TimeExtensionNotification({ 
  oldExpiry, 
  newExpiry, 
  hoursAdded,
  onClose 
}: TimeExtensionNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-dismiss after 5 seconds
    const dismissTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 500);
    }, 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [onClose]);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity duration-500",
          isVisible && !isExiting ? "opacity-100" : "opacity-0"
        )} 
      />
      
      {/* Notification Card */}
      <div 
        className={cn(
          "relative glass-card glow-border-intense p-8 max-w-md mx-4 text-center transition-all duration-500 pointer-events-auto",
          isVisible && !isExiting 
            ? "opacity-100 scale-100 translate-y-0" 
            : "opacity-0 scale-90 translate-y-8"
        )}
      >
        {/* Sparkle effects */}
        <div className="absolute -top-3 -left-3 w-6 h-6 text-primary animate-pulse">
          <Sparkles className="w-full h-full" />
        </div>
        <div className="absolute -top-3 -right-3 w-6 h-6 text-glow-secondary animate-pulse" style={{ animationDelay: '0.2s' }}>
          <Sparkles className="w-full h-full" />
        </div>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 text-glow-accent animate-pulse" style={{ animationDelay: '0.4s' }}>
          <Sparkles className="w-full h-full" />
        </div>

        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary via-glow-secondary to-glow-accent p-1 mx-auto mb-6 animate-pulse">
          <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
            <Clock className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Title */}
        <h2 className="font-display text-3xl font-black text-gradient mb-2">
          +{hoursAdded} Hour{hoursAdded > 1 ? 's' : ''} Added!
        </h2>
        <p className="text-muted-foreground mb-6">Your premium time has been extended</p>

        {/* Time comparison */}
        <div className="flex items-center justify-center gap-3 bg-secondary/30 rounded-xl p-4">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Before</p>
            <p className="font-mono text-sm text-foreground/70 line-through decoration-destructive">
              {formatDateTime(oldExpiry)}
            </p>
          </div>
          
          <ArrowRight className="w-5 h-5 text-primary shrink-0" />
          
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">After</p>
            <p className="font-mono text-sm text-primary font-bold">
              {formatDateTime(newExpiry)}
            </p>
          </div>
        </div>

        {/* Progress bar animation */}
        <div className="mt-6 h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-glow-secondary rounded-full transition-all duration-[5000ms] ease-linear"
            style={{ width: isVisible && !isExiting ? '100%' : '0%' }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">This notification will close automatically</p>
      </div>
    </div>
  );
}
