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
        <header className="fixed top-0 left-0 right-0 z-40 h-15 sm:h-16 bg-white border-b border-[hsl(260_20%_92%)] flex items-center">
            <div className="w-full max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between gap-4">

                {/* Left */}
                <button onClick={() => navigate('/')} className="flex items-center gap-2 group">
                    <img
                        src="/favicon-round.png"
                        alt="MindSprint"
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-contain"
                    />
                    <span className="font-medium text-foreground text-sm sm:text-[15px] tracking-tight">
                        MindSprint
                    </span>
                </button>

                {/* Center */}
                <div className="flex-1 flex items-center justify-center">
                    {isAdmin && adminLoggedIn && (
                        <div className="hidden sm:flex items-center gap-1.5">
                            {[
                                { icon: <Users className="w-3 h-3" />, value: students.length, label: 'joined' },
                                { icon: <Activity className="w-3 h-3" />, value: active, label: 'active' },
                                { icon: <Trophy className="w-3 h-3" />, value: finished, label: 'done' },
                            ].map(({ icon, value, label }) => (
                                <div key={label} className="flex items-center gap-1 border border-border rounded-md px-2.5 py-1 text-[11px] text-muted-foreground">
                                    <span className="text-accent">{icon}</span>
                                    <span className="font-semibold text-foreground tabular-nums">{value}</span>
                                    <span>{label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {inTest && currentStudent && (
                        <span className="hidden sm:block text-xs text-muted-foreground">
                            Playing as <span className="font-semibold text-foreground">{currentStudent.username}</span>
                        </span>
                    )}
                    {!isAdmin && !inTest && (
                        <span className="hidden sm:block text-[11px] font-medium tracking-[0.2em] text-muted-foreground/45 uppercase select-none pointer-events-none">
                            Think. Solve. Win.
                        </span>
                    )}
                </div>

                {/* Right */}
                <div className="flex items-center gap-2">
                    {isAdmin && adminLoggedIn ? (
                        <div className="flex items-center gap-1.5 border border-accent/30 rounded-md px-2.5 py-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                            <span className="text-[11px] font-semibold text-accent">Admin</span>
                        </div>
                    ) : inTest && currentStudent ? (
                        <button
                            onClick={() => navigate('/')}
                            className="text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 transition-colors hover:bg-secondary"
                        >
                            Exit
                        </button>
                    ) : hideCta ? null : (
                        <button
                            onClick={() => navigate('/student')}
                            className="text-xs sm:text-sm font-medium text-accent border border-accent/50 rounded-lg px-4 py-2 transition-all
                hover:bg-accent hover:text-white hover:border-accent hover:shadow-sm active:scale-[0.98]"
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
