import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { ArrowLeft, Trophy, Medal, Clock } from 'lucide-react';

const Leaderboard = () => {
  const { getLeaderboard, currentStudent } = useGame();
  const navigate = useNavigate();
  const leaderboard = getLeaderboard();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-lg mx-auto animate-fade-in">
        <button
          onClick={() => navigate('/')}
          className="mb-10 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
            <Trophy className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
            <p className="text-xs text-muted-foreground">{leaderboard.length} completed</p>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-20">
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
                  className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                    i === 0
                      ? 'bg-accent/10 border border-accent/20'
                      : isCurrentUser
                        ? 'bg-secondary border border-accent/15'
                        : 'bg-card border border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                      i === 0 ? 'bg-accent text-accent-foreground' :
                      i === 1 ? 'bg-muted-foreground/20 text-foreground' :
                      i === 2 ? 'bg-muted text-muted-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {i + 1}
                    </span>
                    <div>
                      <span className="font-medium text-foreground">{s.username}</span>
                      {isCurrentUser && <span className="text-[10px] text-accent ml-2 font-semibold">(You)</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground text-xs">Lvl {s.level}</span>
                    <span className="font-mono font-bold text-foreground">{s.score}</span>
                    <div className="flex items-center gap-1 text-muted-foreground w-16 justify-end">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{timeTaken}s</span>
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
