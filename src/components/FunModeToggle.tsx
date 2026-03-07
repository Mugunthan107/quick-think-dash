import React from 'react';
import { useFun } from '@/context/FunContext';
import { Sparkles } from 'lucide-react';

const FunModeToggle = () => {
  const { funMode, toggleFunMode } = useFun();

  return (
    <button
      onClick={toggleFunMode}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-300 border ${
        funMode
          ? 'bg-sky-50 border-sky-200 text-sky-600 hover:bg-sky-100'
          : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
      }`}
      title={funMode ? 'Disable Fun Mode' : 'Enable Fun Mode'}
    >
      <Sparkles className="w-3 h-3" />
      <span>Fun {funMode ? 'ON' : 'OFF'}</span>
    </button>
  );
};

export default FunModeToggle;
