import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Play } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative z-10">
      <div className="text-center animate-fade-in w-full max-w-2xl px-4">
        <div className="flex justify-center mb-12">
          <img
            src="/favicon-round.png"
            alt="MindSprint Logo"
            className="w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
          />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 tracking-tight">
          MindSprint Challenge
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed mb-12 max-w-sm mx-auto">
          Push your mental agility to the limit. Solve rapid-fire math problems across escalating levels of difficulty.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-72 mx-auto">
          <Button
            onClick={() => navigate('/student')}
            className="w-full h-14 bg-accent text-accent-foreground hover:bg-accent/90 text-base font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-5 h-5 mr-2" />
            Enter Test PIN
          </Button>

        </div>

        <p className="text-[11px] text-muted-foreground/60 mt-10 sm:mt-12">
          Sort math expressions from lowest to highest value
        </p>
      </div>
    </div>
  );
};

export default Index;
