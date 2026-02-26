import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { ArrowLeft, Brain, Grid3X3, Link, CheckCircle2 } from 'lucide-react';

const GameSelector = () => {
  const navigate = useNavigate();
  const { currentStudent, currentTest, completedGames } = useGame();

  const games = [
    {
      id: 'bubble',
      name: 'Mind Sprint',
      description: 'Sort math expressions from lowest to highest value across 30 levels',
      icon: Brain,
      route: '/game',
      color: 'bg-accent/15 text-accent',
    },
    {
      id: 'crossmath',
      name: 'Cross Math',
      description: '20 cross-math puzzles with increasing difficulty. Fill in the blanks!',
      icon: Grid3X3,
      route: '/crossmath',
      color: 'bg-success/15 text-success',
    },
    {
      id: 'numlink',
      name: 'NumLink',
      description: 'Connect numbers in order on a grid. Fill every cell with one continuous path!',
      icon: Link,
      route: '/numlink',
      color: 'bg-primary/15 text-primary',
    },
  ];

  const numGames = currentTest?.numGames || 1;
  const playedGameIds = currentStudent?.gameHistory?.map(g => g.gameId) || [];

  useEffect(() => {
    if (!currentStudent || !currentTest) {
      navigate('/');
    } else if (playedGameIds.length >= numGames) {
      navigate('/');
    }
  }, [currentStudent, currentTest, playedGameIds, navigate, numGames]);

  if (!currentStudent || !currentTest || playedGameIds.length >= numGames) {
    return null;
  }

  // Filter available games based on test settings and progress
  const selectedGamesIds = currentTest?.selectedGames || ['bubble'];
  const availableGames = games
    .filter(g => selectedGamesIds.includes(g.id))
    .filter(g => numGames > 1 ? !playedGameIds.includes(g.id) : true);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md animate-fade-in">
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          {numGames > 1 && playedGameIds.length > 0 ? 'Next Game' : 'Choose Your Game'}
        </h1>
        <p className="text-muted-foreground text-sm mb-2">
          {numGames > 1
            ? `Game ${playedGameIds.length + 1} of ${numGames} — ${currentStudent.username}`
            : `Select a game to begin, ${currentStudent.username}`
          }
        </p>

        {/* Show completed games */}
        {playedGameIds.length > 0 && (
          <div className="mb-4 space-y-1">
            {playedGameIds.map(gId => {
              const game = games.find(g => g.id === gId);
              return (
                <div key={gId} className="flex items-center gap-2 text-xs text-success">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{game?.name || gId} — Completed</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-3">
          {availableGames.map(game => (
            <button
              key={game.id}
              onClick={() => navigate(game.route)}
              className="w-full bg-card/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-border hover:border-accent/50 transition-all hover:scale-[1.02] active:scale-[0.98] text-left group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${game.color}`}>
                  <game.icon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground text-base sm:text-lg group-hover:text-accent transition-colors">
                    {game.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{game.description}</p>
                </div>
              </div>
            </button>
          ))}
          {availableGames.length === 0 && (
            <div className="text-center p-4 text-muted-foreground">
              All games completed!
            </div>
          )}
        </div>

        <div className="mt-6 bg-secondary/50 rounded-xl p-3 border border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Test PIN: <span className="font-mono font-bold text-accent">{currentTest.pin}</span></span>
            <span>Games: <span className="font-semibold text-foreground">{completedGames.length}/{numGames}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSelector;
