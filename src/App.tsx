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
import { lazy, Suspense } from "react";

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
    <main className={`relative flex flex-col min-h-screen ${noScroll ? 'h-screen overflow-hidden pt-0' : 'pt-14 sm:pt-16'} bg-[#F0F7FF] flex flex-col relative overflow-hidden`}>
      {!isGame && !isHome && (
        <DecorativeCurve invert={true} opacity={0.04} height="h-[60px] sm:h-[100px]" className="absolute top-0 left-0 z-0" />
      )}
      {!isHome && !isGame && (
        <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[#E0F2FE]/40 via-[#F0F9FF]/80 to-[#F0F7FF] pointer-events-none z-0" />
      )}
      {!isHome && !isGame && (
        <>
          <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-sky-200/10 rounded-full blur-[80px] animate-float pointer-events-none z-0" />
          <div className="absolute top-[40%] right-[10%] w-96 h-96 bg-sky-100/20 rounded-full blur-[100px] animate-float-reverse pointer-events-none z-0" />
          <div className="absolute bottom-[20%] left-[20%] w-72 h-72 bg-sky-300/5 rounded-full blur-[90px] animate-float-delayed pointer-events-none z-0" />
        </>
      )}

      <div className="relative z-10 flex flex-col flex-1 h-full w-full">
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" /></div>}>
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
        </BrowserRouter>
      </GameProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
