import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Clock, Trophy, RotateCcw } from 'lucide-react';

// ——— Types ——————————————————————————————————————————————————————————————————————
interface Cell {
  row: number;
  col: number;
  number: number | null;
  filled: boolean;
  inPath: boolean;
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
const TOTAL_ROUNDS = LEVELS.length * ROUNDS_PER_LEVEL;
const TIME_PER_ROUND = 60;

function getMarksForRound(round: number): number {
  if (round <= 2) return 5;
  if (round <= 4) return 10;
  if (round <= 6) return 15;
  return 20;
}

// ——— Puzzle Generator ————————————————————————————————————————————————————————————
function generatePuzzle(gridSize: number, maxNumber: number): Cell[][] {
  const totalCells = gridSize * gridSize;
  const path = generateHamiltonianPath(gridSize);

  if (!path || path.length < totalCells) {
    return generateSnakePuzzle(gridSize, maxNumber);
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

// ——— Component ——————————————————————————————————————————————————————————————————————
const NumLinkGame = () => {
  const { currentStudent, updateStudentScore, submitGameResult, finishTest, currentTest, addCompletedGame, getNextGame } = useGame();
  const navigate = useNavigate();

  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const globalRound = currentLevel * ROUNDS_PER_LEVEL + currentRound;

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

  useEffect(() => {
    if (finished || roundComplete || roundFailed) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
      setTimeLeft(prev => {
        if (prev <= 1) {
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

    const lastPos = stack[stack.length - 1];
    if (!lastPos) return;

    if (stack.length >= 2) {
      const prevPos = stack[stack.length - 2];
      if (prevPos.row === row && prevPos.col === col) {
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
          const newExpected = removedCell.number;
          expectedNumberRef.current = newExpected;
          setExpectedNumber(newExpected);
        }
        gridStateRef.current = newGrid;
        setGrid(newGrid);
        return;
      }
    }

    if (cell.filled || cell.inPath) return;
    if (!isAdjacent(lastPos, { row, col })) return;

    if (cell.number !== null) {
      if (cell.number !== expected) return;

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

  // ——— Finished Screen ————————————————————————————————————————————————————————————
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
            <h1 className="text-[32px] sm:text-[42px] font-black text-[#0F172A] tracking-tight leading-none mb-3">NumLink Complete!</h1>
            <p className="text-[15px] text-[#64748B] mb-10 font-medium">Excellent work, {currentStudent?.username}!</p>
            <div className="bg-white/90 backdrop-blur-2xl border border-sky-100 rounded-[2.5rem] p-10 mb-10 shadow-[0_20px_60px_-15px_rgba(56,189,248,0.12)]">
              <div className="flex items-center justify-center gap-10">
                <div className="text-center">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Score</span>
                  <span className="font-mono font-black text-3xl sm:text-4xl text-sky-500">{score}</span>
                </div>
                <div className="w-px h-14 bg-sky-100" />
                <div className="text-center">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Rounds</span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-mono font-black text-3xl sm:text-4xl text-emerald-500">{correctCount}</span>
                    <span className="text-sm text-[#94A3B8]">/ {TOTAL_ROUNDS}</span>
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

  const level = LEVELS[currentLevel];
  const progress = ((globalRound + 1) / TOTAL_ROUNDS) * 100;
  const timerProgress = (timeLeft / TIME_PER_ROUND) * 100;

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
              NUM LINK
              <span className="text-[13px] font-bold ml-3 text-[#94A3B8] normal-case opacity-60">1 → {level.maxNumber}</span>
            </h1>
            <p className="text-[13px] text-[#64748B] font-bold mt-1">Connect numbers and fill the grid</p>
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
                  gameId: 'numlink', score, timeTaken: elapsed, correctAnswers: correctCount, totalQuestions: TOTAL_ROUNDS, completedAt: Date.now()
                }).then(() => addCompletedGame('numlink'));
              } else navigate('/');
            }} className="text-[11px] text-[#94A3B8] hover:text-[#2563EB] transition-colors px-3 py-1.5 rounded-xl hover:bg-white/80 border border-sky-100 font-bold uppercase tracking-widest">End Test</button>
          </div>

          <div className={`bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(56,189,248,0.15)] border-2 transition-all duration-300 overflow-hidden relative ${showFlash === 'wrong' ? 'border-red-200' : showFlash === 'correct' ? 'border-emerald-200' : 'border-sky-100'}`}>
            <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-4 border-b border-sky-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${currentLevel <= 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>{level.label}</span>
                  <span className="text-[14px] font-black text-[#0F172A]">Round {globalRound + 1} / {TOTAL_ROUNDS}</span>
                </div>
                <div className="text-right flex flex-col gap-1">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest leading-none">SCORE</span>
                  <span className="font-mono font-black text-2xl text-sky-500">{score}</span>
                </div>
              </div>
              <div className="w-full h-2 bg-sky-50 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-sky-50 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 10 ? 'bg-red-500' : 'bg-sky-500'}`} style={{ width: `${timerProgress}%` }} />
                </div>
                <span className={`font-mono text-[13px] font-black ${timeLeft <= 10 ? 'text-red-500' : 'text-[#0F172A]'}`}>{timeLeft}s</span>
              </div>
            </div>

            <div className="p-8 sm:p-12 flex justify-center">
              <div
                ref={gridRef}
                className="inline-grid gap-2 sm:gap-3"
                style={{ gridTemplateColumns: `repeat(${level.gridSize}, 1fr)` }}
                onTouchMove={handleTouchMove}
                onMouseUp={handleMouseUp}
              >
                {grid.map((row, r) =>
                  row.map((cell, c) => {
                    const isNumberCell = cell.number !== null;
                    const isPath = cell.inPath;
                    const isFilled = cell.filled;
                    const cellSize = level.gridSize <= 5 ? 'w-12 h-12 sm:w-16 sm:h-16' : 'w-10 h-10 sm:w-14 sm:h-14';

                    return (
                      <div
                        key={`${r}-${c}`}
                        data-row={r}
                        data-col={c}
                        onMouseDown={() => handleCellInteraction(r, c)}
                        onMouseEnter={() => { if (isDrawingRef.current) handleCellInteraction(r, c); }}
                        onTouchStart={(e) => { e.preventDefault(); handleCellInteraction(r, c); }}
                        className={`${cellSize} rounded-2xl flex items-center justify-center font-black text-lg sm:text-2xl select-none touch-none cursor-pointer transition-all duration-150 border-2
                          ${isNumberCell
                            ? isFilled
                              ? 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/20 scale-105'
                              : 'bg-white border-sky-100 text-[#0F172A] shadow-sm hover:border-sky-300'
                            : isPath
                              ? 'bg-emerald-500/20 border-emerald-500/30'
                              : 'bg-white border-sky-50 hover:border-sky-100'
                          }`}
                      >
                        {isNumberCell ? cell.number : ''}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="px-6 sm:px-10 pb-10 flex flex-col gap-4">
              <div className="flex gap-2">
                {roundComplete ? (
                  <button onClick={handleNextRound} className="flex-1 py-4 rounded-2xl font-black text-[15px] uppercase tracking-widest bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]">
                    {globalRound + 1 >= TOTAL_ROUNDS ? '🏁 View Results' : 'Next Round →'}
                  </button>
                ) : roundFailed ? (
                  <button onClick={handleNextRound} className="flex-1 py-4 rounded-2xl font-black text-[15px] uppercase tracking-widest bg-red-50 text-red-500 border-2 border-red-100 hover:bg-red-100 transition-all">
                    {globalRound + 1 >= TOTAL_ROUNDS ? '🏁 View Results' : 'Skip to Next →'}
                  </button>
                ) : (
                  <button onClick={handleReset} className="flex-1 py-4 rounded-2xl font-black text-[15px] uppercase tracking-widest bg-sky-50 text-sky-500 border-2 border-sky-100 hover:bg-sky-100 transition-all flex items-center justify-center gap-2">
                    <RotateCcw className="w-5 h-5" />
                    Reset Path
                  </button>
                )}
              </div>

              {(roundComplete || roundFailed) && (
                <div className={`text-center text-[13px] font-black uppercase tracking-widest ${roundComplete ? 'text-emerald-500' : 'text-red-500'}`}>
                  {roundComplete ? `✓ Solved! +${getMarksForRound(globalRound + 1)} pts` : timeLeft <= 0 ? "⌛ Time's up!" : "✕ Failed!"}
                </div>
              )}
            </div>

            {showFlash && (
              <div className={`absolute inset-0 pointer-events-none animate-fade-in ${showFlash === 'wrong' ? 'bg-red-500/5' : 'bg-emerald-500/5'}`} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumLinkGame;
