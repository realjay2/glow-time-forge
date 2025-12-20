import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiscordAuth } from '@/hooks/useDiscordAuth';
import { DiscordLoginButton } from '@/components/DiscordLoginButton';
import { Clock, Gift, Shield } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { user, isLoading, login } = useDiscordAuth();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  const features = [
    {
      icon: <Gift className="w-6 h-6" />,
      title: 'Earn Free Time',
      description: 'Complete simple tasks to extend your premium access',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: '1 Hour Per Session',
      description: 'Each completion adds 1 hour to your key',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Fast',
      description: 'Discord OAuth for secure authentication',
    },
  ];

  return (
    <div className="min-h-screen bg-grid relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-glow-secondary/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 min-h-screen flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full text-center">
          {/* Logo/Title */}
          <div className="mb-12 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 mb-6 animate-pulse-glow">
              <Gift className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-gradient mb-4">
              QuantV Rewards
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto">
              Complete tasks to earn free premium time for your QuantV key
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card p-5 opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${0.2 + index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3 mx-auto">
                  {feature.icon}
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Login Section */}
          <div 
            className="glass-card glow-border p-8 max-w-sm mx-auto opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}
          >
            {isLoading ? (
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  Get Started
                </h2>
                <DiscordLoginButton onClick={login} />
                <p className="text-muted-foreground text-xs mt-4">
                  By logging in, you agree to our terms of service
                </p>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 text-center">
          <p className="text-muted-foreground text-sm">
            Powered by <span className="text-primary">QuantV</span>
          </p>
        </div>
      </div>
    </div>
  );
}
