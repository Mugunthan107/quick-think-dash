import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "./context/GameContext";
import AnimatedBackground from "./components/AnimatedBackground";
import Index from "./pages/Index";
import StudentEntry from "./pages/StudentEntry";
import WaitingApproval from "./pages/WaitingApproval";
import BubbleGame from "./pages/BubbleGame";
import CrossMathGame from "./pages/CrossMathGame";
import GameSelector from "./pages/GameSelector";
import AshuLogin from "./pages/AshuLogin";
import AshuDashboard from "./pages/AshuDashboard";
import Lobby from "./pages/Lobby";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import SupabaseTest from "./pages/SupabaseTest";

const queryClient = new QueryClient();

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
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/student" element={<StudentEntry />} />
            <Route path="/waiting-approval" element={<WaitingApproval />} />
            <Route path="/game" element={<BubbleGame />} />
            <Route path="/crossmath" element={<CrossMathGame />} />
            <Route path="/select-game" element={<GameSelector />} />
            {/* Ashu Routes */}
            <Route path="/ashu" element={<AshuDashboard />} />
            {/* No separate login route needed if Dashboard handles it */}
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/supabase-test" element={<SupabaseTest />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
