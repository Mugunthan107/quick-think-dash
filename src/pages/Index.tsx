import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-58px)] items-center justify-center px-4 bg-background">
      <div className="relative z-10 flex flex-col items-center text-center max-w-[520px] mx-auto">

        {/* Logo */}
        <div className="mb-7">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-background border border-border flex items-center justify-center mx-auto">
            <img
              src="/favicon-round.png"
              alt="MindSprint"
              className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-snug mb-3">
          <span className="text-foreground">MindSprint </span>
          <span className="text-accent">Challenge</span>
        </h1>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[400px] mb-8">
          Push your mental agility to the limit. Solve rapid-fire math puzzles across escalating levels of difficulty.
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate('/student')}
          className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-medium text-sm rounded-lg px-6 h-10
            hover:opacity-90 transition-opacity active:scale-[0.98]"
        >
          <Play className="w-4 h-4 fill-white" />
          Enter Test PIN
        </button>

        {/* Tagline */}
        <p className="mt-10 text-[11px] text-muted-foreground/40 tracking-[0.15em] uppercase font-medium select-none">
          Math · Speed · Precision
        </p>

      </div>
    </div>
  );
};

export default Index;
