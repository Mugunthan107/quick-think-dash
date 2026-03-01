import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { ArrowLeft, Brain, Grid3X3, Link, CheckCircle2, ChevronRight } from 'lucide-react';

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
      gradient: 'from-accent/10 to-accent/5',
      iconBg: 'bg-accent/10 text-accent',
    },
    {
      id: 'crossmath',
      name: 'Cross Math',
      description: '20 cross-math puzzles with increasing difficulty. Fill in the blanks!',
      icon: Grid3X3,
      route: '/crossmath',
      gradient: 'from-success/10 to-success/5',
      iconBg: 'bg-success/10 text-success',
    },
    {
      id: 'numlink',
      name: 'NumLink',
      description: 'Connect numbers in order on a grid. Fill every cell with one continuous path!',
      icon: Link,
      route: '/numlink',
      gradient: 'from-primary/10 to-primary/5',
      iconBg: 'bg-primary/10 text-primary',
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

  const selectedGamesIds = currentTest?.selectedGames || ['bubble'];
  const availableGames = games
    .filter(g => selectedGamesIds.includes(g.id))
    .filter(g => numGames > 1 ? !playedGameIds.includes(g.id) : true);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative z-10 bg-background">
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.012]"
        style={{
          backgroundImage: 'radial-gradient(hsl(255 72% 56%) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium group animate-fade-in"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Back
        </button>

        <div className="animate-fade-in-up opacity-0" style={{ animationFillMode: 'forwards' }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {numGames > 1 && playedGameIds.length > 0 ? 'Next Game' : 'Choose Your Game'}
          </h1>
          <p className="text-muted-foreground text-sm mb-3 font-medium">
            {numGames > 1
              ? `Game ${playedGameIds.length + 1} of ${numGames} — ${currentStudent.username}`
              : `Select a game to begin, ${currentStudent.username}`
            }
          </p>
        </div>

        {playedGameIds.length > 0 && (
          <div className="mb-5 space-y-1.5 animate-fade-in">
            {playedGameIds.map(gId => {
              const game = games.find(g => g.id === gId);
              return (
                <div key={gId} className="flex items-center gap-2 text-xs text-success font-semibold bg-success/5 border border-success/10 rounded-lg px-3 py-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{game?.name || gId} — Completed</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-3">
          {availableGames.map((game, i) => (
            <button
              key={game.id}
              onClick={() => navigate(game.route)}
              className="w-full bg-card rounded-2xl p-4 sm:p-5 border border-border card-interactive text-left group animate-fade-in-up opacity-0"
              style={{ animationDelay: `${0.1 + i * 0.08}s`, animationFillMode: 'forwards' }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${game.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                  <game.icon className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-foreground text-base sm:text-lg group-hover:text-accent transition-colors duration-200">
                    {game.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2">{game.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-accent group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
              </div>
            </button>
          ))}
          {availableGames.length === 0 && (
            <div className="text-center p-6 text-muted-foreground font-medium bg-card rounded-2xl border border-border">
              All games completed! 🎉
            </div>
          )}
        </div>

        <div className="mt-6 bg-card rounded-xl p-3.5 border border-border card-elevated animate-fade-in opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Test PIN: <span className="font-mono font-bold text-accent">{currentTest.pin}</span></span>
            <span>Games: <span className="font-semibold text-foreground">{completedGames.length}/{numGames}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSelector;
