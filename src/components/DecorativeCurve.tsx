import React from 'react';

interface DecorativeCurveProps {
    opacity?: number;
    className?: string;
    height?: string;
    invert?: boolean;
    animate?: boolean;
}

const DecorativeCurve: React.FC<DecorativeCurveProps> = ({
    opacity = 0.08,
    className = "",
    height = "h-[80px] sm:h-[140px] lg:h-[200px]",
    invert = false,
    animate = false
}) => {
    return (
        <div className={`w-full overflow-hidden leading-[0] pointer-events-none transform ${invert ? 'rotate-180 mb-[-1px]' : 'translate-y-[1px] mt-[-1px]'} ${className}`}>
            <svg
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                className={`relative block w-[calc(100%+1.3px)] ${height}`}
            >
                {/* Lighter, deeper layer */}
                <path
                    className={animate ? 'animate-wave-slow' : ''}
                    d="M0,60 C300,140 700,0 1200,100 V120 H0 Z"
                    fill="hsl(var(--accent) / 0.04)"
                />
                {/* Main accent layer */}
                <path
                    className={animate ? 'animate-wave' : ''}
                    d="M0,100 C400,150 800,30 1200,90 V120 H0 Z"
                    fill="url(#reusable-curve-gradient)"
                    fillOpacity={opacity}
                />
                <defs>
                    <linearGradient id="reusable-curve-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#EDE9FE" />
                        <stop offset="100%" stopColor="#E6E1FF" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

export default DecorativeCurve;
