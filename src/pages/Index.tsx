import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-[calc(100vh-3.75rem)] sm:min-h-[calc(100vh-4rem)] items-center justify-center px-4 overflow-hidden bg-white">

      {/* One soft radial glow — barely visible */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[700px] h-[480px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(265 85% 62% / 0.07) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-[560px] mx-auto">

        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white shadow-[0_2px_16px_hsl(260_30%_88%/0.8)] border border-border flex items-center justify-center mx-auto hover:scale-105 transition-transform duration-300">
            <img
              src="/favicon-round.png"
              alt="MindSprint"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-snug mb-4">
          <span className="text-foreground">MindSprint </span>
          <span className="text-accent">Challenge</span>
        </h1>

        {/* Description */}
        <p className="text-[15px] text-muted-foreground leading-7 max-w-[420px] mb-9">
          Push your mental agility to the limit. Solve rapid-fire math puzzles across escalating levels of difficulty.
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate('/student')}
          className="inline-flex items-center gap-2 bg-accent text-white font-medium text-sm rounded-lg px-6 h-11
            shadow-[0_4px_16px_hsl(265_80%_60%/0.22)] hover:bg-accent/90 hover:-translate-y-px
            hover:shadow-[0_6px_20px_hsl(265_80%_60%/0.28)] transition-all duration-200 active:translate-y-0 active:scale-[0.98]"
        >
          <Play className="w-4 h-4 fill-white" />
          Enter Test PIN
        </button>

        {/* Tagline */}
        <p className="mt-10 text-[11px] text-muted-foreground/40 tracking-[0.18em] uppercase font-medium select-none">
          Math · Speed · Precision
        </p>

      </div>
    </div>
  );
};

export default Index;
