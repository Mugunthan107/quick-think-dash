import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { ArrowLeft, Trophy, Medal, Clock } from 'lucide-react';

const Leaderboard = () => {
  const { getLeaderboard, currentStudent, adminLoggedIn } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminLoggedIn) {
      navigate('/');
    }
  }, [adminLoggedIn, navigate]);

  const leaderboard = getLeaderboard();

  return (
    <div className="min-h-screen p-4 sm:p-6 relative z-10">
      <div className="max-w-3xl mx-auto animate-fade-in">
        <button
          onClick={() => navigate('/')}
          className="mb-8 sm:mb-10 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </button>

        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Leaderboard</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">{leaderboard.length} completed</p>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-white rounded-2xl border border-border shadow-sm">
            <Medal className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-semibold">No results yet</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Results appear after students finish the test</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border shadow-[0_4px_16px_hsl(260_40%_90%/0.5)] overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[2.5rem_1fr_4rem_4rem_4rem_5.5rem_4.5rem] gap-2 px-4 py-3 border-b border-border bg-secondary/50">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">#</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Name</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">MS</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">CM</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">NL</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Total</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Time</span>
            </div>

            {/* Data rows */}
            <div className="divide-y divide-border">
              {leaderboard.map((s, i) => {
                const isCurrentUser = currentStudent?.username === s.username;
                const totalTime = s.gameHistory?.reduce((acc, g) => acc + g.timeTaken, 0) || 0;

                const getGameData = (gameId: string) => {
                  const g = s.gameHistory?.find(h => h.gameId === gameId);
                  if (!g) return null;
                  return { score: g.score, correct: g.correctAnswers, total: g.totalQuestions };
                };

                const bubble = getGameData('bubble');
                const crossmath = getGameData('crossmath');
                const numlink = getGameData('numlink');

                return (
                  <div
                    key={s.username}
                    className={`grid grid-cols-[2.5rem_1fr_4rem_4rem_4rem_5.5rem_4.5rem] gap-2 px-4 py-3 items-center transition-colors
                      ${i === 0 ? 'bg-accent/6 hover:bg-accent/10' :
                        i === 1 ? 'bg-slate-50 hover:bg-slate-100/50' :
                          i === 2 ? 'bg-orange-50/40 hover:bg-orange-50' :
                            isCurrentUser ? 'bg-accent/4 hover:bg-accent/8' :
                              'hover:bg-secondary/50'
                      }`}
                  >
                    {/* Rank */}
                    <div className="flex justify-center">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-accent text-accent-foreground' :
                        i === 1 ? 'bg-slate-400 text-white' :
                          i === 2 ? 'bg-orange-400 text-white' :
                            'bg-secondary text-muted-foreground border border-border'
                        }`}>
                        {i + 1}
                      </span>
                    </div>

                    {/* Name */}
                    <div className="min-w-0">
                      <span className="font-semibold text-foreground text-sm truncate block">{s.username}</span>
                      <div className="flex items-center gap-1">
                        {isCurrentUser && <span className="text-[10px] text-accent font-bold">(You)</span>}
                        {s.gamesPlayed ? <span className="text-[10px] text-muted-foreground">{s.gamesPlayed} game{s.gamesPlayed !== 1 ? 's' : ''}</span> : null}
                      </div>
                    </div>

                    {/* Bubble (MS) */}
                    <div className="text-center">
                      {bubble ? (
                        <div>
                          <span className="font-mono font-bold text-sm text-foreground block">{bubble.score}</span>
                          <span className="text-[10px] text-success font-semibold">{bubble.correct}/{bubble.total}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/30 text-xs">—</span>
                      )}
                    </div>

                    {/* CrossMath (CM) */}
                    <div className="text-center">
                      {crossmath ? (
                        <div>
                          <span className="font-mono font-bold text-sm text-foreground block">{crossmath.score}</span>
                          <span className="text-[10px] text-success font-semibold">{crossmath.correct}/{crossmath.total}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/30 text-xs">—</span>
                      )}
                    </div>

                    {/* NumLink (NL) */}
                    <div className="text-center">
                      {numlink ? (
                        <div>
                          <span className="font-mono font-bold text-sm text-foreground block">{numlink.score}</span>
                          <span className="text-[10px] text-success font-semibold">{numlink.correct}/{numlink.total}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/30 text-xs">—</span>
                      )}
                    </div>

                    {/* Total Score */}
                    <div className="text-right">
                      <span className="font-mono font-bold text-base sm:text-lg text-accent">{s.score}</span>
                    </div>

                    {/* Total Time */}
                    <div className="text-right flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground/50 shrink-0" />
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
