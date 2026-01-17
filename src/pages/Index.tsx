import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiscordAuth } from '@/hooks/useDiscordAuth';
import { DiscordLoginButton } from '@/components/DiscordLoginButton';
import { Gift, Shield, Sparkles, Zap, Star, ExternalLink, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Index() {
  const navigate = useNavigate();
  const { user, isLoading, login } = useDiscordAuth();
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple navigations
    if (!isLoading && user && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const features = [
    {
      icon: <Gift className="w-7 h-7" />,
      title: 'Earn Free Time',
      description: 'Complete quick tasks to unlock premium hours',
      color: 'from-primary to-glow-secondary',
    },
    {
      icon: <Zap className="w-7 h-7" />,
      title: 'Instant Rewards',
      description: 'Time added immediately after completion',
      color: 'from-glow-secondary to-glow-accent',
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: 'Secure & Fast',
      description: 'Discord OAuth for instant authentication',
      color: 'from-glow-accent to-primary',
    },
  ];

  const stats = [
    { value: '1hr', label: 'Per Session' },
    { value: '30min', label: 'Cooldown' },
    { value: '3', label: 'Tasks' },
  ];

  // Memoize static content
  const backgroundOrbs = useMemo(() => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden will-change-transform">
      <div className="floating-orb w-[500px] h-[500px] -top-48 -left-48 bg-primary/20" />
      <div className="floating-orb w-[600px] h-[600px] -bottom-64 -right-64 bg-glow-secondary/15" style={{ animationDelay: '2s' }} />
      {/* Hide extra orb on mobile for performance */}
      <div className="floating-orb w-[400px] h-[400px] top-1/3 right-1/4 bg-glow-accent/10 hidden md:block" style={{ animationDelay: '4s' }} />
      
      {/* Rotating rings - hidden on mobile for performance */}
      <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary/10 rounded-full animate-rotate-slow" />
      <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-glow-secondary/10 rounded-full animate-rotate-slow" style={{ animationDirection: 'reverse', animationDuration: '25s' }} />
    </div>
  ), []);

  return (
    <div className="min-h-screen bg-grid relative overflow-hidden">
      {/* Hero glow effect */}
      <div className="hero-glow" />
      
      {/* Animated background orbs */}
      {backgroundOrbs}

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 min-h-screen flex flex-col items-center justify-center py-16 pb-32 sm:pb-28">
        <div className="max-w-4xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-10 sm:mb-16 opacity-0 animate-fade-in-up">
            {/* Floating badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs sm:text-sm font-medium mb-6 sm:mb-8 animate-bounce-subtle">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Earn Premium Time For Free</span>
            </div>
            
            {/* Main title */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 sm:mb-6 tracking-tight">
              <span className="text-gradient animate-text-glow">CORE</span>
              <br />
              <span className="text-foreground">REWARDS</span>
            </h1>
            
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed px-2">
              Complete simple tasks and <span className="text-primary font-semibold">earn free premium time</span> for your Core license. 
              No payment required — just a few clicks.
            </p>
          </div>

          {/* Stats Row */}
          <div className="flex justify-center gap-3 sm:gap-4 md:gap-8 mb-8 sm:mb-12 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center px-3 sm:px-6 py-3 sm:py-4">
                <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gradient mb-1">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-xs sm:text-sm uppercase tracking-wider font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-10 sm:mb-14">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card p-5 sm:p-6 hover-lift group opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${0.25 + index * 0.1}s` }}
              >
                <div className="card-shine" />
                <div className={`w-12 sm:w-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.color} p-0.5 mb-4 sm:mb-5`}>
                  <div className="w-full h-full rounded-xl sm:rounded-2xl bg-card flex items-center justify-center text-foreground group-hover:bg-transparent group-hover:text-primary-foreground transition-all duration-300">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-foreground mb-2 group-hover:text-gradient transition-all">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Login Card */}
          <div 
            className="glass-card glow-border-intense px-6 sm:px-12 py-5 sm:py-6 max-w-lg sm:max-w-xl mx-auto text-center opacity-0 animate-scale-in"
            style={{ animationDelay: '0.55s' }}
          >
            <div className="card-shine" />
            
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary via-glow-secondary to-glow-accent p-0.5 animate-pulse-glow shrink-0">
                <div className="w-full h-full rounded-xl sm:rounded-2xl bg-card flex items-center justify-center">
                  <Star className="w-6 sm:w-7 h-6 sm:h-7 text-primary" />
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-muted-foreground font-medium text-sm">Connecting...</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
                  <div className="text-left">
                    <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">
                      Ready to Start?
                    </h2>
                    <p className="text-muted-foreground text-xs hidden sm:block">
                      Login with Discord to begin earning
                    </p>
                  </div>
                  <div className="shrink-0">
                    <DiscordLoginButton onClick={login} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-0 right-0 text-center opacity-0 animate-fade-in-up px-4" style={{ animationDelay: '0.7s' }}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground text-xs sm:text-sm"
              onClick={() => window.open('https://discord.coreapi.online', '_blank')}
            >
              <MessageCircle className="w-4 h-4" />
              Join Discord
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground text-xs sm:text-sm"
              onClick={() => window.open('https://coreapi.online', '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
              Visit Main Site
            </Button>
          </div>
          <p className="text-muted-foreground/60 text-xs sm:text-sm font-medium">
            Powered by <span className="text-gradient font-bold">Core</span>
          </p>
        </div>
      </div>
    </div>
  );
}