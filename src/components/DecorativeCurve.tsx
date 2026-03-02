import React from 'react';

interface DecorativeCurveProps {
    opacity?: number;
    className?: string;
    height?: string;
    invert?: boolean;
    animate?: boolean;
}

const DecorativeCurve: React.FC<DecorativeCurveProps> = ({
    opacity = 0.1,
    className = "",
    height = "h-[100px] sm:h-[150px]",
    invert = false,
    animate = true
}) => {
    return (
        <div className={`w-full overflow-hidden leading-[0] pointer-events-none ${className}`}>
            <svg
                viewBox="0 0 1440 320"
                preserveAspectRatio="none"
                className={`relative block w-full ${height}`}
            >
                <defs>
                    <linearGradient id="wave-gradient-indigo" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6C63FF" stopOpacity={opacity * 0.5} />
                        <stop offset="50%" stopColor="#22D3EE" stopOpacity={opacity * 1.2} />
                        <stop offset="100%" stopColor="#6C63FF" stopOpacity={opacity * 0.5} />
                    </linearGradient>
                </defs>

                {/* Layer 3: Deepest, most subtle wave */}
                <path
                    className={animate ? 'animate-wave-slow' : ''}
                    d="M0,160 C400,300 600,20 900,180 C1200,340 1440,100 1440,180 V320 H0 Z"
                    fill="#6C63FF"
                    fillOpacity={opacity * 0.2}
                />

                {/* Layer 2: Middle wave with offset */}
                <path
                    className={animate ? 'animate-wave' : ''}
                    d="M0,224 C480,288 960,96 1440,224 V320 H0 Z"
                    fill="#22D3EE"
                    fillOpacity={opacity * 0.4}
                    style={{ animationDelay: '-1.5s' }}
                />

                {/* Layer 1: Main Gradient Wave */}
                <path
                    className={animate ? 'animate-wave' : ''}
                    d="M0,288 C480,336 960,192 1440,288 V320 H0 Z"
                    fill="url(#wave-gradient-indigo)"
                />
            </svg>
        </div>
    );
};

export default DecorativeCurve;
