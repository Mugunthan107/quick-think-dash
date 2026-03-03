import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { ArrowLeft, Trophy, Medal, Clock, ChevronLeft } from 'lucide-react';
import DecorativeCurve from '@/components/DecorativeCurve';

const Leaderboard = () => {
  const { getLeaderboard, currentStudent, adminLoggedIn } = useGame();
  const navigate = useNavigate();

  useEffect(() => { if (!adminLoggedIn) navigate('/'); }, [adminLoggedIn, navigate]);

  const leaderboard = getLeaderboard();

  const rankStyle = (i: number) => {
    if (i === 0) return { bg: 'bg-[#FBBF24]', text: 'text-white', shadow: 'shadow-amber-500/30' };
    if (i === 1) return { bg: 'bg-slate-300', text: 'text-[#475569]', shadow: 'shadow-slate-500/10' };
    if (i === 2) return { bg: 'bg-[#B45309]/20', text: 'text-[#B45309]', shadow: 'shadow-orange-900/5' };
    return { bg: 'bg-white', text: 'text-[#64748B]', shadow: '' };
  };

  return (
    <div className="flex flex-col flex-1 w-full bg-[#FDFDFF] font-sans selection:bg-indigo-100 min-h-screen relative overflow-hidden">
      {/* Layer 1: Premium Background Depth */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#F0F7FF_0%,_#F8FAFC_40%,_#FDFDFF_100%)]" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#3B82F6] opacity-[0.04] blur-[120px] rounded-full" />
      </div>

      <DecorativeCurve
        opacity={0.04}
        height="h-[400px] sm:h-[550px]"
        className="absolute -top-[100px] sm:-top-[150px] -left-[10%] w-[120%] z-0 rotate-180 pointer-events-none mix-blend-multiply"
        animate={true}
      />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 relative z-10 animate-fade-in">
        <button
          onClick={() => navigate('/')}
          className="group mb-8 flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-all font-bold text-[14px] px-4 py-2 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-xl border border-white/80 shadow-sm"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Platform
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[2rem] bg-[#2563EB]/10 flex items-center justify-center shadow-lg shadow-blue-500/5 rotate-3">
              <Trophy className="w-8 h-8 text-[#2563EB]" />
            </div>
            <div>
              <h1 className="text-[32px] sm:text-[42px] font-black text-[#0F172A] tracking-tight leading-none mb-2">Leaderboard</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[14px] text-[#64748B] font-bold uppercase tracking-widest">{leaderboard.length} Candidates Active</p>
              </div>
            </div>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-24 bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)]">
            <Medal className="w-16 h-16 text-[#CBD5E1] mx-auto mb-6 opacity-40" />
            <h3 className="text-xl font-black text-[#0F172A] mb-2">No results yet</h3>
            <p className="text-[#64748B] font-medium">Results will appear here as candidates complete their tests.</p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[3rem_1fr_3.5rem_3.5rem_3.5rem_3.5rem_3.5rem_5rem_5rem] gap-2 px-6 py-6 border-b border-[#F1F5F9] bg-white/40 backdrop-blur-sm">
              {['Rank', 'Candidate', 'BS', 'CM', 'NL', 'AR', 'MC', 'Total', 'Time'].map((h, idx) => (
                <span key={h} className={`text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ${idx === 0 ? 'text-center' : idx >= 7 ? 'text-right' : 'text-center'}`}>{h}</span>
              ))}
            </div>

            {/* Rows */}
            <div className="divide-y divide-[#F1F5F9]">
              {leaderboard.map((s, i) => {
                const isMe = currentStudent?.username === s.username;
                const totalTime = s.gameHistory?.reduce((acc, g) => acc + g.timeTaken, 0) || 0;
                const getGame = (id: string) => {
                  const g = s.gameHistory?.find(h => h.gameId === id);
                  return g ? { score: g.score, correct: g.correctAnswers, total: g.totalQuestions } : null;
                };
                const bubble = getGame('bubble'), crossmath = getGame('crossmath'), numlink = getGame('numlink'), aptirush = getGame('aptirush'), motion = getGame('motion');
                const rs = rankStyle(i);

                return (
                  <div key={s.username}
                    className={`grid grid-cols-[3rem_1fr_3.5rem_3.5rem_3.5rem_3.5rem_3.5rem_5rem_5rem] gap-2 px-6 py-5 items-center transition-all duration-300 hover:bg-white/60 group ${isMe ? 'bg-blue-50/40' : ''}`}>
                    {/* Rank */}
                    <div className="flex justify-center">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-lg ${rs.bg} ${rs.text} ${rs.shadow} ${i > 2 ? 'border border-[#E2E8F0]' : ''}`}>
                        {i + 1}
                      </span>
                    </div>
                    {/* Name */}
                    <div className="min-w-0 pr-4">
                      <span className="font-black text-[#0F172A] text-[16px] truncate block group-hover:text-[#2563EB] transition-colors">{s.username}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {isMe && <span className="text-[10px] bg-[#2563EB] text-white px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">You</span>}
                        <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider">{s.gamesPlayed || 0} Games</span>
                      </div>
                    </div>
                    {/* Game scores */}
                    {[bubble, crossmath, numlink, aptirush, motion].map((gd, gi) => (
                      <div key={gi} className="text-center group-hover:scale-110 transition-transform">
                        {gd ? (
                          <div className="flex flex-col">
                            <span className="font-mono font-black text-[13px] text-[#0F172A] leading-none mb-1">{gd.score}</span>
                            <span className="text-[9px] text-emerald-500 font-black">{gd.correct}/{gd.total}</span>
                          </div>
                        ) : <span className="text-[#CBD5E1] text-[13px] font-black">—</span>}
                      </div>
                    ))}
                    {/* Total */}
                    <div className="text-right">
                      <span className="font-mono font-black text-[20px] text-[#2563EB] tabular-nums"
                        style={{ textShadow: '0 0 20px rgba(37,99,235,0.1)' }}>{s.score}</span>
                    </div>
                    {/* Time */}
                    <div className="text-right flex flex-col items-end">
                      <div className="flex items-center gap-1.5 h-full">
                        <Clock className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#2563EB] transition-colors" />
                        <span className="font-mono text-[14px] font-black text-[#0F172A]">{totalTime.toFixed(1)}s</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <DecorativeCurve
        opacity={0.04}
        height="h-[400px] sm:h-[550px]"
        className="absolute -bottom-[100px] -left-[10%] w-[120%] z-0 pointer-events-none"
        animate={true}
      />
    </div>
  );
};

export default Leaderboard;
