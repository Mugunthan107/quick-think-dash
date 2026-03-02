import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { BookOpen, ShieldCheck } from 'lucide-react';

const IN_TEST_ROUTES = ['/game', '/crossmath', '/numlink', '/select-game', '/lobby', '/waiting-approval'];

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentStudent, adminLoggedIn } = useGame();

  const path = location.pathname;
  const inTest = IN_TEST_ROUTES.includes(path);
  const isAdmin = path === '/ashu';
  const isHome = path === '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      <div className="h-14 flex items-center navbar-glass">
        <div className="w-full max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-10 flex items-center justify-between">

          {/* Left — Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center border border-[#6D4AFE]/10">
              <img
                src="/favicon-round.png"
                alt="MindSprint"
                className="w-5 h-5 rounded-sm object-contain"
              />
            </div>
            <span className="font-bold text-[#111827] text-[15px] tracking-tight">
              MindSprint
            </span>
          </button>

          {/* Center tagline — desktop only */}
          {isHome && (
            <span className="hidden md:block text-[12px] font-medium text-[#9CA3AF] tracking-wide">
              Think · Solve · Win
            </span>
          )}

          {/* Right */}
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <div className="flex items-center gap-1.5 bg-[#6D4AFE]/8 border border-[#6D4AFE]/15 rounded-full px-3 py-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#6D4AFE]" />
                <span className="text-[11px] font-semibold text-[#6D4AFE]">Admin</span>
              </div>
            ) : inTest && currentStudent ? (
              <button
                onClick={() => navigate('/')}
                className="text-[12px] font-medium text-[#4B5563] hover:text-[#111827] bg-white border border-[#E5E7EB] rounded-lg px-4 py-1.5 transition-colors"
              >
                Exit
              </button>
            ) : isHome ? (
              <a
                href="#instructions"
                className="btn-ghost-lavender text-[13px] font-medium rounded-lg px-4 py-1.5 flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Instructions
              </a>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="text-[13px] font-medium text-[#4B5563] hover:text-[#111827] transition-colors"
              >
                Home
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
