import React from 'react';

const WaveBackground: React.FC = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#38BDF8]/10">
            {/* Top Wave - Mirrored Professional Horizontal Wave (Starts from center of Navbar) */}
            <div className="absolute top-7 sm:top-8 left-0 w-full opacity-40 transform rotate-180">
                <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-[150px] sm:h-[220px]">
                    <defs>
                        <linearGradient id="wave-grad-top" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.3" />
                            <stop offset="50%" stopColor="#0EA5E9" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.3" />
                        </linearGradient>
                    </defs>
                    <path
                        fill="url(#wave-grad-top)"
                        d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        className="animate-wave"
                    ></path>
                    <path
                        fill="#0EA5E9"
                        fillOpacity="0.25"
                        d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,240C1248,235,1344,245,1392,250.7L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        className="animate-wave-slow"
                        style={{ animationDelay: '-1s' }}
                    ></path>
                </svg>
            </div>

            {/* Bottom Wave - Main Professional Horizontal Wave */}
            <div className="absolute bottom-0 left-0 w-full opacity-50">
                <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-[150px] sm:h-[220px]">
                    <defs>
                        <linearGradient id="wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.3" />
                            <stop offset="50%" stopColor="#0EA5E9" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.3" />
                        </linearGradient>
                    </defs>
                    <path
                        fill="url(#wave-grad)"
                        d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        className="animate-wave"
                    ></path>
                    <path
                        fill="#0EA5E9"
                        fillOpacity="0.25"
                        d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,240C1248,235,1344,245,1392,250.7L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        className="animate-wave-slow"
                        style={{ animationDelay: '-2s' }}
                    ></path>
                </svg>
            </div>

            {/* Subtle Floating Accents */}
            <div className="absolute top-[20%] right-[15%] w-64 h-64 bg-sky-200/20 rounded-full blur-[80px] animate-float pointer-events-none" />
            <div className="absolute bottom-[30%] left-[10%] w-96 h-96 bg-sky-100/30 rounded-full blur-[100px] animate-float-reverse pointer-events-none" />
        </div>
    );
};

export default WaveBackground;
