import React, { useState, useEffect } from 'react';
import { Play, Brain, Grid3X3, Link2, KeyRound, Gamepad2, BarChart3, Layers3, Activity, ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DecorativeCurve from '@/components/DecorativeCurve';
import RotatingGameCard from '@/components/RotatingGameCard';

/* ──────────────────── COMPONENTS ──────────────────── */

// A fun component that randomly updates its number and color
// A fun component that randomly updates its number and color
const AnimatedNumber = ({ initialNum, char, delay, size, color, bg, style, isPulse }: { initialNum?: number, char?: string, delay: string, size: string, color: string, bg: string, style?: React.CSSProperties, isPulse?: boolean }) => {
  const [num, setNum] = useState(initialNum ?? 0);
  const isSymbol = char !== undefined;

  useEffect(() => {
    if (isSymbol) return;
    // Add initial jitter to prevent all bubbles from syncing up
    const initialDelay = Math.random() * 1000;
    const timeout = setTimeout(() => {
      const intervalTime = Math.floor(Math.random() * 2000) + 2000;
      const interval = setInterval(() => {
        setNum(prev => {
          let next;
          do {
            next = Math.floor(Math.random() * 10);
          } while (next === prev); // Ensure it actually changes
          return next;
        });
      }, intervalTime);
      return () => clearInterval(interval);
    }, initialDelay);
    return () => clearTimeout(timeout);
  }, [isSymbol]);

  return (
    <div className="absolute animate-float" style={{ ...style, animationDelay: delay }}>
      <div
        className={`flex items-center justify-center bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-white/50 relative ${size} ${isPulse ? 'animate-pulse-scale' : ''}`}
        style={{ animationDelay: delay }}
      >
        <div className={`absolute inset-0 rounded-full ${bg} opacity-[0.15] blur-sm`} />
        <span className={`relative z-10 font-black transition-colors duration-500 ${color} ${isSymbol ? 'text-[24px]' : 'opacity-70'}`}>
          {isSymbol ? char : num}
        </span>
      </div>
    </div>
  );
};

const AnimatedNumbers = () => {
  // Layer 1: Symbols (Radius 180) - Symmetrical 4 Sides
  const layer1 = [
    { char: '×', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]', angle: 0 },
    { char: '−', color: 'text-[#22D3EE]', bg: 'bg-[#22D3EE]', angle: 90 },
    { char: '÷', color: 'text-[#22C55E]', bg: 'bg-[#22C55E]', angle: 180 },
    { char: '+', color: 'text-[#6C63FF]', bg: 'bg-[#6C63FF]', angle: 270 },
  ];

  // Layer 2: Numbers (Radius 230) - 12 Items for balanced visual richness
  const layer2 = [8, 5, 3, 9, 0, 7, 2, 4, 1, 6, 9, 2].map((n, i) => ({
    num: n,
    angle: i * 30 + 15, // Uniform 30° intervals
    color: ['text-[#6C63FF]', 'text-[#22D3EE]', 'text-[#F59E0B]'][i % 3],
    bg: ['bg-[#6C63FF]', 'bg-[#22D3EE]', 'bg-[#F59E0B]'][i % 3],
    size: i % 2 === 0 ? "w-10 h-10 text-[20px]" : "w-8 h-8 text-[16px]"
  }));

  // Layer 3: Anchors (Radius 280) - Slightly larger as requested
  const layer3 = [
    { char: <Brain className="w-5 h-5" />, color: 'text-[#6C63FF]', bg: 'bg-[#6C63FF]', angle: -45 }, // Top Right
    { char: <Zap className="w-5 h-5" />, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]', angle: 135 }, // Bottom Left
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Layer 1: Inner Symbols */}
      {layer1.map((item, i) => {
        const angleRad = item.angle * (Math.PI / 180);
        return (
          <AnimatedNumber
            key={`l1-${i}`}
            char={item.char}
            delay={`${i * 0.4}s`}
            size="w-11 h-11"
            color={item.color}
            bg={item.bg}
            style={{
              left: `calc(50% + ${Math.cos(angleRad) * 180}px)`,
              top: `calc(50% + ${Math.sin(angleRad) * 180}px)`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        );
      })}

      {/* Layer 2: Middle Numbers */}
      {layer2.map((item, i) => {
        const angleRad = item.angle * (Math.PI / 180);
        return (
          <AnimatedNumber
            key={`l2-${i}`}
            initialNum={item.num}
            delay={`${i * 0.2}s`}
            size={item.size}
            color={item.color}
            bg={item.bg}
            isPulse={true}
            style={{
              left: `calc(50% + ${Math.cos(angleRad) * 230}px)`,
              top: `calc(50% + ${Math.sin(angleRad) * 230}px)`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        );
      })}

      {/* Layer 3: Outer Anchors */}
      {layer3.map((item, i) => {
        const angleRad = item.angle * (Math.PI / 180);
        return (
          <div
            key={`l3-${i}`}
            className="absolute animate-float"
            style={{
              left: `calc(50% + ${Math.cos(angleRad) * 280}px)`,
              top: `calc(50% + ${Math.sin(angleRad) * 280}px)`,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${i * 1.5}s`
            }}
          >
            <div className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/50 relative animate-pulse">
              <div className={`absolute inset-0 rounded-full ${item.bg} opacity-[0.1] blur-sm`} />
              <div className={item.color}>{item.char}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ──────────────────── PAGE ──────────────────── */

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col bg-[#FDFDFF] flex-1 overflow-hidden font-sans selection:bg-indigo-100 relative">
      <div className="w-full flex-1 flex flex-col">
        {/* ─────────────────────────────────────────────────────────
                                HERO SECTION
            ───────────────────────────────────────────────────────── */}
        <section className="relative w-full flex-1 flex flex-col justify-center overflow-hidden">

          {/* Layer 1: Premium Background Depth */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {/* Soft Multi-Gradient Base */}
            <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#F5F3FF_0%,_#ECFEFF_40%,_#FFFFFF_100%)]" />

            {/* Very Faint Radial Glow behind Hero */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#6C63FF] opacity-[0.03] blur-[120px] rounded-full" />
          </div>

          {/* Master Container */}
          <div className="relative z-10 w-full max-w-[1240px] mx-auto px-6 sm:px-12 flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-12">

            {/* Layer 2: Content Grid (Left Side) */}
            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-[580px]">

              {/* Pill Badge - Premium Tint (Removed) */}

              {/* Main Heading - Smooth Elegant Gradient */}
              <h1 className="text-[clamp(40px,5.5vw,56px)] font-black tracking-tight text-[#0F172A] leading-[1.05] mb-6">
                MindSprint{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#6C63FF] to-[#22D3EE] drop-shadow-sm">
                  Challenge
                </span>
              </h1>

              {/* Value Paragraph - Slate 500 equivalent */}
              <p className="text-[18px] text-[#64748B] font-medium leading-relaxed mb-10 max-w-[480px]">
                A high-precision environment designed for mathematical logic and cognitive speed. Benchmarking mental agility with real-time analytics.
              </p>

              {/* Primary CTA - Styled as 'START' - Compact Balanced Scale */}
              <button
                onClick={() => navigate('/student')}
                className="group relative inline-flex items-center justify-center gap-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black rounded-lg transition-all duration-300 shadow-md shadow-blue-500/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 px-8 py-3"
              >
                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-0.5" />
                <span className="text-[17px] font-bold tracking-tight uppercase">START</span>
              </button>

              {/* Supporting Stats Row (Removed) */}

            </div>

            {/* Layer 3: Visual Anchor (Right Side) */}
            <div className="flex-1 w-full max-w-[500px] lg:max-w-none flex justify-center lg:justify-end">

              {/* Abstract Orbital Visual Container */}
              <div className="relative w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] flex items-center justify-center">

                {/* Soft Radial Backing Background - Extremely faint glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#6C63FF05_0%,_transparent_70%)] animate-pulse" style={{ animationDuration: '6s' }} />

                {/* Central Element: Rotating Game Card */}
                <div className="relative z-20 w-full max-w-[400px] flex items-center justify-center">
                  <div className="p-4 rounded-[40px] bg-white/30 backdrop-blur-xl border border-white/40 shadow-2xl shadow-indigo-100/30">
                    <RotatingGameCard />
                  </div>
                </div>

                {/* Orbital Path Rings (Subtle) */}


                {/* Supporting Elements - Precision Unified Orbit */}
                <div className="absolute w-full h-full z-10 pointer-events-none">
                  {/* The three-layer concentric system */}
                  <AnimatedNumbers />
                </div>

              </div>
            </div>

          </div>

          {/* Top Decorative Wave - Tertiary (Deepest layer) */}
          <DecorativeCurve
            opacity={0.04}
            height="h-[400px] sm:h-[550px]"
            className="absolute -top-[80px] sm:-top-[120px] left-[-10%] w-[120%] z-0 rotate-180 pointer-events-none scale-x-[1.1] translate-x-4 mix-blend-multiply"
            animate={true}
          />
          {/* Top Decorative Wave - Secondary (Layered behind) */}
          <DecorativeCurve
            opacity={0.06}
            height="h-[350px] sm:h-[480px]"
            className="absolute -top-[50px] sm:-top-[80px] left-[-5%] w-[110%] z-0 rotate-180 pointer-events-none scale-x-[1.05]"
            animate={true}
          />
          {/* Top Decorative Wave - Primary */}
          <DecorativeCurve
            opacity={0.12}
            height="h-[250px] sm:h-[360px]"
            className="absolute top-0 left-0 z-0 rotate-180 pointer-events-none"
            animate={true}
          />

          {/* Bottom Decorative Wave - Tertiary (Deepest layer) */}
          <DecorativeCurve
            opacity={0.05}
            height="h-[400px] sm:h-[550px]"
            className="absolute -bottom-[80px] sm:-bottom-[120px] left-[-10%] w-[120%] z-0 pointer-events-none scale-x-[1.1] -translate-x-4 mix-blend-multiply"
            animate={true}
          />
          {/* Bottom Decorative Wave - Secondary (Layered behind) */}
          <DecorativeCurve
            opacity={0.07}
            height="h-[350px] sm:h-[480px]"
            className="absolute -bottom-[50px] sm:-bottom-[80px] left-[-5%] w-[110%] z-0 pointer-events-none scale-x-[1.05]"
            animate={true}
          />
          {/* Bottom Decorative Wave - Primary */}
          <DecorativeCurve
            opacity={0.12}
            height="h-[250px] sm:h-[360px]"
            className="absolute bottom-0 left-0 z-0 pointer-events-none"
            animate={true}
          />

        </section>
      </div>
    </div>
  );
}

