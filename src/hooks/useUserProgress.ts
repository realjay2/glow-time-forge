import { useState, useEffect, useCallback } from 'react';
import { UserProgress } from '@/types';

const COOLDOWN_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const STORAGE_KEY = 'user_progress';

export function useUserProgress(discordId: string | null) {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);
  const [isOnCooldown, setIsOnCooldown] = useState(false);

  useEffect(() => {
    if (!discordId) {
      setProgress(null);
      return;
    }

    // Load progress from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const allProgress: Record<string, UserProgress> = JSON.parse(stored);
      const userProgress = allProgress[discordId];
      
      if (userProgress) {
        setProgress(userProgress);
        
        // Check if cooldown is active
        if (userProgress.lastCompletionTime) {
          const cooldownEndTime = userProgress.lastCompletionTime + COOLDOWN_DURATION;
          if (Date.now() < cooldownEndTime) {
            setCooldownEnd(cooldownEndTime);
            setIsOnCooldown(true);
          } else {
            // Cooldown expired, reset session tasks
            const newProgress = {
              ...userProgress,
              tasksCompletedThisSession: [],
            };
            setProgress(newProgress);
            saveProgress(discordId, newProgress);
          }
        }
      } else {
        // Initialize new progress
        const newProgress: UserProgress = {
          discordId,
          completedTasks: [],
          lastCompletionTime: null,
          tasksCompletedThisSession: [],
        };
        setProgress(newProgress);
        saveProgress(discordId, newProgress);
      }
    } else {
      // Initialize new progress
      const newProgress: UserProgress = {
        discordId,
        completedTasks: [],
        lastCompletionTime: null,
        tasksCompletedThisSession: [],
      };
      setProgress(newProgress);
      saveProgress(discordId, newProgress);
    }
  }, [discordId]);

  const saveProgress = (id: string, newProgress: UserProgress) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allProgress: Record<string, UserProgress> = stored ? JSON.parse(stored) : {};
    allProgress[id] = newProgress;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
  };

  const completeTask = useCallback((taskId: string) => {
    if (!progress || !discordId) return;

    const newProgress = {
      ...progress,
      tasksCompletedThisSession: [...progress.tasksCompletedThisSession, taskId],
    };
    
    setProgress(newProgress);
    saveProgress(discordId, newProgress);
  }, [progress, discordId]);

  const markAllTasksComplete = useCallback(() => {
    if (!progress || !discordId) return;

    const completionTime = Date.now();
    const cooldownEndTime = completionTime + COOLDOWN_DURATION;
    
    const newProgress = {
      ...progress,
      completedTasks: [...progress.completedTasks, ...progress.tasksCompletedThisSession],
      lastCompletionTime: completionTime,
      tasksCompletedThisSession: [],
    };
    
    setProgress(newProgress);
    saveProgress(discordId, newProgress);
    setCooldownEnd(cooldownEndTime);
    setIsOnCooldown(true);
  }, [progress, discordId]);

  const resetCooldown = useCallback(() => {
    if (!progress || !discordId) return;
    
    const newProgress = {
      ...progress,
      tasksCompletedThisSession: [],
    };
    
    setProgress(newProgress);
    saveProgress(discordId, newProgress);
    setCooldownEnd(null);
    setIsOnCooldown(false);
  }, [progress, discordId]);

  return {
    progress,
    cooldownEnd,
    isOnCooldown,
    completeTask,
    markAllTasksComplete,
    resetCooldown,
  };
}
