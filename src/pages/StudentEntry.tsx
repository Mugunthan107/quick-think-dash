import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Play } from 'lucide-react';

const StudentEntry = () => {
  const [pin, setPin] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { joinTest } = useGame();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
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
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
            <Play className="w-5 h-5 text-accent-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Join Test</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-8">Enter the PIN shared by your instructor</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Test PIN</label>
            <Input
              type="text"
              value={pin}
              onChange={e => { setPin(e.target.value); setError(''); }}
              placeholder="Enter 6-digit PIN"
              maxLength={6}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground font-mono text-lg tracking-widest text-center"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Your Name</label>
            <Input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              placeholder="Enter your name"
              maxLength={30}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
            Start Test
          </Button>
        </form>
      </div>
    </div>
  );
};

export default StudentEntry;
