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

        const channel = supabase
            .channel(`player-approval-${username}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'exam_results',
                    filter: `test_pin=eq.${pin}`
                },
                (payload) => {
                    const data = payload.new as any;
                    if (!data) return;

                    // Manually check if this update is for the current student
                    if (data.student_name !== username) return;

                    if (data.status === 'APPROVED') {
                        joinTest(pin, username).then(result => {
                            if (result.success) {
                                navigate('/lobby');
                            }
                        });
                    } else if (!data.status) {
                        // Likely deleted/rejected
                        setIsRejected(true);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [pin, username, navigate, joinTest]);

    if (isRejected) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                        <ShieldAlert className="w-8 h-8 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-bold text-destructive">Request Rejected</h1>
                    <p className="text-muted-foreground">The admin has declined your request to join.</p>
                    <Button onClick={() => navigate('/')}>Return Home</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
                <div className="space-y-4">
                    <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                    </div>

                    <h1 className="text-2xl font-bold text-foreground">
                        Waiting for Approval
                    </h1>
                    <p className="text-muted-foreground">
                        The test has already started. Your request has been sent to the admin.
                    </p>
                    <div className="bg-secondary p-4 rounded-xl">
                        <p className="text-sm font-medium">Username: <span className="text-accent">{username}</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaitingApproval;
