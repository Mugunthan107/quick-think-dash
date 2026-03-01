import { useNavigate, useLocation } from 'react-router-dom';
import DecorativeCurve from './DecorativeCurve';

const Footer = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // List of routes where the footer should be hidden
    const hiddenRoutes = ['/game', '/crossmath', '/numlink', '/lobby'];

    // Check if current path matches any of the hidden routes or their sub-routes
    const shouldHide = hiddenRoutes.some(route => location.pathname.startsWith(route));

    if (shouldHide) return null;

    return (
        <div className="relative mt-auto shrink-0 w-full overflow-hidden border-t border-[#E6E1FF]/30">
            <footer className="relative w-full bg-[#F1F3F9] py-8 z-10">
                <div className="max-w-[1200px] mx-auto px-6 sm:px-10 flex flex-col md:flex-row items-center justify-between gap-6">

                    {/* Left Brand Area */}
                    <div className="flex flex-col md:flex-row items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#E6E1FF]">
                                <img src="/favicon-round.png" alt="logo" className="w-4 h-4 object-contain" />
                            </div>
                            <span className="text-[14px] font-bold text-[#111827] tracking-tight">MindSprint</span>
                        </div>
                        <span className="hidden md:block w-[1px] h-4 bg-[#E6E1FF]" />
                        <span className="text-[12px] text-[#9CA3AF] font-medium">© Placements of Sona College of Technology</span>
                    </div>

                    {/* Right Links */}
                    <div className="flex items-center gap-8">
                        {[
                            { label: 'Platform', path: '/about' },
                            { label: 'Join Session', path: '/student' },
                            { label: 'Leaderboard', path: '/leaderboard' },
                        ].map(link => (
                            <button
                                key={link.label}
                                onClick={() => navigate(link.path)}
                                className="text-[12px] font-semibold text-[#4B5563] hover:text-[#6D4AFE] transition-colors"
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>

                </div>
            </footer>
        </div>
    );
};

export default Footer;
