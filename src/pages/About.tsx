import React from 'react';
import DecorativeCurve from '@/components/DecorativeCurve';
import { Brain, Grid3X3, Link2, CheckCircle2 } from 'lucide-react';

const GAMES_RULES = [
    {
        id: 'bubble',
        icon: Brain,
        name: 'Bubble Sort',
        accentColor: 'text-[#2563EB]',
        accentBg: 'bg-[#2563EB]/10',
        borderColor: 'border-[#2563EB]/20',
        objective: 'Evaluate and sort mathematical expressions in ascending order as quickly as possible under time pressure.',
        rules: [
            'A set of floating bubbles containing unique mathematical expressions will appear on screen.',
            'Mentally calculate the outcome of each expression.',
            'Select the bubbles sequentially from the lowest calculated value to the highest.',
            'Maintain a high streak for bonus points, but beware of time penalties for incorrect selections.'
        ]
    },
    {
        id: 'crossmath',
        icon: Grid3X3,
        name: 'Cross Math',
        accentColor: 'text-[#3B82F6]',
        accentBg: 'bg-[#3B82F6]/10',
        borderColor: 'border-[#3B82F6]/20',
        objective: 'Apply logical deduction to solve interconnected grid-based arithmetic equations simultaneously.',
        rules: [
            'You are presented with a grid containing incomplete mathematical equations intersecting both horizontally and vertically.',
            'Drag and drop the available numbers into the empty cells.',
            'Every given equation across the entire board must mathematically balance and evaluate correctly.',
            'Use intersecting cells to logically deduce the only possible valid numbers for those positions.'
        ]
    },
    {
        id: 'numlink',
        icon: Link2,
        name: 'NumLink',
        accentColor: 'text-[#14B8A6]',
        accentBg: 'bg-[#14B8A6]/10',
        borderColor: 'border-[#14B8A6]/20',
        objective: 'Connect identical numbers or sequential numbers using continuous, non-overlapping spatial paths.',
        rules: [
            'Click, hold, and drag your cursor to create a path linking numbers sequentially (e.g., 1 to 2, 2 to 3) across the grid.',
            'Paths can only move horizontally or vertically between adjacent squares; diagonal movement is not permitted.',
            'No two paths can cross each other or overlap at any point.',
            'Complete the level by successfully connecting the sequence without breaking the spatial constraints.'
        ]
    }
];

export default function About() {
    return (
        <div className="flex flex-col flex-1 w-full bg-[#FDFDFF] font-sans selection:bg-indigo-100 min-h-[calc(100vh-80px)] relative overflow-hidden">
            {/* Layer 1: Premium Background Depth */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Soft Multi-Gradient Base */}
                <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#F5F3FF_0%,_#ECFEFF_40%,_#FFFFFF_100%)]" />

                {/* Very Faint Radial Glow behind Hero */}
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#6C63FF] opacity-[0.03] blur-[120px] rounded-full" />
            </div>

            {/* === TOP WAVES (MATCHING LANDING) === */}
            {/* Top Wave - Tertiary (Deepest layer) */}
            <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -top-[80px] sm:-top-[120px] left-[-10%] w-[120%] z-0 rotate-180 pointer-events-none scale-x-[1.1] translate-x-4 mix-blend-multiply" animate={true} />
            {/* Top Wave - Secondary (Layered behind) */}
            <DecorativeCurve opacity={0.06} height="h-[350px] sm:h-[480px]" className="absolute -top-[50px] sm:-top-[80px] left-[-5%] w-[110%] z-0 rotate-180 pointer-events-none scale-x-[1.05]" animate={true} />
            {/* Top Wave - Primary */}
            <DecorativeCurve opacity={0.12} height="h-[250px] sm:h-[360px]" className="absolute top-0 left-0 z-0 rotate-180 pointer-events-none" animate={true} />

            <div className="max-w-[1100px] mx-auto px-6 pt-10 sm:pt-14 pb-24 relative z-10 w-full hover:bg-[rgba(255,255,255,0.01)] transition-colors duration-300">

                {/* Header Section */}
                <div className="flex flex-col items-center text-center mb-10">
                    <h1 className="text-[clamp(36px,5vw,52px)] font-black tracking-tight text-[#0F172A] leading-[1.1] mb-6">
                        Game <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#6C63FF] to-[#22D3EE] drop-shadow-sm">Rules & Objectives</span>
                    </h1>
                    <p className="text-[18px] text-[#64748B] font-medium max-w-2xl mx-auto leading-relaxed">
                        Master the mechanics of MindSprint's core challenges. Review the specific objectives and rules below to maximize your accuracy and speed.
                    </p>
                </div>

                {/* Rules List */}
                <div className="flex flex-col gap-10">
                    {GAMES_RULES.map((game, index) => (
                        <div
                            key={game.id}
                            className="relative z-20 overflow-hidden rounded-[32px] bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(20,20,40,0.04)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.12)] hover:-translate-y-1 transition-all duration-500 group/card"
                        >
                            {/* Inner Soft Gradient Glow to give it volume */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/20 to-transparent pointer-events-none" />

                            <div className="relative z-10 p-8 sm:p-12 flex flex-col lg:flex-row gap-10 lg:gap-16">
                                {/* Left side: Game Identity & Objective */}
                                <div className="lg:w-[35%] flex flex-col">
                                    <div className="flex items-center gap-5 mb-8">
                                        <div className={`w-16 h-16 rounded-2xl ${game.accentBg} flex items-center justify-center shrink-0 border ${game.borderColor} group-hover/card:scale-105 transition-transform duration-500`}>
                                            <game.icon className={`w-8 h-8 ${game.accentColor}`} />
                                        </div>
                                        <div>
                                            <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em] mb-1.5 block">Game 0{index + 1}</span>
                                            <h2 className="text-[28px] font-black text-[#0F172A] leading-none tracking-tight">{game.name}</h2>
                                        </div>
                                    </div>

                                    <div className={`p-6 rounded-2xl border ${game.borderColor} bg-white shadow-sm relative overflow-hidden`}>
                                        <div className={`absolute top-0 left-0 w-1 h-full ${game.accentBg} brightness-90`} />
                                        <h3 className="text-[11px] font-bold text-[#64748B] uppercase tracking-[0.15em] mb-3">Primary Objective</h3>
                                        <p className="text-[15px] text-[#334155] leading-relaxed font-medium">
                                            {game.objective}
                                        </p>
                                    </div>
                                </div>

                                {/* Right side: Rules List */}
                                <div className="lg:w-[65%] flex flex-col justify-center">
                                    <h3 className="text-[13px] font-bold text-[#0F172A] uppercase tracking-[0.1em] mb-8 flex items-center gap-4">
                                        How to Play
                                        <div className="flex-1 h-px bg-gradient-to-r from-[#E5E7EB] to-transparent" />
                                    </h3>

                                    <ul className="flex flex-col gap-5">
                                        {game.rules.map((rule, rIdx) => (
                                            <li key={rIdx} className="flex gap-4 items-start group/item">
                                                <div className="mt-0.5 shrink-0 bg-white p-0.5 rounded-full shadow-sm border border-[#E5E7EB] group-hover/item:border-transparent transition-colors duration-300">
                                                    <CheckCircle2 className={`w-5 h-5 ${game.accentColor} opacity-80 group-hover/item:opacity-100 transition-opacity`} />
                                                </div>
                                                <p className="text-[16px] text-[#475569] leading-relaxed">
                                                    {rule}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* === BOTTOM WAVES (MATCHING LANDING) === */}
            {/* Bottom Wave - Tertiary (Deepest layer) */}
            <DecorativeCurve opacity={0.05} height="h-[400px] sm:h-[550px]" className="absolute -bottom-[80px] sm:-bottom-[120px] left-[-10%] w-[120%] z-0 pointer-events-none scale-x-[1.1] -translate-x-4 mix-blend-multiply" animate={true} />
            {/* Bottom Wave - Secondary (Layered behind) */}
            <DecorativeCurve opacity={0.07} height="h-[350px] sm:h-[480px]" className="absolute -bottom-[50px] sm:-bottom-[80px] left-[-5%] w-[110%] z-0 pointer-events-none scale-x-[1.05]" animate={true} />
            {/* Bottom Wave - Primary */}
            <DecorativeCurve opacity={0.12} height="h-[250px] sm:h-[360px]" className="absolute bottom-0 left-0 z-0 pointer-events-none" animate={true} />
        </div>
    );
}
