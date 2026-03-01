import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { GameProvider } from "./context/GameContext";
import AnimatedBackground from "./components/AnimatedBackground";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import DecorativeCurve from "./components/DecorativeCurve";
import Index from "./pages/Index";
import StudentEntry from "./pages/StudentEntry";
import WaitingApproval from "./pages/WaitingApproval";
import BubbleGame from "./pages/BubbleGame";
import CrossMathGame from "./pages/CrossMathGame";
import NumLinkGame from "./pages/NumLinkGame";
import GameSelector from "./pages/GameSelector";
import AshuLogin from "./pages/AshuLogin";
import AshuDashboard from "./pages/AshuDashboard";
import Lobby from "./pages/Lobby";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import SupabaseTest from "./pages/SupabaseTest";
import About from "./pages/About";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isGame = ['/game', '/crossmath', '/numlink'].some(path => location.pathname.startsWith(path));
  const isHome = location.pathname === '/';

  return (
    <main className="pt-14 sm:pt-16 min-h-screen bg-[#F8F9FB] flex flex-col relative overflow-hidden">
      {/* Universal Top Decorative Curve (Hidden on Home and Games) */}
      {!isGame && !isHome && (
        <DecorativeCurve
          invert={true}
          opacity={0.04}
          height="h-[60px] sm:h-[100px]"
          className="absolute top-0 left-0 z-0"
        />
      )}

      {/* Global Light Blend from Navbar */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[#E4D9FD]/40 via-[#F8F9FB]/80 to-[#F8F9FB] pointer-events-none z-0" />

      {/* Ambient Floating Elements */}
      <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-accent/5 rounded-full blur-[80px] animate-float pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[10%] w-96 h-96 bg-[#DDC9FB]/20 rounded-full blur-[100px] animate-float-reverse pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[20%] w-72 h-72 bg-emerald-400/5 rounded-full blur-[90px] animate-float-delayed pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col flex-1 h-full w-full">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/student" element={<StudentEntry />} />
          <Route path="/waiting-approval" element={<WaitingApproval />} />
          <Route path="/game" element={<BubbleGame />} />
          <Route path="/crossmath" element={<CrossMathGame />} />
          <Route path="/numlink" element={<NumLinkGame />} />
          <Route path="/select-game" element={<GameSelector />} />
          {/* Ashu Routes */}
          <Route path="/ashu" element={<AshuDashboard />} />
          {/* No separate login route needed if Dashboard handles it */}
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/supabase-test" element={<SupabaseTest />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </main>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AnimatedBackground />
      <GameProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <NavBar />
          <AppContent />
          <Footer />
        </BrowserRouter>
      </GameProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
