import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Brain, Grid3X3, Link, CheckCircle2, ChevronRight, Gamepad2, Move, Zap, Hash, FlipHorizontal, Droplets, LayoutGrid, Palette } from 'lucide-react';
import DecorativeCurve from '@/components/DecorativeCurve';
import GameWheel from '@/components/GameWheel';
import FunModeToggle from '@/components/FunModeToggle';
import { useFun } from '@/context/FunContext';
const games = [
  {
    id: 'bubble', name: 'Bubble Sort', route: '/game',
    description: 'Sort math expressions from lowest to highest value across 30 levels',
    icon: Brain,
    instructions: [
      "Evaluate the mathematical expression in each bubble.",
      "Pop bubbles in order from SMALLEST to LARGEST value.",
      "Speed matters! Finish quickly for a better rank."
    ]
  },
  {
    id: 'crossmath', name: 'Cross Math', route: '/crossmath',
    description: '20 cross-math puzzles with increasing difficulty. Fill in the blanks!',
    icon: Grid3X3,
    instructions: [
      "Fill in the empty boxes to solve the horizontal and vertical equations.",
      "Use the available numbers provided at the bottom.",
      "Ensure every equation is mathematically correct."
    ]
  },
  {
    id: 'numlink', name: 'NumLink', route: '/numlink',
    description: 'Connect numbers in order on a grid. Fill every cell!',
    icon: Link,
    instructions: [
      "Start from number 1 and trace a path through the numbers in sequence.",
      "You MUST pass through every single empty box on the grid.",
      "Lines cannot cross or overlap."
    ]
  },
  {
    id: 'motion', name: 'Motion Challenge', route: '/motion-challenge',
    description: 'Place the green ball into the black hole in as few moves as possible!',
    icon: Move,
    instructions: [
      "Navigate the green ball into the black hole.",
      "Use arrow keys or click to move in straight lines.",
      "Efficiency is key! Use the fewest moves possible."
    ]
  },
  {
    id: 'aptirush', name: 'AptiRush', route: '/aptirush',
    description: '20 Levels. Pure Logic. Zero Repetition. Think Fast. Win Smart.',
    icon: Zap,
    instructions: [
      "Identify patterns and solve logical challenges across 20 levels.",
      "Maintain your focus as the puzzles evolve dynamically.",
      "Your speed and accuracy determine your final standing."
    ]
  },
  {
    id: 'numberseries', name: 'Number Series', route: '/number-series',
    description: 'Catch the correct next number in a falling series pattern.',
    icon: Hash,
    instructions: [
      "Analyze the sequence shown at the top to find the next number.",
      "Click/Tap the falling number that correctly completes the series.",
      "If a correct number hits the bottom, you lose a life."
    ]
  },
  {
    id: 'mirror', name: 'Mirror Image', route: '/mirror-image',
    description: 'Identify the correct mirror reflection of text and numbers.',
    icon: FlipHorizontal,
    instructions: [
      "Observe the reference image/text provided.",
      "Choose the option that represents its perfect MIRROR reflection.",
      "Common letters and numbers might be rotated—look closely!"
    ]
  },
  {
    id: 'waterimage', name: 'Water Image', route: '/water-image',
    description: 'Find the correct water reflection of the given text.',
    icon: Droplets,
    instructions: [
      "Observe the target text provided.",
      "Identify the option that shows the correct WATER (vertical) reflection.",
      "The top of the original becomes the bottom of the reflection."
    ]
  },
  {
    id: 'numpuzzle', name: 'Number Puzzle', route: '/number-puzzle',
    description: 'Solve 4×4 grid puzzles by finding the missing number.',
    icon: LayoutGrid,
    instructions: [
      "Determine the logical relationship between the numbers in the grid.",
      "Calculate the value for the box marked with a question mark.",
      "Accuracy is more important than speed here."
    ]
  },
  {
    id: 'colorsort', name: 'Color Sort', route: '/color-sort',
    description: 'Sort colored liquids in test tubes using strategic moves.',
    icon: Palette,
    instructions: [
      "Group identical colors into the same test tubes.",
      "You can only pour color into an empty tube or onto a matching color.",
      "Plan your moves carefully to solve the puzzle efficiently."
    ]
  },
];

const GameSelector = () => {
  const navigate = useNavigate();
  const { currentStudent, currentTest, completedGames } = useGame();
  const { funMode } = useFun();
  const [showWheel, setShowWheel] = useState(false);
  const [selectedGameForInfo, setSelectedGameForInfo] = useState<typeof games[0] | null>(null);
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
    <div className={`flex flex-col flex-1 w-full bg-transparent font-sans ${funMode ? 'h-screen overflow-hidden' : 'min-h-screen overflow-y-auto'} relative overflow-x-hidden`}>

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
        <div className="absolute inset-0 bg-transparent" />
      </div>

      {/* Decorative Waves Wrapper - Fixed to viewport */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-transparent" />
      </div>

      <div className={`flex flex-col items-center ${funMode ? 'justify-center' : 'justify-start'} p-4 ${funMode ? 'pt-12 pb-4' : 'pt-20 sm:pt-28 pb-16'} relative z-10 w-full h-full`}>
        <div className="relative w-full max-w-[480px] space-y-6 flex flex-col items-center">
          {!funMode && (
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
          )}

          {!funMode && playedGameIds.length > 0 && (
            <div className="mb-6 space-y-2 animate-fade-in px-2 w-full">
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



          {funMode ? (
            <div className="w-full flex flex-col items-center animate-fade-in py-2">
              <div className="bg-white/90 backdrop-blur-2xl border border-sky-100 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_25px_60px_-15px_rgba(56,189,248,0.15)] w-full max-w-[420px]">
                <GameWheel
                  availableGameIds={availableGames.map(g => g.id)}
                  isInline={true}
                  onGameSelected={(id) => {
                    const game = games.find(g => g.id === id);
                    if (game) setSelectedGameForInfo(game);
                  }}
                />
                <div className="mt-4 pt-4 border-t border-sky-50 flex flex-col items-center">
                  <p className="text-[10px] font-black text-sky-400 uppercase tracking-[0.2em] text-center">Random Selection Required</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 px-2 w-full">
              {availableGames.map((game, i) => (
                <button key={game.id} onClick={() => setSelectedGameForInfo(game)}
                  className="w-full bg-white/90 backdrop-blur-xl border border-sky-100 rounded-[20px] p-5 sm:p-6 text-left group animate-fade-in-up opacity-0 transition-all duration-300 hover:border-sky-300 hover:-translate-y-1 shadow-[0_8px_30px_rgba(56,189,248,0.06)] hover:shadow-[0_20px_40px_rgba(56,189,248,0.12)]"
                  style={{ animationDelay: `${0.1 + i * 0.08}s`, animationFillMode: 'forwards' }}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-sky-50 border border-sky-100 transition-transform duration-300 group-hover:scale-110">
                      <game.icon className="w-6 h-6 text-sky-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-foreground text-lg sm:text-xl group-hover:text-sky-500 transition-colors duration-200">{game.name}</h3>
                      <p className="text-[14px] text-muted-foreground mt-0.5 line-clamp-2 font-medium leading-tight">{game.description}</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-muted-foreground/30 group-hover:text-sky-500 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                  </div>
                </button>
              ))}
              {availableGames.length === 0 && (
                <div className="text-center p-8 text-muted-foreground font-bold bg-white/90 backdrop-blur-xl border border-sky-100 rounded-[20px] shadow-[0_8px_30px_rgba(56,189,248,0.06)]">All games completed! 🎉</div>
              )}
            </div>
          )}

          {showWheel && (
            <GameWheel
              availableGameIds={availableGames.map(g => g.id)}
              onClose={() => setShowWheel(false)}
              onGameSelected={(id) => {
                const game = games.find(g => g.id === id);
                if (game) {
                  setShowWheel(false);
                  setSelectedGameForInfo(game);
                }
              }}
            />
          )}

          {/* New Instruction Modal */}
          {selectedGameForInfo && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-10 max-w-[420px] w-full relative animate-in zoom-in-95 duration-300">
                <button
                  onClick={() => setSelectedGameForInfo(null)}
                  className="absolute top-6 right-6 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
                >
                  ✕
                </button>

                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-20 h-20 rounded-[2rem] bg-sky-50 border border-sky-100 flex items-center justify-center shadow-inner">
                    <selectedGameForInfo.icon className="w-10 h-10 text-sky-500" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">{selectedGameForInfo.name}</h2>
                    <p className="text-[14px] text-[#64748B] font-medium px-4">{selectedGameForInfo.description}</p>
                  </div>

                  <div className="w-full bg-[#F8FAFC] rounded-[2rem] p-6 text-left border border-[#E2E8F0]">
                    <h3 className="text-[12px] font-black text-sky-500 uppercase tracking-widest mb-4">How to Play</h3>
                    <ul className="space-y-3">
                      {selectedGameForInfo.instructions?.map((instruction, idx) => (
                        <li key={idx} className="flex gap-3 text-[13px] text-[#334155] font-semibold leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => navigate(selectedGameForInfo.route)}
                    className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black rounded-2xl h-14 shadow-lg shadow-blue-500/20 transition-all text-base hover:-translate-y-1 active:scale-95"
                  >
                    Start Game →
                  </button>
                </div>
              </div>
            </div>
          )}

          {!funMode && <div style={{ height: '140px', flexShrink: 0 }} />}
        </div>
      </div>

    </div>
  );
};

export default GameSelector;
