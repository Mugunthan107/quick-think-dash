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
    <div className="flex flex-col flex-1 w-full bg-transparent font-sans selection:bg-indigo-100 h-screen fixed inset-0 overflow-hidden">
      {/* Layer 1: Premium Background Depth */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-transparent" />
      </div>

      {/* Redundant Waves Removed */}

      <div className="flex flex-col flex-1 items-center justify-center p-4 relative z-10 w-full min-h-screen pt-20 sm:pt-24 pb-16">
        <div className="relative w-full max-w-[400px] animate-fade-in-up opacity-0 px-4" style={{ animationFillMode: 'forwards' }}>
          <div className="relative z-20 overflow-hidden rounded-[2rem] bg-white/90 backdrop-blur-2xl border border-white/60 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)]">
            {/* Decorative Corner Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2563EB]/10 to-transparent rounded-full blur-2xl" />

            <div className="relative z-10 p-8 sm:p-10">
              {/* Header */}
              <div className="flex flex-col items-center text-center mb-10">
                <h1 className="text-2xl sm:text-[28px] font-black text-[#0F172A] tracking-tight leading-none mb-3">
                  {step === 'pin' ? 'Join Test' : 'Almost There'}
                </h1>
                <p className="text-[14px] text-[#64748B] font-medium leading-relaxed max-w-[240px]">
                  {step === 'pin' ? 'Enter the PIN from your instructor' : 'Enter your name to begin'}
                </p>
              </div>



              {step === 'pin' ? (
                <form onSubmit={handlePinSubmit} className="space-y-4 sm:space-y-5" key="pin">
                  <div className="space-y-6">
                    <div>
                      <div className="relative">
                        <Input
                          type="text" value={pin}
                          onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
                          placeholder="Enter Pin" maxLength={6}
                          className="bg-white border-2 border-[#2563EB] text-[#0F172A] placeholder:text-[#94A3B8]/40 font-mono text-xl sm:text-2xl tracking-[0.3em] text-center h-16 rounded-2xl outline-none ring-0 focus-visible:ring-2 focus-visible:ring-[#2563EB]/20 transition-all shadow-sm"
                          autoFocus
                        />
                      </div>
                    </div>
                    {error && <div className="bg-[#FEF2F2] text-[#EF4444] text-[13px] px-4 py-3 rounded-xl border border-[#FECACA] font-semibold animate-shake">{error}</div>}
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        onClick={() => navigate('/')}
                        className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[18px] h-[52px] font-bold text-[15px] shadow-lg shadow-blue-500/10 transition-all"
                      >
                        Back
                      </Button>
                      <Button type="submit" className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[18px] h-[52px] font-bold text-[15px] shadow-lg shadow-blue-500/20 transition-all" disabled={isVerifying}>
                        {isVerifying ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying</span>
                          : <>Next</>}
                      </Button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleNameSubmit} className="space-y-6 animate-fade-in">
                  <div className="bg-[#F8FAFC] rounded-[20px] px-6 py-4 flex items-center justify-between border border-[#E2E8F0]">
                    <span className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-widest">Session PIN</span>
                    <span className="font-mono font-bold text-[#2563EB] text-xl tracking-[0.2em]">{pin}</span>
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-[#94A3B8] mb-3 block uppercase tracking-widest">Your Name</label>
                    <div className="relative">
                      <Input
                        type="text" value={username}
                        onChange={e => { setUsername(e.target.value); setError(''); }}
                        placeholder="Your full name" maxLength={30}
                        className="bg-white border-2 border-[#2563EB] text-[#0F172A] placeholder:text-[#94A3B8]/40 text-[16px] px-6 h-16 rounded-[20px] outline-none ring-0 focus-visible:ring-2 focus-visible:ring-[#2563EB]/20 transition-all font-bold"
                        autoFocus
                      />
                    </div>
                  </div>
                  {error && <div className="bg-[#FEF2F2] text-[#EF4444] text-[13px] px-4 py-3 rounded-xl border border-[#FECACA] font-semibold animate-shake">{error}</div>}
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      onClick={() => { setStep('pin'); setError(''); }}
                      className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[18px] h-[52px] font-bold text-[15px] shadow-lg shadow-blue-500/10 transition-all"
                    >
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[18px] h-[52px] font-bold text-[15px] shadow-lg shadow-blue-500/20 transition-all" disabled={isVerifying}>
                      {isVerifying ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Joining</span>
                        : <>Start Test</>}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Redundant Waves Removed */}
    </div >
  );
};

export default StudentEntry;
