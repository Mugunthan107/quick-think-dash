import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Play, ArrowRight, KeyRound, UserCircle } from 'lucide-react';

const StudentEntry = () => {
  const location = useLocation();
  const [step, setStep] = useState<'pin' | 'name'>('pin');
  const [pin, setPin] = useState(location.state?.pin || '');
  const [username, setUsername] = useState(location.state?.username || '');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { joinTest, verifyTestPin } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.approved) {
      handleNameSubmit(new Event('submit') as any);
    } else if (pin) {
      setStep('name');
    }
  }, [location.state]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmedPin = pin.trim();
    if (!trimmedPin) {
      setError('Please enter a test PIN');
      return;
    }

    setIsVerifying(true);
    try {
      const isValid = await verifyTestPin(trimmedPin);
      if (isValid) {
        setStep('name');
      } else {
        setError('Invalid or inactive test PIN');
      }
    } catch (err) {
      setError('Failed to verify PIN');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setIsVerifying(true);
    try {
      const result = await joinTest(pin.trim(), username.trim());
      if (result.success) {
        if (result.pending) {
          navigate('/waiting-approval', { state: { pin, username } });
        } else {
          navigate('/lobby');
        }
      } else {
        setError(result.error || 'Failed to join');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative z-10 bg-background">
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.012]"
        style={{
          backgroundImage: 'radial-gradient(hsl(255 72% 56%) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative w-full max-w-sm animate-fade-in-up px-2 opacity-0" style={{ animationFillMode: 'forwards' }}>
        <button
          onClick={() => step === 'name' ? (setStep('pin'), setError('')) : navigate('/')}
          className="mb-8 sm:mb-10 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          {step === 'name' ? 'Change PIN' : 'Back'}
        </button>

        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 card-elevated">
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-7">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-accent flex items-center justify-center relative">
              {step === 'pin' ? (
                <KeyRound className="w-5 h-5 text-accent-foreground" />
              ) : (
                <UserCircle className="w-5 h-5 text-accent-foreground" />
              )}
              <div className="absolute -inset-0.5 rounded-xl bg-accent/20 blur-md -z-10" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                {step === 'pin' ? 'Join Test' : 'Almost There'}
              </h1>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-0.5">
                {step === 'pin' ? 'Enter the PIN from your instructor' : 'Enter your name to begin'}
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step === 'pin' ? 'bg-accent' : 'bg-accent'}`} />
            <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step === 'name' ? 'bg-accent' : 'bg-border'}`} />
          </div>

          {step === 'pin' ? (
            <form onSubmit={handlePinSubmit} className="space-y-4 sm:space-y-5" key="pin">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block font-medium">Test PIN</label>
                <Input
                  type="text"
                  value={pin}
                  onChange={e => { setPin(e.target.value); setError(''); }}
                  placeholder="• • • • • •"
                  maxLength={6}
                  className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground/30 font-mono text-lg sm:text-xl tracking-[0.3em] text-center h-13 sm:h-14 rounded-xl focus-visible:ring-accent transition-all duration-200 focus-visible:bg-background"
                  autoFocus
                />
              </div>
              {error && (
                <div className="bg-destructive/5 text-destructive text-xs sm:text-sm p-3 rounded-xl border border-destructive/15 font-medium animate-shake">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold rounded-xl text-sm sm:text-base py-3 sm:py-3.5 h-auto btn-glow transition-all duration-200 active:scale-[0.97]"
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleNameSubmit} className="space-y-4 sm:space-y-5 animate-fade-in" key="name">
              <div className="bg-accent/5 rounded-xl px-4 py-3 flex items-center justify-between border border-accent/10">
                <span className="text-xs text-muted-foreground font-medium">PIN</span>
                <span className="font-mono font-bold text-accent tracking-widest">{pin}</span>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block font-medium">Your Name</label>
                <Input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                  placeholder="Enter your name"
                  maxLength={30}
                  className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground/30 h-11 sm:h-12 rounded-xl focus-visible:ring-accent transition-all duration-200 focus-visible:bg-background"
                  autoFocus
                />
              </div>
              {error && (
                <div className="bg-destructive/5 text-destructive text-xs sm:text-sm p-3 rounded-xl border border-destructive/15 font-medium animate-shake">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold rounded-xl text-sm sm:text-base py-3 sm:py-3.5 h-auto btn-glow transition-all duration-200 active:scale-[0.97]"
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                    Joining...
                  </span>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    Start Test
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentEntry;
