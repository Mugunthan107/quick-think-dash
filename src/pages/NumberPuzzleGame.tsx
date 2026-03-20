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
  return level < 15 ? 10 : 5;
}

interface PuzzleQ {
  grid: (number | null)[][];
  answer: number;
  options: number[];
  missingRow: number;
  missingCol: number;
  type: number;
}

function generatePuzzle(level: number): PuzzleQ {
  let grid: number[][] = [];
  let answer = 0;

  // Decide orientation: 0 = Horizontal (Rows), 1 = Vertical (Columns)
  // Each row/column will now have its OWN independent arithmetic sequence logic.
  const type = Math.random() > 0.5 ? 0 : 1;

  // Difficulty Scaling
  const range = level < 5 ? 5 : level < 10 ? 15 : 25;
  const stepRange = level < 5 ? 5 : level < 10 ? 10 : 15;

  if (type === 0) { // Horizontal Pattern (Rows)
    for (let r = 0; r < 4; r++) {
      const start = Math.floor(Math.random() * range) + 1;
      const rowStep = Math.floor(Math.random() * stepRange) + 2;
      grid.push([start, start + rowStep, start + 2 * rowStep, start + 3 * rowStep]);
    }
  } else { // Vertical Pattern (Columns)
    const columnStarts = Array.from({ length: 4 }, () => Math.floor(Math.random() * range) + 1);
    const columnSteps = Array.from({ length: 4 }, () => Math.floor(Math.random() * stepRange) + 2);
    for (let r = 0; r < 4; r++) {
      grid.push(columnStarts.map((s, c) => s + columnSteps[c] * r));
    }
  }

  // ---------- Remove One Cell ----------
  const missingRow = Math.floor(Math.random() * 4);
  const missingCol = Math.floor(Math.random() * 4);
  answer = grid[missingRow][missingCol];

  const displayGrid = grid.map((row, r) =>
    row.map((val, c) => (r === missingRow && c === missingCol ? null : val))
  );

  // ---------- Smart Wrong Options ----------
  const wrongSet = new Set<number>();
  wrongSet.add(answer + 1);
  wrongSet.add(answer - 1 > 0 ? answer - 1 : answer + 2);
  wrongSet.add(answer + 10);
  wrongSet.add(answer - 5 > 0 ? answer - 5 : answer + 7);

  const options = Array.from(wrongSet)
    .filter(v => v !== answer)
    .slice(0, 3);
  
  const finalOptions = [answer, ...options]
    .sort(() => Math.random() - 0.5);

  return { grid: displayGrid, answer, options: finalOptions, missingRow, missingCol, type };
}

function getExplanation(type: number) {
  return type === 0 
    ? "Pattern: Each ROW follows its own sequence (Left to Right)." 
    : "Pattern: Each COLUMN follows its own sequence (Top to Bottom).";
}


export default function NumberPuzzleGame() {
  const navigate = useNavigate();
  const { currentStudent, currentTest, submitGameResult, addCompletedGame, finishTest, getNextGame } = useGame();

  const questions = useMemo(
    () => Array.from({ length: TOTAL_LEVELS }, (_, i) => generatePuzzle(i)),
    []
  );

  const [level, setLevel] = useState(0);
  const [streak, setStreak] = useState(0);
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
        if (prev <= 0) {
          handleSelectRef.current(-1);
          return 0;
        }
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
    const isCorrect = idx >= 0 && q.options[idx] === q.answer;

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak >= 3) {
        setScore(prev => prev + 5); // bonus
      }
    } else {
      setStreak(0);
    }

    const newScore = isCorrect ? score + 10 : score;
    const newCorrect = isCorrect ? correct + 1 : correct;
    setScore(newScore);
    setCorrect(newCorrect);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect && currentTest?.showResults !== false) {
      toast.success(SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)], { icon: '🧩' });
    } else if (currentTest?.showResults !== false) {
      toast.error(OOPS_MESSAGES[Math.floor(Math.random() * OOPS_MESSAGES.length)], { icon: '🤔' });
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
    }, 1000);
  }, [feedback, gameOver, level, questions, score, correct, streak]);

  const handleSelectRef = useRef(handleSelect);
  useEffect(() => {
    handleSelectRef.current = handleSelect;
  }, [handleSelect]);



  const finishGame = async (finalScore: number, finalCorrect: number, attempted: number) => {
    setGameOver(true);
    if (!currentStudent) return;
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    await submitGameResult(currentStudent.username, {
      gameId: 'numpuzzle',
      score: finalScore,
      timeTaken,
      correctAnswers: finalCorrect,
      totalQuestions: attempted,
      completedAt: Date.now(),
    });
    addCompletedGame('numpuzzle');
    confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
  };

  const handleFinish = useCallback(() => {
    finishGame(score, correct, level);
  }, [score, correct, level]);

  useEffect(() => {
    const onEndGame = () => handleFinish();
    window.addEventListener('endGame', onEndGame);
    return () => window.removeEventListener('endGame', onEndGame);
  }, [handleFinish]);

  const handlePostFinish = useCallback(() => {
    const next = getNextGame();
    if (next) {
      navigate('/select-game');
    } else {
      if (currentStudent) finishTest(currentStudent.username);
      navigate('/');
    }
  }, [getNextGame, navigate, currentStudent, finishTest]);


  // Broadcast stats to global NavBar
  useEffect(() => {
    if (!gameOver) {
      const stats = { score: currentTest?.showResults !== false ? score : '---', level: level + 1, total: TOTAL_LEVELS };
      window.dispatchEvent(new CustomEvent('gameStats', { detail: stats }));
    }
    return () => {
      window.dispatchEvent(new CustomEvent('gameStats', { detail: null }));
    };
  }, [score, level, gameOver, currentTest?.showResults]);

  if (!currentStudent || !currentTest) return null;
  const q = level < TOTAL_LEVELS ? questions[level] : null;

  return (
    <div className={`flex flex-col h-screen bg-transparent font-sans overflow-hidden ${feedback === 'correct' ? 'flash-correct' : feedback === 'wrong' ? 'flash-wrong' : ''}`}>
      <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 relative z-10 w-full overflow-hidden">

      {gameOver ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
          <div className="text-center animate-fade-in max-w-md w-full">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-sky-100 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-sky-200/40">
              <Trophy className="w-10 h-10 text-sky-500" />
            </div>
            <h1 className="text-[32px] sm:text-[40px] font-black text-[#0F172A] tracking-tight leading-none mb-3">Number Puzzle Complete!</h1>
            <p className="text-[15px] text-[#64748B] mb-10 font-medium">Great job, {currentStudent?.username}!</p>

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
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs text-[#94A3B8] font-bold">Level {level + 1}/{TOTAL_LEVELS}</p>
            <p className="text-xs font-bold text-[#94A3B8]">
              {level < 5 ? "Easy" : level < 10 ? "Medium" : "Hard"}
            </p>
          </div>


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

          <p className="text-sm text-[#64748B] font-medium">Find the missing number:</p>

          {/* 4x4 Grid */}
          <div className="bg-white rounded-2xl border-2 border-sky-200 p-3 sm:p-4 shadow-md">
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {q.grid.flatMap((row, r) =>
                row.map((val, c) => (
                  <div
                    key={`${r}-${c}`}
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center font-black text-lg sm:text-2xl
                      ${val === null
                        ? 'bg-sky-100 border-2 border-dashed border-sky-400 text-sky-500'
                        : 'bg-[#F8FAFC] border border-sky-100 text-[#0F172A]'}`}
                  >
                    {val === null ? '?' : val}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={feedback !== null}
                className={`py-4 rounded-2xl border-2 font-bold text-xl transition-all duration-200
                  ${selected === i && feedback === 'correct' ? 'bg-emerald-50 border-emerald-400 text-emerald-600' :
                    selected === i && feedback === 'wrong' ? 'bg-red-50 border-red-400 text-red-600' :
                      'bg-white border-sky-200 text-[#0F172A] hover:border-sky-400 hover:shadow-md'}`}
              >
                {opt}
              </button>
            ))}
          </div>

          {feedback && (
            <p className="text-xs text-gray-500 mt-2">
              {getExplanation(q.type)}
            </p>
          )}

        </div>
      )}
      </div>
    </div>
  );
}
