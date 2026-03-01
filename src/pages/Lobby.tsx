import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Loader2, Users, User } from 'lucide-react';
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

            <div className="min-h-screen p-4 sm:p-6">
                <div className="max-w-4xl mx-auto space-y-8 animate-fade-in text-center mt-8">

                    <div className="space-y-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-accent animate-spin" />
                        </div>

                        <h1 className="text-2xl sm:text-4xl font-bold text-foreground">
                            Waiting for Host
                        </h1>
                        <p className="text-muted-foreground text-lg font-medium">
                            {students.length} student{students.length !== 1 ? 's' : ''} joined. The test will start shortly.
                        </p>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-[0_8px_24px_hsl(260_40%_90%/0.6)]">
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <Users className="w-5 h-5 text-accent" />
                            <span className="font-semibold text-foreground uppercase tracking-wider text-sm">
                                Connected Students
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {students.map((student) => (
                                <div
                                    key={student.username}
                                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${student.username === currentStudent.username
                                        ? 'bg-accent/8 border-accent/40 shadow-sm'
                                        : 'bg-white border-border'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${student.username === currentStudent.username
                                        ? 'bg-accent text-accent-foreground'
                                        : 'bg-secondary text-muted-foreground'
                                        }`}>
                                        <User className="w-4 h-4" />
                                    </div>
                                    <span className={`font-medium truncate text-sm ${student.username === currentStudent.username ? 'text-accent' : 'text-foreground'
                                        }`}>
                                        {student.username} {student.username === currentStudent.username && '(You)'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-border flex flex-col items-center gap-2">
                            <p className="text-sm text-muted-foreground font-medium">Using Test PIN</p>
                            <span className="font-mono text-2xl font-bold text-foreground tracking-[0.2em] bg-secondary px-4 py-2 rounded-lg border border-border">
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
