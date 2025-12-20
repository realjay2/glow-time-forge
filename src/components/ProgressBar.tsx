import { cn } from '@/lib/utils';

interface ProgressBarProps {
  completed: number;
  total: number;
}

export function ProgressBar({ completed, total }: ProgressBarProps) {
  const percentage = (completed / total) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground">Progress</span>
        <span className="text-sm font-medium text-primary">
          {completed}/{total} Tasks
        </span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            "bg-gradient-to-r from-primary to-glow-secondary",
            percentage === 100 && "animate-pulse-glow"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
