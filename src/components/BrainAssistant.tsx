import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFun } from '@/context/FunContext';
import { Brain } from 'lucide-react';

const MESSAGES = [
  "Your brain is warming up 🔥",
  "Numbers are impressed.",
  "Even Einstein would pause here.",
  "That was fast... suspiciously fast 🤨",
  "Math approved ✔",
  "Neurons are firing! ⚡",
  "You're on a roll! 🎯",
  "Brain power increasing... 📈",
  "Logic circuits: online 🔌",
  "Keep going, genius! 🧠",
  "The math gods smile upon you 😇",
  "Pattern detected: brilliance 🌟",
  "CPU at 100%... yours, not the computer's 💻",
  "Warning: dangerously smart 🚨",
];

const BrainAssistant = () => {
  const { funMode } = useFun();
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const showMessage = useCallback(() => {
    if (!funMode) return;
    const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    setMessage(msg);
    setVisible(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(false), 3000);
  }, [funMode]);

  useEffect(() => {
    if (!funMode) { setVisible(false); return; }
    const scheduleNext = () => {
      const delay = 25000 + Math.random() * 15000; // 25-40 seconds
      return setTimeout(() => {
        showMessage();
        intervalRef.current = scheduleNext();
      }, delay);
    };
    const intervalRef = { current: scheduleNext() };
    return () => clearTimeout(intervalRef.current);
  }, [funMode, showMessage]);

  if (!funMode || !visible) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 animate-fade-in-up max-w-[240px]">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-sky-100 p-3 flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
          <Brain className="w-4 h-4 text-sky-500" />
        </div>
        <p className="text-[12px] sm:text-[13px] text-foreground/80 font-medium leading-snug pt-1">
          {message}
        </p>
      </div>
      {/* Small triangle pointer */}
      <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white/95 border-r border-b border-sky-100 rotate-45" />
    </div>
  );
};

export default BrainAssistant;
