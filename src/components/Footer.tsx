import { useNavigate, useLocation } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const hiddenRoutes = ['/game', '/crossmath', '/numlink', '/lobby', '/select-game'];
  const shouldHide = hiddenRoutes.some(route => location.pathname.startsWith(route));
  if (shouldHide) return null;

  return (
    <footer className="relative mt-auto w-full bg-[#F1F3F9] border-t border-[#E5E7EB]/60 py-8">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center border border-[#E5E7EB]">
            <img src="/favicon-round.png" alt="logo" className="w-4 h-4 object-contain" />
          </div>
          <span className="text-[13px] font-semibold text-[#111827]">MindSprint</span>
          <span className="text-[11px] text-[#9CA3AF] ml-1">© Sona College of Technology</span>
        </div>
        <div className="flex items-center gap-6">
          {[
            { label: 'About', path: '/about' },
            { label: 'Join Session', path: '/student' },
            { label: 'Leaderboard', path: '/leaderboard' },
          ].map(link => (
            <button
              key={link.label}
              onClick={() => navigate(link.path)}
              className="text-[12px] font-medium text-[#4B5563] hover:text-[#6D4AFE] transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
