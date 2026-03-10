import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Clock, Trophy, Gamepad2 } from 'lucide-react';
import DecorativeCurve from '@/components/DecorativeCurve';
import { toast } from 'sonner';
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

const TOTAL_LEVELS = 20;

const QUESTIONS_POOL = [
  { series: [1, 4, 9, 16], answer: 25, options: [20, 25, 30, 36] },
  { series: [2, 5, 10, 17], answer: 26, options: [26, 25, 24, 30] },
  { series: [3, 6, 12, 24], answer: 48, options: [36, 48, 40, 42] },
  { series: [5, 9, 13, 17], answer: 21, options: [20, 21, 22, 24] },
  { series: [1, 3, 6, 10], answer: 15, options: [15, 14, 16, 18] },
  { series: [9, 81, 729], answer: 6561, options: [6561, 6562, 6563, 6564] },
  { series: [4, 6, 9, 13], answer: 18, options: [16, 18, 20, 22] },
  { series: [7, 14, 28, 56], answer: 112, options: [98, 112, 120, 84] },
  { series: [1, 8, 27, 64], answer: 125, options: [100, 125, 121, 144] },
  { series: [10, 20, 40, 80], answer: 160, options: [120, 160, 180, 200] },
  { series: [2, 3, 5, 7, 11], answer: 13, options: [13, 15, 17, 19] },
  { series: [6, 13, 20, 27], answer: 34, options: [32, 34, 36, 38] },
  { series: [3, 9, 27, 81], answer: 243, options: [162, 243, 200, 300] },
  { series: [5, 25, 125], answer: 625, options: [625, 500, 750, 525] },
  { series: [1, 2, 4, 7, 11], answer: 16, options: [14, 16, 18, 20] },
  { series: [8, 16, 24, 32], answer: 40, options: [36, 40, 44, 48] },
  { series: [11, 13, 17, 19], answer: 23, options: [21, 23, 25, 27] },
  { series: [2, 4, 12, 48], answer: 240, options: [96, 240, 120, 144] },
  { series: [3, 5, 9, 17], answer: 33, options: [33, 32, 30, 35] },
  { series: [6, 12, 24, 48], answer: 96, options: [72, 96, 84, 108] },
  { series: [1, 1, 2, 3, 5], answer: 8, options: [6, 8, 7, 9] },
  { series: [4, 16, 36, 64], answer: 100, options: [81, 100, 121, 144] },
  { series: [9, 18, 27, 36], answer: 45, options: [40, 45, 42, 48] },
  { series: [2, 5, 9, 14], answer: 20, options: [19, 20, 21, 22] },
  { series: [1, 5, 13, 25], answer: 41, options: [41, 40, 45, 38] },
  { series: [7, 21, 63], answer: 189, options: [126, 189, 147, 210] },
  { series: [12, 15, 18, 21], answer: 24, options: [23, 24, 25, 26] },
  { series: [1, 4, 7, 10], answer: 13, options: [12, 13, 15, 14] },
  { series: [2, 6, 14, 30], answer: 62, options: [60, 62, 64, 58] },
  { series: [3, 12, 48, 192], answer: 768, options: [576, 768, 800, 720] },
  { series: [5, 10, 20, 40], answer: 80, options: [70, 80, 60, 90] },
  { series: [2, 3, 5, 9, 17], answer: 33, options: [33, 32, 30, 35] },
  { series: [4, 9, 16, 25], answer: 36, options: [30, 36, 40, 35] },
  { series: [1, 2, 6, 24], answer: 120, options: [96, 120, 100, 140] },
  { series: [10, 13, 17, 22], answer: 28, options: [26, 28, 29, 30] },
  { series: [6, 18, 54], answer: 162, options: [108, 162, 144, 180] },
  { series: [8, 9, 11, 14], answer: 18, options: [17, 18, 19, 20] },
  { series: [2, 7, 21, 63], answer: 189, options: [126, 189, 147, 200] },
  { series: [1, 3, 7, 15], answer: 31, options: [31, 28, 30, 33] },
  { series: [14, 28, 56], answer: 112, options: [96, 112, 84, 100] },
  { series: [3, 6, 11, 18], answer: 27, options: [25, 27, 29, 30] },
  { series: [5, 7, 11, 17], answer: 23, options: [23, 24, 25, 26] },
  { series: [4, 12, 36], answer: 108, options: [72, 108, 96, 120] },
  { series: [1, 4, 13, 40], answer: 121, options: [100, 121, 120, 140] },
  { series: [6, 11, 21, 36], answer: 57, options: [56, 57, 60, 54] },
  { series: [2, 9, 28, 65], answer: 126, options: [120, 126, 130, 110] },
  { series: [3, 8, 15, 24], answer: 35, options: [33, 35, 34, 36] },
  { series: [7, 10, 16, 25], answer: 37, options: [34, 37, 36, 38] },
  { series: [1, 5, 9, 17, 33], answer: 65, options: [60, 65, 70, 66] },
  { series: [2, 4, 8, 16], answer: 32, options: [30, 32, 28, 34] },
];

export default function NumberSeriesGame() {
  const navigate = useNavigate();
  const { currentStudent, currentTest, submitGameResult, addCompletedGame, finishTest, getNextGame } = useGame();

  const questions = useMemo(() => {
    return [...QUESTIONS_POOL]
      .sort(() => Math.random() - 0.5)
      .slice(0, TOTAL_LEVELS);
  }, []);

  const [gameStarted, setGameStarted] = useState(true);
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);

  const [bucketX, setBucketX] = useState(50);
  const [fallingOptions, setFallingOptions] = useState<number[]>([]);
  const [fallProgress, setFallProgress] = useState(0);
  const [caught, setCaught] = useState(false);

  const startTime = useRef(Date.now());
  const animFrame = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isSubmitting = useRef(false);

  useEffect(() => {
    if (!currentStudent || !currentTest) { navigate('/'); return; }
    if (currentTest.status === 'FINISHED') { navigate('/'); }
  }, [currentStudent, currentTest, navigate]);

  useEffect(() => {
    if (gameStarted && level < TOTAL_LEVELS && !gameOver) {
      setFallingOptions(questions[level].options);
      setFallProgress(0);
      setCaught(false);
      setFeedback(null);
    }
  }, [level, gameOver, questions, gameStarted]);

  const TIME_PER_Q_DYN = useMemo(() => {
    if (level < 5) return 8;
    if (level < 10) return 7;
    if (level < 15) return 6;
    return 5;
  }, [level]);

  const finishGame = useCallback(async (finalScore: number, finalCorrect: number, questionsAttempted: number) => {
    setGameOver(true);
    if (!currentStudent) return;
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    await submitGameResult(currentStudent.username, {
      gameId: 'numberseries',
      score: finalScore,
      timeTaken,
      correctAnswers: finalCorrect,
      totalQuestions: questionsAttempted,
      completedAt: Date.now(),
    });
    addCompletedGame('numberseries');
    confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
  }, [currentStudent, submitGameResult, addCompletedGame]);

  const advanceLevel = useCallback(() => {
    if (level + 1 >= TOTAL_LEVELS) {
      finishGame(score + (feedback === 'correct' ? 10 : 0), correct + (feedback === 'correct' ? 1 : 0), TOTAL_LEVELS);
    } else {
      setLevel(l => l + 1);
    }
    isSubmitting.current = false;
  }, [level, score, correct, feedback, finishGame]);

  const handleAnswer = useCallback((idx: number) => {
    if (caught || gameOver || isSubmitting.current) return;
    isSubmitting.current = true;
    setCaught(true);

    if (idx === -1) {
      setFeedback('timeout');
    } else {
      const isCorrect = fallingOptions[idx] === questions[level].answer;
      if (isCorrect) {
        setScore(s => s + 10);
        setCorrect(c => c + 1);
        setFeedback('correct');
        if (currentTest?.showResults !== false) {
          toast.success(SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)], { icon: '🧮' });
        }
      } else {
        setFeedback('wrong');
        if (currentTest?.showResults !== false) {
          toast.error(OOPS_MESSAGES[Math.floor(Math.random() * OOPS_MESSAGES.length)], { icon: '❓' });
        }
      }
    }
    setTimeout(() => advanceLevel(), 1200);
  }, [caught, gameOver, fallingOptions, questions, level, currentTest, advanceLevel]);

  const handleCatch = useCallback((idx: number) => {
    if (caught || gameOver || isSubmitting.current) return;
    isSubmitting.current = true;
    setCaught(true);
    const isCorrect = fallingOptions[idx] === questions[level].answer;

    if (isCorrect) {
      setScore(s => s + 10);
      setCorrect(c => c + 1);
      setFeedback('correct');
      if (currentTest?.showResults !== false) {
        toast.success(SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)], { icon: '🧮' });
      }
    } else {
      setFeedback('wrong');
      if (currentTest?.showResults !== false) {
        toast.error(OOPS_MESSAGES[Math.floor(Math.random() * OOPS_MESSAGES.length)], { icon: '❓' });
      }
    }

    setTimeout(() => advanceLevel(), 1200);
  }, [caught, gameOver, fallingOptions, questions, level, currentTest, advanceLevel]);

  useEffect(() => {
    if (!gameStarted || gameOver || level >= TOTAL_LEVELS || feedback) return;
    setTimeLeft(TIME_PER_Q_DYN);
    const iv = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleAnswer(-1); return TIME_PER_Q_DYN; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [level, gameOver, gameStarted, feedback, TIME_PER_Q_DYN, handleAnswer]);

  useEffect(() => {
    if (!gameStarted || gameOver || caught || level >= TOTAL_LEVELS || feedback) return;

    const speed = 0.7 / TIME_PER_Q_DYN;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setFallProgress(prev => {
        const next = prev + delta * speed;
        if (next >= 0.5 && next <= 0.8 && !caught) {
          const optionIndex = fallingOptions.findIndex((opt, i) => {
            const optCenterX = i * 25 + 12.5;
            return Math.abs(bucketX - optCenterX) < 12;
          });
          if (optionIndex !== -1) {
            handleCatch(optionIndex);
            return next;
          }
        }
        if (next >= 1) {
          handleAnswer(-1);
          return 1;
        }
        return next;
      });
      animFrame.current = requestAnimationFrame(animate);
    };
    animFrame.current = requestAnimationFrame(animate);
    return () => { if (animFrame.current) cancelAnimationFrame(animFrame.current); };
  }, [level, gameOver, caught, gameStarted, feedback, bucketX, fallingOptions, TIME_PER_Q_DYN, handleCatch, handleAnswer]);

  const handleDrag = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setBucketX(Math.min(Math.max(x, 5), 95));
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    handleDrag(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) handleDrag(e.clientX);
  };

  const onMouseUp = () => {
    isDragging.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleDrag(e.touches[0].clientX);
  };

  const handlePostFinish = useCallback(() => {
    const nextGame = getNextGame();
    if (nextGame) navigate('/select-game');
    else { if (currentStudent) finishTest(currentStudent.username); navigate('/'); }
  }, [getNextGame, navigate, currentStudent, finishTest]);


  if (!currentStudent || !currentTest) return null;


  const q = level < TOTAL_LEVELS ? questions[level] : null;

  return (
    <div
      className={`flex flex-col flex-1 w-full bg-transparent font-sans min-h-screen relative overflow-hidden ${feedback === 'correct' ? 'flash-correct' : (feedback === 'wrong' || feedback === 'timeout') ? 'flash-wrong' : ''}`}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
      onTouchEnd={() => { isDragging.current = false; }}
    >
      <div className="relative z-50 w-full px-4 sm:px-8 py-4 flex items-center justify-between bg-white/60 backdrop-blur-xl border-b border-white/40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black text-[#0F172A] leading-none uppercase tracking-wider">Number Series</h2>
            <p className="text-[10px] font-bold text-sky-500 mt-1.5 uppercase tracking-widest leading-none">{currentStudent.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1 leading-none">Time Left</span>
            <div className={`flex items-center gap-2 ${timeLeft <= 3 ? 'text-rose-500 animate-pulse' : 'text-sky-500'}`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-black text-xl leading-none">{timeLeft}s</span>
            </div>
          </div>
          <div className="w-px h-10 bg-slate-200/60" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1 leading-none">Score</span>
            <div className="flex items-center gap-2 text-emerald-500">
              <Trophy className="w-4 h-4" />
              <span className="font-mono font-black text-xl leading-none">{currentTest?.showResults !== false ? score : '---'}</span>
            </div>
          </div>
          <div className="w-[100px]" />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 w-full overflow-hidden">
        {gameOver ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
            <div className="text-center animate-fade-in max-w-md w-full px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-sky-100 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-sky-200/40">
                <Trophy className="w-10 h-10 text-sky-500" />
              </div>
              <h1 className="text-[32px] sm:text-[40px] font-black text-[#0F172A] tracking-tight leading-none mb-3">Number Series Complete!</h1>
              <p className="text-[15px] text-[#64748B] mb-10 font-medium tracking-tight">Magnificent job, {currentStudent?.username}!</p>

              <div className="bg-white/90 backdrop-blur-2xl border border-sky-100 rounded-[2.5rem] p-10 mb-10 shadow-[0_20px_60px_-15px_rgba(56,189,248,0.12)]">
                <div className="flex items-center justify-center gap-10">
                  <div className="text-center">
                    <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Score</span>
                    <span className="font-mono font-black text-3xl sm:text-4xl text-sky-500">{currentTest?.showResults !== false ? score : '---'}</span>
                  </div>
                  <div className="w-px h-14 bg-sky-100" />
                  <div className="text-center">
                    <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Correct</span>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="font-mono font-black text-3xl sm:text-4xl text-emerald-500">{currentTest?.showResults !== false ? correct : '---'}</span>
                      <span className="text-sm text-[#94A3B8] font-bold">/ {TOTAL_LEVELS}</span>
                    </div>
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
        ) : q && (
          <div
            className="w-full max-w-4xl flex flex-col items-center cursor-crosshair touch-none"
            ref={containerRef}
            onMouseDown={onMouseDown}
            onTouchStart={(e) => { isDragging.current = true; handleDrag(e.touches[0].clientX); }}
          >
            <div className="mb-12 sm:mb-16 text-center animate-fade-in space-y-4">
              <div className="flex flex-col items-center gap-2">
                <span className="px-4 py-1.5 bg-sky-100/50 text-sky-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] inline-block border border-sky-200/50 font-sans">
                  Level {level + 1} of {TOTAL_LEVELS}
                </span>
              </div>
              <div className="flex items-center gap-3 sm:gap-6 justify-center flex-wrap px-4">
                {q.series.map((n, i) => (
                  <div key={i} className="relative group">
                    <div className="absolute -inset-2 bg-sky-500/5 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative text-3xl sm:text-5xl font-black text-[#0F172A] tracking-tighter drop-shadow-sm font-sans">
                      {n}
                    </div>
                  </div>
                ))}
                <div className="relative">
                  <div className="absolute -inset-4 bg-sky-400/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative text-3xl sm:text-5xl font-black text-sky-500 animate-bounce tracking-tighter drop-shadow-md font-sans">
                    ?
                  </div>
                </div>
              </div>
            </div>
            <div className="relative w-full h-[280px] sm:h-[350px] overflow-visible select-none">
              <div className="absolute inset-x-0 top-0 bottom-20 flex">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="flex-1 border-x border-slate-200/5 last:border-r-0 first:border-l-0" />
                ))}
              </div>
              {fallingOptions.map((opt, i) => (
                <div
                  key={i}
                  className="absolute w-[25%] transition-none flex justify-center z-10"
                  style={{
                    left: `${i * 25}%`,
                    top: `${fallProgress * 100}%`,
                    opacity: caught && (feedback ? fallingOptions[i] !== q.answer : true) ? 0.3 : 1,
                    transition: feedback ? 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none',
                    transform: feedback && caught && fallingOptions[i] === q.answer ? 'scale(1.15)' : 'scale(1)'
                  }}
                >
                  <div className={`
                    w-12 h-12 sm:w-20 sm:h-20 rounded-[1.2rem] sm:rounded-[1.5rem] flex items-center justify-center 
                    text-xl sm:text-3xl font-black tracking-tight shadow-lg transition-all duration-300 font-sans
                    ${feedback && caught && fallingOptions[i] === q.answer
                      ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                      : 'bg-white/80 backdrop-blur-xl border border-white text-[#0F172A] shadow-sky-500/5'
                    }
                  `}>
                    {opt}
                    <div className="absolute inset-1.5 border border-black/5 rounded-[1rem] sm:rounded-[1.3rem] pointer-events-none" />
                  </div>
                </div>
              ))}
              <div
                className="absolute bottom-4 h-24 sm:h-32 w-[28%] max-w-[160px] pointer-events-none transition-transform duration-75 select-none z-30 group"
                style={{
                  left: `${bucketX}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute inset-x-0 bottom-0 top-8 bg-gradient-to-tr from-sky-500 to-blue-600 rounded-b-[2rem] rounded-t-[1rem] shadow-xl border-x-[4px] border-white/20 transition-all group-active:scale-[0.98]">
                    <div className="absolute -top-2.5 inset-x-0 h-6 bg-white/10 backdrop-blur-md rounded-full border-t border-white/40 border-b border-black/10 shadow-inner overflow-hidden">
                      <div className="absolute inset-0 bg-sky-200/20 animate-pulse" />
                    </div>
                  </div>
                  <div className="relative z-10 -mt-1.5">
                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white/90 drop-shadow-md transition-transform group-hover:scale-110" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {feedback && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center z-[100] pointer-events-none px-4">
            <div className={`
              px-10 py-5 rounded-[2.5rem] font-black text-xl sm:text-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12)] 
              animate-fade-in-up text-white flex items-center gap-3 border-2 border-white/20 backdrop-blur-xl font-sans
              ${feedback === 'correct' ? 'bg-emerald-500' : 'bg-rose-500'}
            `}>
              {feedback === 'correct' ? "EXCELLENT!" : feedback === 'timeout' ? "TIME OUT!" : "INCORRECT"}
            </div>
          </div>
        )}
      </div>
    </div >
  );
}
