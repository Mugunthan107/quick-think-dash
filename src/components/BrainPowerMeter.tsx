import React from 'react';
import { useFun } from '@/context/FunContext';
import { Brain } from 'lucide-react';

const LEVELS = [
  { min: 0, label: 'Brain Booting', color: 'bg-slate-300' },
  { min: 20, label: 'Warming Up', color: 'bg-amber-400' },
  { min: 40, label: 'Smart Mode', color: 'bg-sky-400' },
  { min: 60, label: 'Genius Mode', color: 'bg-emerald-400' },
  { min: 80, label: 'Einstein Mode', color: 'bg-purple-500' },
];

const getLevel = (power: number) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (power >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
};

const BrainPowerMeter = () => {
  const { funMode, brainPower } = useFun();
  if (!funMode) return null;

  const level = getLevel(brainPower);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-sky-100 p-2.5 w-[160px] sm:w-[180px]">
        <div className="flex items-center gap-2 mb-1.5">
          <Brain className="w-3.5 h-3.5 text-sky-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Brain Power</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${level.color}`}
            style={{ width: `${brainPower}%` }}
          />
        </div>
        <span className="text-[10px] font-semibold text-foreground/70">{level.label}</span>
      </div>
    </div>
  );
};

export default BrainPowerMeter;
