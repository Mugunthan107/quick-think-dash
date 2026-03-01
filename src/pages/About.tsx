import DecorativeCurve from '@/components/DecorativeCurve';
import { BookOpen, ShieldCheck, Activity, Trophy, Brain, Grid3X3, Link2 } from 'lucide-react';

const ABOUT_PILLARS = [
    { icon: Brain, title: 'Mental Agility', body: 'Exercises designed to strengthen calculation speed, pattern recognition, and quick decision-making.', iconColor: 'text-[#6D4AFE]', iconBg: 'bg-[#6D4AFE]/8' },
    { icon: Activity, title: 'Real-Time Scoring', body: 'Scores update live as students complete each game. Rankings reflect accuracy and speed together.', iconColor: 'text-[#14B8A6]', iconBg: 'bg-[#14B8A6]/8' },
    { icon: ShieldCheck, title: 'Admin Controlled', body: 'A single PIN locks the test session. The admin starts, monitors, and can stop the test at any time.', iconColor: 'text-[#3B82F6]', iconBg: 'bg-[#3B82F6]/8' },
    { icon: Trophy, title: 'Classroom Friendly', body: 'Designed for group tests in classrooms and competitions. Supports 50+ concurrent students.', iconColor: 'text-[#F59E0B]', iconBg: 'bg-[#F59E0B]/8' },
];

const GAMES = [
    {
        icon: Brain,
        name: 'Bubble Sort',
        tag: 'Sorting',
        tagColor: 'text-[#6D4AFE]',
        desc: 'Sort mathematical expressions from lowest to highest value. Tests quick calculation and decision-making under time pressure.',
    },
    {
        icon: Grid3X3,
        name: 'Cross Math',
        tag: 'Logic',
        tagColor: 'text-[#3B82F6]',
        desc: 'Solve grid-based arithmetic puzzles by placing correct numbers to satisfy both horizontal and vertical equations.',
    },
    {
        icon: Link2,
        name: 'NumLink',
        tag: 'Spatial',
        tagColor: 'text-[#14B8A6]',
        desc: 'Connect numbers in sequence using valid paths within the grid. Enhances number sense and pattern recognition.',
    },
];

export default function About() {
    return (
        <div className="flex flex-col flex-1 w-full bg-[#F8F9FB] min-h-screen">

            {/* ─── HERO SECTION: PROFESSIONAL CANVAS ─── */}
            <section className="relative w-full overflow-hidden bg-[#F8F9FB] pt-24 pb-16">

                {/* Visual Framing - Sync with Home Page */}
                <DecorativeCurve
                    invert={true}
                    opacity={0.08}
                    height="h-[40px] sm:h-[60px] lg:h-[80px]"
                    className="absolute top-0 left-0 z-10"
                    animate={true}
                />

                {/* Hero Backdrop */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#F5F3FF] to-[#F8F9FB] opacity-80" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#6D4AFE03_0%,_transparent_60%)] blur-2xl" />
                </div>

                <div className="max-container relative z-20">
                    <div className="max-w-2xl">
                        <div className="w-12 h-12 rounded-xl bg-[#6366F1]/8 flex items-center justify-center mb-6">
                            <BookOpen className="w-6 h-6 text-[#6366F1]" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#111827] mb-6 leading-[1.1]">
                            Institutional Grade <br />
                            <span className="text-[#6D4AFE]">Assessment Platform</span>
                        </h1>
                        <p className="text-[18px] text-[#4B5563] leading-relaxed">
                            MindSprint is an interactive evaluation ecosystem designed for high-stakes classroom sessions and competitive benchmarking. We combine rapid logic games with centralized admin control.
                        </p>
                    </div>
                </div>

                <DecorativeCurve
                    opacity={0.08}
                    height="h-[40px] sm:h-[60px] lg:h-[80px]"
                    className="absolute bottom-0 left-0 z-10"
                    animate={true}
                />
            </section>

            {/* ─── MAIN CONTENT ─── */}
            <div className="max-container py-20">

                {/* Pillars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
                    {ABOUT_PILLARS.map(p => (
                        <div key={p.title} className="p-8 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm flex gap-6 group hover:shadow-md transition-shadow">
                            <div className={`w-12 h-12 rounded-xl ${p.iconBg} flex items-center justify-center shrink-0 group-hover:opacity-80 transition-opacity`}>
                                <p.icon className={`w-6 h-6 ${p.iconColor}`} />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#111827] mb-2 text-[17px]">{p.title}</h3>
                                <p className="text-[#4B5563] text-[15px] leading-relaxed">{p.body}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Module Specification */}
                <div className="mb-24">
                    <div className="flex items-center gap-4 mb-12">
                        <h2 className="text-[11px] font-bold text-[#6D4AFE] uppercase tracking-[0.3em] whitespace-nowrap">Module Specification</h2>
                        <div className="flex-1 h-px bg-[#E6E1FF]/50" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {GAMES.map(g => (
                            <div key={g.name} className="flex flex-col">
                                <span className={`text-[10px] font-bold ${g.tagColor} uppercase mb-4 tracking-widest`}>{g.tag}</span>
                                <h3 className="font-extrabold text-[#111827] mb-3 text-[20px]">{g.name}</h3>
                                <p className="text-[#4B5563] text-[15px] leading-relaxed mb-6">{g.desc}</p>
                                <div className="mt-auto pt-6 border-t border-[#E6E1FF]/30">
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#6D4AFE]" />
                                        Standardized Evaluation
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Professional Mission Bar */}
                <div className="relative rounded-2xl overflow-hidden bg-white border border-[#E6E1FF]/50 p-6 sm:p-10 text-center shadow-sm">
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <span className="text-[10px] font-bold text-[#6D4AFE] uppercase tracking-[0.2em] mb-4 block">Institutional Statement</span>
                        <p className="text-lg sm:text-xl font-semibold text-[#111827] leading-relaxed mb-6 italic">
                            "MindSprint is engineered on the principle that academic assessment should be as immersive as it is fair. We reward precision under pressure."
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-6 h-px bg-[#E6E1FF]" />
                            <span className="text-[#9CA3AF] text-[9px] font-bold uppercase tracking-widest">Engineering Team</span>
                            <div className="w-6 h-px bg-[#E6E1FF]" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
