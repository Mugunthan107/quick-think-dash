import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Play } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">
            Cognitive Assessment
          </h1>
          <p className="text-muted-foreground text-sm">
            Test your mental math speed and accuracy
          </p>
        </div>

        <div className="flex flex-col gap-3 w-64 mx-auto">
          <Button
            onClick={() => navigate('/student')}
            className="w-full h-14 bg-accent text-accent-foreground hover:bg-accent/90 text-base font-semibold"
          >
            <Play className="w-5 h-5 mr-2" />
            Enter Test PIN
          </Button>
          <Button
            onClick={() => navigate('/admin-login')}
            variant="outline"
            className="w-full h-12 border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <Shield className="w-4 h-4 mr-2" />
            Admin Login
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-10">
          Select bubbles from lowest to highest value
        </p>
      </div>
    </div>
  );
};

export default Index;
