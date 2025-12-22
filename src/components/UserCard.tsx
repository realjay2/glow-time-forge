import { DiscordUser, KeyData } from '@/types';
import { LogOut, Key, Clock, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UserCardProps {
  user: DiscordUser;
  keyData: KeyData | null;
  onLogout: () => void;
  isLoading?: boolean;
}

export function UserCard({ user, keyData, onLogout, isLoading }: UserCardProps) {
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
    
    if (diff <= 0) return { text: 'Expired', urgent: true };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return { text: `${days}d ${hours}h remaining`, urgent: false };
    if (hours > 0) return { text: `${hours}h ${minutes}m remaining`, urgent: hours < 6 };
    return { text: `${minutes}m remaining`, urgent: true };
  };

  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;

  const timeInfo = keyData ? getTimeRemaining(keyData.expiresAt) : null;

  return (
    <div className="glass-card overflow-hidden">
      {/* Header with gradient */}
      <div className="h-20 bg-gradient-to-br from-primary/20 via-glow-secondary/10 to-transparent relative">
        <div className="absolute inset-0 bg-dots opacity-30" />
      </div>
      
      {/* Avatar */}
      <div className="px-6 -mt-10 relative">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-glow-secondary p-0.5 shadow-glow">
          <img
            src={avatarUrl}
            alt={user.username}
            className="w-full h-full rounded-2xl object-cover bg-card"
          />
        </div>
      </div>
      
      {/* User Info */}
      <div className="p-6 pt-4">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-xl text-foreground">
              {user.global_name || user.username}
            </h2>
            <p className="text-muted-foreground text-sm">@{user.username}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onLogout} 
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-1"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-16 rounded-xl bg-secondary animate-shimmer" />
            <div className="h-16 rounded-xl bg-secondary animate-shimmer" style={{ animationDelay: '0.1s' }} />
          </div>
        ) : keyData ? (
          <div className="space-y-3">
            {/* License Key */}
            <div className="stat-card group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                <Key className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-0.5">License Key</p>
                <p className="font-mono text-sm text-foreground truncate">{keyData.key}</p>
              </div>
            </div>
            
            {/* Expiration */}
            <div className={cn(
              "stat-card group",
              timeInfo?.urgent && "border-destructive/30"
            )}>
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                timeInfo?.urgent 
                  ? "bg-gradient-to-br from-destructive/20 to-destructive/5" 
                  : "bg-gradient-to-br from-glow-secondary/20 to-glow-secondary/5"
              )}>
                <Clock className={cn(
                  "w-5 h-5",
                  timeInfo?.urgent ? "text-destructive" : "text-glow-secondary"
                )} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Expires</p>
                <p className="text-sm text-foreground">{formatDate(keyData.expiresAt)}</p>
                <p className={cn(
                  "text-xs font-semibold mt-1",
                  timeInfo?.urgent ? "text-destructive" : "text-glow-secondary"
                )}>
                  {timeInfo?.text}
                </p>
              </div>
            </div>

            {/* Type Badge */}
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                <Sparkles className="w-3 h-3" />
                {keyData.Note || 'Freemium'}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No active key found</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Contact support for assistance</p>
          </div>
        )}
      </div>
    </div>
  );
}