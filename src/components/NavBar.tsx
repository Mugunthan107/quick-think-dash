import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { ShieldCheck, Users, Activity, Trophy } from 'lucide-react';

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

    return (
        <header className="fixed top-0 left-0 right-0 z-40 h-14 sm:h-[58px] flex items-center" style={{ background: 'hsl(262 52% 65%)' }}>
            <div className="w-full max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between gap-4">

                {/* Left */}
                <button onClick={() => navigate('/')} className="flex items-center gap-2.5 group">
                    <img
                        src="/favicon-round.png"
                        alt="MindSprint"
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-contain"
                    />
                    <span className="font-medium text-white text-sm tracking-tight">
                        MindSprint
                    </span>
                </button>

                {/* Center */}
                <div className="flex-1 flex items-center justify-center">
                    {isAdmin && adminLoggedIn ? (
                        <div className="hidden sm:flex items-center gap-1.5">
                            {[
                                { icon: <Users className="w-3 h-3" />, value: students.length, label: 'joined' },
                                { icon: <Activity className="w-3 h-3" />, value: active, label: 'active' },
                                { icon: <Trophy className="w-3 h-3" />, value: finished, label: 'done' },
                            ].map(({ icon, value, label }) => (
                                <div key={label} className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-white/70 bg-white/10">
                                    <span className="text-white/80">{icon}</span>
                                    <span className="font-semibold text-white tabular-nums">{value}</span>
                                    <span>{label}</span>
                                </div>
                            ))}
                        </div>
                    ) : inTest && currentStudent ? (
                        <span className="hidden sm:block text-xs text-white/70">
                            Playing as <span className="font-medium text-white">{currentStudent.username}</span>
                        </span>
                    ) : (
                        <span className="hidden sm:block text-[11px] font-medium tracking-[0.2em] text-white/40 uppercase select-none pointer-events-none">
                            Think · Solve · Win
                        </span>
                    )}
                </div>

                {/* Right */}
                <div className="flex items-center gap-2">
                    {isAdmin && adminLoggedIn ? (
                        <div className="flex items-center gap-1.5 bg-white/15 rounded-md px-2.5 py-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-white" />
                            <span className="text-[11px] font-medium text-white">Admin</span>
                        </div>
                    ) : inTest && currentStudent ? (
                        <button
                            onClick={() => navigate('/')}
                            className="text-xs font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/15 rounded-lg px-3 py-1.5 transition-colors"
                        >
                            Exit
                        </button>
                    ) : hideCta ? null : (
                        <button
                            onClick={() => navigate('/student')}
                            className="text-xs sm:text-sm font-medium text-accent bg-white hover:bg-white/90 rounded-lg px-4 py-2 transition-colors"
                        >
                            Enter Test PIN
                        </button>
                    )}
                </div>

            </div>
        </header>
    );
};

export default NavBar;
