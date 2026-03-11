import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Clock, Trophy, RotateCcw } from 'lucide-react';
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
  timeLimit: number;
}

const LEVELS: LevelConfig[] = [
  { gridSize: 5, maxNumber: 10, label: 'Level 1', timeLimit: 15 },
  { gridSize: 6, maxNumber: 12, label: 'Level 2', timeLimit: 25 },
  { gridSize: 7, maxNumber: 14, label: 'Level 3', timeLimit: 30 },
  { gridSize: 8, maxNumber: 16, label: 'Level 4', timeLimit: 40 },
];

const ROUNDS_PER_LEVEL = 5;
const TOTAL_ROUNDS = LEVELS.length * ROUNDS_PER_LEVEL;

function getMarksForRound(round: number): number {
  return 10;
}

// ——— Puzzle Generator ————————————————————————————————————————————————————————————
function generatePuzzle(gridSize: number, maxNumber: number): Cell[][] {
  let path: { row: number; col: number }[] | null = null;
  
  // Try up to 5 times to get a decent Hamiltonian path
  for (let attempt = 0; attempt < 5; attempt++) {
    path = generateHamiltonianPath(gridSize);
    if (path && path.length === gridSize * gridSize) break;
  }

  // Ensure path is long enough, fallback to snake if needed
  if (!path || path.length < Math.max(maxNumber, gridSize * gridSize * 0.5)) {
    path = generateSnakePuzzlePath(gridSize);
  }

  const numberPositions = new Map<string, number>();
  
  // Guarantee unique indices for numbers
  // Always include start (0) and end (path.length - 1)
  const availableIndices = Array.from({ length: path.length - 2 }, (_, i) => i + 1);
  // Shuffle available indices to pick random checkpoints
  for (let i = availableIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
  }
  
  const selectedIndices = [0];
  const numCheckpoints = Math.min(maxNumber - 2, availableIndices.length);
  for (let i = 0; i < numCheckpoints; i++) {
    selectedIndices.push(availableIndices[i]);
  }
  selectedIndices.push(path.length - 1);
  selectedIndices.sort((a, b) => a - b);

  // Map the selected indices to numbers 1 to maxNumber
  // If we have fewer indices than maxNumber, we just use what we have
  selectedIndices.forEach((pathIndex, i) => {
    const pos = path![pathIndex];
    numberPositions.set(`${pos.row}-${pos.col}`, i + 1);
  });

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

  // Start randomly to ensure variety
  const startRow = Math.floor(Math.random() * size);
  const startCol = Math.floor(Math.random() * size);

  visited[startRow][startCol] = true;
  path.push({ row: startRow, col: startCol });

  const iterations = { count: 0 };
  let bestPath = [...path];

  const dirs = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  function backtrack(
    p: { row: number; col: number }[],
    v: boolean[][],
    s: number,
    t: number,
    iters: { count: number }
  ): boolean {
    if (p.length > bestPath.length) {
      bestPath = [...p];
    }
    // Limit strictly so we don't freeze, but warnsdorff makes it very efficient
    if (iters.count++ > 6000) return false;
    if (p.length === t) return true;

    const current = p[p.length - 1];

    // Warnsdorff's heuristic: sort available moves by the number of subsequent available moves
    const movesWithScores = dirs.map(dir => {
      const nr = current.row + dir.dr;
      const nc = current.col + dir.dc;
      let score = 0;

      if (nr >= 0 && nr < s && nc >= 0 && nc < s && !v[nr][nc]) {
        for (const d2 of dirs) {
          const nnr = nr + d2.dr;
          const nnc = nc + d2.dc;
          if (nnr >= 0 && nnr < s && nnc >= 0 && nnc < s && !v[nnr][nnc]) score++;
        }
      } else {
        score = 999; // Invalid move
      }
      return { dir, score, rnd: Math.random() };
    });

    movesWithScores.sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      return a.rnd - b.rnd; // tie breaker
    });

    for (const { dir, score } of movesWithScores) {
      if (score === 999) continue;
      const nr = current.row + dir.dr;
      const nc = current.col + dir.dc;

      v[nr][nc] = true;
      p.push({ row: nr, col: nc });

      if (backtrack(p, v, s, t, iters)) return true;

      p.pop();
      v[nr][nc] = false;
    }
    return false;
  }

  if (backtrack(path, visited, size, totalCells, iterations)) {
    return path;
  }

  if (bestPath.length >= size * size * 0.6) {
    return bestPath;
  }

  return null;
}

function generateSnakePuzzlePath(gridSize: number): { row: number; col: number }[] {
  const path: { row: number; col: number }[] = [];
  const startCorner = Math.floor(Math.random() * 4); // 0: TL, 1: TR, 2: BL, 3: BR
  const horizontal = Math.random() > 0.5;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      let actualR = r;
      let actualC = (r % 2 === 0 ? c : gridSize - 1 - c);
      
      // Rotate/Flip based on start corner
      let finalR = actualR;
      let finalC = actualC;
      
      if (!horizontal) {
        [finalR, finalC] = [actualC, actualR];
      }
      
      if (startCorner === 1) { // Top Right
        finalC = gridSize - 1 - finalC;
      } else if (startCorner === 2) { // Bottom Left
        finalR = gridSize - 1 - finalR;
      } else if (startCorner === 3) { // Bottom Right
        finalR = gridSize - 1 - finalR;
        finalC = gridSize - 1 - finalC;
      }

      path.push({ row: finalR, col: finalC });
    }
  }
  return path;
}

// ——— Component ——————————————————————————————————————————————————————————————————————
const NumLinkGame = () => {
  const { currentStudent, updateStudentProgress, submitGameResult, finishTest, currentTest,
    addCompletedGame,
    getNextGame,
  } = useGame();
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
  const [timeLeft, setTimeLeft] = useState(LEVELS[0].timeLimit);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showFlash, setShowFlash] = useState<'correct' | 'wrong' | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());
  const gridRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const pathStackRef = useRef<{ row: number; col: number }[]>([]);
  const gridStateRef = useRef<Cell[][]>([]);
  const expectedNumberRef = useRef(1);
  const scoreRef = useRef(0);
  const correctCountRef = useRef(0);
  const isSubmitting = useRef(false);

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
    setTimeLeft(level.timeLimit);
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
          if (currentTest?.showResults !== false) {
            toast.error(OOPS_MESSAGES[Math.floor(Math.random() * OOPS_MESSAGES.length)], { icon: '⌛' });
          }
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
      
      // Support finishing as long as all numbers are connected. 
      // Filling everything is encouraged by Hamiltonian generation but we add a safety check.
      if (newExpected > level.maxNumber) {
        if (!allFilled) {
          toast.error("Connect all numbers AND fill the entire grid!", { id: 'fill-grid-warn' });
          return;
        }
        if (isSubmitting.current) return;
        isSubmitting.current = true;
        isDrawingRef.current = false;
        setIsDrawing(false);
        setRoundComplete(true);

        const marks = getMarksForRound(globalRound + 1);
        const newScore = score + marks;
        setScore(newScore);
        scoreRef.current = newScore;
        
        const newCorrect = correctCount + 1;
        setCorrectCount(newCorrect);
        correctCountRef.current = newCorrect;
        if (currentTest?.showResults !== false) {
          toast.success(SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)], { icon: '🎉' });
        }
        setShowFlash('correct');
        setTimeout(() => setShowFlash(null), 600);

        if (currentStudent) {
          updateStudentProgress(currentStudent.username, scoreRef.current, globalRound + 1, correctCountRef.current, TOTAL_ROUNDS, 'numlink');
        }

        // Auto advance after brief delay
        setTimeout(() => {
          handleNextRoundRef.current();
        }, 1500);
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
  }, [currentLevel, globalRound, score, correctCount, currentStudent, updateStudentProgress, roundComplete, roundFailed]);

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

  const handleNextRoundRef = useRef<() => void>(() => { });

  useEffect(() => {
    if (finished && currentStudent && !submitted) {
      setSubmitted(true);
      submitGameResult(currentStudent.username, {
        gameId: 'numlink',
        score: score,
        timeTaken: elapsed,
        correctAnswers: correctCount,
        totalQuestions: TOTAL_ROUNDS,
        completedAt: Date.now()
      }).then(() => {
        addCompletedGame('numlink');
        confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
      });
    }
  }, [finished, currentStudent, submitted, elapsed, score, correctCount, submitGameResult, addCompletedGame, TOTAL_ROUNDS]);

  const handleNextRound = useCallback(() => {
    if (globalRound + 1 >= TOTAL_ROUNDS) {
      setFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (currentRound + 1 >= ROUNDS_PER_LEVEL) {
      setCurrentLevel(prev => prev + 1);
      setCurrentRound(0);
    } else {
      setCurrentRound(prev => prev + 1);
    }
    isSubmitting.current = false;
  }, [globalRound, currentRound, currentStudent, elapsed, score, correctCount, submitGameResult, addCompletedGame, TOTAL_ROUNDS, ROUNDS_PER_LEVEL]);

  useEffect(() => {
    handleNextRoundRef.current = handleNextRound;
  }, [handleNextRound]);

  useEffect(() => {
    if (roundFailed && !roundComplete) {
      // Auto advance on failure after brief delay
      const timeout = setTimeout(() => {
        handleNextRoundRef.current();
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [roundFailed, roundComplete]);

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
      <div className="flex flex-col flex-1 w-full h-full bg-transparent font-sans relative overflow-hidden pt-12 sm:pt-14">
        <style>{`
          header { background: transparent !important; border: none !important; box-shadow: none !important; }
        `}</style>
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-transparent" />
        </div>
        <div className="flex flex-col flex-1 items-center justify-center p-4 relative z-10 w-full h-full overflow-y-auto">
          <div className="text-center animate-fade-in max-w-md w-full px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-sky-100 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-sky-200/40">
              <Trophy className="w-10 h-10 text-sky-500" />
            </div>
            <h1 className="text-[32px] sm:text-[42px] font-black text-[#0F172A] tracking-tight leading-none mb-3">NumLink Complete!</h1>
            <p className="text-[15px] text-[#64748B] mb-10 font-medium tracking-tight">Magnificent performance, {currentStudent?.username}!</p>

            <div className="bg-white/90 backdrop-blur-2xl border border-sky-100 rounded-[2.5rem] p-10 mb-10 shadow-[0_20px_60px_-15px_rgba(56,189,248,0.12)]">
              <div className="flex items-center justify-center gap-10">
                <div className="text-center">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Score</span>
                  <span className="font-mono font-black text-3xl sm:text-4xl text-sky-500">{currentTest?.showResults !== false ? score : '---'}</span>
                </div>
                <div className="w-px h-14 bg-sky-100" />
                <div className="text-center">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Rounds</span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-mono font-black text-3xl sm:text-4xl text-emerald-500">{currentTest?.showResults !== false ? correctCount : '---'}</span>
                    <span className="text-sm text-[#94A3B8] font-bold">/ {TOTAL_ROUNDS}</span>
                  </div>
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
      </div>
    );
  }

  const level = LEVELS[currentLevel];
  const progress = ((globalRound + 1) / TOTAL_ROUNDS) * 100;

  return (
    <div className={`flex flex-col flex-1 w-full h-full bg-transparent font-sans relative overflow-hidden pt-12 sm:pt-14 ${showFlash === 'correct' ? 'flash-correct' : showFlash === 'wrong' ? 'flash-wrong' : ''}`}>
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Soft Multi-Gradient Base */}
        <div className="absolute inset-0 bg-transparent" />
      </div>

      <div className="flex flex-col flex-1 items-center px-4 sm:px-6 pb-4 pt-1 sm:pt-2 relative z-10 w-full overflow-y-auto">
        <div className="w-full max-w-[500px] h-full flex flex-col justify-center animate-fade-in relative min-h-0">

          <div className="flex-none mb-0 sm:mb-1">
            <div className="w-full mb-1 sm:mb-1.5 flex flex-col items-center text-center">
              <h1 className="text-[18px] sm:text-[22px] font-black tracking-tight text-[#0F172A] uppercase leading-none">
                NumLink
              </h1>
              <p className="text-[12px] text-[#64748B] font-bold mt-0.5 max-w-[200px] truncate sm:max-w-none">Connect numbers and fill the grid</p>
            </div>

            <div className="flex items-center justify-between px-2 tracking-tight font-bold scale-95 origin-center text-[#64748B] text-[13px]">
              <span className="truncate max-w-[150px]">{currentStudent?.username}</span>
              <div className="w-[100px]" />
            </div>
          </div>

          <div className="flex-none flex flex-col justify-center relative mt-2 sm:mt-3">

            {/* Timer pill floating left outside */}
            <div className="absolute -top-12 left-4 sm:top-6 sm:-left-24 z-20">
              <div className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 sm:py-2 sm:px-4 rounded-xl shadow-lg border-2 transition-all duration-300 backdrop-blur-md bg-red-50 border-red-200 text-red-500`}>
                <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${timeLeft <= Math.floor(level.timeLimit * 0.3) ? 'animate-pulse' : ''}`} />
                <span className="font-mono font-black text-[14px] sm:text-[16px] leading-none tracking-tight">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <div className={`bg-white/95 backdrop-blur-2xl rounded-[1.5rem] shadow-[0_20px_60px_-15px_rgba(56,189,248,0.15)] border-2 transition-all duration-300 overflow-hidden relative ${showFlash === 'wrong' && currentTest?.showResults !== false ? 'border-red-200' : showFlash === 'correct' && currentTest?.showResults !== false ? 'border-emerald-200' : 'border-sky-100'}`}>
              <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 border-b border-sky-50">
                <div className="relative flex items-center justify-between mb-4 h-10">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${currentLevel <= 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>{level.label}</span>
                      <span className="text-[15px] font-black text-[#0F172A]">Round {globalRound + 1} / {TOTAL_ROUNDS}</span>
                    </div>
                  </div>

                  <div className="w-[100px]" />

                  {currentTest?.showResults !== false ? (
                    <div className="text-right flex flex-col gap-0.5 z-10 w-[100px] items-end">
                      <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest leading-none">SCORE</span>
                      <span className="font-mono font-black text-xl text-sky-500 leading-none">{score}</span>
                    </div>
                  ) : (
                    <div className="w-[100px]" />
                  )}
                </div>
                <div className="w-full h-2 bg-sky-50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="p-2 sm:p-4 flex justify-center">
                <div
                  ref={gridRef}
                  className="inline-grid gap-1 sm:gap-1.5"
                  style={{ gridTemplateColumns: `repeat(${level.gridSize}, 1fr)` }}
                  onTouchMove={handleTouchMove}
                  onMouseUp={handleMouseUp}
                >
                  {grid.map((row, r) =>
                    row.map((cell, c) => {
                      const isNumberCell = cell.number !== null;
                      const isPath = cell.inPath;
                      const isFilled = cell.filled;

                      let cellSize = 'w-10 h-10 sm:w-12 sm:h-12';
                      if (level.gridSize <= 5) cellSize = 'w-12 h-12 sm:w-14 sm:h-14';
                      if (level.gridSize >= 7) cellSize = 'w-8 h-8 sm:w-10 sm:h-10';

                      const textSize = level.gridSize >= 7 ? 'text-[15px] sm:text-[18px]' : 'text-[18px] sm:text-[22px]';

                      return (
                        <div
                          key={`${r}-${c}`}
                          data-row={r}
                          data-col={c}
                          onMouseDown={() => handleCellInteraction(r, c)}
                          onMouseEnter={() => { if (isDrawingRef.current) handleCellInteraction(r, c); }}
                          onTouchStart={(e) => { e.preventDefault(); handleCellInteraction(r, c); }}
                          className={`${cellSize} rounded-xl flex items-center justify-center font-black ${textSize} select-none touch-none cursor-pointer transition-all duration-150 border-[3px]
                          ${isNumberCell
                              ? isFilled
                                ? 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/20 scale-105'
                                : 'bg-white border-sky-200 text-[#0F172A] shadow-sm hover:border-sky-300'
                              : isPath
                                ? 'bg-emerald-500/20 border-emerald-500/30'
                                : 'bg-sky-50/50 border-sky-200 hover:border-sky-300 shadow-sm'
                            }`}
                        >
                          {isNumberCell ? cell.number : ''}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="px-4 sm:px-6 pb-2 sm:pb-3 flex flex-col gap-1">
                <div className="flex gap-2">
                  {!roundComplete && !roundFailed && (
                    <button onClick={handleReset} className="flex-1 py-3 mb-1 rounded-[14px] sm:rounded-2xl font-black text-[12px] sm:text-[14px] uppercase tracking-widest bg-sky-50 text-sky-500 border-2 border-sky-100 hover:bg-sky-100 transition-all flex items-center justify-center gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Reset Path
                    </button>
                  )}
                </div>

                {(roundComplete || roundFailed) && (
                  <div className={`text-center text-[13px] font-black uppercase tracking-widest ${roundComplete ? 'text-emerald-500' : 'text-red-500'}`}>
                    {roundComplete
                      ? (currentTest?.showResults !== false ? `✓ Solved! +${getMarksForRound(globalRound + 1)} pts` : '✓ Solved!')
                      : timeLeft <= 0 ? "⌛ Time's up!" : "✕ Failed!"}
                  </div>
                )}
              </div>

              {showFlash && currentTest?.showResults !== false && (
                <div className={`absolute inset-0 pointer-events-none animate-fade-in ${showFlash === 'wrong' ? 'bg-red-500/5' : 'bg-emerald-500/5'}`} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumLinkGame;
