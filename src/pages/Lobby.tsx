import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Users, Loader2 } from 'lucide-react';
import DecorativeCurve from '@/components/DecorativeCurve';
import CountdownOverlay from '@/components/CountdownOverlay';

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
            <div className="flex flex-col flex-1 w-full bg-[#FDFDFF] font-sans selection:bg-indigo-100 min-h-screen relative overflow-hidden">
                {/* Layer 1: Premium Background Depth */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    {/* Soft Multi-Gradient Base */}
                    <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#F5F3FF_0%,_#ECFEFF_40%,_#FFFFFF_100%)]" />

                    {/* Very Faint Radial Glow behind Hero */}
                    <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#6C63FF] opacity-[0.03] blur-[120px] rounded-full" />
                </div>

                {/* === TOP WAVES (MATCHING LANDING) === */}
                {/* Top Wave - Tertiary (Deepest layer) */}
                <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -top-[80px] sm:-top-[120px] left-[-10%] w-[120%] z-0 rotate-180 pointer-events-none scale-x-[1.1] translate-x-4 mix-blend-multiply" animate={true} />
                {/* Top Wave - Secondary (Layered behind) */}
                <DecorativeCurve opacity={0.06} height="h-[350px] sm:h-[480px]" className="absolute -top-[50px] sm:-top-[80px] left-[-5%] w-[110%] z-0 rotate-180 pointer-events-none scale-x-[1.05]" animate={true} />
                {/* Top Wave - Primary */}
                <DecorativeCurve opacity={0.12} height="h-[250px] sm:h-[360px]" className="absolute top-0 left-0 z-0 rotate-180 pointer-events-none" animate={true} />

                <div className="flex flex-col flex-1 items-center justify-center p-4 relative z-10 w-full min-h-screen -mt-10 sm:-mt-12">
                    <div className="relative w-full max-w-[480px] space-y-8 animate-fade-in-up">
                        <div className="text-center space-y-3 px-4">
                            <h1 className="text-[32px] sm:text-[40px] font-black text-[#0F172A] tracking-tight leading-none">Game Lobby</h1>
                            <p className="text-[14px] sm:text-[15px] text-[#64748B] font-medium leading-relaxed max-w-[320px] mx-auto">Waiting for instructor to start the session</p>
                        </div>

                        <div className="bg-white/90 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-8 sm:p-10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] relative overflow-hidden">
                            {/* Decorative Corner Accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2563EB]/10 to-transparent -mr-16 -mt-16 rounded-full blur-2xl pointer-events-none" />

                            <div className="text-center mb-10 relative z-10">
                                <span className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-4">Session PIN</span>
                                <div className="inline-flex items-center justify-center bg-[#F8FAFC] border-2 border-[#2563EB] rounded-2xl px-8 py-4 shadow-sm group transition-all">
                                    <span className="font-mono text-4xl sm:text-5xl font-black text-[#2563EB] tracking-[0.2em] ml-[0.2em]">{currentTest.pin}</span>
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
                                        <div className="col-span-full py-8 text-center bg-[#F8FAFC]/50 border border-dashed border-[#E2E8F0] rounded-2xl">
                                            <p className="text-[#94A3B8] text-[13px] font-medium">No students joined yet</p>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-8 border-t border-[#F1F5F9] flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-3 text-[14px] text-[#64748B] font-semibold">
                                        <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin" />
                                        <span>Instructor will start shortly…</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* === BOTTOM WAVES (MATCHING LANDING) === */}
                {/* Bottom Wave - Tertiary (Deepest layer) */}
                <DecorativeCurve opacity={0.05} height="h-[400px] sm:h-[550px]" className="absolute -bottom-[80px] sm:-bottom-[120px] left-[-10%] w-[120%] z-0 pointer-events-none scale-x-[1.1] -translate-x-4 mix-blend-multiply" animate={true} />
                {/* Bottom Wave - Secondary (Layered behind) */}
                <DecorativeCurve opacity={0.07} height="h-[350px] sm:h-[480px]" className="absolute -bottom-[50px] sm:-bottom-[80px] left-[-5%] w-[110%] z-0 pointer-events-none scale-x-[1.05]" animate={true} />
                {/* Bottom Wave - Primary */}
                <DecorativeCurve opacity={0.12} height="h-[250px] sm:h-[360px]" className="absolute bottom-0 left-0 z-0 pointer-events-none" animate={true} />
            </div>
        </>
    );
};

export default Lobby;
