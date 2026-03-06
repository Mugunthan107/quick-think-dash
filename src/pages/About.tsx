import React from 'react';
import DecorativeCurve from '@/components/DecorativeCurve';
import { Brain, Grid3X3, Link2, CheckCircle2, Move, Zap, Hash, FlipHorizontal, Droplets, LayoutGrid, Palette } from 'lucide-react';

const GAMES_RULES = [
    {
        id: 'bubble',
        icon: Brain,
        name: 'Bubble Sort',
        accentColor: 'text-sky-500',
        accentBg: 'bg-sky-500/10',
        borderColor: 'border-sky-500/20',
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
        accentColor: 'text-sky-600',
        accentBg: 'bg-sky-600/10',
        borderColor: 'border-sky-600/20',
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
        accentColor: 'text-sky-400',
        accentBg: 'bg-sky-400/10',
        borderColor: 'border-sky-400/20',
        objective: 'Connect identical numbers or sequential numbers using continuous, non-overlapping spatial paths.',
        rules: [
            'Click, hold, and drag your cursor to create a path linking numbers sequentially (e.g., 1 to 2, 2 to 3) across the grid.',
            'Paths can only move horizontally or vertically between adjacent squares; diagonal movement is not permitted.',
            'No two paths can cross each other or overlap at any point.',
            'Complete the level by successfully connecting the sequence without breaking the spatial constraints.'
        ]
    },
    {
        id: 'motion',
        icon: Move,
        name: 'Motion Challenge',
        accentColor: 'text-sky-500',
        accentBg: 'bg-sky-500/10',
        borderColor: 'border-sky-500/20',
        objective: 'Navigate the green ball into the black hole using directional controls in as few moves as possible.',
        rules: [
            'Use arrow keys (desktop) or on-screen directional buttons (mobile) to move the green ball across the grid.',
            'The ball moves in the chosen direction until it hits a wall or obstacle.',
            'Your goal is to reach the black hole (target) in the minimum number of moves.',
            'Scoring: +4 points for each successful level, -1 penalty for each failed attempt. Fewer moves = higher score.'
        ]
    },
    {
        id: 'aptirush',
        icon: Zap,
        name: 'AptiRush',
        accentColor: 'text-sky-600',
        accentBg: 'bg-sky-600/10',
        borderColor: 'border-sky-600/20',
        objective: 'Answer 20 brain-based logic questions under strict time pressure with zero question repetition.',
        rules: [
            'Each level presents one unique logic/aptitude question with 4 answer options. You have 10–15 seconds per question.',
            'Scoring: +10 for correct answer, +5 speed bonus (answering within half the time), +50 completion bonus for finishing all 20 levels.',
            'The circular timer changes color as time runs out: Green → Normal, Orange → 5 sec left, Red → 3 sec left.',
        'Questions never repeat across attempts. Difficulty increases progressively through the 20 levels.'
        ]
    },
    {
        id: 'numberseries',
        icon: Hash,
        name: 'Number Series Catch',
        accentColor: 'text-sky-500',
        accentBg: 'bg-sky-500/10',
        borderColor: 'border-sky-500/20',
        objective: 'Identify the next number in a pattern and catch it with your bucket before it falls.',
        rules: [
            'A number series is displayed (arithmetic, geometric, square, cube, or alternating). You must figure out the pattern and the missing next number.',
            'Four options fall from the top. Move your bucket left/right using arrow keys or on-screen buttons to position under the correct answer.',
            'Press CATCH or Space/Enter to catch the number at your bucket position. Correct catch = +1 point, wrong or missed = 0.',
            'Falling speed increases with level. You have 10 seconds per question. 20 levels total.'
        ]
    },
    {
        id: 'mirror',
        icon: FlipHorizontal,
        name: 'Mirror Image',
        accentColor: 'text-sky-600',
        accentBg: 'bg-sky-600/10',
        borderColor: 'border-sky-600/20',
        objective: 'Identify the correct mirror (horizontal flip) of a given text or number string.',
        rules: [
            'A random string of letters and/or numbers is shown. You must select its exact mirror image (reversed left-to-right).',
            'Four options are provided — only one is the true mirror. Others are tricky distractors (partial reversal, shuffled, original).',
            'You have 10 seconds per question. Correct = +1, Wrong = 0. 20 levels total.',
            'Strings get longer and more complex as you progress through levels.'
        ]
    },
    {
        id: 'waterimage',
        icon: Droplets,
        name: 'Water Image',
        accentColor: 'text-sky-400',
        accentBg: 'bg-sky-400/10',
        borderColor: 'border-sky-400/20',
        objective: 'Identify the correct water reflection (vertical flip) of a given text string.',
        rules: [
            'A text string is shown with a visual water reflection line below it. You must choose the correct vertically-flipped representation.',
            'Water reflections use special Unicode characters to simulate upside-down text (e.g., A→∀, M→W).',
            'Four tricky options are given — partial flips, reversals, and originals serve as distractors.',
            '10 seconds per question, 20 levels. Correct = +1, Wrong = 0.'
        ]
    },
    {
        id: 'numpuzzle',
        icon: LayoutGrid,
        name: 'Number Puzzle',
        accentColor: 'text-sky-500',
        accentBg: 'bg-sky-500/10',
        borderColor: 'border-sky-500/20',
        objective: 'Analyze a 4×4 number grid and determine the missing value based on row/column patterns.',
        rules: [
            'A 4×4 grid of numbers is shown with one cell marked "?". The grid follows a mathematical pattern (multiplication, addition, column progression).',
            'Analyze row and column relationships to deduce the missing number.',
            'Choose from 4 options — only one correctly fits the pattern. 10 seconds per puzzle.',
            '20 puzzles total. Patterns include row multiples, column arithmetic, and addition tables.'
        ]
    },
    {
        id: 'colorsort',
        icon: Palette,
        name: 'Water Color Sort',
        accentColor: 'text-sky-600',
        accentBg: 'bg-sky-600/10',
        borderColor: 'border-sky-600/20',
        objective: 'Sort colored liquids into test tubes so each tube contains only one color.',
        rules: [
            'Multiple test tubes contain mixed colored layers. Tap a tube to select it, then tap another to pour. Liquid pours only if the top colors match or the destination is empty.',
            'Continuous same-colored layers pour together. Tubes hold a maximum of 4 layers. Two empty tubes are provided for strategy.',
            'Complete the sort within 10 seconds per level. Successfully sorted = +1 point. 20 levels with increasing color count.',
            'Use the Reset button to restart a level. Difficulty increases from 3 colors to 5 colors as you progress.'
        ]
    }
];

export default function About() {
    return (
        <div className="flex flex-col flex-1 w-full bg-[#F0F7FF] font-sans selection:bg-sky-100 min-h-[calc(100vh-80px)] relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#E0F2FE_0%,_#F0F9FF_40%,_#FFFFFF_100%)]" />
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#38BDF8] opacity-[0.04] blur-[120px] rounded-full" />
            </div>

            <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -top-[80px] sm:-top-[120px] left-[-10%] w-[120%] z-0 rotate-180 pointer-events-none scale-x-[1.1] translate-x-4 mix-blend-multiply" animate={true} />
            <DecorativeCurve opacity={0.06} height="h-[350px] sm:h-[480px]" className="absolute -top-[50px] sm:-top-[80px] left-[-5%] w-[110%] z-0 rotate-180 pointer-events-none scale-x-[1.05]" animate={true} />
            <DecorativeCurve opacity={0.12} height="h-[250px] sm:h-[360px]" className="absolute top-0 left-0 z-0 rotate-180 pointer-events-none" animate={true} />

            <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-8 sm:pt-14 pb-24 relative z-10 w-full">

                {/* Header */}
                <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
                    <h1 className="text-[clamp(28px,5vw,52px)] font-black tracking-tight text-[#0F172A] leading-[1.1] mb-4 sm:mb-6">
                        Game <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-sky-300 drop-shadow-sm">Rules & Objectives</span>
                    </h1>
                    <p className="text-[15px] sm:text-[18px] text-[#64748B] font-medium max-w-2xl mx-auto leading-relaxed px-2">
                        Master the mechanics of MindSprint's core challenges. Review the specific objectives and rules below to maximize your accuracy and speed.
                    </p>
                </div>

                {/* Rules List */}
                <div className="flex flex-col gap-6 sm:gap-10">
                    {GAMES_RULES.map((game, index) => (
                        <div
                            key={game.id}
                            className="relative z-20 overflow-hidden rounded-[20px] sm:rounded-[32px] bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(56,189,248,0.06)] hover:shadow-[0_20px_40px_rgba(56,189,248,0.12)] hover:-translate-y-1 transition-all duration-500 group/card"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/20 to-transparent pointer-events-none" />

                            <div className="relative z-10 p-5 sm:p-8 md:p-12 flex flex-col lg:flex-row gap-6 sm:gap-10 lg:gap-16">
                                {/* Left side */}
                                <div className="lg:w-[35%] flex flex-col">
                                    <div className="flex items-center gap-3 sm:gap-5 mb-5 sm:mb-8">
                                        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl ${game.accentBg} flex items-center justify-center shrink-0 border ${game.borderColor} group-hover/card:scale-105 transition-transform duration-500`}>
                                            <game.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${game.accentColor}`} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] sm:text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em] mb-1 sm:mb-1.5 block">Game 0{index + 1}</span>
                                            <h2 className="text-[20px] sm:text-[28px] font-black text-[#0F172A] leading-none tracking-tight">{game.name}</h2>
                                        </div>
                                    </div>

                                    <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border ${game.borderColor} bg-white shadow-sm relative overflow-hidden`}>
                                        <div className={`absolute top-0 left-0 w-1 h-full ${game.accentBg} brightness-90`} />
                                        <h3 className="text-[10px] sm:text-[11px] font-bold text-[#64748B] uppercase tracking-[0.15em] mb-2 sm:mb-3">Primary Objective</h3>
                                        <p className="text-[13px] sm:text-[15px] text-[#334155] leading-relaxed font-medium">
                                            {game.objective}
                                        </p>
                                    </div>
                                </div>

                                {/* Right side */}
                                <div className="lg:w-[65%] flex flex-col justify-center">
                                    <h3 className="text-[12px] sm:text-[13px] font-bold text-[#0F172A] uppercase tracking-[0.1em] mb-5 sm:mb-8 flex items-center gap-4">
                                        How to Play
                                        <div className="flex-1 h-px bg-gradient-to-r from-[#E5E7EB] to-transparent" />
                                    </h3>

                                    <ul className="flex flex-col gap-3 sm:gap-5">
                                        {game.rules.map((rule, rIdx) => (
                                            <li key={rIdx} className="flex gap-3 sm:gap-4 items-start group/item">
                                                <div className="mt-0.5 shrink-0 bg-white p-0.5 rounded-full shadow-sm border border-[#E5E7EB] group-hover/item:border-transparent transition-colors duration-300">
                                                    <CheckCircle2 className={`w-4 h-4 sm:w-5 sm:h-5 ${game.accentColor} opacity-80 group-hover/item:opacity-100 transition-opacity`} />
                                                </div>
                                                <p className="text-[14px] sm:text-[16px] text-[#475569] leading-relaxed">
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

            <DecorativeCurve opacity={0.05} height="h-[400px] sm:h-[550px]" className="absolute -bottom-[80px] sm:-bottom-[120px] left-[-10%] w-[120%] z-0 pointer-events-none scale-x-[1.1] -translate-x-4 mix-blend-multiply" animate={true} />
            <DecorativeCurve opacity={0.07} height="h-[350px] sm:h-[480px]" className="absolute -bottom-[50px] sm:-bottom-[80px] left-[-5%] w-[110%] z-0 pointer-events-none scale-x-[1.05]" animate={true} />
            <DecorativeCurve opacity={0.12} height="h-[250px] sm:h-[360px]" className="absolute bottom-0 left-0 z-0 pointer-events-none" animate={true} />
        </div>
    );
}