import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Clock, Trophy } from 'lucide-react';
import DecorativeCurve from '@/components/DecorativeCurve';

interface CrossMathPuzzle {
  id: string;
  grid: (string | number | null)[][];
  solution: number[];
  difficulty: 'easy' | 'medium' | 'hard';
}

const TOTAL_QUESTIONS = 20;

const CrossMathGame = () => {
  const { currentStudent, updateStudentScore, submitGameResult, finishTest, currentTest, addCompletedGame, getNextGame } = useGame();
  const navigate = useNavigate();

  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);
  const [finished, setFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef(Date.now());

  const puzzles = useMemo<CrossMathPuzzle[]>(() => [
    {
      id: 'p1', difficulty: 'easy',
      grid: [[5, '+', null, '=', 12], ['+', ' ', '+', ' ', ' '], [null, '+', 4, '=', 10], ['=', ' ', '=', ' ', ' '], [11, ' ', 11, ' ', ' ']],
      solution: [7, 6]
    },
    {
      id: 'p2', difficulty: 'easy',
      grid: [[9, '-', null, '=', 4], ['+', ' ', '+', ' ', ' '], [null, '+', 2, '=', 5], ['=', ' ', '=', ' ', ' '], [12, ' ', 7, ' ', ' ']],
      solution: [5, 3]
    },
  ], []);

  const puzzle = puzzles[currentQ % puzzles.length];

  useEffect(() => { if (!currentStudent) { navigate('/student'); } }, [currentStudent, navigate]);
  useEffect(() => { if (currentTest?.status === 'FINISHED') navigate('/'); }, [currentTest?.status, navigate]);

  useEffect(() => {
    lastTickRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const delta = Math.floor((now - lastTickRef.current) / 1000);
      if (delta >= 1) { setElapsed(prev => prev + delta); lastTickRef.current = now; }
    }, 100);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [finished]);

  const handleInputChange = (row: number, col: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    setInputs(prev => ({ ...prev, [`${row}-${col}`]: val }));
  };

  const handleFinish = useCallback(() => {
    setFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (currentStudent && currentTest) {
      submitGameResult(currentStudent.username, {
        gameId: 'crossmath', score, timeTaken: elapsed, correctAnswers: correctCount, totalQuestions: TOTAL_QUESTIONS, completedAt: Date.now()
      }).then(() => addCompletedGame('crossmath'));
    }
  }, [score, correctCount, currentStudent, currentTest, submitGameResult, addCompletedGame, elapsed]);

  const handlePostFinish = useCallback(() => {
    const nextGame = getNextGame();
    if (nextGame) navigate('/select-game');
    else { if (currentStudent) finishTest(currentStudent.username); navigate('/'); }
  }, [getNextGame, navigate, currentStudent, finishTest]);

  const handleSubmit = () => {
    const userVals = Object.keys(inputs).sort().map(key => parseInt(inputs[key]));
    const isCorrect = userVals.length === puzzle.solution.length && userVals.every((v, i) => v === puzzle.solution[i]);
    if (isCorrect) {
      setShowResult('correct');
      const points = puzzle.difficulty === 'easy' ? 50 : puzzle.difficulty === 'medium' ? 100 : 150;
      setScore(prev => prev + points);
      setCorrectCount(prev => prev + 1);
      setTimeout(() => { setShowResult(null); setInputs({}); if (currentQ + 1 >= TOTAL_QUESTIONS) handleFinish(); else setCurrentQ(prev => prev + 1); }, 1000);
    } else {
      setShowResult('wrong');
      setTimeout(() => setShowResult(null), 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const allFilled = useMemo(() => {
    let emptyCount = 0;
    puzzle.grid.forEach(row => row.forEach(cell => { if (cell === null) emptyCount++; }));
    return Object.keys(inputs).length === emptyCount && Object.values(inputs).every(v => v !== '');
  }, [inputs, puzzle]);

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
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-sky-100 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-sky-200/40"><Trophy className="w-10 h-10 text-sky-500" /></div>
            <h1 className="text-[32px] sm:text-[42px] font-black text-[#0F172A] tracking-tight leading-none mb-3">Cross Math Complete!</h1>
            <p className="text-[15px] text-[#64748B] mb-10 font-medium">Great work, {currentStudent?.username}!</p>
            <div className="bg-white/90 backdrop-blur-2xl border border-sky-100 rounded-[2.5rem] p-10 mb-10 shadow-[0_20px_60px_-15px_rgba(56,189,248,0.12)]">
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Score</span>
                  <span className="font-mono font-black text-2xl sm:text-3xl text-sky-500">{score}</span>
                </div>
                <div className="w-px h-12 bg-sky-100" />
                <div className="text-center">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Correct</span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-mono font-black text-2xl sm:text-3xl text-emerald-500">{correctCount}</span>
                    <span className="text-sm text-[#64748B]">/ {TOTAL_QUESTIONS}</span>
                  </div>
                </div>
                <div className="w-px h-12 bg-sky-100" />
                <div className="text-center">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Time</span>
                  <span className="font-mono font-black text-2xl sm:text-3xl text-[#1E293B]">{formatTime(elapsed)}</span>
                </div>
              </div>
            </div>
            <button onClick={handlePostFinish} className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] hover:from-[#0EA5E9] hover:to-[#0284C7] text-white rounded-2xl font-bold text-[16px] shadow-xl shadow-sky-500/25 transition-all hover:scale-105 active:scale-95">{getNextGame() ? 'Next Game →' : 'Finish Session'}</button>
          </div>
        </div>
        <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -bottom-[100px] -left-[10%] w-[120%] z-0 pointer-events-none" animate={true} />
      </div>
    );
  }

  const progress = ((currentQ + 1) / TOTAL_QUESTIONS) * 100;

  return (
    <div className="flex flex-col flex-1 w-full bg-[#F0F7FF] font-sans min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#E0F2FE_0%,_#F0F9FF_40%,_#FFFFFF_100%)]" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#38BDF8] opacity-[0.05] blur-[120px] rounded-full" />
      </div>
      <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -top-[100px] sm:-top-[150px] -left-[10%] w-[120%] z-0 rotate-180 pointer-events-none" animate={true} />
      <div className="flex flex-col flex-1 items-center justify-center p-3 sm:p-4 relative z-10 w-full min-h-screen -mt-14 sm:-mt-16">
        <div className="w-full max-w-lg animate-fade-in relative">
          <div className="flex items-center justify-between mb-4 px-2 tracking-tight font-bold">
            <span className="text-[13px] text-[#64748B]">{currentStudent?.username}</span>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-sky-100 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <span className="text-[#0F172A] font-mono text-[14px]">{formatTime(elapsed)}</span>
            </div>
            <button onClick={() => handleFinish()} className="text-[11px] text-[#94A3B8] hover:text-[#0F172A] transition-colors px-3 py-1.5 rounded-xl hover:bg-white/80 border border-sky-100 font-bold uppercase tracking-widest">End Test</button>
          </div>
          <div className={`bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(56,189,248,0.10)] border transition-all duration-300 overflow-hidden ${showResult === 'correct' ? 'border-emerald-300' : showResult === 'wrong' ? 'border-red-300' : 'border-sky-100'}`}>
            <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-4 border-b border-sky-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${puzzle.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600' : puzzle.difficulty === 'medium' ? 'bg-sky-50 text-sky-500' : 'bg-red-50 text-red-500'}`}>{puzzle.difficulty}</span>
                  <span className="text-[14px] font-black text-[#0F172A]">Q{currentQ + 1} / {TOTAL_QUESTIONS}</span>
                </div>
                <div className="text-right flex flex-col gap-1">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest leading-none">SCORE</span>
                  <span className="font-mono font-black text-2xl text-sky-500">{score}</span>
                </div>
              </div>
              <div className="w-full h-2 bg-sky-50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="p-6 sm:p-10 flex flex-col items-center">
              <div className="grid grid-cols-5 gap-2 sm:gap-3 items-center justify-items-center">
                {puzzle.grid.map((row, rIdx) => row.map((cell, cIdx) => {
                  if (cell === ' ') return <div key={`${rIdx}-${cIdx}`} className="w-10 h-10 sm:w-16 sm:h-16" />;
                  if (cell === null) return (
                    <input key={`${rIdx}-${cIdx}`} type="text" maxLength={2} value={inputs[`${rIdx}-${cIdx}`] || ''} onChange={e => handleInputChange(rIdx, cIdx, e.target.value)}
                      className={`w-10 h-10 sm:w-16 sm:h-16 rounded-xl border-2 text-center text-xl sm:text-2xl font-black transition-all focus:outline-none focus:ring-4 focus:ring-sky-200
                        ${showResult === 'wrong' ? 'border-red-300 bg-red-50 text-red-600' : showResult === 'correct' ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-sky-200 bg-white text-sky-600'}`}
                    />
                  );
                  return (
                    <div key={`${rIdx}-${cIdx}`} className={`w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center text-xl sm:text-2xl font-black ${typeof cell === 'number' ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>{cell}</div>
                  );
                }))}
              </div>
            </div>
            <div className="px-8 pb-10">
              <button onClick={handleSubmit} disabled={!allFilled || showResult !== null} className={`w-full py-4 rounded-2xl font-black text-[15px] transition-all tracking-tight ${allFilled && !showResult ? 'bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-white hover:from-[#0EA5E9] hover:to-[#0284C7] shadow-lg shadow-sky-400/20' : 'bg-sky-50 text-[#94A3B8] cursor-not-allowed'}`}>
                {showResult === 'correct' ? '✓ Correct!' : showResult === 'wrong' ? '✗ Wrong' : 'Submit Answer'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -bottom-[100px] -left-[10%] w-[120%] z-0 pointer-events-none" animate={true} />
    </div>
  );
};

export default CrossMathGame;
