import { useState, useEffect, useCallback, useRef } from 'react';
import { DiscordUser } from '@/types';

const DISCORD_CLIENT_ID = '1442356676689789080';
const REDIRECT_URI = typeof window !== 'undefined' ? window.location.origin + '/callback' : '';
const SCOPES = ['identify', 'email'];

export function useDiscordAuth() {
  const [user, setUser] = useState<DiscordUser | null>(() => {
    // Initialize from localStorage synchronously to prevent flash
    if (typeof window === 'undefined') return null;
    const storedUser = localStorage.getItem('discord_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('discord_token');
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    // Already loaded from initial state, just mark as not loading
    setIsLoading(false);
  }, []);

  const login = useCallback(() => {
    if (!DISCORD_CLIENT_ID) {
      console.error('Discord Client ID not configured. Set VITE_DISCORD_CLIENT_ID in .env');
      return;
    }
    
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
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
