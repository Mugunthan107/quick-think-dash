import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { ArrowLeft, Trophy } from 'lucide-react';

const Leaderboard = () => {
  const { getLeaderboard, currentStudent } = useGame();
  const navigate = useNavigate();
  const leaderboard = getLeaderboard();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-lg mx-auto animate-fade-in">
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
            <Trophy className="w-5 h-5 text-accent-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No completed results yet</p>
            <p className="text-sm text-muted-foreground mt-1">Results appear here after students finish</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((s, i) => {
              const timeTaken = s.completedAt ? ((s.completedAt - s.startedAt) / 1000).toFixed(1) : '-';
              const isCurrentUser = currentStudent?.username === s.username;
              return (
                <div
                  key={s.username}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                    i === 0
                      ? 'bg-accent/10 border border-accent/30'
                      : isCurrentUser
                        ? 'bg-secondary border border-accent/20'
                        : 'bg-card border border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i === 0 ? 'bg-accent text-accent-foreground' :
                      i === 1 ? 'bg-muted-foreground/30 text-foreground' :
                      i === 2 ? 'bg-muted text-muted-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {i + 1}
                    </span>
                    <div>
                      <span className="font-medium text-foreground">{s.username}</span>
                      {isCurrentUser && <span className="text-xs text-accent ml-2">(You)</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">Lvl {s.level}</span>
                    <span className="font-mono font-bold text-foreground">{s.score}</span>
                    <span className="text-muted-foreground w-16 text-right">{timeTaken}s</span>
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
