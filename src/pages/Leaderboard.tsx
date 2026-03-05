import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Trophy, Medal, Clock, ChevronLeft } from 'lucide-react';
import DecorativeCurve from '@/components/DecorativeCurve';

const Leaderboard = () => {
  const { getLeaderboard, currentStudent, adminLoggedIn, currentTest } = useGame();
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
    <div className="flex flex-col flex-1 w-full bg-[#F0F7FF] font-sans selection:bg-sky-100 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#E0F2FE_0%,_#F0F9FF_40%,_#FFFFFF_100%)]" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#38BDF8] opacity-[0.04] blur-[120px] rounded-full" />
      </div>

      <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]"
        className="absolute -top-[100px] sm:-top-[150px] -left-[10%] w-[120%] z-0 rotate-180 pointer-events-none mix-blend-multiply" animate={true} />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 relative z-10 animate-fade-in">
        <button onClick={() => navigate('/')}
          className="group mb-6 sm:mb-8 flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-all font-bold text-[13px] sm:text-[14px] px-3 sm:px-4 py-2 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-xl border border-white/80 shadow-sm">
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Platform
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[1.5rem] sm:rounded-[2rem] bg-sky-500/10 flex items-center justify-center shadow-lg shadow-sky-500/5 rotate-3">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-sky-500" />
            </div>
            <div>
              <h1 className="text-[24px] sm:text-[42px] font-black text-[#0F172A] tracking-tight leading-none mb-1 sm:mb-2">Leaderboard</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[12px] sm:text-[14px] text-[#64748B] font-bold uppercase tracking-widest">{leaderboard.length} Candidates</p>
              </div>
            </div>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-16 sm:py-24 bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)]">
            <Medal className="w-12 h-12 sm:w-16 sm:h-16 text-[#CBD5E1] mx-auto mb-4 sm:mb-6 opacity-40" />
            <h3 className="text-lg sm:text-xl font-black text-[#0F172A] mb-2">No results yet</h3>
            <p className="text-[#64748B] font-medium text-sm sm:text-base">Results will appear here as candidates complete their tests.</p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-sm">
                <thead>
                  <tr className="bg-sky-50/60 border-b border-sky-100">
                    {['Rank', 'Candidate', 'BS', 'CM', 'NL', 'AR', 'MC', 'Total', 'Time'].map((h, idx) => (
                      <th key={h} className={`text-[10px] font-black text-[#94A3B8] uppercase tracking-widest px-3 sm:px-4 py-4 whitespace-nowrap ${idx === 0 ? 'text-center w-14 sticky left-0 bg-sky-50/60 z-10' : idx === 1 ? 'text-left min-w-[120px] sticky left-14 bg-sky-50/60 z-10' : idx >= 7 ? 'text-right' : 'text-center min-w-[60px]'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-50">
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
                      <tr key={s.username} className={`transition-all duration-300 hover:bg-sky-50/40 ${isMe ? 'bg-sky-50/30' : i % 2 === 0 ? 'bg-white' : 'bg-sky-50/10'}`}>
                        <td className="text-center px-3 py-4 sticky left-0 z-10" style={{ background: 'inherit' }}>
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-lg mx-auto ${rs.bg} ${rs.text} ${rs.shadow} ${i > 2 ? 'border border-[#E2E8F0]' : ''}`}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="px-3 py-4 sticky left-14 z-10" style={{ background: 'inherit' }}>
                          <span className="font-black text-[#0F172A] text-[14px] truncate block max-w-[120px]">{s.username}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            {isMe && <span className="text-[10px] bg-sky-500 text-white px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">You</span>}
                            <span className="text-[11px] text-[#94A3B8] font-bold">{s.gamesPlayed || 0} Games</span>
                          </div>
                        </td>
                        {[bubble, crossmath, numlink, aptirush, motion].map((gd, gi) => (
                          <td key={gi} className="text-center px-3 py-4">
                            {gd ? (
                              <div className="flex flex-col">
                                <span className="font-mono font-black text-[13px] text-[#0F172A] leading-none mb-1">{gd.score}</span>
                                <span className="text-[9px] text-emerald-500 font-black">{gd.correct}/{gd.total}</span>
                              </div>
                            ) : <span className="text-[#CBD5E1] text-[13px] font-black">—</span>}
                          </td>
                        ))}
                        <td className="text-right px-3 sm:px-4 py-4">
                          <span className="font-mono font-black text-[18px] sm:text-[20px] text-sky-500 tabular-nums"
                            style={{ textShadow: '0 0 20px rgba(56,189,248,0.1)' }}>{s.score}</span>
                        </td>
                        <td className="text-right px-3 sm:px-4 py-4">
                          <div className="flex items-center gap-1.5 justify-end">
                            <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                            <span className="font-mono text-[13px] sm:text-[14px] font-black text-[#0F172A]">{totalTime.toFixed(1)}s</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]"
        className="absolute -bottom-[100px] -left-[10%] w-[120%] z-0 pointer-events-none" animate={true} />
    </div>
  );
};

export default Leaderboard;