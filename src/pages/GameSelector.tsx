import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { ArrowLeft, Brain, Grid3X3, Link, CheckCircle2, ChevronRight, Gamepad2 } from 'lucide-react';

const games = [
  {
    id: 'bubble', name: 'Bubble', route: '/game',
    description: 'Sort math expressions from lowest to highest value across 30 levels',
    icon: Brain, iconBg: 'icon-bg-purple', iconColor: 'text-accent',
    neonBorder: 'hover:border-accent/40',
    neonGlow: '0 0 22px hsl(258 76% 55% / 0.14)',
  },
  {
    id: 'crossmath', name: 'Cross Math', route: '/crossmath',
    description: '20 cross-math puzzles with increasing difficulty. Fill in the blanks!',
    icon: Grid3X3, iconBg: 'icon-bg-green', iconColor: 'text-emerald-700',
    neonBorder: 'hover:border-emerald-400/40',
    neonGlow: '0 0 22px hsl(158 68% 36% / 0.14)',
  },
  {
    id: 'numlink', name: 'NumLink', route: '/numlink',
    description: 'Connect numbers in order on a grid. Fill every cell!',
    icon: Link, iconBg: 'icon-bg-blue', iconColor: 'text-blue-500',
    neonBorder: 'hover:border-blue-400/40',
    neonGlow: '0 0 22px hsl(210 90% 60% / 0.14)',
  },
];

const GameSelector = () => {
  const navigate = useNavigate();
  const { currentStudent, currentTest, completedGames } = useGame();

  const numGames = currentTest?.numGames || 1;
  const playedGameIds = currentStudent?.gameHistory?.map(g => g.gameId) || [];

  useEffect(() => {
    if (!currentStudent || !currentTest) { navigate('/'); return; }
    if (currentTest.status === 'FINISHED') { navigate('/'); return; }
    if (playedGameIds.length >= numGames) navigate('/');
  }, [currentStudent, currentTest, playedGameIds, navigate, numGames]);

  if (!currentStudent || !currentTest || playedGameIds.length >= numGames) return null;

  const selectedGamesIds = currentTest?.selectedGames || ['bubble'];
  const availableGames = games
    .filter(g => selectedGamesIds.includes(g.id))
    .filter(g => numGames > 1 ? !playedGameIds.includes(g.id) : true);

  return (
    <div className="flex flex-col flex-1 w-full items-center justify-center p-4 min-h-[calc(100vh-[120px])] bg-[#F8F9FB]">
      <div className="relative w-full max-w-md">
        <button onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium group animate-fade-in">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />Back
        </button>

        <div className="animate-fade-in-up opacity-0" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-9 h-9 rounded-xl icon-bg-purple flex items-center justify-center glow-purple-sm">
              <Gamepad2 className="w-4.5 h-4.5 text-accent" style={{ width: 18, height: 18 }} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {numGames > 1 && playedGameIds.length > 0 ? 'Next Game' : 'Choose Your Game'}
            </h1>
          </div>
          <p className="text-muted-foreground text-sm mb-5 font-medium pl-12">
            {numGames > 1
              ? `Game ${playedGameIds.length + 1} of ${numGames} — ${currentStudent.username}`
              : `Select a game to begin, ${currentStudent.username}`}
          </p>
        </div>

        {/* Completed */}
        {playedGameIds.length > 0 && (
          <div className="mb-4 space-y-1.5 animate-fade-in">
            {playedGameIds.map(gId => {
              const game = games.find(g => g.id === gId);
              return (
                <div key={gId} className="flex items-center gap-2 text-xs text-emerald-700 font-semibold bg-emerald-50/80 border border-emerald-200/60 rounded-xl px-3.5 py-2.5 glow-green">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{game?.name || gId} — Completed</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Game cards */}
        <div className="space-y-3">
          {availableGames.map((game, i) => (
            <button key={game.id} onClick={() => navigate(game.route)}
              className={`w-full card-glass rounded-2xl p-4 sm:p-5 text-left group animate-fade-in-up opacity-0 transition-all duration-250 border ${game.neonBorder} hover:-translate-y-0.5`}
              style={{ animationDelay: `${0.1 + i * 0.08}s`, animationFillMode: 'forwards' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = game.neonGlow + ', 0 8px 24px hsl(258 30% 60% / 0.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${game.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                  <game.icon className={`w-5 h-5 ${game.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-foreground text-base sm:text-lg group-hover:text-accent transition-colors duration-200">{game.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2">{game.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-accent group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
              </div>
            </button>
          ))}
          {availableGames.length === 0 && (
            <div className="text-center p-6 text-muted-foreground font-medium card-glass rounded-2xl">All games completed! 🎉</div>
          )}
        </div>

        {/* PIN badge */}
        <div className="mt-5 card-glass rounded-xl p-3.5 animate-fade-in opacity-0"
          style={{ animationDelay: '0.35s', animationFillMode: 'forwards' }}>
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
