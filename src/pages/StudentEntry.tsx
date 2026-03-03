import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Play, ArrowRight, KeyRound, UserCircle } from 'lucide-react';
import DecorativeCurve from '@/components/DecorativeCurve';

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
    <div className="flex flex-col flex-1 w-full bg-[#FDFDFF] font-sans selection:bg-indigo-100 h-[100dvh] fixed inset-0 overflow-hidden">
      {/* Layer 1: Premium Background Depth */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Soft Multi-Gradient Base - Sky Blue Focus */}
        <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#E0F2FE_0%,_#ECFEFF_40%,_#F0F9FF_100%)]" />

        {/* Very Faint Radial Glow behind Hero */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#6C63FF] opacity-[0.03] blur-[120px] rounded-full" />
      </div>

      {/* === TOP WAVES (CLEAN) === */}
      {/* Top Wave - Deepest Layer */}
      <DecorativeCurve
        opacity={0.03}
        height="h-[400px] sm:h-[550px]"
        className="absolute -top-[100px] sm:-top-[150px] -left-[10%] w-[120%] z-0 rotate-180 pointer-events-none scale-x-[1.1] translate-x-8 mix-blend-multiply"
        animate={true}
      />
      {/* Top Wave - Primary Smooth Layer */}
      <DecorativeCurve
        opacity={0.08}
        height="h-[250px] sm:h-[350px]"
        className="absolute top-0 left-0 z-0 rotate-180 pointer-events-none w-full"
        animate={true}
      />

      <div className="flex flex-col flex-1 items-center justify-center p-4 h-full relative z-10 w-full">
        <div className="relative w-full max-w-[480px] animate-fade-in-up opacity-0 px-4" style={{ animationFillMode: 'forwards' }}>
          <div className="relative z-20 overflow-hidden rounded-[2.5rem] bg-white/40 backdrop-blur-2xl border border-white/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
            {/* Inner Soft Gradient Glow to give it volume */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/20 to-transparent pointer-events-none" />

            <div className="relative z-10 p-8 sm:p-12">
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
                    <label className="text-[13px] text-muted-foreground/80 mb-2.5 block font-bold uppercase tracking-wider">Test PIN</label>
                    <div className="relative">
                      <Input
                        type="text" value={pin}
                        onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
                        placeholder="• • • • • •" maxLength={6}
                        className="bg-transparent border-2 border-[#6C63FF] text-[#0F172A] placeholder:text-muted-foreground/30 font-mono text-xl sm:text-2xl tracking-[0.4em] text-center h-16 rounded-3xl outline-none focus-visible:ring-0 shadow-[inset_0_0_0_2px_white] transition-all"
                        autoFocus
                      />
                      <div className="absolute inset-0 rounded-3xl border-2 border-[#6C63FF] m-[3px] pointer-events-none" />
                    </div>
                  </div>
                  {error && <div className="bg-red-50 text-destructive text-xs sm:text-sm p-3 rounded-xl border border-destructive/20 font-medium animate-shake glow-red">{error}</div>}
                  <div className="flex gap-4 mt-8">
                    <Button
                      type="button"
                      onClick={() => navigate('/')}
                      className="flex-1 bg-[#6C63FF] hover:bg-[#5B54E5] text-white rounded-2xl text-[14px] sm:text-[15px] h-12 font-bold transition-all hover:-translate-y-0.5"
                    >
                      &lt;- Back
                    </Button>
                    <Button type="submit" className="flex-1 bg-[#6C63FF] hover:bg-[#5B54E5] text-white rounded-2xl text-[14px] sm:text-[15px] h-12 font-bold transition-all hover:-translate-y-0.5" disabled={isVerifying}>
                      {isVerifying ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying</span>
                        : <>Next -&gt;</>}
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleNameSubmit} className="space-y-4 sm:space-y-5 animate-fade-in" key="name">
                  <div className="bg-white/40 backdrop-blur-md rounded-2xl px-5 py-4 flex items-center justify-between border border-white/60 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]">
                    <span className="text-[13px] text-muted-foreground/80 font-bold uppercase tracking-wider">PIN</span>
                    <span className="font-mono font-bold text-[#6C63FF] text-lg tracking-[0.2em]">{pin}</span>
                  </div>
                  <div>
                    <label className="text-[13px] text-muted-foreground/80 mb-2.5 block font-bold uppercase tracking-wider">Your Name</label>
                    <div className="relative">
                      <Input
                        type="text" value={username}
                        onChange={e => { setUsername(e.target.value); setError(''); }}
                        placeholder="Enter your name" maxLength={30}
                        className="bg-transparent border-2 border-[#6C63FF] text-[#0F172A] placeholder:text-muted-foreground/30 text-[15px] sm:text-[16px] px-5 h-16 rounded-3xl outline-none focus-visible:ring-0 shadow-[inset_0_0_0_2px_white] transition-all font-medium"
                        autoFocus
                      />
                      <div className="absolute inset-0 rounded-3xl border-2 border-[#6C63FF] m-[3px] pointer-events-none" />
                    </div>
                  </div>
                  {error && <div className="bg-red-50 text-destructive text-xs sm:text-sm p-3 rounded-xl border border-destructive/20 font-medium animate-shake glow-red">{error}</div>}
                  <div className="flex gap-4 mt-8">
                    <Button
                      type="button"
                      onClick={() => { setStep('pin'); setError(''); }}
                      className="flex-1 bg-[#6C63FF] hover:bg-[#5B54E5] text-white rounded-2xl text-[14px] sm:text-[15px] h-12 font-bold transition-all hover:-translate-y-0.5"
                    >
                      &lt;- Back
                    </Button>
                    <Button type="submit" className="flex-1 bg-[#6C63FF] hover:bg-[#5B54E5] text-white rounded-2xl text-[14px] sm:text-[15px] h-12 font-bold transition-all hover:-translate-y-0.5" disabled={isVerifying}>
                      {isVerifying ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Joining</span>
                        : <>Start Test -&gt;</>}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* === BOTTOM WAVES (CLEAN) === */}
      {/* Bottom Wave - Deepest Layer */}
      <DecorativeCurve
        opacity={0.03}
        height="h-[400px] sm:h-[550px]"
        className="absolute -bottom-[50px] sm:-bottom-[100px] -left-[10%] w-[120%] z-0 pointer-events-none scale-x-[1.1] -translate-x-8 mix-blend-multiply"
        animate={true}
      />
      {/* Bottom Wave - Primary Smooth Layer */}
      <DecorativeCurve
        opacity={0.08}
        height="h-[250px] sm:h-[350px]"
        className="absolute bottom-0 left-0 z-0 pointer-events-none w-full"
        animate={true}
      />
    </div >
  );
};

export default StudentEntry;
