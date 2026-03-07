import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

interface FunContextType {
  funMode: boolean;
  toggleFunMode: () => void;
  brainPower: number;
  addBrainPower: (amount: number) => void;
  triggerConfetti: () => void;
  triggerGoldenPuzzle: () => boolean;
  showFunnyWrong: () => void;
  showCelebration: (message?: string) => void;
  showEndGameMessage: () => void;
  totalCorrect: number;
  totalGames: number;
  incrementCorrect: () => void;
  incrementGames: () => void;
  logoClickCount: number;
  handleLogoClick: () => void;
}

const FunContext = createContext<FunContextType | null>(null);

export const useFun = () => {
  const ctx = useContext(FunContext);
  if (!ctx) throw new Error('useFun must be inside FunProvider');
  return ctx;
};

// Loading messages
export const LOADING_MESSAGES = [
  "Sharpening your brain... 🧠",
  "Calculating fun levels... 📊",
  "Numbers are lining up... 🔢",
  "Our AI is drinking coffee... ☕",
  "Preparing puzzles from the math universe... 🌌",
  "Loading brain fuel... ⚡",
  "Warming up neurons... 🔥",
  "Shuffling equations... 🎲",
  "Polishing the logic engine... ⚙️",
  "Consulting with Einstein... 👴",
];

const WRONG_MESSAGES = [
  "Math disagrees 😅",
  "Numbers say nope.",
  "Close… but the universe says no.",
  "Try again, genius!",
  "Almost! Keep going 💪",
  "The calculator winced 😬",
  "Logic wants a redo 🔄",
  "Nope, but you're warming up!",
];

const CELEBRATION_MESSAGES = [
  "Brain Power Activated 🧠⚡",
  "You solved it like a pro!",
  "Numbers respect you now. 🎯",
  "Genius mode unlocked! 🔓",
  "That was impressive! ✨",
  "Math just high-fived you 🖐️",
];

const END_GAME_MESSAGES = [
  "Your brain just did a workout. 💪",
  "Math respects you now. 🎩",
  "You unlocked +5 IQ today. 🧠",
  "Einstein would be proud. 👏",
  "Brain calories: burned. 🔥",
  "Logic level: upgraded. ⬆️",
  "Neurons are celebrating! 🎉",
  "Mental fitness: peak. 🏔️",
];

const THINKING_MESSAGES = [
  "Thinking hard... 🤔",
  "Numbers are waiting... ⏳",
  "Brain loading... 🔄",
  "Take your time, genius... ⏰",
  "Deep thought mode activated... 💭",
];

export const getRandomLoadingMessage = () =>
  LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];

export const getThinkingMessage = () =>
  THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)];

export const FunProvider = ({ children }: { children: ReactNode }) => {
  const [funMode, setFunMode] = useState(() => {
    const saved = localStorage.getItem('funMode');
    return saved !== null ? saved === 'true' : true;
  });
  const [brainPower, setBrainPower] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const keyBufferRef = useRef('');

  // Persist fun mode
  useEffect(() => {
    localStorage.setItem('funMode', String(funMode));
  }, [funMode]);

  // Easter egg: typing "brainpower"
  useEffect(() => {
    if (!funMode) return;
    const handler = (e: KeyboardEvent) => {
      keyBufferRef.current += e.key.toLowerCase();
      if (keyBufferRef.current.length > 20) {
        keyBufferRef.current = keyBufferRef.current.slice(-20);
      }
      if (keyBufferRef.current.includes('brainpower')) {
        toast('🧠 Hidden IQ Boost Activated!', { duration: 3000 });
        triggerConfetti();
        keyBufferRef.current = '';
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [funMode]);

  const toggleFunMode = useCallback(() => setFunMode(p => !p), []);

  const addBrainPower = useCallback((amount: number) => {
    setBrainPower(p => Math.min(100, Math.max(0, p + amount)));
  }, []);

  const triggerConfetti = useCallback(() => {
    if (!funMode) return;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#38BDF8', '#0EA5E9', '#7DD3FC', '#BAE6FD', '#F0F9FF'],
      disableForReducedMotion: true,
    });
  }, [funMode]);

  const triggerGoldenPuzzle = useCallback(() => {
    if (!funMode) return false;
    if (Math.random() <= 0.01) {
      toast('✨ Golden Puzzle Appeared! +20 bonus points!', {
        duration: 3000,
        style: { background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', border: '2px solid #F59E0B', color: '#92400E' },
      });
      triggerConfetti();
      return true;
    }
    return false;
  }, [funMode, triggerConfetti]);

  const showFunnyWrong = useCallback(() => {
    if (!funMode) return;
    const msg = WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)];
    toast(msg, { duration: 2000 });
  }, [funMode]);

  const showCelebration = useCallback((message?: string) => {
    if (!funMode) return;
    const msg = message || CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
    toast(msg, { duration: 2500 });
    triggerConfetti();
  }, [funMode, triggerConfetti]);

  const showEndGameMessage = useCallback(() => {
    if (!funMode) return;
    const msg = END_GAME_MESSAGES[Math.floor(Math.random() * END_GAME_MESSAGES.length)];
    toast(msg, { duration: 3000 });
  }, [funMode]);

  const incrementCorrect = useCallback(() => {
    setTotalCorrect(p => p + 1);
    addBrainPower(5);
  }, [addBrainPower]);

  const incrementGames = useCallback(() => setTotalGames(p => p + 1), []);

  const handleLogoClick = useCallback(() => {
    if (!funMode) return;
    setLogoClickCount(prev => {
      const next = prev + 1;
      if (next >= 7) {
        toast('🧠 Secret Brain Mode Activated!', { duration: 3000 });
        triggerConfetti();
        return 0;
      }
      return next;
    });
  }, [funMode, triggerConfetti]);

  return (
    <FunContext.Provider value={{
      funMode, toggleFunMode, brainPower, addBrainPower,
      triggerConfetti, triggerGoldenPuzzle, showFunnyWrong,
      showCelebration, showEndGameMessage,
      totalCorrect, totalGames, incrementCorrect, incrementGames,
      logoClickCount, handleLogoClick,
    }}>
      {children}
    </FunContext.Provider>
  );
};
