import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Clock, Trophy, ArrowLeft } from 'lucide-react';
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
const TIME_PER_Q = 10;

const WATER_QUESTIONS = [
  'REASONING', 'NAME', 'MANTRI', 'MISSISSIPPI', 'PAN20',
  'PIONEER', 'P1PA2PU', 'CAT2015', 'NEXA', 'destination',
  'BRIDGE', 'FRUIT', 'DISC', 'RAJ589', '9654',
  'PQ8528', 'NUCLEAR', 'QUARREL', 'VAYU8436', 'GR98AP76ES'
];

interface WaterOption {
  text: string;
  isWater: boolean;
}

interface WaterQ {
  original: string;
  options: WaterOption[];
  correctIndex: number;
}

function generateWaterQ(input?: string): WaterQ {
  const chars = 'ABCDEGHKLMPRTUVWY23456789';
  let original = input || '';
  if (!original) {
    const len = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < len; i++) original += chars[Math.floor(Math.random() * chars.length)];
  }

  const options: WaterOption[] = [];

  // 1. Correct: Original string, flipped vertically
  options.push({ text: original, isWater: true });

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

  // 2. Trap: Similar string, flipped vertically
  options.push({ text: getSimilar(original), isWater: true });

  // 3. Trap: Another similar string, flipped vertically
  let s3 = getSimilar(original);
  while (options.some(o => o.text === s3)) s3 = getSimilar(original);
  options.push({ text: s3, isWater: true });

  // 4. Trap: Another similar string, flipped vertically
  let s4 = getSimilar(original);
  while (options.some(o => o.text === s4)) s4 = getSimilar(original);
  options.push({ text: s4, isWater: true });

  // Shuffle options
  const shuffledIndices = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
  const shuffledOptions = shuffledIndices.map(i => options[i]);
  const correctIndex = shuffledIndices.indexOf(0);

  return { original, options: shuffledOptions, correctIndex };
}

export default function WaterImageGame() {
  const navigate = useNavigate();
  const { currentStudent, currentTest, submitGameResult, addCompletedGame, finishTest, getNextGame } = useGame();

  const questions = useMemo(() => {
    const shuffled = [...WATER_QUESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.map(q => generateWaterQ(q));
  }, []);

  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selected, setSelected] = useState(-1);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (!currentStudent || !currentTest) { navigate('/'); return; }
    if (currentTest.status === 'FINISHED') navigate('/');
  }, [currentStudent, currentTest, navigate]);

  useEffect(() => {
    if (gameOver || level >= TOTAL_LEVELS) return;
    setTimeLeft(TIME_PER_Q);
    const iv = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleSelect(-1); return TIME_PER_Q; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [level, gameOver]);

  const handleSelect = useCallback((idx: number) => {
    if (feedback || gameOver) return;
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
        toast.error(OOPS_MESSAGES[Math.floor(Math.random() * OOPS_MESSAGES.length)], { icon: '💧' });
      }
    }

    setTimeout(() => {
      setFeedback(null);
      setSelected(-1);
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
      gameId: 'waterimage',
      score: finalScore,
      timeTaken,
      correctAnswers: finalCorrect,
      totalQuestions: attempted,
      completedAt: Date.now(),
    });
    addCompletedGame('waterimage');
    if (getNextGame()) {
      // Small celebration before next
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

  const handleEndTest = async () => {
    if (window.confirm('End this game? Current progress will be saved.')) {
      await finishGame(score, correct, level);
      navigate('/select-game');
    }
  };

  if (!currentStudent || !currentTest) return null;
  const q = level < TOTAL_LEVELS ? questions[level] : null;

  return (
    <div className={`flex flex-col h-screen bg-[#F0F7FF] font-sans overflow-hidden ${feedback === 'correct' ? 'flash-correct' : feedback === 'wrong' ? 'flash-wrong' : ''}`}>
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 bg-white/80 backdrop-blur border-b border-sky-100 z-20">
        <button onClick={handleEndTest} className="flex items-center gap-2 text-sm font-bold text-sky-500 hover:text-sky-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> End
        </button>
        <h1 className="text-base sm:text-lg font-black text-[#0F172A]">Water Image</h1>
        <div className="flex items-center gap-3 text-xs sm:text-sm font-bold">
          <span className="flex items-center gap-1 text-sky-500"><Clock className="w-4 h-4" />{timeLeft}s</span>
          <span className="flex items-center gap-1 text-emerald-500"><Trophy className="w-4 h-4" />{score}</span>
        </div>
      </div>

      <div className="h-1 bg-sky-100">
        <div className="h-full bg-sky-400 transition-all duration-300" style={{ width: `${(level / TOTAL_LEVELS) * 100}%` }} />
      </div>

      {gameOver ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-4">
          <div className="bg-white rounded-[20px] border border-sky-100 shadow-lg p-8 text-center max-w-sm w-full">
            <Trophy className="w-12 h-12 text-sky-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-[#0F172A] mb-2">Game Over!</h2>
            <p className="text-lg font-bold text-sky-500 mb-1">Score: {score}/{TOTAL_LEVELS}</p>
            <button
              onClick={handlePostFinish}
              className="w-full py-3 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 transition-colors mt-4"
            >
              {getNextGame() ? 'Next Game →' : 'Finish Session'}
            </button>
          </div>
        </div>
      ) : q && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-4">
          <p className="text-xs text-[#94A3B8] font-bold">Level {level + 1}/{TOTAL_LEVELS}</p>
          <p className="text-sm text-[#64748B] font-medium">Find the water reflection:</p>

          <div className="bg-white rounded-2xl border-2 border-sky-200 px-8 py-5 shadow-md">
            <span className="text-3xl sm:text-5xl font-black text-[#0F172A] tracking-[0.15em] font-mono">{q.original}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={feedback !== null}
                className={`py-4 rounded-2xl border-2 font-mono font-bold text-base tracking-wider transition-all duration-200 flex items-center justify-center
                  ${selected === i && feedback === 'correct' ? 'bg-emerald-50 border-emerald-400 text-emerald-600' :
                    selected === i && feedback === 'wrong' ? 'bg-red-50 border-red-400 text-red-600' :
                      'bg-white border-sky-200 text-[#0F172A] hover:border-sky-400 hover:shadow-md'}`}
              >
                <span style={{ transform: opt.isWater ? 'scaleY(-1)' : 'none', display: 'inline-block' }}>
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
