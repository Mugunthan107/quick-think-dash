import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Loader2, ShieldAlert, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import supabase from '@/utils/supabase';
import DecorativeCurve from '@/components/DecorativeCurve';

const WaitingApproval = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { joinTest } = useGame();
    const { pin, username } = location.state || {};
    const [isRejected, setIsRejected] = useState(false);

    useEffect(() => {
        if (!pin || !username) { navigate('/'); return; }
        const channel = supabase
            .channel(`player-approval-${username}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'exam_results', filter: `student_name=eq.${username}` },
                (payload) => {
                    const data = payload.new as any;
                    if (!data || data.test_pin !== pin) return;
                    if (data.status === 'APPROVED') joinTest(pin, username).then(r => { if (r.success) navigate('/lobby'); });
                    else if (data.status === 'REJECTED') setIsRejected(true);
                })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [pin, username, navigate, joinTest]);

    if (isRejected) {
        return (
            <div className="flex flex-col flex-1 w-full bg-[#FDFDFF] font-sans selection:bg-indigo-100 min-h-screen relative overflow-hidden">
                {/* Layer 1: Premium Background Depth */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#FEF2F2_0%,_#FDFDFD_60%,_#FDFDFF_100%)]" />
                    <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#EF4444] opacity-[0.03] blur-[120px] rounded-full" />
                </div>

                <DecorativeCurve
                    opacity={0.04}
                    height="h-[400px] sm:h-[550px]"
                    className="absolute -top-[100px] sm:-top-[150px] -left-[10%] w-[120%] z-0 rotate-180 pointer-events-none mix-blend-multiply"
                    animate={true}
                />

                <div className="flex flex-col items-center justify-center p-4 relative z-10 w-full min-h-screen -mt-10 sm:-mt-12">
                    <div className="relative max-w-[400px] w-full text-center space-y-8 bg-white/90 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-8 sm:p-10 shadow-[0_20px_50px_-15px_rgba(239,68,68,0.06)] animate-fade-in">
                        <div className="relative w-16 h-16 mx-auto">
                            <div className="w-full h-full rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center shadow-md shadow-red-500/5">
                                <ShieldAlert className="w-8 h-8 text-[#EF4444]" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-[28px] font-black text-[#0F172A] tracking-tight leading-none mb-3">Request Rejected</h1>
                            <p className="text-[15px] text-[#64748B] font-medium leading-relaxed">The admin has declined your request to join this session.</p>
                        </div>
                        <Button onClick={() => navigate('/')} className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[18px] h-[52px] font-bold text-[15px] shadow-lg shadow-blue-500/20 transition-all">
                            Return Home
                        </Button>
                    </div>
                </div>

                <DecorativeCurve
                    opacity={0.04}
                    height="h-[400px] sm:h-[550px]"
                    className="absolute -bottom-[100px] -left-[10%] w-[120%] z-0 pointer-events-none"
                    animate={true}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 w-full bg-[#FDFDFF] font-sans selection:bg-indigo-100 min-h-screen relative overflow-hidden">
            {/* Layer 1: Premium Background Depth */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#F0F7FF_0%,_#F8FAFC_40%,_#FDFDFF_100%)]" />
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#3B82F6] opacity-[0.04] blur-[120px] rounded-full" />
            </div>

            <DecorativeCurve
                opacity={0.04}
                height="h-[400px] sm:h-[550px]"
                className="absolute -top-[100px] sm:-top-[150px] -left-[10%] w-[120%] z-0 rotate-180 pointer-events-none mix-blend-multiply"
                animate={true}
            />

            <div className="flex flex-col items-center justify-center p-4 relative z-10 w-full min-h-screen -mt-10 sm:-mt-12">
                <div className="relative max-w-[400px] w-full text-center space-y-10 bg-white/90 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-8 sm:p-10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] animate-fade-in">
                    <div className="relative w-16 h-16 mx-auto">
                        <div className="w-full h-full bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center shadow-md shadow-amber-500/5">
                            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                        </div>
                        <div className="absolute -inset-4 rounded-full bg-amber-400/10 blur-2xl -z-10 animate-pulse" />
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-[28px] font-black text-[#0F172A] tracking-tight leading-none mb-2">Waiting for Approval</h1>
                        <p className="text-[15px] text-[#64748B] font-medium leading-relaxed">The test has already started. Your request has been sent to the admin.</p>
                    </div>

                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[20px] px-6 py-4">
                        <div className="flex items-center justify-between text-[13px] font-bold uppercase tracking-widest text-[#94A3B8]">
                            <span>Username</span>
                            <span className="text-[#2563EB]">{username}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 text-[14px] text-[#64748B] font-semibold">
                        <Clock className="w-4 h-4 animate-pulse text-amber-500" />
                        <span>Waiting for admin response…</span>
                    </div>

                    <Button onClick={() => navigate('/')} variant="ghost" className="text-[#94A3B8] font-bold hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors">
                        Cancel Request
                    </Button>
                </div>
            </div>

            <DecorativeCurve
                opacity={0.04}
                height="h-[400px] sm:h-[550px]"
                className="absolute -bottom-[100px] -left-[10%] w-[120%] z-0 pointer-events-none"
                animate={true}
            />
        </div>
    );
};

export default WaitingApproval;
