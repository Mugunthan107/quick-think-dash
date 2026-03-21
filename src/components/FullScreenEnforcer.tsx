import { useEffect, useState, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FullScreenEnforcer = () => {
    const { currentStudent, currentTest, finishTest } = useGame();
    const navigate = useNavigate();
    const [warnings, setWarnings] = useState(0);
    const [needsFullscreen, setNeedsFullscreen] = useState(false);
    const [failed, setFailed] = useState(false);
    const hasEnteredFullscreenOnce = useRef(false);

    // Context is active if a student session is ongoing
    const isTesting = !!(currentStudent && currentTest && currentTest.status !== 'FINISHED');

    useEffect(() => {
        if (!isTesting) {
            if (!failed) {
                setNeedsFullscreen(false);
                setWarnings(0);
                hasEnteredFullscreenOnce.current = false;
            }
            return;
        }

        // If they finished naturally, stop enforcing
        if (currentStudent.isFinished && !failed) {
            setNeedsFullscreen(false);
            return;
        }

        if (failed) return;

        const handleViolation = () => {
            if (!hasEnteredFullscreenOnce.current) {
                setNeedsFullscreen(true);
                return;
            }

            setNeedsFullscreen(prevNeeds => {
                if (!prevNeeds) {
                    setWarnings(w => {
                        const newCount = w + 1;
                        if (newCount >= 4) { // 3 warnings max, 4th time fail
                            setFailed(true);
                            if (currentStudent && currentStudent.username) {
                                finishTest(currentStudent.username);
                            }
                        }
                        return newCount;
                    });
                }
                return true;
            });
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                handleViolation();
            } else {
                hasEnteredFullscreenOnce.current = true;
                setNeedsFullscreen(false);
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden && hasEnteredFullscreenOnce.current) {
                handleViolation();
            }
        };

        // Initial check on mount or when isTesting becomes true
        if (!document.fullscreenElement) {
            setNeedsFullscreen(true); // Don't trigger a warning yet, just ask them to enter
        } else {
            hasEnteredFullscreenOnce.current = true;
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isTesting, currentStudent, finishTest, failed]);

    const handleReturn = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                setNeedsFullscreen(false);
            }
        } catch (err) {
            console.error("Failed to enter full screen", err);
        }
    };

    useEffect(() => {
        // Automatically exit fullscreen when student finishes the test
        if (currentStudent?.isFinished && document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.log('Finished exit failed:', err));
        }
    }, [currentStudent?.isFinished]);

    const handleExit = () => {
        setFailed(false);
        setNeedsFullscreen(false);
        setWarnings(0);
        navigate('/');
    };

    if (!isTesting && !failed) return null;
    if (isTesting && currentStudent?.isFinished && !failed) return null;
    if (!needsFullscreen && !failed) return null;

    if (failed) {
        return (
            <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle className="w-20 h-20 text-red-500 mb-6" />
                <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Test Terminated</h1>
                <p className="text-lg text-slate-600 font-medium mb-8 max-w-md">You have violated the test rules too many times by exiting full screen. Your test has been automatically submitted.</p>
                <Button onClick={handleExit} className="px-8 h-14 text-lg font-bold bg-[#0F172A] hover:bg-[#334155] rounded-2xl shadow-xl text-white transition-all transform hover:-translate-y-1">
                    Return to Home
                </Button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
            <div className="bg-white border-2 border-slate-100 rounded-[2rem] shadow-2xl p-8 sm:p-10 max-w-md w-full text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-amber-100 text-amber-600 rounded-[1.5rem] flex items-center justify-center mb-2 shadow-inner">
                    <AlertTriangle className="w-10 h-10" />
                </div>
                <div className="space-y-3">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        {warnings > 0 ? `Warning ${warnings} of 3` : 'Full Screen Required'}
                    </h2>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed px-2">
                        {warnings > 0 
                            ? "You are not allowed to exit full screen or switch tabs. If you do this 3 times, your test will be marked as finished."
                            : "You must take this test in full screen. Please enter full screen to proceed."}
                    </p>
                </div>
                <Button onClick={handleReturn} className="w-full h-14 text-lg font-bold bg-[#2563EB] hover:bg-[#1D4ED8] rounded-2xl shadow-lg shadow-blue-500/20 text-white transition-all transform hover:-translate-y-1">
                    Return to Test
                </Button>
            </div>
        </div>
    );
};

export default FullScreenEnforcer;
