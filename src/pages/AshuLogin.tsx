import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DecorativeCurve from '@/components/DecorativeCurve';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, ArrowLeft, Eye, EyeOff, X } from 'lucide-react';

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
    <div className="relative flex flex-col flex-1 w-full items-center justify-center p-4 h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] bg-transparent overflow-hidden font-sans selection:bg-indigo-100 mt-4 sm:mt-6">

      {/* Layer 1: Premium Background Depth */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-transparent" />
      </div>

      {/* Redundant Waves Removed */}

      <div className="relative w-full max-w-[400px] animate-fade-in px-4 z-20">
        <div className="bg-white/90 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-8 sm:p-10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] transition-all duration-500 relative overflow-hidden group mx-auto">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#E0F2FE]/50 to-[#E0F2FE]/0 rounded-bl-full pointer-events-none" />

          <div className="relative mb-10 flex flex-col items-center text-center">
            <h1 className="text-2xl sm:text-[28px] font-black text-[#0F172A] tracking-tight leading-none mb-3">Admin Access</h1>
            <p className="text-[14px] text-[#64748B] font-medium leading-relaxed max-w-[240px]">Enter your password to manage test sessions</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="relative group/input max-w-[320px] mx-auto">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6C63FF] to-[#22D3EE] rounded-2xl opacity-0 group-hover/input:opacity-20 transition duration-500" />
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter Password"
                    className="bg-white border-2 border-[#2563EB] text-[#0F172A] placeholder:text-[#94A3B8]/40 h-16 rounded-2xl pr-12 text-center text-[16px] font-mono tracking-widest shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-[#2563EB]/20"
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors bg-white/80 p-1.5 rounded-lg backdrop-blur-sm">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-[#EF4444] text-[13px] mt-2.5 font-medium flex justify-center items-center gap-1.5"><X className="w-4 h-4" />{error}</p>}
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => navigate('/')} className="flex-1 h-[52px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[18px] font-bold text-[15px] shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center">
                Back
              </button>
              <button type="submit" className="flex-1 h-[52px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[18px] font-bold text-[15px] shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center">
                Login
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Redundant Waves Removed */}
    </div>
  );
};

export default AshuLogin;
