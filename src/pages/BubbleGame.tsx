import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Zap, Target, Clock, Trophy } from 'lucide-react';

interface BubbleData {
  text: string;
  value: number;
  id: string;
  selected: boolean;
  wrong: boolean;
  order: number | null;
}

const MAX_LEVEL = 30;
const TIME_PER_ROUND = 10;

function getLevelConfig(level: number) {
  if (level <= 5) return { max: 9, ops: ['+', '-'], decimalAllowed: false, label: 'EASY' };
  if (level <= 10) return { max: 15, ops: ['+', '-'], decimalAllowed: true, label: 'EASY' };
  if (level <= 20) return { max: 25, ops: ['+', '-', '×', '/'], decimalAllowed: true, label: 'MEDIUM' };
  return { max: 25, ops: ['×', '/'], decimalAllowed: true, label: 'HARD' };
}

function getNum(max: number, allowDecimal: boolean) {
  let val = Math.floor(Math.random() * max) + 1;
  if (allowDecimal && Math.random() > 0.8) val += 0.5;
  return val;
}

function createExpression(level: number): BubbleData {
  const config = getLevelConfig(level);
  const op = config.ops[Math.floor(Math.random() * config.ops.length)];
  let a: number, b: number, result: number;

  if (op === '/') {
    b = getNum(5, false);
    const multiplier = getNum(6, false);
    a = b * multiplier;
    result = a / b;
  } else {
    a = getNum(config.max, config.decimalAllowed);
    b = getNum(config.max, config.decimalAllowed);
    if (op === '+') result = a + b;
    else if (op === '-') result = a - b;
    else result = a * b;
  }

  const dispA = Number.isInteger(a) ? a.toString() : a.toFixed(1);
  const dispB = Number.isInteger(b) ? b.toString() : b.toFixed(1);

  return {
    text: `${dispA} ${op} ${dispB}`,
    value: result!,
    id: Math.random().toString(36).substr(2, 9),
    selected: false,
    wrong: false,
    order: null,
  };
}

const BubbleGame = () => {
  const { currentStudent, updateStudentScore, finishTest, addCompletedGame, getNextGame } = useGame();
  const navigate = useNavigate();

  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_ROUND);
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [clickOrder, setClickOrder] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [flash, setFlash] = useState<'wrong' | 'correct' | null>(null);
  const [finished, setFinished] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [streak, setStreak] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!currentStudent) {
      navigate('/student');
      return;
    }
  }, [currentStudent, navigate]);

  const startRound = useCallback((lvl: number) => {
    const newBubbles = Array.from({ length: 3 }, () => createExpression(lvl));
    setBubbles(newBubbles);
    setClickOrder(0);
    setTimeLeft(TIME_PER_ROUND);
    setGameActive(true);
    setTransitioning(false);
  }, []);

  useEffect(() => {
    startRound(level);
  }, [level, startRound]);

  const handleFinish = useCallback(() => {
    setFinished(true);
    setGameActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (currentStudent) {
      finishTest(currentStudent.username);
    }
    addCompletedGame('bubble');
  }, [currentStudent, finishTest, addCompletedGame]);

  const handlePostFinish = useCallback(() => {
    const nextGame = getNextGame();
    if (nextGame) {
      navigate('/select-game');
    } else {
      navigate('/leaderboard');
    }
  }, [getNextGame, navigate]);

  const failLevel = useCallback(() => {
    setGameActive(false);
    setTransitioning(true);
    if (timerRef.current) clearInterval(timerRef.current);
    setFlash('wrong');
    setStreak(0);

    const newLevel = level + 1;

    if (currentStudent) {
      updateStudentScore(currentStudent.username, score, newLevel, correctCount);
    }

    setTimeout(() => setFlash(null), 500);
    setTimeout(() => {
      if (level >= MAX_LEVEL) {
        handleFinish();
      } else {
        setLevel(newLevel);
      }
    }, 800);
  }, [score, level, currentStudent, updateStudentScore, handleFinish, correctCount]);

  useEffect(() => {
    if (!gameActive) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          failLevel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameActive, bubbles, failLevel]);

  const handleBubbleClick = useCallback((clicked: BubbleData) => {
    if (!gameActive || clicked.selected || transitioning) return;

    const sorted = [...bubbles].sort((a, b) => a.value - b.value);
    const expected = sorted[clickOrder];

    if (Math.abs(clicked.value - expected.value) < 0.001) {
      const newOrder = clickOrder + 1;
      setBubbles(prev => prev.map(b => b.id === clicked.id ? { ...b, selected: true, order: newOrder } : b));
      setClickOrder(newOrder);

      if (newOrder === 3) {
        setGameActive(false);
        setTransitioning(true);
        if (timerRef.current) clearInterval(timerRef.current);
        const points = (level > 20) ? 30 : (level > 10) ? 20 : 10;
        let bonus = 0;
        if (streak >= 9) bonus = 5;

        const newScore = score + points + bonus;
        const newCorrectCount = correctCount + 1;

        setScore(newScore);
        setCorrectCount(newCorrectCount);
        setStreak(prev => prev + 1);
        setFlash('correct');
        setTimeout(() => setFlash(null), 400);
        if (currentStudent) updateStudentScore(currentStudent.username, newScore, level, newCorrectCount);

        if (level >= MAX_LEVEL) {
          setTimeout(() => handleFinish(), 600);
        } else {
          setTimeout(() => setLevel(prev => prev + 1), 600);
        }
      }
    } else {
      setBubbles(prev => prev.map(b => b.id === clicked.id ? { ...b, wrong: true } : b));
      failLevel();
    }
  }, [gameActive, transitioning, bubbles, clickOrder, score, level, timeLeft, currentStudent, updateStudentScore, failLevel, handleFinish, streak, correctCount]);

  if (finished) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 relative z-10">
        <div className="text-center animate-fade-in max-w-md w-full px-2">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6 sm:mb-8 animate-pulse-ring">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-success" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Mind Sprint Complete!</h1>
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
                <span className="text-sm text-muted-foreground">/ {MAX_LEVEL}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handlePostFinish}
            className="bg-accent text-accent-foreground px-8 py-4 rounded-lg font-semibold hover:bg-accent/90 transition-all hover:scale-105 text-base sm:text-lg"
          >
            {getNextGame() ? 'Next Game →' : 'View Leaderboard'}
          </button>
        </div>
      </div>
    );
  }

  const config = getLevelConfig(level);
  const progress = Math.min(100, (level / MAX_LEVEL) * 100);
  const timerProgress = (timeLeft / TIME_PER_ROUND) * 100;

  return (
    <div className="flex min-h-screen items-center justify-center p-3 sm:p-4 relative z-10">
      <div className="w-full max-w-[820px] animate-fade-in">
        {/* Top Stats Bar */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 px-1 sm:px-2">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground">{currentStudent?.username}</span>
          </div>
          {streak > 1 && (
            <div className="flex items-center gap-1.5 text-accent text-xs sm:text-sm font-semibold animate-fade-in">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {streak} streak
            </div>
          )}
          <button
            onClick={handleFinish}
            className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors px-2 sm:px-3 py-1 sm:py-1.5 rounded-md hover:bg-secondary border border-border/50"
          >
            End Test
          </button>
        </div>

        {/* Main Game Card */}
        <div className={`bg-card/80 backdrop-blur-sm rounded-2xl relative flex flex-col items-center shadow-2xl border border-border overflow-hidden transition-all duration-300 ${flash === 'wrong' ? 'border-destructive/50' : flash === 'correct' ? 'border-success/50' : ''
          }`}>

          {/* Header Section */}
          <div className="w-full px-4 sm:px-8 pt-4 sm:pt-6 pb-3 sm:pb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${config.label === 'EASY' ? 'bg-success/15 text-success' :
                  config.label === 'MEDIUM' ? 'bg-accent/15 text-accent' :
                    'bg-destructive/15 text-destructive'
                  }`}>
                  {config.label}
                </div>
                <span className="text-xs sm:text-sm font-semibold text-foreground">Level {level} / {MAX_LEVEL}</span>
              </div>
              <div className="w-full max-w-[200px] sm:max-w-[300px] h-1.5 sm:h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="text-right ml-4 sm:ml-6">
              <span className="text-[10px] sm:text-xs text-muted-foreground block mb-0.5">SCORE</span>
              <span className="font-mono font-bold text-xl sm:text-2xl text-foreground">{score}</span>
            </div>
          </div>

          {/* Game Area */}
          <div className="w-full px-4 sm:px-8 py-2 sm:py-4">
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 py-4 sm:py-8">
              {bubbles.map((bubble) => (
                <button
                  key={bubble.id}
                  onClick={() => handleBubbleClick(bubble)}
                  disabled={bubble.selected || transitioning}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                  className={`w-[90px] h-[90px] sm:w-[130px] sm:h-[130px] rounded-full flex flex-col items-center justify-center transition-all duration-300 select-none font-semibold touch-manipulation
                    ${bubble.selected
                      ? 'bg-bubble-selected text-bubble-selected-foreground scale-90 shadow-inner cursor-default ring-2 ring-success/40'
                      : bubble.wrong
                        ? 'bg-destructive/20 text-destructive animate-shake ring-2 ring-destructive/40'
                        : 'bg-bubble text-bubble-foreground hover:scale-110 hover:shadow-lg hover:shadow-accent/10 cursor-pointer shadow-md active:scale-95'
                    }`}
                >
                  <span className="text-sm sm:text-xl leading-tight">{bubble.text}</span>
                  {bubble.selected && bubble.order && (
                    <span className="text-[8px] sm:text-[10px] mt-1 opacity-60 font-mono">#{bubble.order}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="w-full px-4 sm:px-8 pb-4 sm:pb-6 flex items-end justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
                  <circle
                    cx="24" cy="24" r="20" fill="none"
                    stroke={timeLeft <= 5 ? 'hsl(var(--destructive))' : 'hsl(var(--accent))'}
                    strokeWidth="3"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - timerProgress / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center font-mono font-bold text-xs sm:text-sm ${timeLeft <= 5 ? 'text-destructive' : 'text-foreground'
                  }`}>
                  {timeLeft}
                </span>
              </div>
            </div>

            <div className="text-right text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
              <div className="flex items-center gap-1 sm:gap-1.5 justify-end mb-0.5 sm:mb-1">
                <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="font-semibold text-foreground/70">Sort by value</span>
              </div>
              <span className="text-foreground font-bold">LOW</span> → <span className="text-foreground font-bold">HIGH</span>
            </div>
          </div>

          {/* Flash overlay */}
          {flash && (
            <div className={`absolute inset-0 pointer-events-none animate-fade-in rounded-2xl ${flash === 'wrong' ? 'bg-destructive/10' : 'bg-success/10'
              }`} />
          )}
        </div>
      </div>
    </div>
  );
};

export default BubbleGame;
