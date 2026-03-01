import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { ArrowLeft, Trophy, Medal, Clock } from 'lucide-react';

const Leaderboard = () => {
  const { getLeaderboard, currentStudent, adminLoggedIn } = useGame();
  const navigate = useNavigate();

  useEffect(() => { if (!adminLoggedIn) navigate('/'); }, [adminLoggedIn, navigate]);

  const leaderboard = getLeaderboard();

  const rankStyle = (i: number) => {
    if (i === 0) return { bg: 'bg-[#F59E0B]', text: 'text-white', shadow: 'shadow-[#F59E0B]/30' };
    if (i === 1) return { bg: 'bg-slate-400', text: 'text-white', shadow: '' };
    if (i === 2) return { bg: 'bg-orange-400', text: 'text-white', shadow: '' };
    return { bg: 'bg-[#F1F3F9]', text: 'text-[#9CA3AF]', shadow: '' };
  };

  const rowBg = (i: number, isMe: boolean) => {
    if (isMe) return 'bg-[#6D4AFE]/5 hover:bg-[#6D4AFE]/8';
    return 'hover:bg-slate-50/80';
  };

  return (
    <div className="flex flex-col flex-1 w-full bg-[#F8F9FB] min-h-screen">
      <div className="max-container py-12">

        <button onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-[#9CA3AF] hover:text-[#111827] transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />Back to Platform
        </button>

        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-[#F59E0B]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">Session Leaderboard</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse" />
              <p className="text-xs text-[#9CA3AF] font-medium">{leaderboard.length} candidates synchronized</p>
            </div>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#E6E1FF]/40 rounded-2xl">
            <Medal className="w-12 h-12 text-[#9CA3AF]/20 mx-auto mb-4" />
            <p className="text-[#4B5563] font-semibold">Assessment results pending</p>
            <p className="text-sm text-[#9CA3AF] mt-1">Standings will populate as candidates complete the evaluation.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#E6E1FF]/40 shadow-sm rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[3.5rem_1fr_4rem_4rem_4rem_5.5rem_5rem] gap-2 px-6 py-4 border-b border-[#E6E1FF]/40 bg-[#EDE9FE]/20">
              {['Rank', 'Candidate', 'BS', 'CM', 'NL', 'Total', 'Time'].map((h, idx) => (
                <span key={h} className={`text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider ${idx === 0 ? 'text-center' : idx >= 5 ? 'text-right' : ''}`}>{h}</span>
              ))}
            </div>

            {/* Rows */}
            <div className="divide-y divide-border/50">
              {leaderboard.map((s, i) => {
                const isMe = currentStudent?.username === s.username;
                const totalTime = s.gameHistory?.reduce((acc, g) => acc + g.timeTaken, 0) || 0;
                const getGame = (id: string) => {
                  const g = s.gameHistory?.find(h => h.gameId === id);
                  return g ? { score: g.score, correct: g.correctAnswers, total: g.totalQuestions } : null;
                };
                const bubble = getGame('bubble'), crossmath = getGame('crossmath'), numlink = getGame('numlink');
                const rs = rankStyle(i);

                return (
                  <div key={s.username}
                    className={`grid grid-cols-[2.5rem_1fr_4rem_4rem_4rem_5.5rem_4.5rem] gap-2 px-4 py-3 items-center transition-all duration-150 ${rowBg(i, isMe)}`}>
                    {/* Rank */}
                    <div className="flex justify-center">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm ${rs.bg} ${rs.text} ${rs.shadow}`}>
                        {i + 1}
                      </span>
                    </div>
                    {/* Name */}
                    <div className="min-w-0">
                      <span className="font-semibold text-foreground text-sm truncate block">{s.username}</span>
                      <div className="flex items-center gap-1">
                        {isMe && <span className="text-[10px] text-accent font-bold">(You)</span>}
                        {s.gamesPlayed ? <span className="text-[10px] text-muted-foreground">{s.gamesPlayed} game{s.gamesPlayed !== 1 ? 's' : ''}</span> : null}
                      </div>
                    </div>
                    {/* Game scores */}
                    {[bubble, crossmath, numlink].map((gd, gi) => (
                      <div key={gi} className="text-center">
                        {gd ? <div><span className="font-mono font-bold text-sm text-[#111827] block">{gd.score}</span>
                          <span className="text-[10px] text-[#14B8A6] font-semibold">{gd.correct}/{gd.total}</span></div>
                          : <span className="text-[#9CA3AF]/30 text-xs">—</span>}
                      </div>
                    ))}
                    {/* Total */}
                    <div className="text-right">
                      <span className="font-mono font-bold text-base sm:text-lg text-[#F59E0B]"
                        style={{ textShadow: '0 0 14px rgba(245,158,11,0.25)' }}>{s.score}</span>
                    </div>
                    {/* Time */}
                    <div className="text-right flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                      <span className="font-mono text-xs text-muted-foreground">{totalTime.toFixed(1)}s</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
