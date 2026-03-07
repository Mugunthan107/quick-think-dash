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
  onClose: () => void;
}

const GameWheel = ({ availableGameIds, onClose }: GameWheelProps) => {
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
    // Spin 5-8 full rotations plus land on the segment
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
      onClose();
      navigate(selectedGame.route);
    }
  }, [selectedGame, navigate, onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in-up" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-[340px] w-full mx-4 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-lg font-bold">✕</button>
        
        <h3 className="text-lg font-black text-foreground text-center mb-4">🎡 Spin the Wheel!</h3>

        {/* Wheel */}
        <div className="relative w-[220px] h-[220px] mx-auto mb-4">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 text-2xl">▼</div>
          
          <div
            ref={wheelRef}
            className="w-full h-full rounded-full border-4 border-sky-200 overflow-hidden relative"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            }}
          >
            {games.map((game, i) => {
              const startAngle = i * segmentAngle;
              return (
                <div
                  key={game.id}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    transform: `rotate(${startAngle + segmentAngle / 2}deg)`,
                    clipPath: games.length <= 4
                      ? `polygon(50% 50%, ${50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((startAngle + segmentAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((startAngle + segmentAngle - 90) * Math.PI / 180)}%)`
                      : undefined,
                  }}
                >
                  <span
                    className="text-[8px] sm:text-[9px] font-bold text-white absolute"
                    style={{
                      top: '18%',
                      transform: `rotate(0deg)`,
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    }}
                  >
                    {game.name}
                  </span>
                </div>
              );
            })}
            {/* Colored segments via conic-gradient */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(${games.map((g, i) =>
                  `${g.color} ${(i / games.length) * 100}% ${((i + 1) / games.length) * 100}%`
                ).join(', ')})`,
              }}
            />
            {/* Labels overlay */}
            {games.map((game, i) => {
              const angle = (i * segmentAngle) + (segmentAngle / 2) - 90;
              const rad = angle * Math.PI / 180;
              const labelR = 65;
              const x = 50 + labelR * Math.cos(rad);
              const y = 50 + labelR * Math.sin(rad);
              return (
                <span
                  key={`label-${game.id}`}
                  className="absolute text-[7px] sm:text-[8px] font-bold text-white z-10 whitespace-nowrap pointer-events-none"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: `translate(-50%, -50%) rotate(${(i * segmentAngle) + (segmentAngle / 2)}deg)`,
                    textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                  }}
                >
                  {game.name}
                </span>
              );
            })}
          </div>
        </div>

        {/* Result & Button */}
        {selectedGame ? (
          <div className="text-center space-y-3">
            <p className="text-sm font-bold text-foreground">
              🎯 <span style={{ color: selectedGame.color }}>{selectedGame.name}</span>!
            </p>
            <button
              onClick={goToGame}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl py-2.5 transition-all text-sm"
            >
              Let's Play! →
            </button>
          </div>
        ) : (
          <button
            onClick={spin}
            disabled={spinning}
            className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-bold rounded-xl py-2.5 transition-all text-sm"
          >
            {spinning ? '🎡 Spinning...' : '🎡 Spin!'}
          </button>
        )}
      </div>
    </div>
  );
};

export default GameWheel;
