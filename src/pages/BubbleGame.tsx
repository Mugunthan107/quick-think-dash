import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';

interface BubbleData {
  text: string;
  value: number;
  id: string;
  selected: boolean;
  wrong: boolean;
}

interface Position {
  top: string;
  left: string;
}

const POSITIONS: Position[] = [
  { top: '20px', left: '190px' },
  { top: '160px', left: '40px' },
  { top: '150px', left: '320px' },
];

const MAX_LEVEL = 15;
const TIME_PER_ROUND = 15;

function getLevelConfig(level: number) {
  if (level <= 5) return { max: 9, ops: ['+', '-'], decimalAllowed: false, label: 'EASY' };
  if (level <= 10) return { max: 15, ops: ['+', '-', '×'], decimalAllowed: true, label: 'MEDIUM' };
  return { max: 25, ops: ['+', '-', '×', '÷'], decimalAllowed: true, label: 'HARD' };
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

  if (op === '÷') {
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
  };
}

const BubbleGame = () => {
  const { currentStudent, updateStudentScore, finishTest } = useGame();
  const navigate = useNavigate();

  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_ROUND);
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const [clickOrder, setClickOrder] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [flash, setFlash] = useState(false);
  const [finished, setFinished] = useState(false);
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
  }, []);

  useEffect(() => {
    startRound(level);
  }, [level, startRound]);

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
  }, [gameActive, bubbles]);

  const failLevel = useCallback(() => {
    setGameActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
    setLevel(prev => Math.max(1, prev - 2));
  }, []);

  const handleFinish = useCallback(() => {
    setFinished(true);
    setGameActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (currentStudent) {
      finishTest(currentStudent.username);
    }
  }, [currentStudent, finishTest]);

  const handleBubbleClick = useCallback((clicked: BubbleData) => {
    if (!gameActive || clicked.selected) return;

    const sorted = [...bubbles].sort((a, b) => a.value - b.value);
    const expected = sorted[clickOrder];

    if (Math.abs(clicked.value - expected.value) < 0.001) {
      setBubbles(prev => prev.map(b => b.id === clicked.id ? { ...b, selected: true } : b));
      const newOrder = clickOrder + 1;
      setClickOrder(newOrder);

      if (newOrder === 3) {
        setGameActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
        const newScore = score + level * 10 + timeLeft;
        setScore(newScore);
        if (currentStudent) updateStudentScore(currentStudent.username, newScore, level);

        if (level >= MAX_LEVEL) {
          setTimeout(() => handleFinish(), 500);
        } else {
          setTimeout(() => setLevel(prev => prev + 1), 500);
        }
      }
    } else {
      setBubbles(prev => prev.map(b => b.id === clicked.id ? { ...b, wrong: true } : b));
      failLevel();
    }
  }, [gameActive, bubbles, clickOrder, score, level, timeLeft, currentStudent, updateStudentScore, failLevel, handleFinish]);

  if (finished) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Test Complete!</h1>
          <p className="text-muted-foreground mb-4">
            Score: <span className="font-mono font-bold text-accent">{score}</span> · Level {level}
          </p>
          <button
            onClick={() => navigate('/leaderboard')}
            className="bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
          >
            View Leaderboard
          </button>
        </div>
      </div>
    );
  }

  const config = getLevelConfig(level);
  const progress = Math.min(100, (level / MAX_LEVEL) * 100);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="bg-card w-full max-w-[800px] h-[550px] rounded-lg relative flex flex-col items-center shadow-2xl border border-border">
        {/* Level header */}
        <div className="w-[85%] mt-8 flex flex-col gap-2">
          <div className="flex justify-between text-sm font-semibold text-muted-foreground uppercase">
            <span>Level {level}</span>
            <span>{config.label}</span>
          </div>
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Score */}
        <div className="absolute top-8 right-[7.5%] text-right">
          <span className="text-xs text-muted-foreground block">SCORE</span>
          <span className="font-mono font-bold text-xl text-foreground">{score}</span>
        </div>

        {/* Game area */}
        <div className="w-[500px] h-[350px] relative mt-10">
          {bubbles.map((bubble, i) => (
            <button
              key={bubble.id}
              onClick={() => handleBubbleClick(bubble)}
              disabled={bubble.selected}
              className={`absolute w-[120px] h-[120px] rounded-full flex items-center justify-center text-lg font-semibold transition-all duration-200 select-none shadow-md
                ${bubble.selected
                  ? 'bg-bubble-selected text-bubble-selected-foreground scale-95 shadow-inner cursor-default'
                  : bubble.wrong
                    ? 'bg-muted text-muted-foreground animate-shake'
                    : 'bg-bubble text-bubble-foreground hover:scale-105 hover:bg-bubble/80 cursor-pointer'
                }`}
              style={{ top: POSITIONS[i].top, left: POSITIONS[i].left }}
            >
              {bubble.text}
            </button>
          ))}

          {/* Timer */}
          <div className="absolute bottom-0 left-0 w-[45px] h-[45px] rounded-full border-2 border-border flex items-center justify-center">
            <span className={`font-mono font-bold text-lg ${timeLeft <= 5 ? 'text-destructive' : 'text-foreground'}`}>
              {timeLeft}
            </span>
          </div>

          {/* Instruction */}
          <div className="absolute bottom-1 right-0 text-right text-xs text-muted-foreground leading-relaxed">
            Select the bubbles in order from the<br />
            <span className="text-foreground font-bold">LOWEST</span> to the <span className="text-foreground font-bold">HIGHEST</span> value
          </div>
        </div>

        {/* Finish button */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <button
            onClick={handleFinish}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Finish Test Early
          </button>
        </div>

        {/* Flash overlay */}
        {flash && (
          <div className="absolute inset-0 bg-background/30 rounded-lg pointer-events-none animate-fade-in" />
        )}
      </div>
    </div>
  );
};

export default BubbleGame;
