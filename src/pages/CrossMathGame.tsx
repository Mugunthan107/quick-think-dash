import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Clock, Trophy, GripHorizontal } from 'lucide-react';

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
  difficulty: 'easy' | 'medium' | 'hard';
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
  let difficulty: 'easy' | 'medium' | 'hard';
  if (index < 7) difficulty = 'easy';
  else if (index < 14) difficulty = 'medium';
  else difficulty = 'hard';

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
    } else {
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
  else numBlanks = 4;

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
  const { currentStudent, updateStudentScore, submitGameResult, finishTest, currentTest, addCompletedGame, getNextGame } = useGame();
  const navigate = useNavigate();

  const [puzzles] = useState<CrossMathPuzzle[]>(() =>
    Array.from({ length: TOTAL_QUESTIONS }, (_, i) => generatePuzzle(i))
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Map<number, (number | null)[]>>(new Map());
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
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
        lastTickRef.current = now;
      }
    }, 100);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [navigate, currentStudent]);

  useEffect(() => {
    if (currentTest?.status === 'FINISHED') navigate('/');
  }, [currentTest?.status, navigate]);

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
    if (selectedOption === value) {
      setSelectedOption(null);
      return;
    }
    setSelectedOption(value);
  };

  const handleCellTap = (blankIndex: number) => {
    if (finished) return;
    const current = [...currentAnswers];

    if (current[blankIndex] !== null) {
      current[blankIndex] = null;
      setAnswers(prev => new Map(prev).set(currentQ, current));
      return;
    }

    if (selectedOption !== null) {
      current[blankIndex] = selectedOption;
      setAnswers(prev => new Map(prev).set(currentQ, current));
      setSelectedOption(null);
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

  const handleFinish = useCallback(() => {
    setFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (currentStudent && currentTest) {
      submitGameResult(currentStudent.username, {
        gameId: 'crossmath',
        score: score,
        timeTaken: elapsed,
        correctAnswers: correctCount,
        totalQuestions: TOTAL_QUESTIONS,
        completedAt: Date.now()
      }).then(() => {
        addCompletedGame('crossmath');
      });
    }
  }, [score, correctCount, currentStudent, currentTest, submitGameResult, addCompletedGame, elapsed]);

  const handleSubmit = useCallback(() => {
    const isCorrect = checkAnswer();
    setShowResult(isCorrect ? 'correct' : 'wrong');

    let newScore = score;
    let newCorrect = correctCount;

    if (isCorrect) {
      const points = puzzle.difficulty === 'hard' ? 30 : puzzle.difficulty === 'medium' ? 20 : 10;
      newScore = score + points;
      newCorrect = correctCount + 1;
      setScore(newScore);
      setCorrectCount(newCorrect);
    }

    if (currentStudent) {
      updateStudentScore(currentStudent.username, newScore, currentQ + 1, newCorrect);
    }

    setTimeout(() => {
      setShowResult(null);
      setSelectedOption(null);
      if (currentQ + 1 >= TOTAL_QUESTIONS) {
        handleFinish();
      } else {
        setCurrentQ(prev => prev + 1);
      }
    }, 800);
  }, [checkAnswer, score, correctCount, currentQ, puzzle, currentStudent, updateStudentScore, handleFinish]);

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
      const isWrong = showResult === 'wrong' && filledValue !== null;
      const isRight = showResult === 'correct' && filledValue !== null;
      return (
        <button
          onClick={() => handleCellTap(blankIndex)}
          className={`w-10 h-10 sm:w-14 sm:h-14 rounded-2xl border-2 border-dashed flex items-center justify-center font-black text-lg sm:text-xl transition-all shrink-0
            ${filledValue !== null
              ? isRight ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20' :
                isWrong ? 'bg-red-500 border-red-400 text-white animate-shake shadow-lg shadow-red-500/20' :
                  'bg-sky-50 border-sky-300 text-sky-600'
              : 'border-sky-200 text-sky-300 bg-white/50 hover:border-sky-400'
            }`}
        >
          {filledValue !== null ? filledValue : '?'}
        </button>
      );
    }
    return (
      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-white border border-sky-100 flex items-center justify-center font-black text-lg sm:text-xl text-[#0F172A] shrink-0 shadow-sm">
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
        <div className="flex items-center justify-center p-4 relative z-10 w-full min-h-screen -mt-14 sm:-mt-16">
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
                  <span className="font-mono font-black text-3xl sm:text-4xl text-sky-500">{score}</span>
                </div>
                <div className="w-px h-14 bg-sky-100" />
                <div className="text-center">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Correct</span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-mono font-black text-3xl sm:text-4xl text-emerald-500">{correctCount}</span>
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
    <div className="flex flex-col flex-1 w-full bg-[#F0F7FF] font-sans min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#E0F2FE_0%,_#F0F9FF_40%,_#FFFFFF_100%)]" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#38BDF8] opacity-[0.05] blur-[120px] rounded-full" />
      </div>

      <div className="flex flex-col flex-1 items-center justify-center p-3 sm:p-4 relative z-10 w-full min-h-screen -mt-14 sm:-mt-16">
        <div className="w-full max-w-[500px] animate-fade-in relative">

          <div className="w-full mb-8 flex flex-col items-center text-center">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0F172A] uppercase">
              CROSS MATH
              <span className="text-[13px] font-bold ml-3 text-[#94A3B8] normal-case opacity-60">FILL THE BLANKS</span>
            </h1>
            <p className="text-[13px] text-[#64748B] font-bold mt-1">Complete the mathematical grid</p>
          </div>

          <div className="flex items-center justify-between mb-4 px-2 tracking-tight font-bold">
            <span className="text-[13px] text-[#64748B]">{currentStudent?.username}</span>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-sky-100 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <span className="text-[#0F172A] font-mono text-[14px]">{formatTime(elapsed)}</span>
            </div>
            <button onClick={() => {
              setFinished(true);
              if (timerRef.current) clearInterval(timerRef.current);
              if (currentStudent) {
                submitGameResult(currentStudent.username, {
                  gameId: 'crossmath', score, timeTaken: elapsed, correctAnswers: correctCount, totalQuestions: TOTAL_QUESTIONS, completedAt: Date.now()
                }).then(() => addCompletedGame('crossmath'));
              } else navigate('/');
            }} className="text-[11px] text-[#94A3B8] hover:text-[#2563EB] transition-colors px-3 py-1.5 rounded-xl hover:bg-white/80 border border-sky-100 font-bold uppercase tracking-widest">End Test</button>
          </div>

          <div className={`bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(56,189,248,0.15)] border-2 transition-all duration-300 overflow-hidden relative ${showResult === 'wrong' ? 'border-red-200' : showResult === 'correct' ? 'border-emerald-200' : 'border-sky-100'}`}>
            <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-4 border-b border-sky-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${puzzle.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600' : puzzle.difficulty === 'medium' ? 'bg-sky-50 text-sky-500' : 'bg-red-50 text-red-500'}`}>{puzzle.difficulty}</span>
                  <span className="text-[14px] font-black text-[#0F172A]">Q{currentQ + 1} / {TOTAL_QUESTIONS}</span>
                </div>
                <div className="text-right flex flex-col gap-1">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest leading-none">SCORE</span>
                  <span className="font-mono font-black text-2xl text-sky-500">{score}</span>
                </div>
              </div>
              <div className="w-full h-2 bg-sky-50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="p-6 sm:p-10 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 justify-center">
                {renderCell(puzzle.a, isBlank(0), getBlankIndex(0) >= 0 ? getBlankIndex(0) : undefined)}
                {renderCell(opSymbol(puzzle.op1), false)}
                {renderCell(puzzle.b, isBlank(1), getBlankIndex(1) >= 0 ? getBlankIndex(1) : undefined)}
                {renderCell('=', false)}
                {renderCell(puzzle.r1, isBlank(2), getBlankIndex(2) >= 0 ? getBlankIndex(2) : undefined)}
              </div>

              <div className="flex items-center gap-2 justify-center">
                <div className="w-10 h-8 sm:w-14 sm:h-10 flex items-center justify-center text-sky-500 font-black text-lg shrink-0">
                  {opSymbol(puzzle.op2)}
                </div>
                <div className="w-10 sm:w-14 shrink-0" />
                <div className="w-10 h-8 sm:w-14 sm:h-10 flex items-center justify-center text-sky-500 font-black text-lg shrink-0">
                  {opSymbol(puzzle.op3)}
                </div>
                <div className="w-10 sm:w-14 shrink-0" />
                <div className="w-10 sm:w-14 shrink-0" />
              </div>

              <div className="flex items-center gap-2 justify-center">
                {renderCell(puzzle.c, isBlank(3), getBlankIndex(3) >= 0 ? getBlankIndex(3) : undefined)}
                <div className="w-10 sm:w-14 shrink-0" />
                {renderCell(puzzle.d, isBlank(5), getBlankIndex(5) >= 0 ? getBlankIndex(5) : undefined)}
                <div className="w-10 sm:w-14 shrink-0" />
                <div className="w-10 sm:w-14 shrink-0" />
              </div>

              <div className="flex items-center gap-2 justify-center">
                <div className="w-10 h-8 sm:w-14 sm:h-10 flex items-center justify-center text-[#94A3B8] font-black text-lg shrink-0">=</div>
                <div className="w-10 sm:w-14 shrink-0" />
                <div className="w-10 h-8 sm:w-14 sm:h-10 flex items-center justify-center text-[#94A3B8] font-black text-lg shrink-0">=</div>
                <div className="w-10 sm:w-14 shrink-0" />
                <div className="w-10 sm:w-14 shrink-0" />
              </div>

              <div className="flex items-center gap-2 justify-center">
                {renderCell(puzzle.r2, isBlank(4), getBlankIndex(4) >= 0 ? getBlankIndex(4) : undefined)}
                <div className="w-10 sm:w-14 shrink-0" />
                {renderCell(puzzle.r3, isBlank(6), getBlankIndex(6) >= 0 ? getBlankIndex(6) : undefined)}
                <div className="w-10 sm:w-14 shrink-0" />
                <div className="w-10 sm:w-14 shrink-0" />
              </div>
            </div>

            <div className="px-6 sm:px-10 pb-6">
              <div className="bg-sky-50/50 rounded-3xl p-4 border border-sky-100 mb-6">
                <div className="flex flex-wrap justify-center gap-3">
                  {currentOptions.map((val, i) => {
                    const usedCount = usedValues.filter(v => v === val).length;
                    const availCount = currentOptions.slice(0, i + 1).filter(v => v === val).length;
                    const isThisUsed = availCount <= usedCount;

                    return (
                      <button
                        key={`${val}-${i}`}
                        onClick={() => !isThisUsed && handleOptionTap(val)}
                        disabled={isThisUsed}
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl font-black text-base sm:text-lg transition-all select-none touch-manipulation border-2
                          ${isThisUsed
                            ? 'bg-sky-50/50 text-[#94A3B8]/30 border-transparent cursor-not-allowed scale-90'
                            : selectedOption === val
                              ? 'bg-sky-500 text-white border-sky-400 scale-110 shadow-lg shadow-sky-500/20'
                              : 'bg-white border-sky-100 text-[#0F172A] hover:border-sky-300 hover:scale-105 shadow-sm'
                          }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!allFilled || showResult !== null}
                className={`w-full py-4 rounded-2xl font-black text-[15px] uppercase tracking-widest transition-all
                  ${allFilled && !showResult
                    ? 'bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-white shadow-xl shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-sky-50 text-[#94A3B8] cursor-not-allowed'
                  }`}
              >
                {showResult === 'correct' ? '✓ Correct!' : showResult === 'wrong' ? '✕ Wrong' : 'Submit Answer'}
              </button>
            </div>

            {showResult && (
              <div className={`absolute inset-0 pointer-events-none animate-fade-in ${showResult === 'wrong' ? 'bg-red-500/5' : 'bg-emerald-500/5'}`} />
            )}
          </div>

          <div className="text-center mt-6">
            <div className="flex items-center gap-1.5 justify-center text-[13px] text-[#64748B] font-bold">
              <GripHorizontal className="w-4 h-4 text-sky-500" />
              <span>Tap a number, then tap a <span className="text-sky-500">?</span> space</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CrossMathGame;
