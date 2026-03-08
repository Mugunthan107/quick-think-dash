import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Users, Loader2 } from 'lucide-react';
import DecorativeCurve from '@/components/DecorativeCurve';
import CountdownOverlay from '@/components/CountdownOverlay';
import supabase from '@/utils/supabase';

const Lobby = () => {
    const { currentTest, currentStudent, students } = useGame();
    const navigate = useNavigate();
    const [showCountdown, setShowCountdown] = useState(false);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // React to real-time updates from GameContext
    useEffect(() => {
        if (!currentStudent || !currentTest) { navigate('/'); return; }
        if (currentTest.status === 'FINISHED') { navigate('/'); return; }
        if (currentTest.status === 'STARTED' && !showCountdown) setShowCountdown(true);
    }, [currentTest, currentStudent, navigate, showCountdown]);

    // Polling fallback: re-fetch session status every 3s in case real-time push is missed
    useEffect(() => {
        if (!currentTest?.pin || showCountdown) return;

        pollRef.current = setInterval(async () => {
            try {
                const { data } = await supabase
                    .from('test_sessions')
                    .select('status')
                    .eq('pin', currentTest.pin)
                    .single();

                if (data?.status === 'STARTED') {
                    setShowCountdown(true);
                } else if (data?.status === 'FINISHED') {
                    navigate('/');
                }
            } catch (_) {
                // silently ignore network errors during polling
            }
        }, 3000);

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [currentTest?.pin, showCountdown, navigate]);

    if (!currentStudent || !currentTest) return null;

    return (
        <>
            {showCountdown && <CountdownOverlay onComplete={() => navigate('/select-game')} />}
            <div className="flex flex-col flex-1 w-full bg-transparent font-sans selection:bg-sky-100 min-h-screen relative overflow-hidden">
                {/* Layer 1: Premium Background Depth */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-transparent" />
                </div>

                {/* Redundant Waves Removed */}

                <div className="flex flex-col flex-1 items-center justify-center p-4 relative z-10 w-full min-h-screen pt-20 sm:pt-24 pb-16">
                    <div className="relative w-full max-w-[480px] space-y-8 animate-fade-in-up">
                        <div className="text-center space-y-3 px-4">
                            <h1 className="text-[32px] sm:text-[40px] font-black text-[#0F172A] tracking-tight leading-none">Game Lobby</h1>
                            <p className="text-[14px] sm:text-[15px] text-[#64748B] font-medium leading-relaxed max-w-[320px] mx-auto">Waiting for instructor to start the session</p>
                        </div>

                        <div className="bg-white/90 backdrop-blur-2xl border border-sky-100 rounded-[2rem] p-8 sm:p-10 shadow-[0_20px_50px_-15px_rgba(56,189,248,0.1)] relative overflow-hidden">
                            {/* Decorative Corner Accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#38BDF8]/10 to-transparent -mr-16 -mt-16 rounded-full blur-2xl pointer-events-none" />

                            <div className="text-center mb-10 relative z-10">
                                <span className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-4">Session PIN</span>
                                <div className="inline-flex items-center justify-center bg-sky-50 border-2 border-sky-400 rounded-2xl px-8 py-4 shadow-sm group transition-all">
                                    <span className="font-mono text-4xl sm:text-5xl font-black text-sky-500 tracking-[0.2em] ml-[0.2em]">{currentTest.pin}</span>
                                </div>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                            <Users className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <span className="text-[14px] font-bold text-[#0F172A]">Students Joined</span>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-[12px] font-bold">{students.length}</span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {students.map((student, i) => (
                                        <div key={student.username}
                                            className="flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-sm animate-fade-in-up"
                                            style={{ animationDelay: `${i * 0.05}s` }}>
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[13px] font-bold text-[#334155] truncate">{student.username}</span>
                                        </div>
                                    ))}
                                    {students.length === 0 && (
                                        <div className="col-span-full py-8 text-center bg-sky-50/50 border border-dashed border-[#E2E8F0] rounded-2xl">
                                            <p className="text-[#94A3B8] text-[13px] font-medium">No students joined yet</p>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-8 border-t border-[#F1F5F9] flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-3 text-[14px] text-[#64748B] font-semibold">
                                        <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />
                                        <span>Instructor will start shortly…</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Redundant Waves Removed */}
            </div>
        </>
    );
};

export default Lobby;
