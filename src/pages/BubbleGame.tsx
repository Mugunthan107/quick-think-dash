import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Clock, Trophy } from 'lucide-react';
import NavBar from '@/components/NavBar';
import DecorativeCurve from '@/components/DecorativeCurve';

interface BubbleData {
  text: string;
  value: number;
  id: string;
}

const TOTAL_LEVELS = 30;
const ROUND_SECONDS = 10;

function getLevelConfig(level: number) {
  if (level <= 5) return { max: 9, ops: ['+', '-'] as const };
  if (level <= 10) return { max: 15, ops: ['+', '-'] as const };
  if (level <= 20) return { max: 25, ops: ['+', '-', '×', '÷'] as const };
  return { max: 25, ops: ['×', '÷'] as const };
}

function getNum(max: number) {
  return Math.floor(Math.random() * max) + 1;
}

function createExpression(level: number): BubbleData {
  const config = getLevelConfig(level);
  const op = config.ops[Math.floor(Math.random() * config.ops.length)];
  let a: number;
  let b: number;
  let result: number;

  if (op === '÷') {
    b = getNum(5);
    const multiplier = getNum(6);
    a = b * multiplier;
    result = a / b;
  } else {
    a = getNum(config.max);
    b = getNum(config.max);
    if (op === '+') result = a + b;
    else if (op === '-') result = a - b;
    else result = a * b;
  }

  return {
    text: `${a} ${op} ${b}`,
    value: result,
    id: Math.random().toString(36).slice(2),
  };
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function BubbleGame() {
  const {
    currentStudent,
    updateStudentScore,
    submitGameResult,
    finishTest,
    currentTest,
    addCompletedGame,
    getNextGame,
  } = useGame();
  const navigate = useNavigate();

  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const [shuffled, setShuffled] = useState<BubbleData[]>([]);
  const [selectionOrder, setSelectionOrder] = useState<string[]>([]);
  const [roundTimeLeft, setRoundTimeLeft] = useState(ROUND_SECONDS);
  const [finished, setFinished] = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [gameActive, setGameActive] = useState(true);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef(Date.now());

  useEffect(() => {
    if (!currentStudent) {
      navigate('/student');
    }
  }, [currentStudent, navigate]);

  useEffect(() => {
    if (currentTest?.status === 'FINISHED') {
      navigate('/');
    }
  }, [currentTest?.status, navigate]);

  const startRound = useCallback(
    (lvl: number) => {
      const items = Array.from({ length: 3 }, () => createExpression(lvl));
      const sorted = [...items].sort((a, b) => a.value - b.value);
      setBubbles(sorted);
      setShuffled(items.sort(() => Math.random() - 0.5));
      setSelectionOrder([]);
      setRoundTimeLeft(ROUND_SECONDS);
      setGameActive(true);
    },
    [],
  );

  useEffect(() => {
    startRound(level);
  }, [level, startRound]);

  const handleFinish = useCallback(() => {
    setFinished(true);
    setGameActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (currentStudent && currentTest) {
      submitGameResult(currentStudent.username, {
        gameId: 'bubble',
        score,
        timeTaken: elapsed,
        correctAnswers: totalCorrect,
        totalQuestions: TOTAL_LEVELS,
        completedAt: Date.now(),
      }).then(() => addCompletedGame('bubble'));
    }
  }, [score, elapsed, totalCorrect, currentStudent, currentTest, submitGameResult, addCompletedGame]);

  const handlePostFinish = useCallback(() => {
    const next = getNextGame();
    if (next) {
      navigate('/select-game');
    } else {
      if (currentStudent) finishTest(currentStudent.username);
      navigate('/');
    }
  }, [getNextGame, navigate, currentStudent, finishTest]);

  const failRound = useCallback(() => {
    setGameActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectionOrder([]);
    setTimeout(() => {
      if (level >= TOTAL_LEVELS) handleFinish();
      else setLevel(prev => prev + 1);
    }, 500);
  }, [level, handleFinish]);

  useEffect(() => {
    if (!gameActive) return;
    lastTickRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const delta = Math.floor((now - lastTickRef.current) / 1000);
      if (delta >= 1) {
        setElapsed(prev => prev + delta);
        lastTickRef.current = now;
      }
    }, 100);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameActive]);

  useEffect(() => {
    if (!gameActive) return;
    if (roundTimeLeft <= 0) {
      failRound();
      return;
    }
    const t = setTimeout(() => setRoundTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [gameActive, roundTimeLeft, failRound]);

  const handleBubbleClick = (bubble: BubbleData) => {
    if (!gameActive) return;

    // Toggle selection when clicking the same bubble again
    let newOrder: string[];
    if (selectionOrder.includes(bubble.id) && selectionOrder.length < bubbles.length) {
      newOrder = selectionOrder.filter(id => id !== bubble.id);
    } else if (!selectionOrder.includes(bubble.id)) {
      newOrder = [...selectionOrder, bubble.id];
    } else {
      // Already selected and round is complete/finishing
      return;
    }

    setSelectionOrder(newOrder);

    if (newOrder.length === bubbles.length) {
      const isCorrectOrder = newOrder.every((id, idx) => id === bubbles[idx].id);

      let newTotalCorrect = totalCorrect;
      let newScore = score;

      if (isCorrectOrder) {
        const pointsPerLevel = level > 20 ? 30 : level > 10 ? 20 : 10;
        newScore = score + pointsPerLevel;
        newTotalCorrect = totalCorrect + 1;
        setScore(newScore);
        setTotalCorrect(newTotalCorrect);
      }
      setGameActive(false);
      if (timerRef.current) clearInterval(timerRef.current);

      if (currentStudent) {
        updateStudentScore(currentStudent.username, newScore, level, newTotalCorrect);
      }

      setTimeout(() => {
        if (level >= TOTAL_LEVELS) handleFinish();
        else setLevel(prev => prev + 1);
      }, 400);
    }
  };

  const progress = Math.min(100, (level / TOTAL_LEVELS) * 100);

  if (finished) {
    return (
      <div className="flex flex-col bg-[#FDFDFF] font-sans min-h-screen overflow-hidden relative">
        <NavBar />
        <div className="relative flex-1 w-full flex flex-col justify-center items-center">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#F5F3FF_0%,_#ECFEFF_40%,_#FFFFFF_100%)]" />
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#38BDF8] opacity-[0.05] blur-[120px] rounded-full" />
          </div>
          <div className="relative z-10 w-full flex items-center justify-center px-4 pt-24 pb-10">
            <div className="text-center animate-fade-in max-w-md w-full">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-sky-200/40">
                <Trophy className="w-10 h-10 text-sky-500" />
              </div>
              <h1 className="text-[32px] sm:text-[42px] font-black text-[#0F172A] tracking-tight leading-none mb-3">
                Bubble Complete!
              </h1>
              <p className="text-[15px] text-[#64748B] mb-10 font-medium">
                Excellent work, {currentStudent?.username}!
              </p>
              <div className="bg-white/90 backdrop-blur-2xl border border-sky-100 rounded-[2.5rem] p-10 mb-10 shadow-[0_20px_60px_-15px_rgba(56,189,248,0.12)]">
                <div className="flex items-center justify-center gap-10">
                  <div className="text-center">
                    <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">
                      Score
                    </span>
                    <span className="font-mono font-black text-3xl sm:text-4xl text-sky-500">{score}</span>
                  </div>
                  <div className="w-px h-14 bg-sky-100" />
                  <div className="text-center">
                    <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">
                      Time
                    </span>
                    <span className="font-mono font-black text-3xl sm:text-4xl text-[#1E293B]">
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
          <DecorativeCurve
            opacity={0.08}
            height="h-[280px] sm:h-[360px]"
            className="absolute bottom-0 left-0 w-full pointer-events-none"
            animate={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#FDFDFF] font-sans min-h-screen overflow-hidden relative">
      <NavBar />
      <div className="relative flex-1 w-full flex flex-col justify-center">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#F5F3FF_0%,_#ECFEFF_40%,_#FFFFFF_100%)]" />
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#38BDF8] opacity-[0.05] blur-[120px] rounded-full" />
        </div>

        <div className="flex flex-col flex-1 items-center justify-center p-4 relative z-10 w-full pt-24 pb-12">
          <div className="w-full max-w-[520px] animate-fade-in relative">
            <div className="w-full mb-8 flex flex-col items-center text-center">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0F172A]">
                Arrange the answers
              </h1>
              <p className="mt-1 text-[13px] sm:text-[14px] font-bold text-[#0F172A] tracking-tight">
                LOW → HIGH
              </p>
            </div>

            <div className="flex items-center justify-between mb-4 px-2 tracking-tight font-bold">
              <span className="text-[13px] text-[#64748B]">{currentStudent?.username}</span>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-sky-100 shadow-sm">
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                <span className="text-[#0F172A] font-mono text-[14px]">{formatTime(elapsed)}</span>
              </div>
              <button
                onClick={handleFinish}
                className="text-[11px] text-[#64748B] hover:text-[#2563EB] transition-colors px-3 py-1.5 rounded-xl hover:bg-white/80 border border-sky-100 font-bold uppercase tracking-widest"
              >
                End Test
              </button>
            </div>

            <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(56,189,248,0.15)] border-2 border-sky-100 transition-all duration-300 overflow-hidden relative">
              <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-4 border-b border-sky-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest leading-none">
                      Level
                    </span>
                    <span className="text-[#0F172A] text-2xl font-black">
                      {level} / {TOTAL_LEVELS}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest leading-none">
                      Time Left
                    </span>
                    <span
                      className={`font-mono font-black text-xl ${
                        roundTimeLeft <= 3 ? 'text-red-500' : 'text-[#0F172A]'
                      }`}
                    >
                      {roundTimeLeft}s
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-sky-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="p-8 sm:p-12 relative min-h-[320px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-8 w-full max-w-sm mx-auto">
                  <div className="flex justify-center gap-8 w-full">
                    {shuffled.slice(0, 2).map(bubble => (
                      <button
                        key={bubble.id}
                        onClick={() => handleBubbleClick(bubble)}
                        className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center p-4 transition-all duration-300 relative border-2 select-none touch-manipulation ${
                          selectionOrder.includes(bubble.id)
                            ? 'bg-sky-50 border-sky-300 scale-95 shadow-md shadow-sky-500/10'
                            : 'bg-white border-sky-100 hover:border-sky-300 hover:scale-105 shadow-md shadow-sky-500/5 hover:shadow-xl hover:shadow-sky-500/15'
                        }`}
                      >
                        <span className="text-[16px] sm:text-[19px] font-black tracking-tight text-[#0F172A]">
                          {bubble.text}
                        </span>
                      </button>
                    ))}
                  </div>
                  {shuffled[2] && (
                    <div className="flex justify-center w-full">
                      <button
                        key={shuffled[2].id}
                        onClick={() => handleBubbleClick(shuffled[2])}
                        className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center p-4 transition-all duration-300 relative border-2 select-none touch-manipulation ${
                          selectionOrder.includes(shuffled[2].id)
                            ? 'bg-sky-50 border-sky-300 scale-95 shadow-md shadow-sky-500/10'
                            : 'bg-white border-sky-100 hover:border-sky-300 hover:scale-105 shadow-md shadow-sky-500/5 hover:shadow-xl hover:shadow-sky-500/15'
                        }`}
                      >
                        <span className="text-[16px] sm:text-[19px] font-black tracking-tight text-[#0F172A]">
                          {shuffled[2].text}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
            <DecorativeCurve
              opacity={0.08}
              height="h-[260px] sm:h-[320px]"
              className="absolute -bottom-4 left-0 w-full pointer-events-none"
              animate={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BubbleGame;

