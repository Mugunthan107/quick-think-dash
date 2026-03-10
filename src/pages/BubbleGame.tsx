import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Trophy } from 'lucide-react';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import DecorativeCurve from '@/components/DecorativeCurve';
import confetti from 'canvas-confetti';

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

interface BubbleData {
  text: string;
  value: number;
  id: string;
}

const TOTAL_LEVELS = 30;

function getRoundConfig(level: number) {
  if (level <= 10) return { seconds: 10, points: 10 };
  if (level <= 20) return { seconds: 7, points: 20 };
  return { seconds: 5, points: 30 };
}

function getLevelConfig(level: number) {
  if (level <= 5) return { max: 9, ops: ['+', '-'] as const };
  if (level <= 10) return { max: 15, ops: ['+', '-'] as const };
  if (level <= 20) return { max: 25, ops: ['+', '-', '×', '÷'] as const };
  return { max: 25, ops: ['×', '÷'] as const };
}

function getNum(max: number) {
  return Math.floor(Math.random() * max) + 1;
}

function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function createExpression(level: number): BubbleData {
  const config = getLevelConfig(level);
  const op = config.ops[Math.floor(Math.random() * config.ops.length)];
  let a: number;
  let b: number;
  let result: number;

  if (op === '÷') {
    b = getNum(5);
    const multiplier = getNum(6);
    a = b * multiplier;
    result = a / b;
  } else {
    a = getNum(config.max);
    b = getNum(config.max);
    if (op === '+') result = a + b;
    else if (op === '-') result = a - b;
    else result = a * b;
  }

  return {
    text: `${a} ${op} ${b}`,
    value: result,
    id: Math.random().toString(36).slice(2),
  };
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function BubbleGame() {
  const {
    currentStudent,
    submitGameResult,
    finishTest,
    currentTest,
    addCompletedGame,
    getNextGame,
    updateStudentProgress,
  } = useGame();
  const navigate = useNavigate();

  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const [shuffled, setShuffled] = useState<BubbleData[]>([]);
  const [selectionOrder, setSelectionOrder] = useState<string[]>([]);
  const [roundTimeLeft, setRoundTimeLeft] = useState(getRoundConfig(1).seconds);
  const [finished, setFinished] = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef(Date.now());

  useEffect(() => {
    if (!currentStudent) {
      navigate('/student');
      return;
    }
    lastTickRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const delta = Math.floor((now - lastTickRef.current) / 1000);
      if (delta >= 1) {
        setElapsed(prev => prev + delta);
        if (!finished && gameActive) {
          setRoundTimeLeft(prev => Math.max(0, prev - delta));
        }
        lastTickRef.current = now;
      }
    }, 100);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentStudent, navigate, finished, gameActive]);

  useEffect(() => {
    if (currentTest?.status === 'FINISHED') {
      navigate('/');
    }
  }, [currentTest?.status, navigate]);

  const isSubmitting = useRef(false);

  const startRound = useCallback(
    (lvl: number) => {
      const items = Array.from({ length: 3 }, () => createExpression(lvl));
      const sorted = [...items].sort((a, b) => a.value - b.value);
      setBubbles(sorted);
      setShuffled(shuffleArray(items));
      setSelectionOrder([]);
      const { seconds } = getRoundConfig(lvl);
      setRoundTimeLeft(seconds);
      setGameActive(true);
      isSubmitting.current = false;
    },
    [],
  );

  useEffect(() => {
    startRound(level);
  }, [level, startRound]);

  const handleFinish = useCallback(() => {
    setFinished(true);
    setGameActive(false);
    isSubmitting.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    if (currentStudent && currentTest) {
      submitGameResult(currentStudent.username, {
        gameId: 'bubble',
        score,
        timeTaken: elapsed,
        correctAnswers: totalCorrect,
        totalQuestions: TOTAL_LEVELS,
        completedAt: Date.now(),
      }).then(() => {
        addCompletedGame('bubble');
        confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
      });
    }
  }, [score, elapsed, totalCorrect, currentStudent, currentTest, submitGameResult, addCompletedGame, finishTest, navigate]);

  const handlePostFinish = useCallback(() => {
    const next = getNextGame();
    if (next) {
      navigate('/select-game');
    } else {
      if (currentStudent) finishTest(currentStudent.username);
      navigate('/');
    }
  }, [getNextGame, navigate, currentStudent, finishTest]);

  const failRound = useCallback(() => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setGameActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectionOrder([]);
    if (currentTest?.showResults !== false) { // Guard feedback rendering
      setFeedback('error');
    }
    setTimeout(() => {
      setFeedback(null); // Clear feedback after a delay
      if (level >= TOTAL_LEVELS) handleFinish();
      else setLevel(prev => prev + 1);
    }, 500);
  }, [level, handleFinish, currentTest?.showResults]);

  useEffect(() => {
    if (gameActive && roundTimeLeft <= 0) {
      failRound();
    }
  }, [roundTimeLeft, gameActive, failRound]);

  const handleBubbleClick = (bubble: BubbleData) => {
    if (!gameActive || isSubmitting.current) return;

    // Toggle selection when clicking the same bubble again
    let newOrder: string[];
    if (selectionOrder.includes(bubble.id) && selectionOrder.length < bubbles.length) {
      newOrder = selectionOrder.filter(id => id !== bubble.id);
    } else if (!selectionOrder.includes(bubble.id)) {
      newOrder = [...selectionOrder, bubble.id];
    } else {
      // Already selected and round is complete/finishing
      return;
    }

    setSelectionOrder(newOrder);

    if (newOrder.length === bubbles.length) {
      const isCorrectOrder = newOrder.every((id, idx) => {
        const bubble = shuffled.find(b => b.id === id);
        return bubble?.value === bubbles[idx].value;
      });

      let newTotalCorrect = totalCorrect;
      let newScore = score;

      if (isCorrectOrder) {
        const { points } = getRoundConfig(level);
        newScore = score + points;
        newTotalCorrect = totalCorrect + 1;
        if (currentTest?.showResults !== false) {
          setFeedback('success');
          const msg = SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)];
          toast.success(msg, { icon: '🚀' });
        }
        setScore(newScore);
        setTotalCorrect(newTotalCorrect);
        if (currentStudent) {
          updateStudentProgress(currentStudent.username, newScore, level, newTotalCorrect, TOTAL_LEVELS, 'bubble');
        }
      } else {
        if (currentTest?.showResults !== false) {
          setFeedback('error');
          const msg = OOPS_MESSAGES[Math.floor(Math.random() * OOPS_MESSAGES.length)];
          toast.error(msg, { icon: '🚫' });
        }
        // Deduct points removed as requested
      }
      isSubmitting.current = true;
      setGameActive(false);
      if (timerRef.current) clearInterval(timerRef.current);

      // Removed updateStudentScore as updateStudentProgress handles it correctly now

      setTimeout(() => {
        setFeedback(null); // Clear feedback after a delay
        if (level >= TOTAL_LEVELS) handleFinish();
        else setLevel(prev => prev + 1);
      }, 400);
    }
  };

  const progress = Math.min(100, (level / TOTAL_LEVELS) * 100);

  if (finished) {
    return (
      <div className="flex flex-col bg-transparent font-sans min-h-screen overflow-hidden relative">
        <NavBar />
        <div className="relative flex-1 w-full flex flex-col justify-center items-center">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-transparent" />
          </div>
          <div className="flex flex-col flex-1 items-center justify-center p-4 relative z-10 w-full min-h-screen">
            <div className="text-center animate-fade-in max-w-md w-full px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-sky-100 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-sky-200/40">
                <Trophy className="w-10 h-10 text-sky-500" />
              </div>
              <h1 className="text-[32px] sm:text-[40px] font-black text-[#0F172A] tracking-tight leading-none mb-3">Bubble Sort Complete!</h1>
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
                    <span className="font-mono font-black text-3xl sm:text-4xl text-emerald-500">{currentTest?.showResults !== false ? `${totalCorrect}/${TOTAL_LEVELS}` : '---'}</span>
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
          <DecorativeCurve
            opacity={0.04}
            height="h-[280px] sm:h-[360px]"
            className="absolute bottom-0 left-0 w-full pointer-events-none"
            animate={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-transparent font-sans min-h-screen overflow-hidden relative ${feedback === 'success' ? 'flash-correct' : feedback === 'error' ? 'flash-wrong' : ''}`}>
      <NavBar />
      <div className="relative flex-1 w-full flex flex-col justify-center">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-transparent" />
        </div>

        {/* Redundant Sidebar Stats Removed to match User Image */}


        <div className="flex flex-col flex-1 items-center justify-center p-4 relative z-10 w-full pt-28 pb-12">
          <div className="w-full max-w-[580px] animate-fade-in relative">
            <div className="w-full mb-8 flex flex-col items-center text-center">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F172A] uppercase">
                Arrange the answers
              </h1>
              <p className="mt-1 text-[13px] font-black text-[#0F172A] tracking-[0.4em] uppercase">
                LOW → HIGH
              </p>
            </div>

            {/* End Test Hyperlink */}
            <div className="w-full h-4 mb-4" />

            <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(56,189,248,0.15)] border border-sky-100 transition-all duration-300 overflow-hidden relative min-h-[350px] flex flex-col">
              {feedback && currentTest?.showResults !== false && (
                <div
                  className={`absolute inset-x-0 top-0 h-2 ${feedback === 'success' ? 'bg-emerald-500' : 'bg-red-500'
                    } animate-pulse z-30`}
                />
              )}

              {/* Card Header: Level & Score */}
              <div className="px-8 pt-8 pb-4">
                <div className="flex items-center justify-between mb-4 relative">
                  {/* Left: Badge */}
                  <div className="flex-1 flex justify-start">
                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                      Easy
                    </span>
                  </div>

                  {/* Middle: Level Info */}
                  <div className="absolute left-1/2 -translate-x-1/2 flex items-baseline gap-2">
                    <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest leading-none">Level</span>
                    <span className="text-[#0F172A] text-lg font-black">{level} / {TOTAL_LEVELS}</span>
                  </div>

                  {/* Right: Score */}
                  <div className="flex-1 flex justify-end">
                    {currentTest?.showResults !== false && (
                      <div className="text-right flex items-baseline gap-2">
                        <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest leading-none">SCORE</span>
                        <span className="font-black text-2xl text-sky-500">
                          {score}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-sky-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Game Area: Horizontal Bubbles */}
              <div className="flex-1 p-6 sm:p-10 flex items-center justify-center">
                <div className="flex justify-center items-center gap-4 sm:gap-6 w-full max-w-lg">
                  {shuffled.map(bubble => (
                    <button
                      key={bubble.id}
                      onClick={() => handleBubbleClick(bubble)}
                      className={`w-20 h-20 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center p-3 transition-all duration-300 relative border-2 select-none touch-manipulation group ${selectionOrder.includes(bubble.id)
                        ? 'bg-sky-50 border-sky-300 scale-95 shadow-md shadow-sky-500/10'
                        : 'bg-white border-sky-100 hover:border-sky-300 hover:scale-105 shadow-md shadow-sky-500/5 hover:shadow-xl hover:shadow-sky-500/15'
                        }`}
                    >
                      <span className="text-[14px] sm:text-[17px] font-black tracking-tight text-[#0F172A]">
                        {bubble.text}
                      </span>

                      {/* Selection Badge */}
                      {selectionOrder.includes(bubble.id) && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-sky-500 text-white flex items-center justify-center text-[11px] sm:text-[12px] font-black border-2 border-white">
                          {selectionOrder.indexOf(bubble.id) + 1}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer: Timer & Stats */}
              <div className="px-8 pb-8 flex items-end justify-between">
                {/* Circular Timer (Bottom Left) */}
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      className="text-sky-50"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="#EF4444"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={2 * Math.PI * 42 * (1 - roundTimeLeft / getRoundConfig(level).seconds)}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                    />
                  </svg>
                  <span className="absolute font-black text-sm text-[#EF4444]">
                    {roundTimeLeft}
                  </span>
                </div>

                {/* Sort Info (Bottom Right) */}
                <div className="text-right pb-1 select-none">
                  <div className="flex items-center gap-1.5 text-[#94A3B8]">
                    <div className="w-3 h-[1px] bg-[#94A3B8] opacity-50" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Sort by value</span>
                  </div>
                </div>
              </div>
            </div>
            <DecorativeCurve
              opacity={0.04}
              height="h-[200px] sm:h-[240px]"
              className="absolute -bottom-8 left-0 w-full pointer-events-none"
              animate={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BubbleGame;
