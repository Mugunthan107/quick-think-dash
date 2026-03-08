import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Clock, Trophy, ArrowLeft, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import NavBar from '@/components/NavBar';
import DecorativeCurve from '@/components/DecorativeCurve';

const SUCCESS_MESSAGES = [
  "Hurray! You're brilliant! 🌟",
  "Awesome! Keep it up! 💪",
  "Stellar work! 🚀",
  "You're a genius! 🧠",
  "Perfecto! 🎯",
  "Magnificent! ✨",
  "Incredible! 🏆",
];

const OOPS_MESSAGES = [
  "Oops! Don't worry, try again! 😊",
  "Not quite, but you're getting closer! 🔄",
  "Keep pushing! You've got this! ✨",
  "Almost there! One more shot! 🎯",
  "Mistakes are just steps to learning! 📚",
  "Shake it off and try again! 🍀",
];

const TOTAL_LEVELS = 20;
const TIME_PER_Q = 30;
const TUBE_CAPACITY = 4;

const COLORS = ['#38BDF8', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#EF4444', '#F97316', '#06B6D4'];
const COLOR_NAMES = ['Sky', 'Amber', 'Green', 'Pink', 'Purple', 'Red', 'Orange', 'Cyan'];

interface Tube {
  colors: string[];
}

interface SortLevel {
  tubes: Tube[];
  numColors: number;
}

function isSorted(tubes: Tube[], numColors: number): boolean {
  let completeTubes = 0;
  for (const tube of tubes) {
    if (tube.colors.length === 0) continue;
    if (tube.colors.length === TUBE_CAPACITY && tube.colors.every(c => c === tube.colors[0])) {
      completeTubes++;
    } else if (tube.colors.length > 0) {
      // Not yet sorted
      return false;
    }
  }
  return completeTubes === numColors;
}

function getNumColors(difficulty: number) {
  if (difficulty < 5) return 4;
  if (difficulty < 10) return 5;
  if (difficulty < 15) return 6;
  return 7;
}

function generateLevel(difficulty: number): SortLevel {
  const numColors = getNumColors(difficulty);
  const colorsUsed = COLORS.slice(0, numColors);

  // Create sorted state first
  const allColors: string[] = [];
  for (const color of colorsUsed) {
    for (let i = 0; i < TUBE_CAPACITY; i++) allColors.push(color);
  }

  // Shuffle
  for (let i = allColors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allColors[i], allColors[j]] = [allColors[j], allColors[i]];
  }

  // Distribute into tubes
  const tubes: Tube[] = [];
  for (let i = 0; i < numColors; i++) {
    tubes.push({ colors: allColors.slice(i * TUBE_CAPACITY, (i + 1) * TUBE_CAPACITY) });
  }
  // Add 2 empty tubes
  tubes.push({ colors: [] });
  tubes.push({ colors: [] });

  return { tubes, numColors };
}

export default function WaterColorSortGame() {
  const navigate = useNavigate();
  const { currentStudent, currentTest, submitGameResult, addCompletedGame, finishTest, getNextGame } = useGame();

  const levels = useMemo(() => Array.from({ length: TOTAL_LEVELS }, (_, i) => generateLevel(i)), []);

  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [tubes, setTubes] = useState<Tube[]>(levels[0].tubes.map(t => ({ colors: [...t.colors] })));
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [moves, setMoves] = useState(0);
  const startTime = useRef(Date.now());
  const isTransitioning = useRef(false);

  useEffect(() => {
    if (!currentStudent || !currentTest) { navigate('/'); return; }
    if (currentTest.status === 'FINISHED') navigate('/');
  }, [currentStudent, currentTest, navigate]);

  // Reset tubes when level changes
  useEffect(() => {
    if (level < TOTAL_LEVELS && !gameOver) {
      setTubes(levels[level].tubes.map(t => ({ colors: [...t.colors] })));
      setSelectedTube(null);
      setMoves(0);
      setTimeLeft(TIME_PER_Q);
    }
  }, [level, gameOver, levels]);

  // Timer
  useEffect(() => {
    if (gameOver || level >= TOTAL_LEVELS || feedback) return;
    const iv = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          advanceLevel(false);
          return TIME_PER_Q;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [level, gameOver, feedback]);

  const advanceLevel = useCallback((solved: boolean) => {
    if (feedback || isTransitioning.current) return;
    isTransitioning.current = true;
    const newScore = solved ? score + 10 : score;
    setScore(newScore);
    if (solved) {
      setFeedback('correct');
      if (currentTest?.showResults !== false) {
        toast.success(SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)], { icon: '🧪' });
      }
    } else {
      setFeedback('wrong');
      if (currentTest?.showResults !== false) {
        toast.error(OOPS_MESSAGES[Math.floor(Math.random() * OOPS_MESSAGES.length)], { icon: '⏰' });
      }
    }

    setTimeout(() => {
      isTransitioning.current = false;
      if (level + 1 >= TOTAL_LEVELS) {
        finishGame(newScore, solved ? score + 1 : score, level + 1);
      } else {
        const nextLevel = level + 1;
        setLevel(nextLevel);
        setTubes(levels[nextLevel].tubes.map(t => ({ colors: [...t.colors] })));
        setMoves(0);
        setSelectedTube(null);
        setTimeLeft(TIME_PER_Q);
        setFeedback(null);
      }
    }, 1200);
  }, [level, score, feedback, currentTest, levels]);

  // Check if solved after each move
  useEffect(() => {
    if (level < TOTAL_LEVELS && !gameOver && !feedback && moves > 0 && isSorted(tubes, levels[level].numColors)) {
      advanceLevel(true);
    }
  }, [tubes, feedback, moves, level, gameOver, levels, advanceLevel]);

  const handleTubeClick = useCallback((idx: number) => {
    if (gameOver || feedback || isTransitioning.current) return;

    if (selectedTube === null) {
      // Select source tube (must have colors)
      if (tubes[idx].colors.length > 0) {
        setSelectedTube(idx);
      }
    } else {
      if (idx === selectedTube) {
        // Deselect
        setSelectedTube(null);
        return;
      }

      // Try to pour from selectedTube to idx
      const src = tubes[selectedTube];
      const dst = tubes[idx];

      if (dst.colors.length >= TUBE_CAPACITY) {
        // Tube is full — re-select new tube if it has colors
        if (tubes[idx].colors.length > 0) setSelectedTube(idx);
        else setSelectedTube(null);
        return;
      }

      const srcTop = src.colors[src.colors.length - 1];
      if (dst.colors.length === 0 || dst.colors[dst.colors.length - 1] === srcTop) {
        // Pour continuous same-color layers
        const newSrc = [...src.colors];
        const newDst = [...dst.colors];
        while (newSrc.length > 0 && newDst.length < TUBE_CAPACITY && newSrc[newSrc.length - 1] === srcTop) {
          newDst.push(newSrc.pop()!);
        }

        const newTubes = tubes.map((t, i) => {
          if (i === selectedTube) return { colors: newSrc };
          if (i === idx) return { colors: newDst };
          return t;
        });
        setTubes(newTubes);
        setMoves(m => m + 1);
        setSelectedTube(null);
      } else {
        // Colors don't match — re-select clicked tube if it has colors
        if (tubes[idx].colors.length > 0) setSelectedTube(idx);
        else setSelectedTube(null);
      }
    }
  }, [selectedTube, tubes, gameOver, feedback]);

  const resetLevel = useCallback(() => {
    if (feedback) return;
    setTubes(levels[level].tubes.map(t => ({ colors: [...t.colors] })));
    setSelectedTube(null);
    setMoves(0);
  }, [level, levels, feedback]);

  const finishGame = async (finalScore: number, finalCorrect: number, attempted: number) => {
    setGameOver(true);
    if (!currentStudent) return;
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    await submitGameResult(currentStudent.username, {
      gameId: 'colorsort',
      score: finalScore,
      timeTaken,
      correctAnswers: finalCorrect,
      totalQuestions: attempted,
      completedAt: Date.now(),
    });
    addCompletedGame('colorsort');
    confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
  };

  const handlePostFinish = useCallback(() => {
    const next = getNextGame();
    if (next) {
      navigate('/select-game');
    } else {
      if (currentStudent) finishTest(currentStudent.username);
      navigate('/');
    }
  }, [getNextGame, navigate, currentStudent, finishTest]);


  if (!currentStudent || !currentTest) return null;

  const progress = ((level + 1) / TOTAL_LEVELS) * 100;

  // Helper: can we pour from selectedTube into tube[idx]?
  const getDestState = (idx: number): 'selected' | 'valid' | 'invalid' | 'neutral' => {
    if (selectedTube === null) return 'neutral';
    if (idx === selectedTube) return 'selected';
    const src = tubes[selectedTube];
    const dst = tubes[idx];
    if (dst.colors.length >= TUBE_CAPACITY) return 'invalid';
    const srcTop = src.colors[src.colors.length - 1];
    if (dst.colors.length === 0 || dst.colors[dst.colors.length - 1] === srcTop) return 'valid';
    return 'invalid';
  };

  const selectedColor = selectedTube !== null && tubes[selectedTube].colors.length > 0
    ? tubes[selectedTube].colors[tubes[selectedTube].colors.length - 1]
    : null;

  const hintText = selectedTube === null
    ? '👆 Tap a tube to select it'
    : `💧 Now tap where to pour`;

  return (
    <div className={`flex flex-col bg-transparent font-sans min-h-screen overflow-hidden relative ${feedback === 'correct' ? 'flash-correct' : feedback === 'wrong' ? 'flash-wrong' : ''}`}>
      <NavBar />
      <div className="relative flex-1 w-full flex flex-col justify-center">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-transparent" />
        </div>

        {gameOver ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
            <div className="text-center animate-fade-in max-w-md w-full px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-sky-100 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-sky-200/40">
                <Trophy className="w-10 h-10 text-sky-500" />
              </div>
              <h1 className="text-[32px] sm:text-[40px] font-black text-[#0F172A] tracking-tight leading-none mb-3">Color Sort Complete!</h1>
              <p className="text-[15px] text-[#64748B] mb-10 font-medium tracking-tight">Magnificent performance, {currentStudent?.username}!</p>

              <div className="bg-white/90 backdrop-blur-2xl border border-sky-100 rounded-[2.5rem] p-10 mb-10 shadow-[0_20px_60px_-15px_rgba(56,189,248,0.12)]">
                <div className="flex items-center justify-center gap-10">
                  <div className="text-center">
                    <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Score</span>
                    <span className="font-mono font-black text-3xl sm:text-4xl text-sky-500">{currentTest?.showResults !== false ? score : '---'}</span>
                  </div>
                  <div className="w-px h-14 bg-sky-100" />
                  <div className="text-center">
                    <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Correct</span>
                    <span className="font-mono font-black text-3xl sm:text-4xl text-emerald-500">{currentTest?.showResults !== false ? `${level}/${TOTAL_LEVELS}` : '---'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePostFinish}
                className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] hover:from-[#0EA5E9] hover:to-[#0284C7] text-white rounded-2xl font-bold text-[16px] shadow-xl shadow-sky-500/25 transition-all hover:scale-105 active:scale-95"
              >
                {getNextGame() ? 'Next Game →' : 'Finish Session'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 items-center justify-center p-4 relative z-10 w-full pt-20 pb-12">
            <div className="w-full max-w-[620px] animate-fade-in relative flex flex-col items-center">
              <div className="w-full mb-8 flex flex-col items-center text-center">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F172A] uppercase leading-none">
                  Sort the colors
                </h1>
                <p className="mt-2 text-[13px] font-black text-[#64748B] tracking-[0.4em] uppercase opacity-40">
                  WATER SORT
                </p>
              </div>

              {/* Floating circular timer */}
              <div className="absolute -left-10 sm:-left-20 top-20 flex items-center justify-center w-14 h-14 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-sky-100/50 z-20">
                <svg className="w-full h-full -rotate-90 filter drop-shadow-sm" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="2.5" fill="transparent" className="text-sky-50" />
                  <circle
                    cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="3.5" fill="transparent"
                    strokeDasharray={138} strokeDashoffset={138 - (138 * timeLeft) / TIME_PER_Q}
                    strokeLinecap="round" className="text-red-500 transition-all duration-1000 linear"
                  />
                </svg>
                <span className="absolute font-black text-[18px] text-red-500 font-mono tracking-tighter translate-y-[1px]">{timeLeft}</span>
              </div>


              {/* Hint bar */}
              <div className="w-full flex items-center justify-center mb-3">
                <div className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${selectedTube !== null
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-400/30'
                    : 'bg-white/70 text-[#64748B] border border-sky-100'
                  }`}>
                  {selectedColor && (
                    <span className="w-4 h-4 rounded-full inline-block border-2 border-white/50 shadow-sm" style={{ backgroundColor: selectedColor }} />
                  )}
                  {hintText}
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(56,189,248,0.12)] border border-sky-100 transition-all duration-300 overflow-hidden relative w-full flex flex-col min-h-[420px]">
                {feedback && (
                  <div className={`absolute inset-x-0 top-0 h-2 ${feedback === 'correct' ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse z-40`} />
                )}

                {/* Card Header */}
                <div className="px-8 pt-8 pb-4">
                  <div className="flex items-center justify-between mb-6 relative">
                    <div className="flex-1 flex justify-start">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest leading-none">Moves</span>
                        <span className="text-xl font-black text-[#0F172A] leading-none">{moves}</span>
                      </div>
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5">
                      <span className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.2em] opacity-80">Level</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-[#0F172A] leading-none tracking-tighter">{level + 1}</span>
                        <span className="text-[#94A3B8] font-black text-xs">/ {TOTAL_LEVELS}</span>
                      </div>
                    </div>

                    <div className="flex-1 flex justify-end">
                      {currentTest?.showResults !== false && (
                        <div className="flex flex-col gap-1 items-end">
                          <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest leading-none">Score</span>
                          <span className="text-2xl font-black text-sky-500 leading-none">{score}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative w-full h-1.5 bg-sky-100/30 rounded-full overflow-hidden mb-2">
                    <div
                      className="absolute top-0 left-0 h-full bg-sky-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Tubes Area */}
                <div className="flex-1 p-6 flex flex-col items-center justify-center gap-6">
                  <div className="flex items-end gap-4 sm:gap-5 flex-wrap justify-center">
                    {tubes.map((tube, idx) => {
                      const destState = getDestState(idx);
                      return (
                        <div key={idx} className="flex flex-col items-center gap-1.5">
                          {/* Floating pour indicator above selected tube */}
                          <div className="h-7 flex items-center justify-center">
                            {destState === 'selected' && selectedColor && (
                              <div className="w-7 h-7 rounded-full border-4 border-white shadow-lg animate-bounce" style={{ backgroundColor: selectedColor }} />
                            )}
                            {destState === 'valid' && (
                              <span className="text-emerald-500 text-lg font-black animate-bounce">↓</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleTubeClick(idx)}
                            className={`relative flex flex-col-reverse w-14 sm:w-18 rounded-b-3xl rounded-t-xl border-4 transition-all duration-200
                              ${destState === 'selected'
                                ? 'border-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.5)] -translate-y-3 scale-105'
                                : destState === 'valid'
                                  ? 'border-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.35)] scale-102 cursor-pointer'
                                  : destState === 'invalid'
                                    ? 'border-slate-200 opacity-50 cursor-not-allowed'
                                    : 'border-sky-100 hover:border-sky-300 hover:scale-[1.02]'
                              }
                              bg-white/60 backdrop-blur-sm overflow-hidden`}
                            style={{ height: '11rem' }}
                          >
                            {tube.colors.map((color, ci) => (
                              <div
                                key={ci}
                                className="w-full transition-all duration-500"
                                style={{
                                  height: `${100 / TUBE_CAPACITY}%`,
                                  backgroundColor: color,
                                  borderTop: ci < tube.colors.length - 1 ? '1px solid rgba(255,255,255,0.25)' : 'none',
                                  boxShadow: 'inset 0 4px 6px -1px rgba(0,0,0,0.05), inset 0 -2px 4px -1px rgba(0,0,0,0.05)'
                                }}
                              />
                            ))}
                            {Array.from({ length: TUBE_CAPACITY - tube.colors.length }).map((_, ei) => (
                              <div key={`e-${ei}`} className="w-full" style={{ height: `${100 / TUBE_CAPACITY}%` }} />
                            ))}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={resetLevel}
                    className="flex items-center gap-2 px-6 py-2 rounded-full text-[12px] font-black uppercase tracking-widest text-sky-500 bg-sky-50 hover:bg-sky-100 transition-all active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset level
                  </button>
                </div>
              </div>

              <DecorativeCurve opacity={0.04} height="h-[200px] sm:h-[240px]" className="absolute -bottom-8 left-0 w-full pointer-events-none" animate={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
