import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Clock, Trophy, CheckCircle2, XCircle } from 'lucide-react';
import DecorativeCurve from '@/components/DecorativeCurve';

interface BubbleData {
    text: string;
    value: number;
    id: string;
    status: 'idle' | 'correct' | 'wrong';
}

const TOTAL_LEVELS = 30;

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
        status: 'idle',
    };
}

function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

const SKY = '#38BDF8';
const SKY_DARK = '#0EA5E9';
const SKY_DARKER = '#0284C7';

const BubbleGame = () => {
    const { currentStudent, updateStudentScore, submitGameResult, finishTest, currentTest, addCompletedGame, getNextGame } = useGame();
    const navigate = useNavigate();

    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [bubbles, setBubbles] = useState<BubbleData[]>([]);
    const [shuffledExp, setShuffledExp] = useState<BubbleData[]>([]);
    const [gameActive, setGameActive] = useState(true);
    const [finished, setFinished] = useState(false);
    const [correctAnswersInRound, setCorrectAnswersInRound] = useState(0);
    const [correctAnswersTotal, setCorrectAnswersTotal] = useState(0);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastTickRef = useRef(Date.now());

    useEffect(() => {
        if (!currentStudent) { navigate('/student'); return; }
    }, [currentStudent, navigate]);

    useEffect(() => {
        if (currentTest?.status === 'FINISHED') navigate('/');
    }, [currentTest?.status, navigate]);

    const startRound = useCallback((lvl: number) => {
        const newBubbles = Array.from({ length: 4 }, () => createExpression(lvl));
        const sortedBubbles = [...newBubbles].sort((a, b) => a.value - b.value);
        setBubbles(sortedBubbles);
        setShuffledExp(newBubbles.sort(() => Math.random() - 0.5));
        setCorrectAnswersInRound(0);
        setGameActive(true);
    }, []);

    useEffect(() => { startRound(level); }, [level, startRound]);

    const handleFinish = useCallback(() => {
        setFinished(true);
        setGameActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (currentStudent && currentTest) {
            submitGameResult(currentStudent.username, {
                gameId: 'bubble', score, timeTaken: elapsed, correctAnswers: correctAnswersTotal, totalQuestions: TOTAL_LEVELS, completedAt: Date.now()
            }).then(() => addCompletedGame('bubble'));
        }
    }, [score, correctAnswersTotal, currentStudent, currentTest, submitGameResult, addCompletedGame, elapsed]);

    const handlePostFinish = useCallback(() => {
        const nextGame = getNextGame();
        if (nextGame) navigate('/select-game');
        else { if (currentStudent) finishTest(currentStudent.username); navigate('/'); }
    }, [getNextGame, navigate, currentStudent, finishTest]);

    const failLevel = useCallback(() => {
        setGameActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
        setShuffledExp(prev => prev.map(b => b.status === 'idle' ? { ...b, status: 'wrong' } : b));
        setTimeout(() => {
            if (level >= TOTAL_LEVELS) handleFinish();
            else setLevel(prev => prev + 1);
        }, 1000);
    }, [level, handleFinish]);

    useEffect(() => {
        if (!gameActive) return;
        lastTickRef.current = Date.now();
        timerRef.current = setInterval(() => {
            const now = Date.now();
            const delta = Math.floor((now - lastTickRef.current) / 1000);
            if (delta >= 1) { setElapsed(prev => prev + delta); lastTickRef.current = now; }
        }, 100);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [gameActive]);

    const handleBubbleClick = useCallback((clicked: BubbleData) => {
        if (!gameActive || clicked.status !== 'idle') return;
        const expected = bubbles[correctAnswersInRound];
        if (clicked.id === expected.id) {
            setShuffledExp(prev => prev.map(b => b.id === clicked.id ? { ...b, status: 'correct' } : b));
            setCorrectAnswersInRound(prev => prev + 1);
            setCorrectAnswersTotal(prev => prev + 1);
            const points = (level > 20) ? 30 : (level > 10) ? 20 : 10;
            setScore(prev => prev + points);
            if (correctAnswersInRound + 1 === bubbles.length) {
                setGameActive(false);
                if (timerRef.current) clearInterval(timerRef.current);
                if (currentStudent) updateStudentScore(currentStudent.username, score + points, level, correctAnswersTotal + 1);
                if (level >= TOTAL_LEVELS) setTimeout(() => handleFinish(), 1000);
                else setTimeout(() => setLevel(prev => prev + 1), 1000);
            }
        } else {
            setShuffledExp(prev => prev.map(b => b.id === clicked.id ? { ...b, status: 'wrong' } : b));
            failLevel();
        }
    }, [gameActive, bubbles, correctAnswersInRound, score, level, currentStudent, updateStudentScore, failLevel, handleFinish, correctAnswersTotal]);

    if (finished) {
        return (
            <div className="flex flex-col flex-1 w-full bg-[#F0F7FF] font-sans min-h-screen relative overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#E0F2FE_0%,_#F0F9FF_40%,_#FFFFFF_100%)]" />
                    <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#38BDF8] opacity-[0.05] blur-[120px] rounded-full" />
                </div>
                <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -top-[100px] sm:-top-[150px] -left-[10%] w-[120%] z-0 rotate-180 pointer-events-none" animate={true} />
                <div className="flex items-center justify-center p-4 relative z-10 w-full min-h-screen -mt-14 sm:-mt-16">
                    <div className="text-center animate-fade-in max-w-md w-full px-4">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-sky-100 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-sky-200/40">
                            <Trophy className="w-10 h-10 text-sky-500" />
                        </div>
                        <h1 className="text-[32px] sm:text-[42px] font-black text-[#0F172A] tracking-tight leading-none mb-3">Bubble Complete!</h1>
                        <p className="text-[15px] text-[#64748B] mb-10 font-medium">Excellent work, {currentStudent?.username}!</p>
                        <div className="bg-white/90 backdrop-blur-2xl border border-sky-100 rounded-[2.5rem] p-10 mb-10 shadow-[0_20px_60px_-15px_rgba(56,189,248,0.12)]">
                            <div className="flex items-center justify-center gap-10">
                                <div className="text-center">
                                    <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Score</span>
                                    <span className="font-mono font-black text-3xl sm:text-4xl text-sky-500">{score}</span>
                                </div>
                                <div className="w-px h-14 bg-sky-100" />
                                <div className="text-center">
                                    <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Time</span>
                                    <span className="font-mono font-black text-3xl sm:text-4xl text-[#1E293B]">{formatTime(elapsed)}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={handlePostFinish} className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] hover:from-[#0EA5E9] hover:to-[#0284C7] text-white rounded-2xl font-bold text-[16px] shadow-xl shadow-sky-500/25 transition-all hover:scale-105 active:scale-95">
                            {getNextGame() ? 'Next Game →' : 'Finish Session'}
                        </button>
                    </div>
                </div>
                <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -bottom-[100px] -left-[10%] w-[120%] z-0 pointer-events-none" animate={true} />
            </div>
        );
    }

    const progress = Math.min(100, (level / TOTAL_LEVELS) * 100);

    return (
        <div className="flex flex-col flex-1 w-full bg-[#F0F7FF] font-sans min-h-screen relative overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#E0F2FE_0%,_#F0F9FF_40%,_#FFFFFF_100%)]" />
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#38BDF8] opacity-[0.05] blur-[120px] rounded-full" />
            </div>
            <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -top-[100px] sm:-top-[150px] -left-[10%] w-[120%] z-0 rotate-180 pointer-events-none" animate={true} />
            <div className="flex flex-col flex-1 items-center justify-center p-3 sm:p-4 relative z-10 w-full min-h-screen -mt-14 sm:-mt-16">
                <div className="w-full max-w-[480px] animate-fade-in relative">
                    <div className="flex items-center justify-between mb-4 px-2 tracking-tight font-bold">
                        <span className="text-[13px] text-[#64748B]">{currentStudent?.username}</span>
                        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-sky-100 shadow-sm">
                            <Clock className="w-3.5 h-3.5 text-sky-500" />
                            <span className="text-[#0F172A] font-mono text-[14px]">{formatTime(elapsed)}</span>
                        </div>
                        <button onClick={() => handleFinish()} className="text-[11px] text-[#94A3B8] hover:text-[#0F172A] transition-colors px-3 py-1.5 rounded-xl hover:bg-white/80 border border-sky-100 font-bold uppercase tracking-widest">End Test</button>
                    </div>
                    <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(56,189,248,0.10)] border border-sky-100 overflow-hidden relative">
                        <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-6 border-b border-sky-50">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest leading-none">Level</span>
                                    <span className="text-[#0F172A] text-2xl font-black">{level} / {TOTAL_LEVELS}</span>
                                </div>
                                <div className="text-right flex flex-col gap-1">
                                    <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest leading-none">Score</span>
                                    <span className="font-mono font-black text-2xl text-sky-500">{score}</span>
                                </div>
                            </div>
                            <div className="w-full h-2 bg-sky-50 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                        <div className="p-6 sm:p-10 relative">
                            <div className="grid grid-cols-2 gap-6 sm:gap-8 w-full">
                                {shuffledExp.map((bubble) => (
                                    <button key={bubble.id} onClick={() => handleBubbleClick(bubble)}
                                        className={`aspect-square rounded-[2rem] flex flex-col items-center justify-center p-4 transition-all duration-300 relative border-2
                      ${bubble.status === 'correct' ? 'bg-emerald-500 text-white scale-95 shadow-lg shadow-emerald-500/25 border-emerald-400'
                                            : bubble.status === 'wrong' ? 'bg-[#EF4444] text-white animate-shake shadow-lg shadow-red-500/25 border-red-400'
                                                : 'bg-white border-sky-100 hover:border-sky-300 hover:-translate-y-1 shadow-sm hover:shadow-[0_8px_24px_rgba(56,189,248,0.15)]'}`}
                                    >
                                        <span className={`text-[17px] sm:text-[20px] font-black tracking-tight ${bubble.status === 'idle' ? 'text-[#0F172A]' : 'text-white'}`}>{bubble.text}</span>
                                        <div className="mt-2 h-6">
                                            {bubble.status === 'correct' && <CheckCircle2 className="w-6 h-6" />}
                                            {bubble.status === 'wrong' && <XCircle className="w-6 h-6" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="px-6 pb-10">
                            <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-4 text-center">
                                <p className="text-[13px] text-[#64748B] font-bold">Tap results in order from <span className="text-sky-500">lowest</span> to <span className="text-sky-500">highest</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -bottom-[100px] -left-[10%] w-[120%] z-0 pointer-events-none" animate={true} />
        </div>
    );
};

export default BubbleGame;
