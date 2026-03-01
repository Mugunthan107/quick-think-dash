import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { ShieldCheck, Users, Activity, Trophy, Zap } from 'lucide-react';
import DecorativeCurve from './DecorativeCurve';

const IN_TEST_ROUTES = ['/game', '/crossmath', '/numlink', '/select-game', '/lobby', '/waiting-approval'];
const HIDE_CTA_ROUTES = ['/student', '/leaderboard'];

const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentStudent, students, adminLoggedIn } = useGame();

    const path = location.pathname;
    const inTest = IN_TEST_ROUTES.includes(path);
    const hideCta = HIDE_CTA_ROUTES.includes(path);
    const isAdmin = path === '/ashu';


    const finished = students.filter(s => s.isFinished).length;
    const active = students.filter(s => !s.isFinished).length;
    const isHome = path === '/';

    return (
        <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 flex flex-col ${isHome ? 'h-auto' : 'h-14'}`}>
            <div className={`h-14 flex items-center ${isHome ? 'bg-gradient-to-r from-[#EDE9FE]/95 to-[#F5F3FF]/95' : 'bg-white/95'} backdrop-blur-md border-b border-[#E6E1FF]/40 shadow-sm relative z-10`}>
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
                <div className="relative w-full max-w-[1200px] mx-auto px-6 sm:px-10 flex items-center justify-between gap-4">

                    {/* Left — Logo */}
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 group shrink-0">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#E6E1FF]">
                            <img
                                src="/favicon-round.png"
                                alt="MindSprint"
                                className="w-5 h-5 rounded-full object-contain"
                            />
                        </div>
                        <span className="font-bold text-[#111827] text-[15px] tracking-tight">
                            MindSprint
                        </span>
                    </button>

                    {/* Right */}
                    <div className="flex items-center gap-6">
                        {!hideCta && !inTest && !isAdmin && (
                            <button
                                onClick={() => navigate(path === '/about' ? '/' : '/about')}
                                className="hidden sm:block text-[13px] font-medium text-[#4B5563] hover:text-[#111827] transition-colors"
                            >
                                {path === '/about' ? 'Home' : 'About'}
                            </button>
                        )}

                        {isAdmin ? (
                            <div className="flex items-center gap-1.5 bg-[#6D4AFE]/10 border border-[#6D4AFE]/20 rounded-full px-3 py-1">
                                <span className="text-[11px] font-bold text-[#6D4AFE]">Admin Mode</span>
                            </div>
                        ) : inTest && currentStudent ? (
                            <button
                                onClick={() => navigate('/')}
                                className="text-[12px] font-semibold text-[#4B5563] hover:text-[#111827] bg-white border border-[#E6E1FF] rounded-lg px-4 py-1.5 transition-all shadow-sm"
                            >
                                Exit Test
                            </button>
                        ) : !hideCta ? (
                            <button
                                onClick={() => navigate('/student')}
                                className="bg-[#6D4AFE] hover:bg-[#6D4AFE]/90 text-white text-[13px] font-semibold rounded-xl px-5 py-2 transition-all shadow-md shadow-[#6D4AFE]/10"
                            >
                                Enter Test PIN
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Decorative Curvy Bottom (Home Page Only) */}
            {isHome && (
                <DecorativeCurve
                    height="h-[25px] sm:h-[35px]"
                    opacity={0.05}
                    className="relative z-0 -mt-[1px]"
                    animate={true}
                />
            )}
        </header>
    );
};

export default NavBar;
