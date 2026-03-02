import React, { useState, useEffect, useCallback } from 'react';
import { Play, Brain, Grid3X3, Link2, KeyRound, Gamepad2, Clock, Layers3, Zap, ArrowRight, BookOpen, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
=======
import DecorativeCurve from '@/components/DecorativeCurve';
<<<<<<< HEAD
>>>>>>> parent of d7b7b0b (commit)
=======
>>>>>>> parent of d7b7b0b (commit)

/* ──────────────────── ORBITAL FLOATING NUMBERS ──────────────────── */

const OrbitingNumbers = () => {
  // Numbers orbit around a central circle
  const orbitItems = [
    { num: '7', size: 52, orbitRadius: 140, speed: 25, delay: 0, color: '#2563EB' },
    { num: '3', size: 40, orbitRadius: 170, speed: 30, delay: -8, color: '#3B82F6' },
    { num: '+', size: 36, orbitRadius: 120, speed: 22, delay: -5, color: '#60A5FA' },
    { num: '9', size: 44, orbitRadius: 190, speed: 35, delay: -12, color: '#1D4ED8' },
    { num: '÷', size: 34, orbitRadius: 155, speed: 28, delay: -18, color: '#93C5FD' },
    { num: '5', size: 38, orbitRadius: 200, speed: 32, delay: -3, color: '#2563EB' },
    { num: '×', size: 32, orbitRadius: 130, speed: 20, delay: -15, color: '#60A5FA' },
    { num: '2', size: 46, orbitRadius: 180, speed: 27, delay: -10, color: '#3B82F6' },
  ];

  return (
    <div className="relative w-[320px] h-[320px] sm:w-[420px] sm:h-[420px]">
      {/* Outer orbit rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] rounded-full border border-[#2563EB]/[0.06]" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] rounded-full border border-[#2563EB]/[0.04]" />
      </div>

      {/* Center circle */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] rounded-full bg-white shadow-[0_8px_40px_rgba(37,99,235,0.12),_0_0_0_1px_rgba(37,99,235,0.06)] flex items-center justify-center">
          <img src="/favicon-round.png" alt="MindSprint" className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] object-contain" />
        </div>
      </div>

      {/* Soft halo behind center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="w-[200px] h-[200px] sm:w-[260px] sm:h-[260px] rounded-full bg-[#2563EB]/[0.04] blur-2xl" />
      </div>

      {/* Orbiting numbers */}
      {orbitItems.map((item, i) => (
        <div
          key={i}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            animation: `spin-orbit ${item.speed}s linear infinite`,
            animationDelay: `${item.delay}s`,
          }}
        >
          <div
            className="absolute flex items-center justify-center rounded-full bg-white shadow-[0_2px_12px_rgba(37,99,235,0.10)] border border-[#2563EB]/[0.08]"
            style={{
              width: item.size,
              height: item.size,
              top: `calc(50% - ${item.orbitRadius}px - ${item.size / 2}px)`,
              left: `calc(50% - ${item.size / 2}px)`,
              animation: `counter-spin ${item.speed}s linear infinite`,
              animationDelay: `${item.delay}s`,
            }}
          >
            <span
              className="font-bold select-none"
              style={{
                fontSize: item.size * 0.45,
                color: item.color,
                opacity: 0.8,
              }}
            >
              {item.num}
            </span>
          </div>
        </div>
      ))}

      {/* Mobile: reduce to fewer items via CSS */}
      <style>{`
        @keyframes spin-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes counter-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @media (max-width: 640px) {
          .orbit-hide-mobile { display: none; }
        }
      `}</style>
    </div>
  );
};

/* ──────────────────── INSTRUCTIONS CARD ──────────────────── */

const instructionSteps = [
  {
    icon: KeyRound,
    color: '#2563EB',
    bg: 'rgba(37,99,235,0.07)',
    title: 'Enter Test PIN',
    desc: 'Enter the Test PIN shared by your instructor to join the live session.',
  },
  {
    icon: Gamepad2,
    color: '#0EA5E9',
    bg: 'rgba(14,165,233,0.07)',
    title: 'Solve Challenges',
    desc: 'Solve logic, sorting, and pattern-based challenges in real time.',
  },
  {
    icon: Clock,
    color: '#6366F1',
    bg: 'rgba(99,102,241,0.07)',
    title: 'Await Results',
    desc: 'Wait for the instructor to end the session and release results.',
  },
];

const InstructionsCard = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#instructions') {
        setVisible(true);
        setTimeout(() => {
          document.getElementById('instructions-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  if (!visible) return null;

  return (
    <div id="instructions-card" className="w-full max-w-[540px] mx-auto animate-fade-in-up">
      <div className="bg-white rounded-2xl border border-[#2563EB]/10 shadow-[0_4px_24px_rgba(37,99,235,0.06)] p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[16px] font-bold text-[#111827]">How to Participate</h3>
          <button
            onClick={() => { setVisible(false); window.history.replaceState(null, '', window.location.pathname); }}
            className="text-[12px] font-medium text-[#9CA3AF] hover:text-[#4B5563] transition-colors"
          >
            Close
          </button>
        </div>
        <div className="space-y-5">
          {instructionSteps.map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: step.bg }}>
                <step.icon className="w-5 h-5" style={{ color: step.color }} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#111827] mb-0.5">Step {i + 1}: {step.title}</p>
                <p className="text-[13px] text-[#4B5563] leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ──────────────────── GAME CARDS ──────────────────── */

const gameCards = [
  {
    icon: Brain,
    name: 'Bubble Sort',
    tag: 'Sorting',
    desc: 'Sort mathematical expressions from lowest to highest value under time pressure.',
    color: '#2563EB',
    bg: 'rgba(37,99,235,0.05)',
  },
  {
    icon: Grid3X3,
    name: 'Cross Math',
    tag: 'Logic',
    desc: 'Solve grid-based arithmetic puzzles satisfying horizontal and vertical equations.',
    color: '#0EA5E9',
    bg: 'rgba(14,165,233,0.05)',
  },
  {
    icon: Link2,
    name: 'NumLink',
    tag: 'Pattern',
    desc: 'Connect numbers in sequence using valid paths to test spatial reasoning.',
    color: '#6366F1',
    bg: 'rgba(99,102,241,0.05)',
  },
];

/* ──────────────────── PAGE ──────────────────── */

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans selection:bg-[#2563EB]/10">

      {/* ───── HERO ───── */}
      <section className="relative w-full min-h-[calc(100vh-56px)] flex items-center overflow-hidden pt-14">

        {/* Subtle background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-[#F0F4FF] rounded-bl-[80px] sm:rounded-bl-[120px]" />
          <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full bg-[#2563EB]/[0.03] blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 py-10 lg:py-0">

          {/* Left — Text */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-[520px]">

            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2563EB]/10 bg-[#2563EB]/[0.04] px-3.5 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#2563EB] opacity-60 animate-ping" style={{ animationDuration: '2s' }} />
                <span className="relative inline-flex rounded-full w-2 h-2 bg-[#2563EB]" />
              </span>
              <span className="text-[11px] font-semibold tracking-[0.1em] text-[#2563EB] uppercase">Live Assessment Platform</span>
            </div>

            {/* Heading */}
            <h1 className="text-[clamp(30px,5vw,46px)] font-extrabold tracking-tight text-[#111827] leading-[1.12] mb-4">
              Think Fast.{' '}
              <span className="text-[#2563EB]">Solve Smart.</span>
            </h1>

            {/* Description */}
            <p className="text-[15px] text-[#4B5563] leading-relaxed mb-8 max-w-[440px]">
              Professional cognitive assessment for mathematical logic, pattern recognition, and speed. Benchmark performance in real-time sessions.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate('/student')}
                className="group bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl px-8 py-3.5 flex items-center justify-center gap-2.5 text-[15px] transition-all duration-200 w-full sm:w-auto shadow-[0_4px_16px_rgba(37,99,235,0.20)]"
              >
                <Play className="w-4 h-4 fill-white" />
                Enter Test PIN
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-1 group-hover:ml-0 transition-all duration-200" />
              </button>
              <a
                href="#instructions"
                className="text-[14px] font-medium text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                How it works
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Stats */}
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-3 flex-wrap">
              {[
                { icon: Layers3, text: '3 Game Modes', color: '#2563EB' },
                { icon: Zap, text: 'Live Scoring', color: '#0EA5E9' },
                { icon: Clock, text: 'Timed Rounds', color: '#6366F1' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-full px-3 py-1.5 shadow-sm">
                  <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                  <span className="text-[11px] font-medium text-[#4B5563]">{s.text}</span>
                </div>
              ))}
            </div>
          </div>

<<<<<<< HEAD
          {/* Right — Orbiting Numbers */}
          <div className="flex-1 w-full flex justify-center lg:justify-end">
            <OrbitingNumbers />
=======
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
>>>>>>> parent of d7b7b0b (commit)
          </div>
        </div>
      </section>

      {/* ───── INSTRUCTIONS (inline) ───── */}
      <section id="instructions" className="relative z-10 w-full py-10">
        <div className="max-container">
          <InstructionsCard />
        </div>
      </section>

      {/* ───── GAME CATEGORIES ───── */}
      <section className="relative z-10 w-full py-20 bg-[#F8FAFF]">
        <div className="max-container">
          <div className="mb-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">Assessment Modules</h2>
            <p className="text-[#9CA3AF] mt-2 text-[14px]">Three targeted cognitive challenges designed for precision evaluation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[900px] mx-auto">
            {gameCards.map((g) => (
              <div
                key={g.name}
                className="bg-white rounded-2xl p-7 border border-[#E5E7EB] shadow-sm hover:shadow-[0_8px_30px_rgba(37,99,235,0.08)] hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: g.bg, border: `1.5px solid ${g.color}18` }}
                >
                  <g.icon className="w-6 h-6" style={{ color: g.color }} />
                </div>
                <h3 className="text-[16px] font-bold text-[#111827] mb-1">{g.name}</h3>
                <span className="text-[11px] font-semibold uppercase tracking-wider mb-3 block" style={{ color: g.color }}>{g.tag}</span>
                <p className="text-[13px] text-[#4B5563] leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* ───── HOW IT WORKS ───── */}
      <section className="relative z-10 w-full py-20 bg-white">
=======

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


<<<<<<< HEAD
=======
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


>>>>>>> parent of d7b7b0b (commit)
      {/* ─── SECTION 3: BOTTOM CTA ─── */}
      <section className="relative z-10 w-full py-24 bg-white">
>>>>>>> parent of d7b7b0b (commit)
        <div className="max-container">
          <div className="mb-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">How It Works</h2>
            <p className="text-[#9CA3AF] mt-2 text-[14px]">Simple three-step assessment flow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[900px] mx-auto">
            {[
              { num: '01', icon: KeyRound, label: 'Join Session', desc: 'Enter the unique proctor PIN to sync with your assessment group.', color: '#2563EB' },
              { num: '02', icon: Gamepad2, label: 'Solve Challenges', desc: 'Complete escalating math-logic puzzles benchmarking speed and accuracy.', color: '#0EA5E9' },
              { num: '03', icon: Brain, label: 'Get Results', desc: 'Performance metrics are computed in real-time for instant evaluation.', color: '#6366F1' },
            ].map((step) => (
              <div
                key={step.num}
                className="bg-[#F8FAFF] rounded-2xl p-7 border border-[#E5E7EB] hover:bg-white hover:shadow-[0_8px_30px_rgba(37,99,235,0.06)] transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${step.color}0D`, border: `1.5px solid ${step.color}20` }}
                  >
                    <step.icon className="w-5 h-5" style={{ color: step.color }} />
                  </div>
                  <span className="text-[13px] font-bold" style={{ color: step.color }}>{step.num}</span>
                </div>
                <h3 className="text-[15px] font-bold text-[#111827] mb-2">{step.label}</h3>
                <p className="text-[13px] text-[#4B5563] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── BOTTOM CTA ───── */}
      <section className="relative z-10 w-full py-20 bg-[#F8FAFF]">
        <div className="max-container">
          <div className="max-w-[460px] mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-4">Ready to Begin?</h2>
            <p className="text-[14px] text-[#4B5563] mb-8 leading-relaxed">
              Enter your session PIN to start the cognitive assessment.
            </p>
            <button
              onClick={() => navigate('/student')}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl px-10 py-3.5 text-[15px] transition-all duration-200 shadow-[0_4px_16px_rgba(37,99,235,0.20)] w-full sm:w-auto"
            >
              Start Assessment
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
