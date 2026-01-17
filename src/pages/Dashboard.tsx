import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiscordAuth } from '@/hooks/useDiscordAuth';
import { useGitHub } from '@/hooks/useGitHub';
import { useUserProgress } from '@/hooks/useUserProgress';
import { TaskCard } from '@/components/TaskCard';
import { UserCard } from '@/components/UserCard';
import { ProgressBar } from '@/components/ProgressBar';
import { CooldownTimer } from '@/components/CooldownTimer';
import { PremiumTimer } from '@/components/PremiumTimer';
import { TimeExtensionNotification } from '@/components/TimeExtensionNotification';
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
    description: 'Learn how to get the most out of Core',
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
  const [timeExtension, setTimeExtension] = useState<{
    oldExpiry: string;
    newExpiry: string;
    hoursAdded: number;
  } | null>(null);
  
  const hasLoadedRef = useRef(false);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (!user && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      navigate('/', { replace: true });
      return;
    }

    if (!user || hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadKeyData = async () => {
      setIsLoadingKey(true);
      const key = await findUserKey(user.id, user.username);
      setKeyData(key);
      setIsLoadingKey(false);
      
      if (key) {
        toast({
          title: "Welcome back!",
          description: "Your key has been loaded.",
        });
      }
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

  // Memoize derived values
  const completedCount = useMemo(() => tasks.filter(t => t.completed).length, [tasks]);
  const allTasksComplete = completedCount === tasks.length;
  const isPremium = keyData?.Note?.toLowerCase() === 'premium';

  const allTasksCompleteRef = useRef(false);
  
  useEffect(() => {
    if (allTasksComplete && !isOnCooldown && user && !allTasksCompleteRef.current) {
      allTasksCompleteRef.current = true;
      handleAllTasksComplete();
    } else if (!allTasksComplete) {
      allTasksCompleteRef.current = false;
    }
  }, [allTasksComplete, isOnCooldown, user]);

  const handleAllTasksComplete = async () => {
    if (!user || !keyData) return;

    const oldExpiry = keyData.expiresAt;
    const success = await updateKeyExpiration(user.id, 1);
    
    if (success) {
      const updatedKey = await findUserKey(user.id);
      if (updatedKey) {
        setKeyData(updatedKey);
        setTimeExtension({
          oldExpiry,
          newExpiry: updatedKey.expiresAt,
          hoursAdded: 1
        });
      }
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
    <>
      {/* Time Extension Notification */}
      {timeExtension && (
        <TimeExtensionNotification
          oldExpiry={timeExtension.oldExpiry}
          newExpiry={timeExtension.newExpiry}
          hoursAdded={timeExtension.hoursAdded}
          onClose={() => setTimeExtension(null)}
        />
      )}

      <div className="min-h-screen bg-grid relative overflow-hidden">
        {/* Depth vignette overlay */}
        <div className="depth-vignette" />
        
        {/* Hero glow */}
        <div className="hero-glow" />
      
        {/* Background depth layers */}
        <div className="fixed inset-0 pointer-events-none will-change-transform">
          {/* Far blur layer - bokeh orbs */}
          <div className="bokeh-orb w-[600px] h-[600px] -top-40 -left-20 depth-blur-far" style={{ animationDelay: '0s' }} />
          <div className="bokeh-orb w-[400px] h-[400px] top-1/3 -right-20 depth-blur-far hidden md:block" style={{ animationDelay: '2s' }} />
          <div className="bokeh-orb w-[300px] h-[300px] bottom-20 left-1/4 depth-blur-far" style={{ animationDelay: '4s' }} />
          
          {/* Mid blur layer */}
          <div className="floating-orb w-[350px] h-[350px] top-20 left-1/3 bg-white/5 depth-blur-mid" style={{ animationDelay: '1s' }} />
          <div className="floating-orb w-[250px] h-[250px] bottom-40 right-1/3 bg-white/5 depth-blur-mid hidden md:block" style={{ animationDelay: '3s' }} />
          
          {/* Near layer - subtle particles */}
          <div className="floating-orb w-[100px] h-[100px] top-40 right-20 bg-white/8 depth-blur-near" style={{ animationDelay: '0.5s' }} />
          <div className="floating-orb w-[80px] h-[80px] bottom-60 left-20 bg-white/6 depth-blur-near hidden md:block" style={{ animationDelay: '2.5s' }} />
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

          {/* Right Column - Tasks or Premium Timer */}
          <div className="lg:col-span-2 space-y-6">
            {isPremium ? (
              /* Premium Timer View */
              <div className="opacity-0 animate-slide-in-right">
                <PremiumTimer expiresAt={keyData.expiresAt} />
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

export default Dashboard;