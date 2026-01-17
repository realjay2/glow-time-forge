import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ExternalLink, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Task } from '@/types';
import { cn } from '@/lib/utils';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  disabled: boolean;
  index: number;
}

export function TaskCard({ task, onComplete, disabled, index }: TaskCardProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [activeTime, setActiveTime] = useState(0);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [taskWindowOpen, setTaskWindowOpen] = useState(false);
  const taskWindowRef = useRef<Window | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { playSound } = useSoundEffects();

  // Track window focus to pause/resume timer
  useEffect(() => {
    const handleVisibility = () => {
      setIsWindowFocused(!document.hidden);
    };

    const handleFocus = () => setIsWindowFocused(true);
    const handleBlur = () => setIsWindowFocused(false);

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Check if task window is still open
  useEffect(() => {
    if (taskWindowOpen && taskWindowRef.current) {
      checkIntervalRef.current = setInterval(() => {
        if (taskWindowRef.current?.closed) {
          setTaskWindowOpen(false);
          taskWindowRef.current = null;
        }
      }, 500);
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [taskWindowOpen]);

  // Track active time when task window is open (regardless of focus)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (hasStarted && taskWindowOpen && !task.completed && !isVerifying) {
      timer = setInterval(() => {
        setActiveTime(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [hasStarted, taskWindowOpen, task.completed, isVerifying]);

  // Verification countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVerifying && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isVerifying && countdown === 0) {
      setIsVerifying(false);
      playSound('taskComplete');
      onComplete(task.id);
    }
    return () => clearTimeout(timer);
  }, [isVerifying, countdown, task.id, onComplete]);

  const handleStartTask = () => {
    if (task.completed || disabled) return;
    taskWindowRef.current = window.open(task.action, '_blank');
    setTaskWindowOpen(true);
    setHasStarted(true);
    setActiveTime(0);
  };

  const canVerify = activeTime >= task.verificationTime;

  const handleVerify = () => {
    if (!hasStarted || task.completed || disabled) return;
    
    if (!canVerify) {
      // Show remaining time needed
      return;
    }
    
    setIsVerifying(true);
    setCountdown(3); // Short verification countdown
  };

  const getTaskEmoji = () => {
    switch (task.id) {
      case 'opera': return '🌐';
      case 'extension': return '🧩';
      case 'video': return '▶️';
      default: return '📋';
    }
  };

  const getTaskColor = () => {
    switch (task.id) {
      case 'opera': return 'from-red-500 to-orange-500';
      case 'extension': return 'from-glow-secondary to-primary';
      case 'video': return 'from-glow-accent to-pink-500';
      default: return 'from-primary to-glow-secondary';
    }
  };

  const remainingTime = Math.max(0, task.verificationTime - activeTime);

  return (
    <div
      className={cn(
        "glass-card p-6 transition-all duration-500 group",
        task.completed && "border-success/30 bg-success/5",
        !disabled && !task.completed && "hover-glow cursor-pointer"
      )}
    >
      <div className="card-shine" />
      
      <div className="flex items-start gap-5">
        {/* Icon */}
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all duration-500 shrink-0",
          task.completed 
            ? "bg-gradient-to-br from-success to-success/70 shadow-[0_0_30px_hsl(150_100%_45%/0.4)]" 
            : `bg-gradient-to-br ${getTaskColor()} opacity-90 group-hover:opacity-100`
        )}>
          {task.completed ? (
            <Check className="w-8 h-8 text-primary-foreground" />
          ) : (
            <span className="drop-shadow-lg">{getTaskEmoji()}</span>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className={cn(
                "font-display text-lg font-bold transition-colors mb-1",
                task.completed ? "text-success" : "text-foreground group-hover:text-gradient"
              )}>
                {task.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {task.description}
              </p>
            </div>
            
            {/* Step number */}
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
              task.completed 
                ? "bg-success/20 text-success" 
                : "bg-muted text-muted-foreground"
            )}>
              {index + 1}
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-4 space-y-3">
            {task.completed ? (
              <div className="flex items-center gap-2 text-success text-sm font-semibold">
                <Check className="w-4 h-4" />
                <span>Completed</span>
              </div>
            ) : isVerifying ? (
              <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-glow-secondary rounded-full transition-all duration-1000"
                    style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 text-primary text-sm font-medium shrink-0">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="font-mono">{countdown}s</span>
                </div>
              </div>
            ) : !hasStarted ? (
              <Button 
                onClick={handleStartTask}
                disabled={disabled}
                variant="outline"
                className="gap-2 w-full sm:w-auto px-8 py-2 h-9 border-white/20 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-medium text-sm transition-all duration-300"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ready to Start
              </Button>
            ) : (
              <div className="space-y-3">
                {/* Time tracking indicator */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    {taskWindowOpen ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-success animate-pulse" />
                        <span className="text-success font-medium">Tracking time...</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-destructive" />
                        <span className="text-destructive">Task window closed - reopen to continue</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress bar for time requirement */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Time spent on task</span>
                    <span className="font-mono">{activeTime}s / {task.verificationTime}s</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        canVerify 
                          ? "bg-gradient-to-r from-success to-glow-secondary" 
                          : "bg-gradient-to-r from-primary/60 to-glow-secondary/60"
                      )}
                      style={{ width: `${Math.min(100, (activeTime / task.verificationTime) * 100)}%` }}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleVerify}
                  disabled={disabled || !canVerify}
                  className={cn(
                    "gap-2 font-semibold shadow-button w-full sm:w-auto",
                    canVerify 
                      ? "bg-gradient-to-r from-success to-glow-secondary hover:opacity-90 text-primary-foreground animate-pulse-glow"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {canVerify ? (
                    <>
                      <Check className="w-4 h-4" />
                      Complete Task
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {remainingTime}s remaining
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}