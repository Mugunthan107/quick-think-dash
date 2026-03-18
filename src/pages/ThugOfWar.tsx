import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Clock, Trophy, User, Bot, ArrowLeft, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

// Section 1: Numbers ending with 5
const generateEndingWith5 = () => {
  const num = Math.floor(Math.random() * 20) * 10 + 5;
  const answer = num * num;
  return {
    text: `${num}² = ?`,
    answer: answer,
    options: generateOptions(answer)
  };
};

// Section 2: Last totaling to 10 (e.g., 42 * 48)
const generateTotal10 = () => {
  const tens = Math.floor(Math.random() * 9) + 1;
  const unit1 = Math.floor(Math.random() * 9) + 1;
  const unit2 = 10 - unit1;
  const a = tens * 10 + unit1;
  const b = tens * 10 + unit2;
  const answer = a * b;
  return {
    text: `${a} × ${b} = ?`,
    answer: answer,
    options: generateOptions(answer)
  };
};

// Section 3: Squaring 2-digit numbers
const generateSquares = () => {
  const num = Math.floor(Math.random() * 90) + 10;
  const answer = num * num;
  return {
    text: `${num}² = ?`,
    answer: answer,
    options: generateOptions(answer)
  };
};

// Section 4: Multiply by 9, 99, 999...
const generateNines = () => {
  const multipliers = [9, 99, 999, 9999];
  const num = Math.floor(Math.random() * 999) + 11;
  const mul = multipliers[Math.floor(Math.random() * multipliers.length)];
  const answer = num * mul;
  return {
    text: `${num} × ${mul} = ?`,
    answer: answer,
    options: generateOptions(answer)
  };
};

const generateOptions = (correct: number) => {
  const options = new Set<number>();
  options.add(correct);
  while (options.size < 4) {
    const offset = (Math.floor(Math.random() * 20) - 10) * (Math.random() > 0.5 ? 1 : 10);
    const wrong = correct + (offset === 0 ? 5 : offset);
    if (wrong > 0) options.add(wrong);
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
};

const generators = [
  generateEndingWith5,
  generateTotal10,
  generateSquares,
  generateNines
];

interface Question {
  text: string;
  answer: number;
  options: number[];
}

const TOTAL_QUESTIONS = 40;
const HUMAN_WIN_SCORE = 20;
const AI_WIN_SCORE = 20;
const TIME_LIMIT = 10;

const ThugOfWar = () => {
  const { currentStudent, updateStudentProgress, submitGameResult, addCompletedGame, getNextGame, finishTest, currentTest } = useGame();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<'user' | 'ai' | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const qs = Array.from({ length: TOTAL_QUESTIONS }, () => {
      const gen = generators[Math.floor(Math.random() * generators.length)];
      return gen();
    });
    setQuestions(qs);
  }, []);

  useEffect(() => {
    if (isGameOver || showFeedback) return;

    setTimeLeft(TIME_LIMIT);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
      setElapsed(p => p + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIdx, isGameOver, showFeedback]);

  const handleTimeout = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowFeedback('timeout');
    setAiScore(s => s + 1);
    toast.error("Time's up! AI pulled the rope!", { icon: '🤖' });
    checkGameStatus(userScore, aiScore + 1);
  };

  const handleAnswer = (option: number) => {
    if (isGameOver || showFeedback) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOption(option);
    const correct = questions[currentIdx].answer;

    if (option === correct) {
      setShowFeedback('correct');
      setUserScore(s => s + 1);
      toast.success("Correct! You pulled the rope!", { icon: '💪' });
      checkGameStatus(userScore + 1, aiScore);
    } else {
      setShowFeedback('wrong');
      setAiScore(s => s + 1);
      toast.error("Wrong! AI pulled the rope!", { icon: '🤖' });
      checkGameStatus(userScore, aiScore + 1);
    }
  };

  const checkGameStatus = (uScore: number, aScore: number) => {
    if (uScore >= HUMAN_WIN_SCORE) {
      setTimeout(() => endGame('user', uScore, aScore), 1000);
    } else if (aScore >= AI_WIN_SCORE) {
      setTimeout(() => endGame('ai', uScore, aScore), 1000);
    } else if (currentIdx + 1 >= TOTAL_QUESTIONS) {
      setTimeout(() => endGame(uScore >= aScore ? 'user' : 'ai', uScore, aScore), 1000);
    } else {
      setTimeout(() => {
        setShowFeedback(null);
        setSelectedOption(null);
        setCurrentIdx(i => i + 1);
      }, 1500);
    }

    if (currentStudent) {
       updateStudentProgress(currentStudent.username, (uScore * 10), currentIdx + 1, uScore, TOTAL_QUESTIONS, 'thugofwar');
    }
  };

  const endGame = useCallback((win: 'user' | 'ai', finalUScore: number, finalAScore: number) => {
    setIsGameOver(true);
    setWinner(win);
    if (timerRef.current) clearInterval(timerRef.current);

    if (win === 'user') {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }

    if (currentStudent && currentTest) {
      submitGameResult(currentStudent.username, {
        gameId: 'thugofwar',
        score: finalUScore * 10,
        timeTaken: elapsed,
        correctAnswers: finalUScore,
        totalQuestions: TOTAL_QUESTIONS,
        completedAt: Date.now()
      }).then(() => {
        addCompletedGame('thugofwar');
      });
    }
  }, [currentIdx, currentStudent, currentTest, elapsed, submitGameResult, addCompletedGame]);

  const handlePostFinish = () => {
    const nextGame = getNextGame();
    if (nextGame) navigate('/select-game');
    else {
      if (currentStudent) finishTest(currentStudent.username);
      navigate('/');
    }
  };

  // Rope Position Logic
  // Both need 20 to win. Max difference is 20.
  // Player boxes are offset by ±15%. To reach exactly 0% or 100% on the screen at 20 points difference:
  // 20 * multiplier = 35 => multiplier = 1.75
  const scoreDiff = userScore - aiScore;
  const ropePos = 50 - (scoreDiff * 1.75); 
  // Clamp it to prevent bounds overflow
  const clampedRopePos = Math.max(15, Math.min(85, ropePos));

  if (isGameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-sky-50 to-white">
        <div className="text-center animate-in fade-in zoom-in duration-500 max-w-md w-full">
            <div className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center mx-auto mb-6">
                <Trophy className={`w-12 h-12 ${winner === 'user' ? 'text-yellow-500' : 'text-gray-400'}`} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">
                {winner === 'user' ? 'Victory!' : 'AI Wins!'}
            </h1>
            <p className="text-slate-500 font-medium mb-8">
                {winner === 'user' ? 'You were too strong for the AI!' : 'The AI pulled you over the line!'}
            </p>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-sky-200/50 mb-10">
                <div className="flex justify-around items-center">
                    <div className="text-center">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Your Score</p>
                        <p className="text-3xl font-black text-sky-500">{userScore * 10}</p>
                    </div>
                    <div className="w-px h-10 bg-slate-100" />
                    <div className="text-center">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">AI Score</p>
                        <p className="text-3xl font-black text-rose-500">{aiScore * 10}</p>
                    </div>
                </div>
            </div>

            <button
                onClick={handlePostFinish}
                className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-bold shadow-lg shadow-sky-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
                {getNextGame() ? 'Next Game →' : 'Finish Session'}
            </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  return (
    <div className="flex flex-col flex-1 h-screen w-full bg-[#f8fafc] font-sans relative overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20">
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
                <User className="w-5 h-5 text-sky-500" />
                <span className="font-bold text-slate-700">{currentStudent?.username || 'Player'}</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
                    <Clock className={`w-5 h-5 ${timeLeft <= 3 ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`} />
                    <span className={`font-mono font-bold text-xl ${timeLeft <= 3 ? 'text-rose-500' : 'text-slate-700'}`}>
                        {timeLeft}s
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3 bg-white/80 backdrop-blur px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
                <Bot className="w-5 h-5 text-rose-500" />
                <span className="font-bold text-slate-700">AI Bot</span>
            </div>
        </div>

        {/* Tug of War Area */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 relative">
            {/* Field Graphics */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-300" />
                <div className="absolute top-0 bottom-0 left-1/2 w-1 border-r-2 border-dashed border-slate-400" />
            </div>

            {/* Players and Rope */}
            <div className="w-full max-w-5xl relative h-64 flex items-center">
                {/* Human Player */}
                <div 
                    className="absolute transition-all duration-700 ease-out z-10"
                    style={{ left: `${clampedRopePos - 15}%` }}
                >
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-sky-500 rounded-2xl shadow-lg shadow-sky-200 flex items-center justify-center animate-bounce-subtle">
                             <User className="w-10 h-10 text-white" />
                        </div>
                        <div className="mt-3 px-3 py-1 bg-white rounded-full text-xs font-bold text-sky-600 shadow-sm border border-sky-100">
                            SCORE: {userScore * 10}
                        </div>
                    </div>
                </div>

                {/* The Rope */}
                <div className="absolute left-0 right-0 h-3 bg-gradient-to-r from-sky-400 via-amber-200 to-rose-400 rounded-full shadow-inner z-0 overflow-hidden">
                    <div 
                        className="absolute h-full w-4 bg-white shadow-md z-10 transition-all duration-700 ease-out"
                        style={{ left: `${clampedRopePos}%`, transform: 'translateX(-50%)' }}
                    >
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-sky-500" />
                    </div>
                </div>

                {/* AI Player */}
                <div 
                    className="absolute transition-all duration-700 ease-out z-10"
                    style={{ left: `${clampedRopePos + 15}%` }}
                >
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-rose-500 rounded-2xl shadow-lg shadow-rose-200 flex items-center justify-center animate-bounce-subtle-delayed">
                             <Bot className="w-10 h-10 text-white" />
                        </div>
                        <div className="mt-3 px-3 py-1 bg-white rounded-full text-xs font-bold text-rose-600 shadow-sm border border-rose-100">
                            SCORE: {aiScore * 10}
                        </div>
                    </div>
                </div>
                
                {/* Win markers */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-200 flex items-center justify-center">
                   <div className="rotate-90 text-[10px] font-black text-sky-400 uppercase tracking-widest">AI LOSS</div>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-rose-200 flex items-center justify-center">
                   <div className="-rotate-90 text-[10px] font-black text-rose-400 uppercase tracking-widest">USER LOSS</div>
                </div>
            </div>

            {/* Question Display */}
            <div className="mt-8 w-full max-w-xl">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 text-center animate-in slide-in-from-bottom-4 duration-500">
                    <p className="text-[12px] uppercase tracking-[0.2em] font-black text-slate-400 mb-4">Question {currentIdx + 1} of {TOTAL_QUESTIONS}</p>
                    <h2 className="text-5xl font-black text-slate-900 mb-8 tracking-tighter">
                        {currentQuestion?.text}
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        {currentQuestion?.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(option)}
                                disabled={!!showFeedback}
                                className={`
                                    group relative py-6 px-4 rounded-[1.5rem] font-black text-2xl transition-all duration-200
                                    ${showFeedback ? (
                                        option === currentQuestion.answer 
                                            ? 'bg-emerald-500 text-white shadow-emerald-200 border-emerald-400' 
                                            : selectedOption === option 
                                                ? 'bg-rose-500 text-white border-rose-400' 
                                                : 'bg-slate-50 text-slate-300 border-slate-100'
                                    ) : (
                                        'bg-white text-slate-700 border-2 border-slate-100 hover:border-sky-400 hover:text-sky-600 hover:shadow-xl hover:shadow-sky-100 hover:-translate-y-1 active:scale-95'
                                    )}
                                `}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="p-6 bg-white border-t border-slate-100">
            <div className="max-w-xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        {Array.from({ length: HUMAN_WIN_SCORE }).map((_, i) => (
                            <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${i < userScore ? 'bg-sky-500' : 'bg-slate-100'}`} />
                        ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">Progress To Win</span>
                </div>
                
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase mr-2">AI Strength</span>
                    <div className="flex gap-1">
                        {Array.from({ length: AI_WIN_SCORE }).map((_, i) => (
                            <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${i < aiScore ? 'bg-rose-500' : 'bg-slate-100'}`} />
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <style>{`
            @keyframes bounce-subtle {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            @keyframes bounce-subtle-delayed {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
            }
            .animate-bounce-subtle {
                animation: bounce-subtle 3s ease-in-out infinite;
            }
            .animate-bounce-subtle-delayed {
                animation: bounce-subtle-delayed 3.5s ease-in-out infinite;
                animation-delay: 0.5s;
            }
        `}</style>
    </div>
  );
};

export default ThugOfWar;
