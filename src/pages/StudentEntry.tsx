import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Play, ArrowRight } from 'lucide-react';

const StudentEntry = () => {
  const [step, setStep] = useState<'pin' | 'name'>('pin');
  const [pin, setPin] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { joinTest, currentTest } = useGame();
  const navigate = useNavigate();

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmedPin = pin.trim();
    if (!trimmedPin) {
      setError('Please enter a test PIN');
      return;
    }
    if (!currentTest || currentTest.pin !== trimmedPin) {
      setError('Invalid test PIN');
      return;
    }
    setStep('name');
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = joinTest(pin.trim(), username.trim());
    if (result.success) {
      navigate('/game');
    } else {
      setError(result.error || 'Failed to join');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <button
          onClick={() => step === 'name' ? (setStep('pin'), setError('')) : navigate('/')}
          className="mb-10 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 'name' ? 'Change PIN' : 'Back'}
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
            <Play className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Join Test</h1>
            <p className="text-xs text-muted-foreground">
              {step === 'pin' ? 'Enter the PIN from your instructor' : 'Enter your name to begin'}
            </p>
          </div>
        </div>

        {step === 'pin' ? (
          <form onSubmit={handlePinSubmit} className="space-y-5 mt-8" key="pin">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-medium">Test PIN</label>
              <Input
                type="text"
                value={pin}
                onChange={e => { setPin(e.target.value); setError(''); }}
                placeholder="Enter 6-digit PIN"
                maxLength={6}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground font-mono text-xl tracking-[0.3em] text-center h-14 rounded-xl"
                autoFocus
              />
            </div>
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl border border-destructive/20">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold rounded-xl text-base py-3.5 h-auto">
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        ) : (
          <form onSubmit={handleNameSubmit} className="space-y-5 mt-8 animate-fade-in" key="name">
            <div className="bg-secondary rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">PIN</span>
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
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl"
                autoFocus
              />
            </div>
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl border border-destructive/20">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold rounded-xl text-base py-3.5 h-auto">
              Start Test
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudentEntry;
