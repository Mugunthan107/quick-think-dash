import React, { useState, useEffect } from 'react';
import { Play, Brain, Grid3X3, Link2, KeyRound, Gamepad2, BarChart3, Layers3, Activity, ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DecorativeCurve from '@/components/DecorativeCurve';

/* ──────────────────── DATA ──────────────────── */

const games = [
  {
    icon: Brain,
    name: 'Bubble',
    desc: 'Sort mathematical expressions from lowest to highest value. Tests quick calculation and decision-making under time pressure.',
    color: 'hsl(258 76% 55%)',
    bg: 'hsl(258 76% 96%)'
  },
  {
    icon: Grid3X3,
    name: 'Cross Math',
    desc: 'Solve grid-based arithmetic puzzles by placing correct values to satisfy both horizontal and vertical equations.',
    color: 'hsl(158 68% 40%)',
    bg: 'hsl(158 68% 95%)'
  },
  {
    icon: Link2,
    name: 'NumLink',
    desc: 'Connect numbers in sequence using valid paths within the grid. Enhances number sense, spatial reasoning, and pattern recognition.',
    color: 'hsl(210 90% 55%)',
    bg: 'hsl(210 90% 95%)'
  },
];

const steps = [
  { num: 1, icon: KeyRound, label: 'Enter Test PIN', desc: 'Get your session PIN from the instructor' },
  { num: 2, icon: Gamepad2, label: 'Play Games', desc: 'Solve puzzles and beat the clock across 3 games' },
  { num: 3, icon: BarChart3, label: 'View Results', desc: 'See real-time rankings on the live leaderboard' },
];

/* ──────────────────── COMPONENTS ──────────────────── */

// A fun component that randomly updates its number and color
const AnimatedNumber = ({ initialNum, delay, pos, size, floatType, style }: { initialNum: number, delay: string, pos: string, size: string, floatType: string, style?: React.CSSProperties }) => {
  const [num, setNum] = useState(initialNum);
  const [colorIdx, setColorIdx] = useState(initialNum % 5);

  const colors = [
    'text-rose-500',
    'text-blue-500',
    'text-emerald-500',
    'text-amber-500',
    'text-purple-500' // Using default tailwind colors for guaranteed contrast
  ];

  useEffect(() => {
    // Random interval between 2s and 4s for each number so they don't change all at once
    const intervalTime = Math.floor(Math.random() * 2000) + 2000;

    const interval = setInterval(() => {
      setNum(Math.floor(Math.random() * 10)); // 0-9
      setColorIdx(prev => (prev + 1) % colors.length); // Cycle through colors
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`absolute ${pos} ${floatType}`} style={{ ...style, animationDelay: delay }}>
      <div
        className={`flex items-center justify-center bg-white/60 backdrop-blur-md rounded-full shadow-md border border-white/80 animate-pulse-scale ${size}`}
        style={{ animationDelay: delay }}
      >
        <span className={`font-black transition-colors duration-500 ${colors[colorIdx]} opacity-70`}>
          {num}
        </span>
      </div>
    </div>
  );
};

const AnimatedNumbers = () => {
  return (
    <>
      <AnimatedNumber initialNum={8} delay="0.3s" pos="top-[8%] left-[38%]" size="w-14 h-14 text-[30px]" floatType="animate-float" />
      <AnimatedNumber initialNum={5} delay="1.1s" pos="top-[48%] right-[-8%]" size="w-12 h-12 text-[24px]" floatType="animate-float-reverse" />
      <AnimatedNumber initialNum={3} delay="0.8s" pos="bottom-[2%] left-[42%]" size="w-10 h-10 text-[20px]" floatType="animate-float-delayed" />
      <AnimatedNumber initialNum={9} delay="1.6s" pos="bottom-[40%] left-[-6%]" size="w-8 h-8 text-[16px]" floatType="animate-float" />
      <AnimatedNumber initialNum={0} delay="2.1s" pos="top-[28%] right-[2%]" size="w-6 h-6 text-[12px]" floatType="animate-float-reverse" />
    </>
  );
};

/* ──────────────────── PAGE ──────────────────── */

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col bg-[#F8F9FB] min-h-screen font-sans selection:bg-accent/20">

      {/* ─────────────────────────────────────────────────────────
                             HERO SECTION
          ───────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[calc(100vh-60px)] lg:min-h-[85vh] flex flex-col justify-center overflow-hidden pt-12">
        {/* Top Decorative Curve - Professional Canvas Frame */}
        <DecorativeCurve
          invert={true}
          opacity={0.05}
          height="h-[60px] sm:h-[100px] lg:h-[130px]"
          className="absolute top-0 left-0 z-10"
          animate={true}
        />

        {/* Layer 1: Background Depth (Framed Canvas) */}
        <div className="absolute inset-x-0 inset-y-0 z-0 pointer-events-none">
          {/* Base Background (Outside the curve) */}
          <div className="absolute inset-0 bg-[#F8F9FB]" />

          {/* Hero Canvas (Inside the curves) */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#F5F3FF] to-[#F8F9FB] opacity-80" />

          {/* Radial Highlight - Extremely Subtle (Center) */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#6D4AFE03_0%,_transparent_60%)] blur-2xl" />
        </div>

        {/* Master Container */}
        <div className="relative z-10 w-full max-w-[1240px] mx-auto px-6 sm:px-12 flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-12">

          {/* Layer 2: Content Grid (Left Side) */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-[580px]">


            {/* Pill Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E6E1FF] bg-white/80 backdrop-blur-sm px-3.5 py-1.5 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6D4AFE] opacity-75"></span>
                <span className="relative inline-flex rounded-full w-2 h-2 bg-[#6D4AFE]"></span>
              </span>
              <span className="text-[11px] font-bold tracking-[0.15em] text-[#6D4AFE]/80 uppercase">Interactive Assessment Platform</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-[clamp(36px,5vw,52px)] font-extrabold tracking-tight text-[#111827] leading-[1.1] mb-5">
              MindSprint{' '}
              <span className="text-[#6D4AFE]">Challenge</span>
            </h1>

            {/* Value Paragraph */}
            <p className="text-[17px] text-[#4B5563] leading-relaxed mb-8 max-w-[480px]">
              The professional assessment environment for mathematical logic and speed. Join live sessions to benchmark precision and mental agility.
            </p>

            {/* Primary CTA */}
            <button
              onClick={() => navigate('/student')}
              className="group relative inline-flex items-center justify-center gap-3 bg-[#6D4AFE] hover:bg-[#6D4AFE]/95 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#6D4AFE]/15 px-10 py-4"
            >
              {/* Internal subtle glow sweep effect */}
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <Play className="w-4 h-4 fill-white" />
              <span className="text-[15.5px]">Enter Test PIN</span>
            </button>

            {/* Supporting Stats Row */}
            <div className="mt-12 flex items-center justify-center lg:justify-start gap-4 flex-wrap">
              {[
                { i: Layers3, t: '30+ Levels', c: 'text-[#6366F1]', bg: 'bg-[#6366F1]/10' },
                { i: Gamepad2, t: '3 Game Modes', c: 'text-[#14B8A6]', bg: 'bg-[#14B8A6]/10' },
                { i: Zap, t: 'Live Results', c: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center gap-2 border border-[#E5E7EB] bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${stat.bg}`}>
                    <stat.i className={`w-3 h-3 ${stat.c}`} />
                  </div>
                  <span className="text-[12px] font-semibold text-[#4B5563]">{stat.t}</span>
                </div>
              ))}
            </div>

          </div>

          {/* Layer 3: Visual Anchor (Right Side) */}
          <div className="flex-1 w-full max-w-[500px] lg:max-w-none flex justify-center lg:justify-end">

            {/* Abstract Orbital Visual Container */}
            <div className="relative w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] flex items-center justify-center">

              {/* Soft Radial Backing Background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(258_76%_98%_/_0.8)_0%,_transparent_70%)] animate-pulse" style={{ animationDuration: '4s' }} />

              {/* Central Element: Large Logo */}
              <div className="relative z-20 w-[140px] h-[140px] sm:w-[170px] sm:h-[170px] bg-white rounded-full shadow-[0_0_0_1px_rgba(258,76,55,0.05),_0_24px_48px_-12px_rgba(100,60,200,0.25)] flex items-center justify-center animate-float">
                <img src="/favicon-round.png" alt="MindSprint" className="w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] object-contain ml-2" />
                {/* Inner Glow Core */}
                <div className="absolute inset-0 rounded-full shadow-[inset_0_0_30px_rgba(258,76,55,0.05)] pointer-events-none" />
              </div>

              {/* Orbital Path Rings (Subtle) */}
              <div className="absolute w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] border border-accent/[0.04] rounded-full pointer-events-none" />
              <div className="absolute w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] border border-accent/[0.02] rounded-full pointer-events-none" />

              {/* Supporting Elements - Orbiting Math & Logic Symbols */}
              <div className="absolute w-full h-full z-10 pointer-events-none">

                {/* Plus Symbol (Top Right) */}
                <div className="absolute top-[15%] right-[20%] w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-[#E6E1FF] flex items-center justify-center animate-float" style={{ animationDelay: '0.2s', transform: 'rotate(12deg)' }}>
                  <span className="text-[24px] font-bold text-[#6D4AFE]">+</span>
                </div>

                {/* Division Symbol (Top Left) */}
                <div className="absolute top-[25%] left-[10%] w-10 h-10 bg-white/80 backdrop-blur-md rounded-[14px] shadow-sm border border-[#E6E1FF] flex items-center justify-center animate-float" style={{ animationDelay: '0.7s', transform: 'rotate(-15deg)' }}>
                  <span className="text-[22px] font-bold text-[#22C55E]">÷</span>
                </div>

                {/* Multiplication Symbol (Bottom Right) */}
                <div className="absolute bottom-[28%] right-[8%] w-11 h-11 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-[#E6E1FF] flex items-center justify-center animate-float" style={{ animationDelay: '1.2s', transform: 'rotate(-8deg)' }}>
                  <span className="text-[24px] font-bold text-[#F59E0B]">×</span>
                </div>

                {/* Minus Symbol (Bottom Left) */}
                <div className="absolute bottom-[18%] left-[22%] w-10 h-10 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-[#E5E7EB] flex items-center justify-center animate-float" style={{ animationDelay: '0.5s', transform: 'rotate(10deg)' }}>
                  <span className="text-[26px] font-bold text-[#6366F1] leading-none mb-1">−</span>
                </div>

                {/* Logic/Brain Icon (Far Top Right) */}
                <div className="absolute top-[5%] right-[5%] w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-[#E6E1FF] flex items-center justify-center animate-float" style={{ animationDelay: '0.9s' }}>
                  <Brain className="w-4 h-4 text-[#6D4AFE]/60" />
                </div>

                {/* Grid/Pattern Icon (Far Bottom Left) */}
                <div className="absolute bottom-[5%] left-[8%] w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-[#E6E1FF] flex items-center justify-center animate-float" style={{ animationDelay: '1.5s' }}>
                  <Grid3X3 className="w-4 h-4 text-[#22C55E]/60" />
                </div>

                {/* Random Numbers from 0 to 9 scaling higher to lower (Dynamic Component) */}
                <AnimatedNumbers />

              </div>

            </div>
          </div>

        </div>

        {/* Bottom Decorative Curve - Professional Canvas Frame */}
        <DecorativeCurve
          opacity={0.05}
          height="h-[60px] sm:h-[100px] lg:h-[130px]"
          className="absolute bottom-0 left-0 z-10"
          animate={true}
        />

      </section>


      {/* ─── SECTION 1: HOW IT WORKS ─── */}
      <section className="relative z-10 w-full py-20 bg-white border-t border-[#E6E1FF]/30">
        <div className="max-container">

          <div className="text-left mb-12">
            <h2 className="text-3xl font-bold text-[#111827] tracking-tight">How MindSprint Works</h2>
            <p className="text-[#9CA3AF] mt-2 text-[15px]">A structured assessment flow designed for institutional precision.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '01', icon: KeyRound, label: 'Join Session', desc: 'Secure initialization using a unique proctor PIN to sync all students.', numColor: 'text-[#3B82F6]', bg: 'hover:shadow-[#3B82F6]/5' },
              { num: '02', icon: Gamepad2, label: 'Dynamic Assessment', desc: 'Escalating math-logic challenges that benchmark speed and accuracy.', numColor: 'text-[#6366F1]', bg: 'hover:shadow-[#6366F1]/5' },
              { num: '03', icon: BarChart3, label: 'Performance Audit', desc: 'Real-time metrics provide instant analytics for academic evaluation.', numColor: 'text-[#14B8A6]', bg: 'hover:shadow-[#14B8A6]/5' },
            ].map((step) => (
              <div key={step.num} className={`p-8 bg-[#F8F9FB] border border-[#E5E7EB] rounded-2xl transition-all hover:bg-white hover:shadow-xl ${step.bg}`}>
                <span className={`text-[14px] font-bold ${step.numColor} mb-4 block`}>{step.num}</span>
                <h3 className="text-[17px] font-bold text-[#111827] mb-3">{step.label}</h3>
                <p className="text-[14px] text-[#4B5563] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ─── SECTION 2: THE GAMES ─── */}
      <section className="relative z-10 w-full py-20 bg-[#F8F9FB]">
        <div className="max-container">

          <div className="text-left mb-12">
            <h2 className="text-3xl font-bold text-[#111827] tracking-tight">Assessment Categories</h2>
            <p className="text-[#9CA3AF] mt-2 text-[15px]">Targeted cognitive modules serving distinct logic domains.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Bubble Sort', g: 'Sorting', icon: Brain, desc: 'Sort mathematical expressions by value using rapid estimation.', iconColor: 'text-[#6D4AFE]', iconBg: 'bg-[#6D4AFE]/8', tagColor: 'text-[#6D4AFE]', cardHover: 'hover:shadow-[#6D4AFE]/8' },
              { name: 'Cross Math', g: 'Logic', icon: Grid3X3, desc: 'Solve arithmetic grids that test multi-variable logical deduction.', iconColor: 'text-[#3B82F6]', iconBg: 'bg-[#3B82F6]/8', tagColor: 'text-[#3B82F6]', cardHover: 'hover:shadow-[#3B82F6]/8' },
              { name: 'NumLink', g: 'Pattern', icon: Layers3, desc: 'Connect sequences in complex paths to audit spatial reasoning.', iconColor: 'text-[#14B8A6]', iconBg: 'bg-[#14B8A6]/8', tagColor: 'text-[#14B8A6]', cardHover: 'hover:shadow-[#14B8A6]/8' },
            ].map((g) => (
              <div key={g.name} className={`flex flex-col bg-white rounded-2xl p-8 border border-[#E5E7EB] shadow-sm transition-all hover:shadow-lg ${g.cardHover}`}>
                <div className={`w-12 h-12 rounded-xl ${g.iconBg} flex items-center justify-center mb-6`}>
                  <g.icon className={`w-6 h-6 ${g.iconColor}`} />
                </div>
                <h3 className="text-[17px] font-bold text-[#111827] mb-1">{g.name}</h3>
                <span className={`text-[11px] font-bold ${g.tagColor} uppercase tracking-wider mb-4`}>{g.g}</span>
                <p className="text-[14px] text-[#4B5563] leading-relaxed flex-1">{g.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ─── SECTION 3: BOTTOM CTA ─── */}
      <section className="relative z-10 w-full py-24 bg-white">
        <div className="max-container">
          <div className="max-w-[500px] mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#111827] mb-4">Start Assessment</h2>
            <p className="text-[#4B5563] mb-10 text-[16px] leading-relaxed">
              Enter your unique session PIN to initialize the assessment. Ensure you are in a quiet environment for the evaluation.
            </p>
            <button
              onClick={() => navigate('/student')}
              className="bg-[#6D4AFE] hover:bg-[#6D4AFE]/95 text-white font-bold rounded-xl px-12 py-4 shadow-lg shadow-[#6D4AFE]/15 transition-all w-full sm:w-auto"
            >
              Initialize Live Session
            </button>
          </div>
        </div>
      </section>




    </div>
  );
}
