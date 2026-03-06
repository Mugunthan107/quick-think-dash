import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Clock, Trophy, ArrowLeft, RotateCcw } from 'lucide-react';

const TOTAL_LEVELS = 20;
const TIME_PER_Q = 10;
const TUBE_CAPACITY = 4;

const COLORS = ['#38BDF8', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#EF4444'];
const COLOR_NAMES = ['Sky', 'Amber', 'Green', 'Pink', 'Purple', 'Red'];

interface Tube {
  colors: string[];
}

interface SortLevel {
  tubes: Tube[];
  numColors: number;
}

function isSorted(tubes: Tube[], numColors: number): boolean {
  let completeTubes = 0;
  for (const tube of tubes) {
    if (tube.colors.length === 0) continue;
    if (tube.colors.length === TUBE_CAPACITY && tube.colors.every(c => c === tube.colors[0])) {
      completeTubes++;
    } else if (tube.colors.length > 0) {
      // Not yet sorted
    }
  }
  return completeTubes === numColors;
}

function generateLevel(difficulty: number): SortLevel {
  const numColors = Math.min(3 + Math.floor(difficulty / 5), 5);
  const colorsUsed = COLORS.slice(0, numColors);

  // Create sorted state first
  const allColors: string[] = [];
  for (const color of colorsUsed) {
    for (let i = 0; i < TUBE_CAPACITY; i++) allColors.push(color);
  }

  // Shuffle
  for (let i = allColors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allColors[i], allColors[j]] = [allColors[j], allColors[i]];
  }

  // Distribute into tubes
  const tubes: Tube[] = [];
  for (let i = 0; i < numColors; i++) {
    tubes.push({ colors: allColors.slice(i * TUBE_CAPACITY, (i + 1) * TUBE_CAPACITY) });
  }
  // Add 2 empty tubes
  tubes.push({ colors: [] });
  tubes.push({ colors: [] });

  return { tubes, numColors };
}

export default function WaterColorSortGame() {
  const navigate = useNavigate();
  const { currentStudent, currentTest, submitGameResult, addCompletedGame, finishTest } = useGame();

  const levels = useMemo(() => Array.from({ length: TOTAL_LEVELS }, (_, i) => generateLevel(i)), []);

  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [tubes, setTubes] = useState<Tube[]>(levels[0].tubes.map(t => ({ colors: [...t.colors] })));
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [moves, setMoves] = useState(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (!currentStudent || !currentTest) { navigate('/'); return; }
    if (currentTest.status === 'FINISHED') navigate('/');
  }, [currentStudent, currentTest, navigate]);

  // Reset tubes when level changes
  useEffect(() => {
    if (level < TOTAL_LEVELS && !gameOver) {
      setTubes(levels[level].tubes.map(t => ({ colors: [...t.colors] })));
      setSelectedTube(null);
      setMoves(0);
    }
  }, [level, gameOver, levels]);

  // Timer
  useEffect(() => {
    if (gameOver || level >= TOTAL_LEVELS) return;
    setTimeLeft(TIME_PER_Q);
    const iv = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - move to next
          advanceLevel(false);
          return TIME_PER_Q;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [level, gameOver]);

  const advanceLevel = useCallback((solved: boolean) => {
    const newScore = solved ? score + 1 : score;
    setScore(newScore);
    if (solved) setFeedback('Sorted! +1');
    else setFeedback('Time up!');

    setTimeout(() => {
      setFeedback(null);
      if (level + 1 >= TOTAL_LEVELS) {
        finishGame(newScore, solved ? score + 1 : score, level + 1);
      } else {
        setLevel(l => l + 1);
      }
    }, 500);
  }, [level, score]);

  // Check if solved after each move
  useEffect(() => {
    if (level < TOTAL_LEVELS && !gameOver && isSorted(tubes, levels[level].numColors)) {
      advanceLevel(true);
    }
  }, [tubes]);

  const handleTubeClick = useCallback((idx: number) => {
    if (gameOver || feedback) return;

    if (selectedTube === null) {
      // Select source tube (must have colors)
      if (tubes[idx].colors.length > 0) {
        setSelectedTube(idx);
      }
    } else {
      if (idx === selectedTube) {
        setSelectedTube(null);
        return;
      }

      // Try to pour from selectedTube to idx
      const src = tubes[selectedTube];
      const dst = tubes[idx];

      if (dst.colors.length >= TUBE_CAPACITY) {
        setSelectedTube(null);
        return;
      }

      const srcTop = src.colors[src.colors.length - 1];
      if (dst.colors.length === 0 || dst.colors[dst.colors.length - 1] === srcTop) {
        // Pour continuous same-color layers
        const newSrc = [...src.colors];
        const newDst = [...dst.colors];
        while (newSrc.length > 0 && newDst.length < TUBE_CAPACITY && newSrc[newSrc.length - 1] === srcTop) {
          newDst.push(newSrc.pop()!);
        }

        const newTubes = tubes.map((t, i) => {
          if (i === selectedTube) return { colors: newSrc };
          if (i === idx) return { colors: newDst };
          return t;
        });
        setTubes(newTubes);
        setMoves(m => m + 1);
      }
      setSelectedTube(null);
    }
  }, [selectedTube, tubes, gameOver, feedback]);

  const resetLevel = useCallback(() => {
    setTubes(levels[level].tubes.map(t => ({ colors: [...t.colors] })));
    setSelectedTube(null);
    setMoves(0);
  }, [level, levels]);

  const finishGame = async (finalScore: number, finalCorrect: number, attempted: number) => {
    setGameOver(true);
    if (!currentStudent) return;
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    await submitGameResult(currentStudent.username, {
      gameId: 'colorsort',
      score: finalScore,
      timeTaken,
      correctAnswers: finalCorrect,
      totalQuestions: attempted,
      completedAt: Date.now(),
    });
    addCompletedGame('colorsort');
  };

  const handleEndTest = async () => {
    await finishGame(score, score, level);
    if (currentStudent) await finishTest(currentStudent.username);
    navigate('/');
  };

  if (!currentStudent || !currentTest) return null;

  return (
    <div className="flex flex-col h-screen bg-[#F0F7FF] font-sans overflow-hidden">
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 bg-white/80 backdrop-blur border-b border-sky-100 z-20">
        <button onClick={handleEndTest} className="flex items-center gap-2 text-sm font-bold text-sky-500 hover:text-sky-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> End
        </button>
        <h1 className="text-base sm:text-lg font-black text-[#0F172A]">Color Sort</h1>
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
            <button onClick={() => navigate('/')} className="w-full py-3 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 transition-colors mt-4">Home</button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
          <div className="flex items-center gap-4">
            <p className="text-xs text-[#94A3B8] font-bold">Level {level + 1}/{TOTAL_LEVELS}</p>
            <p className="text-xs text-[#94A3B8] font-bold">Moves: {moves}</p>
            <button onClick={resetLevel} className="flex items-center gap-1 text-xs text-sky-500 font-bold hover:text-sky-600">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Tubes */}
          <div className="flex items-end gap-2 sm:gap-3 flex-wrap justify-center">
            {tubes.map((tube, idx) => (
              <button
                key={idx}
                onClick={() => handleTubeClick(idx)}
                className={`relative flex flex-col-reverse w-12 sm:w-14 h-40 sm:h-48 rounded-b-2xl rounded-t-lg border-2 transition-all duration-200
                  ${selectedTube === idx ? 'border-sky-500 shadow-lg shadow-sky-200 -translate-y-2' : 'border-sky-200 hover:border-sky-300'}
                  bg-white/80 overflow-hidden`}
              >
                {/* Color layers */}
                {tube.colors.map((color, ci) => (
                  <div
                    key={ci}
                    className="w-full transition-all duration-300"
                    style={{
                      height: `${100 / TUBE_CAPACITY}%`,
                      backgroundColor: color,
                      opacity: 0.85,
                      borderTop: ci < tube.colors.length - 1 ? '1px solid rgba(255,255,255,0.3)' : 'none',
                    }}
                  />
                ))}
                {/* Empty slots */}
                {Array.from({ length: TUBE_CAPACITY - tube.colors.length }).map((_, ei) => (
                  <div key={`e-${ei}`} className="w-full" style={{ height: `${100 / TUBE_CAPACITY}%` }} />
                ))}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="px-6 py-3 rounded-2xl bg-sky-500 text-white font-black text-sm animate-scale-in">
              {feedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
