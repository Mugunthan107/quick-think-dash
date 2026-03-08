import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import DecorativeCurve from '@/components/DecorativeCurve';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(`404: Page not found: ${location.pathname}`);
  }, [location.pathname]);

  return (
    <div className="flex flex-col flex-1 w-full bg-transparent font-sans min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-transparent" />
      </div>

      {/* Redundant Waves Removed */}

      <div className="flex flex-col flex-1 items-center justify-center p-4 relative z-10 w-full">
        <div className="relative max-w-[400px] w-full text-center space-y-8 bg-white/90 backdrop-blur-2xl border border-sky-100 rounded-[2rem] p-10 sm:p-12 shadow-[0_20px_50px_-15px_rgba(56,189,248,0.12)] animate-fade-in-up">
          <div className="relative">
            <h1 className="text-8xl font-black text-[#0F172A] tracking-tighter opacity-10">404</h1>
            <div className="absolute inset-0 flex items-center justify-center translate-y-2">
              <p className="text-2xl font-black text-[#0F172A] tracking-tight">Oops!</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-[#0F172A]">Page Not Found</h2>
            <p className="text-[14px] text-[#64748B] font-medium leading-relaxed">
              We couldn't find the page <span className="font-mono text-[#0EA5E9] px-1.5 py-0.5 bg-sky-50 rounded-md border border-sky-100/50">{location.pathname}</span>.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center w-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] hover:from-[#0EA5E9] hover:to-[#0284C7] text-white rounded-[18px] h-[52px] font-bold text-[15px] shadow-lg shadow-sky-500/20 transition-all gap-2"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
