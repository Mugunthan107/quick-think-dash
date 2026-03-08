import React from 'react';
import DecorativeCurve from '@/components/DecorativeCurve';
import { Brain, Grid3X3, Link2, CheckCircle2, Move, Zap, Hash, FlipHorizontal, Droplets, LayoutGrid, Palette } from 'lucide-react';

const GAMES_RULES = [
    {
        id: 'bubble',
        icon: Brain,
        name: 'Bubble Sort',
        accentColor: 'text-sky-500',
        accentBg: 'bg-sky-500/5',
        borderColor: 'border-sky-500/20',
        objective: 'Evaluate and sort mathematical expressions in ascending order as quickly as possible under time pressure.',
        rules: [
            'A set of floating bubbles containing unique mathematical expressions will appear on screen.',
            'Mentally calculate the outcome of each expression promptly.',
            'Select the bubbles sequentially from the lowest calculated value to the highest.',
            'Maintain a high streak for bonus points, but beware of time penalties for incorrect selections.'
        ]
    },
    {
        id: 'crossmath',
        icon: Grid3X3,
        name: 'Cross Math',
        accentColor: 'text-sky-500',
        accentBg: 'bg-sky-500/5',
        borderColor: 'border-sky-500/20',
        objective: 'Apply logical deduction to solve interconnected grid-based arithmetic equations simultaneously.',
        rules: [
            'You are presented with a grid containing incomplete mathematical equations intersecting both horizontally and vertically.',
            'Drag and drop the available numbers into the empty cells to complete the logic.',
            'Every given equation across the entire board must mathematically balance and evaluate correctly.',
            'Use intersecting cells to logically deduce the only possible valid numbers for those positions.'
        ]
    },
    {
        id: 'numlink',
        icon: Link2,
        name: 'NumLink',
        accentColor: 'text-sky-500',
        accentBg: 'bg-sky-500/5',
        borderColor: 'border-sky-500/20',
        objective: 'Connect identical numbers or sequential numbers using continuous, non-overlapping spatial paths.',
        rules: [
            'Click, hold, and drag your cursor to create a path linking numbers sequentially across the grid.',
            'Paths can only move horizontally or vertically between adjacent squares.',
            'No two paths can cross each other or overlap at any point in the sequence.',
            'Complete the level by successfully connecting the sequence without breaking constraints.'
        ]
    },
    {
        id: 'motion',
        icon: Move,
        name: 'Motion Challenge',
        accentColor: 'text-sky-500',
        accentBg: 'bg-sky-500/5',
        borderColor: 'border-sky-500/20',
        objective: 'Navigate the green ball into the target using directional controls in as few moves as possible.',
        rules: [
            'Use arrow keys or on-screen directional buttons to move the ball across the grid.',
            'The ball move persists until it hits a wall or obstacle in its path.',
            'Your goal is to reach the target (black hole) in the absolute minimum number of moves.',
            'Scoring is based on move efficiency. Fewer moves lead to a higher overall rank.'
        ]
    },
    {
        id: 'aptirush',
        icon: Zap,
        name: 'AptiRush',
        accentColor: 'text-sky-500',
        accentBg: 'bg-sky-500/5',
        borderColor: 'border-sky-500/20',
        objective: 'Answer logic questions under strict time pressure with zero question repetition during the session.',
        rules: [
            'Each level presents one unique logic question with 4 options. You have 10–15 seconds.',
            'Correct answers grant points, with significant speed bonuses for responding within 5 seconds.',
            'The circular timer changes color to indicate remaining time: Green, Orange, then Red.',
            'Difficulty increases progressively. Finishing all 20 levels grants a massive completion bonus.'
        ]
    },
    {
        id: 'numberseries',
        icon: Hash,
        name: 'Num Series',
        accentColor: 'text-sky-500',
        accentBg: 'bg-sky-500/5',
        borderColor: 'border-sky-500/20',
        objective: 'Identify the next number in a pattern and catch it with your bucket before it falls.',
        rules: [
            'A number series is displayed. Figure out the logic (arithmetic, geometric, or complex).',
            'Move your bucket left/right to position under the correct answer as it falls.',
            'Press CATCH or use browser keys to catch the number. Patterns get harder over 20 levels.',
            'Speed increases as you progress, testing both your deduction and reflexes.'
        ]
    },
    {
        id: 'mirror',
        icon: FlipHorizontal,
        name: 'Mirror Image',
        accentColor: 'text-sky-500',
        accentBg: 'bg-sky-500/5',
        borderColor: 'border-sky-500/20',
        objective: 'Identify the correct mirror (horizontal flip) of a given text or number string.',
        rules: [
            'A random string is shown. Select its exact mirror image from four possible options.',
            'Options include mirror image distractors, partial reversals, and original orientation.',
            'You have 10 seconds per question. 20 levels of increasing complexity.',
            'High-speed visual recognition is key to maintaining a perfect score.'
        ]
    },
    {
        id: 'waterimage',
        icon: Droplets,
        name: 'Water Image',
        accentColor: 'text-sky-500',
        accentBg: 'bg-sky-500/5',
        borderColor: 'border-sky-500/20',
        objective: 'Identify the correct water reflection (vertical flip) of a given text string.',
        rules: [
            'A text string is shown with a reflection line. Choose the correct vertically-flipped version.',
            'Unicode reflections are used to simulate real water images. Tricky distractors are provided.',
            'You have 10 seconds per question across 20 levels. Score +1 for each correct answer.',
            'Focus on vertical symmetry to quickly identify the right reflection.'
        ]
    },
    {
        id: 'numpuzzle',
        icon: LayoutGrid,
        name: 'Num Puzzle',
        accentColor: 'text-sky-500',
        accentBg: 'bg-sky-500/5',
        borderColor: 'border-sky-500/20',
        objective: 'Analyze a 4×4 number grid and determine the missing value based on row/column patterns.',
        rules: [
            'A 4×4 grid of numbers is shown with one marked cell. Patterns involve complex arithmetic.',
            'Analyze row and column relationships to logically deduce the missing value.',
            'Patterns include row multiples, column sums, and arithmetic progression tables.',
            'Choose from 4 options in under 10 seconds. Accuracy is mandatory for progress.'
        ]
    },
    {
        id: 'colorsort',
        icon: Palette,
        name: 'Color Sort',
        accentColor: 'text-sky-500',
        accentBg: 'bg-sky-500/5',
        borderColor: 'border-sky-500/20',
        objective: 'Sort colored liquids into test tubes so each tube contains only one uniform color.',
        rules: [
            'Tap a tube to select, then tap another to pour. Match colors to pour into non-empty tubes.',
            'Liquid pours only if top colors match or the destination is empty. Tubes hold 4 layers.',
            'Two empty tubes are provided for strategic maneuvering. Sort all colors within 10 seconds.',
            'Difficulty scales from 3 simple colors to 5 complex color layers over 20 levels.'
        ]
    }
];

export default function About() {
    return (
        <div className="flex flex-col flex-1 w-full bg-transparent font-sans selection:bg-sky-100 min-h-[calc(100vh-80px)] relative overflow-hidden">
            {/* Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-transparent" />
            </div>

            <div className="max-w-[1100px] mx-auto px-4 sm:px-8 pt-10 sm:pt-16 pb-24 relative z-10 w-full">

                {/* Refined Header Section */}
                <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
                    <h1 className="text-[clamp(28px,5vw,52px)] font-black tracking-tighter text-[#0F172A] leading-[1.1] mb-4 sm:mb-6">
                        Game <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-sky-500 to-sky-400 drop-shadow-sm">Rules & Objectives</span>
                    </h1>
                    <p className="text-[15px] sm:text-[17px] text-[#64748B] font-medium max-w-[640px] mx-auto leading-relaxed px-4 opacity-90">
                        Master the mechanics of MindSprint's high-precision environment. Review the logic and strategies for each core challenge below.
                    </p>
                </div>

                {/* Harmonized Rules List */}
                <div className="grid grid-cols-1 gap-8 sm:gap-10">
                    {GAMES_RULES.map((game, index) => (
                        <div
                            key={game.id}
                            className="relative z-20 group/card"
                        >
                            {/* Card Body with Glassmorphism */}
                            <div className="overflow-hidden rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_20px_40px_-10px_rgba(56,189,248,0.06)] hover:shadow-[0_32px_60px_-15px_rgba(56,189,248,0.12)] hover:-translate-y-1 transition-all duration-500">

                                {/* Subtle inner glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/40 to-white/10 pointer-events-none" />

                                <div className="relative z-10 p-5 sm:p-8 md:p-10 lg:p-12 flex flex-col lg:flex-row gap-8 sm:gap-10 lg:gap-16">

                                    {/* Brand & Objective Section */}
                                    <div className="lg:w-[38%] flex flex-col">
                                        <div className="flex items-center gap-4 sm:gap-5 mb-6 sm:mb-8">
                                            <div className="relative">
                                                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-[1rem] sm:rounded-[1.25rem] ${game.accentBg} flex items-center justify-center shrink-0 border-2 ${game.borderColor} group-hover/card:scale-105 transition-all duration-500 shadow-sm`}>
                                                    <game.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${game.accentColor} filter drop-shadow-sm`} />
                                                </div>
                                                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm">
                                                    0{index + 1}
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <h2 className="text-[20px] sm:text-[28px] font-black text-[#0F172A] leading-tight tracking-tighter mb-0.5 uppercase">
                                                    {game.name}
                                                </h2>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-3 h-0.5 rounded-full bg-sky-500 opacity-60" />
                                                    <span className="text-[10px] font-bold text-sky-600/60 uppercase tracking-[0.1em]">Module</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative mt-auto">
                                            <div className="p-5 sm:p-6 rounded-[1.5rem] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-50 relative overflow-hidden group/objective">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-sky-500/30 group-hover/objective:bg-sky-500 transition-colors duration-500" />
                                                <h3 className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.15em] mb-2">Objective</h3>
                                                <p className="text-[14px] sm:text-[15px] text-[#334155] leading-relaxed font-semibold italic text-slate-700">
                                                    "{game.objective}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Operational Rules Section */}
                                    <div className="lg:w-[62%] flex flex-col justify-center">
                                        <div className="flex items-center gap-5 mb-5 sm:mb-8">
                                            <h3 className="text-[12px] font-black text-[#0F172A] uppercase tracking-[0.15em] whitespace-nowrap">
                                                Protocol
                                            </h3>
                                            <div className="flex-1 h-[1px] bg-gradient-to-r from-sky-100 via-sky-50 to-transparent" />
                                        </div>

                                        <ul className="grid grid-cols-1 gap-4 sm:gap-5">
                                            {game.rules.map((rule, rIdx) => (
                                                <li key={rIdx} className="flex gap-3 sm:gap-4 items-start group/rule animate-fade-in" style={{ animationDelay: `${(index * 0.1) + (rIdx * 0.05)}s` }}>
                                                    <div className="mt-1 shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover/rule:bg-sky-500 group-hover/rule:border-sky-500 transition-all duration-300 translate-y-[-1px]">
                                                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-500 group-hover/rule:text-white transition-colors duration-300" />
                                                    </div>
                                                    <p className="text-[14px] sm:text-[16px] text-[#475569] leading-relaxed font-medium">
                                                        {rule}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
