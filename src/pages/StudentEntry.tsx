import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Play, ArrowRight } from 'lucide-react';

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
    <div className="flex min-h-screen items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-sm animate-fade-in px-2">
        <button
          onClick={() => step === 'name' ? (setStep('pin'), setError('')) : navigate('/')}
          className="mb-8 sm:mb-10 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 'name' ? 'Change PIN' : 'Back'}
        </button>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-border p-6 sm:p-8 shadow-[0_8px_24px_hsl(260_40%_90%/0.6)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent flex items-center justify-center shadow-md shadow-accent/20">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Join Test</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                {step === 'pin' ? 'Enter the PIN from your instructor' : 'Enter your name to begin'}
              </p>
            </div>
          </div>

          {step === 'pin' ? (
            <form onSubmit={handlePinSubmit} className="space-y-4 sm:space-y-5" key="pin">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block font-medium">Test PIN</label>
                <Input
                  type="text"
                  value={pin}
                  onChange={e => { setPin(e.target.value); setError(''); }}
                  placeholder="Enter 6-digit PIN"
                  maxLength={6}
                  className="bg-white border-border text-foreground placeholder:text-muted-foreground/50 font-mono text-lg sm:text-xl tracking-[0.3em] text-center h-12 sm:h-14 rounded-xl focus-visible:ring-accent"
                  autoFocus
                />
              </div>
              {error && (
                <div className="bg-destructive/8 text-destructive text-xs sm:text-sm p-3 rounded-xl border border-destructive/20 font-medium">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold rounded-xl text-sm sm:text-base py-3 sm:py-3.5 h-auto shadow-md shadow-accent/20"
                disabled={isVerifying}
              >
                {isVerifying ? 'Verifying...' : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleNameSubmit} className="space-y-4 sm:space-y-5 animate-fade-in" key="name">
              <div className="bg-secondary rounded-xl px-4 py-3 flex items-center justify-between border border-border">
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
                  className="bg-white border-border text-foreground placeholder:text-muted-foreground/50 h-11 sm:h-12 rounded-xl focus-visible:ring-accent"
                  autoFocus
                />
              </div>
              {error && (
                <div className="bg-destructive/8 text-destructive text-xs sm:text-sm p-3 rounded-xl border border-destructive/20 font-medium">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold rounded-xl text-sm sm:text-base py-3 sm:py-3.5 h-auto shadow-md shadow-accent/20"
                disabled={isVerifying}
              >
                {isVerifying ? 'Joining...' : 'Start Test'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentEntry;
