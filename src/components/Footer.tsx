import { useNavigate, useLocation } from 'react-router-dom';
import DecorativeCurve from './DecorativeCurve';

const Footer = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // List of routes where the footer should be hidden
    const hiddenRoutes = ['/', '/game', '/crossmath', '/numlink', '/lobby', '/about'];

    // Check if current path matches any of the hidden routes
    // Using exact match for '/' to only hide on home, and startsWith for others
    const shouldHide = hiddenRoutes.some(route =>
        route === '/' ? location.pathname === '/' : location.pathname.startsWith(route)
    );

    if (shouldHide) return null;

    return (
        <div className="relative mt-auto shrink-0 w-full overflow-hidden">
            <footer className="relative w-full bg-white/40 backdrop-blur-sm py-4 z-10">
                <div className="max-w-[1200px] mx-auto px-6 sm:px-10 flex flex-col md:flex-row items-center justify-between gap-6">

                    {/* Left Brand Area */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-sky-100">
                            <img src="/favicon-round.png" alt="NCT" className="w-5 h-5 opacity-80" />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-[14px] font-bold text-slate-800 tracking-tight leading-none">
                                MindSprint
                            </span>
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-col items-end">
                        <p className="text-[11px] font-medium text-slate-400">
                            © {new Date().getFullYear()} MindSprint Challenge.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Footer;
