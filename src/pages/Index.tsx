import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiscordAuth } from '@/hooks/useDiscordAuth';
import { DiscordLoginButton } from '@/components/DiscordLoginButton';
import { Gift, Shield, Sparkles, Zap, Star } from 'lucide-react';

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
      <div className="relative z-10 container mx-auto px-4 min-h-screen flex flex-col items-center justify-center py-12">
        <div className="max-w-4xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-16 opacity-0 animate-fade-in-up">
            {/* Floating badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-8 animate-bounce-subtle">
              <Sparkles className="w-4 h-4" />
              <span>Earn Premium Time For Free</span>
            </div>
            
            {/* Main title */}
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight">
              <span className="text-gradient animate-text-glow">CORESERV</span>
              <br />
              <span className="text-foreground">REWARDS</span>
            </h1>
            
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Complete simple tasks and <span className="text-primary font-semibold">earn free premium time</span> for your CoreServ license. 
              No payment required — just a few clicks.
            </p>
          </div>

          {/* Stats Row */}
          <div className="flex justify-center gap-4 md:gap-8 mb-12 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center px-6 py-4">
                <div className="font-display text-3xl md:text-4xl font-bold text-gradient mb-1">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm uppercase tracking-wider font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-5 mb-14">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card p-6 hover-lift group opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${0.25 + index * 0.1}s` }}
              >
                <div className="card-shine" />
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} p-0.5 mb-5`}>
                  <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center text-foreground group-hover:bg-transparent group-hover:text-primary-foreground transition-all duration-300">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-2 group-hover:text-gradient transition-all">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Login Card */}
          <div 
            className="glass-card glow-border-intense p-10 max-w-md mx-auto text-center opacity-0 animate-scale-in"
            style={{ animationDelay: '0.55s' }}
          >
            <div className="card-shine" />
            
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-glow-secondary to-glow-accent p-0.5 mx-auto mb-6 animate-pulse-glow">
              <div className="w-full h-full rounded-3xl bg-card flex items-center justify-center">
                <Star className="w-10 h-10 text-primary" />
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-4">
                <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">Connecting...</p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Ready to Start?
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Login with Discord to begin earning time
                </p>
                <DiscordLoginButton onClick={login} />
                <p className="text-muted-foreground/60 text-xs mt-5">
                  By logging in, you agree to our terms of service
                </p>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-0 right-0 text-center opacity-0 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <p className="text-muted-foreground/60 text-sm font-medium">
            Powered by <span className="text-gradient font-bold">CoreServ</span>
          </p>
        </div>
      </div>
    </div>
  );
}