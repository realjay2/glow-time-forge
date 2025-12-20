import { useState, useEffect, useCallback } from 'react';
import { DiscordUser } from '@/types';

const DISCORD_CLIENT_ID = ''; // Will be set via environment
const REDIRECT_URI = window.location.origin + '/callback';
const SCOPES = ['identify', 'email'];

export function useDiscordAuth() {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('discord_user');
    const storedToken = localStorage.getItem('discord_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setAccessToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(() => {
    const clientId = DISCORD_CLIENT_ID || localStorage.getItem('discord_client_id');
    if (!clientId) {
      console.error('Discord Client ID not configured');
      return;
    }
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: REDIRECT_URI,
      response_type: 'token',
      scope: SCOPES.join(' '),
    });
    
    window.location.href = `https://discord.com/api/oauth2/authorize?${params}`;
  }, []);

  const handleCallback = useCallback(async (hash: string) => {
    const params = new URLSearchParams(hash.substring(1));
    const token = params.get('access_token');
    
    if (!token) {
      throw new Error('No access token found');
    }

    setAccessToken(token);
    localStorage.setItem('discord_token', token);

    // Fetch user info
    const response = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userData: DiscordUser = await response.json();
    setUser(userData);
    localStorage.setItem('discord_user', JSON.stringify(userData));
    
    return userData;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('discord_user');
    localStorage.removeItem('discord_token');
    localStorage.removeItem('user_progress');
  }, []);

  return {
    user,
    accessToken,
    isLoading,
    login,
    logout,
    handleCallback,
  };
}
