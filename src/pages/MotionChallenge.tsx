import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Clock, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Pause, RefreshCcw } from 'lucide-react';
import DecorativeCurve from '@/components/DecorativeCurve';

const GRID_SIZE = 5;
const TOTAL_LEVELS = 20;
const DIRECTIONS = ['up', 'down', 'left', 'right'] as const;
type Direction = typeof DIRECTIONS[number];

interface Target {
  row: number;
  col: number;
}

function randomTarget(exclude?: { row: number; col: number }): Target {
  let t: Target;
  do {
    t = { row: Math.floor(Math.random() * GRID_SIZE), col: Math.floor(Math.random() * GRID_SIZE) };
  } while (exclude && t.row === exclude.row && t.col === exclude.col);
  return t;
}

const DIRECTION_ICONS = { up: ArrowUp, down: ArrowDown, left: ArrowLeft, right: ArrowRight };

const MotionChallenge = () => {
  const { currentStudent, updateStudentScore, submitGameResult, finishTest, currentTest, addCompletedGame, getNextGame } = useGame();
  const navigate = useNavigate();

  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [playerPos, setPlayerPos] = useState({ row: 2, col: 2 });
  const [target, setTarget] = useState<Target>(() => randomTarget({ row: 2, col: 2 }));
  const [finished, setFinished] = useState(false);
  const [paused, setPaused] = useState(false);
  const [flash, setFlash] = useState<'success' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { if (!currentStudent) navigate('/student'); }, [currentStudent, navigate]);
  useEffect(() => { if (currentTest?.status === 'FINISHED') navigate('/'); }, [currentTest?.status, navigate]);

  useEffect(() => {
    if (finished || paused) return;
    timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [finished, paused]);

  const movePlayer = useCallback((dir: Direction) => {
    if (finished || paused) return;
    setPlayerPos(prev => {
      let { row, col } = prev;
      if (dir === 'up' && row > 0) row--;
      else if (dir === 'down' && row < GRID_SIZE - 1) row++;
      else if (dir === 'left' && col > 0) col--;
      else if (dir === 'right' && col < GRID_SIZE - 1) col++;
      else return prev;
      setMoves(m => m + 1);
      return { row, col };
    });
  }, [finished, paused]);

  // Check if player reached target
  useEffect(() => {
    if (playerPos.row === target.row && playerPos.col === target.col) {
      const points = Math.max(4, 10 - Math.floor(moves / 3));
      setScore(p => p + points);
      setCorrectCount(p => p + 1);
      setFlash('success');
      setTimeout(() => setFlash(null), 400);

      if (level >= TOTAL_LEVELS) {
        handleFinish();
      } else {
        setTarget(randomTarget(playerPos));
        setLevel(p => p + 1);
        setMoves(0);
      }
    }
  }, [playerPos, target]);

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') movePlayer('up');
      else if (e.key === 'ArrowDown') movePlayer('down');
      else if (e.key === 'ArrowLeft') movePlayer('left');
      else if (e.key === 'ArrowRight') movePlayer('right');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [movePlayer]);

  const handleFinish = useCallback(() => {
    setFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (currentStudent && currentTest) {
      submitGameResult(currentStudent.username, {
        gameId: 'motion', score, timeTaken: elapsed, correctAnswers: correctCount, totalQuestions: TOTAL_LEVELS, completedAt: Date.now()
      }).then(() => addCompletedGame('motion'));
    }
  }, [score, correctCount, currentStudent, currentTest, submitGameResult, addCompletedGame, elapsed]);

  const handlePostFinish = useCallback(() => {
    const nextGame = getNextGame();
    if (nextGame) navigate('/select-game');
    else { if (currentStudent) finishTest(currentStudent.username); navigate('/'); }
  }, [getNextGame, navigate, currentStudent, finishTest]);

  const handleRestart = () => {
    setLevel(1); setScore(0); setMoves(0); setElapsed(0);
    setPlayerPos({ row: 2, col: 2 }); setTarget(randomTarget({ row: 2, col: 2 }));
    setFinished(false); setPaused(false); setCorrectCount(0);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (finished) {
    return (
      <div className="flex flex-col flex-1 w-full bg-[#F0F7FF] font-sans min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#E0F2FE_0%,_#F0F9FF_40%,_#FFFFFF_100%)]" />
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#38BDF8] opacity-[0.05] blur-[120px] rounded-full" />
        </div>
        <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -top-[100px] sm:-top-[150px] -left-[10%] w-[120%] z-0 rotate-180 pointer-events-none" animate={true} />
        <div className="flex items-center justify-center p-4 relative z-10 w-full min-h-screen -mt-14 sm:-mt-16">
          <div className="text-center animate-fade-in max-w-md w-full px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-sky-100 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-sky-200/40"><Trophy className="w-10 h-10 text-sky-500" /></div>
            <h1 className="text-[32px] sm:text-[42px] font-black text-[#0F172A] tracking-tight leading-none mb-3">Motion Complete!</h1>
            <p className="text-[15px] text-[#64748B] mb-10 font-medium">Great work, {currentStudent?.username}!</p>
            <div className="bg-white/90 backdrop-blur-2xl border border-sky-100 rounded-[2.5rem] p-10 mb-10 shadow-[0_20px_60px_-15px_rgba(56,189,248,0.12)]">
              <div className="flex items-center justify-center gap-10">
                <div className="text-center">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Score</span>
                  <span className="font-mono font-black text-3xl sm:text-4xl text-sky-500">{score}</span>
                </div>
                <div className="w-px h-14 bg-sky-100" />
                <div className="text-center">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Time</span>
                  <span className="font-mono font-black text-3xl sm:text-4xl text-[#1E293B]">{formatTime(elapsed)}</span>
                </div>
              </div>
            </div>
            <button onClick={handlePostFinish} className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] hover:from-[#0EA5E9] hover:to-[#0284C7] text-white rounded-2xl font-bold text-[16px] shadow-xl shadow-sky-500/25 transition-all hover:scale-105 active:scale-95">
              {getNextGame() ? 'Next Game →' : 'Finish Session'}
            </button>
          </div>
        </div>
        <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -bottom-[100px] -left-[10%] w-[120%] z-0 pointer-events-none" animate={true} />
      </div>
    );
  }

  const progress = (level / TOTAL_LEVELS) * 100;

  return (
    <div className="flex flex-col flex-1 w-full bg-[#F0F7FF] font-sans min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#E0F2FE_0%,_#F0F9FF_40%,_#FFFFFF_100%)]" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#38BDF8] opacity-[0.05] blur-[120px] rounded-full" />
      </div>
      <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -top-[100px] sm:-top-[150px] -left-[10%] w-[120%] z-0 rotate-180 pointer-events-none" animate={true} />
      <div className="flex flex-col flex-1 items-center justify-center p-3 sm:p-4 relative z-10 w-full min-h-screen -mt-14 sm:-mt-16">
        <div className="w-full max-w-[480px] animate-fade-in relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 px-2 tracking-tight font-bold">
            <span className="text-[13px] text-[#64748B]">{currentStudent?.username}</span>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-sky-100 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <span className="text-[#0F172A] font-mono text-[14px]">{formatTime(elapsed)}</span>
            </div>
            <button onClick={() => handleFinish()} className="text-[11px] text-[#94A3B8] hover:text-[#0F172A] transition-colors px-3 py-1.5 rounded-xl hover:bg-white/80 border border-sky-100 font-bold uppercase tracking-widest">End</button>
          </div>

          <div className={`bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(56,189,248,0.10)] border border-sky-100 overflow-hidden transition-all ${flash === 'success' ? 'border-emerald-300' : ''}`}>
            {/* Stats bar */}
            <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-6 border-b border-sky-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest leading-none">Level</span>
                  <span className="text-[#0F172A] text-2xl font-black">{level} / {TOTAL_LEVELS}</span>
                </div>
                <div className="flex flex-col gap-1 items-center">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest leading-none">Moves</span>
                  <span className="font-mono font-black text-2xl text-[#64748B]">{moves}</span>
                </div>
                <div className="text-right flex flex-col gap-1">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest leading-none">Score</span>
                  <span className="font-mono font-black text-2xl text-sky-500">{score}</span>
                </div>
              </div>
              <div className="w-full h-2 bg-sky-50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Grid */}
            <div className="p-6 sm:p-10">
              <div className="grid gap-2 mb-6" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
                {Array.from({ length: GRID_SIZE }).map((_, rIdx) =>
                  Array.from({ length: GRID_SIZE }).map((_, cIdx) => {
                    const isPlayer = playerPos.row === rIdx && playerPos.col === cIdx;
                    const isTarget = target.row === rIdx && target.col === cIdx;
                    return (
                      <div key={`${rIdx}-${cIdx}`}
                        className={`aspect-square rounded-xl border-2 flex items-center justify-center text-lg font-black transition-all duration-200
                          ${isPlayer ? 'bg-gradient-to-br from-[#38BDF8] to-[#0EA5E9] border-sky-300 shadow-lg shadow-sky-300/30 scale-105' :
                            isTarget ? 'bg-amber-50 border-amber-200 animate-pulse' :
                              'bg-white border-sky-50'}`}
                      >
                        {isPlayer && <div className="w-4 h-4 rounded-full bg-white" />}
                        {isTarget && !isPlayer && <div className="w-3 h-3 rounded-full bg-amber-400" />}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Direction buttons */}
              <div className="flex flex-col items-center gap-2">
                <button onClick={() => movePlayer('up')} className="w-14 h-14 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 flex items-center justify-center transition-all active:scale-90">
                  <ArrowUp className="w-6 h-6 text-sky-600" />
                </button>
                <div className="flex gap-2">
                  <button onClick={() => movePlayer('left')} className="w-14 h-14 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 flex items-center justify-center transition-all active:scale-90">
                    <ArrowLeft className="w-6 h-6 text-sky-600" />
                  </button>
                  <button onClick={() => movePlayer('down')} className="w-14 h-14 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 flex items-center justify-center transition-all active:scale-90">
                    <ArrowDown className="w-6 h-6 text-sky-600" />
                  </button>
                  <button onClick={() => movePlayer('right')} className="w-14 h-14 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 flex items-center justify-center transition-all active:scale-90">
                    <ArrowRight className="w-6 h-6 text-sky-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom controls */}
            <div className="px-6 pb-8 flex gap-3">
              <button onClick={handleRestart} className="flex-1 py-3 bg-sky-50 hover:bg-sky-100 text-[#475569] rounded-2xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all active:scale-95">
                <RefreshCcw className="w-4 h-4" /> Restart
              </button>
              <button onClick={() => setPaused(p => !p)} className="flex-1 py-3 bg-sky-50 hover:bg-sky-100 text-[#475569] rounded-2xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all active:scale-95">
                <Pause className="w-4 h-4" /> {paused ? 'Resume' : 'Pause'}
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[13px] text-[#64748B] font-bold">Navigate to the <span className="text-amber-500">●</span> target using arrows or keyboard</p>
          </div>
        </div>
      </div>
      <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -bottom-[100px] -left-[10%] w-[120%] z-0 pointer-events-none" animate={true} />
    </div>
  );
};

export default MotionChallenge;
