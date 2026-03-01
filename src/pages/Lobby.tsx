import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Loader2, Users, User, Wifi } from 'lucide-react';
import CountdownOverlay from '@/components/CountdownOverlay';
import GradientBg from '@/components/GradientBg';

const Lobby = () => {
    const { currentTest, currentStudent, students } = useGame();
    const navigate = useNavigate();
    const [showCountdown, setShowCountdown] = useState(false);

    useEffect(() => {
        if (!currentStudent || !currentTest) { navigate('/'); return; }
        if (currentTest.status === 'FINISHED') { navigate('/'); return; }
        if (currentTest.status === 'STARTED' && !showCountdown) setShowCountdown(true);
    }, [currentTest, currentStudent, navigate, showCountdown]);

    if (!currentStudent || !currentTest) return null;

    return (
        <>
            {showCountdown && <CountdownOverlay onComplete={() => navigate('/select-game')} />}
            <div className="page-bg min-h-screen p-4 sm:p-6">
                <GradientBg />
                <div className="page-content relative max-w-4xl mx-auto space-y-6 text-center pt-10">

                    {/* Spinner */}
                    <div className="space-y-4 animate-fade-in-up opacity-0" style={{ animationFillMode: 'forwards' }}>
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto">
                            <div className="w-full h-full rounded-2xl icon-bg-purple flex items-center justify-center glow-purple-md">
                                <Loader2 className="w-9 h-9 sm:w-11 sm:h-11 text-accent animate-spin" />
                            </div>
                            <div className="absolute -inset-2 rounded-3xl blur-xl -z-10 animate-pulse"
                                style={{ background: 'hsl(258 76% 70% / 0.15)' }} />
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground">Waiting for Host</h1>
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Wifi className="w-4 h-4 text-emerald-600 animate-pulse" />
                            <p className="text-base font-medium">
                                <span className="font-bold text-foreground">{students.length}</span> student{students.length !== 1 ? 's' : ''} joined
                            </p>
                        </div>
                    </div>

                    {/* Students card */}
                    <div className="card-glass rounded-2xl p-6 animate-fade-in-up opacity-0"
                        style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
                        <div className="flex items-center justify-center gap-2 mb-5">
                            <Users className="w-4 h-4 text-accent" />
                            <span className="font-bold text-foreground uppercase tracking-widest text-xs">Connected Students</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                            {students.map((student, i) => {
                                const isMe = student.username === currentStudent.username;
                                return (
                                    <div key={student.username}
                                        className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all duration-200 animate-fade-in-scale opacity-0
                                          ${isMe ? 'bg-accent/8 border-accent/30' : 'bg-white/60 border-white/80 hover:border-accent/20'}`}
                                        style={{
                                            animationDelay: `${i * 0.03}s`, animationFillMode: 'forwards',
                                            boxShadow: isMe ? '0 0 14px hsl(258 76% 55% / 0.14)' : undefined,
                                        }}>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-accent text-white' : 'icon-bg-purple'}`}>
                                            <User className={`w-3.5 h-3.5 ${isMe ? 'text-white' : 'text-accent'}`} />
                                        </div>
                                        <span className={`font-medium truncate text-xs ${isMe ? 'text-accent' : 'text-foreground'}`}>
                                            {student.username}{isMe && ' (You)'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 pt-5 border-t border-border/60 flex flex-col items-center gap-1.5">
                            <p className="text-xs text-muted-foreground font-medium">Test PIN</p>
                            <span className="font-mono text-2xl font-bold text-accent tracking-[0.25em] bg-accent/6 px-6 py-2.5 rounded-xl border border-accent/20 glow-purple"
                                style={{ textShadow: '0 0 20px hsl(258 76% 55% / 0.25)' }}>
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
