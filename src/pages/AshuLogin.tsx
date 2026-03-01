import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const AshuLogin = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { adminLogin } = useGame();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(password)) {
      // No navigation needed, parent component will re-render
    } else {
      setError('Invalid password');
      setPassword('');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-sm animate-fade-in px-2">
        <button
          onClick={() => navigate('/')}
          className="mb-8 sm:mb-10 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-border p-6 sm:p-8 shadow-[0_8px_24px_hsl(260_40%_90%/0.6)]">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary flex items-center justify-center border border-border">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Ashu Login</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Manage tests and view results</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter admin password"
                  className="bg-white border-border text-foreground placeholder:text-muted-foreground/50 h-11 sm:h-12 rounded-xl pr-10 focus-visible:ring-accent"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
              {error && <p className="text-destructive text-xs sm:text-sm mt-2 font-medium">{error}</p>}
            </div>
            <Button type="submit" className="w-full h-11 sm:h-12 bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl font-semibold shadow-md shadow-accent/20">
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AshuLogin;
