import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Clock, Trophy } from 'lucide-react';
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
function getRoundTime(level: number) {
  return level < 10 ? 10 : 5;
}

const MIRROR_QUESTIONS = [
  'BANKING', 'RESEARCH', 'SUMMER', 'AQ716P', '7156',
  'INDIA', 'AMBULANCE', 'DEGREE', '99663125', 'STROKE',
  'SUPERVISOR', 'JUDGEMENT', 'TERMINATE', 'FIXING', 'MALAYALAM',
  'GEOGRAPHY', 'INFORMATION', 'REASONING', 'EFFECTIVE', 'MAGAZINE'
];
interface MirrorOption {
  text: string;
  isMirror: boolean;
}

interface MirrorQ {
  original: string;
  options: MirrorOption[];
  correctIndex: number;
}

function generateMirrorQ(input?: string): MirrorQ {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  let original = input || '';

  if (!original) {
    const len = Math.floor(Math.random() * 4) + 3;
    for (let i = 0; i < len; i++) original += chars[Math.floor(Math.random() * chars.length)];
  }

  const options: MirrorOption[] = [];

  // 1. Correct: Original string, mirrored
  options.push({ text: original, isMirror: true });

  // Helper to get a similar string (1 char difference)
  const getSimilar = (str: string) => {
    const arr = str.split('');
    const pos = Math.floor(Math.random() * arr.length);
    let newChar = chars[Math.floor(Math.random() * chars.length)];
    while (newChar === arr[pos]) {
      newChar = chars[Math.floor(Math.random() * chars.length)];
    }
    arr[pos] = newChar;
    return arr.join('');
  };

  // 2. Trap: Similar string, mirrored
  options.push({ text: getSimilar(original), isMirror: true });

  // 3. Trap: Another similar string, mirrored
  let s3 = getSimilar(original);
  while (options.some(o => o.text === s3)) s3 = getSimilar(original);
  options.push({ text: s3, isMirror: true });

  // 4. Trap: Another similar string, mirrored
  let s4 = getSimilar(original);
  while (options.some(o => o.text === s4)) s4 = getSimilar(original);
  options.push({ text: s4, isMirror: true });

  // Shuffle options
  const shuffledIndices = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
  const shuffledOptions = shuffledIndices.map(i => options[i]);
  const correctIndex = shuffledIndices.indexOf(0);

  return { original, options: shuffledOptions, correctIndex };
}

export default function MirrorImageGame() {
  const navigate = useNavigate();
  const { currentStudent, currentTest, submitGameResult, addCompletedGame, finishTest, getNextGame } = useGame();

  const questions = useMemo(() => {
    const shuffled = [...MIRROR_QUESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.map(q => generateMirrorQ(q));
  }, []);

  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(getRoundTime(0));
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selected, setSelected] = useState(-1);
  const startTime = useRef(Date.now());
  const isSubmitting = useRef(false);

  useEffect(() => {
    if (!currentStudent || !currentTest) { navigate('/'); return; }
    if (currentTest.status === 'FINISHED') navigate('/');
  }, [currentStudent, currentTest, navigate]);

  useEffect(() => {
    if (gameOver || level >= TOTAL_LEVELS) return;
    setTimeLeft(getRoundTime(level));
    const iv = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleSelect(-1); return getRoundTime(level); }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [level, gameOver]);

  const handleSelect = useCallback((idx: number) => {
    if (feedback || gameOver || isSubmitting.current) return;
    isSubmitting.current = true;
    setSelected(idx);
    const q = questions[level];
    const isCorrect = idx === q.correctIndex;
    const newScore = isCorrect ? score + 10 : score;
    const newCorrect = isCorrect ? correct + 1 : correct;
    setScore(newScore);
    setCorrect(newCorrect);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (currentTest?.showResults !== false) {
      if (isCorrect) {
        toast.success(SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)], { icon: '✨' });
      } else {
        toast.error(OOPS_MESSAGES[Math.floor(Math.random() * OOPS_MESSAGES.length)], { icon: '🪞' });
      }
    }

    setTimeout(() => {
      setFeedback(null);
      setSelected(-1);
      isSubmitting.current = false;
      if (level + 1 >= TOTAL_LEVELS) {
        finishGame(newScore, newCorrect, level + 1);
      } else {
        setLevel(l => l + 1);
      }
    }, 600);
  }, [feedback, gameOver, level, questions, score, correct]);

  const finishGame = async (finalScore: number, finalCorrect: number, attempted: number) => {
    setGameOver(true);
    if (!currentStudent) return;
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    await submitGameResult(currentStudent.username, {
      gameId: 'mirror',
      score: finalScore,
      timeTaken,
      correctAnswers: finalCorrect,
      totalQuestions: attempted,
      completedAt: Date.now(),
    });
    addCompletedGame('mirror');
    if (getNextGame()) {
      // Keep momentum
    } else {
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
    }
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
  const q = level < TOTAL_LEVELS ? questions[level] : null;

  return (
    <div className={`flex flex-col h-screen bg-transparent font-sans overflow-hidden ${feedback === 'correct' ? 'flash-correct' : feedback === 'wrong' ? 'flash-wrong' : ''}`}>
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 bg-white/80 backdrop-blur border-b border-sky-100 z-20">
        <div className="w-[100px]" />
        <h1 className="text-base sm:text-lg font-black text-[#0F172A]">Mirror Image</h1>
        <div className="flex items-center gap-3 text-xs sm:text-sm font-bold">
          <span className="flex items-center gap-1 text-emerald-500"><Trophy className="w-4 h-4" />{currentTest?.showResults !== false ? score : '---'}</span>
        </div>
      </div>

      <div className="h-1 bg-sky-100">
        <div className="h-full bg-sky-400 transition-all duration-300" style={{ width: `${(level / TOTAL_LEVELS) * 100}%` }} />
      </div>

      {gameOver ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
          <div className="text-center animate-fade-in max-w-md w-full">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-sky-100 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-sky-200/40">
              <Trophy className="w-10 h-10 text-sky-500" />
            </div>
            <h1 className="text-[32px] sm:text-[40px] font-black text-[#0F172A] tracking-tight leading-none mb-3">Mirror Image Complete!</h1>
            <p className="text-[15px] text-[#64748B] mb-10 font-medium">Excellent work, {currentStudent?.username}!</p>

            <div className="bg-white/90 backdrop-blur-2xl border border-sky-100 rounded-[2.5rem] p-10 mb-10 shadow-[0_20px_60px_-15px_rgba(56,189,248,0.12)]">
              <div className="flex items-center justify-center gap-10">
                <div className="text-center">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Score</span>
                  <span className="font-mono font-black text-3xl sm:text-4xl text-sky-500">{currentTest?.showResults !== false ? score : '---'}</span>
                </div>
                <div className="w-px h-14 bg-sky-100" />
                <div className="text-center">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Correct</span>
                  <span className="font-mono font-black text-3xl sm:text-4xl text-emerald-500">{currentTest?.showResults !== false ? `${correct}/${TOTAL_LEVELS}` : '---'}</span>
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
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
          <p className="text-xs text-[#94A3B8] font-bold">Level {level + 1}/{TOTAL_LEVELS}</p>

          {/* Timer */}
          <div className="flex flex-col items-center gap-2 w-full max-w-sm">
            <div className="flex items-center justify-between w-full px-1">
              <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest flex items-center gap-1"><Clock className="w-3 h-3" /> Time</span>
              <span className={`text-xl font-black font-mono tabular-nums transition-colors duration-300 ${timeLeft <= 3 ? 'text-rose-500 animate-pulse' : timeLeft <= 5 ? 'text-orange-500' : 'text-sky-500'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="relative w-full h-3 bg-sky-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-linear ${timeLeft <= 3 ? 'bg-rose-500' : timeLeft <= 5 ? 'bg-orange-400' : 'bg-sky-500'
                  }`}
                style={{ width: `${(timeLeft / getRoundTime(level)) * 100}%` }}
              />
            </div>
          </div>

          <p className="text-sm text-[#64748B] font-medium">Find the mirror image of:</p>
          <div className="bg-white rounded-2xl border-2 border-sky-200 px-8 py-6 shadow-md">
            <span className="text-3xl sm:text-5xl font-black text-[#0F172A] tracking-[0.15em] font-mono">{q.original}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={feedback !== null}
                className={`py-4 rounded-2xl border-2 font-mono font-bold text-lg tracking-wider transition-all duration-200 flex items-center justify-center
                  ${selected === i && feedback === 'correct' ? 'bg-emerald-50 border-emerald-400 text-emerald-600' :
                    selected === i && feedback === 'wrong' ? 'bg-red-50 border-red-400 text-red-600' :
                      'bg-white border-sky-200 text-[#0F172A] hover:border-sky-400 hover:shadow-md'}`}
              >
                <span style={{ transform: opt.isMirror ? 'scaleX(-1)' : 'none', display: 'inline-block' }}>
                  {opt.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
