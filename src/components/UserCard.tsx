import { DiscordUser, KeyData } from '@/types';
import { LogOut, Key, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserCardProps {
  user: DiscordUser;
  keyData: KeyData | null;
  onLogout: () => void;
}

export function UserCard({ user, keyData, onLogout }: UserCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <img
            src={avatarUrl}
            alt={user.username}
            className="w-14 h-14 rounded-full border-2 border-primary/50 shadow-glow"
          />
          <div>
            <h2 className="font-display font-semibold text-lg text-foreground">
              {user.global_name || user.username}
            </h2>
            <p className="text-muted-foreground text-sm">@{user.username}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onLogout} className="text-muted-foreground hover:text-destructive">
          <LogOut className="w-5 h-5" />
        </Button>
      </div>

      {keyData && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <Key className="w-5 h-5 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">License Key</p>
              <p className="font-mono text-sm text-foreground truncate">{keyData.key}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <Clock className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Expires</p>
              <p className="text-sm text-foreground">{formatDate(keyData.expiresAt)}</p>
              <p className="text-xs text-primary font-medium mt-1">
                {getTimeRemaining(keyData.expiresAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
