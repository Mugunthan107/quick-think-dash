import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, Brain, Zap, Target } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Brain, label: 'Mental Agility', desc: 'Train your brain' },
    { icon: Zap, label: 'Speed Rounds', desc: 'Beat the clock' },
    { icon: Target, label: 'Precision', desc: 'Accuracy matters' },
  ];

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-60px)] items-center justify-center px-4 bg-background relative overflow-hidden">

      {/* Subtle ambient glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none animate-glow-pulse"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(255 72% 56% / 0.04) 0%, transparent 70%)',
          animation: 'glow-pulse 4s ease-in-out infinite',
        }}
      />

      {/* Decorative grid dots */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: 'radial-gradient(hsl(255 72% 56%) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-[560px] mx-auto">

        {/* Logo with float animation */}
        <div className="mb-8 animate-fade-in-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto card-elevated animate-float">
              <img
                src="/favicon-round.png"
                alt="MindSprint"
                className="w-14 h-14 sm:w-18 sm:h-18 object-contain"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center animate-pulse-ring">
              <Sparkles className="w-3 h-3 text-accent-foreground" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-3">
            <span className="text-foreground">Mind</span>
            <span className="text-accent">Sprint</span>
            <span className="text-foreground"> Challenge</span>
          </h1>
        </div>

        {/* Description */}
        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          <p className="text-[15px] text-muted-foreground leading-relaxed max-w-[420px] mb-8">
            Push your mental agility to the limit. Solve rapid-fire math puzzles across escalating levels of difficulty.
          </p>
        </div>

        {/* CTA Button */}
        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
          <button
            onClick={() => navigate('/student')}
            className="group relative inline-flex items-center gap-2.5 bg-accent text-accent-foreground font-semibold text-sm rounded-xl px-7 h-12
              hover:shadow-[0_8px_30px_hsl(255_72%_56%/0.25)] hover:-translate-y-0.5
              transition-all duration-300 active:translate-y-0 active:scale-[0.97] btn-glow"
          >
            <Play className="w-4 h-4 fill-white transition-transform duration-300 group-hover:scale-110" />
            Enter Test PIN
          </button>
        </div>

        {/* Feature pills */}
        <div className="mt-10 flex items-center gap-3 animate-fade-in-up opacity-0" style={{ animationDelay: '0.55s', animationFillMode: 'forwards' }}>
          {features.map((f, i) => (
            <div
              key={f.label}
              className="flex items-center gap-1.5 bg-secondary/60 border border-border/50 rounded-full px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-accent/5 hover:border-accent/20 hover:text-accent transition-all duration-300 cursor-default"
            >
              <f.icon className="w-3 h-3" />
              <span className="font-medium">{f.label}</span>
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
          <p className="mt-8 text-[10px] text-muted-foreground/30 tracking-[0.2em] uppercase font-medium select-none">
            Math · Speed · Precision
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
