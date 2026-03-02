import React, { useState, useEffect, useRef } from 'react';
import { Brain, Grid3X3, Layers3, BarChart2, Zap, Clock } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   GAME DATA
───────────────────────────────────────────────────────────────────────────── */

const GAMES = [
    {
        id: 'bubble',
        name: 'Bubble Sort',
        tag: 'SORTING',
        tagColor: '#6C63FF',
        tagBg: 'rgba(108,99,255,0.08)',
        borderAccent: 'rgba(108,99,255,0.25)',
        icon: Brain,
        iconColor: '#6C63FF',
        iconBg: 'rgba(108,99,255,0.08)',
        desc: 'Sort math expressions by value. Tests speed under pressure.',
    },
    {
        id: 'crossmath',
        name: 'Cross Math',
        tag: 'LOGIC',
        tagColor: '#22D3EE',
        tagBg: 'rgba(34,211,238,0.08)',
        borderAccent: 'rgba(34,211,238,0.25)',
        icon: Grid3X3,
        iconColor: '#22D3EE',
        iconBg: 'rgba(34,211,238,0.08)',
        desc: 'Solve grid-based arithmetic puzzles. Enhances logical deduction.',
    },
    {
        id: 'numlink',
        name: 'NumLink',
        tag: 'PATTERN',
        tagColor: '#F59E0B',
        tagBg: 'rgba(245,158,11,0.08)',
        borderAccent: 'rgba(245,158,11,0.25)',
        icon: Layers3,
        iconColor: '#F59E0B',
        iconBg: 'rgba(245,158,11,0.08)',
        desc: 'Connect numbers in sequence grids. Boosts pattern recognition.',
    },
] as const;

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */

export default function RotatingGameCard() {
    const [flipCount, setFlipCount] = useState(0);
    const [paused, setPaused] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /* ── AUTO-ROTATION TIMER ── */
    useEffect(() => {
        if (paused) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        // Interval changed to 3500ms (3.5 seconds) per user request
        const id = setInterval(() => {
            setFlipCount(c => c + 1);
        }, 3500);

        timerRef.current = id;
        return () => clearInterval(id);
    }, [paused]);

    // Determine which game shows on which face. 
    // We prepare the hidden face so the next flip shows the right game smoothly.
    const frontGameIdx = flipCount % 2 === 0 ? (flipCount % GAMES.length) : ((flipCount + 1) % GAMES.length);
    const backGameIdx = flipCount % 2 === 1 ? (flipCount % GAMES.length) : ((flipCount + 1) % GAMES.length);

    const frontGame = GAMES[frontGameIdx];
    const backGame = GAMES[backGameIdx];

    const currentDisplayIdx = flipCount % GAMES.length;

    const renderFace = (game: typeof GAMES[number], isBack: boolean) => {
        const GameIcon = game.icon;
        return (
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#fff',
                    border: `1px solid ${game.borderAccent}`,
                    borderRadius: '50%', // Circle 
                    boxShadow: `0 20px 48px -12px ${game.borderAccent.replace('0.3', '0.15')}, 0 4px 16px -4px rgba(0,0,0,0.06)`,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.25rem',
                    textAlign: 'center',
                    transform: isBack ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
            >
                <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: game.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.5rem',
                    boxShadow: `inset 0 0 0 1px ${game.borderAccent}`,
                }}>
                    <GameIcon style={{ width: 22, height: 22, color: game.iconColor }} />
                </div>

                <h3 style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: '#111827',
                    marginBottom: '0.25rem',
                    letterSpacing: '-0.02em',
                }}>
                    {game.name}
                </h3>

                <span style={{
                    fontSize: 8,
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    color: game.tagColor,
                    background: game.tagBg,
                    border: `1px solid ${game.tagColor}22`,
                    borderRadius: 999,
                    padding: '2px 8px',
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem',
                }}>
                    {game.tag}
                </span>

                <p style={{
                    fontSize: 11,
                    color: '#4B5563',
                    lineHeight: 1.4,
                    maxWidth: '180px',
                }}>
                    {game.desc}
                </p>
            </div>
        );
    };

    return (
        <div
            className="relative flex flex-col items-center justify-center animate-float-slow"
            aria-live="polite"
            aria-label={`Currently showing ${GAMES[currentDisplayIdx].name} game`}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            tabIndex={0}
            role="region"
            style={{ outline: 'none' }}
        >
            {/* ── 3D PERSPECTIVE SCENE ── */}
            <div
                style={{
                    width: 210,
                    height: 210,
                    perspective: 1200,
                }}
            >
                {/* ── ROTATING CONTAINER ── */}
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                        transformStyle: 'preserve-3d',
                        transform: `rotateY(${flipCount * 180}deg)`,
                        transition: 'transform 1.2s cubic-bezier(0.25, 1, 0.4, 1)',
                    }}
                >
                    {/* FRONT FACE (Even flipCounts) */}
                    {renderFace(frontGame, false)}

                    {/* BACK FACE (Odd flipCounts) */}
                    {renderFace(backGame, true)}
                </div>
            </div>
        </div>
    );
}
