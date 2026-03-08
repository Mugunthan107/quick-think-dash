import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { GameProvider } from "./context/GameContext";
import { FunProvider } from "./context/FunContext";
import AnimatedBackground from "./components/AnimatedBackground";
import FunLayer from "./components/FunLayer";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import DecorativeCurve from "./components/DecorativeCurve";
import WaveBackground from "./components/WaveBackground";
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
import { lazy, Suspense } from "react";
import { getRandomLoadingMessage } from "./context/FunContext";

const MotionChallenge = lazy(() => import("./pages/MotionChallenge"));
const AptiRush = lazy(() => import("./pages/AptiRush"));
const NumberSeriesGame = lazy(() => import("./pages/NumberSeriesGame"));
const MirrorImageGame = lazy(() => import("./pages/MirrorImageGame"));
const WaterImageGame = lazy(() => import("./pages/WaterImageGame"));
const NumberPuzzleGame = lazy(() => import("./pages/NumberPuzzleGame"));
const WaterColorSortGame = lazy(() => import("./pages/WaterColorSortGame"));

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isGame = ['/game', '/crossmath', '/numlink', '/motion-challenge', '/aptirush', '/number-series', '/mirror-image', '/water-image', '/number-puzzle', '/color-sort'].some(path => location.pathname.startsWith(path));
  const isDashboard = location.pathname.startsWith('/ashu');
  const isHome = location.pathname === '/';
  const noScroll = isHome || isGame || isDashboard || location.pathname === '/lobby' || location.pathname === '/select-game';
  const noFooter = isGame || isDashboard || isHome || location.pathname === '/select-game';

  return (
    <main className={`relative flex flex-col min-h-screen ${noScroll ? 'h-screen overflow-hidden pt-0' : 'pt-14 sm:pt-16'} bg-sky-50/20 flex flex-col relative overflow-hidden`}>
      <WaveBackground />

      <div className="relative z-10 flex flex-col flex-1 h-full w-full">
        <Suspense fallback={<div className="flex flex-col items-center justify-center min-h-screen gap-3"><div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" /><p className="text-xs text-muted-foreground font-medium animate-pulse">{getRandomLoadingMessage()}</p></div>}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/student" element={<StudentEntry />} />
            <Route path="/waiting-approval" element={<WaitingApproval />} />
            <Route path="/game" element={<BubbleGame />} />
            <Route path="/crossmath" element={<CrossMathGame />} />
            <Route path="/numlink" element={<NumLinkGame />} />
            <Route path="/motion-challenge" element={<MotionChallenge />} />
            <Route path="/aptirush" element={<AptiRush />} />
            <Route path="/number-series" element={<NumberSeriesGame />} />
            <Route path="/mirror-image" element={<MirrorImageGame />} />
            <Route path="/water-image" element={<WaterImageGame />} />
            <Route path="/number-puzzle" element={<NumberPuzzleGame />} />
            <Route path="/color-sort" element={<WaterColorSortGame />} />
            <Route path="/select-game" element={<GameSelector />} />
            <Route path="/ashu" element={<AshuDashboard />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/supabase-test" element={<SupabaseTest />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </main>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <FunProvider>
        <GameProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <NavBar />
            <AppContent />
            <FunLayer />
          </BrowserRouter>
        </GameProvider>
      </FunProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
