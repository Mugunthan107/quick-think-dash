import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Clock, Trophy, LogOut, Gamepad2, Play, ArrowRight } from 'lucide-react';
import DecorativeCurve from '@/components/DecorativeCurve';

const TOTAL_LEVELS = 20;
const TIME_PER_Q = 10;

const QUESTIONS_POOL: { series: number[], answer: number, options: number[] }[] = [
  { series: [1, 4, 9, 16], answer: 25, options: [20, 25, 30, 36] },
  { series: [2, 5, 10, 17], answer: 26, options: [26, 25, 24, 30] },
  { series: [3, 6, 12, 24], answer: 48, options: [36, 48, 40, 42] },
  { series: [5, 9, 13, 17], answer: 21, options: [20, 21, 22, 24] },
  { series: [1, 3, 6, 10], answer: 15, options: [15, 14, 16, 18] },
  { series: [9,81,729], answer: 6561, options: [6561, 6562, 6563,6564] },
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

  const [gameStarted, setGameStarted] = useState(false);
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);

  // Interaction states
  const [bucketX, setBucketX] = useState(50); // percentage 0-100
  const [fallingOptions, setFallingOptions] = useState<number[]>([]);
  const [fallProgress, setFallProgress] = useState(0);
  const [caught, setCaught] = useState(false);

  const startTime = useRef(Date.now());
  const animFrame = useRef<number>();
  const bucketRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    if (!currentStudent || !currentTest) { navigate('/'); return; }
    if (currentTest.status === 'FINISHED') { navigate('/'); }
  }, [currentStudent, currentTest, navigate]);

  // Set falling options when level changes
  useEffect(() => {
    if (gameStarted && level < TOTAL_LEVELS && !gameOver) {
      setFallingOptions(questions[level].options);
      setFallProgress(0);
      setCaught(false);
      setFeedback(null);
    }
  }, [level, gameOver, questions, gameStarted]);

  // Timer logic
  const TIME_PER_Q_DYN = useMemo(() => {
    if (level < 5) return 8;
    if (level < 10) return 7;
    if (level < 15) return 6;
    return 5;
  }, [level]);

  // Timer
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
  }, [level, gameOver, gameStarted, feedback, TIME_PER_Q_DYN]);

  // Fall animation
  useEffect(() => {
    if (!gameStarted || gameOver || caught || level >= TOTAL_LEVELS || feedback) return;

    // speed = distance / time. Distance to catch zone is ~70%.
    const speed = 0.7 / TIME_PER_Q_DYN;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setFallProgress(prev => {
        const next = prev + delta * speed;

        // AUTO-CATCH CHECK (Adjusted for bottom bucket position and smaller scale)
        // Number bottom (next) should be between rim (0.5) and middle (0.8)
        if (next >= 0.5 && next <= 0.8 && !caught) {
          const optionIndex = fallingOptions.findIndex((opt, i) => {
            const optCenterX = i * 25 + 12.5;
            return Math.abs(bucketX - optCenterX) < 12; // Widened hitbox for better feel
          });

          if (optionIndex !== -1) {
            handleCatch(optionIndex);
            return next;
          }
        }

        if (next >= 1) {
          handleAnswer(-1); // missed
          return 1;
        }
        return next;
      });
      animFrame.current = requestAnimationFrame(animate);
    };
    animFrame.current = requestAnimationFrame(animate);
    return () => { if (animFrame.current) cancelAnimationFrame(animFrame.current); };
  }, [level, gameOver, caught, gameStarted, feedback, bucketX, fallingOptions, TIME_PER_Q_DYN]);

  // Mouse/Touch Handlers for Dragging
  const handleDrag = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setBucketX(Math.min(Math.max(x, 5), 95)); // Keep bucket within 5-95% bounds
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

  const handleCatch = (idx: number) => {
    if (caught || gameOver) return;
    setCaught(true);
    const isCorrect = fallingOptions[idx] === questions[level].answer;

    if (isCorrect) {
      setScore(s => s + 10);
      setCorrect(c => c + 1);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => advanceLevel(), 1200);
  };

  const handleAnswer = (idx: number) => {
    if (caught || gameOver) return;
    setCaught(true);

    if (idx === -1) {
      setFeedback('timeout');
    } else {
      const isCorrect = fallingOptions[idx] === questions[level].answer;
      if (isCorrect) {
        setScore(s => s + 10);
        setCorrect(c => c + 1);
        setFeedback('correct');
      } else {
        setFeedback('wrong');
      }
    }

    setTimeout(() => advanceLevel(), 1200);
  };

  const advanceLevel = () => {
    if (level + 1 >= TOTAL_LEVELS) {
      finishGame(score + (feedback === 'correct' ? 10 : 0), correct + (feedback === 'correct' ? 1 : 0), TOTAL_LEVELS);
    } else {
      setLevel(l => l + 1);
    }
  };

  const finishGame = async (finalScore: number, finalCorrect: number, questionsAttempted: number) => {
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
  };

  const handlePostFinish = useCallback(() => {
    const nextGame = getNextGame();
    if (nextGame) navigate('/select-game');
    else { if (currentStudent) finishTest(currentStudent.username); navigate('/'); }
  }, [getNextGame, navigate, currentStudent, finishTest]);

  const handleEndTest = async () => {
    if (window.confirm('End this game? Current progress will be saved.')) {
      await finishGame(score, correct, level);
      navigate('/select-game');
    }
  };

  if (!currentStudent || !currentTest) return null;

  // Instructions Screen
  if (!gameStarted) {
    return (
      <div className="flex flex-col flex-1 w-full bg-[#F0F7FF] font-sans min-h-screen relative overflow-hidden">
        {/* Background Waves like Home Page */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#E0F2FE_0%,_#F0F9FF_40%,_#FFFFFF_100%)]" />
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#38BDF8] opacity-[0.05] blur-[120px] rounded-full" />
        </div>
        <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -top-[100px] -left-[10%] w-[120%] z-0 rotate-180 pointer-events-none" animate={true} />

        <div className="flex flex-col items-center justify-center p-4 relative z-10 w-full min-h-screen">
          <div className="bg-white/90 backdrop-blur-2xl border border-sky-100 rounded-[2.5rem] p-8 sm:p-12 max-w-lg w-full text-center shadow-[0_20px_60px_-15px_rgba(56,189,248,0.12)]">
            <div className="w-20 h-20 rounded-3xl bg-sky-100 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-sky-200/40">
              <Gamepad2 className="w-10 h-10 text-sky-500" />
            </div>
            <h1 className="text-[32px] sm:text-[40px] font-black text-[#0F172A] tracking-tight leading-none mb-4">Number Series</h1>
            <p className="text-[15px] sm:text-lg text-[#64748B] mb-8 font-medium leading-relaxed">
              Identify the pattern in the series and <b>drag the collector</b> to catch the falling correct number.
            </p>
            <div className="space-y-4 mb-10 text-left bg-sky-50/50 p-6 rounded-2xl border border-sky-100">
              <div className="flex items-center gap-3 text-sm font-bold text-sky-700">
                <div className="w-2 h-2 rounded-full bg-sky-500" /> Multiple series patterns
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-sky-700">
                <div className="w-2 h-2 rounded-full bg-sky-500" /> Hold and drag to move
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-sky-700">
                <div className="w-2 h-2 rounded-full bg-sky-500" /> 20 Levels and 10s per level
              </div>
            </div>
            <button
              onClick={() => { setGameStarted(true); startTime.current = Date.now(); }}
              className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-sky-500/25 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              <Play className="w-5 h-5 fill-current" /> START GAME
            </button>
          </div>
        </div>

        <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -bottom-[100px] -left-[10%] w-[120%] z-0 pointer-events-none" animate={true} />
      </div>
    );
  }

  const q = level < TOTAL_LEVELS ? questions[level] : null;

  return (
    <div
      className="flex flex-col flex-1 w-full bg-[#F0F7FF] font-sans min-h-screen relative overflow-hidden"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
      onTouchEnd={() => { isDragging.current = false; }}
    >
      <div className="absolute inset-x-0 bottom-24 flex justify-center pointer-events-none z-0">
        <div className="flex gap-12 opacity-[0.03]">
          <span className="text-[120px] font-black rotate-12">∑</span>
          <span className="text-[100px] font-black -rotate-12">π</span>
          <span className="text-[140px] font-black rotate-45">√</span>
          <span className="text-[110px] font-black -rotate-6">∞</span>
        </div>
      </div>

      <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -top-[100px] -left-[10%] w-[120%] z-0 rotate-180 pointer-events-none" animate={true} />

      {/* Premium Navbar */}
      <div className="relative z-50 w-full px-4 sm:px-8 py-4 flex items-center justify-between bg-white/60 backdrop-blur-xl border-b border-white/40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black text-[#0F172A] leading-none uppercase tracking-wider">Number Series</h2>
            <p className="text-[10px] font-bold text-sky-500 mt-1.5 uppercase tracking-widest">{currentStudent.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Time Left</span>
            <div className={`flex items-center gap-2 ${timeLeft <= 3 ? 'text-rose-500 animate-pulse' : 'text-sky-500'}`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-black text-xl">{timeLeft}s</span>
            </div>
          </div>
          <div className="w-px h-10 bg-slate-200/60" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Score</span>
            <div className="flex items-center gap-2 text-emerald-500">
              <Trophy className="w-4 h-4" />
              <span className="font-mono font-black text-xl">{currentTest?.showResults !== false ? score : '---'}</span>
            </div>
          </div>
          <button
            onClick={handleEndTest}
            className="ml-2 px-4 py-2 rounded-xl bg-white/80 border border-slate-200 text-[#94A3B8] hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-all font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-sm"
          >
            End Test
          </button>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-24 flex justify-center pointer-events-none z-0">
        <div className="flex gap-12 opacity-[0.03]">
          <span className="text-[120px] font-black rotate-12">∑</span>
          <span className="text-[100px] font-black -rotate-12">π</span>
          <span className="text-[140px] font-black rotate-45">√</span>
          <span className="text-[110px] font-black -rotate-6">∞</span>
        </div>
      </div>

      <DecorativeCurve opacity={0.03} height="h-[350px] sm:h-[450px]" className="absolute -top-[100px] -left-[10%] w-[120%] z-0 rotate-180 pointer-events-none" animate={true} />

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 w-full overflow-hidden">
        {gameOver ? (
          <div className="text-center animate-fade-in max-w-lg w-full px-4 py-12">
            <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-sky-500/30">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-[#0F172A] tracking-tight leading-none mb-4">Bravo!</h1>
            <p className="text-lg text-[#64748B] mb-12 font-medium">Session complete. Great job, {currentStudent.username}!</p>

            <div className="grid grid-cols-2 gap-6 mb-12 w-full">
              <div className="bg-white/70 backdrop-blur-3xl border border-white/60 rounded-[2.5rem] p-8 shadow-[0_20px_50px_-15px_rgba(56,189,248,0.1)] text-center">
                <span className="text-[11px] text-[#1e293b] font-black uppercase tracking-widest block mb-2">Total Points</span>
                <span className="font-mono font-black text-4xl text-sky-500 leading-none">{currentTest?.showResults !== false ? score : '---'}</span>
              </div>
              <div className="bg-white/70 backdrop-blur-3xl border border-white/60 rounded-[2.5rem] p-8 shadow-[0_20px_50px_-15px_rgba(56,189,248,0.1)] text-center">
                <span className="text-[11px] text-[#1e293b] font-black uppercase tracking-widest block mb-2">Accuracy</span>
                <span className="font-mono font-black text-4xl text-emerald-500 leading-none">{currentTest?.showResults !== false ? Math.round((correct / TOTAL_LEVELS) * 100) + '%' : '---'}</span>
              </div>
            </div>

            <button
              onClick={handlePostFinish}
              className="group relative inline-flex items-center justify-center gap-3 bg-sky-500 hover:bg-sky-600 text-white px-12 py-5 rounded-[2.2rem] font-black text-lg shadow-2xl shadow-sky-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">{getNextGame() ? 'Go to Next Game' : 'Finish Session'}</span>
              <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        ) : q && (
          <div
            className="w-full max-w-4xl flex flex-col items-center cursor-crosshair touch-none"
            ref={containerRef}
            onMouseDown={onMouseDown}
            onTouchStart={(e) => { isDragging.current = true; handleDrag(e.touches[0].clientX); }}
          >
            {/* Series Display - Optimized for One Page View */}
            <div className="mb-12 sm:mb-16 text-center animate-fade-in space-y-4">
              <div className="flex flex-col items-center gap-2">
                <span className="px-4 py-1.5 bg-sky-100/50 text-sky-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] inline-block border border-sky-200/50">
                  Level {level + 1} of {TOTAL_LEVELS}
                </span>
              </div>

              <div className="flex items-center gap-3 sm:gap-6 justify-center flex-wrap px-4">
                {q.series.map((n, i) => (
                  <div key={i} className="relative group">
                    <div className="absolute -inset-2 bg-sky-500/5 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative text-3xl sm:text-5xl font-black text-[#0F172A] tracking-tighter drop-shadow-sm">
                      {n}
                    </div>
                  </div>
                ))}
                <div className="relative">
                  <div className="absolute -inset-4 bg-sky-400/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative text-3xl sm:text-5xl font-black text-sky-500 animate-bounce tracking-tighter drop-shadow-md">
                    ?
                  </div>
                </div>
              </div>
            </div>

            {/* Main Interactive Stage - Compact Height */}
            <div className="relative w-full h-[280px] sm:h-[350px] overflow-visible select-none">

              {/* Option Lanes (Visual Guides) */}
              <div className="absolute inset-x-0 top-0 bottom-20 flex">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="flex-1 border-x border-slate-200/5 last:border-r-0 first:border-l-0" />
                ))}
              </div>

              {/* Falling Numbers - Scaled Down */}
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
                    text-xl sm:text-3xl font-black tracking-tight shadow-lg transition-all duration-300
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

              {/* Pattern Collector - Improved Handleability */}
              <div
                ref={bucketRef}
                className="absolute bottom-4 h-24 sm:h-32 w-[28%] max-w-[160px] pointer-events-none transition-transform duration-75 select-none z-30 group"
                style={{
                  left: `${bucketX}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute inset-x-2 -bottom-2 top-8 bg-sky-400/15 blur-2xl rounded-full opacity-0 group-active:opacity-100 transition-opacity" />

                  <div className="absolute inset-x-0 bottom-0 top-8 bg-gradient-to-tr from-sky-500 to-blue-600 rounded-b-[2rem] rounded-t-[1rem] shadow-xl border-x-[4px] border-white/20 transition-all group-active:scale-[0.98]">
                    <div className="absolute -top-2.5 inset-x-0 h-6 bg-white/10 backdrop-blur-md rounded-full border-t border-white/40 border-b border-black/10 shadow-inner overflow-hidden">
                      <div className="absolute inset-0 bg-sky-200/20 animate-pulse" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-1/2 bg-sky-300/30 blur-md rounded-full" />
                    </div>
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-white/40 shadow-glow shadow-white/20" />
                      <div className="w-1 h-1 rounded-full bg-white/40 shadow-glow shadow-white/20" />
                      <div className="w-1 h-1 rounded-full bg-white/40 shadow-glow shadow-white/20" />
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

        {/* Feedback Overlay - Compact Scale */}
        {feedback && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center z-[100] pointer-events-none px-4">
            <div className={`
              px-10 py-5 rounded-[2.5rem] font-black text-xl sm:text-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12)] 
              animate-fade-in-up text-white flex items-center gap-3 border-2 border-white/20 backdrop-blur-xl
              ${feedback === 'correct' ? 'bg-emerald-500' : 'bg-rose-500'}
            `}>
              {feedback === 'correct' ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
                    <span className="text-base">✓</span>
                  </div>
                  EXCELLENT!
                </>
              ) : feedback === 'timeout' ? (
                <>
                  <Clock className="w-6 h-6" />
                  TIME OUT!
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
                    <span className="text-base">✗</span>
                  </div>
                  INCORRECT
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <DecorativeCurve opacity={0.03} height="h-[350px] sm:h-[450px]" className="absolute -bottom-[80px] -left-[10%] w-[120%] z-0 pointer-events-none" animate={true} />
    </div>
  );
}
