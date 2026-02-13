import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Play, Brain } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative z-10">
      <div className="text-center animate-fade-in w-full max-w-sm px-2">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-accent/10">
          <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 tracking-tight">
          Cognitive Assessment
        </h1>
        <p className="text-muted-foreground text-sm mb-8 sm:mb-10 max-w-xs mx-auto">
          Test your mental math speed and accuracy across 15 levels of increasing difficulty
        </p>

        <div className="flex flex-col gap-3 w-full max-w-72 mx-auto">
          <Button
            onClick={() => navigate('/student')}
            className="w-full h-14 bg-accent text-accent-foreground hover:bg-accent/90 text-base font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-5 h-5 mr-2" />
            Enter Test PIN
          </Button>
          <Button
            onClick={() => navigate('/admin-login')}
            variant="outline"
            className="w-full h-12 border-border text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all"
          >
            <Shield className="w-4 h-4 mr-2" />
            Admin Login
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
