import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { ArrowLeft, Trophy, Medal, Clock } from 'lucide-react';

const Leaderboard = () => {
  const { getLeaderboard, currentStudent } = useGame();
  const navigate = useNavigate();
  const leaderboard = getLeaderboard();

  return (
    <div className="min-h-screen p-4 sm:p-6 relative z-10">
      <div className="max-w-lg mx-auto animate-fade-in">
        <button
          onClick={() => navigate('/')}
          className="mb-8 sm:mb-10 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </button>

        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent flex items-center justify-center">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Leaderboard</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{leaderboard.length} completed</p>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <Medal className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No results yet</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Results appear after students finish the test</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((s, i) => {
              const timeTaken = s.completedAt ? ((s.completedAt - s.startedAt) / 1000).toFixed(1) : '-';
              const isCurrentUser = currentStudent?.username === s.username;
              return (
                <div
                  key={s.username}
                  className={`flex items-center justify-between p-3 sm:p-4 rounded-xl transition-all bg-card/80 backdrop-blur-sm ${i === 0
                    ? 'border border-accent/20'
                    : isCurrentUser
                      ? 'border border-accent/15'
                      : 'border border-border'
                    }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 ${i === 0 ? 'bg-accent text-accent-foreground' :
                      i === 1 ? 'bg-muted-foreground/20 text-foreground' :
                        i === 2 ? 'bg-muted text-muted-foreground' :
                          'bg-muted text-muted-foreground'
                      }`}>
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="font-medium text-foreground text-sm truncate block">{s.username}</span>
                      {isCurrentUser && <span className="text-[10px] text-accent font-semibold">(You)</span>}
                      {s.gamesPlayed ? <span className="text-[10px] text-muted-foreground">{s.gamesPlayed} games</span> : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm shrink-0">
                    <div className="text-right">
                      <span className="font-mono font-bold text-foreground block">{s.score}</span>
                      <span className="text-[9px] text-muted-foreground uppercase">Avg</span>
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground w-12 sm:w-16 justify-end">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] sm:text-xs">
                        {s.gameHistory
                          ? s.gameHistory.reduce((acc, g) => acc + g.timeTaken, 0).toFixed(1)
                          : timeTaken}s
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
