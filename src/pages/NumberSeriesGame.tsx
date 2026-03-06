import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Clock, Trophy, LogOut, Gamepad2, Play } from 'lucide-react';
import DecorativeCurve from '@/components/DecorativeCurve';

const TOTAL_LEVELS = 20;
const TIME_PER_Q = 10;

interface SeriesQ {
  series: number[];
  answer: number;
  options: number[];
}

function generateSeries(): SeriesQ {
  const type = Math.floor(Math.random() * 5);
  let series: number[] = [];
  let answer: number;

  switch (type) {
    case 0: { // arithmetic
      const start = Math.floor(Math.random() * 10) + 1;
      const diff = Math.floor(Math.random() * 8) + 2;
      for (let i = 0; i < 4; i++) series.push(start + diff * i);
      answer = start + diff * 4;
      break;
    }
    case 1: { // geometric
      const base = Math.floor(Math.random() * 3) + 2;
      const mult = Math.floor(Math.random() * 2) + 2;
      for (let i = 0; i < 4; i++) series.push(base * Math.pow(mult, i));
      answer = base * Math.pow(mult, 4);
      break;
    }
    case 2: { // squares
      const offset = Math.floor(Math.random() * 3) + 1;
      for (let i = offset; i < offset + 4; i++) series.push(i * i);
      answer = (offset + 4) * (offset + 4);
      break;
    }
    case 3: { // cubes
      const s = Math.floor(Math.random() * 2) + 1;
      for (let i = s; i < s + 4; i++) series.push(i * i * i);
      answer = (s + 4) * (s + 4) * (s + 4);
      break;
    }
    default: { // alternating add
      const a = Math.floor(Math.random() * 5) + 1;
      const d1 = Math.floor(Math.random() * 3) + 1;
      const d2 = Math.floor(Math.random() * 3) + 2;
      series = [a, a + d1, a + d1 + d2, a + d1 + d2 + d1];
      answer = a + d1 + d2 + d1 + d2;
      break;
    }
  }

  const wrongSet = new Set<number>();
  while (wrongSet.size < 3) {
    const delta = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
    const wrong = answer + delta;
    if (wrong !== answer && wrong > 0) wrongSet.add(wrong);
  }

  const options = [answer, ...wrongSet].sort(() => Math.random() - 0.5);
  return { series, answer, options };
}

export default function NumberSeriesGame() {
  const navigate = useNavigate();
  const { currentStudent, currentTest, submitGameResult, addCompletedGame, finishTest, getNextGame } = useGame();

  const questions = useMemo(() => Array.from({ length: TOTAL_LEVELS }, generateSeries), []);

  const [gameStarted, setGameStarted] = useState(false);
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
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

  // Fall animation
  useEffect(() => {
    if (!gameStarted || gameOver || caught || level >= TOTAL_LEVELS || feedback) return;

    // Increased speed slightly for more challenge as it moves down
    const speed = 0.2 + level * 0.03;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setFallProgress(prev => {
        const next = prev + delta * speed;

        // AUTO-CATCH CHECK (Around 85% progress)
        if (next >= 0.8 && next <= 0.9 && !caught) {
          const catchZoneWidth = 25; // Each option is roughly 25% wide
          const optionIndex = fallingOptions.findIndex((opt, i) => {
            const optCenterX = i * 25 + 12.5;
            return Math.abs(bucketX - optCenterX) < 10; // Bucket must be within 10% of option center
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
  }, [level, gameOver, caught, gameStarted, feedback, bucketX, fallingOptions]);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameOver || level >= TOTAL_LEVELS || feedback) return;
    setTimeLeft(TIME_PER_Q);
    const iv = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleAnswer(-1); return TIME_PER_Q; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [level, gameOver, gameStarted, feedback]);

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
      finishGame(score + feedback === 'correct' ? 10 : 0, correct + feedback === 'correct' ? 1 : 0, TOTAL_LEVELS);
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
    if (window.confirm('End test? Current progress will be saved.')) {
      await finishGame(score, correct, level);
      if (currentStudent) await finishTest(currentStudent.username);
      navigate('/');
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
              Identify the pattern in the series and <b>drag the bucket</b> to catch the falling correct number.
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
    >
      {/* Background aesthetics */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#E0F2FE_0%,_#F0F9FF_40%,_#FFFFFF_100%)]" />
      </div>
      <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -top-[100px] -left-[10%] w-[120%] z-0 rotate-180 pointer-events-none" animate={true} />

      {/* Premium Navbar */}
      <div className="relative z-50 w-full px-4 sm:px-8 py-4 flex items-center justify-between bg-white/40 backdrop-blur-md border-b border-sky-100">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black text-[#0F172A] leading-none uppercase tracking-wider">Number Series</h2>
            <p className="text-[10px] font-bold text-sky-500 mt-1 uppercase tracking-widest">{currentStudent.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Time</span>
            <div className="flex items-center gap-1.5 text-sky-500">
              <Clock className="w-4 h-4" />
              <span className="font-mono font-black text-lg">{timeLeft}s</span>
            </div>
          </div>
          <div className="w-px h-8 bg-sky-100" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Score</span>
            <div className="flex items-center gap-1.5 text-emerald-500">
              <Trophy className="w-4 h-4" />
              <span className="font-mono font-black text-lg">{currentTest?.showResults !== false ? score : '---'}</span>
            </div>
          </div>
          <button onClick={handleEndTest} className="ml-2 text-[10px] font-black uppercase tracking-widest text-[#94A3B8] hover:text-red-500 transition-colors py-2 px-3 rounded-xl border border-sky-100 bg-white/50">
            End Test
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 w-full">
        {gameOver ? (
          <div className="text-center animate-fade-in max-w-md w-full px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-sky-100 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-sky-200/40"><Trophy className="w-10 h-10 text-sky-500" /></div>
            <h1 className="text-[32px] sm:text-[42px] font-black text-black tracking-tight leading-none mb-3">Game Complete!</h1>
            <p className="text-[15px] text-[#64748B] mb-10 font-medium">Outstanding performance, {currentStudent.username}!</p>
            <div className="bg-white/90 backdrop-blur-2xl border border-sky-100 rounded-[2.5rem] p-10 mb-10 shadow-[0_20px_60px_-15px_rgba(56,189,248,0.12)]">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Score</span>
                  <span className="font-mono font-black text-3xl text-sky-500">{currentTest?.showResults !== false ? score : '---'}</span>
                </div>
                <div className="w-px h-12 bg-sky-100" />
                <div className="text-center">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Accuracy</span>
                  <span className="font-mono font-black text-3xl text-emerald-500">{currentTest?.showResults !== false ? Math.round((correct / TOTAL_LEVELS) * 100) + '%' : '---'}</span>
                </div>
              </div>
            </div>
            <button onClick={handlePostFinish} className="w-full sm:w-auto px-12 py-4 bg-sky-500 text-white rounded-2xl font-bold text-[16px] shadow-xl shadow-sky-500/25 transition-all hover:scale-105 active:scale-95">{getNextGame() ? 'Next Game →' : 'Finish Session'}</button>
          </div>
        ) : q && (
          <div className="w-full max-w-2xl flex flex-col items-center" ref={containerRef}>
            {/* Series Display - HIGH SPACING */}
            <div className="mb-24 sm:mb-32 text-center animate-fade-in">
              <p className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.3em] mb-4">Level {level + 1} / {TOTAL_LEVELS}</p>
              <div className="flex items-center gap-4 sm:gap-6 justify-center">
                {q.series.map((n, i) => (
                  <div key={i} className="text-3xl sm:text-5xl font-black text-[#0F172A] tracking-tighter">{n}</div>
                ))}
                <div className="text-3xl sm:text-5xl font-black text-sky-500 animate-pulse tracking-tighter">?</div>
              </div>
            </div>

            {/* Falling Area */}
            <div className="relative w-full h-[300px] sm:h-[400px] mt-8 overflow-visible">
              {fallingOptions.map((opt, i) => (
                <div
                  key={i}
                  className={`absolute w-[20%] transition-none flex justify-center`}
                  style={{
                    left: `${i * 25 + 2.5}%`,
                    top: `${fallProgress * 100}%`,
                    opacity: caught && i !== level ? 0.3 : 1,
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-white border border-sky-100 shadow-xl flex items-center justify-center text-xl sm:text-3xl font-black text-[#0F172A] ${feedback && caught && fallingOptions[i] === q.answer ? 'ring-4 ring-emerald-400 border-transparent' : ''}`}>
                    {opt}
                  </div>
                </div>
              ))}

              {/* Bucket (Draggable) */}
              <div
                ref={bucketRef}
                onMouseDown={onMouseDown}
                onTouchStart={(e) => { isDragging.current = true; handleDrag(e.touches[0].clientX); }}
                onTouchMove={onTouchMove}
                onTouchEnd={() => isDragging.current = false}
                className="absolute bottom-[-20px] h-16 sm:h-20 w-[20%] max-w-[120px] rounded-3xl bg-white/80 backdrop-blur-md border-2 border-sky-400 shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform duration-75 select-none"
                style={{
                  left: `${bucketX}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-8 h-1 bg-sky-200 rounded-full mb-1" />
                  <span className="text-2xl sm:text-3xl">🪣</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Overlay */}
        {feedback && (
          <div className="absolute inset-0 flex items-center justify-center z-[100] pointer-events-none">
            <div className={`px-10 py-6 rounded-[2rem] font-black text-2xl shadow-2xl animate-scale-in text-white ${feedback === 'correct' ? 'bg-emerald-500' : 'bg-red-500'}`}>
              {feedback === 'correct' ? '✓ EXCELLENT!' : feedback === 'timeout' ? '⏰ TIME OUT!' : '✗ INCORRECT!'}
            </div>
          </div>
        )}
      </div>

      <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -bottom-[100px] -left-[10%] w-[120%] z-0 pointer-events-none" animate={true} />
    </div>
  );
}
