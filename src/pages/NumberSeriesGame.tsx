import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Clock, Trophy, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const { currentStudent, currentTest, submitGameResult, addCompletedGame, finishTest } = useGame();

  const questions = useMemo(() => Array.from({ length: TOTAL_LEVELS }, generateSeries), []);

  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [bucketPos, setBucketPos] = useState(1); // 0-3
  const [fallingOptions, setFallingOptions] = useState<number[]>([]);
  const [fallProgress, setFallProgress] = useState(0);
  const [caught, setCaught] = useState(false);
  const startTime = useRef(Date.now());
  const animFrame = useRef<number>();

  useEffect(() => {
    if (!currentStudent || !currentTest) { navigate('/'); return; }
    if (currentTest.status === 'FINISHED') { navigate('/'); }
  }, [currentStudent, currentTest, navigate]);

  // Set falling options when level changes
  useEffect(() => {
    if (level < TOTAL_LEVELS && !gameOver) {
      setFallingOptions(questions[level].options);
      setFallProgress(0);
      setCaught(false);
      setBucketPos(1);
    }
  }, [level, gameOver, questions]);

  // Fall animation
  useEffect(() => {
    if (gameOver || caught || level >= TOTAL_LEVELS) return;
    const speed = 0.3 + level * 0.04; // increases with level
    let lastTime = performance.now();
    const animate = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      setFallProgress(prev => {
        const next = prev + delta * speed;
        if (next >= 1) {
          // missed - auto timeout
          return 1;
        }
        return next;
      });
      animFrame.current = requestAnimationFrame(animate);
    };
    animFrame.current = requestAnimationFrame(animate);
    return () => { if (animFrame.current) cancelAnimationFrame(animFrame.current); };
  }, [level, gameOver, caught]);

  // Check if fallen past bucket
  useEffect(() => {
    if (fallProgress >= 1 && !caught && !gameOver) {
      handleAnswer(-1); // missed
    }
  }, [fallProgress, caught, gameOver]);

  // Timer
  useEffect(() => {
    if (gameOver || level >= TOTAL_LEVELS) return;
    setTimeLeft(TIME_PER_Q);
    const iv = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleAnswer(-1); return TIME_PER_Q; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [level, gameOver]);

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (gameOver || caught) return;
      if (e.key === 'ArrowLeft') setBucketPos(p => Math.max(0, p - 1));
      if (e.key === 'ArrowRight') setBucketPos(p => Math.min(3, p + 1));
      if (e.key === ' ' || e.key === 'Enter') catchAtPosition();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameOver, caught, bucketPos, level, fallProgress]);

  const catchAtPosition = useCallback(() => {
    if (caught || gameOver || level >= TOTAL_LEVELS) return;
    setCaught(true);
    const selectedAnswer = fallingOptions[bucketPos];
    if (selectedAnswer === questions[level].answer) {
      setScore(s => s + 1);
      setCorrect(c => c + 1);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
    setTimeout(() => {
      setFeedback(null);
      if (level + 1 >= TOTAL_LEVELS) {
        finishGame(score + (fallingOptions[bucketPos] === questions[level].answer ? 1 : 0), correct + (fallingOptions[bucketPos] === questions[level].answer ? 1 : 0), level + 1);
      } else {
        setLevel(l => l + 1);
      }
    }, 600);
  }, [caught, gameOver, level, bucketPos, fallingOptions, questions, score, correct]);

  const handleAnswer = useCallback((idx: number) => {
    if (caught || gameOver) return;
    setCaught(true);
    if (idx >= 0 && fallingOptions[idx] === questions[level].answer) {
      setScore(s => s + 1);
      setCorrect(c => c + 1);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
    setTimeout(() => {
      setFeedback(null);
      const newScore = idx >= 0 && fallingOptions[idx] === questions[level].answer ? score + 1 : score;
      const newCorrect = idx >= 0 && fallingOptions[idx] === questions[level].answer ? correct + 1 : correct;
      if (level + 1 >= TOTAL_LEVELS) {
        finishGame(newScore, newCorrect, level + 1);
      } else {
        setLevel(l => l + 1);
      }
    }, 600);
  }, [caught, gameOver, level, fallingOptions, questions, score, correct]);

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

  const handleEndTest = async () => {
    await finishGame(score, correct, level);
    if (currentStudent) await finishTest(currentStudent.username);
    navigate('/');
  };

  if (!currentStudent || !currentTest) return null;

  const q = level < TOTAL_LEVELS ? questions[level] : null;

  return (
    <div className="flex flex-col h-screen bg-[#F0F7FF] font-sans overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 bg-white/80 backdrop-blur border-b border-sky-100 z-20">
        <button onClick={handleEndTest} className="flex items-center gap-2 text-sm font-bold text-sky-500 hover:text-sky-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> End
        </button>
        <h1 className="text-base sm:text-lg font-black text-[#0F172A]">Number Series</h1>
        <div className="flex items-center gap-3 text-xs sm:text-sm font-bold">
          <span className="flex items-center gap-1 text-sky-500"><Clock className="w-4 h-4" />{timeLeft}s</span>
          <span className="flex items-center gap-1 text-emerald-500"><Trophy className="w-4 h-4" />{score}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-sky-100">
        <div className="h-full bg-sky-400 transition-all duration-300" style={{ width: `${((level) / TOTAL_LEVELS) * 100}%` }} />
      </div>

      {gameOver ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-4">
          <div className="bg-white rounded-[20px] border border-sky-100 shadow-lg p-8 text-center max-w-sm w-full">
            <Trophy className="w-12 h-12 text-sky-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-[#0F172A] mb-2">Game Over!</h2>
            <p className="text-lg font-bold text-sky-500 mb-1">Score: {score}/{TOTAL_LEVELS}</p>
            <p className="text-sm text-[#64748B] mb-6">Correct: {correct}</p>
            <div className="flex gap-3">
              <button onClick={() => navigate('/')} className="flex-1 py-3 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 transition-colors">Home</button>
            </div>
          </div>
        </div>
      ) : q && (
        <div className="flex-1 flex flex-col items-center justify-between p-4 relative overflow-hidden">
          {/* Series display */}
          <div className="text-center mb-4 mt-2">
            <p className="text-xs text-[#94A3B8] font-bold mb-2">Level {level + 1}/{TOTAL_LEVELS}</p>
            <div className="flex items-center gap-2 sm:gap-3 justify-center flex-wrap">
              {q.series.map((n, i) => (
                <span key={i} className="text-xl sm:text-3xl font-black text-[#0F172A]">{n}</span>
              ))}
              <span className="text-xl sm:text-3xl font-black text-sky-500">?</span>
            </div>
          </div>

          {/* Falling area */}
          <div className="relative w-full max-w-md h-48 sm:h-64">
            {fallingOptions.map((opt, i) => (
              <div
                key={i}
                className={`absolute w-[22%] transition-none ${feedback && caught && i === bucketPos ? (opt === q.answer ? 'ring-2 ring-emerald-400' : 'ring-2 ring-red-400') : ''}`}
                style={{
                  left: `${i * 25 + 1.5}%`,
                  top: `${fallProgress * 70}%`,
                  transition: 'none',
                }}
              >
                <button
                  onClick={() => { setBucketPos(i); catchAtPosition(); }}
                  disabled={caught}
                  className="w-full py-3 sm:py-4 rounded-2xl bg-white border-2 border-sky-200 text-lg sm:text-xl font-black text-[#0F172A] shadow-md hover:border-sky-400 transition-colors"
                >
                  {opt}
                </button>
              </div>
            ))}

            {/* Bucket */}
            <div
              className="absolute bottom-0 h-10 sm:h-12 rounded-xl bg-sky-500/20 border-2 border-sky-400 transition-all duration-150"
              style={{ left: `${bucketPos * 25 + 1.5}%`, width: '22%' }}
            >
              <div className="w-full h-full flex items-center justify-center text-sky-600 font-black text-xs">🪣</div>
            </div>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-4 mt-4">
            <button onClick={() => setBucketPos(p => Math.max(0, p - 1))} className="w-14 h-14 rounded-2xl bg-white border-2 border-sky-200 flex items-center justify-center shadow-md active:scale-95 transition-transform">
              <ChevronLeft className="w-6 h-6 text-sky-500" />
            </button>
            <button onClick={catchAtPosition} disabled={caught} className="px-8 py-4 rounded-2xl bg-sky-500 text-white font-black text-sm shadow-md active:scale-95 transition-transform disabled:opacity-50">
              CATCH
            </button>
            <button onClick={() => setBucketPos(p => Math.min(3, p + 1))} className="w-14 h-14 rounded-2xl bg-white border-2 border-sky-200 flex items-center justify-center shadow-md active:scale-95 transition-transform">
              <ChevronRight className="w-6 h-6 text-sky-500" />
            </button>
          </div>

          {/* Feedback overlay */}
          {feedback && (
            <div className={`absolute inset-0 flex items-center justify-center z-30 pointer-events-none`}>
              <div className={`px-8 py-4 rounded-2xl font-black text-xl ${feedback === 'correct' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'} animate-scale-in`}>
                {feedback === 'correct' ? '✓ Correct!' : '✗ Wrong!'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
