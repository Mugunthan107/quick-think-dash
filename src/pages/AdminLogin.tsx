import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, ArrowLeft } from 'lucide-react';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { adminLogin } = useGame();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(password)) {
      navigate('/admin');
    } else {
      setError('Invalid password');
      setPassword('');
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

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
            <Lock className="w-5 h-5 text-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Password</label>
            <Input
              type="text"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Enter admin password"
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              autoFocus
            />
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Login
          </Button>
        </form>

        <p className="text-xs text-muted-foreground mt-6 text-center">
          Password is visible while typing for convenience
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
