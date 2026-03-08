import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFun } from '@/context/FunContext';

const WHEEL_GAMES = [
  { id: 'bubble', name: 'Bubble Sort', route: '/game', color: '#6C63FF' },
  { id: 'crossmath', name: 'Cross Math', route: '/crossmath', color: '#22D3EE' },
  { id: 'numlink', name: 'NumLink', route: '/numlink', color: '#F59E0B' },
  { id: 'motion', name: 'Motion', route: '/motion-challenge', color: '#EC4899' },
  { id: 'aptirush', name: 'AptiRush', route: '/aptirush', color: '#10B981' },
  { id: 'numberseries', name: 'Num Series', route: '/number-series', color: '#0EA5E9' },
  { id: 'mirror', name: 'Mirror', route: '/mirror-image', color: '#8B5CF6' },
  { id: 'waterimage', name: 'Water Image', route: '/water-image', color: '#06B6D4' },
  { id: 'numpuzzle', name: 'Num Puzzle', route: '/number-puzzle', color: '#D97706' },
  { id: 'colorsort', name: 'Color Sort', route: '/color-sort', color: '#E11D48' },
];

interface GameWheelProps {
  availableGameIds?: string[];
  onClose?: () => void;
  onGameSelected?: (gameId: string, route: string) => void;
  isInline?: boolean;
}

const GameWheel = ({ availableGameIds, onClose, onGameSelected, isInline }: GameWheelProps) => {
  const navigate = useNavigate();
  const { triggerConfetti } = useFun();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedGame, setSelectedGame] = useState<typeof WHEEL_GAMES[0] | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const filteredGames = availableGameIds
    ? WHEEL_GAMES.filter(g => availableGameIds.includes(g.id))
    : WHEEL_GAMES;

  const games = filteredGames.length > 0 ? filteredGames : WHEEL_GAMES;
  const segmentAngle = 360 / games.length;

  const spin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    setSelectedGame(null);

    const randomIdx = Math.floor(Math.random() * games.length);
    const extraRotations = (5 + Math.floor(Math.random() * 3)) * 360;
    const targetAngle = extraRotations + (randomIdx * segmentAngle) + (segmentAngle / 2);

    setRotation(prev => prev + targetAngle);

    setTimeout(() => {
      setSpinning(false);
      setSelectedGame(games[randomIdx]);
      triggerConfetti();
    }, 3000);
  }, [spinning, games, segmentAngle, triggerConfetti]);

  const goToGame = useCallback(() => {
    if (selectedGame) {
      if (onGameSelected) {
        onGameSelected(selectedGame.id, selectedGame.route);
      } else {
        onClose?.();
        navigate(selectedGame.route);
      }
    }
  }, [selectedGame, navigate, onClose, onGameSelected]);

  const wheelContent = (
    <div className={`${isInline ? '' : 'bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-[340px] w-full mx-4 relative'}`} onClick={e => e.stopPropagation()}>
      {!isInline && onClose && (
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-lg font-bold">✕</button>
      )}

      {!isInline && <h3 className="text-lg font-black text-foreground text-center mb-4">🎡 Spin the Wheel!</h3>}

      {/* Wheel Area */}
      <div className="relative w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] mx-auto mb-6">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-30 text-3xl filter drop-shadow-md">▼</div>

        <div
          ref={wheelRef}
          className="w-full h-full rounded-full border-[6px] border-[#F1F5F9] overflow-hidden relative shadow-xl"
          style={{
            transform: `rotate(${-rotation}deg)`,
            transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          }}
        >
          {/* Segments via conic-gradient */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(${games.map((g, i) =>
                `${g.color} ${(i / games.length) * 100}% ${((i + 1) / games.length) * 100}%`
              ).join(', ')})`,
            }}
          />

          {/* Labels layer */}
          {games.map((game, i) => {
            const angle = (i * segmentAngle) + (segmentAngle / 2);
            return (
              <div
                key={`label-${game.id}`}
                className="absolute inset-0 flex items-start justify-center pt-8 pointer-events-none"
                style={{
                  transform: `rotate(${angle}deg)`,
                }}
              >
                <span
                  className="text-[10px] sm:text-[11px] font-black text-white px-1 leading-tight text-center max-w-[60px]"
                  style={{
                    textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                    transform: 'rotate(0deg)',
                  }}
                >
                  {game.name}
                </span>
              </div>
            );
          })}

          {/* Inner circle */}
          <div className="absolute inset-[40%] bg-white rounded-full shadow-inner z-20 flex items-center justify-center border-4 border-[#F1F5F9]">
            <div className="w-4 h-4 rounded-full bg-sky-500 shadow-sm" />
          </div>
        </div>
      </div>

      {/* Result & Button */}
      <div className="max-w-[240px] mx-auto">
        {selectedGame ? (
          <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-sky-50 rounded-2xl p-3 border border-sky-100">
              <p className="text-sm font-black text-foreground">
                🚀 SELECTED: <span style={{ color: selectedGame.color }}>{selectedGame.name}</span>!
              </p>
            </div>
            <button
              onClick={goToGame}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-black rounded-2xl py-3.5 shadow-lg shadow-sky-500/20 transition-all text-[15px] hover:-translate-y-0.5 active:scale-95"
            >
              Let's Play! →
            </button>
          </div>
        ) : (
          <button
            onClick={spin}
            disabled={spinning}
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-gray-400 text-white font-black rounded-2xl py-3.5 shadow-lg shadow-blue-500/20 transition-all text-[15px] hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
          >
            {spinning ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Spinning...</>
            ) : (
              <>🎡 Spin the Wheel</>
            )}
          </button>
        )}
      </div>
    </div>
  );

  if (isInline) return wheelContent;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in-up" onClick={onClose}>
      {wheelContent}
    </div>
  );
};

export default GameWheel;
