import React, { useState, useEffect, useCallback } from 'react';
import { Play, Brain, Grid3X3, Link2, KeyRound, Gamepad2, Clock, Layers3, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DecorativeCurve from '@/components/DecorativeCurve';

/* ──────────────────── DATA ──────────────────── */

const showcaseGames = [
  {
    icon: Brain,
    name: 'Bubble Sort',
    tag: 'Sorting · Speed',
    desc: 'Sort mathematical expressions from lowest to highest value. Tests rapid calculation and decision-making under time pressure.',
    accentColor: '#6D4AFE',
    accentBg: 'rgba(109,74,254,0.06)',
    accentBorder: 'rgba(109,74,254,0.15)',
  },
  {
    icon: Grid3X3,
    name: 'Cross Math',
    tag: 'Logic · Analysis',
    desc: 'Solve grid-based arithmetic puzzles by placing correct values to satisfy both horizontal and vertical equations.',
    accentColor: '#3B82F6',
    accentBg: 'rgba(59,130,246,0.06)',
    accentBorder: 'rgba(59,130,246,0.15)',
  },
  {
    icon: Link2,
    name: 'NumLink',
    tag: 'Pattern · Spatial',
    desc: 'Connect numbers in sequence using valid paths. Enhances number sense, spatial reasoning, and strategic thinking.',
    accentColor: '#14B8A6',
    accentBg: 'rgba(20,184,166,0.06)',
    accentBorder: 'rgba(20,184,166,0.15)',
  },
];

const instructionSteps = [
  {
    icon: KeyRound,
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.08)',
    title: 'Enter Test PIN',
    desc: 'Enter the Test PIN shared by your instructor to join the live session.',
  },
  {
    icon: Gamepad2,
    color: '#14B8A6',
    bg: 'rgba(20,184,166,0.08)',
    title: 'Solve Challenges',
    desc: 'Solve logic, sorting, and pattern-based challenges in real time.',
  },
  {
    icon: Clock,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.08)',
    title: 'Await Results',
    desc: 'Wait for the instructor to end the session and release results.',
  },
];

/* ──────────────────── FLOATING SYMBOLS ──────────────────── */

const FloatingSymbols = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {/* Symbols — low opacity, gentle float */}
    <div className="absolute top-[12%] left-[8%] animate-float opacity-[0.07] text-[28px] font-bold text-[#6D4AFE]" style={{ animationDelay: '0s' }}>+</div>
    <div className="absolute top-[18%] right-[12%] animate-float-reverse opacity-[0.06] text-[24px] font-bold text-[#3B82F6]" style={{ animationDelay: '1s' }}>÷</div>
    <div className="absolute bottom-[22%] left-[15%] animate-float-delayed opacity-[0.07] text-[26px] font-bold text-[#14B8A6]" style={{ animationDelay: '2s' }}>×</div>
    <div className="absolute bottom-[30%] right-[10%] animate-float opacity-[0.06] text-[22px] font-bold text-[#F59E0B]" style={{ animationDelay: '0.5s' }}>−</div>
    <div className="absolute top-[40%] left-[4%] animate-float-reverse opacity-[0.05] text-[20px] font-bold text-[#6366F1]" style={{ animationDelay: '1.5s' }}>∑</div>
    <div className="absolute top-[8%] left-[45%] animate-float-delayed opacity-[0.05] text-[18px] font-bold text-[#6D4AFE]" style={{ animationDelay: '2.5s' }}>π</div>
    {/* Hide extras on mobile */}
    <div className="hidden sm:block absolute bottom-[12%] right-[25%] animate-float opacity-[0.05] text-[20px] font-bold text-[#3B82F6]" style={{ animationDelay: '3s' }}>√</div>
    <div className="hidden sm:block absolute top-[55%] right-[5%] animate-float-delayed opacity-[0.04] text-[16px] font-bold text-[#14B8A6]" style={{ animationDelay: '1.2s' }}>∞</div>
  </div>
);

/* ──────────────────── ROTATING SHOWCASE ──────────────────── */

const RotatingShowcase = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [animState, setAnimState] = useState<'in' | 'out'>('in');
  const [paused, setPaused] = useState(false);

  const rotateToNext = useCallback(() => {
    setAnimState('out');
    setTimeout(() => {
      setActiveIdx(prev => (prev + 1) % showcaseGames.length);
      setAnimState('in');
    }, 350);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(rotateToNext, 3000);
    return () => clearInterval(timer);
  }, [paused, rotateToNext]);

  const game = showcaseGames[activeIdx];

  return (
    <div
      className="relative w-full max-w-[420px] mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Soft halo behind card */}
      <div
        className="absolute inset-0 rounded-3xl opacity-40 blur-3xl pointer-events-none -z-10"
        style={{ background: `radial-gradient(circle, ${game.accentColor}12 0%, transparent 70%)` }}
      />

      {/* Card */}
      <div
        className={`card-float p-8 sm:p-10 ${animState === 'in' ? 'animate-showcase-in' : 'animate-showcase-out'}`}
        style={{ perspective: '1200px' }}
      >
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: game.accentBg, border: `1.5px solid ${game.accentBorder}` }}
        >
          <game.icon className="w-7 h-7" style={{ color: game.accentColor }} />
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-[#111827] mb-1">{game.name}</h3>
        <span className="text-[11px] font-semibold uppercase tracking-widest mb-4 block" style={{ color: game.accentColor }}>
          {game.tag}
        </span>
        <p className="text-[14px] text-[#4B5563] leading-relaxed">{game.desc}</p>
      </div>

      {/* Dots indicator */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {showcaseGames.map((g, i) => (
          <button
            key={i}
            onClick={() => {
              if (i === activeIdx) return;
              setAnimState('out');
              setTimeout(() => { setActiveIdx(i); setAnimState('in'); }, 350);
            }}
            className="transition-all duration-300 rounded-full"
            style={{
              width: i === activeIdx ? 24 : 8,
              height: 8,
              background: i === activeIdx ? g.accentColor : '#E5E7EB',
            }}
          />
        ))}
      </div>
    </div>
  );
};

/* ──────────────────── INSTRUCTIONS CARD ──────────────────── */

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
    <div id="instructions-card" className="w-full max-w-[560px] mx-auto animate-fade-in-up">
      <div className="instruction-card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[16px] font-bold text-[#111827]">How to Participate</h3>
          <button
            onClick={() => {
              setVisible(false);
              window.history.replaceState(null, '', window.location.pathname);
            }}
            className="text-[12px] font-medium text-[#9CA3AF] hover:text-[#4B5563] transition-colors"
          >
            Close
          </button>
        </div>
        <div className="space-y-5">
          {instructionSteps.map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: step.bg }}
              >
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

/* ──────────────────── PAGE ──────────────────── */

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FB] font-sans selection:bg-[#6D4AFE]/15">

      {/* ───── HERO ───── */}
      <section className="relative w-full min-h-[calc(100vh-56px)] flex flex-col justify-center overflow-hidden pt-14">

        {/* Top curve */}
        <DecorativeCurve
          invert
          opacity={0.04}
          height="h-[40px] sm:h-[70px] lg:h-[100px]"
          className="absolute top-0 left-0 z-10"
          animate
        />

        {/* Floating math symbols */}
        <FloatingSymbols />

        {/* Subtle radial background hint */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#6D4AFE]/[0.03] blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-10 flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-20 py-12 lg:py-0">

          {/* Left — Text */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-[540px]">

            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white/80 px-3.5 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#6D4AFE] opacity-75 animate-ping" style={{ animationDuration: '2s' }}></span>
                <span className="relative inline-flex rounded-full w-2 h-2 bg-[#6D4AFE]"></span>
              </span>
              <span className="text-[11px] font-semibold tracking-[0.12em] text-[#6D4AFE]/80 uppercase">Cognitive Assessment Platform</span>
            </div>

            {/* Heading */}
            <h1 className="text-[clamp(32px,5vw,48px)] font-extrabold tracking-tight text-[#111827] leading-[1.1] mb-4">
              Think Fast.{' '}
              <span className="text-[#6D4AFE]">Solve Smart.</span>
            </h1>

            {/* Description */}
            <p className="text-[15px] sm:text-[16px] text-[#4B5563] leading-relaxed mb-8 max-w-[460px]">
              A professional assessment environment for mathematical logic, pattern recognition, and speed. Join live sessions to benchmark cognitive performance.
            </p>

            {/* CTA */}
            <button
              onClick={() => navigate('/student')}
              className="group btn-primary font-semibold rounded-xl px-8 py-3.5 flex items-center gap-2.5 text-[15px]"
            >
              <Play className="w-4 h-4 fill-white" />
              Enter Test PIN
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-1 group-hover:ml-0 transition-all duration-200" />
            </button>

            {/* Stats row */}
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-3 flex-wrap">
              {[
                { icon: Layers3, text: '3 Game Modes', color: '#6366F1' },
                { icon: Zap, text: 'Live Scoring', color: '#14B8A6' },
                { icon: Clock, text: 'Timed Rounds', color: '#F59E0B' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-full px-3 py-1.5">
                  <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                  <span className="text-[11px] font-medium text-[#4B5563]">{s.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Rotating Showcase */}
          <div className="flex-1 w-full max-w-[480px] flex justify-center">
            <RotatingShowcase />
          </div>
        </div>

        {/* Bottom curve */}
        <DecorativeCurve
          opacity={0.04}
          height="h-[40px] sm:h-[70px] lg:h-[100px]"
          className="absolute bottom-0 left-0 z-10"
          animate
        />
      </section>

      {/* ───── INSTRUCTIONS (inline reveal) ───── */}
      <section id="instructions" className="relative z-10 w-full py-12 bg-[#F8F9FB]">
        <div className="max-container">
          <InstructionsCard />
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section className="relative z-10 w-full py-20 bg-white">
        <div className="max-container">
          <div className="mb-12 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">How MindSprint Works</h2>
            <p className="text-[#9CA3AF] mt-2 text-[14px]">Structured assessment flow for institutional precision.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: '01', icon: KeyRound, label: 'Join Session', desc: 'Secure initialization using a unique proctor PIN to sync all students.', color: '#3B82F6' },
              { num: '02', icon: Gamepad2, label: 'Dynamic Assessment', desc: 'Escalating math-logic challenges that benchmark speed and accuracy.', color: '#6366F1' },
              { num: '03', icon: Brain, label: 'Performance Audit', desc: 'Real-time metrics provide instant analytics for academic evaluation.', color: '#14B8A6' },
            ].map((step) => (
              <div
                key={step.num}
                className="card-float p-7 group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${step.color}0F`, border: `1.5px solid ${step.color}25` }}
                  >
                    <step.icon className="w-5 h-5" style={{ color: step.color }} />
                  </div>
                  <span className="text-[13px] font-bold" style={{ color: step.color }}>{step.num}</span>
                </div>
                <h3 className="text-[16px] font-bold text-[#111827] mb-2">{step.label}</h3>
                <p className="text-[13px] text-[#4B5563] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── BOTTOM CTA ───── */}
      <section className="relative z-10 w-full py-20 bg-[#F8F9FB]">
        <div className="max-container">
          <div className="max-w-[480px] mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-4">Ready to Begin?</h2>
            <p className="text-[14px] text-[#4B5563] mb-8 leading-relaxed">
              Enter your unique session PIN to initialize the assessment. Ensure you are in a quiet environment.
            </p>
            <button
              onClick={() => navigate('/student')}
              className="btn-primary font-semibold rounded-xl px-10 py-3.5 text-[15px] w-full sm:w-auto"
            >
              Start Assessment
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
