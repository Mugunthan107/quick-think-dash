import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Clock, Trophy, RefreshCcw, Undo2 } from 'lucide-react';
import DecorativeCurve from '@/components/DecorativeCurve';

// ─── Types ──────────────────────────────────────────────
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

// ─── Puzzle Generator ───────────────────────────────────
function generateHamiltonianPath(size: number): { row: number; col: number }[] | null {
  const visited = Array.from({ length: size }, () => Array(size).fill(false));
  const path: { row: number; col: number }[] = [];
  const totalCells = size * size;

  const startRow = Math.random() < 0.5 ? 0 : size - 1;
  const startCol = Math.random() < 0.5 ? 0 : size - 1;

  visited[startRow][startCol] = true;
  path.push({ row: startRow, col: startCol });

  const backtrack = (p: { row: number; col: number }[], v: boolean[][]): boolean => {
    if (p.length === totalCells) return true;
    const current = p[p.length - 1];
    const dirs = [{ dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }];
    for (let i = dirs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
    }
    for (const { dr, dc } of dirs) {
      const nr = current.row + dr, nc = current.col + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && !v[nr][nc]) {
        v[nr][nc] = true; p.push({ row: nr, col: nc });
        if (backtrack(p, v)) return true;
        p.pop(); v[nr][nc] = false;
      }
    }
    return false;
  };

  if (backtrack(path, visited)) return path;
  return null;
}

function generatePuzzle(gridSize: number, maxNumber: number): Cell[][] {
  let finalPath = generateHamiltonianPath(gridSize);

  if (!finalPath) {
    // Basic snake fallback if Hamiltonian path generation fails
    finalPath = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        finalPath.push({ row: r, col: r % 2 === 0 ? c : gridSize - 1 - c });
      }
    }
  }

  const numberPositions = new Map<string, number>();
  const step = Math.floor((finalPath.length - 1) / (maxNumber - 1));
  for (let i = 0; i < maxNumber; i++) {
    const idx = i === maxNumber - 1 ? finalPath.length - 1 : i * step;
    const pos = finalPath[idx];
    numberPositions.set(`${pos.row}-${pos.col}`, i + 1);
  }

  const grid: Cell[][] = [];
  for (let r = 0; r < gridSize; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < gridSize; c++) {
      row.push({ row: r, col: c, number: numberPositions.get(`${r}-${c}`) || null, filled: false, inPath: false });
    }
    grid.push(row);
  }
  return grid;
}

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
  const gridStateRef = useRef<Cell[][]>([]);
  const expectedNumberRef = useRef(1);
  const pathStackRef = useRef<{ row: number; col: number }[]>([]);

  useEffect(() => {
    if (!currentStudent) { navigate('/student'); return; }
  }, [currentStudent, navigate]);

  useEffect(() => {
    if (currentTest?.status === 'FINISHED') navigate('/');
  }, [currentTest?.status, navigate]);

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
    setRoundComplete(false);
    setRoundFailed(false);
    setTimeLeft(TIME_PER_ROUND);
  }, [currentLevel, currentRound, finished]);

  useEffect(() => {
    if (finished || roundComplete || roundFailed) return;
    timerRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
      setTimeLeft(prev => {
        if (prev <= 1) {
          setRoundFailed(true); setShowFlash('wrong');
          setTimeout(() => setShowFlash(null), 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [finished, roundComplete, roundFailed, currentLevel, currentRound]);

  const handleCellInteraction = useCallback((row: number, col: number) => {
    const currentGrid = gridStateRef.current;
    const cell = currentGrid[row]?.[col];
    if (!cell || roundComplete || roundFailed) return;

    const stack = pathStackRef.current;
    const expected = expectedNumberRef.current;

    if (!isDrawing) {
      if (cell.number === 1) {
        setIsDrawing(true);
        const newStack = [{ row, col }];
        pathStackRef.current = newStack;
        setPathStack(newStack);
        const newGrid = currentGrid.map(r => r.map(c => ({ ...c, inPath: false, filled: false })));
        newGrid[row][col].filled = true;
        gridStateRef.current = newGrid; setGrid(newGrid);
        expectedNumberRef.current = 2; setExpectedNumber(2);
      }
      return;
    }

    const lastPos = stack[stack.length - 1];
    if (!lastPos) return;

    // Undo move if moving back
    if (stack.length >= 2) {
      const prevPos = stack[stack.length - 2];
      if (prevPos.row === row && prevPos.col === col) {
        const removedPos = stack[stack.length - 1];
        const removedCell = currentGrid[removedPos.row][removedPos.col];
        const newStack = stack.slice(0, -1);
        pathStackRef.current = newStack; setPathStack(newStack);
        const newGrid = currentGrid.map(r => r.map(c => ({ ...c })));
        if (removedCell.number === null) {
          newGrid[removedPos.row][removedPos.col].inPath = false;
          newGrid[removedPos.row][removedPos.col].filled = false;
        } else {
          newGrid[removedPos.row][removedPos.col].filled = false;
          expectedNumberRef.current = removedCell.number; setExpectedNumber(removedCell.number);
        }
        gridStateRef.current = newGrid; setGrid(newGrid);
        return;
      }
    }

    if (cell.filled || cell.inPath) return;
    if (Math.abs(lastPos.row - row) + Math.abs(lastPos.col - col) !== 1) return;

    if (cell.number !== null) {
      if (cell.number !== expected) return;
      const newStack = [...stack, { row, col }];
      pathStackRef.current = newStack; setPathStack(newStack);
      const newGrid = currentGrid.map(r => r.map(c => ({ ...c })));
      newGrid[row][col].filled = true;
      gridStateRef.current = newGrid; setGrid(newGrid);
      const nextExpected = expected + 1;
      expectedNumberRef.current = nextExpected; setExpectedNumber(nextExpected);

      const allFilled = newGrid.every(r => r.every(c => c.filled || c.inPath));
      if (nextExpected > LEVELS[currentLevel].maxNumber && allFilled) {
        setIsDrawing(false); setRoundComplete(true);
        const marks = getMarksForRound(globalRound + 1);
        setScore(prev => prev + marks); setCorrectCount(prev => prev + 1);
        setShowFlash('correct'); setTimeout(() => setShowFlash(null), 600);
        if (currentStudent) updateStudentScore(currentStudent.username, score + marks, globalRound + 1, correctCount + 1);
      }
    } else {
      const newStack = [...stack, { row, col }];
      pathStackRef.current = newStack; setPathStack(newStack);
      const newGrid = currentGrid.map(r => r.map(c => ({ ...c })));
      newGrid[row][col].inPath = true; newGrid[row][col].filled = true;
      gridStateRef.current = newGrid; setGrid(newGrid);
    }
  }, [isDrawing, roundComplete, roundFailed, currentLevel, globalRound, score, correctCount, currentStudent, updateStudentScore]);

  useEffect(() => {
    const endDraw = () => setIsDrawing(false);
    window.addEventListener('mouseup', endDraw);
    window.addEventListener('touchend', endDraw);
    return () => { window.removeEventListener('mouseup', endDraw); window.removeEventListener('touchend', endDraw); };
  }, []);

  const handleFinishAction = useCallback(() => {
    setFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (currentStudent && currentTest) {
      submitGameResult(currentStudent.username, {
        gameId: 'numlink', score, timeTaken: elapsed, correctAnswers: correctCount, totalQuestions: TOTAL_ROUNDS, completedAt: Date.now()
      }).then(() => addCompletedGame('numlink'));
    }
  }, [score, correctCount, currentStudent, currentTest, submitGameResult, addCompletedGame, elapsed]);

  const handleNextRound = () => {
    if (globalRound + 1 >= TOTAL_ROUNDS) { handleFinishAction(); return; }
    if (currentRound + 1 >= ROUNDS_PER_LEVEL) { setCurrentLevel(prev => prev + 1); setCurrentRound(0); }
    else setCurrentRound(prev => prev + 1);
  };

  const handleReset = () => {
    const newGrid = grid.map(r => r.map(c => ({ ...c, filled: false, inPath: false })));
    gridStateRef.current = newGrid;
    setGrid(newGrid);
    setPathStack([]);
    pathStackRef.current = [];
    setExpectedNumber(1);
    expectedNumberRef.current = 1;
  };

  const handleUndo = () => {
    const stack = pathStackRef.current;
    if (stack.length <= 1) return;
    const lastPos = stack[stack.length - 1];
    const prevPos = stack[stack.length - 2];
    handleCellInteraction(prevPos.row, prevPos.col);
  };

  const handlePostFinish = useCallback(() => {
    const nextGame = getNextGame();
    if (nextGame) navigate('/select-game');
    else { if (currentStudent) finishTest(currentStudent.username); navigate('/'); }
  }, [getNextGame, navigate, currentStudent, finishTest]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (finished) {
    return (
      <div className="flex flex-col flex-1 w-full bg-[#FDFDFF] font-sans selection:bg-indigo-100 min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#F0F7FF_0%,_#F8FAFC_40%,_#FDFDFF_100%)]" />
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#3B82F6] opacity-[0.04] blur-[120px] rounded-full" />
        </div>
        <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -top-[100px] sm:-top-[150px] -left-[10%] w-[120%] z-0 rotate-180 pointer-events-none mix-blend-multiply" animate={true} />
        <div className="flex items-center justify-center p-4 relative z-10 w-full min-h-screen -mt-14 sm:-mt-16">
          <div className="text-center animate-fade-in max-w-md w-full px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/10"><Trophy className="w-10 h-10 text-emerald-500" /></div>
            <h1 className="text-[32px] sm:text-[42px] font-black text-[#0F172A] tracking-tight leading-none mb-3">NumLink Complete!</h1>
            <p className="text-[15px] text-[#64748B] mb-10 font-medium">Great work, {currentStudent?.username}!</p>
            <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] p-10 mb-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)]">
              <div className="flex items-center justify-center gap-10">
                <div className="text-center">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Score</span>
                  <span className="font-mono font-black text-3xl sm:text-4xl text-[#2563EB]">{score}</span>
                </div>
                <div className="w-px h-14 bg-[#F1F5F9]" />
                <div className="text-center">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Time</span>
                  <span className="font-mono font-black text-3xl sm:text-4xl text-[#1E293B]">{formatTime(elapsed)}</span>
                </div>
              </div>
            </div>
            <button onClick={handlePostFinish} className="w-full sm:w-auto px-12 py-4.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-2xl font-bold text-[16px] shadow-xl shadow-blue-500/25 transition-all hover:scale-105 active:scale-95">{getNextGame() ? 'Next Game →' : 'Finish Session'}</button>
          </div>
        </div>
        <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -bottom-[100px] -left-[10%] w-[120%] z-0 pointer-events-none" animate={true} />
      </div>
    );
  }

  const progress = ((globalRound + 1) / TOTAL_ROUNDS) * 100;
  const timerProgress = (timeLeft / TIME_PER_ROUND) * 100;

  return (
    <div className="flex flex-col flex-1 w-full bg-[#FDFDFF] font-sans selection:bg-indigo-100 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#F0F7FF_0%,_#F8FAFC_40%,_#FDFDFF_100%)]" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#3B82F6] opacity-[0.04] blur-[120px] rounded-full" />
      </div>
      <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -top-[100px] sm:-top-[150px] -left-[10%] w-[120%] z-0 rotate-180 pointer-events-none mix-blend-multiply" animate={true} />
      <div className="flex flex-col flex-1 items-center justify-center p-3 sm:p-4 relative z-10 w-full min-h-screen -mt-14 sm:-mt-16">
        <div className="w-full max-w-lg animate-fade-in relative">
          <div className="flex items-center justify-between mb-4 px-2 tracking-tight font-bold">
            <span className="text-[13px] text-[#64748B]">{currentStudent?.username}</span>
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/80 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="text-[#0F172A] font-mono text-[14px]">{formatTime(elapsed)}</span>
            </div>
            <button onClick={handleFinishAction} className="text-[11px] text-[#94A3B8] hover:text-[#0F172A] transition-colors px-3 py-1.5 rounded-xl hover:bg-white/60 border border-white/80 font-bold uppercase tracking-widest">End Test</button>
          </div>
          <div className={`bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border transition-all duration-300 overflow-hidden ${showFlash === 'correct' ? 'border-emerald-400/40' : showFlash === 'wrong' ? 'border-red-400/40' : 'border-white/60'}`}>
            <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-4 border-b border-[#F1F5F9]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest leading-none">{LEVELS[currentLevel].label}</span>
                  <span className="text-[#0F172A] text-2xl font-black">Round {globalRound + 1} / {TOTAL_ROUNDS}</span>
                </div>
                <div className="text-right flex flex-col gap-1">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest leading-none">SCORE</span>
                  <span className="font-mono font-black text-2xl text-[#2563EB]">{score}</span>
                </div>
              </div>
              <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA] rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="p-6 sm:p-10 select-none">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex-1 h-3 bg-[#F1F5F9] rounded-full overflow-hidden mr-4">
                  <div className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 10 ? 'bg-[#EF4444]' : 'bg-[#2563EB]'}`} style={{ width: `${timerProgress}%` }} />
                </div>
                <span className={`font-mono font-black text-[15px] ${timeLeft <= 10 ? 'text-[#EF4444]' : 'text-[#0F172A]'}`}>{timeLeft}s</span>
              </div>
              <div className="grid gap-2 mb-8 bg-[#F8FAFC] p-4 rounded-[2rem] border border-[#E2E8F0]" style={{ gridTemplateColumns: `repeat(${LEVELS[currentLevel].gridSize}, minmax(0, 1fr))`, touchAction: 'none' }}>
                {grid.map((row, rIdx) => row.map((cell, cIdx) => {
                  const node = pathStack.find(n => n.row === rIdx && n.col === cIdx);
                  const isLastNode = pathStack.length > 0 && pathStack[pathStack.length - 1].row === rIdx && pathStack[pathStack.length - 1].col === cIdx;
                  return (
                    <div key={`cell-${rIdx}-${cIdx}`} onMouseDown={() => handleCellInteraction(rIdx, cIdx)} onMouseEnter={() => { if (isDrawing) handleCellInteraction(rIdx, cIdx); }}
                      className={`aspect-square rounded-xl flex items-center justify-center text-lg sm:text-2xl font-black transition-all duration-200 relative
                        ${cell.number !== null ? 'bg-white shadow-sm border-2 border-[#E2E8F0]' : 'cursor-pointer'}
                        ${node ? (isLastNode ? 'ring-4 ring-blue-500/20' : '') : ''}
                      `}
                      style={{
                        backgroundColor: showFlash === 'correct' && node ? '#10B981' : showFlash === 'wrong' && node ? '#EF4444' : node ? '#2563EB' : cell.number !== null ? 'white' : 'transparent',
                        color: node || showFlash ? 'white' : cell.number !== null ? '#0F172A' : '#94A3B8',
                        borderColor: node ? 'transparent' : '#E2E8F0'
                      }}
                    >
                      {cell.number !== null ? cell.number : node ? '•' : ''}
                    </div>
                  );
                }))}
              </div>
              <div className="flex gap-4">
                {roundComplete || roundFailed ? (
                  <button onClick={handleNextRound} className={`flex-1 py-4 rounded-2xl font-black text-[15px] text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${roundComplete ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-[#EF4444] shadow-red-500/20'}`}>
                    {globalRound + 1 >= TOTAL_ROUNDS ? 'View Final Results' : 'Continue Round →'}
                  </button>
                ) : (
                  <>
                    <button onClick={handleReset} className="flex-1 py-4 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 transition-all active:scale-95"><RefreshCcw className="w-4 h-4" /> Reset</button>
                    <button onClick={handleUndo} className="flex-1 py-4 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 transition-all active:scale-95"><Undo2 className="w-4 h-4" /> Undo</button>
                  </>
                )}
              </div>
            </div>
            <div className="px-6 pb-10 text-center">
              <p className="text-[13px] text-[#64748B] font-bold leading-tight">Connect numbers sequentially (1 → 2 → 3...) to fill all cells</p>
            </div>
          </div>
        </div>
      </div>
      <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -bottom-[100px] -left-[10%] w-[120%] z-0 pointer-events-none" animate={true} />
    </div>
  );
};

export default NumLinkGame;
