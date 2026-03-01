import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Loader2, Users, User, Wifi } from 'lucide-react';
import CountdownOverlay from '@/components/CountdownOverlay';

const Lobby = () => {
    const { currentTest, currentStudent, students } = useGame();
    const navigate = useNavigate();
    const [showCountdown, setShowCountdown] = useState(false);

    useEffect(() => {
        if (!currentStudent || !currentTest) {
            navigate('/');
            return;
        }

        if (currentTest.status === 'STARTED' && !showCountdown) {
            setShowCountdown(true);
        }
    }, [currentTest, currentStudent, navigate, showCountdown]);

    if (!currentStudent || !currentTest) return null;

    return (
        <>
            {showCountdown && <CountdownOverlay onComplete={() => navigate('/select-game')} />}

            <div className="min-h-screen p-4 sm:p-6 bg-background relative">
                {/* Dot grid */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.012]"
                    style={{
                        backgroundImage: 'radial-gradient(hsl(255 72% 56%) 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                    }}
                />

                <div className="relative max-w-4xl mx-auto space-y-8 text-center mt-8">

                    <div className="space-y-4 animate-fade-in-up opacity-0" style={{ animationFillMode: 'forwards' }}>
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent/8 rounded-2xl flex items-center justify-center mx-auto relative">
                            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-accent animate-spin" />
                            <div className="absolute -inset-1 rounded-2xl bg-accent/10 blur-md -z-10 animate-pulse" />
                        </div>

                        <h1 className="text-2xl sm:text-4xl font-bold text-foreground">
                            Waiting for Host
                        </h1>
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Wifi className="w-4 h-4 text-success animate-pulse" />
                            <p className="text-base font-medium">
                                {students.length} student{students.length !== 1 ? 's' : ''} joined
                            </p>
                        </div>
                    </div>

                    <div className="bg-card rounded-2xl p-6 border border-border card-elevated animate-fade-in-up opacity-0" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <Users className="w-5 h-5 text-accent" />
                            <span className="font-semibold text-foreground uppercase tracking-wider text-sm">
                                Connected Students
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {students.map((student, i) => (
                                <div
                                    key={student.username}
                                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all duration-200 animate-fade-in-scale opacity-0 ${
                                        student.username === currentStudent.username
                                            ? 'bg-accent/5 border-accent/30'
                                            : 'bg-card border-border hover:border-accent/15'
                                    }`}
                                    style={{ animationDelay: `${i * 0.03}s`, animationFillMode: 'forwards' }}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                        student.username === currentStudent.username
                                            ? 'bg-accent text-accent-foreground'
                                            : 'bg-secondary text-muted-foreground'
                                    }`}>
                                        <User className="w-4 h-4" />
                                    </div>
                                    <span className={`font-medium truncate text-sm ${
                                        student.username === currentStudent.username ? 'text-accent' : 'text-foreground'
                                    }`}>
                                        {student.username} {student.username === currentStudent.username && '(You)'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-border flex flex-col items-center gap-2">
                            <p className="text-sm text-muted-foreground font-medium">Using Test PIN</p>
                            <span className="font-mono text-2xl font-bold text-foreground tracking-[0.2em] bg-accent/5 px-5 py-2.5 rounded-xl border border-accent/15">
                                {currentTest.pin}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Lobby;
