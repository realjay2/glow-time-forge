import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { KeyData } from '@/types';

export function useGitHub() {
  const [isUpdating, setIsUpdating] = useState(false);

  const findUserKey = async (discordId: string, username?: string): Promise<KeyData | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-user-key', {
        body: { discordId }
      });

      if (error) {
        console.error('Error fetching user key:', error);
        return null;
      }

      if (!data.success || !data.key) {
        // Key not found, create a new one
        console.log('No key found, creating new key for:', discordId);
        return await createUserKey(discordId, username);
      }

      return data.key as KeyData;
    } catch (error) {
      console.error('Error in findUserKey:', error);
      return null;
    }
  };

  const createUserKey = async (discordId: string, username?: string): Promise<KeyData | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('create-user-key', {
        body: { discordId, username }
      });

      if (error) {
        console.error('Error creating user key:', error);
        return null;
      }

      if (!data.success || !data.key) {
        console.error('Failed to create key:', data.error);
        return null;
      }

      console.log('Key created successfully:', data.created ? 'new' : 'existing');
      return data.key as KeyData;
    } catch (error) {
      console.error('Error in createUserKey:', error);
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
    createUserKey,
    updateKeyExpiration,
    isUpdating
  };
}
