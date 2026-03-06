import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Brain, Grid3X3, Link, CheckCircle2, ChevronRight, Gamepad2, Move, Zap, Hash, FlipHorizontal, Droplets, LayoutGrid, Palette } from 'lucide-react';
import DecorativeCurve from '@/components/DecorativeCurve';

const games = [
  {
    id: 'bubble', name: 'Bubble Sort', route: '/game',
    description: 'Sort math expressions from lowest to highest value across 30 levels',
    icon: Brain,
  },
  {
    id: 'crossmath', name: 'Cross Math', route: '/crossmath',
    description: '20 cross-math puzzles with increasing difficulty. Fill in the blanks!',
    icon: Grid3X3,
  },
  {
    id: 'numlink', name: 'NumLink', route: '/numlink',
    description: 'Connect numbers in order on a grid. Fill every cell!',
    icon: Link,
  },
  {
    id: 'motion', name: 'Motion Challenge', route: '/motion-challenge',
    description: 'Place the green ball into the black hole in as few moves as possible!',
    icon: Move,
  },
  {
    id: 'aptirush', name: 'AptiRush', route: '/aptirush',
    description: '20 Levels. Pure Logic. Zero Repetition. Think Fast. Win Smart.',
    icon: Zap,
  },
  {
    id: 'numberseries', name: 'Number Series', route: '/number-series',
    description: 'Catch the correct next number in a falling series pattern.',
    icon: Hash,
  },
  {
    id: 'mirror', name: 'Mirror Image', route: '/mirror-image',
    description: 'Identify the correct mirror reflection of text and numbers.',
    icon: FlipHorizontal,
  },
  {
    id: 'waterimage', name: 'Water Image', route: '/water-image',
    description: 'Find the correct water reflection of the given text.',
    icon: Droplets,
  },
  {
    id: 'numpuzzle', name: 'Number Puzzle', route: '/number-puzzle',
    description: 'Solve 4×4 grid puzzles by finding the missing number.',
    icon: LayoutGrid,
  },
  {
    id: 'colorsort', name: 'Color Sort', route: '/color-sort',
    description: 'Sort colored liquids in test tubes using strategic moves.',
    icon: Palette,
  },
];

const GameSelector = () => {
  const navigate = useNavigate();
  const { currentStudent, currentTest, completedGames } = useGame();

  const numGames = currentTest?.numGames || 1;
  const playedGameIds = currentStudent?.gameHistory?.map(g => g.gameId) || [];

  useEffect(() => {
    if (!currentStudent || !currentTest) return; // Wait for context
    if (currentTest.status === 'FINISHED') { navigate('/'); return; }

    // Only redirect if ALL games are actually recorded in history
    if (playedGameIds.length >= numGames && numGames > 0) {
      navigate('/');
    }
  }, [currentStudent, currentTest, playedGameIds.length, navigate, numGames]);

  if (!currentStudent || !currentTest || playedGameIds.length >= numGames) return null;

  const selectedGamesIds = currentTest?.selectedGames || ['bubble'];
  const availableGames = games
    .filter(g => selectedGamesIds.includes(g.id))
    .filter(g => numGames > 1 ? !playedGameIds.includes(g.id) : true);

  return (
    <div className="flex flex-col flex-1 w-full bg-[#F0F7FF] font-sans min-h-screen relative overflow-y-auto overflow-x-hidden">

      {/* Top-right badge: Test PIN + Progress */}
      <div className="fixed top-4 right-4 z-50 animate-fade-in">
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xl border border-sky-100 rounded-full px-4 py-2 shadow-[0_4px_20px_rgba(56,189,248,0.12)]">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8]">PIN</span>
            <span className="font-mono font-bold text-sky-500 text-[13px] tracking-wider">{currentTest.pin}</span>
          </div>
          <span className="w-px h-4 bg-sky-100" />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8]">Progress</span>
            <span className="font-bold text-[#0F172A] text-[13px]">{completedGames.length}/{numGames}</span>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#E0F2FE_0%,_#F0F9FF_40%,_#FFFFFF_100%)]" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#38BDF8] opacity-[0.04] blur-[120px] rounded-full" />
      </div>

      {/* Decorative Waves Wrapper - Fixed to viewport */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top Decorative Wave - Tertiary (Deepest) */}
        <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -top-[80px] sm:-top-[120px] left-[-10%] w-[120%] rotate-180 scale-x-[1.1] translate-x-4 mix-blend-multiply" animate={true} />
        {/* Top Decorative Wave - Secondary */}
        <DecorativeCurve opacity={0.06} height="h-[350px] sm:h-[480px]" className="absolute -top-[50px] sm:-top-[80px] left-[-5%] w-[110%] rotate-180 scale-x-[1.05]" animate={true} />
        {/* Top Decorative Wave - Primary */}
        <DecorativeCurve opacity={0.12} height="h-[250px] sm:h-[360px]" className="absolute top-0 left-0 rotate-180 transition-all duration-700" animate={true} />

        {/* Bottom Decorative Wave - Tertiary */}
        <DecorativeCurve opacity={0.05} height="h-[400px] sm:h-[550px]" className="absolute -bottom-[80px] sm:-bottom-[120px] left-[-10%] w-[120%] scale-x-[1.1] -translate-x-4 mix-blend-multiply" animate={true} />
        {/* Bottom Decorative Wave - Secondary */}
        <DecorativeCurve opacity={0.07} height="h-[350px] sm:h-[480px]" className="absolute -bottom-[50px] sm:-bottom-[80px] left-[-5%] w-[110%] scale-x-[1.05]" animate={true} />
        {/* Bottom Decorative Wave - Primary */}
        <DecorativeCurve opacity={0.12} height="h-[250px] sm:h-[360px]" className="absolute bottom-0 left-0 transition-all duration-700" animate={true} />
      </div>

      <div className="flex flex-col items-center justify-start p-4 pt-12 sm:pt-16 pb-4 relative z-10 w-full min-h-full">
        <div className="relative w-full max-w-[480px] space-y-6 flex flex-col items-center">
          <div className="animate-fade-in-up px-2 text-center">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center shrink-0">
                <Gamepad2 className="w-6 h-6 text-sky-500" />
              </div>
              <div className="space-y-2">
                <h1 className="text-[32px] sm:text-[38px] font-black text-[#0F172A] tracking-tight leading-none">
                  {numGames > 1 && playedGameIds.length > 0 ? 'Next Game' : 'Choose Game'}
                </h1>
                <p className="text-[14px] sm:text-[15px] text-[#64748B] font-medium leading-relaxed max-w-[320px] mx-auto">
                  {numGames > 1
                    ? `Game ${playedGameIds.length + 1} of ${numGames} — ${currentStudent.username}`
                    : `Select a game to begin, ${currentStudent.username}`}
                </p>
              </div>
            </div>
          </div>

          {playedGameIds.length > 0 && (
            <div className="mb-6 space-y-2 animate-fade-in px-2">
              {playedGameIds.map(gId => {
                const game = games.find(g => g.id === gId);
                return (
                  <div key={gId} className="flex items-center gap-3 text-[13px] text-emerald-600 font-bold bg-emerald-50/50 border border-emerald-100 rounded-[14px] px-4 py-3">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{game?.name || gId} — Completed</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-4 px-2">
            {availableGames.map((game, i) => (
              <button key={game.id} onClick={() => navigate(game.route)}
                className="w-full bg-white/90 backdrop-blur-xl border border-sky-100 rounded-[20px] p-5 sm:p-6 text-left group animate-fade-in-up opacity-0 transition-all duration-300 hover:border-sky-300 hover:-translate-y-1 shadow-[0_8px_30px_rgba(56,189,248,0.06)] hover:shadow-[0_20px_40px_rgba(56,189,248,0.12)]"
                style={{ animationDelay: `${0.1 + i * 0.08}s`, animationFillMode: 'forwards' }}
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-sky-50 border border-sky-100 transition-transform duration-300 group-hover:scale-110">
                    <game.icon className="w-6 h-6 text-sky-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-[#0F172A] text-lg sm:text-xl group-hover:text-sky-500 transition-colors duration-200">{game.name}</h3>
                    <p className="text-[14px] text-[#64748B] mt-0.5 line-clamp-2 font-medium leading-tight">{game.description}</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-[#94A3B8]/30 group-hover:text-sky-500 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                </div>
              </button>
            ))}
            {availableGames.length === 0 && (
              <div className="text-center p-8 text-[#64748B] font-bold bg-white/90 backdrop-blur-xl border border-sky-100 rounded-[20px] shadow-[0_8px_30px_rgba(56,189,248,0.06)]">All games completed! 🎉</div>
            )}
          </div>

          {/* 140px spacer so the page scrolls past the last card */}
          <div style={{ height: '140px', flexShrink: 0 }} />
        </div>
      </div>

    </div>
  );
};

export default GameSelector;
