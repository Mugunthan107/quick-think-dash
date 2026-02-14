import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "./context/GameContext";
import AnimatedBackground from "./components/AnimatedBackground";
import Index from "./pages/Index";
import StudentEntry from "./pages/StudentEntry";
import BubbleGame from "./pages/BubbleGame";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
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
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/student" element={<StudentEntry />} />
            <Route path="/game" element={<BubbleGame />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
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
