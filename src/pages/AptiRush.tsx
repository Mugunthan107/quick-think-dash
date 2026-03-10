import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Clock, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const SUCCESS_MESSAGES = [
  "Hurray! You're brilliant! 🌟",
  "Awesome! Keep it up! 💪",
  "Stellar work! 🚀",
  "You're a genius! 🧠",
  "Perfecto! 🎯",
  "Magnificent! ✨",
  "Incredible! 🏆",
];

const OOPS_MESSAGES = [
  "Oops! Don't worry, try again! 😊",
  "Not quite, but you're getting closer! 🔄",
  "Keep pushing! You've got this! ✨",
  "Almost there! One more shot! 🎯",
  "Mistakes are just steps to learning! 📚",
  "Shake it off and try again! 🍀",
];
import DecorativeCurve from '@/components/DecorativeCurve';

const TOTAL_LEVELS = 20;
const TIME_PER_QUESTION = 10; // seconds

interface Question {
  id: string;
  topic: string;
  text: string;
  options: string[];
  correctIndex: number;
  difficulty: number;
}

const ALL_QUESTIONS: Question[] = [
  { id: "q1", topic: "divisibility", text: "What least digit replaces # so that 279#4423 is divisible by 9?", options: ["7", "3", "1", "5"], correctIndex: 3, difficulty: 1 },
  { id: "q2", topic: "divisibility", text: "2185 is a multiple of which number?", options: ["23", "21", "17", "25"], correctIndex: 0, difficulty: 1 },
  { id: "q3", topic: "subtraction", text: "892.7 minus 573.07 minus 95.007 equals?", options: ["233.523", "224.623", "224.777", "414.637"], correctIndex: 1, difficulty: 1 },
  { id: "q4", topic: "fraction", text: "4.004 written as a fraction in lowest form equals?", options: ["1001/250", "1001/200", "4004/1000", "2001/500"], correctIndex: 0, difficulty: 1 },
  { id: "q5", topic: "fraction", text: "0.55 repeating written as a fraction equals?", options: ["5/9", "1/11", "11/20", "1/2"], correctIndex: 0, difficulty: 1 },
  { id: "q6", topic: "addition", text: "A boy has 15 marbles and finds 10 more. How many marbles does he have now?", options: ["20", "25", "30", "35"], correctIndex: 1, difficulty: 1 },
  { id: "q7", topic: "subtraction", text: "A boy had 40 candies and gave 15 away. How many remain?", options: ["20", "25", "30", "35"], correctIndex: 1, difficulty: 1 },
  { id: "q8", topic: "multiplication", text: "A farmer has 7 rows of plants and each row has 6 plants. Total plants?", options: ["36", "40", "42", "48"], correctIndex: 2, difficulty: 1 },
  { id: "q9", topic: "division", text: "A teacher distributes 24 chocolates equally among 6 students. Each student gets?", options: ["3", "4", "5", "6"], correctIndex: 1, difficulty: 1 },
  { id: "q10", topic: "division", text: "40 apples packed equally into 5 baskets. Apples per basket?", options: ["6", "7", "8", "9"], correctIndex: 2, difficulty: 1 },
  { id: "q11", topic: "square", text: "What is the square of 20?", options: ["400", "380", "420", "440"], correctIndex: 0, difficulty: 1 },
  { id: "q12", topic: "square", text: "What is the square of 22?", options: ["462", "484", "474", "494"], correctIndex: 1, difficulty: 1 },
  { id: "q13", topic: "square", text: "What is the square of 25?", options: ["575", "625", "650", "600"], correctIndex: 1, difficulty: 1 },
  { id: "q14", topic: "square", text: "What is the square of 27?", options: ["719", "729", "739", "749"], correctIndex: 1, difficulty: 1 },
  { id: "q15", topic: "square", text: "What is the square of 30?", options: ["800", "900", "1000", "950"], correctIndex: 1, difficulty: 1 },
  { id: "q16", topic: "square_root", text: "What is the square root of 144?", options: ["10", "11", "12", "13"], correctIndex: 2, difficulty: 1 },
  { id: "q17", topic: "square_root", text: "What is the square root of 169?", options: ["12", "13", "14", "15"], correctIndex: 1, difficulty: 1 },
  { id: "q18", topic: "square_root", text: "What is the square root of 225?", options: ["13", "14", "15", "16"], correctIndex: 2, difficulty: 1 },
  { id: "q19", topic: "square_root", text: "What is the square root of 256?", options: ["14", "15", "16", "18"], correctIndex: 2, difficulty: 1 },
  { id: "q20", topic: "cube_root", text: "What is the cube root of 27?", options: ["2", "3", "4", "5"], correctIndex: 1, difficulty: 1 },
  { id: "q21", topic: "cube_root", text: "What is the cube root of 64?", options: ["3", "4", "5", "6"], correctIndex: 1, difficulty: 1 },
  { id: "q22", topic: "cube_root", text: "What is the cube root of 125?", options: ["4", "5", "6", "7"], correctIndex: 1, difficulty: 1 },
  { id: "q23", topic: "cube_root", text: "What is the cube root of 216?", options: ["4", "5", "6", "7"], correctIndex: 2, difficulty: 1 },
  { id: "q24", topic: "cube_root", text: "What is the cube root of 343?", options: ["5", "6", "7", "8"], correctIndex: 2, difficulty: 1 },
  { id: "q25", topic: "fraction", text: "A cake has 8 pieces. If a boy eats half, how many pieces did he eat?", options: ["3", "4", "5", "6"], correctIndex: 1, difficulty: 1 },
  { id: "q26", topic: "fraction", text: "A pizza has 6 slices. If you eat one third, how many slices?", options: ["1", "2", "3", "4"], correctIndex: 1, difficulty: 1 },
  { id: "q27", topic: "fraction", text: "A chocolate has 10 pieces. If you eat one fifth, how many pieces?", options: ["1", "2", "3", "4"], correctIndex: 1, difficulty: 1 },
  { id: "q28", topic: "unit_digit", text: "What is the unit digit of 9 multiplied by 9?", options: ["1", "9", "8", "7"], correctIndex: 0, difficulty: 1 },
  { id: "q29", topic: "unit_digit", text: "What is the unit digit of 12 multiplied by 12?", options: ["4", "2", "6", "8"], correctIndex: 0, difficulty: 1 },
  { id: "q30", topic: "unit_digit", text: "What is the unit digit of 8 multiplied by 8?", options: ["2", "4", "6", "8"], correctIndex: 1, difficulty: 1 },
  { id: "q31", topic: "addition", text: "A library has 30 books on one shelf and 20 on another. Total books?", options: ["40", "45", "50", "55"], correctIndex: 2, difficulty: 1 },
  { id: "q32", topic: "addition", text: "A shop sells 18 apples in the morning and 12 in the evening. How many apples were sold?", options: ["25", "30", "35", "40"], correctIndex: 1, difficulty: 1 },
  { id: "q33", topic: "multiplication", text: "A classroom has 4 rows each with 8 students. Total students?", options: ["24", "28", "32", "36"], correctIndex: 2, difficulty: 1 },
  { id: "q34", topic: "multiplication", text: "A shopkeeper has 5 boxes each containing 10 chocolates. Total chocolates?", options: ["40", "50", "60", "70"], correctIndex: 1, difficulty: 1 },
  { id: "q35", topic: "division", text: "If 3 pencils cost 15 rupees, what is the cost of one pencil?", options: ["3", "4", "5", "6"], correctIndex: 2, difficulty: 1 },
  { id: "q36", topic: "division", text: "If 5 friends share 20 chocolates equally, how many chocolates does each get?", options: ["3", "4", "5", "6"], correctIndex: 1, difficulty: 1 },
  { id: "q37", topic: "subtraction", text: "A boy has 30 rupees and spends 10 rupees. Money left?", options: ["15", "20", "25", "30"], correctIndex: 1, difficulty: 1 },
  { id: "q38", topic: "multiplication", text: "A farmer plants 4 rows of trees and each row has 7 trees. Total trees?", options: ["24", "26", "28", "30"], correctIndex: 2, difficulty: 1 },
  { id: "q39", topic: "multiplication", text: "A train travels 60 km in one hour. Distance in 2 hours?", options: ["100", "110", "120", "130"], correctIndex: 2, difficulty: 1 },
  { id: "q40", topic: "multiplication", text: "A shop sells 10 chocolates each day for 5 days. Total chocolates sold?", options: ["40", "45", "50", "60"], correctIndex: 2, difficulty: 1 },
  { id: "q41", topic: "division", text: "A basket contains 36 apples divided into 6 baskets. Apples per basket?", options: ["5", "6", "7", "8"], correctIndex: 1, difficulty: 1 },
  { id: "q42", topic: "addition", text: "A boy saves 10 rupees every day for 5 days. Total savings?", options: ["40", "50", "60", "70"], correctIndex: 1, difficulty: 1 },
  { id: "q43", topic: "multiplication", text: "A pack contains 8 chocolates and you buy 3 packs. Total chocolates?", options: ["18", "24", "30", "32"], correctIndex: 1, difficulty: 1 },
  { id: "q44", topic: "division", text: "24 students are divided equally into 6 groups. Students per group?", options: ["3", "4", "5", "6"], correctIndex: 1, difficulty: 1 },
  { id: "q45", topic: "subtraction", text: "A shop had 90 pencils and sold 40. How many remain?", options: ["40", "50", "60", "70"], correctIndex: 1, difficulty: 1 },
  { id: "q46", topic: "addition", text: "A boy scored 40 marks in math and 35 in science. Total marks?", options: ["70", "75", "80", "85"], correctIndex: 1, difficulty: 1 },
  { id: "q47", topic: "multiplication", text: "5 packets contain 6 biscuits each. Total biscuits?", options: ["25", "30", "35", "40"], correctIndex: 1, difficulty: 1 },
  { id: "q48", topic: "division", text: "60 candies shared equally among 10 children. Each child gets?", options: ["5", "6", "7", "8"], correctIndex: 1, difficulty: 1 },
  { id: "q49", topic: "square_root", text: "What is the square root of 100?", options: ["8", "9", "10", "11"], correctIndex: 2, difficulty: 1 },
  { id: "q50", topic: "cube_root", text: "What is the cube root of 8?", options: ["1", "2", "3", "4"], correctIndex: 1, difficulty: 1 },
  { id: "q51", topic: "average", text: "The average of 3 numbers is 17 and that of the first two is 16. Find the third number.", options: ["17", "18", "19", "20"], correctIndex: 2, difficulty: 1 },
  { id: "q52", topic: "average", text: "The average of 4 numbers is 20. What is their total sum?", options: ["60", "70", "80", "90"], correctIndex: 2, difficulty: 1 },
  { id: "q53", topic: "average", text: "The average of two numbers is 15. If one number is 12, what is the other number?", options: ["15", "16", "17", "18"], correctIndex: 3, difficulty: 1 },
  { id: "q54", topic: "average", text: "The average of 5 numbers is 10. If four numbers are 8, 9, 11 and 12, find the fifth number.", options: ["8", "9", "10", "11"], correctIndex: 2, difficulty: 1 },
  { id: "q55", topic: "logic", text: "A father is 40 years old and his son is 10 years old. After how many years will the father be twice the age of the son?", options: ["10", "15", "20", "25"], correctIndex: 2, difficulty: 1 },
  { id: "q56", topic: "fraction", text: "Half of a number is 25. What is the number?", options: ["40", "45", "50", "55"], correctIndex: 2, difficulty: 1 },
  { id: "q57", topic: "percentage", text: "10 percent of a number is 20. What is the number?", options: ["100", "150", "200", "250"], correctIndex: 2, difficulty: 1 },
  { id: "q58", topic: "multiplication", text: "A shop sells 12 notebooks per day. How many notebooks are sold in 5 days?", options: ["50", "60", "70", "80"], correctIndex: 1, difficulty: 1 },
  { id: "q59", topic: "division", text: "48 chocolates are shared equally among 8 children. How many chocolates does each child get?", options: ["5", "6", "7", "8"], correctIndex: 1, difficulty: 1 },
  { id: "q60", topic: "logic", text: "If one book costs 20 rupees, how much will 6 books cost?", options: ["100", "110", "120", "130"], correctIndex: 2, difficulty: 1 }
];

function generateQuestions(): Question[] {
  // Group by topic
  const byTopic: Record<string, Question[]> = {};
  ALL_QUESTIONS.forEach(q => {
    if (!byTopic[q.topic]) byTopic[q.topic] = [];
    byTopic[q.topic].push(q);
  });

  const selected: Question[] = [];
  const usedIds = new Set<string>();

  // 1. Pick one from each topic (guarantees at least one from each)
  Object.keys(byTopic).forEach(topic => {
    const list = byTopic[topic];
    const picked = list[Math.floor(Math.random() * list.length)];
    selected.push(picked);
    usedIds.add(picked.id);
  });

  // 2. Pick remaining from the rest of the pool
  const remainingPool = ALL_QUESTIONS.filter(q => !usedIds.has(q.id));
  const shuffledPool = remainingPool.sort(() => Math.random() - 0.5);

  const needed = TOTAL_LEVELS - selected.length;
  for (let i = 0; i < needed && i < shuffledPool.length; i++) {
    selected.push(shuffledPool[i]);
  }

  // Shuffle the final 20 and their options
  return selected.sort(() => Math.random() - 0.5).map(q => {
    const correctVal = q.options[q.correctIndex];
    const shuffledOpts = [...q.options].sort(() => Math.random() - 0.5);
    return {
      ...q,
      options: shuffledOpts,
      correctIndex: shuffledOpts.indexOf(correctVal)
    };
  });
}

const AptiRush = () => {
  const { currentStudent, updateStudentProgress, submitGameResult, finishTest, currentTest, addCompletedGame, getNextGame } = useGame();
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

  const isSubmitting = useRef(false);

  const advanceQuestion = useCallback(() => {
    setShowResult(null);
    setSelected(null);
    isSubmitting.current = false;
    if (currentQ + 1 >= TOTAL_LEVELS) {
      handleFinish();
    } else {
      setCurrentQ(p => p + 1);
    }
  }, [currentQ]);

  const handleAnswer = (idx: number) => {
    if (showResult || finished || isSubmitting.current) return;
    isSubmitting.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelected(idx);

    const question = questions[currentQ];
    let newScore = score;
    let newCorrect = correctCount;

    if (idx === question.correctIndex) {
      newScore = score + 10;
      newCorrect = correctCount + 1;
      setScore(newScore);
      setCorrectCount(newCorrect);
      setShowResult('correct');
      if (currentTest?.showResults !== false) {
        toast.success(SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)], { icon: '🎓' });
      }
    } else {
      setShowResult('wrong');
      if (currentTest?.showResults !== false) {
        toast.error(OOPS_MESSAGES[Math.floor(Math.random() * OOPS_MESSAGES.length)], { icon: '🤔' });
      }
    }

    if (currentStudent) {
      updateStudentProgress(currentStudent.username, newScore, currentQ + 1, newCorrect, TOTAL_LEVELS, 'aptirush');
    }

    setTimeout(() => advanceQuestion(), 1200);
  };

  const handleFinish = useCallback(() => {
    setFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    const finalScore = score;
    if (currentStudent && currentTest) {
      submitGameResult(currentStudent.username, {
        gameId: 'aptirush', score: finalScore, timeTaken: elapsed, correctAnswers: correctCount, totalQuestions: TOTAL_LEVELS, completedAt: Date.now()
      }).then(() => {
        addCompletedGame('aptirush');
        confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
      });
    }
  }, [score, correctCount, currentStudent, currentTest, submitGameResult, addCompletedGame, elapsed]);

  const handlePostFinish = useCallback(() => {
    const nextGame = getNextGame();
    if (nextGame) navigate('/select-game');
    else { if (currentStudent) finishTest(currentStudent.username); navigate('/'); }
  }, [getNextGame, navigate, currentStudent, finishTest]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // Circular timer
  const timerRadius = 24;
  const timerCircumference = 2 * Math.PI * timerRadius;
  const timerOffset = timerCircumference * (1 - timeLeft / TIME_PER_QUESTION);
  const timerColor = timeLeft <= 3 ? '#EF4444' : timeLeft <= 5 ? '#F59E0B' : '#38BDF8';

  if (finished) {
    return (
      <div className="flex flex-col flex-1 w-full bg-transparent font-sans min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-transparent" />
        </div>
        <div className="flex items-center justify-center p-4 relative z-10 w-full min-h-screen">
          <div className="text-center animate-fade-in max-w-md w-full px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-sky-100 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-sky-200/40">
              <Trophy className="w-10 h-10 text-sky-500" />
            </div>
            <h1 className="text-[32px] sm:text-[42px] font-black text-[#0F172A] tracking-tight leading-none mb-3">AptiRush Complete!</h1>
            <p className="text-[15px] text-[#64748B] mb-10 font-medium tracking-tight">Magnificent performance, {currentStudent?.username}!</p>

            <div className="bg-white/90 backdrop-blur-2xl border border-sky-100 rounded-[2.5rem] p-10 mb-10 shadow-[0_20px_60px_-15px_rgba(56,189,248,0.12)]">
              <div className="flex items-center justify-center gap-6 sm:gap-10">
                <div className="text-center">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Score</span>
                  <span className="font-mono font-black text-2xl sm:text-3xl text-sky-500">{currentTest?.showResults !== false ? score : '---'}</span>
                </div>
                <div className="w-px h-14 bg-sky-100" />
                <div className="text-center">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Correct</span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-mono font-black text-2xl sm:text-3xl text-emerald-500">{currentTest?.showResults !== false ? correctCount : '---'}</span>
                    <span className="text-sm text-[#94A3B8] font-bold">/ {TOTAL_LEVELS}</span>
                  </div>
                </div>
                <div className="w-px h-14 bg-sky-100" />
                <div className="text-center">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">Time</span>
                  <span className="font-mono font-black text-2xl sm:text-3xl text-[#1E293B]">{formatTime(elapsed)}</span>
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
      </div>
    );
  }

  const question = questions[currentQ];
  const progress = ((currentQ + 1) / TOTAL_LEVELS) * 100;

  return (
    <div className={`flex flex-col flex-1 w-full bg-transparent font-sans min-h-screen relative overflow-hidden ${showResult === 'correct' ? 'flash-correct' : (showResult === 'wrong' || showResult === 'timeout') ? 'flash-wrong' : ''}`}>
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-transparent" />
      </div>
      <div className="flex flex-col flex-1 items-center justify-center p-3 sm:p-4 relative z-10 w-full min-h-screen">
        <div className="w-full max-w-lg animate-fade-in relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 px-2 tracking-tight font-bold">
            <span className="text-[13px] text-[#64748B]">{currentStudent?.username}</span>
            {/* Circular Timer */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r={timerRadius} fill="none" stroke="#E0F2FE" strokeWidth="3" />
                <circle cx="32" cy="32" r={timerRadius} fill="none" stroke={timerColor} strokeWidth="3.5"
                  strokeDasharray={timerCircumference} strokeDashoffset={timerOffset}
                  strokeLinecap="round" className="transition-all duration-1000 linear" />
              </svg>
              <span className={`text-[15px] font-black font-mono transition-colors duration-300 ${timeLeft <= 3 ? 'text-red-500' : 'text-sky-500'}`}>
                {timeLeft}
              </span>
            </div>
            <div className="w-[100px]" />
          </div>

          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(56,189,248,0.10)] border border-sky-100 overflow-hidden">
            {/* Level & Score */}
            <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-4 border-b border-sky-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest leading-none">Level</span>
                  <span className="text-black text-2xl font-black">{currentQ + 1} / {TOTAL_LEVELS}</span>
                </div>
                <div className="text-right flex flex-col gap-1">
                  <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest leading-none">Score</span>
                  <span className="font-mono font-black text-2xl text-sky-500">{currentTest?.showResults !== false ? score : '---'}</span>
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
                        ${isCorrect && currentTest?.showResults !== false ? 'bg-emerald-500 text-white border-emerald-400 scale-105 shadow-lg shadow-emerald-500/20' :
                          isWrong && currentTest?.showResults !== false ? 'bg-red-500 text-white border-red-400 animate-shake' :
                            (isSelected && currentTest?.showResults === false) ? 'bg-sky-100 border-sky-300 text-sky-700' :
                              !showResult ? 'bg-white border-sky-100 text-[#0F172A] hover:border-sky-300 hover:shadow-[0_4px_16px_rgba(56,189,248,0.15)] active:scale-95' :
                                'bg-white/50 border-sky-50 text-[#94A3B8]'}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {showResult === 'timeout' && currentTest?.showResults !== false && (
                <div className="mt-4 text-center">
                  <span className="text-[13px] font-bold text-amber-500">⏰ Time's up!</span>
                </div>
              )}
            </div>

            {/* Progress footer */}
            <div className="px-6 pb-8">
              <div className="flex items-center justify-between text-[12px] text-[#94A3B8] font-bold">
                <span>Correct: <span className="text-emerald-500">{currentTest?.showResults !== false ? correctCount : '---'}</span></span>
                <span>Score: <span className="text-sky-500">{currentTest?.showResults !== false ? `${score}/200` : '---'}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AptiRush;
