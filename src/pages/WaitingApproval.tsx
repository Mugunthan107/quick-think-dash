import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import supabase from '@/utils/supabase';

const WaitingApproval = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { joinTest } = useGame();
    const { pin, username } = location.state || {};
    const [isRejected, setIsRejected] = useState(false);

    useEffect(() => {
        if (!pin || !username) {
            navigate('/');
            return;
        }

        console.log(`[WaitingApproval] Subscribing to approval for ${username} in test ${pin}`);
        const channel = supabase
            .channel(`player-approval-${username}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'exam_results',
                    filter: `student_name=eq.${username}`
                },
                (payload) => {
                    const data = payload.new as any;
                    if (!data || data.test_pin !== pin) return;

                    console.log(`[WaitingApproval] Received status update for ${username}: ${data.status}`);

                    if (data.status === 'APPROVED') {
                        joinTest(pin, username).then(result => {
                            if (result.success) {
                                navigate('/lobby');
                            }
                        });
                    } else if (data.status === 'REJECTED') {
                        setIsRejected(true);
                    }
                }
            )
            .subscribe((status) => {
                console.log(`[WaitingApproval] Channel status for ${username}: ${status}`);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [pin, username, navigate, joinTest]);

    if (isRejected) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-border p-8 shadow-[0_8px_24px_hsl(260_40%_90%/0.6)]">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                        <ShieldAlert className="w-8 h-8 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-bold text-destructive">Request Rejected</h1>
                    <p className="text-muted-foreground font-medium">The admin has declined your request to join.</p>
                    <Button onClick={() => navigate('/')} className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl shadow-md shadow-accent/20">Return Home</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8 animate-fade-in bg-white/70 backdrop-blur-sm rounded-2xl border border-border p-8 shadow-[0_8px_24px_hsl(260_40%_90%/0.6)]">
                <div className="space-y-4">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    </div>

                    <h1 className="text-2xl font-bold text-foreground">
                        Waiting for Approval
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        The test has already started. Your request has been sent to the admin.
                    </p>
                    <div className="bg-secondary p-4 rounded-xl border border-border">
                        <p className="text-sm font-medium text-foreground">Username: <span className="text-accent font-bold">{username}</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaitingApproval;
