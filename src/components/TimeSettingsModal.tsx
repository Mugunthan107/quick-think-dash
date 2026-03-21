import React, { useState, useEffect } from 'react';
import { X, Save, Clock, Gamepad2, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

export const DEFAULT_TIMINGS = [
  {
    id: 'numpuzzle',
    game: 'Number Puzzle',
    levels: [
      { id: '1-15', range: '1 - 15', limit: 10 },
      { id: '16-20', range: '16 - 20', limit: 5 }
    ]
  },
  {
    id: 'colorsort',
    game: 'Water Color Sort',
    levels: [
      { id: '1-5', range: '1 - 5', limit: 30 },
      { id: '6-10', range: '6 - 10', limit: 40 },
      { id: '11-15', range: '11 - 15', limit: 45 },
      { id: '16-20', range: '16 - 20', limit: 50 },
    ]
  },
  {
    id: 'numlink',
    game: 'NumLink',
    levels: [
      { id: 'l1', range: '1 - 5 (Level 1)', limit: 15 },
      { id: 'l2', range: '6 - 10 (Level 2)', limit: 25 },
      { id: 'l3', range: '11 - 15 (Level 3)', limit: 30 },
      { id: 'l4', range: '16 - 20 (Level 4)', limit: 40 },
    ]
  },
  {
    id: 'aptirush',
    game: 'AptiRush',
    levels: [
      { id: 'all', range: 'All 20 Questions', limit: 10 }
    ]
  },
  {
    id: 'bubble',
    game: 'Bubble Sort',
    levels: [
      { id: '1-10', range: '1 - 10', limit: 10 },
      { id: '11-20', range: '11 - 20', limit: 7 },
      { id: '21-30', range: '21 - 30', limit: 5 },
    ]
  },
  {
    id: 'crossmath',
    game: 'CrossMath',
    levels: [
      { id: '1-5', range: '1 - 5', limit: 10 },
      { id: '6-10', range: '6 - 10', limit: 15 },
      { id: '11-15', range: '11 - 15', limit: 20 },
      { id: '16-20', range: '16 - 20', limit: 25 },
    ]
  },
  {
    id: 'mirror',
    game: 'Mirror Image',
    levels: [
      { id: '1-10', range: '1 - 10', limit: 10 },
      { id: '11-20', range: '11 - 20', limit: 5 },
    ]
  },
  {
    id: 'waterimage',
    game: 'Water Image',
    levels: [
      { id: '1-10', range: '1 - 10', limit: 10 },
      { id: '11-20', range: '11 - 20', limit: 5 },
    ]
  },
  {
    id: 'numberseries',
    game: 'Number Series',
    levels: [
      { id: '1-5', range: '1 - 5', limit: 8 },
      { id: '6-10', range: '6 - 10', limit: 7 },
      { id: '11-15', range: '11 - 15', limit: 6 },
      { id: '16-20', range: '16 - 20', limit: 5 },
    ]
  },
  {
    id: 'motion',
    game: 'Motion Challenge',
    levels: [
      { id: 'all', range: 'All 10 Levels', limit: 30 }
    ]
  },
  {
    id: 'thugofwar',
    game: 'Thug of War',
    levels: [
      { id: 'all', range: 'All Questions', limit: 10 }
    ]
  }
];

interface TimeSettingsModalProps {
  onClose: () => void;
}

const TimeSettingsModal: React.FC<TimeSettingsModalProps> = ({ onClose }) => {
  const [timings, setTimings] = useState(DEFAULT_TIMINGS);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load from local storage if exists
    const stored = localStorage.getItem('game_timings_config');
    if (stored) {
      try {
        setTimings(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse timings', e);
      }
    }
  }, []);

  const handleTimeChange = (gameId: string, levelId: string, newLimit: string) => {
    const numericPart = newLimit.replace(/\D/g, '');
    const val = numericPart ? parseInt(numericPart, 10) : 0;

    setTimings(prev => prev.map(game => {
      if (game.id !== gameId) return game;
      return {
        ...game,
        levels: game.levels.map(lvl => {
          if (lvl.id !== levelId) return lvl;
          return { ...lvl, limit: val };
        })
      };
    }));
  };

  const handleSave = () => {
    localStorage.setItem('game_timings_config', JSON.stringify(timings));
    toast.success('Game timings updated successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 sm:py-8">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-sky-900/20 backdrop-blur-sm transition-all duration-300" onClick={onClose} />
      
      {/* Modal Container */}
      <div 
        className="relative w-full sm:w-[700px] bg-white shadow-[0_20px_60px_-15px_rgba(56,189,248,0.2)] border border-sky-100 rounded-2xl sm:rounded-[2rem] animate-in fade-in zoom-in duration-300 overflow-hidden flex flex-col max-h-full"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-sky-50 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center border border-sky-100">
              <Gamepad2 className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <h2 className="text-[16px] sm:text-[18px] font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                Games Timer Settings
              </h2>
              <p className="text-[#64748B] text-[12px] font-bold mt-0.5">Customize time limits for all games</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white hover:bg-sky-50 text-[#94A3B8] hover:text-sky-600 transition-colors flex items-center justify-center border border-sky-100 shadow-sm hover:shadow">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-5 sm:px-6 py-4 border-b border-sky-50 bg-slate-50/30">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-sky-100 rounded-xl pl-10 pr-4 py-2.5 text-[14px] font-medium text-[#0F172A] focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all placeholder:text-[#94A3B8] shadow-sm"
            />
          </div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 p-4 sm:p-6 min-h-0">
          <div className="min-w-full">
            <div className="grid grid-cols-[1.5fr_1.5fr_1fr] gap-4 mb-3 px-4">
              <span className="text-[11px] font-black text-[#94A3B8] uppercase tracking-widest">Game Name</span>
              <span className="text-[11px] font-black text-[#94A3B8] uppercase tracking-widest">Level / Round</span>
              <span className="text-[11px] font-black text-[#94A3B8] uppercase tracking-widest">Time Limit</span>
            </div>

            <div className="space-y-4">
              {timings.filter(game => game.game.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="text-center py-8 text-[#94A3B8] font-medium text-sm">
                  No games found matching "{searchQuery}"
                </div>
              ) : (
                timings.filter(game => game.game.toLowerCase().includes(searchQuery.toLowerCase())).map((game) => (
                <div key={game.id} className="bg-white rounded-xl border border-sky-100/60 shadow-sm overflow-hidden">
                  {game.levels.map((lvl, index) => (
                    <div key={lvl.id} className={`grid grid-cols-[1.5fr_1.5fr_1fr] gap-4 p-3 px-4 items-center hover:bg-sky-50/30 transition-colors ${index !== game.levels.length - 1 ? 'border-b border-sky-50' : ''}`}>
                      {/* Game Name - only show on first row */}
                      <div className="text-[13px] font-bold text-[#0F172A] flex items-center">
                        {index === 0 && (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 mr-2" />
                            {game.game}
                          </>
                        )}
                      </div>

                      {/* Level Range */}
                      <div className="text-[13px] font-bold text-[#475569]">
                        {lvl.range}
                      </div>

                      {/* Input */}
                      <div className="relative flex items-center bg-sky-50 border border-sky-200 rounded-lg overflow-hidden shadow-inner focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-400/20 transition-all w-[90px]">
                        <input
                          type="text"
                          value={`${lvl.limit}s`}
                          onChange={(e) => handleTimeChange(game.id, lvl.id, e.target.value)}
                          className="w-14 bg-transparent px-3 py-1.5 text-[14px] font-black font-mono text-sky-600 focus:outline-none text-left"
                        />
                        <div className="flex flex-col border-l border-sky-200 w-8 h-[36px] bg-sky-100/50">
                          <button 
                            onClick={() => handleTimeChange(game.id, lvl.id, String(lvl.limit + 1))}
                            className="flex-1 flex items-center justify-center hover:bg-sky-200 text-sky-600 border-b border-sky-200 transition-colors"
                          >
                            <ChevronUp className="w-3 h-3 text-[10px]" />
                          </button>
                          <button 
                            onClick={() => handleTimeChange(game.id, lvl.id, String(Math.max(1, lvl.limit - 1)))}
                            className="flex-1 flex items-center justify-center hover:bg-sky-200 text-sky-600 transition-colors"
                          >
                            <ChevronDown className="w-3 h-3 text-[10px]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-sky-50 bg-white flex justify-end gap-3 shrink-0">
          <Button onClick={onClose} variant="outline" className="text-[#64748B] hover:text-[#0F172A] border-sky-100 hover:bg-sky-50 rounded-xl font-bold">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] hover:from-[#0EA5E9] hover:to-[#0284C7] text-white shadow-md shadow-sky-500/20 rounded-xl px-6 font-bold">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

      </div>
    </div>
  );
};

export default TimeSettingsModal;
