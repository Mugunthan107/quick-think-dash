import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Clock, Trophy, LogOut } from 'lucide-react';
import DecorativeCurve from '@/components/DecorativeCurve';

const TOTAL_LEVELS = 20;
const TIME_PER_QUESTION = 12; // seconds

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  difficulty: number;
}

function generateQuestions(): Question[] {
  const questions: Question[] = [];
  const usedQuestions = new Set<string>();

  const templates = [
    (d: number) => {
      const a = Math.floor(Math.random() * (10 * d)) + 5;
      const b = Math.floor(Math.random() * (8 * d)) + 3;
      const correct = a + b;
      return { text: `What is ${a} + ${b}?`, correct: correct.toString(), wrongs: [correct + 2, correct - 3, correct + 5].map(String) };
    },
    (d: number) => {
      const a = Math.floor(Math.random() * (5 * d)) + 2;
      const b = Math.floor(Math.random() * (4 * d)) + 2;
      const correct = a * b;
      return { text: `What is ${a} × ${b}?`, correct: correct.toString(), wrongs: [correct + a, correct - b, correct + b + 1].map(String) };
    },
    (d: number) => {
      const base = Math.floor(Math.random() * (3 * d)) + 2;
      const seq = [base, base * 2, base * 3, base * 4];
      return { text: `What comes next: ${seq.join(', ')}, ?`, correct: (base * 5).toString(), wrongs: [(base * 5 + 1), (base * 6), (base * 4 + base - 1)].map(String) };
    },
    (d: number) => {
      const total = Math.floor(Math.random() * (20 * d)) + 20;
      const part = Math.floor(total * (0.3 + Math.random() * 0.4));
      const diff = total - part;
      return { text: `If you have ${total} items and remove ${part}, how many remain?`, correct: diff.toString(), wrongs: [diff + 2, diff - 1, diff + 4].map(String) };
    },
    (d: number) => {
      const n = Math.floor(Math.random() * (4 * d)) + 3;
      const sq = n * n;
      return { text: `What is ${n}²?`, correct: sq.toString(), wrongs: [sq + n, sq - 1, n * (n + 1)].map(String) };
    },
  ];

  for (let lvl = 1; lvl <= TOTAL_LEVELS; lvl++) {
    const difficulty = Math.ceil(lvl / 4);
    let q: Question | null = null;
    let attempts = 0;
    while (!q && attempts < 50) {
      const tmpl = templates[Math.floor(Math.random() * templates.length)];
      const generated = tmpl(difficulty);
      if (!usedQuestions.has(generated.text)) {
        usedQuestions.add(generated.text);
        const allOptions = [generated.correct, ...generated.wrongs];
        // Shuffle
        for (let i = allOptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
        }
        q = {
          id: `q${lvl}`,
          text: generated.text,
          options: allOptions,
          correctIndex: allOptions.indexOf(generated.correct),
          difficulty,
        };
      }
      attempts++;
    }
    if (q) questions.push(q);
  }
  return questions;
}

const AptiRush = () => {
  const { currentStudent, updateStudentScore, submitGameResult, finishTest, currentTest, addCompletedGame, getNextGame } = useGame();
  const navigate = useNavigate();

  const questions = useMemo(() => generateQuestions(), []);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [finished, setFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { if (!currentStudent) navigate('/student'); }, [currentStudent, navigate]);
  useEffect(() => { if (currentTest?.status === 'FINISHED') navigate('/'); }, [currentTest?.status, navigate]);

  // Question timer
  useEffect(() => {
    if (finished || showResult) return;
    setTimeLeft(TIME_PER_QUESTION);
    timerRef.current = setInterval(() => {
      setElapsed(p => p + 1);
      setTimeLeft(prev => {
        if (prev <= 1) {
          setShowResult('timeout');
          setTimeout(() => advanceQuestion(), 1200);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentQ, finished, showResult]);

  const advanceQuestion = useCallback(() => {
    setShowResult(null);
    setSelected(null);
    if (currentQ + 1 >= TOTAL_LEVELS) {
      handleFinish();
    } else {
      setCurrentQ(p => p + 1);
    }
  }, [currentQ]);

  const handleAnswer = (idx: number) => {
    if (showResult || finished) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelected(idx);

    const question = questions[currentQ];
    if (idx === question.correctIndex) {
      const speedBonus = timeLeft >= 8 ? 5 : 0;
      setScore(p => p + 10 + speedBonus);
      setCorrectCount(p => p + 1);
      setShowResult('correct');
    } else {
      setShowResult('wrong');
    }
    setTimeout(() => advanceQuestion(), 1200);
  };

  const handleFinish = useCallback(() => {
    setFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    const completionBonus = correctCount >= 15 ? 50 : 0;
    const finalScore = score + completionBonus;
    setScore(finalScore);
    if (currentStudent && currentTest) {
      submitGameResult(currentStudent.username, {
        gameId: 'aptirush', score: finalScore, timeTaken: elapsed, correctAnswers: correctCount, totalQuestions: TOTAL_LEVELS, completedAt: Date.now()
      }).then(() => addCompletedGame('aptirush'));
    }
  }, [score, correctCount, currentStudent, currentTest, submitGameResult, addCompletedGame, elapsed]);

  const handlePostFinish = useCallback(() => {
    const nextGame = getNextGame();
    if (nextGame) navigate('/select-game');
    else { if (currentStudent) finishTest(currentStudent.username); navigate('/'); }
  }, [getNextGame, navigate, currentStudent, finishTest]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // Circular timer
  const timerRadius = 28;
  const timerCircumference = 2 * Math.PI * timerRadius;
  const timerOffset = timerCircumference * (1 - timeLeft / TIME_PER_QUESTION);
  const timerColor = timeLeft <= 3 ? '#EF4444' : timeLeft <= 5 ? '#F59E0B' : '#38BDF8';

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
            <h1 className="text-[32px] sm:text-[42px] font-black text-[#0F172A] tracking-tight leading-none mb-3">AptiRush Complete!</h1>
            <p className="text-[15px] text-[#64748B] mb-10 font-medium">Outstanding, {currentStudent?.username}!</p>
            <div className="bg-white/90 backdrop-blur-2xl border border-sky-100 rounded-[2.5rem] p-10 mb-10 shadow-[0_20px_60px_-15px_rgba(56,189,248,0.12)]">
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Score</span>
                  <span className="font-mono font-black text-2xl sm:text-3xl text-sky-500">{score}</span>
                </div>
                <div className="w-px h-12 bg-sky-100" />
                <div className="text-center">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Correct</span>
                  <span className="font-mono font-black text-2xl sm:text-3xl text-emerald-500">{correctCount}/{TOTAL_LEVELS}</span>
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

  const question = questions[currentQ];
  const progress = ((currentQ + 1) / TOTAL_LEVELS) * 100;

  return (
    <div className="flex flex-col flex-1 w-full bg-[#F0F7FF] font-sans min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#E0F2FE_0%,_#F0F9FF_40%,_#FFFFFF_100%)]" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#38BDF8] opacity-[0.05] blur-[120px] rounded-full" />
      </div>
      <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -top-[100px] sm:-top-[150px] -left-[10%] w-[120%] z-0 rotate-180 pointer-events-none" animate={true} />
      <div className="flex flex-col flex-1 items-center justify-center p-3 sm:p-4 relative z-10 w-full min-h-screen -mt-14 sm:-mt-16">
        <div className="w-full max-w-lg animate-fade-in relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 px-2 tracking-tight font-bold">
            <span className="text-[13px] text-[#64748B]">{currentStudent?.username}</span>
            {/* Circular Timer */}
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r={timerRadius} fill="none" stroke="#E0F2FE" strokeWidth="4" />
                <circle cx="32" cy="32" r={timerRadius} fill="none" stroke={timerColor} strokeWidth="4"
                  strokeDasharray={timerCircumference} strokeDashoffset={timerOffset}
                  strokeLinecap="round" className="transition-all duration-1000 ease-linear" />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center font-mono font-black text-[14px] ${timeLeft <= 3 ? 'text-red-500' : timeLeft <= 5 ? 'text-amber-500' : 'text-[#0F172A]'}`}>
                {timeLeft}
              </span>
            </div>
            <button onClick={() => handleFinish()} className="text-[11px] text-[#94A3B8] hover:text-[#0F172A] transition-colors px-3 py-1.5 rounded-xl hover:bg-white/80 border border-sky-100 font-bold uppercase tracking-widest flex items-center gap-1">
              <LogOut className="w-3 h-3" /> Exit
            </button>
          </div>

          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(56,189,248,0.10)] border border-sky-100 overflow-hidden">
            {/* Level & Score */}
            <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-4 border-b border-sky-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest leading-none">Level</span>
                  <span className="text-[#0F172A] text-2xl font-black">{currentQ + 1} / {TOTAL_LEVELS}</span>
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

            {/* Question */}
            <div className="p-6 sm:p-10">
              <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-6 mb-6 text-center">
                <p className="text-[18px] sm:text-[20px] font-black text-[#0F172A] leading-relaxed">{question?.text}</p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                {question?.options.map((opt, idx) => {
                  const isSelected = selected === idx;
                  const isCorrect = showResult && idx === question.correctIndex;
                  const isWrong = showResult === 'wrong' && isSelected;
                  return (
                    <button key={idx} onClick={() => handleAnswer(idx)} disabled={!!showResult}
                      className={`py-4 px-4 rounded-2xl font-bold text-[15px] transition-all duration-300 border-2
                        ${isCorrect ? 'bg-emerald-500 text-white border-emerald-400 scale-105 shadow-lg shadow-emerald-500/20' :
                          isWrong ? 'bg-red-500 text-white border-red-400 animate-shake' :
                            !showResult ? 'bg-white border-sky-100 text-[#0F172A] hover:border-sky-300 hover:shadow-[0_4px_16px_rgba(56,189,248,0.15)] active:scale-95' :
                              'bg-white/50 border-sky-50 text-[#94A3B8]'}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {showResult === 'timeout' && (
                <div className="mt-4 text-center">
                  <span className="text-[13px] font-bold text-amber-500">⏰ Time's up!</span>
                </div>
              )}
            </div>

            {/* Progress footer */}
            <div className="px-6 pb-8">
              <div className="flex items-center justify-between text-[12px] text-[#94A3B8] font-bold">
                <span>Correct: <span className="text-emerald-500">{correctCount}</span></span>
                <span>Score: <span className="text-sky-500">{score}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -bottom-[100px] -left-[10%] w-[120%] z-0 pointer-events-none" animate={true} />
    </div>
  );
};

export default AptiRush;
