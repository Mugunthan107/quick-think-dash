import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Loader2, ShieldAlert, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import supabase from '@/utils/supabase';

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
            <div className="flex flex-col flex-1 w-full items-center justify-center p-4 min-h-[calc(100vh-[120px])] bg-[#F8F9FB]">
                <div className="relative max-w-md w-full text-center space-y-6 card-glass rounded-2xl p-8 animate-fade-in">
                    <div className="relative w-16 h-16 mx-auto">
                        <div className="w-full h-full rounded-full bg-red-50 border border-red-200/60 flex items-center justify-center glow-red">
                            <ShieldAlert className="w-8 h-8 text-destructive" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-destructive mb-2">Request Rejected</h1>
                        <p className="text-muted-foreground font-medium">The admin has declined your request to join.</p>
                    </div>
                    <Button onClick={() => navigate('/')} className="btn-primary rounded-xl font-semibold text-white w-full h-11">Return Home</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 w-full items-center justify-center p-4 min-h-[calc(100vh-[120px])] bg-[#F8F9FB]">
            <div className="relative max-w-md w-full text-center space-y-7 card-glass rounded-2xl p-8 animate-fade-in">
                <div className="relative w-16 h-16 mx-auto">
                    <div className="w-full h-full icon-bg-amber rounded-full flex items-center justify-center glow-amber">
                        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    </div>
                    <div className="absolute -inset-1 rounded-full blur-xl -z-10 animate-pulse"
                        style={{ background: 'hsl(45 90% 65% / 0.18)' }} />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">Waiting for Approval</h1>
                    <p className="text-muted-foreground font-medium">The test has already started. Your request has been sent to the admin.</p>
                </div>

                <div className="bg-accent/6 border border-accent/20 rounded-xl px-5 py-3.5 glow-purple-sm">
                    <p className="text-sm font-medium text-foreground">
                        <span className="text-muted-foreground">Username:</span>{' '}
                        <span className="text-accent font-bold">{username}</span>
                    </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                    <span>Waiting for admin response…</span>
                </div>
            </div>
        </div>
    );
};

export default WaitingApproval;
