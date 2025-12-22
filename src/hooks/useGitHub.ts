import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { KeyData } from '@/types';

export function useGitHub() {
  const [isUpdating, setIsUpdating] = useState(false);

  const findUserKey = async (discordId: string): Promise<KeyData | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-user-key', {
        body: { discordId }
      });

      if (error) {
        console.error('Error fetching user key:', error);
        return null;
      }

      if (!data.success || !data.key) {
        return null;
      }

      return data.key as KeyData;
    } catch (error) {
      console.error('Error in findUserKey:', error);
      return null;
    }
  };

  const updateKeyExpiration = async (discordId: string, hoursToAdd: number): Promise<boolean> => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-key-expiration', {
        body: { discordId, hoursToAdd }
      });

      if (error) {
        console.error('Error updating key expiration:', error);
        return false;
      }

      if (!data.success) {
        console.error('Update failed:', data.error);
        return false;
      }

      console.log('Key expiration updated:', data.message);
      return true;
    } catch (error) {
      console.error('Error in updateKeyExpiration:', error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    findUserKey,
    updateKeyExpiration,
    isUpdating
  };
}
