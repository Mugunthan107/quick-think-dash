import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import DecorativeCurve from '@/components/DecorativeCurve';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(`404: Page not found: ${location.pathname}`);
  }, [location.pathname]);

  return (
    <div className="flex flex-col flex-1 w-full bg-[#F0F7FF] font-sans min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#E0F2FE_0%,_#F0F9FF_40%,_#FFFFFF_100%)]" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#38BDF8] opacity-[0.04] blur-[120px] rounded-full" />
      </div>

      <DecorativeCurve opacity={0.04} height="h-[400px]" className="absolute -top-[100px] left-[-10%] w-[120%] z-0 rotate-180 pointer-events-none scale-x-[1.1]" animate={true} />
      <DecorativeCurve opacity={0.08} height="h-[250px]" className="absolute top-0 left-0 z-0 rotate-180 pointer-events-none w-full" animate={true} />

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
