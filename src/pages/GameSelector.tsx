import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { ArrowLeft, Brain, Grid3X3, Link, CheckCircle2, ChevronRight, Gamepad2 } from 'lucide-react';
import DecorativeCurve from '@/components/DecorativeCurve';

const games = [
  {
    id: 'bubble', name: 'Bubble', route: '/game',
    description: 'Sort math expressions from lowest to highest value across 30 levels',
    icon: Brain, iconBg: 'bg-[#2563EB]/5', iconColor: 'text-[#2563EB]',
    neonBorder: 'hover:border-[#2563EB]/30',
    neonGlow: '0 8px 30px rgba(37,99,235,0.06)',
  },
  {
    id: 'crossmath', name: 'Cross Math', route: '/crossmath',
    description: '20 cross-math puzzles with increasing difficulty. Fill in the blanks!',
    icon: Grid3X3, iconBg: 'bg-emerald-500/5', iconColor: 'text-emerald-600',
    neonBorder: 'hover:border-emerald-500/30',
    neonGlow: '0 8px 30px rgba(16,185,129,0.06)',
  },
  {
    id: 'numlink', name: 'NumLink', route: '/numlink',
    description: 'Connect numbers in order on a grid. Fill every cell!',
    icon: Link, iconBg: 'bg-blue-400/5', iconColor: 'text-blue-500',
    neonBorder: 'hover:border-blue-400/30',
    neonGlow: '0 8px 30px rgba(96,165,250,0.06)',
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
    <div className="flex flex-col flex-1 w-full bg-[#FDFDFF] font-sans selection:bg-indigo-100 min-h-screen relative overflow-hidden">
      {/* Layer 1: Premium Background Depth */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Soft Multi-Gradient Base */}
        <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#F5F3FF_0%,_#ECFEFF_40%,_#FFFFFF_100%)]" />

        {/* Very Faint Radial Glow behind Hero */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#6C63FF] opacity-[0.03] blur-[120px] rounded-full" />
      </div>

      {/* === TOP WAVES (MATCHING LANDING) === */}
      {/* Top Wave - Tertiary (Deepest layer) */}
      <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -top-[80px] sm:-top-[120px] left-[-10%] w-[120%] z-0 rotate-180 pointer-events-none scale-x-[1.1] translate-x-4 mix-blend-multiply" animate={true} />
      {/* Top Wave - Secondary (Layered behind) */}
      <DecorativeCurve opacity={0.06} height="h-[350px] sm:h-[480px]" className="absolute -top-[50px] sm:-top-[80px] left-[-5%] w-[110%] z-0 rotate-180 pointer-events-none scale-x-[1.05]" animate={true} />
      {/* Top Wave - Primary */}
      <DecorativeCurve opacity={0.12} height="h-[250px] sm:h-[360px]" className="absolute top-0 left-0 z-0 rotate-180 pointer-events-none" animate={true} />

      <div className="flex flex-col flex-1 items-center justify-center p-4 relative z-10 w-full min-h-screen -mt-10 sm:-mt-12">
        <div className="relative w-full max-w-[480px] space-y-6">
          <div className="animate-fade-in-up px-2 text-center">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center shrink-0">
                <Gamepad2 className="w-6 h-6 text-[#2563EB]" />
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

          {/* Completed */}
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

          {/* Game cards */}
          <div className="space-y-4 px-2">
            {availableGames.map((game, i) => (
              <button key={game.id} onClick={() => navigate(game.route)}
                className={`w-full bg-white/80 backdrop-blur-xl border border-white/60 rounded-[20px] p-5 sm:p-6 text-left group animate-fade-in-up opacity-0 transition-all duration-300 ${game.neonBorder} hover:-translate-y-1 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]`}
                style={{ animationDelay: `${0.1 + i * 0.08}s`, animationFillMode: 'forwards' }}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${game.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                    <game.icon className={`w-6 h-6 ${game.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-[#0F172A] text-lg sm:text-xl group-hover:text-[#2563EB] transition-colors duration-200">{game.name}</h3>
                    <p className="text-[14px] text-[#64748B] mt-0.5 line-clamp-2 font-medium leading-tight">{game.description}</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-[#94A3B8]/30 group-hover:text-[#2563EB] group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                </div>
              </button>
            ))}
            {availableGames.length === 0 && (
              <div className="text-center p-8 text-[#64748B] font-bold bg-white/80 backdrop-blur-xl border border-white/60 rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">All games completed! 🎉</div>
            )}
          </div>

          {/* PIN badge */}
          <div className="mt-8 bg-white/60 backdrop-blur-xl border border-white/60 rounded-[18px] p-4 sm:p-5 animate-fade-in mx-2 shadow-sm">
            <div className="flex items-center justify-between text-[13px] text-[#64748B] font-bold">
              <span className="flex items-center gap-2">
                <span className="text-[#94A3B8] font-medium uppercase tracking-widest text-[11px]">Test PIN</span>
                <span className="font-mono font-bold text-[#2563EB] tracking-wider">{currentTest.pin}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[#94A3B8] font-medium uppercase tracking-widest text-[11px]">Progress</span>
                <span className="text-[#0F172A]">{completedGames.length} / {numGames}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* === BOTTOM WAVES (MATCHING LANDING) === */}
      {/* Bottom Wave - Tertiary (Deepest layer) */}
      <DecorativeCurve opacity={0.05} height="h-[400px] sm:h-[550px]" className="absolute -bottom-[80px] sm:-bottom-[120px] left-[-10%] w-[120%] z-0 pointer-events-none scale-x-[1.1] -translate-x-4 mix-blend-multiply" animate={true} />
      {/* Bottom Wave - Secondary (Layered behind) */}
      <DecorativeCurve opacity={0.07} height="h-[350px] sm:h-[480px]" className="absolute -bottom-[50px] sm:-bottom-[80px] left-[-5%] w-[110%] z-0 pointer-events-none scale-x-[1.05]" animate={true} />
      {/* Bottom Wave - Primary */}
      <DecorativeCurve opacity={0.12} height="h-[250px] sm:h-[360px]" className="absolute bottom-0 left-0 z-0 pointer-events-none" animate={true} />
    </div>
  );
};

export default GameSelector;
