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
                    setTimeout(onComplete, 500); // Wait a bit on "GO!" or 0
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onComplete]);

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="text-center">
                <div
                    key={count}
                    className="text-9xl font-black text-accent animate-in zoom-in-50 fade-in duration-300 transform"
                >
                    {count > 0 ? count : 'GO!!'}
                </div>
                <p className="text-muted-foreground mt-4 text-xl font-medium animate-pulse">
                    Get Ready...
                </p>
            </div>
        </div>,
        document.body
    );
};

export default CountdownOverlay;
