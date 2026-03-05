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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const scale = isMobile ? 0.55 : 1;
  const r1 = 180 * scale, r2 = 230 * scale, r3 = 280 * scale;

  const layer1 = [
    { char: '×', color: 'text-sky-400', bg: 'bg-sky-400', angle: 0 },
    { char: '−', color: 'text-rose-400', bg: 'bg-rose-400', angle: 90 },
    { char: '÷', color: 'text-emerald-400', bg: 'bg-emerald-400', angle: 180 },
    { char: '+', color: 'text-amber-400', bg: 'bg-amber-400', angle: 270 },
  ];

  const layer2 = [8, 5, 3, 9, 0, 7, 2, 4, 1, 6, 9, 2].map((n, i) => {
    const colors = [
      { text: 'text-sky-400', bg: 'bg-sky-400' },
      { text: 'text-rose-400', bg: 'bg-rose-400' },
      { text: 'text-emerald-400', bg: 'bg-emerald-400' },
      { text: 'text-amber-400', bg: 'bg-amber-400' },
      { text: 'text-purple-400', bg: 'bg-purple-400' },
      { text: 'text-indigo-400', bg: 'bg-indigo-400' },
    ];
    const color = colors[i % colors.length];
    return {
      num: n,
      angle: i * 30 + 15,
      color: color.text,
      bg: color.bg,
      size: i % 2 === 0 ? `${isMobile ? 'w-7 h-7 text-[14px]' : 'w-10 h-10 text-[20px]'}` : `${isMobile ? 'w-6 h-6 text-[12px]' : 'w-8 h-8 text-[16px]'}`
    };
  });

  const layer3 = [
    { char: <Brain className="w-5 h-5" />, color: 'text-purple-500', bg: 'bg-purple-500', angle: -45 },
    { char: <Zap className="w-5 h-5" />, color: 'text-amber-500', bg: 'bg-amber-500', angle: 135 },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {layer1.map((item, i) => {
        const angleRad = item.angle * (Math.PI / 180);
        return (
          <AnimatedNumber key={`l1-${i}`} char={item.char} delay={`${i * 0.4}s`}
            size={isMobile ? "w-8 h-8" : "w-11 h-11"} color={item.color} bg={item.bg} isPulse={true}
            style={{ left: `calc(50% + ${Math.cos(angleRad) * r1}px)`, top: `calc(50% + ${Math.sin(angleRad) * r1}px)`, transform: 'translate(-50%, -50%)' }}
          />
        );
      })}
      {layer2.map((item, i) => {
        const angleRad = item.angle * (Math.PI / 180);
        return (
          <AnimatedNumber key={`l2-${i}`} initialNum={item.num} delay={`${i * 0.2}s`}
            size={item.size} color={item.color} bg={item.bg} isPulse={true}
            style={{ left: `calc(50% + ${Math.cos(angleRad) * r2}px)`, top: `calc(50% + ${Math.sin(angleRad) * r2}px)`, transform: 'translate(-50%, -50%)' }}
          />
        );
      })}
      {layer3.map((item, i) => {
        const angleRad = item.angle * (Math.PI / 180);
        return (
          <div key={`l3-${i}`} className="absolute animate-float"
            style={{ left: `calc(50% + ${Math.cos(angleRad) * r3}px)`, top: `calc(50% + ${Math.sin(angleRad) * r3}px)`, transform: 'translate(-50%, -50%)', animationDelay: `${i * 1.5}s` }}>
            <div className={`flex items-center justify-center ${isMobile ? 'w-7 h-7' : 'w-10 h-10'} bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/50 relative animate-pulse-scale`}>
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
    <div className="flex flex-col bg-[#F0F7FF] flex-1 overflow-hidden font-sans selection:bg-sky-100 relative">
      <div className="w-full flex-1 flex flex-col">
        {/* ─────────────────────────────────────────────────────────
                                HERO SECTION
            ───────────────────────────────────────────────────────── */}
        <section className="relative w-full flex-1 flex flex-col justify-center overflow-hidden">

          {/* Layer 1: Premium Background Depth */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#E0F2FE_0%,_#F0F9FF_40%,_#FFFFFF_100%)]" />
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#38BDF8] opacity-[0.04] blur-[120px] rounded-full" />
          </div>

          {/* Master Container */}
          <div className="relative z-10 w-full max-w-[1240px] mx-auto px-4 sm:px-12 flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-16 lg:gap-12">

            {/* Layer 2: Content Grid (Left Side) */}
            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-[580px]">

              {/* Pill Badge - Premium Tint (Removed) */}

              {/* Main Heading - Smooth Elegant Gradient */}
              <h1 className="text-[clamp(32px,5.5vw,56px)] font-black tracking-tight text-[#0F172A] leading-[1.05] mb-4 sm:mb-6">
                MindSprint{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-sky-300 drop-shadow-sm">
                  Challenge
                </span>
              </h1>

              {/* Value Paragraph - Slate 500 equivalent */}
              <p className="text-[15px] sm:text-[18px] text-[#64748B] font-medium leading-relaxed mb-8 sm:mb-10 max-w-[480px]">
                A high-precision environment designed for mathematical logic and cognitive speed.
              </p>

              {/* Primary CTA - Styled as 'START' - Compact Balanced Scale */}
              <button
                onClick={() => navigate('/student')}
                className="group relative inline-flex items-center justify-center gap-2.5 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-lg transition-all duration-300 shadow-md shadow-sky-500/20 hover:shadow-sky-600/30 hover:-translate-y-0.5 px-8 py-3"
              >
                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-0.5" />
                <span className="text-[15px] sm:text-[17px] font-bold tracking-tight uppercase">START</span>
              </button>

              {/* Supporting Stats Row (Removed) */}

            </div>

            {/* Layer 3: Visual Anchor (Right Side) */}
            <div className="flex-1 w-full max-w-[500px] lg:max-w-none flex justify-center lg:justify-end">

              {/* Abstract Orbital Visual Container */}
              <div className="relative w-[260px] h-[260px] sm:w-[340px] sm:h-[340px] md:w-[500px] md:h-[500px] flex items-center justify-center">

                {/* Soft Radial Backing Background - Extremely faint glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#38BDF805_0%,_transparent_70%)] animate-pulse" style={{ animationDuration: '6s' }} />

                {/* Central Element: Rotating Game Card */}
                <div className="relative z-20 w-full max-w-[400px] flex items-center justify-center">
                  <div className="p-3 sm:p-4 rounded-[40px] bg-white/30 backdrop-blur-xl border border-white/40 shadow-2xl shadow-sky-100/30">
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

