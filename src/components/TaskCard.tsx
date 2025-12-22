import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ExternalLink, Loader2, ArrowRight } from 'lucide-react';
import { Task } from '@/types';
import { cn } from '@/lib/utils';

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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVerifying && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isVerifying && countdown === 0) {
      setIsVerifying(false);
      onComplete(task.id);
    }
    return () => clearTimeout(timer);
  }, [isVerifying, countdown, task.id, onComplete]);

  const handleStartTask = () => {
    if (task.completed || disabled) return;
    window.open(task.action, '_blank');
    setHasStarted(true);
  };

  const handleVerify = () => {
    if (!hasStarted || task.completed || disabled) return;
    setIsVerifying(true);
    setCountdown(task.verificationTime);
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
          <div className="mt-4">
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
                    style={{ width: `${((task.verificationTime - countdown) / task.verificationTime) * 100}%` }}
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
                className="gap-2 bg-gradient-to-r from-primary to-glow-secondary hover:opacity-90 text-primary-foreground font-semibold shadow-button"
              >
                <ExternalLink className="w-4 h-4" />
                Start Task
              </Button>
            ) : (
              <Button 
                onClick={handleVerify}
                disabled={disabled}
                className="gap-2 bg-gradient-to-r from-glow-secondary to-glow-accent hover:opacity-90 text-primary-foreground font-semibold shadow-button animate-pulse-glow"
              >
                <ArrowRight className="w-4 h-4" />
                Verify Completion
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}