import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Trophy, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import NavBar from '@/components/NavBar';
import DecorativeCurve from '@/components/DecorativeCurve';

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────────── */
interface Block {
  id: string;
  color: string;            // hex color
  cells: [number, number][]; // [row, col] pairs
}

interface LevelDef {
  gridRows: number;
  gridCols: number;
  blocks: Block[];
  ballPos: [number, number];
  holePos: [number, number];
}

/* ─────────────────────────────────────────────────────────────────────────────
   PROCEDURAL LEVEL GENERATION & BFS SOLVABILITY CHECK
───────────────────────────────────────────────────────────────────────────── */
const TOTAL_LEVELS = 10;

/** 
 * Robust BFS to check for solvability.
 * Uses a rigorous hash and optimized occupancy check.
 */
function isSolvable(level: LevelDef): number | null {
  const { gridRows: rows, gridCols: cols, holePos, ballPos, blocks: defs } = level;

  interface State {
    ball: [number, number];
    blocks: { [id: string]: [number, number][] };
  }

  const start: State = {
    ball: ballPos,
    blocks: defs.reduce((acc, b) => ({ ...acc, [b.id]: b.cells }), {})
  };

  // Rigorous hash with separators to prevent coordinate collisions
  function hash(s: State) {
    let res = `B:${s.ball[0]},${s.ball[1]}|`;
    const sortedIds = defs.map(d => d.id).sort(); // defs is constant
    for (const id of sortedIds) {
      res += `${id}:`;
      for (const [r, c] of s.blocks[id]) res += `${r}${c}`;
      res += ';';
    }
    return res;
  }

  const queue: { state: State; dist: number }[] = [{ state: start, dist: 0 }];
  const visited = new Set<string>();
  visited.add(hash(start));

  let head = 0;
  const MAX_ITER = 8000;

  while (head < queue.length && head < MAX_ITER) {
    const { state: current, dist } = queue[head++];

    // Win check
    if (current.ball[0] === holePos[0] && current.ball[1] === holePos[1]) return dist;

    // Build current occupancy
    const currentBlocksMap = new Map(defs.map(d => [d.id, current.blocks[d.id]]));
    const currentBlocks: Block[] = defs.map(d => ({ ...d, cells: current.blocks[d.id] }));
    const occ = buildOccupancyMap(currentBlocks, rows, cols);

    // Ball moves
    for (const d of (['up', 'down', 'left', 'right'] as const)) {
      if (canBallMove(d, current.ball, occ, rows, cols)) {
        const dr = d === 'up' ? -1 : d === 'down' ? 1 : 0;
        const dc = d === 'left' ? -1 : d === 'right' ? 1 : 0;
        const nextState: State = { ...current, ball: [current.ball[0] + dr, current.ball[1] + dc] };
        const h = hash(nextState);
        if (!visited.has(h)) {
          visited.add(h);
          queue.push({ state: nextState, dist: dist + 1 });
        }
      }
    }

    // Block moves
    for (const bDef of defs) {
      const bCurrent = { ...bDef, cells: current.blocks[bDef.id] };
      for (const d of (['up', 'down', 'left', 'right'] as const)) {
        if (canSlide(bCurrent, d, occ, rows, cols, current.ball, holePos)) {
          const moved = slideBlock(bCurrent, d);
          const nextBlocks = { ...current.blocks, [bDef.id]: moved.cells };
          const nextState: State = { ...current, blocks: nextBlocks };
          const h = hash(nextState);
          if (!visited.has(h)) {
            visited.add(h);
            queue.push({ state: nextState, dist: dist + 1 });
          }
        }
      }
    }
  }
  return null;
}


function canBallReachWithoutBlockMoves(level: LevelDef): boolean {
  const rows = level.gridRows; const cols = level.gridCols; const holePos = level.holePos;
  const occ = buildOccupancyMap(level.blocks, rows, cols);
  const queue: [number, number][] = [level.ballPos];
  const visited = new Set<string>();
  visited.add(`${level.ballPos[0]}${level.ballPos[1]}`);
  let head = 0;
  while (head < queue.length) {
    const [r, c] = queue[head++];
    if (r === holePos[0] && c === holePos[1]) return true;
    for (const d of (['up', 'down', 'left', 'right'] as const)) {
      if (canBallMove(d, [r, c], occ, rows, cols)) {
        const dr = d === 'up' ? -1 : d === 'down' ? 1 : 0;
        const dc = d === 'left' ? -1 : d === 'right' ? 1 : 0;
        const h = `${r + dr}${c + dc}`;
        if (!visited.has(h)) { visited.add(h); queue.push([r + dr, c + dc]); }
      }
    }
  }
  return false;
}

function generateSolvableLevel(idx: number): LevelDef {
  const rows = idx < 4 ? 5 : 6;
  const cols = idx < 4 ? 5 : 6;
  const colors = ['#EAB308', '#3B82F6', '#22C55E', '#A855F7', '#EF4444', '#38BDF8', '#F97316', '#14B8A6', '#EC4899', '#6366F1'];

  let bestLevel: LevelDef | null = null;
  let bestDist = -1;

  for (let attempt = 0; attempt < 100; attempt++) {
    const holePos: [number, number] = Math.random() > 0.5
      ? [Math.floor(Math.random() * rows), Math.random() > 0.5 ? 0 : cols - 1]
      : [Math.random() > 0.5 ? 0 : rows - 1, Math.floor(Math.random() * cols)];

    let ballPos: [number, number] = [Math.floor(Math.random() * rows), Math.floor(Math.random() * cols)];
    while (ballPos[0] === holePos[0] && ballPos[1] === holePos[1]) {
      ballPos = [Math.floor(Math.random() * rows), Math.floor(Math.random() * cols)];
    }

    const numBlocks = 5 + Math.floor(idx / 2);
    const blocks: Block[] = [];
    const used = Array.from({ length: rows }, () => Array(cols).fill(false));
    used[ballPos[0]][ballPos[1]] = true; used[holePos[0]][holePos[1]] = true;

    for (let i = 0; i < numBlocks; i++) {
      const len = 2 + Math.floor(Math.random() * 2); // Slightly shorter blocks to fit more
      const isVert = Math.random() > 0.5;
      for (let inner = 0; inner < 30; inner++) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);
        const cells: [number, number][] = [];
        let ok = true;
        for (let l = 0; l < len; l++) {
          const nr = isVert ? r + l : r; const nc = !isVert ? c + l : c;
          if (nr >= rows || nc >= cols || used[nr][nc]) { ok = false; break; }
          cells.push([nr, nc]);
        }
        if (ok) {
          cells.forEach(([rr, cc]) => { used[rr][cc] = true; });
          blocks.push({ id: `b${i}`, color: colors[i % colors.length], cells });
          break;
        }
      }
    }

    const level: LevelDef = { gridRows: rows, gridCols: cols, ballPos, holePos, blocks };
    const dist = isSolvable(level);

    if (dist !== null) {
      if (dist > bestDist && !canBallReachWithoutBlockMoves(level)) {
        bestDist = dist;
        bestLevel = level;
      }

      // Significantly increased difficulty targets (8 moves minimum starting point)
      const minD = 8 + Math.floor(idx * 1.5);
      if (dist >= minD && !canBallReachWithoutBlockMoves(level)) return level;
    }
  }

  // Try to return the best level we found, even if it didn't strictly meet the target distance
  if (bestLevel) return bestLevel;

  // Final fallback (should rarely drop here, but guarantees blocks)
  return {
    gridRows: rows, gridCols: cols,
    ballPos: [0, 0],
    holePos: [rows - 1, cols - 1],
    blocks: [
      { id: 'b0', color: colors[0], cells: [[1, 1], [1, 2]] },
      { id: 'b1', color: colors[1], cells: [[3, 2], [3, 3]] }
    ]
  };
}



/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
function deepCloneBlocks(blocks: Block[]): Block[] {
  return blocks.map(b => ({ ...b, cells: b.cells.map(c => [c[0], c[1]] as [number, number]) }));
}

function buildOccupancyMap(blocks: Block[], rows: number, cols: number): (string | null)[][] {
  const map: (string | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));
  for (const b of blocks) {
    for (const [r, c] of b.cells) {
      if (r >= 0 && r < rows && c >= 0 && c < cols) map[r][c] = b.id;
    }
  }
  return map;
}

function canSlide(
  block: Block,
  dir: 'up' | 'down' | 'left' | 'right',
  occ: (string | null)[][],
  rows: number,
  cols: number,
  ballPos: [number, number],
  holePos: [number, number],
): boolean {
  const dr = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
  const dc = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;

  for (const [r, c] of block.cells) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return false;
    // Check if target cell is occupied by another block
    if (occ[nr][nc] !== null && occ[nr][nc] !== block.id) return false;
    // Cannot slide into ball
    if (nr === ballPos[0] && nc === ballPos[1]) return false;
    // Cannot slide into hole
    if (nr === holePos[0] && nc === holePos[1]) return false;
  }
  return true;
}

function slideBlock(block: Block, dir: 'up' | 'down' | 'left' | 'right'): Block {
  const dr = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
  const dc = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
  return { ...block, cells: block.cells.map(([r, c]) => [r + dr, c + dc] as [number, number]) };
}

function canBallMove(
  dir: 'up' | 'down' | 'left' | 'right',
  ballPos: [number, number],
  occ: (string | null)[][],
  rows: number,
  cols: number,
): boolean {
  const dr = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
  const dc = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
  const nr = ballPos[0] + dr;
  const nc = ballPos[1] + dc;
  if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return false;
  if (occ[nr][nc] !== null) return false;
  return true;
}

function formatTime(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const MotionChallenge = () => {
  const { currentStudent, submitGameResult, finishTest, currentTest, addCompletedGame, getNextGame, updateStudentProgress } = useGame();
  const navigate = useNavigate();

  /* ── State ── */
  const [levelIdx, setLevelIdx] = useState(0);
  const [generatedLevels, setGeneratedLevels] = useState<{ [key: number]: LevelDef }>({});
  const [isGenerating, setIsGenerating] = useState(true);

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [ballPos, setBallPos] = useState<[number, number]>([0, 0]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [moves, setMoves] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [levelFlash, setLevelFlash] = useState<'success' | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Current level derived from index
  const level = generatedLevels[levelIdx];

  /* ── Navigation guards ── */
  useEffect(() => { if (!currentStudent) navigate('/student'); }, [currentStudent, navigate]);
  useEffect(() => { if (currentTest?.status === 'FINISHED') navigate('/'); }, [currentTest?.status, navigate]);

  /* ── Lazy Generation ── */
  useEffect(() => {
    if (finished) return;
    if (!generatedLevels[levelIdx]) {
      setIsGenerating(true);
      const t = setTimeout(() => {
        const nextLevel = generateSolvableLevel(levelIdx);
        setGeneratedLevels(prev => ({ ...prev, [levelIdx]: nextLevel }));
        setBlocks(deepCloneBlocks(nextLevel.blocks));
        setBallPos(nextLevel.ballPos);
        setMoves(0);
        setIsGenerating(false);
      }, 50);
      return () => clearTimeout(t);
    }
  }, [levelIdx, finished]);

  /* ── Timer (Total Elapsed) ── */
  useEffect(() => {
    if (finished || transitioning || isGenerating) return;
    timerRef.current = setInterval(() => {
      setElapsed(e => e + 1);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [finished, transitioning, isGenerating, levelIdx]);

  /* ── Occupancy map derived from current blocks ── */
  const occ = level ? buildOccupancyMap(blocks, level.gridRows, level.gridCols) : [];

  /* ── Advance level ── */
  const advanceLevel = useCallback((won: boolean, movesUsed: number) => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (won) {
      setCorrectCount(c => c + 1);
    }

    setLevelFlash(won ? 'success' : null);
    setTransitioning(true);
    setSelectedBlockId(null);

    setTimeout(() => {
      setLevelFlash(null);
      const next = levelIdx + 1;

      // Real-time progress update for admin
      if (currentStudent) {
        const currentMotionScore = (won ? correctCount + 1 : correctCount) * 20;
        const currentMotionCorrect = won ? correctCount + 1 : correctCount;
        updateStudentProgress(currentStudent.username, currentMotionScore, next, currentMotionCorrect, TOTAL_LEVELS, 'motion');
      }

      if (next >= TOTAL_LEVELS) {
        setFinished(true);
      } else {
        setLevelIdx(next);
        setTransitioning(false);
      }
    }, 700);
  }, [levelIdx]);

  /* ── Data submission ── */
  useEffect(() => {
    if (finished && currentStudent && currentTest) {
      const isEndTest = (window as any).__motionEndTest;
      const questionsAttempted = isEndTest ? levelIdx : TOTAL_LEVELS;

      submitGameResult(currentStudent.username, {
        gameId: 'motion',
        score: correctCount * 20,
        moves: totalMoves,
        timeTaken: elapsed,
        correctAnswers: correctCount,
        totalQuestions: questionsAttempted,
        completedAt: Date.now(),
      }).then(() => {
        addCompletedGame('motion');
        if (isEndTest) {
          finishTest(currentStudent.username);
          navigate('/');
        }
      });

      setScore(correctCount * 20);
      delete (window as any).__motionEndTest;
    }
  }, [finished]);

  const handlePostFinish = useCallback(() => {
    const nextGame = getNextGame();
    if (nextGame) navigate('/select-game');
    else {
      if (currentStudent) finishTest(currentStudent.username);
      navigate('/');
    }
  }, [getNextGame, navigate, currentStudent, finishTest]);

  /* ── Interactions ── */
  const handleBlockArrow = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    if (transitioning || finished || isGenerating || !selectedBlockId || !level) return;
    const block = blocks.find(b => b.id === selectedBlockId);
    if (!block) return;
    if (!canSlide(block, dir, occ, level.gridRows, level.gridCols, ballPos, level.holePos)) return;

    setBlocks(blocks.map(b => b.id === selectedBlockId ? slideBlock(b, dir) : b));
    setMoves(m => m + 1);
    setTotalMoves(t => t + 1);
  }, [transitioning, finished, isGenerating, selectedBlockId, blocks, occ, level, ballPos]);

  const handleBallArrow = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    if (transitioning || finished || isGenerating || !level) return;
    if (!canBallMove(dir, ballPos, occ, level.gridRows, level.gridCols)) return;

    const dr = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
    const dc = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    const newPos: [number, number] = [ballPos[0] + dr, ballPos[1] + dc];
    const newMoves = moves + 1;

    setMoves(newMoves);
    setTotalMoves(t => t + 1);
    setBallPos(newPos);

    if (newPos[0] === level.holePos[0] && newPos[1] === level.holePos[1]) advanceLevel(true, newMoves);
  }, [transitioning, finished, isGenerating, ballPos, occ, level, moves, advanceLevel]);

  const handleCellClick = useCallback((r: number, c: number) => {
    if (transitioning || finished || isGenerating) return;
    if (r === ballPos[0] && c === ballPos[1]) { setSelectedBlockId('__ball__'); return; }
    const blockId = occ[r]?.[c];
    if (blockId) setSelectedBlockId(prev => prev === blockId ? null : blockId);
  }, [transitioning, finished, isGenerating, ballPos, occ]);

  const handleArrow = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    if (selectedBlockId === '__ball__') handleBallArrow(dir);
    else if (selectedBlockId) handleBlockArrow(dir);
  }, [selectedBlockId, handleBallArrow, handleBlockArrow]);


  /* ─────────── FINISH SCREEN ─────────── */
  if (finished) {
    return (
      <div className="flex flex-col bg-[#FDFDFF] font-sans min-h-screen overflow-hidden relative">
        <NavBar />
        <div className="relative flex-1 w-full flex flex-col justify-center items-center">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#E0F2FE_0%,_#F0F9FF_40%,_#FFFFFF_100%)]" />
          </div>
          <div className="relative z-10 w-full flex items-center justify-center px-4 pt-24 pb-10">
            <div className="text-center animate-fade-in max-w-2xl w-full">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-sky-200/40">
                <Trophy className="w-10 h-10 text-sky-500" />
              </div>
              <h1 className="text-[32px] sm:text-[42px] font-black text-black tracking-tight leading-none mb-3">
                Motion Complete!
              </h1>
              <p className="text-[15px] text-[#64748B] mb-10 font-medium">
                Excellent work, {currentStudent?.username}!
              </p>
              <div className="bg-white/90 backdrop-blur-2xl border border-sky-100 rounded-[2.5rem] p-6 sm:p-10 mb-10 shadow-[0_20px_60px_-15px_rgba(56,189,248,0.12)]">
                <div className={`grid ${currentTest?.showResults ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2'} gap-8 items-center divide-x divide-sky-100`}>
                  {currentTest?.showResults && (
                    <div className="text-center px-4">
                      <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Total Moves</span>
                      <span className="font-mono font-black text-2xl sm:text-3xl lg:text-4xl text-sky-500">
                        {totalMoves}
                      </span>
                    </div>
                  )}
                  <div className={`text-center px-4 ${currentTest?.showResults ? '' : ''}`}>
                    <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Levels</span>
                    <span className="font-mono font-black text-2xl sm:text-3xl lg:text-4xl text-black">
                      {correctCount}/{TOTAL_LEVELS}
                    </span>
                  </div>
                  {currentTest?.showResults && (
                    <div className="text-center px-4">
                      <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Score</span>
                      <span className="font-mono font-black text-2xl sm:text-3xl lg:text-4xl text-emerald-500">
                        {score}
                      </span>
                    </div>
                  )}
                  <div className="text-center px-4">
                    <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Time</span>
                    <span className="font-mono font-black text-2xl sm:text-3xl lg:text-4xl text-black">
                      {formatTime(elapsed)}
                    </span>
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
          <DecorativeCurve opacity={0.08} height="h-[280px] sm:h-[360px]" className="absolute bottom-0 left-0 w-full pointer-events-none" animate={true} />
        </div>
      </div>
    );
  }

  /* ─────────── GAME LAYOUT ─────────── */
  const progress = ((levelIdx) / TOTAL_LEVELS) * 100;
  const CELL_SIZE = !level ? 50 : level.gridCols <= 4 ? 60 : level.gridCols <= 5 ? 52 : 44;
  const GAP = 4;

  // Compute block bounding box for arrow position
  const selectedBlock = blocks.find(b => b.id === selectedBlockId);
  const minRow = selectedBlock ? Math.min(...selectedBlock.cells.map(c => c[0])) : 0;
  const maxRow = selectedBlock ? Math.max(...selectedBlock.cells.map(c => c[0])) : 0;
  const minCol = selectedBlock ? Math.min(...selectedBlock.cells.map(c => c[1])) : 0;
  const maxCol = selectedBlock ? Math.max(...selectedBlock.cells.map(c => c[1])) : 0;
  const midRow = (minRow + maxRow) / 2;
  const midCol = (minCol + maxCol) / 2;

  // For ball arrows
  const [ballR, ballC] = ballPos;

  return (
    <div className="flex flex-col bg-[#FDFDFF] font-sans h-screen overflow-hidden relative">
      <NavBar />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden relative pt-6 sm:pt-10">
        {/* Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#E0F2FE_0%,_#F0F9FF_40%,_#FFFFFF_100%)]" />
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-[#38BDF8] opacity-[0.04] blur-[100px] rounded-full" />
        </div>

        {/* Page heading */}
        <div className="relative z-10 text-center pb-6 px-4">
          <h1 className="text-[28px] sm:text-[42px] font-black tracking-tighter text-black leading-tight">
            Motion Challenge
          </h1>
          <p className="text-[12px] sm:text-[13px] text-[#64748B] font-medium mt-1">
            Place the ball into the black hole in as few moves as possible
          </p>
        </div>

        {/* End Test Hyperlink */}
        <div className="relative z-10 w-full flex justify-end mb-4 px-4" style={{ maxWidth: 420 }}>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to end the test? Your current score will be saved.')) {
                (window as any).__motionEndTest = true;
                setFinished(true);
              }
            }}
            className="text-[11px] font-black uppercase tracking-widest text-[#94A3B8] hover:text-rose-500 transition-colors underline underline-offset-4"
          >
            End Test
          </button>
        </div>

        {/* Game Card */}
        <div className={`relative z-10 bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(56,189,248,0.18)] border transition-all duration-300 mx-4 flex flex-col
          ${levelFlash === 'success' ? 'border-emerald-400 shadow-emerald-200/40' : 'border-sky-100'}`}
          style={{ maxWidth: 420, width: '100%' }}
        >
          {/* Flash bar */}
          {levelFlash && (
            <div className={`absolute inset-x-0 top-0 h-1.5 rounded-t-[2rem] z-30 animate-pulse bg-emerald-500`} />
          )}

          <div className="bg-white border-b border-sky-100/50 p-6 sm:p-8">
            <div className={`grid ${currentTest?.showResults ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2'} items-center gap-6 mb-6`}>
              <div className="flex flex-col gap-1.5 text-center">
                <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest">Level</span>
                <span className="text-black text-2xl font-black">{levelIdx + 1}<span className="text-[#94A3B8] text-lg font-bold">/{TOTAL_LEVELS}</span></span>
              </div>

              <div className="flex flex-col gap-1.5 text-center">
                <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest">Total Time</span>
                <span className="font-mono font-black text-2xl text-black">{formatTime(elapsed)}</span>
              </div>

              {currentTest?.showResults && (
                <>
                  <div className="flex flex-col gap-1.5 text-center">
                    <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest">Moves</span>
                    <span className="font-mono font-black text-2xl text-black">{moves}</span>
                  </div>

                  <div className="flex flex-col gap-1.5 text-center">
                    <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest">Score</span>
                    <span className="font-mono font-black text-2xl text-sky-500">{score}</span>
                  </div>
                </>
              )}
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-sky-50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Grid area */}
          <div className="p-4 flex flex-col items-center justify-center min-h-[300px] relative">
            {isGenerating || !level ? (
              <div className="flex flex-col items-center justify-center animate-pulse py-10">
                <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-bold text-[#64748B]">Preparing Challenge...</p>
                <p className="text-[10px] text-[#94A3B8] mt-1">Calculating tricky paths</p>
              </div>
            ) : (
              <div
                className="relative select-none"
                style={{
                  width: level.gridCols * CELL_SIZE + (level.gridCols - 1) * GAP,
                  height: level.gridRows * CELL_SIZE + (level.gridRows - 1) * GAP,
                }}
              >
                {/* Background cells */}
                {Array.from({ length: level.gridRows }).map((_, r) =>
                  Array.from({ length: level.gridCols }).map((_, c) => (
                    <div
                      key={`cell-${r}-${c}`}
                      className="absolute rounded-lg bg-[#F1F5F9] cursor-pointer hover:bg-[#E2E8F0] transition-colors"
                      style={{
                        left: c * (CELL_SIZE + GAP),
                        top: r * (CELL_SIZE + GAP),
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                      }}
                      onClick={() => handleCellClick(r, c)}
                    />
                  ))
                )}

                {/* Hole */}
                <div
                  className="absolute rounded-full pointer-events-none flex items-center justify-center"
                  style={{
                    left: level.holePos[1] * (CELL_SIZE + GAP) + CELL_SIZE * 0.15,
                    top: level.holePos[0] * (CELL_SIZE + GAP) + CELL_SIZE * 0.15,
                    width: CELL_SIZE * 0.7,
                    height: CELL_SIZE * 0.7,
                    background: 'radial-gradient(circle at 35% 35%, #334155, #0F172A)',
                    boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.3)',
                  }}
                />

                {/* Colored Blocks */}
                {blocks.map(block => {
                  const bMinRow = Math.min(...block.cells.map(c => c[0]));
                  const bMaxRow = Math.max(...block.cells.map(c => c[0]));
                  const bMinCol = Math.min(...block.cells.map(c => c[1]));
                  const bMaxCol = Math.max(...block.cells.map(c => c[1]));
                  const blockW = (bMaxCol - bMinCol + 1) * CELL_SIZE + (bMaxCol - bMinCol) * GAP;
                  const blockH = (bMaxRow - bMinRow + 1) * CELL_SIZE + (bMaxRow - bMinRow) * GAP;
                  const isSelected = selectedBlockId === block.id;

                  return (
                    <div
                      key={block.id}
                      className={`absolute rounded-xl cursor-pointer transition-all duration-150 flex items-center justify-center
                      ${isSelected ? 'ring-2 ring-white ring-offset-2 shadow-xl scale-[1.03] z-20' : 'hover:scale-[1.02] z-10'}`}
                      style={{
                        left: bMinCol * (CELL_SIZE + GAP),
                        top: bMinRow * (CELL_SIZE + GAP),
                        width: blockW,
                        height: blockH,
                        backgroundColor: block.color,
                        boxShadow: isSelected
                          ? `0 8px 24px ${block.color}66, 0 0 0 3px ${block.color}44`
                          : `0 4px 12px ${block.color}44`,
                        opacity: transitioning ? 0.6 : 1,
                      }}
                      onClick={() => {
                        if (!transitioning && !finished) {
                          setSelectedBlockId(prev => prev === block.id ? null : block.id);
                        }
                      }}
                    >
                      {/* Inner grid lines for multi-cell blocks */}
                      {block.cells.length > 1 && (
                        <div className="absolute inset-0 rounded-xl overflow-hidden opacity-20">
                          {blockW > blockH
                            ? Array.from({ length: block.cells.length - 1 }).map((_, i) => (
                              <div key={i} className="absolute top-0 bottom-0 w-px bg-white"
                                style={{ left: (i + 1) * (CELL_SIZE + GAP) - GAP / 2 }} />
                            ))
                            : Array.from({ length: block.cells.length - 1 }).map((_, i) => (
                              <div key={i} className="absolute left-0 right-0 h-px bg-white"
                                style={{ top: (i + 1) * (CELL_SIZE + GAP) - GAP / 2 }} />
                            ))
                          }
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Ball */}
                <div
                  className={`absolute cursor-pointer z-30 flex items-center justify-center transition-all duration-200
                  ${selectedBlockId === '__ball__' ? 'scale-110' : 'hover:scale-105'}`}
                  style={{
                    left: ballC * (CELL_SIZE + GAP) + CELL_SIZE * 0.1,
                    top: ballR * (CELL_SIZE + GAP) + CELL_SIZE * 0.1,
                    width: CELL_SIZE * 0.8,
                    height: CELL_SIZE * 0.8,
                  }}
                  onClick={() => {
                    if (!transitioning && !finished) {
                      setSelectedBlockId(prev => prev === '__ball__' ? null : '__ball__');
                    }
                  }}
                >
                  <div
                    className="w-full h-full rounded-full border-2 border-white/30"
                    style={{
                      background: 'radial-gradient(circle at 35% 30%, #86EFAC, #22C55E)',
                      boxShadow: selectedBlockId === '__ball__'
                        ? '0 0 0 3px #4ADE80, 0 4px 12px rgba(34,197,94,0.4)'
                        : '0 4px 12px rgba(34,197,94,0.35)',
                    }}
                  />
                </div>

                {/* Directional arrows overlay (block or ball selected) */}
                {selectedBlockId && !transitioning && (() => {
                  let centerX: number, centerY: number;
                  if (selectedBlockId === '__ball__') {
                    centerX = ballC * (CELL_SIZE + GAP) + CELL_SIZE / 2;
                    centerY = ballR * (CELL_SIZE + GAP) + CELL_SIZE / 2;
                  } else {
                    centerX = midCol * (CELL_SIZE + GAP) + CELL_SIZE / 2;
                    centerY = midRow * (CELL_SIZE + GAP) + CELL_SIZE / 2;
                  }

                  const SPREAD = CELL_SIZE * 0.95;
                  const arrowStyle = "absolute w-7 h-7 rounded-full bg-[#1E293B]/85 backdrop-blur-sm text-white flex items-center justify-center hover:bg-[#0F172A] transition-all active:scale-90 z-40 shadow-lg cursor-pointer";

                  const arrowDirections: Array<{ dir: 'up' | 'down' | 'left' | 'right'; dx: number; dy: number; Icon: typeof ChevronUp }> = [
                    { dir: 'up', dx: 0, dy: -SPREAD, Icon: ChevronUp },
                    { dir: 'down', dx: 0, dy: SPREAD, Icon: ChevronDown },
                    { dir: 'left', dx: -SPREAD, dy: 0, Icon: ChevronLeft },
                    { dir: 'right', dx: SPREAD, dy: 0, Icon: ChevronRight },
                  ];

                  return arrowDirections.map(({ dir, dx, dy, Icon }) => {
                    // Determine if arrow is allowed
                    let allowed = false;

                    if (selectedBlockId === '__ball__') {
                      allowed = canBallMove(dir, ballPos, occ, level.gridRows, level.gridCols);
                    } else {
                      const blk = blocks.find(b => b.id === selectedBlockId);
                      if (blk) {
                        allowed = canSlide(blk, dir, occ, level.gridRows, level.gridCols, ballPos, level.holePos);
                      }
                    }

                    return (
                      <div
                        key={dir}
                        className={`${arrowStyle} ${allowed ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}
                        style={{
                          left: centerX + dx - 14,
                          top: centerY + dy - 14,
                        }}
                        onClick={(e) => { e.stopPropagation(); if (allowed) handleArrow(dir); }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                    );
                  });
                })()}
              </div>
            )}

          </div>
        </div>

        {/* 30px spacer at the bottom */}
        <div className="h-[30px] shrink-0" />
      </div>
    </div>
  );
};

export default MotionChallenge;
