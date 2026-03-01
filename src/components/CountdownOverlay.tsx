import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface CountdownOverlayProps {
    onComplete: () => void;
}

const CountdownOverlay = ({ onComplete }: CountdownOverlayProps) => {
    const [count, setCount] = useState(3);

    useEffect(() => {
        const timer = setInterval(() => {
            setCount((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setTimeout(onComplete, 600);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onComplete]);

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'hsl(240 20% 99% / 0.92)', backdropFilter: 'blur(16px)' }}>
            {/* Radial glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at center, hsl(255 72% 56% / 0.06) 0%, transparent 60%)',
                }}
            />
            <div className="text-center relative">
                <div
                    key={count}
                    className="animate-count-pop"
                >
                    {count > 0 ? (
                        <span
                            className="text-[120px] sm:text-[160px] font-extrabold tabular-nums leading-none"
                            style={{
                                background: 'linear-gradient(135deg, hsl(255 72% 56%), hsl(280 70% 60%))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            {count}
                        </span>
                    ) : (
                        <span
                            className="text-7xl sm:text-8xl font-extrabold tracking-tight"
                            style={{
                                background: 'linear-gradient(135deg, hsl(255 72% 56%), hsl(280 70% 60%))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            GO!
                        </span>
                    )}
                </div>
                <p className="text-muted-foreground mt-6 text-lg font-medium animate-pulse">
                    {count > 0 ? 'Get Ready...' : ''}
                </p>
            </div>
        </div>,
        document.body
    );
};

export default CountdownOverlay;
