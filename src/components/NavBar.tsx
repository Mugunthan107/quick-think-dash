import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { ShieldCheck, Users, Activity, Trophy, Zap } from 'lucide-react';

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
        <header className="fixed top-0 left-0 right-0 z-40 h-14 sm:h-[60px] flex items-center border-b border-border/50 glass-surface">
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ background: 'linear-gradient(135deg, hsl(255 72% 56%) 0%, hsl(280 70% 60%) 100%)' }}
            />
            <div className="relative w-full max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between gap-4">

                {/* Left */}
                <button onClick={() => navigate('/')} className="flex items-center gap-2.5 group">
                    <div className="relative">
                        <img
                            src="/favicon-round.png"
                            alt="MindSprint"
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-contain transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute -inset-0.5 rounded-full bg-accent/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                    </div>
                    <span className="font-semibold text-foreground text-sm sm:text-[15px] tracking-tight">
                        MindSprint
                    </span>
                </button>

                {/* Center */}
                <div className="flex-1 flex items-center justify-center">
                    {isAdmin && adminLoggedIn ? (
                        <div className="hidden sm:flex items-center gap-1.5">
                            {[
                                { icon: <Users className="w-3 h-3" />, value: students.length, label: 'joined', color: 'text-accent' },
                                { icon: <Activity className="w-3 h-3" />, value: active, label: 'active', color: 'text-success' },
                                { icon: <Trophy className="w-3 h-3" />, value: finished, label: 'done', color: 'text-amber-500' },
                            ].map(({ icon, value, label, color }) => (
                                <div key={label} className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] text-muted-foreground bg-secondary/80 border border-border/50">
                                    <span className={color}>{icon}</span>
                                    <span className="font-bold text-foreground tabular-nums">{value}</span>
                                    <span>{label}</span>
                                </div>
                            ))}
                        </div>
                    ) : inTest && currentStudent ? (
                        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Zap className="w-3 h-3 text-accent" />
                            <span>Playing as</span>
                            <span className="font-semibold text-foreground bg-accent/8 px-2 py-0.5 rounded-full">{currentStudent.username}</span>
                        </div>
                    ) : (
                        <span className="hidden sm:block text-[11px] font-medium tracking-[0.2em] text-muted-foreground/35 uppercase select-none pointer-events-none">
                            Think · Solve · Win
                        </span>
                    )}
                </div>

                {/* Right */}
                <div className="flex items-center gap-2">
                    {isAdmin ? (
                        <div className="flex items-center gap-1.5 bg-accent/8 border border-accent/20 rounded-full px-3 py-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                            <span className="text-[11px] font-semibold text-accent">Admin</span>
                        </div>
                    ) : inTest && currentStudent ? (
                        <button
                            onClick={() => navigate('/')}
                            className="text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 rounded-lg px-3.5 py-1.5 transition-all duration-200 border border-border/50"
                        >
                            Exit
                        </button>
                    ) : hideCta ? null : (
                        <button
                            onClick={() => navigate('/student')}
                            className="text-xs sm:text-sm font-semibold text-accent-foreground bg-accent hover:bg-accent/90 rounded-lg px-4 py-2 transition-all duration-200 btn-glow active:scale-[0.97]"
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
