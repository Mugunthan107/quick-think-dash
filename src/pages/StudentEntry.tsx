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
    if (location.state?.approved) handleNameSubmit(new Event('submit') as any);
    else if (pin) setStep('name');
  }, [location.state]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmedPin = pin.trim();
    if (!trimmedPin) { setError('Please enter a test PIN'); return; }
    setIsVerifying(true);
    try {
      const isValid = await verifyTestPin(trimmedPin);
      if (isValid) setStep('name');
      else setError('Invalid or inactive test PIN');
    } catch { setError('Failed to verify PIN'); }
    finally { setIsVerifying(false); }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);
    try {
      const result = await joinTest(pin.trim(), username.trim());
      if (result.success) {
        if (result.pending) navigate('/waiting-approval', { state: { pin, username } });
        else navigate('/lobby');
      } else setError(result.error || 'Failed to join');
    } finally { setIsVerifying(false); }
  };

  return (
    <div className="flex flex-col flex-1 w-full bg-[#F8F9FB]">
      <div className="flex flex-col flex-1 items-center justify-center p-4 min-h-[calc(100vh-120px)]">
        <div className="relative w-full max-w-sm animate-fade-in-up opacity-0 px-2" style={{ animationFillMode: 'forwards' }}>
          <button
            onClick={() => step === 'name' ? (setStep('pin'), setError('')) : navigate('/')}
            className="mb-7 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            {step === 'name' ? 'Change PIN' : 'Back'}
          </button>

          <div className="card-glass rounded-2xl p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center relative ${step === 'pin' ? 'icon-bg-purple' : 'icon-bg-blue'}`}
                style={{ boxShadow: '0 0 18px hsl(258 76% 55% / 0.18)' }}>
                {step === 'pin'
                  ? <KeyRound className="w-5 h-5 text-accent" />
                  : <UserCircle className="w-5 h-5 text-blue-500" />}
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

            {/* Progress */}
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1.5 flex-1 rounded-full bg-accent" style={{ boxShadow: '0 0 8px hsl(258 76% 55% / 0.40)' }} />
              <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step === 'name' ? 'bg-accent' : 'bg-border'}`}
                style={step === 'name' ? { boxShadow: '0 0 8px hsl(258 76% 55% / 0.40)' } : {}} />
            </div>

            {step === 'pin' ? (
              <form onSubmit={handlePinSubmit} className="space-y-4 sm:space-y-5" key="pin">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Test PIN</label>
                  <Input
                    type="text" value={pin}
                    onChange={e => { setPin(e.target.value); setError(''); }}
                    placeholder="• • • • • •" maxLength={6}
                    className="bg-white/80 border-border text-foreground placeholder:text-muted-foreground/30 font-mono text-lg sm:text-xl tracking-[0.3em] text-center h-13 sm:h-14 rounded-xl focus-visible:ring-accent input-neon"
                    style={{ height: '52px' }} autoFocus
                  />
                </div>
                {error && <div className="bg-red-50 text-destructive text-xs sm:text-sm p-3 rounded-xl border border-destructive/20 font-medium animate-shake glow-red">{error}</div>}
                <Button type="submit" className="w-full btn-primary rounded-xl text-sm sm:text-base h-11 sm:h-12 font-semibold text-white" disabled={isVerifying}>
                  {isVerifying ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying...</span>
                    : <><span>Next</span><ArrowRight className="w-4 h-4 ml-1" /></>}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleNameSubmit} className="space-y-4 sm:space-y-5 animate-fade-in" key="name">
                <div className="bg-accent/6 rounded-xl px-4 py-3 flex items-center justify-between border border-accent/15"
                  style={{ boxShadow: '0 0 12px hsl(258 76% 55% / 0.08)' }}>
                  <span className="text-xs text-muted-foreground font-medium">PIN</span>
                  <span className="font-mono font-bold text-accent tracking-widest">{pin}</span>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Your Name</label>
                  <Input
                    type="text" value={username}
                    onChange={e => { setUsername(e.target.value); setError(''); }}
                    placeholder="Enter your name" maxLength={30}
                    className="bg-white/80 border-border text-foreground placeholder:text-muted-foreground/30 h-11 sm:h-12 rounded-xl focus-visible:ring-accent input-neon"
                    autoFocus
                  />
                </div>
                {error && <div className="bg-red-50 text-destructive text-xs sm:text-sm p-3 rounded-xl border border-destructive/20 font-medium animate-shake glow-red">{error}</div>}
                <Button type="submit" className="w-full btn-primary rounded-xl text-sm sm:text-base h-11 sm:h-12 font-semibold text-white" disabled={isVerifying}>
                  {isVerifying ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Joining...</span>
                    : <><Play className="w-4 h-4 fill-white" /><span className="ml-1.5">Start Test</span></>}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentEntry;
