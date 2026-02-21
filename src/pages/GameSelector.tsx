import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { ArrowLeft, Brain, Grid3X3 } from 'lucide-react';

const GameSelector = () => {
  const navigate = useNavigate();
  const { currentStudent, currentTest } = useGame();

  if (!currentStudent || !currentTest) {
    navigate('/');
    return null;
  }

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
  ];

  // Filter out games already played
  const playedGameIds = currentStudent.gameHistory?.map(g => g.gameId) || [];
  const availableGames = games.filter(g => !playedGameIds.includes(g.id));

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

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Choose Your Game</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Game {playedGameIds.length + 1} of {currentTest.numGames}
        </p>

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
            <span>Status: <span className="font-semibold text-success">{currentTest.status}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSelector;
