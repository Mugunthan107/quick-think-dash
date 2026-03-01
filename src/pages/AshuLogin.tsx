import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DecorativeCurve from '@/components/DecorativeCurve';
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
      // parent re-renders
    } else {
      setError('Invalid password');
      setPassword('');
    }
  };

  return (
    <div className="relative flex flex-col flex-1 w-full items-center justify-center p-4 min-h-[calc(100vh-60px)] bg-[#F8F9FB] overflow-hidden">

      {/* Top Wave */}
      <DecorativeCurve
        invert={true}
        opacity={0.08}
        height="h-[40px] sm:h-[60px] lg:h-[80px]"
        className="absolute top-0 left-0 z-10"
        animate={true}
      />

      {/* Background Depth */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F3FF] to-[#F8F9FB] opacity-50" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in px-2 z-20">
        <button onClick={() => navigate('/')}
          className="mb-8 sm:mb-10 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white border border-[#E6E1FF]/40 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#6D4AFE]/5 flex items-center justify-center">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[#6D4AFE]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">Ashu Login</h1>
              <p className="text-[10px] sm:text-xs text-[#9CA3AF] font-medium">Manage tests and view results</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="text-sm text-[#4B5563] mb-2 block font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter admin password"
                  className="bg-white border-[#E6E1FF]/60 text-[#111827] placeholder:text-[#9CA3AF]/50 h-11 sm:h-12 rounded-xl pr-10 focus-visible:ring-[#6D4AFE]"
                  autoFocus
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
              {error && <p className="text-[#EF4444] text-xs sm:text-sm mt-2 font-medium">{error}</p>}
            </div>
            <Button type="submit" className="w-full h-11 sm:h-12 bg-[#6D4AFE] hover:bg-[#6D4AFE]/95 text-white rounded-xl font-bold shadow-lg shadow-[#6D4AFE]/10">
              Login
            </Button>
          </form>
        </div>
      </div>

      {/* Bottom Wave */}
      <DecorativeCurve
        opacity={0.08}
        height="h-[40px] sm:h-[60px] lg:h-[80px]"
        className="absolute bottom-0 left-0 z-10"
        animate={true}
      />
    </div>
  );
};

export default AshuLogin;
