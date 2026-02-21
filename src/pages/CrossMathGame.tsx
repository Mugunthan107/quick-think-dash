import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Clock, Trophy, Target, GripHorizontal } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────
interface CrossMathPuzzle {
  id: number;
  // Horizontal: a op1 b = r1
  a: number;
  op1: string;
  b: number;
  r1: number;
  // Vertical from 'a': a op2 c = r2
  op2: string;
  c: number;
  r2: number;
  // Vertical from 'b': b op3 d = r3
  op3: string;
  d: number;
  r3: number;
  // Which cells are blank (indices into the values array)
  blanks: number[];
  // All values in order: [a, b, r1, c, r2, d, r3]
  values: number[];
  difficulty: 'easy' | 'medium' | 'hard';
}

const TOTAL_QUESTIONS = 20;

// ─── Helpers ────────────────────────────────────────────
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

// ─── Puzzle Generator ───────────────────────────────────
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
      else if (op2 === '/') { c = randInt(2, 6); const mult = randInt(2, 5); a = c * mult; /* adjust a */ }
      else { c = randInt(2, 15); }
      d = randInt(2, 12);
    }

    // Ensure subtraction doesn't go negative
    if (op1 === '-' && a < b) [a, b] = [b, a];
    if (op2 === '-' && a < c) { const t = c; c = a > 1 ? randInt(1, a - 1) : 1; }
    if (op3 === '-' && b < d) { d = b > 1 ? randInt(1, b - 1) : 1; }

    // Ensure division is clean
    if (op1 === '/') { b = b || 1; a = b * randInt(2, 6); }
    if (op2 === '/') { c = c || 1; a = c * Math.ceil(a / c); }

    r1 = compute(a, op1, b);
    r2 = compute(a, op2, c);
    r3 = compute(b, op3, d);
  } while (
    (r1 < 0 || r2 < 0 || r3 < 0 || !Number.isInteger(r1) || !Number.isInteger(r2) || !Number.isInteger(r3) || r1 > 200 || r2 > 200 || r3 > 200) &&
    attempts < 100
  );

  // If we still have bad values, fallback to simple addition
  if (r1 < 0 || r2 < 0 || r3 < 0 || !Number.isInteger(r1) || !Number.isInteger(r2) || !Number.isInteger(r3)) {
    a = randInt(2, 10); b = randInt(1, 8); c = randInt(1, 8); d = randInt(1, 8);
    op1 = '+'; op2 = '+'; op3 = '+';
    r1 = a + b; r2 = a + c; r3 = b + d;
  }

  const values = [a, b, r1, c, r2, d, r3];

  // Choose blanks based on difficulty
  let numBlanks: number;
  if (difficulty === 'easy') numBlanks = 2;
  else if (difficulty === 'medium') numBlanks = 3;
  else numBlanks = 4;

  // Pick random blank positions (0=a, 1=b, 2=r1, 3=c, 4=r2, 5=d, 6=r3)
  const allPositions = [0, 1, 2, 3, 4, 5, 6];
  const shuffled = allPositions.sort(() => Math.random() - 0.5);
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
  const distractors = new Set<number>(correctValues);
  let attempts = 0;
  while (distractors.size < correctValues.length + count && attempts < 100) {
    const base = correctValues[Math.floor(Math.random() * correctValues.length)];
    const offset = randInt(1, 5) * (Math.random() > 0.5 ? 1 : -1);
    const val = base + offset;
    if (val >= 0 && val <= 200 && Number.isInteger(val)) {
      distractors.add(val);
    }
    attempts++;
  }
  return Array.from(distractors).sort(() => Math.random() - 0.5);
}

// ─── Component ──────────────────────────────────────────
const CrossMathGame = () => {
  const { currentStudent, updateStudentScore, submitGameResult, finishTest, currentTest } = useGame();
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
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!currentStudent) {
      navigate('/student');
      return;
    }
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentStudent, navigate]);

  const puzzle = puzzles[currentQ];

  // Get current answers for this puzzle
  const getCurrentAnswers = useCallback((): (number | null)[] => {
    return answers.get(currentQ) || puzzle.blanks.map(() => null);
  }, [answers, currentQ, puzzle]);

  const currentAnswers = getCurrentAnswers();
  const allFilled = currentAnswers.every(a => a !== null);

  // Available options for current puzzle
  const correctValues = puzzle.blanks.map(bi => puzzle.values[bi]);
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
      // Remove the value from this cell
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
    let allCorrect = true;
    for (let i = 0; i < puzzle.blanks.length; i++) {
      if (current[i] !== puzzle.values[puzzle.blanks[i]]) {
        allCorrect = false;
        break;
      }
    }
    return allCorrect;
  }, [getCurrentAnswers, puzzle]);

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
        // Finish
        setFinished(true);
        if (timerRef.current) clearInterval(timerRef.current);

        submitGameResult(currentStudent.username, {
          gameId: 'crossmath',
          score: newScore,
          timeTaken: elapsed,
          correctAnswers: newCorrect,
          totalQuestions: TOTAL_QUESTIONS,
          completedAt: Date.now()
        }).then(() => {
          const gamesPlayed = (currentStudent.gameHistory?.length || 0) + 1;
          if (gamesPlayed < currentTest.numGames) {
            navigate('/select-game');
          } else {
            finishTest(currentStudent.username);
            navigate('/leaderboard');
          }
        });
      } else {
        setCurrentQ(prev => prev + 1);
      }
    }, 800);
  }, [checkAnswer, score, correctCount, currentQ, puzzle, currentStudent, currentTest, updateStudentScore, submitGameResult, finishTest, elapsed, navigate]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // ─── Render Cell ──────────────────────────────────────
  const renderCell = (value: number | string, isBlank: boolean, blankIndex?: number) => {
    if (typeof value === 'string') {
      // Operator or equals
      return (
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-accent font-bold text-lg sm:text-xl">
          {value}
        </div>
      );
    }
    if (isBlank && blankIndex !== undefined) {
      const filledValue = currentAnswers[blankIndex];
      const isWrong = showResult === 'wrong' && filledValue !== null;
      const isRight = showResult === 'correct' && filledValue !== null;
      return (
        <button
          onClick={() => handleCellTap(blankIndex)}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 border-dashed flex items-center justify-center font-bold text-base sm:text-lg transition-all
            ${filledValue !== null
              ? isRight ? 'bg-success/20 border-success text-success' :
                isWrong ? 'bg-destructive/20 border-destructive text-destructive animate-shake' :
                  'bg-accent/15 border-accent text-accent'
              : 'border-muted-foreground/40 text-muted-foreground hover:border-accent hover:bg-accent/5'
            }`}
        >
          {filledValue !== null ? filledValue : '?'}
        </button>
      );
    }
    // Fixed value cell
    return (
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-secondary border border-border flex items-center justify-center font-bold text-base sm:text-lg text-foreground">
        {value}
      </div>
    );
  };

  // ─── Get blank index for a position ───────────────────
  const getBlankIndex = (position: number): number => {
    return puzzle.blanks.indexOf(position);
  };
  const isBlank = (position: number): boolean => puzzle.blanks.includes(position);

  // ─── Finished Screen ─────────────────────────────────
  if (finished) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 relative z-10">
        <div className="text-center animate-fade-in max-w-md w-full px-2">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6 sm:mb-8 animate-pulse-ring">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-success" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Cross Math Complete!</h1>
          <p className="text-muted-foreground mb-2">Great work, {currentStudent?.username}!</p>
          <div className="flex items-center justify-center gap-6 my-6 sm:my-8">
            <div className="text-center">
              <span className="text-xs text-muted-foreground block mb-1">SCORE</span>
              <span className="font-mono font-bold text-2xl sm:text-3xl text-accent">{score}</span>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <span className="text-xs text-muted-foreground block mb-1">CORRECT</span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-mono font-bold text-2xl sm:text-3xl text-success">{correctCount}</span>
                <span className="text-sm text-muted-foreground">/ {TOTAL_QUESTIONS}</span>
              </div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <span className="text-xs text-muted-foreground block mb-1">TIME</span>
              <span className="font-mono font-bold text-2xl sm:text-3xl text-foreground">{formatTime(elapsed)}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/leaderboard')}
            className="bg-accent text-accent-foreground px-8 py-4 rounded-lg font-semibold hover:bg-accent/90 transition-all hover:scale-105 text-base sm:text-lg"
          >
            View Leaderboard
          </button>
        </div>
      </div>
    );
  }

  const progress = ((currentQ + 1) / TOTAL_QUESTIONS) * 100;

  return (
    <div className="flex min-h-screen items-center justify-center p-3 sm:p-4 relative z-10">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Top Stats */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
          <span className="text-xs sm:text-sm text-muted-foreground">{currentStudent?.username}</span>
          <div className="flex items-center gap-2 text-sm font-mono">
            <Clock className="w-3.5 h-3.5 text-accent" />
            <span className="text-foreground font-bold">{formatTime(elapsed)}</span>
          </div>
          <button
            onClick={() => {
              setFinished(true);
              if (timerRef.current) clearInterval(timerRef.current);

              if (currentStudent) {
                submitGameResult(currentStudent.username, {
                  gameId: 'crossmath',
                  score: score,
                  timeTaken: elapsed,
                  correctAnswers: correctCount,
                  totalQuestions: TOTAL_QUESTIONS,
                  completedAt: Date.now()
                }).then(() => {
                  const gamesPlayed = (currentStudent.gameHistory?.length || 0) + 1;
                  if (gamesPlayed < (currentTest?.numGames || 1)) {
                    navigate('/select-game');
                  } else {
                    finishTest(currentStudent.username);
                    navigate('/leaderboard');
                  }
                });
              } else {
                navigate('/select-game');
              }
            }}
            className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-secondary border border-border/50"
          >
            End Test
          </button>
        </div>

        {/* Main Card */}
        <div className={`bg-card/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-border overflow-hidden transition-all duration-300
          ${showResult === 'correct' ? 'border-success/50' : showResult === 'wrong' ? 'border-destructive/50' : ''}`}>

          {/* Header */}
          <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider
                  ${puzzle.difficulty === 'easy' ? 'bg-success/15 text-success' :
                    puzzle.difficulty === 'medium' ? 'bg-accent/15 text-accent' :
                      'bg-destructive/15 text-destructive'}`}>
                  {puzzle.difficulty}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-foreground">Q{currentQ + 1} / {TOTAL_QUESTIONS}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground block">SCORE</span>
                <span className="font-mono font-bold text-lg text-foreground">{score}</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Cross Math Grid */}
          <div className="px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col items-center gap-1">
              {/* Row 1: a op1 b = r1 */}
              <div className="flex items-center gap-1">
                {renderCell(puzzle.a, isBlank(0), getBlankIndex(0) >= 0 ? getBlankIndex(0) : undefined)}
                {renderCell(opSymbol(puzzle.op1), false)}
                {renderCell(puzzle.b, isBlank(1), getBlankIndex(1) >= 0 ? getBlankIndex(1) : undefined)}
                {renderCell('=', false)}
                {renderCell(puzzle.r1, isBlank(2), getBlankIndex(2) >= 0 ? getBlankIndex(2) : undefined)}
              </div>

              {/* Row 2: op2 spacing op3 */}
              <div className="flex items-center gap-1">
                <div className="w-10 h-6 sm:w-12 sm:h-7 flex items-center justify-center text-accent font-bold text-sm">
                  {opSymbol(puzzle.op2)}
                </div>
                <div className="w-10 sm:w-12" />
                <div className="w-10 h-6 sm:w-12 sm:h-7 flex items-center justify-center text-accent font-bold text-sm">
                  {opSymbol(puzzle.op3)}
                </div>
                <div className="w-10 sm:w-12" />
                <div className="w-10 sm:w-12" />
              </div>

              {/* Row 3: c spacing d */}
              <div className="flex items-center gap-1">
                {renderCell(puzzle.c, isBlank(3), getBlankIndex(3) >= 0 ? getBlankIndex(3) : undefined)}
                <div className="w-10 sm:w-12" />
                {renderCell(puzzle.d, isBlank(5), getBlankIndex(5) >= 0 ? getBlankIndex(5) : undefined)}
                <div className="w-10 sm:w-12" />
                <div className="w-10 sm:w-12" />
              </div>

              {/* Row 4: = spacing = */}
              <div className="flex items-center gap-1">
                <div className="w-10 h-6 sm:w-12 sm:h-7 flex items-center justify-center text-muted-foreground font-bold text-sm">=</div>
                <div className="w-10 sm:w-12" />
                <div className="w-10 h-6 sm:w-12 sm:h-7 flex items-center justify-center text-muted-foreground font-bold text-sm">=</div>
                <div className="w-10 sm:w-12" />
                <div className="w-10 sm:w-12" />
              </div>

              {/* Row 5: r2 spacing r3 */}
              <div className="flex items-center gap-1">
                {renderCell(puzzle.r2, isBlank(4), getBlankIndex(4) >= 0 ? getBlankIndex(4) : undefined)}
                <div className="w-10 sm:w-12" />
                {renderCell(puzzle.r3, isBlank(6), getBlankIndex(6) >= 0 ? getBlankIndex(6) : undefined)}
                <div className="w-10 sm:w-12" />
                <div className="w-10 sm:w-12" />
              </div>
            </div>

            {/* Instruction */}
            <div className="text-center mt-4 sm:mt-5">
              <div className="flex items-center gap-1.5 justify-center text-xs text-muted-foreground">
                <GripHorizontal className="w-3.5 h-3.5" />
                <span>Tap a number below, then tap a <span className="text-accent font-semibold">?</span> cell to place it</span>
              </div>
            </div>
          </div>

          {/* Answer Bank */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="bg-secondary/50 rounded-xl p-3 sm:p-4 border border-border/50">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {currentOptions.map((val, i) => {
                  const isUsed = usedValues.includes(val) &&
                    usedValues.filter(v => v === val).length > currentOptions.slice(0, i).filter(v => v === val).length
                    ? false : usedValues.includes(val);
                  // Better: count usage
                  const usedCount = usedValues.filter(v => v === val).length;
                  const availCount = currentOptions.slice(0, i + 1).filter(v => v === val).length;
                  const isThisUsed = availCount <= usedCount;

                  return (
                    <button
                      key={`${val}-${i}`}
                      onClick={() => !isThisUsed && handleOptionTap(val)}
                      disabled={isThisUsed}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl font-bold text-base sm:text-lg transition-all select-none touch-manipulation
                        ${isThisUsed
                          ? 'bg-muted/30 text-muted-foreground/30 cursor-not-allowed scale-90'
                          : selectedOption === val
                            ? 'bg-accent text-accent-foreground scale-110 shadow-lg shadow-accent/30 ring-2 ring-accent/50'
                            : 'bg-card border border-border text-foreground hover:border-accent hover:scale-105 cursor-pointer shadow-sm'
                        }`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <button
              onClick={handleSubmit}
              disabled={!allFilled || showResult !== null}
              className={`w-full py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all
                ${allFilled && !showResult
                  ? 'bg-accent text-accent-foreground hover:bg-accent/90 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
            >
              {showResult === 'correct' ? '✓ Correct!' : showResult === 'wrong' ? '✗ Wrong' : 'Submit Answer'}
            </button>
          </div>

          {/* Flash overlay */}
          {showResult && (
            <div className={`absolute inset-0 pointer-events-none animate-fade-in rounded-2xl
              ${showResult === 'wrong' ? 'bg-destructive/10' : 'bg-success/10'}`} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CrossMathGame;
