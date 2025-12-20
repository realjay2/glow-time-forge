import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ExternalLink, Loader2 } from 'lucide-react';
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
    
    // Open the task URL
    window.open(task.action, '_blank');
    setHasStarted(true);
  };

  const handleVerify = () => {
    if (!hasStarted || task.completed || disabled) return;
    setIsVerifying(true);
    setCountdown(task.verificationTime);
  };

  const getTaskIcon = () => {
    switch (task.id) {
      case 'opera':
        return '🌐';
      case 'extension':
        return '🧩';
      case 'video':
        return '▶️';
      default:
        return '📋';
    }
  };

  return (
    <div
      className={cn(
        "glass-card p-6 transition-all duration-500 opacity-0 animate-fade-in-up",
        task.completed && "border-primary/50 bg-primary/5",
        !disabled && !task.completed && "hover:border-primary/30 hover:shadow-glow"
      )}
      style={{ animationDelay: `${index * 0.15}s`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all duration-300",
          task.completed 
            ? "bg-primary/20 shadow-glow" 
            : "bg-secondary"
        )}>
          {task.completed ? (
            <Check className="w-7 h-7 text-primary" />
          ) : (
            <span>{getTaskIcon()}</span>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className={cn(
            "font-display text-lg font-semibold mb-1 transition-colors",
            task.completed ? "text-primary" : "text-foreground"
          )}>
            {task.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {task.description}
          </p>
          
          {task.completed ? (
            <div className="flex items-center gap-2 text-primary text-sm font-medium">
              <Check className="w-4 h-4" />
              Completed
            </div>
          ) : isVerifying ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-muted-foreground text-sm">
                Verifying... {countdown}s
              </span>
            </div>
          ) : !hasStarted ? (
            <Button 
              variant="task" 
              onClick={handleStartTask}
              disabled={disabled}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Start Task
            </Button>
          ) : (
            <Button 
              variant="glow" 
              onClick={handleVerify}
              disabled={disabled}
              className="gap-2"
            >
              Verify Completion
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
