import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiscordAuth } from '@/hooks/useDiscordAuth';
import { useGitHub } from '@/hooks/useGitHub';
import { useUserProgress } from '@/hooks/useUserProgress';
import { TaskCard } from '@/components/TaskCard';
import { UserCard } from '@/components/UserCard';
import { ProgressBar } from '@/components/ProgressBar';
import { CooldownTimer } from '@/components/CooldownTimer';
import { Task, KeyData } from '@/types';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, Sparkles } from 'lucide-react';

const TASKS: Task[] = [
  {
    id: 'opera',
    title: 'Download Opera Browser',
    description: 'Visit the Opera download page and install the browser',
    icon: '🌐',
    completed: false,
    action: 'https://www.opera.com/download',
    verificationTime: 10,
  },
  {
    id: 'extension',
    title: 'Install Extension',
    description: 'Add our browser extension to enhance your experience',
    icon: '🧩',
    completed: false,
    action: 'https://chrome.google.com/webstore',
    verificationTime: 8,
  },
  {
    id: 'video',
    title: 'Watch Video',
    description: 'Watch our short introduction video',
    icon: '▶️',
    completed: false,
    action: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    verificationTime: 15,
  },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useDiscordAuth();
  const { findUserKey, updateKeyExpiration, isUpdating } = useGitHub();
  const { progress, cooldownEnd, isOnCooldown, completeTask, markAllTasksComplete, resetCooldown } = useUserProgress(user?.id || null);
  
  const [keyData, setKeyData] = useState<KeyData | null>(null);
  const [isLoadingKey, setIsLoadingKey] = useState(true);
  const [tasks, setTasks] = useState<Task[]>(TASKS);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const loadKeyData = async () => {
      setIsLoadingKey(true);
      const key = await findUserKey(user.id);
      setKeyData(key);
      setIsLoadingKey(false);
    };

    loadKeyData();
  }, [user, navigate, findUserKey]);

  useEffect(() => {
    if (!progress) return;
    
    setTasks(TASKS.map(task => ({
      ...task,
      completed: progress.tasksCompletedThisSession.includes(task.id),
    })));
  }, [progress]);

  const completedCount = tasks.filter(t => t.completed).length;
  const allTasksComplete = completedCount === tasks.length;

  useEffect(() => {
    if (allTasksComplete && !isOnCooldown && user) {
      handleAllTasksComplete();
    }
  }, [allTasksComplete, isOnCooldown, user]);

  const handleAllTasksComplete = async () => {
    if (!user) return;

    const success = await updateKeyExpiration(user.id, 1);
    
    if (success) {
      toast({
        title: "🎉 Time Added!",
        description: "1 hour has been added to your key!",
      });
      
      // Refresh key data
      const updatedKey = await findUserKey(user.id);
      setKeyData(updatedKey);
      
      // Start cooldown
      markAllTasksComplete();
    } else {
      toast({
        title: "Error",
        description: "Failed to update your key. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTaskComplete = useCallback((taskId: string) => {
    completeTask(taskId);
    toast({
      title: "Task Completed!",
      description: "Great job! Keep going to earn your time bonus.",
    });
  }, [completeTask]);

  const handleCooldownComplete = useCallback(() => {
    resetCooldown();
    toast({
      title: "Cooldown Complete!",
      description: "You can now complete tasks again.",
    });
  }, [resetCooldown]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-grid relative overflow-hidden">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-glow-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gradient mb-4">
            Task Center
          </h1>
          <p className="text-muted-foreground text-lg">
            Complete all tasks to earn 1 hour of premium time
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* User Info & Key Status */}
          <div className="lg:col-span-1 space-y-6">
            <UserCard user={user} keyData={keyData} onLogout={handleLogout} />
            
            {isLoadingKey ? (
              <div className="glass-card p-6 animate-shimmer" />
            ) : !keyData ? (
              <div className="glass-card p-6 text-center">
                <p className="text-muted-foreground">No active key found</p>
              </div>
            ) : null}
          </div>

          {/* Tasks Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress */}
            <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <ProgressBar completed={completedCount} total={tasks.length} />
            </div>

            {/* Cooldown Timer */}
            {isOnCooldown && cooldownEnd && (
              <CooldownTimer endTime={cooldownEnd} onComplete={handleCooldownComplete} />
            )}

            {/* Success Message */}
            {allTasksComplete && isUpdating && (
              <div className="glass-card glow-border p-6 text-center">
                <Sparkles className="w-8 h-8 text-primary mx-auto mb-2 animate-pulse" />
                <p className="text-foreground font-medium">Adding time to your key...</p>
              </div>
            )}

            {allTasksComplete && !isUpdating && isOnCooldown && (
              <div className="glass-card glow-border p-6 text-center">
                <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-foreground font-medium">All tasks completed!</p>
                <p className="text-muted-foreground text-sm">1 hour has been added to your key</p>
              </div>
            )}

            {/* Task Cards */}
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleTaskComplete}
                  disabled={isOnCooldown || task.completed}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
