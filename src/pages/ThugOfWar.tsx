import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Clock, Trophy, User, Bot, ArrowLeft, RotateCcw, Zap } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { getGameTimeLimit } from '@/utils/gameTimings';
import WaveBackground from "@/components/WaveBackground";

// Section 1: Numbers ending with 5
const generateEndingWith5 = () => {
  const num = Math.floor(Math.random() * 20) * 10 + 5;
  const answer = num * num;
  return {
    id: `${num}x${num}`,
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
    id: `${Math.min(a, b)}x${Math.max(a, b)}`,
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
    id: `${num}x${num}`,
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
    id: `${Math.min(num, mul)}x${Math.max(num, mul)}`,
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
  id: string;
  text: string;
  answer: number;
  options: number[];
}

const TOTAL_QUESTIONS = 40;
const HUMAN_WIN_SCORE = 20;
const AI_WIN_SCORE = 20;

const ThugOfWar = () => {
  const { currentStudent, updateStudentProgress, submitGameResult, addCompletedGame, getNextGame, finishTest, currentTest } = useGame();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<'user' | 'ai' | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const qs: Question[] = [];
    const seenIds = new Set<string>();
    
    while (qs.length < TOTAL_QUESTIONS) {
       const gen = generators[Math.floor(Math.random() * generators.length)];
       const q = gen();
       if (!seenIds.has(q.id)) {
          seenIds.add(q.id);
          qs.push(q);
       }
    }
    setQuestions(qs);
  }, []);

  useEffect(() => {
    if (isGameOver || showFeedback) return;

    const limit = getGameTimeLimit('thugofwar', currentIdx);
    setTimeLeft(limit);
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

  useEffect(() => {
    const onEndGame = () => endGame(userScore >= aiScore ? 'user' : 'ai', userScore, aiScore);
    window.addEventListener('endGame', onEndGame);
    return () => window.removeEventListener('endGame', onEndGame);
  }, [userScore, aiScore, endGame]);

  // Broadcast stats to global NavBar
  useEffect(() => {
    const stats = { 
      timeLeft, 
      score: `${userScore * 10} vs ${aiScore * 10}`,
      isThugOfWar: true,
      userScore: userScore * 10,
      aiScore: aiScore * 10,
      isFinished: isGameOver
    };
    window.dispatchEvent(new CustomEvent('gameStats', { detail: stats }));
    
    return () => {
      window.dispatchEvent(new CustomEvent('gameStats', { detail: null }));
    };
  }, [timeLeft, userScore, aiScore, isGameOver]);

  // Movement logic based on 19 hidden steps + 1 to touch (Total 20 steps to center)
  const SIDE_MARGIN = 8; // % from screen edge
  const STEP_SIZE = (50 - SIDE_MARGIN) / 20; 
  
  // Human moves right (towards center) when AI scores
  const humanX = SIDE_MARGIN + (aiScore * STEP_SIZE);
  // AI moves left (towards center) when Human scores
  const aiX = (100 - SIDE_MARGIN) - (userScore * STEP_SIZE);
  
  // Rope spans between them
  const ropeLeft = humanX;
  const ropeWidth = aiX - humanX;

  if (isGameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden">
        <WaveBackground />
        
        <div className="text-center animate-in fade-in zoom-in duration-500 max-w-md w-full z-10">
            <div className="w-24 h-24 rounded-[2.5rem] bg-white shadow-2xl shadow-sky-200 flex items-center justify-center mx-auto mb-8 border border-white/50 relative">
                <div className="absolute inset-0 bg-yellow-400/10 rounded-full blur-xl animate-pulse" />
                <Trophy className={`w-12 h-12 relative z-10 ${winner === 'user' ? 'text-yellow-500' : 'text-slate-400'}`} />
            </div>
            
            <h1 className="text-5xl font-black text-slate-900 mb-3 tracking-tight">
                {winner === 'user' ? 'Victory!' : 'AI Wins!'}
            </h1>
            <p className="text-slate-500 font-bold mb-10 text-lg">
                {winner === 'user' ? 'You were too strong for the AI!' : 'The AI pulled you over the line!'}
            </p>

            <div className="bg-white/60 backdrop-blur-xl rounded-[3rem] p-10 shadow-2xl shadow-sky-200/50 mb-12 border border-white relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-sky-300 to-sky-400 opacity-20" />
                <div className="flex justify-around items-center">
                    <div className="text-center group">
                        <p className="text-[11px] uppercase tracking-widest font-black text-slate-400 mb-2 group-hover:text-sky-500 transition-colors">Your Score</p>
                        <p className="text-4xl font-black text-sky-600 drop-shadow-sm">{userScore * 10}</p>
                    </div>
                    <div className="w-px h-12 bg-slate-200/50" />
                    <div className="text-center group">
                        <p className="text-[11px] uppercase tracking-widest font-black text-slate-400 mb-2 group-hover:text-rose-500 transition-colors">AI Score</p>
                        <p className="text-4xl font-black text-rose-500 drop-shadow-sm">{aiScore * 10}</p>
                    </div>
                </div>
            </div>

            <button
                onClick={handlePostFinish}
                className="w-full py-5 bg-sky-500 hover:bg-sky-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-sky-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] group flex items-center justify-center gap-3"
            >
                <span>{getNextGame() ? 'Next Challenge' : 'Finish Session'}</span>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Zap className="w-4 h-4 fill-white text-white" />
                </div>
            </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  return (
    <div className="flex flex-col flex-1 h-screen w-full font-sans relative overflow-hidden">
        <WaveBackground />
        {/* Tug of War Area - Compact */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 relative">
            {/* Center Line and Field Graphics */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Horizontal Path */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200/50" />
                
                {/* 19 Hidden Step Markers (Visual Guide) */}
                <div className="absolute top-1/2 left-0 right-0 flex justify-between px-[8%] -translate-y-1/2 opacity-10">
                    {Array.from({ length: 41 }).map((_, i) => (
                        <div key={i} className={`w-0.5 h-3 ${i === 20 ? 'h-10 w-1 bg-sky-500 opacity-100' : 'bg-slate-400'}`} />
                    ))}
                </div>

                {/* Main Center Line */}
                <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-gradient-to-b from-transparent via-sky-500/40 to-transparent z-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-sky-400/20 z-0" />
            </div>

            {/* Players and Rope */}
            <div className="w-full relative h-64 flex items-center">
                {/* The Rope */}
                <div 
                    className="absolute h-2.5 bg-gradient-to-r from-sky-400 via-amber-200 to-rose-400 rounded-full shadow-lg z-0 transition-all duration-700 ease-out"
                    style={{ left: `${ropeLeft}%`, width: `${ropeWidth}%` }}
                >
                    {/* Center Point of the Rope (Knot/Indicator) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-xl z-10" />
                </div>

                {/* Human Player */}
                <div 
                    className="absolute transition-all duration-700 ease-out z-10"
                    style={{ left: `${humanX}%`, transform: 'translateX(-50%)' }}
                >
                    <div className="flex flex-col items-center">
                        <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-[2.5rem] shadow-2xl flex items-center justify-center animate-bounce-subtle
                            ${aiScore >= 15 ? 'bg-amber-500 shadow-amber-300' : 'bg-sky-500 shadow-sky-300'}`}>
                             <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                        </div>
                        <div className="mt-4 px-4 py-1.5 bg-white/90 backdrop-blur-sm rounded-2xl text-[14px] font-black text-sky-700 shadow-xl border border-white">
                            {userScore * 10}
                        </div>
                    </div>
                </div>

                {/* AI Player */}
                <div 
                    className="absolute transition-all duration-700 ease-out z-10"
                    style={{ left: `${aiX}%`, transform: 'translateX(-50%)' }}
                >
                    <div className="flex flex-col items-center">
                        <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-[2.5rem] shadow-2xl flex items-center justify-center animate-bounce-subtle-delayed
                            ${userScore >= 15 ? 'bg-amber-500 shadow-amber-300' : 'bg-rose-500 shadow-rose-300'}`}>
                             <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                        </div>
                        <div className="mt-4 px-4 py-1.5 bg-white/90 backdrop-blur-sm rounded-2xl text-[14px] font-black text-rose-700 shadow-xl border border-white">
                            {aiScore * 10}
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-lg z-10 mt-2">
                <div className="bg-white rounded-[2.5rem] p-4 sm:p-6 shadow-xl shadow-slate-200/50 border border-slate-100 text-center animate-in slide-in-from-bottom-4 duration-500">
                    <p className="text-[12px] uppercase tracking-[0.2em] font-black text-slate-400 mb-4">Question {currentIdx + 1} of {TOTAL_QUESTIONS}</p>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">
                        {currentQuestion?.text}
                    </h2>

                        <div className="grid grid-cols-2 gap-3">
                            {currentQuestion?.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(option)}
                                    disabled={!!showFeedback}
                                    className={`
                                        group relative py-4 px-4 rounded-2xl font-black text-xl transition-all duration-200
                                        ${showFeedback ? (
                                            option === currentQuestion.answer 
                                                ? 'bg-emerald-500 text-white shadow-emerald-200 border-emerald-400' 
                                                : selectedOption === option 
                                                    ? 'bg-rose-500 text-white border-rose-400' 
                                                    : 'bg-slate-50 text-slate-300 border-slate-100'
                                        ) : (
                                            'bg-white text-slate-700 border-2 border-slate-100 hover:border-sky-400 hover:text-sky-600 active:scale-95'
                                        )}
                                    `}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                </div>
            </div>

            {/* Win Trackers - Integrated and Centered */}
            <div className="w-full max-w-2xl mt-8 flex items-center justify-between px-8 py-4 bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/20">
                <div className="flex flex-col items-start gap-2">
                    <span className="text-[10px] font-black text-sky-700 uppercase tracking-widest pl-1">Your Wins</span>
                    <div className="flex gap-1 flex-wrap max-w-[200px] sm:max-w-none">
                        {Array.from({ length: HUMAN_WIN_SCORE }).map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i < userScore ? 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]' : 'bg-white/50'}`} />
                        ))}
                    </div>
                </div>
                
                <div className="flex flex-col items-end gap-2 text-right">
                    <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest pr-1">AI Wins</span>
                    <div className="flex gap-1 flex-wrap flex-row-reverse max-w-[200px] sm:max-w-none">
                        {Array.from({ length: AI_WIN_SCORE }).map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i < aiScore ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-white/50'}`} />
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
