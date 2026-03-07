import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Clock, Trophy, GripHorizontal, Timer, RotateCcw, Hash, Star } from 'lucide-react';
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

// ——— Types ——————————————————————————————————————————————————————————————————————
interface CrossMathPuzzle {
  id: number;
  a: number;
  op1: string;
  b: number;
  r1: number;
  op2: string;
  c: number;
  r2: number;
  op3: string;
  d: number;
  r3: number;
  blanks: number[];
  values: number[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

const TOTAL_QUESTIONS = 20;

// ——— Helpers ——————————————————————————————————————————————————————————————————————
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function opSymbol(op: string) {
  if (op === '*') return '×';
  if (op === '/') return '÷';
  return op;
}

function getBlankIndex(i: number, qIndex: number): number {
  const blankMap: Record<number, number[]> = {
    0: [0, 2],
    1: [0, 2, 4],
    2: [0, 2, 4, 6],
    3: [0, 2, 4, 6, 1] // Expert uses 5
  };
  const tier = Math.floor(qIndex / 5);
  return blankMap[tier]?.indexOf(i) ?? -1;
}

function getTotalTime(qIndex: number): number {
  if (qIndex < 5) return 10;
  if (qIndex < 10) return 15;
  if (qIndex < 15) return 20;
  return 25;
}

function compute(a: number, op: string, b: number): number {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return a / b;
    default: return 0;
  }
}

// ——— Puzzle Generator ————————————————————————————————————————————————————————————
function generatePuzzle(index: number): CrossMathPuzzle {
  let difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  if (index < 5) difficulty = 'easy';
  else if (index < 10) difficulty = 'medium';
  else if (index < 15) difficulty = 'hard';
  else difficulty = 'expert';

  let a: number, b: number, c: number, d: number;
  let op1: string, op2: string, op3: string;
  let r1: number, r2: number, r3: number;
  let attempts = 0;

  do {
    attempts++;
    if (difficulty === 'easy') {
      op1 = pickRandom(['+', '-']);
      op2 = pickRandom(['+', '-']);
      op3 = pickRandom(['+', '-']);
      a = randInt(2, 12);
      b = randInt(1, 10);
      c = randInt(1, 10);
      d = randInt(1, 10);
    } else if (difficulty === 'medium') {
      op1 = pickRandom(['+', '-', '*']);
      op2 = pickRandom(['+', '-', '*']);
      op3 = pickRandom(['+', '-']);
      if (op1 === '*') { a = randInt(2, 8); b = randInt(2, 6); }
      else { a = randInt(3, 20); b = randInt(2, 15); }
      if (op2 === '*') { c = randInt(2, 5); }
      else { c = randInt(2, 12); }
      d = randInt(1, 10);
    } else if (difficulty === 'hard') {
      op1 = pickRandom(['+', '-', '*', '/']);
      op2 = pickRandom(['+', '-', '*', '/']);
      op3 = pickRandom(['+', '-', '*']);
      if (op1 === '*') { a = randInt(3, 12); b = randInt(2, 8); }
      else if (op1 === '/') { b = randInt(2, 9); a = b * randInt(2, 8); }
      else { a = randInt(5, 30); b = randInt(3, 20); }
      if (op2 === '*') { c = randInt(2, 6); }
      else if (op2 === '/') { c = randInt(2, 6); a = c * randInt(2, 5); }
      else { c = randInt(2, 15); }
      d = randInt(2, 12);
    } else {
      // Expert Difficulty
      op1 = pickRandom(['*', '/']);
      op2 = pickRandom(['*', '/']);
      op3 = pickRandom(['+', '-', '*']);
      if (op1 === '*') { a = randInt(5, 15); b = randInt(3, 10); }
      else { b = randInt(3, 12); a = b * randInt(3, 10); }
      if (op2 === '*') { c = randInt(3, 8); }
      else { c = randInt(2, 10); a = c * randInt(3, 8); }
      d = randInt(5, 15);
    }

    if (op1 === '-' && a < b) [a, b] = [b, a];
    if (op2 === '-' && a < c) { c = a > 1 ? randInt(1, a - 1) : 1; }
    if (op3 === '-' && b < d) { d = b > 1 ? randInt(1, b - 1) : 1; }

    if (op1 === '/') { b = b || 1; a = b * randInt(2, 6); }
    if (op2 === '/') { c = c || 1; a = c * Math.ceil(a / c); }

    r1 = compute(a, op1, b);
    r2 = compute(a, op2, c);
    r3 = compute(b, op3, d);
  } while (
    (r1 < 0 || r2 < 0 || r3 < 0 || !Number.isInteger(r1) || !Number.isInteger(r2) || !Number.isInteger(r3) || r1 > 200 || r2 > 200 || r3 > 200) &&
    attempts < 100
  );

  if (r1 < 0 || r2 < 0 || r3 < 0 || !Number.isInteger(r1) || !Number.isInteger(r2) || !Number.isInteger(r3)) {
    a = randInt(2, 10); b = randInt(1, 8); c = randInt(1, 8); d = randInt(1, 8);
    op1 = '+'; op2 = '+'; op3 = '+';
    r1 = a + b; r2 = a + c; r3 = b + d;
  }

  const values = [a, b, r1, c, r2, d, r3];

  let numBlanks: number;
  if (difficulty === 'easy') numBlanks = 2;
  else if (difficulty === 'medium') numBlanks = 3;
  else if (difficulty === 'hard') numBlanks = 4;
  else numBlanks = 5;

  const allPositions = [0, 1, 2, 3, 4, 5, 6];
  const shuffled = [...allPositions].sort(() => Math.random() - 0.5);
  const blanks = shuffled.slice(0, numBlanks);

  return {
    id: index,
    a, op1, b, r1,
    op2, c, r2,
    op3, d, r3,
    blanks,
    values,
    difficulty,
  };
}

function generateDistractors(correctValues: number[], count: number): number[] {
  const options = [...correctValues];
  const distractors = new Set<number>();
  let attempts = 0;
  while (distractors.size < count && attempts < 100) {
    const base = correctValues[Math.floor(Math.random() * correctValues.length)];
    const offset = randInt(1, 10) * (Math.random() > 0.5 ? 1 : -1);
    const val = base + offset;
    if (val >= 0 && val <= 200 && Number.isInteger(val) && !correctValues.includes(val)) {
      distractors.add(val);
    }
    attempts++;
  }
  return [...options, ...Array.from(distractors)].sort(() => Math.random() - 0.5);
}

// ——— Component ——————————————————————————————————————————————————————————————————————
const CrossMathGame = () => {
  const { currentStudent, updateStudentProgress, submitGameResult, finishTest, currentTest, addCompletedGame, getNextGame } = useGame();
  const navigate = useNavigate();

  const [puzzles] = useState<CrossMathPuzzle[]>(() =>
    Array.from({ length: TOTAL_QUESTIONS }, (_, i) => generatePuzzle(i))
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Map<number, (number | null)[]>>(new Map());
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [roundTimeLeft, setRoundTimeLeft] = useState(() => getTotalTime(0));
  const [questionActive, setQuestionActive] = useState(true);
  const [selectedBlank, setSelectedBlank] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef(Date.now());
  const scoreRef = useRef(score);
  const correctCountRef = useRef(correctCount);
  const elapsedRef = useRef(elapsed);

  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { correctCountRef.current = correctCount; }, [correctCount]);
  useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);

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
        if (!finished && questionActive) {
          setRoundTimeLeft(prev => Math.max(0, prev - delta));
        }
        lastTickRef.current = now;
      }
    }, 100);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [navigate, currentStudent, finished, questionActive]);

  useEffect(() => {
    if (currentTest?.status === 'FINISHED') navigate('/');
  }, [currentTest?.status, navigate]);

  const handleFinish = useCallback((isEndTest = false) => {
    setFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (currentStudent && currentTest) {
      const questionsAttempted = isEndTest ? currentQ : TOTAL_QUESTIONS;
      submitGameResult(currentStudent.username, {
        gameId: 'crossmath',
        score: scoreRef.current,
        timeTaken: elapsedRef.current,
        correctAnswers: correctCountRef.current,
        totalQuestions: questionsAttempted,
        completedAt: Date.now()
      }).then(() => {
        addCompletedGame('crossmath');
        if (isEndTest) {
          navigate('/select-game');
        } else {
          confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
        }
      });
    }
  }, [currentStudent, currentTest, currentQ, submitGameResult, addCompletedGame, finishTest, navigate]);

  // Reset per-question timer when moving to a new puzzle
  useEffect(() => {
    if (finished) return;
    setRoundTimeLeft(getTotalTime(currentQ));
    setQuestionActive(true);
  }, [currentQ, finished]);

  // Per-question countdown side-effects
  useEffect(() => {
    if (finished || !questionActive) return;

    if (roundTimeLeft <= 0) {
      setQuestionActive(false);
      setSelectedOption(null);
      if (currentQ + 1 >= TOTAL_QUESTIONS) {
        handleFinish();
      } else {
        setCurrentQ(prev => prev + 1);
      }
    }
  }, [roundTimeLeft, finished, questionActive, currentQ, handleFinish]);

  const puzzle = puzzles[currentQ];

  const getCurrentAnswers = useCallback((): (number | null)[] => {
    return answers.get(currentQ) || puzzle.blanks.map(() => null);
  }, [answers, currentQ, puzzle]);

  const currentAnswers = getCurrentAnswers();
  const allFilled = currentAnswers.every(a => a !== null);

  const [options] = useState<Map<number, number[]>>(() => {
    const m = new Map<number, number[]>();
    puzzles.forEach((p, i) => {
      const cv = p.blanks.map(bi => p.values[bi]);
      m.set(i, generateDistractors(cv, 3));
    });
    return m;
  });

  const currentOptions = options.get(currentQ) || [];
  const usedValues = currentAnswers.filter(a => a !== null) as number[];

  const handleOptionTap = (value: number) => {
    if (finished) return;
    if (selectedBlank !== null) {
      const current = [...currentAnswers];
      current[selectedBlank] = value;
      setAnswers(prev => new Map(prev).set(currentQ, current));
      setSelectedBlank(null);
      setSelectedOption(null);
    } else {
      setSelectedOption(prev => prev === value ? null : value);
    }
  };

  const handleCellTap = (blankIndex: number) => {
    if (finished) return;
    const current = [...currentAnswers];

    if (current[blankIndex] !== null) {
      current[blankIndex] = null;
      setAnswers(prev => new Map(prev).set(currentQ, current));
      setSelectedBlank(blankIndex);
      return;
    }

    if (selectedOption !== null) {
      current[blankIndex] = selectedOption;
      setAnswers(prev => new Map(prev).set(currentQ, current));
      setSelectedOption(null);
      setSelectedBlank(null);
    } else {
      setSelectedBlank(prev => prev === blankIndex ? null : blankIndex);
    }
  };

  const checkAnswer = useCallback(() => {
    const current = getCurrentAnswers();
    const v = [...puzzle.values];
    puzzle.blanks.forEach((pos, i) => {
      v[pos] = current[i]!;
    });

    const [a, b, r1, c, r2, d, r3] = v;

    if (compute(a, puzzle.op1, b) !== r1) return false;
    if (compute(a, puzzle.op2, c) !== r2) return false;
    if (compute(b, puzzle.op3, d) !== r3) return false;

    return true;
  }, [getCurrentAnswers, puzzle]);

  const handleSubmit = useCallback(() => {
    const isCorrect = checkAnswer();

    let newScore = score;
    let newCorrect = correctCount;

    if (isCorrect) {
      newScore = score + 10;
      newCorrect = correctCount + 1;
      setScore(newScore);
      setCorrectCount(newCorrect);
      if (currentTest?.showResults !== false) {
        setFeedback('success');
        toast.success(SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)], { icon: '🤖' });
      }
    } else {
      if (currentTest?.showResults !== false) {
        setFeedback('error');
        toast.error(OOPS_MESSAGES[Math.floor(Math.random() * OOPS_MESSAGES.length)], { icon: '📉' });
      }
    }

    if (currentStudent) {
      updateStudentProgress(currentStudent.username, newScore, currentQ + 1, newCorrect, TOTAL_QUESTIONS, 'crossmath');
    }

    setQuestionActive(false);
    setSelectedOption(null);
    setTimeout(() => {
      setFeedback(null);
      if (currentQ + 1 >= TOTAL_QUESTIONS) {
        handleFinish();
      } else {
        setCurrentQ(prev => prev + 1);
      }
    }, 600);
  }, [checkAnswer, score, correctCount, currentQ, puzzle, currentStudent, updateStudentProgress, handleFinish]);

  // Auto-submit when all blanks are filled
  useEffect(() => {
    if (!finished && questionActive && allFilled) {
      // Small delay so user sees their last choice (0.4s feels premium)
      const timer = setTimeout(() => {
        handleSubmit();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [allFilled, finished, questionActive, handleSubmit]);

  const handlePostFinish = useCallback(() => {
    const nextGame = getNextGame();
    if (nextGame) {
      navigate('/select-game');
    } else {
      if (currentStudent) finishTest(currentStudent.username);
      navigate('/');
    }
  }, [getNextGame, navigate, currentStudent, finishTest]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const renderCell = (value: number | string, isBlankCell: boolean, blankIndex?: number) => {
    if (typeof value === 'string') {
      return (
        <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center text-sky-500 font-black text-xl sm:text-2xl shrink-0">
          {value}
        </div>
      );
    }
    if (isBlankCell && blankIndex !== undefined) {
      const filledValue = currentAnswers[blankIndex];
      const isActive = selectedBlank === blankIndex;

      return (
        <button
          onClick={() => handleCellTap(blankIndex)}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            if (finished) return;
            const data = e.dataTransfer.getData('text/plain');
            if (!data) return;
            const value = Number(data);

            const current = [...currentAnswers];
            current[blankIndex] = value;
            setAnswers(prev => new Map(prev).set(currentQ, current));
            setSelectedBlank(null);
          }}
          className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-black text-2xl transition-all shrink-0 relative
            ${filledValue !== null
              ? 'bg-sky-50 border-sky-400 text-sky-600 shadow-inner scale-100'
              : isActive
                ? 'bg-sky-100/50 border-sky-500 text-sky-500 scale-105 shadow-md animate-pulse border-solid'
                : 'border-sky-200 border-dashed text-sky-300 bg-white/30 hover:border-sky-400 hover:bg-sky-50/20'
            }`}
        >
          {filledValue !== null ? filledValue : <span className="text-[#0F172A] font-medium">?</span>}
          {isActive && filledValue === null && (
            <div className="absolute inset-0 rounded-2xl border-2 border-sky-500 animate-ping opacity-20" />
          )}
        </button>
      );
    }
    return (
      <div className="w-14 h-14 rounded-2xl bg-white border border-sky-100 flex items-center justify-center font-black text-2xl text-[#0F172A] shrink-0 shadow-[0_4px_12px_rgba(56,189,248,0.08)]">
        {value}
      </div>
    );
  };

  const getBlankIndex = (position: number): number => {
    return puzzle.blanks.indexOf(position);
  };
  const isBlank = (position: number): boolean => puzzle.blanks.includes(position);

  if (finished) {
    return (
      <div className="flex flex-col flex-1 w-full bg-[#F0F7FF] font-sans min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#E0F2FE_0%,_#F0F9FF_40%,_#FFFFFF_100%)]" />
        </div>
        <div className="flex flex-col flex-1 items-center justify-center p-4 relative z-10 w-full min-h-screen">
          <div className="text-center animate-fade-in max-w-md w-full px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-sky-200/40">
              <Trophy className="w-10 h-10 text-sky-500" />
            </div>
            <h1 className="text-[32px] sm:text-[42px] font-black text-[#0F172A] tracking-tight leading-none mb-3">CrossMath Complete!</h1>
            <p className="text-[15px] text-[#64748B] mb-10 font-medium">Great work, {currentStudent?.username}!</p>
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
                    <span className="font-mono font-black text-3xl sm:text-4xl text-emerald-500">{currentTest?.showResults !== false ? correctCount : '---'}</span>
                    <span className="text-sm text-[#94A3B8]">/ {TOTAL_QUESTIONS}</span>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={handlePostFinish} className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] hover:from-[#0EA5E9] hover:to-[#0284C7] text-white rounded-2xl font-bold text-[16px] shadow-xl shadow-sky-500/25 transition-all hover:scale-105 active:scale-95">
              {getNextGame() ? 'Next Game →' : 'Finish Session'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentQ + 1) / TOTAL_QUESTIONS) * 100;

  return (
    <div className={`flex flex-col flex-1 w-full bg-[#FDFDFF] font-sans min-h-screen relative overflow-hidden pt-16 ${feedback === 'success' ? 'flash-correct' : feedback === 'error' ? 'flash-wrong' : ''}`}>
      {/* Background Layers like Home Page */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#F5F3FF_0%,_#ECFEFF_40%,_#FFFFFF_100%)]" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#6C63FF] opacity-[0.03] blur-[120px] rounded-full" />
      </div>

      {/* Top Waves like Home Page */}
      <DecorativeCurve opacity={0.04} height="h-[300px] sm:h-[450px]" className="absolute -top-[100px] left-[-10%] w-[120%] z-0 rotate-180 pointer-events-none scale-x-[1.1] mix-blend-multiply" animate={true} />
      <DecorativeCurve opacity={0.06} height="h-[250px] sm:h-[380px]" className="absolute -top-[50px] left-[-5%] w-[110%] z-0 rotate-180 pointer-events-none scale-x-[1.05]" animate={true} />
      <DecorativeCurve opacity={0.12} height="h-[180px] sm:h-[260px]" className="absolute top-0 left-0 z-0 rotate-180 pointer-events-none" animate={true} />

      {/* Bottom Waves like Home Page */}
      <DecorativeCurve opacity={0.05} height="h-[300px] sm:h-[450px]" className="absolute -bottom-[100px] left-[-10%] w-[120%] z-0 pointer-events-none scale-x-[1.1] mix-blend-multiply" animate={true} />
      <DecorativeCurve opacity={0.07} height="h-[250px] sm:h-[380px]" className="absolute -bottom-[50px] left-[-5%] w-[110%] z-0 pointer-events-none scale-x-[1.05]" animate={true} />
      <DecorativeCurve opacity={0.12} height="h-[180px] sm:h-[260px]" className="absolute bottom-0 left-0 z-0 pointer-events-none" animate={true} />

      <div className="flex flex-col flex-1 items-center justify-center p-4 relative z-10 w-full pt-0 pb-20">
        <div className="w-full max-w-[580px] animate-fade-in relative flex flex-col items-center">

          {/* Header Block first as requested */}
          <div className="w-full mb-1.5 flex flex-col items-center text-center">
            <h1 className="text-[22px] sm:text-[26px] font-black tracking-tighter text-[#0F172A] uppercase leading-none">
              Solve all equations
            </h1>
            <p className="mt-1 text-[10px] font-black text-[#64748B] tracking-[0.4em] uppercase opacity-40">
              CROSS MATH
            </p>
          </div>

          {/* Floating Circular Countdown Timer - Now Outside Left of Badge (Fixed visibility & alignment) */}
          <div className="absolute -left-10 sm:-left-20 top-16 sm:top-20 flex items-center justify-center w-14 h-14 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-sky-100/50 z-20 animate-fade-in">
            <svg className="w-full h-full -rotate-90 filter drop-shadow-sm" viewBox="0 0 56 56">
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="transparent"
                className="text-sky-50"
              />
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="currentColor"
                strokeWidth="3.5"
                fill="transparent"
                strokeDasharray={138}
                strokeDashoffset={138 - (138 * roundTimeLeft) / getTotalTime(currentQ)}
                strokeLinecap="round"
                className="text-red-500 transition-all duration-1000 linear"
              />
            </svg>
            <span className="absolute font-black text-[18px] text-red-500 font-mono tracking-tighter translate-y-[1px]">
              {roundTimeLeft}
            </span>
          </div>

          {/* End Test Hyperlink */}
          <div className="w-full flex justify-end mb-4 px-2">
            <button
              onClick={() => {
                if (window.confirm('End this game? Your current progress will be saved.')) {
                  handleFinish(true);
                }
              }}
              className="text-[11px] font-black uppercase tracking-widest text-[#94A3B8] hover:text-rose-500 transition-colors underline underline-offset-4"
            >
              End Game
            </button>
          </div>

          {/* Unified Game Container */}
          <div className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(56,189,248,0.12)] border border-sky-100 transition-all duration-300 overflow-hidden relative w-full flex flex-col">

            {/* Redesigned Header with Progress Bar */}
            <div className="px-8 pt-7 pb-4">
              <div className="flex items-center justify-between mb-5 relative">
                {/* Left: Difficulty Badge */}
                <div className="flex-1 flex justify-start">
                  {(() => {
                    const colors = {
                      easy: 'bg-emerald-50 border-emerald-100 text-emerald-600 dot-bg-emerald-500',
                      medium: 'bg-sky-50 border-sky-100 text-sky-600 dot-bg-sky-500',
                      hard: 'bg-amber-50 border-amber-100 text-amber-600 dot-bg-amber-500',
                      expert: 'bg-violet-50 border-violet-100 text-violet-600 dot-bg-violet-500'
                    }[puzzle.difficulty];
                    const [bgColor, borderColor, textColor, dotColor] = colors.split(' ');

                    return (
                      <div className={`px-3 py-1 rounded-full ${bgColor} border ${borderColor} flex items-center gap-2 shadow-sm`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${dotColor.replace('dot-bg-', 'bg-')} animate-pulse`} />
                        <span className={`text-[10px] font-black ${textColor} uppercase tracking-widest`}>
                          {puzzle.difficulty}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* Middle: Level Info */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5">
                  <span className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.2em] opacity-80">Level</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#0F172A] leading-none tracking-tighter">{currentQ + 1}</span>
                    <span className="text-[#94A3B8] font-black text-xs">/ {TOTAL_QUESTIONS}</span>
                  </div>
                </div>

                {/* Right: Score */}
                <div className="flex-1 flex justify-end">
                  {currentTest?.showResults !== false && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider opacity-80">Score</span>
                      <span className="text-2xl font-black text-sky-500 leading-none tracking-tighter">{score}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="relative w-full h-1.5 bg-sky-100/30 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-sky-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(56,189,248,0.4)]"
                  style={{ width: `${((currentQ + 1) / TOTAL_QUESTIONS) * 100}%` }}
                />
              </div>
            </div>

            {/* Grid Area with Fixed Symmetry - Premium spacing */}
            <div className="px-8 pt-6 pb-4 flex flex-col items-center">
              <div className="grid grid-cols-[auto_48px_auto_48px_auto] items-center gap-y-1">
                {/* Row 1 */}
                {renderCell(puzzle.a, isBlank(0), getBlankIndex(0) >= 0 ? getBlankIndex(0) : undefined)}
                <div className="text-sky-500 font-black text-2xl text-center">{opSymbol(puzzle.op1)}</div>
                {renderCell(puzzle.b, isBlank(1), getBlankIndex(1) >= 0 ? getBlankIndex(1) : undefined)}
                <div className="text-sky-500 font-black text-2xl text-center">=</div>
                {renderCell(puzzle.r1, isBlank(2), getBlankIndex(2) >= 0 ? getBlankIndex(2) : undefined)}

                {/* Op Row 1 */}
                <div className="h-10 text-sky-500 font-black text-2xl flex items-center justify-center">{opSymbol(puzzle.op2)}</div>
                <div />
                <div className="h-10 text-sky-500 font-black text-2xl flex items-center justify-center">{opSymbol(puzzle.op3)}</div>
                <div />
                <div />

                {/* Row 2 */}
                {renderCell(puzzle.c, isBlank(3), getBlankIndex(3) >= 0 ? getBlankIndex(3) : undefined)}
                <div />
                {renderCell(puzzle.d, isBlank(5), getBlankIndex(5) >= 0 ? getBlankIndex(5) : undefined)}
                <div />
                <div />

                {/* Op Row 2 */}
                <div className="h-10 text-sky-500 font-black text-xl flex items-center justify-center">=</div>
                <div />
                <div className="h-10 text-sky-500 font-black text-xl flex items-center justify-center">=</div>
                <div />
                <div />

                {/* Row 3 */}
                {renderCell(puzzle.r2, isBlank(4), getBlankIndex(4) >= 0 ? getBlankIndex(4) : undefined)}
                <div />
                {renderCell(puzzle.r3, isBlank(6), getBlankIndex(6) >= 0 ? getBlankIndex(6) : undefined)}
                <div />
                <div />
              </div>
            </div>

            {/* Answer Options row integrated into card */}
            <div className="px-6 pb-12 flex flex-col gap-8">
              <div className="flex flex-wrap items-center justify-center gap-4">
                {currentOptions.map((val, i) => {
                  const usedCount = usedValues.filter(v => v === val).length;
                  const availCount = currentOptions.slice(0, i + 1).filter(v => v === val).length;
                  const isThisUsed = availCount <= usedCount;

                  return (
                    <button
                      key={`${val}-${i}`}
                      onClick={() => !isThisUsed && handleOptionTap(val)}
                      disabled={isThisUsed}
                      draggable={!isThisUsed}
                      onDragStart={e => {
                        if (isThisUsed) return;
                        e.dataTransfer.setData('text/plain', String(val));
                      }}
                      className={`w-14 h-14 rounded-[1.25rem] font-black text-2xl transition-all select-none border-2 shadow-sm
                        ${isThisUsed
                          ? 'bg-sky-50/50 text-[#94A3B8]/20 border-sky-50 shadow-none cursor-not-allowed scale-90'
                          : selectedOption === val
                            ? 'bg-sky-500 text-white border-sky-400 scale-125 shadow-xl shadow-sky-500/30 ring-4 ring-sky-500/10'
                            : 'bg-white border-sky-100 text-sky-500 hover:border-sky-300 hover:scale-110 hover:shadow-md active:scale-95'
                        }`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossMathGame;
