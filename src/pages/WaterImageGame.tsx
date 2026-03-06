import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Clock, Trophy, ArrowLeft } from 'lucide-react';

const TOTAL_LEVELS = 20;
const TIME_PER_Q = 10;

interface WaterQ {
  original: string;
  answer: string;
  options: string[];
}

// Water reflection = vertical flip. For text, we simulate by flipping upside-down
// Using Unicode flip approximations
const FLIP_MAP: Record<string, string> = {
  'A': '∀', 'B': 'q', 'C': 'Ɔ', 'D': 'p', 'E': 'Ǝ', 'F': 'Ⅎ',
  'G': '⅁', 'H': 'H', 'J': 'ſ', 'K': 'ʞ', 'L': '˥', 'M': 'W',
  'N': 'N', 'P': 'd', 'R': 'ɹ', 'T': '⊥', 'U': '∩', 'V': 'Λ',
  'W': 'M', 'Y': '⅄', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ',
  '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6', '0': '0',
};

function flipChar(c: string): string {
  return FLIP_MAP[c] || c;
}

function waterFlip(s: string): string {
  return s.split('').map(flipChar).join('');
}

function generateWaterQ(): WaterQ {
  const chars = 'ABCDEGHKLMPRTUVWY23456789';
  const len = Math.floor(Math.random() * 3) + 3;
  let original = '';
  for (let i = 0; i < len; i++) original += chars[Math.floor(Math.random() * chars.length)];

  const answer = waterFlip(original);

  const wrongSet = new Set<string>();
  // Reversed original
  wrongSet.add(original.split('').reverse().join(''));
  // Original itself
  wrongSet.add(original);
  // Partial flip
  const half = Math.ceil(original.length / 2);
  wrongSet.add(waterFlip(original.slice(0, half)) + original.slice(half));
  // Reverse of water flip
  wrongSet.add(waterFlip(original).split('').reverse().join(''));

  wrongSet.delete(answer);
  const wrongs = [...wrongSet].slice(0, 3);
  while (wrongs.length < 3) {
    const r = original.split('').sort(() => Math.random() - 0.5).map(flipChar).join('');
    if (r !== answer && !wrongs.includes(r)) wrongs.push(r);
  }

  const options = [answer, ...wrongs.slice(0, 3)].sort(() => Math.random() - 0.5);
  return { original, answer, options };
}

export default function WaterImageGame() {
  const navigate = useNavigate();
  const { currentStudent, currentTest, submitGameResult, addCompletedGame, finishTest, getNextGame } = useGame();

  const questions = useMemo(() => Array.from({ length: TOTAL_LEVELS }, generateWaterQ), []);

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
    const isCorrect = idx >= 0 && q.options[idx] === q.answer;
    const newScore = isCorrect ? score + 1 : score;
    const newCorrect = isCorrect ? correct + 1 : correct;
    setScore(newScore);
    setCorrect(newCorrect);
    setFeedback(isCorrect ? 'correct' : 'wrong');

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
    await finishGame(score, correct, level);
    if (currentStudent) await finishTest(currentStudent.username);
    navigate('/');
  };

  if (!currentStudent || !currentTest) return null;
  const q = level < TOTAL_LEVELS ? questions[level] : null;

  return (
    <div className="flex flex-col h-screen bg-[#F0F7FF] font-sans overflow-hidden">
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

          {/* Original with reflection line */}
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-2xl border-2 border-sky-200 px-8 py-5 shadow-md">
              <span className="text-3xl sm:text-5xl font-black text-[#0F172A] tracking-[0.15em] font-mono">{q.original}</span>
            </div>
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-sky-300 to-transparent my-2" />
            <div className="bg-sky-50/50 rounded-2xl border border-dashed border-sky-200 px-8 py-4">
              <span className="text-2xl sm:text-4xl font-black text-sky-300 tracking-[0.15em] font-mono" style={{ transform: 'scaleY(-1)', display: 'inline-block' }}>
                {q.original}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={feedback !== null}
                className={`py-4 rounded-2xl border-2 font-mono font-bold text-base tracking-wider transition-all duration-200
                  ${selected === i && feedback === 'correct' ? 'bg-emerald-50 border-emerald-400 text-emerald-600' :
                    selected === i && feedback === 'wrong' ? 'bg-red-50 border-red-400 text-red-600' :
                      'bg-white border-sky-200 text-[#0F172A] hover:border-sky-400 hover:shadow-md'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
