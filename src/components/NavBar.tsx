import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { ShieldCheck, Users, Activity, Trophy, Zap, BookOpen, Shield, X, Info, FileText, LogOut } from 'lucide-react';
import DecorativeCurve from './DecorativeCurve';

const IN_TEST_ROUTES = ['/game', '/crossmath', '/numlink', '/select-game', '/lobby', '/waiting-approval'];
const HIDE_CTA_ROUTES = ['/student', '/leaderboard'];

const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentStudent, students, adminLoggedIn, adminLogout } = useGame();
    const [showInstructions, setShowInstructions] = useState(false);

    const path = location.pathname;
    const inTest = IN_TEST_ROUTES.includes(path);
    const hideCta = HIDE_CTA_ROUTES.includes(path);
    const isAdmin = path === '/ashu';

    const isHome = path === '/';

    const rules = [
        { title: 'Join with a Valid Test PIN', desc: 'You must enter the Test PIN shared by your instructor to access a session.', icon: ShieldCheck, color: '#6D4AFE' },
        { title: 'Wait for Instructor Approval', desc: 'After joining, wait until the instructor approves and starts the session.', icon: Users, color: '#3B82F6' },
        { title: 'Play All Games Honestly', desc: 'Solve the challenges on your own without external help or collaboration.', icon: Trophy, color: '#14B8A6' },
        { title: 'Follow Session Instructions', desc: 'Do not refresh, exit, or switch tabs unless instructed by the instructor.', icon: Activity, color: '#F59E0B' },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300 flex flex-col h-14 sm:h-16">
            <div className={`h-full flex items-center ${isHome || path === '/about' || path === '/student' || path === '/lobby' || path === '/select-game' || isAdmin ? 'bg-[#E0F2FE]/60 backdrop-blur-md shadow-none border-b-0' : 'bg-white/95 backdrop-blur-md border-b border-[#E6E1FF]/40 shadow-sm'} relative z-10`}>
                {!(isHome || path === '/about' || path === '/student' || path === '/lobby' || path === '/select-game' || isAdmin) && <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/5 to-transparent" />}
                <div className="relative w-full max-w-[1200px] mx-auto px-6 sm:px-10 flex items-center justify-between gap-4">

                    {/* Left — Logo */}
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 group shrink-0 relative z-50">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center shadow-md border border-[#F1F5F9] transition-all duration-500 ease-out group-hover:scale-110 group-hover:shadow-blue-500/10 origin-center">
                            <img
                                src="/favicon-round.png"
                                alt="MindSprint"
                                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-contain"
                            />
                        </div>
                        <span className="font-bold text-[#0F172A] text-[19px] sm:text-[20px] tracking-tight transition-all duration-300">
                            MindSprint
                        </span>
                    </button>

                    {/* Right */}
                    <div className="flex items-center gap-6">
                        {!hideCta && !inTest && !isAdmin && (
                            <button
                                onClick={() => navigate(path === '/about' ? '/' : '/about')}
                                className="hidden sm:block text-[14px] font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors"
                            >
                                {path === '/about' ? 'Home' : 'About'}
                            </button>
                        )}

                        {isAdmin && adminLoggedIn ? (
                            <button
                                onClick={() => { adminLogout(); navigate('/'); }}
                                className="text-[14px] font-bold text-[#0F172A] hover:text-[#2563EB] transition-all bg-transparent p-0 flex items-center gap-1.5 no-underline"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        ) : isAdmin ? null : inTest && currentStudent ? (
                            <button
                                onClick={() => navigate('/')}
                                className="text-[14px] font-bold text-[#0F172A] hover:text-[#2563EB] transition-all bg-transparent p-0 no-underline"
                            >
                                Exit Test
                            </button>
                        ) : (
                            !hideCta && (
                                <button
                                    onClick={() => setShowInstructions(true)}
                                    className="text-[14px] font-bold text-[#0F172A] hover:text-[#2563EB] transition-all"
                                >
                                    Instructions
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Instructions Modal Overlay */}
            {showInstructions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E6E1FF] animate-in zoom-in-95 duration-200">
                        <div className="relative p-6 sm:p-8">
                            <button
                                onClick={() => setShowInstructions(false)}
                                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-[#2563EB]" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Session Rules</h2>
                                    <p className="text-sm text-gray-500">Please read carefully before starting</p>
                                </div>
                            </div>

                            <div className="space-y-6 mb-10">
                                {rules.map((rule, idx) => (
                                    <div key={rule.title} className="flex gap-4">
                                        <div className="mt-1 w-8 h-8 shrink-0 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${rule.color}15` }}>
                                            <rule.icon className="w-4 h-4" style={{ color: rule.color }} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 mb-1">{idx + 1}. {rule.title}</h3>
                                            <p className="text-xs text-gray-600 leading-relaxed font-medium">{rule.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => {
                                    setShowInstructions(false);
                                    navigate('/student');
                                }}
                                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black rounded-2xl py-4 shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Zap className="w-4 h-4 fill-white text-white" />
                                Start Assessment
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </header>
    );
};

export default NavBar;
