import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import supabase from '@/utils/supabase';

const WaitingApproval = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { pin, username } = location.state || {}; // Passed from StudentEntry
    const [isRejected, setIsRejected] = useState(false);

    useEffect(() => {
        if (!pin || !username) {
            navigate('/');
            return;
        }

        // Poll for status approval
        const checkStatus = async () => {
            const { data, error } = await supabase
                .from('exam_results')
                .select('status')
                .eq('test_pin', pin)
                .eq('student_name', username)
                .single();

            if (error || !data) {
                // If data is gone, it means rejected (deleted)
                setIsRejected(true);
                return;
            }

            if (data.status === 'APPROVED') {
                // We need to re-join locally to set the context
                // But since we can't easily access the context join here without re-triggering DB insert,
                // we can rely on StudentEntry to handle the "re-login" if we send them back, 
                // OR better: we handle it here by manually setting the user in context if we expose a setter, 
                // but for now let's just redirect to entry with a success flag or let them re-login.
                // Actually, the easiest way is to re-run joinTest which handles existing users if we update it, 
                // BUT joinTest tries to insert. 
                // Let's just tell them it's approved and go back to entry to "Login" again which feels redundant.
                // Better: We should use a dedicated "rehydrate" or "login" for approved users in context.
                // For simplicity, let's just redirect to /student and pre-fill, or navigate to /game if we can set context.
                // Since we can't set context easily without exposing a setter that trusts us...
                // Wait, we DO have joinTest. If we call it again, it will fail on unique constraint.
                // We need `joinTest` to handle "already exists" and "approved".
                navigate('/student', { state: { approved: true, pin, username } });
            }
        };

        const interval = setInterval(checkStatus, 2000);
        return () => clearInterval(interval);
    }, [pin, username, navigate]);

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
