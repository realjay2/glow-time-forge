import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiscordAuth } from '@/hooks/useDiscordAuth';
import { Loader2 } from 'lucide-react';

export function Callback() {
  const navigate = useNavigate();
  const { handleCallback } = useDiscordAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const hash = window.location.hash;
        if (!hash) {
          throw new Error('No authentication data received');
        }

        await handleCallback(hash);
        navigate('/dashboard');
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    processCallback();
  }, [handleCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-grid relative overflow-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center">
        {error ? (
          <div className="glass-card p-8 animate-fade-in-up">
            <p className="text-destructive font-medium mb-2">Authentication Failed</p>
            <p className="text-muted-foreground text-sm">{error}</p>
            <p className="text-muted-foreground text-sm mt-4">Redirecting...</p>
          </div>
        ) : (
          <div className="glass-card p-8 animate-fade-in-up">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-foreground font-medium">Authenticating...</p>
            <p className="text-muted-foreground text-sm mt-2">Please wait</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Callback;
