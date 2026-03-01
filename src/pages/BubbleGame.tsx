import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Zap, Trophy } from 'lucide-react';

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
    if (level <= 20) return { max: 25, ops: ['+', '-', '×', '÷'], decimalAllowed: true, label: 'MEDIUM' };
    return { max: 25, ops: ['×', '÷'], decimalAllowed: true, label: 'HARD' };
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
        order: null,
    };
}

const BubbleGame = () => {
    const { currentStudent, updateStudentScore, submitGameResult, finishTest, currentTest, addCompletedGame, getNextGame } = useGame();
    const navigate = useNavigate();

    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TIME_PER_ROUND);
    const [elapsed, setElapsed] = useState(0);
    const [bubbles, setBubbles] = useState<BubbleData[]>([]);
    const [correctCount, setCorrectCount] = useState(0);
    const [clickOrder, setClickOrder] = useState(0);
    const [gameActive, setGameActive] = useState(true);
    const [flash, setFlash] = useState<'wrong' | 'correct' | null>(null);
    const [finished, setFinished] = useState(false);
    const [transitioning, setTransitioning] = useState(false);
    const [streak, setStreak] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = useRef(Date.now());
    const lastTickRef = useRef(Date.now());

    useEffect(() => {
        if (!currentStudent) {
            navigate('/student');
            return;
        }
    }, [currentStudent, navigate]);

    useEffect(() => {
        if (currentTest?.status === 'FINISHED') {
            navigate('/');
        }
    }, [currentTest?.status, navigate]);

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

        if (currentStudent && currentTest) {
            submitGameResult(currentStudent.username, {
                gameId: 'bubble',
                score: score,
                timeTaken: elapsed,
                correctAnswers: correctCount,
                totalQuestions: 30,
                completedAt: Date.now()
            }).then(() => {
                addCompletedGame('bubble');
            });
        }
    }, [score, correctCount, currentStudent, currentTest, submitGameResult, addCompletedGame, elapsed]);

    const handlePostFinish = useCallback(() => {
        const nextGame = getNextGame();
        if (nextGame) {
            navigate('/select-game');
        } else {
            if (currentStudent) finishTest(currentStudent.username);
            navigate('/');
        }
    }, [getNextGame, navigate, currentStudent, finishTest]);

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
        if (!gameActive) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        lastTickRef.current = Date.now();
        timerRef.current = setInterval(() => {
            const now = Date.now();
            const delta = Math.floor((now - lastTickRef.current) / 1000);

            if (delta >= 1) {
                setElapsed(prev => prev + delta);
                lastTickRef.current = now;
                setTimeLeft(prev => {
                    if (prev <= delta) {
                        failLevel();
                        return 0;
                    }
                    return prev - delta;
                });
            }
        }, 100);

        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [gameActive, failLevel]);

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
    }, [gameActive, transitioning, bubbles, clickOrder, score, level, currentStudent, updateStudentScore, failLevel, handleFinish, streak, correctCount]);

    if (finished) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4 relative z-10">
                <div className="text-center animate-fade-in max-w-md w-full px-2">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-6 animate-pulse-ring">
                        <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-success" />
                    </div>
                    <h1 className="text-[26px] sm:text-[32px] font-bold text-foreground mb-2 tracking-tight">Bubble Complete!</h1>
                    <p className="text-base text-muted-foreground mb-8 font-medium">Great work, {currentStudent?.username}!</p>

                    <div className="bg-white rounded-2xl border border-border p-6 mb-8 shadow-sm">
                        <div className="flex items-center justify-center gap-8">
                            <div className="text-center">
                                <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider block mb-1">Score</span>
                                <span className="font-bold text-2xl sm:text-3xl text-accent font-mono">{score}</span>
                            </div>
                            <div className="w-px h-10 bg-border" />
                            <div className="text-center">
                                <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider block mb-1">Correct</span>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="font-bold text-2xl sm:text-3xl text-success font-mono">{correctCount}</span>
                                    <span className="text-sm text-muted-foreground">/ {MAX_LEVEL}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handlePostFinish}
                        className="bg-accent text-accent-foreground px-10 py-3.5 rounded-xl font-semibold hover:bg-accent/90 transition-all hover:scale-105 active:scale-95 text-base sm:text-lg shadow-lg shadow-accent/25"
                    >
                        {getNextGame() ? 'Next Game →' : 'Finish'}
                    </button>
                </div>
            </div>
        );
    }

    const config = getLevelConfig(level);
    const progress = Math.min(100, (level / MAX_LEVEL) * 100);
    const timerProgress = (timeLeft / TIME_PER_ROUND) * 100;

    return (
        <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 relative z-10">
            <div className="w-full max-w-[700px] animate-fade-in">
                {/* Header Section */}
                <div className="w-full mb-6 flex flex-col items-center text-center font-['Inter']">
                    <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground uppercase">
                        SORT BY VALUE
                        <span className="text-sm font-normal ml-3 opacity-40 text-muted-foreground normal-case">LOW → HIGH</span>
                    </h1>
                    <p className="text-[13px] sm:text-sm font-normal tracking-wide opacity-50 text-muted-foreground mt-1 px-4 max-w-[340px]">
                        Click bubbles in ascending order of their mathematical result
                    </p>
                </div>

                {/* Top Stats Bar */}
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-3">
                        <span className="text-[12px] sm:text-sm font-medium text-muted-foreground">{currentStudent?.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {streak > 1 && (
                            <div className="flex items-center gap-1 text-accent text-[11px] font-semibold animate-fade-in bg-accent/8 px-2 py-0.5 rounded-full border border-accent/20">
                                <Zap className="w-2.5 h-2.5" />
                                {streak}
                            </div>
                        )}
                        <button
                            onClick={handleFinish}
                            className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary border border-border uppercase tracking-wider"
                        >
                            End Test
                        </button>
                    </div>
                </div>

                {/* Main Game Card */}
                <div className={`bg-white rounded-[24px] relative flex flex-col items-center shadow-[0_8px_32px_hsl(260_40%_88%/0.7)] border overflow-hidden transition-all duration-300 ${flash === 'wrong' ? 'border-destructive/30' : flash === 'correct' ? 'border-success/30' : 'border-border'
                    }`}>

                    <div className="w-full px-4 sm:px-8 pt-6 sm:pt-10 pb-3 flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${config.label === 'EASY' ? 'bg-success/10 text-success' :
                                    config.label === 'MEDIUM' ? 'bg-accent/10 text-accent' :
                                        'bg-destructive/10 text-destructive'
                                    }`}>
                                    {config.label}
                                </div>
                                <span className="text-[13px] font-semibold text-foreground/70 tracking-tight">Lv.{level} <span className="text-muted-foreground/40 font-normal">/ {MAX_LEVEL}</span></span>
                            </div>
                            <div className="w-full max-w-[140px] h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        <div className="text-right">
                            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider block mb-0.5">Score</span>
                            <span className="font-bold text-lg sm:text-xl text-foreground tabular-nums leading-none font-mono">{score}</span>
                        </div>
                    </div>

                    {/* Game Area */}
                    <div className="w-full px-4 sm:px-8 py-8 sm:py-12">
                        <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
                            {bubbles.map((bubble) => (
                                <button
                                    key={bubble.id}
                                    onClick={() => handleBubbleClick(bubble)}
                                    disabled={bubble.selected || transitioning}
                                    style={{ WebkitTapHighlightColor: 'transparent' }}
                                    className={`w-[88px] h-[88px] sm:w-[116px] sm:h-[116px] rounded-full flex flex-col items-center justify-center transition-all duration-300 select-none touch-manipulation border-2
                                        ${bubble.selected
                                            ? 'bg-secondary text-muted-foreground/40 scale-90 border-secondary shadow-none'
                                            : bubble.wrong
                                                ? 'bg-destructive/8 text-destructive animate-shake border-destructive/30'
                                                : 'bg-white text-foreground border-border/50 hover:scale-105 shadow-md shadow-[hsl(260_40%_88%/0.8)] hover:border-accent/30 hover:shadow-[0_6px_20px_hsl(265_80%_60%/0.15)] cursor-pointer active:scale-95'
                                        }`}
                                >
                                    <span className="text-sm sm:text-base font-semibold tracking-tight leading-none px-2 text-center">{bubble.text}</span>
                                    {bubble.selected && bubble.order && (
                                        <span className="text-[10px] mt-1 opacity-30 font-medium uppercase tracking-tighter">Done</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="w-full px-4 sm:px-8 pb-6 sm:pb-10 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-3">
                            <div className="relative w-9 h-9">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                                    <circle cx="24" cy="24" r="21" fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
                                    <circle
                                        cx="24" cy="24" r="21" fill="none"
                                        stroke={timeLeft <= 3 ? 'hsl(var(--destructive))' : 'hsl(var(--accent))'}
                                        strokeWidth="3"
                                        strokeDasharray={`${2 * Math.PI * 21}`}
                                        strokeDashoffset={`${2 * Math.PI * 21 * (1 - timerProgress / 100)}`}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-linear"
                                    />
                                </svg>
                                <span className={`absolute inset-0 flex items-center justify-center font-bold text-[11px] tabular-nums ${timeLeft <= 3 ? 'text-destructive' : 'text-foreground'}`}>
                                    {timeLeft}
                                </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Time</span>
                        </div>

                        <div className="text-right">
                            <span className="text-[12px] sm:text-[13px] font-medium text-muted-foreground/50 tracking-tight">Keep going!</span>
                        </div>
                    </div>

                    {/* Flash overlay */}
                    {flash && (
                        <div className={`absolute inset-0 pointer-events-none animate-fade-in rounded-[24px] ${flash === 'wrong' ? 'bg-destructive/5' : 'bg-success/5'
                            }`} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default BubbleGame;
