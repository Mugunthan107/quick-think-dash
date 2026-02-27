import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Clock, Trophy, RotateCcw } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────
interface Cell {
  row: number;
  col: number;
  number: number | null; // null = empty
  filled: boolean;       // part of the path
  inPath: boolean;       // currently green (non-number cells)
}

interface LevelConfig {
  gridSize: number;
  maxNumber: number;
  label: string;
}

const LEVELS: LevelConfig[] = [
  { gridSize: 5, maxNumber: 5, label: 'Level 1' },
  { gridSize: 5, maxNumber: 6, label: 'Level 2' },
  { gridSize: 5, maxNumber: 7, label: 'Level 3' },
  { gridSize: 5, maxNumber: 8, label: 'Level 4' },
];

const ROUNDS_PER_LEVEL = 2;
const TOTAL_ROUNDS = LEVELS.length * ROUNDS_PER_LEVEL; // 8
const TIME_PER_ROUND = 60; // seconds

function getMarksForRound(round: number): number {
  if (round <= 2) return 5;
  if (round <= 4) return 10;
  if (round <= 6) return 15;
  return 20;
}

// ─── Puzzle Generator ───────────────────────────────────
// We generate a valid Hamiltonian path on the grid, then place numbers along it
function generatePuzzle(gridSize: number, maxNumber: number): Cell[][] {
  const totalCells = gridSize * gridSize;

  // Generate a random Hamiltonian path using backtracking with randomization
  const path = generateHamiltonianPath(gridSize);

  if (!path || path.length < totalCells) {
    // Fallback: create a snake path
    return generateSnakePuzzle(gridSize, maxNumber);
  }

  // Place numbers at evenly spaced positions along the path
  const numberPositions = new Map<string, number>();
  const step = Math.floor((path.length - 1) / (maxNumber - 1));

  for (let i = 0; i < maxNumber; i++) {
    const pathIndex = i === maxNumber - 1 ? path.length - 1 : i * step;
    const pos = path[pathIndex];
    numberPositions.set(`${pos.row}-${pos.col}`, i + 1);
  }

  // Create grid
  const grid: Cell[][] = [];
  for (let r = 0; r < gridSize; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < gridSize; c++) {
      const key = `${r}-${c}`;
      row.push({
        row: r,
        col: c,
        number: numberPositions.get(key) || null,
        filled: false,
        inPath: false,
      });
    }
    grid.push(row);
  }

  return grid;
}

function generateHamiltonianPath(size: number): { row: number; col: number }[] | null {
  const visited = Array.from({ length: size }, () => Array(size).fill(false));
  const path: { row: number; col: number }[] = [];
  const totalCells = size * size;

  // Start from a random corner or edge
  const startRow = Math.random() < 0.5 ? 0 : size - 1;
  const startCol = Math.random() < 0.5 ? 0 : size - 1;

  visited[startRow][startCol] = true;
  path.push({ row: startRow, col: startCol });

  if (backtrack(path, visited, size, totalCells)) {
    return path;
  }

  return null;
}

function backtrack(
  path: { row: number; col: number }[],
  visited: boolean[][],
  size: number,
  total: number
): boolean {
  if (path.length === total) return true;

  const current = path[path.length - 1];
  const dirs = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  // Shuffle directions for randomness
  for (let i = dirs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
  }

  for (const { dr, dc } of dirs) {
    const nr = current.row + dr;
    const nc = current.col + dc;

    if (nr >= 0 && nr < size && nc >= 0 && nc < size && !visited[nr][nc]) {
      visited[nr][nc] = true;
      path.push({ row: nr, col: nc });

      if (backtrack(path, visited, size, total)) return true;

      path.pop();
      visited[nr][nc] = false;
    }
  }

  return false;
}

function generateSnakePuzzle(gridSize: number, maxNumber: number): Cell[][] {
  // Fallback: snake path
  const path: { row: number; col: number }[] = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const col = r % 2 === 0 ? c : gridSize - 1 - c;
      path.push({ row: r, col });
    }
  }

  const numberPositions = new Map<string, number>();
  const step = Math.floor((path.length - 1) / (maxNumber - 1));
  for (let i = 0; i < maxNumber; i++) {
    const pathIndex = i === maxNumber - 1 ? path.length - 1 : i * step;
    const pos = path[pathIndex];
    numberPositions.set(`${pos.row}-${pos.col}`, i + 1);
  }

  const grid: Cell[][] = [];
  for (let r = 0; r < gridSize; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < gridSize; c++) {
      row.push({
        row: r,
        col: c,
        number: numberPositions.get(`${r}-${c}`) || null,
        filled: false,
        inPath: false,
      });
    }
    grid.push(row);
  }
  return grid;
}

// ─── Component ──────────────────────────────────────────
const NumLinkGame = () => {
  const { currentStudent, updateStudentScore, submitGameResult, finishTest, currentTest, addCompletedGame, getNextGame } = useGame();
  const navigate = useNavigate();

  const [currentLevel, setCurrentLevel] = useState(0); // 0-3
  const [currentRound, setCurrentRound] = useState(0); // 0-1 within level
  const globalRound = currentLevel * ROUNDS_PER_LEVEL + currentRound; // 0-7

  const [grid, setGrid] = useState<Cell[][]>([]);
  const [pathStack, setPathStack] = useState<{ row: number; col: number }[]>([]);
  const [expectedNumber, setExpectedNumber] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [roundComplete, setRoundComplete] = useState(false);
  const [roundFailed, setRoundFailed] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_ROUND);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showFlash, setShowFlash] = useState<'correct' | 'wrong' | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());
  const gridRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const pathStackRef = useRef<{ row: number; col: number }[]>([]);
  const gridStateRef = useRef<Cell[][]>([]);
  const expectedNumberRef = useRef(1);

  useEffect(() => {
    if (!currentStudent) {
      navigate('/student');
      return;
    }
    startTimeRef.current = Date.now();
  }, [currentStudent, navigate]);

  // Initialize puzzle for current round
  useEffect(() => {
    if (finished) return;
    const level = LEVELS[currentLevel];
    const newGrid = generatePuzzle(level.gridSize, level.maxNumber);
    setGrid(newGrid);
    gridStateRef.current = newGrid;
    setPathStack([]);
    pathStackRef.current = [];
    setExpectedNumber(1);
    expectedNumberRef.current = 1;
    setIsDrawing(false);
    isDrawingRef.current = false;
    setRoundComplete(false);
    setRoundFailed(false);
    setTimeLeft(TIME_PER_ROUND);
  }, [currentLevel, currentRound, finished]);

  // Timer
  useEffect(() => {
    if (finished || roundComplete || roundFailed) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - fail round
          setRoundFailed(true);
          setShowFlash('wrong');
          setTimeout(() => setShowFlash(null), 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [finished, roundComplete, roundFailed, currentLevel, currentRound]);

  const isAdjacent = (a: { row: number; col: number }, b: { row: number; col: number }) => {
    return (Math.abs(a.row - b.row) + Math.abs(a.col - b.col)) === 1;
  };

  const handleCellInteraction = useCallback((row: number, col: number) => {
    const currentGrid = gridStateRef.current;
    const cell = currentGrid[row]?.[col];
    if (!cell || roundComplete || roundFailed) return;

    const drawing = isDrawingRef.current;
    const stack = pathStackRef.current;
    const expected = expectedNumberRef.current;

    if (!drawing) {
      // Can only start on number 1
      if (cell.number === 1) {
        isDrawingRef.current = true;
        setIsDrawing(true);
        const newStack = [{ row, col }];
        pathStackRef.current = newStack;
        setPathStack(newStack);

        const newGrid = currentGrid.map(r => r.map(c => ({ ...c, inPath: false, filled: false })));
        newGrid[row][col].filled = true;
        gridStateRef.current = newGrid;
        setGrid(newGrid);

        expectedNumberRef.current = 2;
        setExpectedNumber(2);
      }
      return;
    }

    // Already drawing
    const lastPos = stack[stack.length - 1];
    if (!lastPos) return;

    // Check for backtracking (undo) — going back to the previous cell in the stack
    if (stack.length >= 2) {
      const prevPos = stack[stack.length - 2];
      if (prevPos.row === row && prevPos.col === col) {
        // Undo last cell
        const removedPos = stack[stack.length - 1];
        const removedCell = currentGrid[removedPos.row][removedPos.col];

        const newStack = stack.slice(0, -1);
        pathStackRef.current = newStack;
        setPathStack(newStack);

        const newGrid = currentGrid.map(r => r.map(c => ({ ...c })));
        if (removedCell.number === null) {
          newGrid[removedPos.row][removedPos.col].inPath = false;
          newGrid[removedPos.row][removedPos.col].filled = false;
        } else {
          newGrid[removedPos.row][removedPos.col].filled = false;
          // Revert expected number back to this number
          const newExpected = removedCell.number;
          expectedNumberRef.current = newExpected;
          setExpectedNumber(newExpected);
        }
        gridStateRef.current = newGrid;
        setGrid(newGrid);
        return;
      }
    }

    // Can't revisit already-filled cells (except backtracking above)
    if (cell.filled || cell.inPath) return;

    // Must be adjacent to current last position
    if (!isAdjacent(lastPos, { row, col })) return;

    // If cell has a number — it BLOCKS the path unless it is the next expected number
    if (cell.number !== null) {
      if (cell.number !== expected) {
        // Wrong number encountered — block movement, cannot pass through
        return;
      }

      // Correct next number — collect it automatically
      const newStack = [...stack, { row, col }];
      pathStackRef.current = newStack;
      setPathStack(newStack);

      const newGrid = currentGrid.map(r => r.map(c => ({ ...c })));
      newGrid[row][col].filled = true;
      gridStateRef.current = newGrid;
      setGrid(newGrid);

      const newExpected = expected + 1;
      expectedNumberRef.current = newExpected;
      setExpectedNumber(newExpected);

      // Check if puzzle solved (visited all numbers and all cells filled)
      const level = LEVELS[currentLevel];
      const allFilled = newGrid.every(r => r.every(c => c.filled || c.inPath));
      if (newExpected > level.maxNumber && allFilled) {
        isDrawingRef.current = false;
        setIsDrawing(false);
        setRoundComplete(true);

        const marks = getMarksForRound(globalRound + 1);
        const newScore = score + marks;
        const newCorrect = correctCount + 1;
        setScore(newScore);
        setCorrectCount(newCorrect);
        setShowFlash('correct');
        setTimeout(() => setShowFlash(null), 600);

        if (currentStudent) {
          updateStudentScore(currentStudent.username, newScore, globalRound + 1, newCorrect);
        }
      }
    } else {
      // Empty cell — freely traversable, mark it as part of the path
      const newStack = [...stack, { row, col }];
      pathStackRef.current = newStack;
      setPathStack(newStack);

      const newGrid = currentGrid.map(r => r.map(c => ({ ...c })));
      newGrid[row][col].inPath = true;
      newGrid[row][col].filled = true;
      gridStateRef.current = newGrid;
      setGrid(newGrid);
    }
  }, [currentLevel, globalRound, score, correctCount, currentStudent, updateStudentScore, roundComplete, roundFailed]);

  const handleMouseUp = useCallback(() => {
    isDrawingRef.current = false;
    setIsDrawing(false);
  }, []);

  // Global mouseup/touchend
  useEffect(() => {
    const handler = () => {
      isDrawingRef.current = false;
      setIsDrawing(false);
    };
    window.addEventListener('mouseup', handler);
    window.addEventListener('touchend', handler);
    return () => {
      window.removeEventListener('mouseup', handler);
      window.removeEventListener('touchend', handler);
    };
  }, []);

  const handleReset = () => {
    const level = LEVELS[currentLevel];
    const newGrid = grid.map(r => r.map(c => ({ ...c, filled: false, inPath: false })));
    gridStateRef.current = newGrid;
    setGrid(newGrid);
    setPathStack([]);
    pathStackRef.current = [];
    setExpectedNumber(1);
    expectedNumberRef.current = 1;
    setIsDrawing(false);
    isDrawingRef.current = false;
  };

  const handleNextRound = () => {
    if (globalRound + 1 >= TOTAL_ROUNDS) {
      // Game finished
      setFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);

      if (currentStudent) {
        submitGameResult(currentStudent.username, {
          gameId: 'numlink',
          score,
          timeTaken: elapsed,
          correctAnswers: correctCount,
          totalQuestions: TOTAL_ROUNDS,
          completedAt: Date.now()
        }).then(() => {
          addCompletedGame('numlink');
        });
      }
      return;
    }

    if (currentRound + 1 >= ROUNDS_PER_LEVEL) {
      setCurrentLevel(prev => prev + 1);
      setCurrentRound(0);
    } else {
      setCurrentRound(prev => prev + 1);
    }
  };

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

  // Touch handling for drag
  const getCellFromTouch = (touch: React.Touch): { row: number; col: number } | null => {
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return null;
    const row = element.getAttribute('data-row');
    const col = element.getAttribute('data-col');
    if (row === null || col === null) return null;
    return { row: parseInt(row), col: parseInt(col) };
  };

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const cellPos = getCellFromTouch(touch);
    if (cellPos) {
      handleCellInteraction(cellPos.row, cellPos.col);
    }
  }, [handleCellInteraction]);

  // ─── Finished Screen ─────────────────────────────────
  if (finished) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 relative z-10">
        <div className="text-center animate-fade-in max-w-md w-full px-2">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6 sm:mb-8 animate-pulse-ring">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-success" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">NumLink Complete!</h1>
          <p className="text-muted-foreground mb-2">Great work, {currentStudent?.username}!</p>
          <div className="flex items-center justify-center gap-6 my-6 sm:my-8">
            <div className="text-center">
              <span className="text-xs text-muted-foreground block mb-1">SCORE</span>
              <span className="font-mono font-bold text-2xl sm:text-3xl text-accent">{score}</span>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <span className="text-xs text-muted-foreground block mb-1">ROUNDS</span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-mono font-bold text-2xl sm:text-3xl text-success">{correctCount}</span>
                <span className="text-sm text-muted-foreground">/ {TOTAL_ROUNDS}</span>
              </div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <span className="text-xs text-muted-foreground block mb-1">TIME</span>
              <span className="font-mono font-bold text-2xl sm:text-3xl text-foreground">{formatTime(elapsed)}</span>
            </div>
          </div>
          <button
            onClick={handlePostFinish}
            className="bg-accent text-accent-foreground px-8 py-4 rounded-lg font-semibold hover:bg-accent/90 transition-all hover:scale-105 text-base sm:text-lg"
          >
            {getNextGame() ? 'Next Game →' : 'Finish'}
          </button>
        </div>
      </div>
    );
  }

  const level = LEVELS[currentLevel];
  const progress = ((globalRound + 1) / TOTAL_ROUNDS) * 100;
  const timerProgress = (timeLeft / TIME_PER_ROUND) * 100;

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
                  gameId: 'numlink',
                  score,
                  timeTaken: elapsed,
                  correctAnswers: correctCount,
                  totalQuestions: TOTAL_ROUNDS,
                  completedAt: Date.now()
                }).then(() => addCompletedGame('numlink'));
              }
            }}
            className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-secondary border border-border/50"
          >
            End Test
          </button>
        </div>

        {/* Main Card */}
        <div className={`bg-card/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-border overflow-hidden transition-all duration-300
          ${showFlash === 'correct' ? 'border-success/50' : showFlash === 'wrong' ? 'border-destructive/50' : ''}`}>

          {/* Header */}
          <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider
                  ${currentLevel <= 1 ? 'bg-success/15 text-success' :
                    currentLevel === 2 ? 'bg-accent/15 text-accent' :
                      'bg-destructive/15 text-destructive'}`}>
                  {level.label}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-foreground">
                  Round {globalRound + 1} / {TOTAL_ROUNDS}
                </span>
                <span className="text-[10px] text-muted-foreground">(1 → {level.maxNumber})</span>
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

          {/* Timer */}
          <div className="px-4 sm:px-6 pb-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-linear ${timeLeft <= 10 ? 'bg-destructive' : 'bg-accent'}`}
                  style={{ width: `${timerProgress}%` }}
                />
              </div>
              <span className={`font-mono text-sm font-bold ${timeLeft <= 10 ? 'text-destructive' : 'text-foreground'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Grid */}
          <div className="px-4 sm:px-6 py-4 sm:py-6 flex justify-center">
            <div
              ref={gridRef}
              className="inline-grid gap-1"
              style={{ gridTemplateColumns: `repeat(${level.gridSize}, 1fr)` }}
              onTouchMove={handleTouchMove}
              onMouseUp={handleMouseUp}
            >
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const isNumberCell = cell.number !== null;
                  const isPath = cell.inPath;
                  const isFilled = cell.filled;

                  const cellSize = level.gridSize <= 5 ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-10 h-10 sm:w-12 sm:h-12';

                  return (
                    <div
                      key={`${r}-${c}`}
                      data-row={r}
                      data-col={c}
                      onMouseDown={() => handleCellInteraction(r, c)}
                      onMouseEnter={() => {
                        if (isDrawingRef.current) handleCellInteraction(r, c);
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        handleCellInteraction(r, c);
                      }}
                      className={`${cellSize} rounded-lg flex items-center justify-center font-bold text-base sm:text-lg select-none touch-none cursor-pointer transition-all duration-150
                        ${isNumberCell
                          ? isFilled
                            ? 'bg-foreground text-background shadow-md scale-105'
                            : 'bg-secondary border-2 border-foreground/30 text-foreground'
                          : isPath
                            ? 'bg-success/70 shadow-inner'
                            : 'bg-secondary/60 border border-border/50 hover:bg-secondary/80'
                        }`}
                    >
                      {isNumberCell ? cell.number : ''}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex gap-2">
            {roundComplete ? (
              <button
                onClick={handleNextRound}
                className="flex-1 py-3 rounded-xl font-semibold text-sm sm:text-base bg-success text-success-foreground hover:bg-success/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {globalRound + 1 >= TOTAL_ROUNDS ? '🏆 View Results' : 'Next Round →'}
              </button>
            ) : roundFailed ? (
              <button
                onClick={handleNextRound}
                className="flex-1 py-3 rounded-xl font-semibold text-sm sm:text-base bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all"
              >
                {globalRound + 1 >= TOTAL_ROUNDS ? '🏆 View Results' : 'Skip to Next →'}
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl font-semibold text-sm sm:text-base bg-secondary text-foreground hover:bg-secondary/80 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Path
              </button>
            )}
          </div>

          {/* Status Message */}
          {(roundComplete || roundFailed) && (
            <div className={`px-4 sm:px-6 pb-4 text-center text-sm font-medium ${roundComplete ? 'text-success' : 'text-destructive'}`}>
              {roundComplete
                ? `✓ Solved! +${getMarksForRound(globalRound + 1)} points`
                : timeLeft <= 0
                  ? '⏱ Time\'s up! 0 points this round'
                  : '✗ Failed! 0 points this round'
              }
            </div>
          )}

          {/* Flash overlay */}
          {showFlash && (
            <div className={`absolute inset-0 pointer-events-none animate-fade-in rounded-2xl
              ${showFlash === 'wrong' ? 'bg-destructive/10' : 'bg-success/10'}`} />
          )}
        </div>

        {/* Marks Info */}
        <div className="mt-3 px-1">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Round marks: {getMarksForRound(globalRound + 1)} pts</span>
            <span>Max possible: {[5, 5, 10, 10, 15, 15, 20, 20].reduce((a, b) => a + b, 0)} pts</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumLinkGame;
