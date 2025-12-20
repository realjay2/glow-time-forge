import { useState, useCallback } from 'react';
import { KeyData } from '@/types';

const OWNER = "realjay2";
const REPO = "QuantV-Holder";
const FILE_PATH = "Keys.json";
const BRANCH = "main";
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

export function useGitHub() {
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchKeys = useCallback(async (): Promise<KeyData[]> => {
    if (!GITHUB_TOKEN) {
      throw new Error('GitHub token not configured. Set VITE_GITHUB_TOKEN in .env');
    }

    const response = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch keys');
    }

    const data = await response.json();
    const content = atob(data.content);
    return JSON.parse(content);
  }, []);

  const findUserKey = useCallback(async (discordId: string): Promise<KeyData | null> => {
    try {
      const keys = await fetchKeys();
      return keys.find((key) => key.discordID === discordId) || null;
    } catch (error) {
      console.error('Error finding user key:', error);
      return null;
    }
  }, [fetchKeys]);

  const updateKeyExpiration = useCallback(async (discordId: string, hoursToAdd: number): Promise<boolean> => {
    if (!GITHUB_TOKEN) {
      throw new Error('GitHub token not configured. Set VITE_GITHUB_TOKEN in .env');
    }

    setIsUpdating(true);

    try {
      // First, get the current file content and SHA
      const fileResponse = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
        {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (!fileResponse.ok) {
        throw new Error('Failed to fetch current keys');
      }

      const fileData = await fileResponse.json();
      const currentContent = atob(fileData.content);
      const keys: KeyData[] = JSON.parse(currentContent);

      // Find and update the user's key
      const keyIndex = keys.findIndex((key) => key.discordID === discordId);
      if (keyIndex === -1) {
        throw new Error('User key not found');
      }

      const currentExpiry = new Date(keys[keyIndex].expiresAt);
      const newExpiry = new Date(currentExpiry.getTime() + hoursToAdd * 60 * 60 * 1000);
      keys[keyIndex].expiresAt = newExpiry.toISOString();

      // Update the file on GitHub
      const newContent = btoa(JSON.stringify(keys, null, 2));
      
      const updateResponse = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Update key expiration for ${discordId}`,
            content: newContent,
            sha: fileData.sha,
            branch: BRANCH,
          }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error('Failed to update key');
      }

      return true;
    } catch (error) {
      console.error('Error updating key expiration:', error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    fetchKeys,
    findUserKey,
    updateKeyExpiration,
    isUpdating,
  };
}
