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
import { CheckCircle, Sparkles, Trophy, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TASKS: Task[] = [
  {
    id: 'opera',
    title: 'Download Opera GX',
    description: 'Get the gaming browser with built-in ad blocker & VPN',
    icon: '🌐',
    completed: false,
    action: 'https://www.opera.com/gx',
    verificationTime: 10,
  },
  {
    id: 'extension',
    title: 'Install Extension',
    description: 'Add our powerful browser extension to Chrome',
    icon: '🧩',
    completed: false,
    action: 'https://chrome.google.com/webstore',
    verificationTime: 8,
  },
  {
    id: 'video',
    title: 'Watch Tutorial',
    description: 'Learn how to get the most out of QuantV',
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
        title: "🎉 +1 Hour Added!",
        description: "Premium time has been added to your key!",
      });
      
      const updatedKey = await findUserKey(user.id);
      setKeyData(updatedKey);
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
      title: "✅ Task Completed!",
      description: "Great job! Keep going to earn your time bonus.",
    });
  }, [completeTask]);

  const handleCooldownComplete = useCallback(() => {
    resetCooldown();
    toast({
      title: "🔓 Cooldown Complete!",
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
      {/* Hero glow */}
      <div className="hero-glow" />
      
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="floating-orb w-[500px] h-[500px] top-0 left-1/4 bg-primary/10" />
        <div className="floating-orb w-[400px] h-[400px] bottom-0 right-1/4 bg-glow-secondary/10" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 opacity-0 animate-fade-in-down">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="text-center flex-1">
            <h1 className="font-display text-3xl md:text-4xl font-black">
              <span className="text-gradient">TASK CENTER</span>
            </h1>
          </div>
          
          <div className="w-20" /> {/* Spacer for alignment */}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - User Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="opacity-0 animate-slide-in-left">
              <UserCard user={user} keyData={keyData} onLogout={handleLogout} isLoading={isLoadingKey} />
            </div>
          </div>

          {/* Right Column - Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Card */}
            <div className="glass-card p-6 opacity-0 animate-slide-in-right">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-glow-secondary flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-foreground">Your Progress</h2>
                  <p className="text-muted-foreground text-sm">Complete all tasks to earn +1 hour</p>
                </div>
              </div>
              <ProgressBar completed={completedCount} total={tasks.length} />
            </div>

            {/* Cooldown Timer */}
            {isOnCooldown && cooldownEnd && (
              <div className="opacity-0 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <CooldownTimer endTime={cooldownEnd} onComplete={handleCooldownComplete} />
              </div>
            )}

            {/* Success States */}
            {allTasksComplete && isUpdating && (
              <div className="glass-card glow-border-intense p-8 text-center opacity-0 animate-scale-in">
                <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
                <p className="font-display text-xl font-bold text-foreground mb-2">Processing Reward...</p>
                <p className="text-muted-foreground">Adding time to your key</p>
              </div>
            )}

            {allTasksComplete && !isUpdating && isOnCooldown && (
              <div className="glass-card glow-border-intense p-8 text-center opacity-0 animate-scale-in">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-success to-glow-secondary flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-primary-foreground" />
                </div>
                <p className="font-display text-2xl font-bold text-gradient mb-2">+1 Hour Added!</p>
                <p className="text-muted-foreground">Your premium time has been extended</p>
              </div>
            )}

            {/* Task Cards */}
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div 
                  key={task.id}
                  className="opacity-0 animate-slide-in-right"
                  style={{ animationDelay: `${0.15 + index * 0.1}s` }}
                >
                  <TaskCard
                    task={task}
                    onComplete={handleTaskComplete}
                    disabled={isOnCooldown || task.completed}
                    index={index}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;