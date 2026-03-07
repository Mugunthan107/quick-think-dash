import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Download, Trash2, Plus, Users, Activity, Play, Search, X, Bell, Check, RefreshCw, Clock, Square, Trophy, Medal, Filter, Eye, EyeOff, Crown, User, FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState, useRef } from 'react';
import CountdownOverlay from '@/components/CountdownOverlay';
import DecorativeCurve from '@/components/DecorativeCurve';

import AshuLogin from './AshuLogin';

const GAME_LABELS: Record<string, string> = {
  bubble: 'Bubble',
  crossmath: 'Math',
  numlink: 'Link',
  aptirush: 'Apti',
  motion: 'Motion',
  numberseries: 'Series',
  mirror: 'Mirror',
  waterimage: 'Water',
  numpuzzle: 'Puzzle',
  colorsort: 'Color',
};

const GAME_MAX_SCORES: Record<string, number> = {
  bubble: 600,
  numlink: 250,
  motion: 100,
  aptirush: 200,
  crossmath: 350,
  numberseries: 200,
  mirror: 200,
  waterimage: 200,
  numpuzzle: 200,
  colorsort: 200,
};

const formatTime = (s: number) => {
  if (s === undefined || s === null) return '—';
  if (s <= 0) return '0s';
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
};

// ─── Medal colors ────────────────────────────────────────
const MEDAL = {
  1: {
    bg: 'bg-gradient-to-br from-amber-100 to-amber-50',
    border: 'border-amber-400',
    shadow: 'shadow-[0_12px_40px_-12px_rgba(251,191,36,0.6)]',
    text: 'text-amber-500',
    glow: 'hover:shadow-[0_12px_50px_-12px_rgba(251,191,36,0.8)]',
  },
  2: {
    bg: 'bg-gradient-to-br from-slate-100 to-slate-50',
    border: 'border-slate-300',
    shadow: 'shadow-[0_12px_35px_-12px_rgba(148,163,184,0.5)]',
    text: 'text-slate-500',
    glow: 'hover:shadow-[0_12px_40px_-12px_rgba(148,163,184,0.7)]',
  },
  3: {
    bg: 'bg-gradient-to-br from-orange-100 to-orange-50',
    border: 'border-orange-300',
    shadow: 'shadow-[0_12px_35px_-12px_rgba(249,115,22,0.5)]',
    text: 'text-orange-500',
    glow: 'hover:shadow-[0_12px_40px_-12px_rgba(249,115,22,0.7)]',
  },
} as const;

// ─── Podium Card Component ───────────────────────────────
interface PodiumCardProps {
  rank: 1 | 2 | 3;
  name: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number;
  large?: boolean;
}

const PodiumCard = ({ rank, name, score, correctAnswers, totalQuestions, timeTaken, large }: PodiumCardProps) => {
  const m = MEDAL[rank];
  return (
    <div className={`flex flex-col items-center ${large ? '-mt-4 sm:-mt-6' : ''}`}>
      {/* Rank Indicator */}
      <div className="mb-2 sm:mb-3 flex flex-col items-center justify-end h-10 sm:h-12">
        {rank === 1 && <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500 drop-shadow-md pb-1" fill="currentColor" />}
        {rank === 2 && (
          <div className="flex flex-col items-center">
            <span className="font-black text-slate-500 text-lg sm:text-xl leading-none">2</span>
            <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-transparent border-b-emerald-500 mt-1" />
          </div>
        )}
        {rank === 3 && (
          <div className="flex flex-col items-center">
            <span className="font-black text-orange-500 text-lg sm:text-xl leading-none">3</span>
            <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-transparent border-t-red-500 mt-1" />
          </div>
        )}
      </div>

      {/* Circular Glassmorphism Avatar */}
      <div
        className={`relative flex items-center justify-center rounded-full border-[3px] sm:border-[4px] p-1.5 transition-all duration-300 hover:scale-[1.05] cursor-default
          bg-white/60 backdrop-blur-xl ${m.border} ${m.shadow} ${m.glow}
          ${large ? 'w-28 h-28 sm:w-36 sm:h-36 z-20' : 'w-20 h-20 sm:w-28 sm:h-28 z-10'}`}
      >
        <div className={`w-full h-full rounded-full flex items-center justify-center ${m.bg} shadow-inner`}>
          <User className={`w-1/2 h-1/2 ${m.text}`} strokeWidth={2.5} />
        </div>
      </div>

      {/* Details underneath */}
      <div className="mt-3 sm:mt-4 text-center flex flex-col items-center bg-white/40 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-black/[0.03]">
        <span className={`font-bold text-foreground truncate w-24 sm:w-28 ${large ? 'text-[15px] sm:text-[16px]' : 'text-xs sm:text-sm'}`}>{name}</span>
        <span className={`font-black tracking-tighter ${m.text} ${large ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} leading-none mt-1`}>{score}</span>
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground font-semibold mt-1">
          <span>{correctAnswers}/{totalQuestions}</span>
          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
          <span>{timeTaken.toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
};

// ─── Podium Row ──────────────────────────────────────────
interface PodiumRowProps {
  top3: Array<{
    username: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeTaken: number;
  }>;
}

const PodiumRow = ({ top3 }: PodiumRowProps) => {
  const [first, second, third] = top3;
  return (
    <div className="flex items-end justify-center gap-2 sm:gap-6 pt-8 pb-4">
      {/* 2nd place — left */}
      {second ? (
        <div className="flex flex-col items-center">
          <PodiumCard
            rank={2}
            name={second.username}
            score={second.score}
            correctAnswers={second.correctAnswers}
            totalQuestions={second.totalQuestions}
            timeTaken={second.timeTaken}
          />
        </div>
      ) : <div className="w-24 sm:w-28" />}

      {/* 1st place — center */}
      {first ? (
        <div className="flex flex-col items-center z-20">
          <PodiumCard
            rank={1}
            name={first.username}
            score={first.score}
            correctAnswers={first.correctAnswers}
            totalQuestions={first.totalQuestions}
            timeTaken={first.timeTaken}
            large
          />
        </div>
      ) : null}

      {/* 3rd place — right */}
      {third ? (
        <div className="flex flex-col items-center">
          <PodiumCard
            rank={3}
            name={third.username}
            score={third.score}
            correctAnswers={third.correctAnswers}
            totalQuestions={third.totalQuestions}
            timeTaken={third.timeTaken}
          />
        </div>
      ) : <div className="w-24 sm:w-28" />}
    </div>
  );
};

// ─── Main Dashboard Component ────────────────────────────
const AshuDashboard = () => {
  const {
    adminLoggedIn,
    currentTest,
    students,
    pendingStudents,
    sessions,
    createTestPin,
    deleteAllUsers,
    deleteSession,
    getLeaderboard,
    adminLogout,
    switchSession,
    setCurrentStudent,
    startTest,
    approveStudent,
    rejectStudent,
    getGameLeaderboard,
    fetchStudents,
    fetchSessions,
    stopTest,
    toggleShowResults,
  } = useGame();
  const navigate = useNavigate();

  const [showCountdown, setShowCountdown] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [leaderboardTab, setLeaderboardTab] = useState<'overall' | 'bubble' | 'crossmath' | 'numlink' | 'aptirush' | 'motion' | 'numberseries' | 'mirror' | 'waterimage' | 'numpuzzle' | 'colorsort'>('overall');
  const [showCreatePinDialog, setShowCreatePinDialog] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedGames, setSelectedGames] = useState<string[]>(['bubble']);
  const [isCreatingPin, setIsCreatingPin] = useState(false);

  const availableGamesList = [
    { id: 'bubble', name: 'Bubble' },
    { id: 'crossmath', name: 'Cross Math' },
    { id: 'numlink', name: 'NumLink' },
    { id: 'aptirush', name: 'AptiRush' },
    { id: 'motion', name: 'Motion' },
    { id: 'numberseries', name: 'Number Series' },
    { id: 'mirror', name: 'Mirror Image' },
    { id: 'waterimage', name: 'Water Image' },
    { id: 'numpuzzle', name: 'Number Puzzle' },
    { id: 'colorsort', name: 'Color Sort' },
  ];

  // Track previous pending count so toast only fires on NEW arrivals (not on re-renders)
  const prevPendingCount = useRef(0);
  useEffect(() => {
    if (pendingStudents.length > prevPendingCount.current) {
      toast.info(`${pendingStudents.length - prevPendingCount.current} new join request(s)`, {
        description: 'A student is waiting for approval to join the active test.',
        duration: 8000,
        action: { label: 'Review', onClick: () => setShowRequestsModal(true) }
      });
    }
    prevPendingCount.current = pendingStudents.length;
  }, [pendingStudents.length]);

  // Polling fallback: re-fetch students every 5s so admin sees new joins even if real-time is missed
  useEffect(() => {
    if (!currentTest?.pin) return;
    const poll = setInterval(() => {
      fetchStudents(currentTest.pin);
    }, 5000);
    return () => clearInterval(poll);
  }, [currentTest?.pin, fetchStudents]);

  const handleCreatePin = async () => {
    if (isCreatingPin) return;
    setIsCreatingPin(true);
    try {
      const pin = await createTestPin(selectedGames);
      toast.success(`Test PIN created: ${pin} (${selectedGames.length} game${selectedGames.length > 1 ? 's' : ''})`);
      setShowCreatePinDialog(false);
      setSelectedGames(['bubble']);
    } catch (e) {
      toast.error('Failed to create PIN. Check your internet connection and Supabase status.');
    } finally {
      setIsCreatingPin(false);
    }
  };

  if (!adminLoggedIn) return <AshuLogin />;

  const handleCopyPin = () => {
    if (currentTest) {
      navigator.clipboard.writeText(currentTest.pin);
      toast.success('PIN copied to clipboard');
    }
  };

  const exportPDF = () => {
    const leaderboard = getLeaderboard();
    if (leaderboard.length === 0) { toast.error('No completed results to download'); return; }

    const selectedGames = currentTest?.selectedGames || ['bubble'];
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 20, 120);
    doc.text(`Test Results — PIN: ${currentTest?.pin}`, 14, 22);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 120);
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}   |   Total Students: ${students.length}`, 14, 30);

    const tableColumn = ["#", "Name", ...selectedGames.map(g => GAME_LABELS[g] || g), "Total", "Score %", "Total Time"];

    const tableRows = leaderboard.map((student, index) => {
      const totalTime = student.gameHistory?.reduce((acc, g) => acc + g.timeTaken, 0) || 0;
      const getGameCell = (gameId: string) => {
        const g = student.gameHistory?.find(h => h.gameId === gameId);
        if (!g) return '—';
        return `${g.score}`;
      };
      const totalPossible = selectedGames.reduce((acc, gId) => acc + (GAME_MAX_SCORES[gId] || 0), 0);
      const percentage = totalPossible > 0 ? `${((student.score / totalPossible) * 100).toFixed(0)}%` : '0%';
      return [
        index + 1,
        student.username,
        ...selectedGames.map(gId => getGameCell(gId)),
        student.score,
        percentage,
        formatTime(totalTime),
      ];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 38,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: 'visible',
        lineColor: [220, 215, 240],
        lineWidth: 0.1,
        textColor: [30, 20, 60],
        font: 'helvetica',
      },
      headStyles: {
        fillColor: [120, 60, 220],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 'auto', minCellWidth: 40 },
      },
      alternateRowStyles: { fillColor: [248, 246, 255] },
    });

    doc.save(`results-pin-${currentTest?.pin}.pdf`);
    toast.success('Results downloaded as PDF');
    setShowExportModal(false);
  };

  const exportExcel = () => {
    const leaderboard = getLeaderboard();
    if (leaderboard.length === 0) { toast.error('No completed results to download'); return; }

    const selectedGames = currentTest?.selectedGames || ['bubble'];
    const headers = ["Rank", "Name", ...selectedGames.map(g => GAME_LABELS[g] || g), "Total", "Score %", "Total Time"];

    const tableRows = leaderboard.map((student, index) => {
      const totalTime = student.gameHistory?.reduce((acc, g) => acc + g.timeTaken, 0) || 0;
      const getGameCell = (gameId: string) => {
        const g = student.gameHistory?.find(h => h.gameId === gameId);
        if (!g) return '—';
        return `${g.score}`;
      };
      const totalPossible = selectedGames.reduce((acc, gId) => acc + (GAME_MAX_SCORES[gId] || 0), 0);
      const percentage = totalPossible > 0 ? `${((student.score / totalPossible) * 100).toFixed(0)}%` : '0%';
      return [
        index + 1,
        student.username,
        ...selectedGames.map(gId => getGameCell(gId)),
        student.score,
        percentage,
        formatTime(totalTime),
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...tableRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, `results-pin-${currentTest?.pin}.xlsx`);
    toast.success('Results downloaded as Excel');
    setShowExportModal(false);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete all user data for this test? This cannot be undone.')) {
      await deleteAllUsers();
      toast.success('All student data deleted');
    }
  };

  const finished = students.filter(s => s.isFinished);
  const active = students.filter(s => !s.isFinished);

  // ──────────────────────────────────────────────────────
  // Build leaderboard data for modal
  // ──────────────────────────────────────────────────────
  const getDisplayLeaderboard = () => {
    const raw = leaderboardTab === 'overall' ? getLeaderboard() : getGameLeaderboard(leaderboardTab);
    return raw.filter(s => s.username.toLowerCase().includes(leaderboardSearch.toLowerCase()));
  };

  const buildPodiumEntry = (s: any) => {
    if (leaderboardTab === 'overall') {
      const totalTime = s.gameHistory?.reduce((acc: number, g: any) => acc + g.timeTaken, 0) || 0;
      return { username: s.username, score: s.score, correctAnswers: s.correctAnswers || 0, totalQuestions: s.totalQuestions || 0, timeTaken: totalTime };
    }
    const h = s.gameHistory?.find((g: any) => g.gameId === leaderboardTab);
    const displayScore = leaderboardTab === 'motion' ? (h?.moves ?? h?.score ?? 0) : (h?.score ?? 0);
    return { username: s.username, score: displayScore, correctAnswers: h?.correctAnswers || 0, totalQuestions: h?.totalQuestions || (leaderboardTab === 'motion' ? 10 : leaderboardTab === 'bubble' ? 30 : 20), timeTaken: h?.timeTaken || 0 };
  };

  return (
    <div className="relative flex flex-col flex-1 w-full h-full bg-[#FDFDFF] overflow-y-auto font-sans selection:bg-indigo-100 pb-16 pt-6 sm:pt-10">
      {showCountdown && <CountdownOverlay onComplete={() => setShowCountdown(false)} />}

      {/* Layer 1: Premium Background Depth */}
      <div className="absolute inset-0 z-0 pointer-events-none fixed">
        <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#F5F3FF_0%,_#ECFEFF_40%,_#FFFFFF_100%)]" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#6C63FF] opacity-[0.03] blur-[120px] rounded-full" />
      </div>

      {/* Decorative Waves */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top Decorative Wave - Tertiary */}
        <DecorativeCurve opacity={0.04} height="h-[200px] sm:h-[300px]" className="absolute -top-[40px] left-[-10%] w-[120%] rotate-180 scale-x-[1.1] translate-x-4 mix-blend-multiply" animate={true} />
        {/* Top Decorative Wave - Secondary */}
        <DecorativeCurve opacity={0.06} height="h-[150px] sm:h-[250px]" className="absolute top-0 left-[-5%] w-[110%] rotate-180 scale-x-[1.05]" animate={true} />
        {/* Top Decorative Wave - Primary */}
        <DecorativeCurve opacity={0.12} height="h-[100px] sm:h-[180px]" className="absolute top-0 left-0 rotate-180" animate={true} />

        {/* Bottom Decorative Wave - Tertiary */}
        <DecorativeCurve opacity={0.05} height="h-[200px] sm:h-[300px]" className="absolute -bottom-[40px] left-[-10%] w-[120%] scale-x-[1.1] -translate-x-4 mix-blend-multiply" animate={true} />
        {/* Bottom Decorative Wave - Secondary */}
        <DecorativeCurve opacity={0.07} height="h-[150px] sm:h-[250px]" className="absolute bottom-0 left-[-5%] w-[110%] scale-x-[1.05]" animate={true} />
        {/* Bottom Decorative Wave - Primary */}
        <DecorativeCurve opacity={0.12} height="h-[100px] sm:h-[180px]" className="absolute bottom-0 left-0" animate={true} />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10 animate-fade-in group/container space-y-8">

        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8 px-2">
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-[28px] font-black text-[#0F172A] tracking-tight leading-none mb-2">Admin Dashboard</h1>
            <p className="text-[13px] sm:text-[14px] text-[#64748B] font-medium leading-tight">Manage tests and monitor progress</p>
          </div>
        </div>

        {/* Test PIN Section */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[20px] shadow-[0_8px_30px_rgba(20,20,40,0.04)] p-6 sm:p-10 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-widest">Test Session</h2>
            <div className="flex items-center gap-4">
              {/* Notification Bell next to Session Picker */}
              <div className="relative group/bell">
                <Button
                  variant="ghost" size="icon"
                  onClick={() => setShowRequestsModal(!showRequestsModal)}
                  className={`rounded-full hover:bg-[#F1F5F9] relative transition-all duration-300 ${pendingStudents.length > 0 ? 'text-[#3B82F6]' : 'text-[#94A3B8]'}`}
                >
                  <Bell className="w-5 h-5" />
                  {pendingStudents.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
                      {pendingStudents.length}
                    </span>
                  )}
                </Button>

                {/* Contextual Join Requests Popover */}
                {showRequestsModal && (
                  <>
                    <div className="fixed inset-0 z-[60] backdrop-blur-[2px] bg-black/5 transition-all duration-300" onClick={() => setShowRequestsModal(false)} />
                    <div className="absolute top-12 right-0 w-[320px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-border animate-in slide-in-from-top-2 duration-300 z-[70] overflow-hidden">
                      <div className="p-4 border-b border-border bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-accent" />
                          <h2 className="text-sm font-bold text-foreground">Join Requests</h2>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{pendingStudents.length} Pending</span>
                          <Button variant="ghost" size="icon" onClick={() => setShowRequestsModal(false)} className="w-6 h-6 rounded-full hover:bg-slate-200/60 text-muted-foreground transition-colors ml-1">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {pendingStudents.length === 0 ? (
                          <div className="text-center py-10 flex flex-col items-center gap-3">
                            <span className="text-4xl">😴</span>
                            <div className="flex flex-col gap-1">
                              <p className="text-[13px] font-bold text-slate-400 italic">"Silence... even the crickets are waiting."</p>
                              <p className="text-[10px] text-slate-300 font-medium">No new students are knocking on the door yet.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {pendingStudents.map(student => (
                              <div key={student.username} className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                                    <User className="w-4 h-4 text-slate-500" />
                                  </div>
                                  <span className="font-bold text-sm text-foreground truncate max-w-[120px]">{student.username}</span>
                                </div>
                                <div className="flex gap-1.5">
                                  <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10 rounded-lg w-8 h-8" onClick={() => rejectStudent(student.username)}><X className="w-4 h-4" /></Button>
                                  <Button size="icon" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg w-8 h-8 shadow-sm shadow-emerald-200" onClick={() => {
                                    approveStudent(student.username);
                                    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                                  }}><Check className="w-4 h-4" /></Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {sessions.length > 0 ? (
                <Select value={currentTest?.pin} onValueChange={(value) => {
                  const selected = sessions.find(s => s.pin === value);
                  if (selected) { setCurrentStudent(null); switchSession(selected); }
                }}>
                  <SelectTrigger className="w-[140px] sm:w-[180px] h-9 text-xs bg-white text-[#475569] border-[#E2E8F0] shadow-sm rounded-xl hover:bg-[#F8FAFC] transition-colors">
                    <SelectValue placeholder="Select Session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem key={session.pin} value={session.pin}>
                        PIN: {session.pin} {session.isActive ? '(Active)' : '(Inactive)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Button variant="ghost" size="sm" onClick={fetchSessions} className="h-8 text-[10px] text-muted-foreground hover:text-foreground">
                  <RefreshCw className="w-3 h-3 mr-1" />Reload Sessions
                </Button>
              )}
            </div>
          </div>

          {currentTest ? (
            <div className="space-y-4 sm:space-y-5">
              <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                <div className="bg-accent/5 rounded-xl px-4 sm:px-6 py-4 flex-1 min-w-0 border border-accent/20 relative overflow-hidden"
                  style={{ boxShadow: '0 0 20px hsl(258 80% 58% / 0.10)' }}>
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Activity className="w-24 h-24 text-accent" />
                  </div>
                  <span className="text-[10px] text-accent font-bold block mb-2 uppercase tracking-wider">Session Active</span>
                  <div className="font-mono text-3xl sm:text-5xl font-bold text-accent tracking-[0.1em] mb-2" style={{ textShadow: '0 0 20px hsl(258 80% 58% / 0.25)' }}>{currentTest.pin}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Created: {new Date(currentTest.createdAt).toLocaleTimeString()}</span>
                    <span>•</span>
                    <span>{students.length} Joined</span>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-xl px-4 sm:px-6 py-4 border border-border/50 flex flex-col justify-center min-w-[140px] shadow-sm">
                  <span className="text-[10px] text-muted-foreground font-bold block mb-2 uppercase tracking-wider">Results Visibility</span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleShowResults(currentTest.pin, !currentTest.showResults)}
                      className={`h-10 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${currentTest.showResults
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                        }`}
                    >
                      {currentTest.showResults ? (
                        <><Eye className="w-4 h-4" /> Shown</>
                      ) : (
                        <><EyeOff className="w-4 h-4" /> Hidden</>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handleCopyPin} className="border-border h-12 w-12 rounded-xl"><Copy className="w-5 h-5" /></Button>
                    <Button variant="outline" size="icon" onClick={() => deleteSession(currentTest.pin)} className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground h-12 w-12 rounded-xl"><Trash2 className="w-5 h-5" /></Button>
                  </div>
                  {currentTest.status !== 'STARTED' ? (
                    <Button
                      onClick={() => { startTest(); setShowCountdown(true); }}
                      className="h-16 w-full sm:w-48 text-xl font-bold btn-primary text-white rounded-xl"
                      style={{ boxShadow: '0 0 22px hsl(158 70% 45% / 0.32), 0 4px 16px hsl(158 70% 45% / 0.20)', background: 'linear-gradient(135deg, hsl(158 68% 40%) 0%, hsl(145 65% 35%) 100%)' }}
                    >
                      <Play className="w-6 h-6 mr-2 fill-current" />START TEST
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="h-16 w-full sm:w-48 flex items-center justify-center bg-emerald-50 border border-emerald-300/60 rounded-xl"
                        style={{ boxShadow: '0 0 14px hsl(158 70% 45% / 0.15)' }}>
                        <span className="text-emerald-600 font-bold flex items-center gap-2 text-sm">
                          <Activity className="w-4 h-4 animate-pulse" />RUNNING
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Stop the test? All students still playing will be marked as finished.')) stopTest();
                        }}
                        className="h-10 w-full sm:w-48 flex items-center justify-center gap-2 rounded-xl bg-red-50 hover:bg-destructive hover:text-white text-destructive border border-destructive/30 font-bold text-sm transition-all duration-200"
                        style={{ boxShadow: '0 0 8px hsl(348 85% 55% / 0.10)' }}
                      >
                        <Square className="w-4 h-4 fill-current" />Stop Test
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { icon: <Users className="w-3.5 h-3.5 text-accent" />, value: students.length, label: 'Joined', bg: 'icon-bg-purple', glow: '0 0 14px hsl(258 76% 55% / 0.12)' },
                  { icon: <Activity className="w-3.5 h-3.5 text-blue-500" />, value: active.length, label: 'Active', bg: 'icon-bg-blue', glow: '0 0 14px hsl(210 90% 60% / 0.12)' },
                  { icon: <span className="text-xs text-emerald-600 font-bold">✓</span>, value: finished.length, label: 'Done', bg: 'icon-bg-green', glow: '0 0 14px hsl(158 68% 36% / 0.12)' },
                ].map(({ icon, value, label, bg, glow }) => (
                  <div key={label} className={`${bg} rounded-xl p-2.5 sm:p-3 text-center border`}
                    style={{ boxShadow: glow }}>
                    <div className="flex justify-center mb-1">{icon}</div>
                    <span className="font-mono font-bold text-base sm:text-lg text-foreground block">{value}</span>
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium">{label}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={() => setShowCreatePinDialog(true)} size="sm" className="flex-1 btn-primary text-white rounded-lg text-xs sm:text-sm">
                  <Plus className="w-3.5 h-3.5 mr-1" />New Session
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 sm:py-14">
              <p className="text-[#94A3B8] text-[15px] mb-6 font-semibold">No active session selected</p>
              <Button onClick={() => setShowCreatePinDialog(true)} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[14px] h-[46px] px-8 text-[14px] font-bold shadow-md shadow-blue-500/20 hover:-translate-y-0.5 hover:shadow-blue-500/40 transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />Create Test PIN
              </Button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8 sm:mb-12 flex-wrap pb-4">
          <div className="relative">
            <Button onClick={() => setShowExportModal(!showExportModal)} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[14px] h-[40px] px-6 text-[14px] font-bold shadow-md shadow-blue-500/20 hover:-translate-y-0.5 hover:shadow-blue-500/40 transition-all duration-300">
              <Download className="w-4 h-4 mr-2" />Download
            </Button>

            {showExportModal && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowExportModal(false)} />
                <div className="absolute top-full left-0 mt-2 z-50 w-[240px] bg-white rounded-2xl shadow-2xl border border-border p-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-2 mb-1">
                    <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest px-2">Export results</h3>
                  </div>
                  <button
                    onClick={exportPDF}
                    className="flex items-center gap-3 w-full p-2 hover:bg-red-50 rounded-xl transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                      <FileText className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="text-left">
                      <span className="block font-bold text-[#0F172A] text-xs">PDF Document</span>
                    </div>
                  </button>
                  <button
                    onClick={exportExcel}
                    className="flex items-center gap-3 w-full p-2 hover:bg-emerald-50 rounded-xl transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-left">
                      <span className="block font-bold text-[#0F172A] text-xs">Excel Sheet</span>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
          <Button onClick={handleDelete} variant="outline" className="border-[#FECACA] text-[#EF4444] bg-white hover:bg-[#FEF2F2] hover:text-[#DC2626] rounded-[14px] h-[40px] px-6 text-[14px] font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
            <Trash2 className="w-4 h-4 mr-2" />Delete All
          </Button>
        </div>

        {/* ── Embedded Podium Leaderboard ───────────────── */}
        {getLeaderboard().length > 0 && (() => {
          const lb = getLeaderboard();
          const selectedGames = currentTest?.selectedGames || ['bubble'];

          return (
            <div className="bg-white rounded-2xl border border-border shadow-[0_4px_16px_hsl(260_40%_90%/0.5)] overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center justify-between bg-white/50">
                <h2 className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" /> Live Leaderboard
                </h2>
              </div>

              {/* Podium display for Top 3 */}
              <div className="bg-slate-50/30 border-b border-border">
                <PodiumRow top3={lb.slice(0, 3).map(s => buildPodiumEntry(s))} />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse" style={{ minWidth: `${400 + selectedGames.length * 100}px` }}>
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-border">
                      <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-wider text-center w-12 sticky left-0 bg-slate-50 z-10">#</th>
                      <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-wider text-left min-w-[140px] sticky left-12 bg-slate-50 z-10">Name</th>
                      {selectedGames.map(gId => (
                        <th key={gId} className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-wider text-center">{GAME_LABELS[gId] || gId}</th>
                      ))}
                      <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-wider text-right block-total">Correct</th>
                      <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-wider text-right block-total w-16">Total</th>
                      <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-wider text-right block-total w-16">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {lb.map((s, idx) => {
                      const totalTime = s.gameHistory?.reduce((a, g) => a + g.timeTaken, 0) || 0;
                      return (
                        <tr key={s.username} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 text-center sticky left-0 bg-inherit z-10">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black
                              ${idx === 0 ? 'bg-amber-100 text-amber-600 border border-amber-200 shadow-sm' :
                                idx === 1 ? 'bg-slate-100 text-slate-600 border border-slate-200 shadow-sm' :
                                  idx === 2 ? 'bg-orange-100 text-orange-600 border border-orange-200 shadow-sm' :
                                    'bg-secondary text-muted-foreground'}`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3 sticky left-12 bg-inherit z-10">
                            <span className="font-bold text-foreground block truncate max-w-[120px]">{s.username}</span>
                            <span className="text-[10px] text-muted-foreground font-semibold">{formatTime(totalTime)}</span>
                          </td>
                          {selectedGames.map(gId => {
                            const gd = s.gameHistory?.find(h => h.gameId === gId);
                            return (
                              <td key={gId} className="px-4 py-3 text-center">
                                {gd ? (
                                  <div className="flex flex-col items-center">
                                    <span className="font-mono font-bold text-foreground">{gd.score}</span>
                                    <span className="text-[9px] text-muted-foreground tabular-nums font-semibold">{formatTime(gd.timeTaken)}</span>
                                  </div>
                                ) : <span className="text-muted-foreground/30 font-black">—</span>}
                              </td>
                            );
                          })}
                          <td className="px-4 py-3 text-right">
                            <span className="font-mono font-bold text-emerald-500 text-sm leading-none">
                              {s.correctAnswers}/{s.totalQuestions}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-mono font-black text-foreground text-base tracking-tighter block leading-none">
                              {s.score}
                            </span>
                            <span className="font-mono font-bold text-[#94A3B8] text-[10px] block mt-1">
                              {totalTime.toFixed(1)}s
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-mono font-black text-sky-500 text-base tracking-tighter block leading-none">
                              {(() => {
                                const totalPossible = selectedGames.reduce((acc, gId) => acc + (GAME_MAX_SCORES[gId] || 0), 0);
                                if (totalPossible === 0) return '0%';
                                return `${((s.score / totalPossible) * 100).toFixed(0)}%`;
                              })()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {/* ── Leaderboard Modal ─────────────────────────── */}
        {showLeaderboardModal && (() => {
          const displayList = getDisplayLeaderboard();
          const selectedGames = currentTest?.selectedGames || ['bubble'];

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden">

                {/* Modal Header */}
                <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between shrink-0 bg-white">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">Detailed Scoreboard</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowLeaderboardModal(false)} className="rounded-full hover:bg-secondary"><X className="w-5 h-5" /></Button>
                </div>

                <div className="p-4 bg-secondary/20 flex flex-col sm:flex-row gap-4 items-center">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search student..." value={leaderboardSearch} onChange={e => setLeaderboardSearch(e.target.value)} className="pl-9 bg-white border-border" />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 no-scrollbar">
                    {leaderboardTab !== 'overall' ? (
                      <Button variant="outline" size="sm" onClick={() => setLeaderboardTab('overall')} className="rounded-lg h-9 text-xs font-bold shrink-0">Show Overall</Button>
                    ) : (
                      <div className="bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-lg text-xs font-bold text-accent shrink-0">Overall View Enabled</div>
                    )}
                  </div>
                </div>

                {/* Table container with horizontal scroll */}
                <div className="overflow-auto flex-1 custom-scrollbar pb-10">
                  {displayList.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground font-medium italic">No results found matching your search.</div>
                  ) : (
                    <table className="w-full text-sm border-collapse" style={{ minWidth: `${500 + selectedGames.length * 100}px` }}>
                      <thead>
                        <tr className="bg-secondary/40 border-b border-border sticky top-0 z-20">
                          <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-wider text-center w-16 sticky left-0 bg-secondary z-30">Rank</th>
                          <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-wider text-left min-w-[180px] sticky left-16 bg-secondary z-30">Student Name</th>
                          {selectedGames.map(gId => (
                            <th key={gId} className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-wider text-center">{GAME_LABELS[gId] || gId}</th>
                          ))}
                          <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-wider text-right w-24">Total</th>
                          <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-wider text-right sticky right-0 bg-secondary z-20 w-20">%</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {displayList.map((s, idx) => {
                          const totalTime = s.gameHistory?.reduce((a, g) => a + (g.timeTaken || 0), 0) || 0;
                          return (
                            <tr key={s.username} className={`hover:bg-slate-50 transition-colors group ${idx < 3 ? 'bg-amber-50/10' : ''}`}>
                              <td className="px-6 py-5 text-center sticky left-0 bg-inherit z-10">
                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm mx-auto
                                  ${idx === 0 ? 'bg-amber-400 text-white' :
                                    idx === 1 ? 'bg-slate-400 text-white' :
                                      idx === 2 ? 'bg-orange-400 text-white' :
                                        'bg-secondary text-muted-foreground'}`}>
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="px-6 py-5 sticky left-16 bg-inherit z-10 border-r border-border/50">
                                <span className="font-black text-foreground text-[15px]">{s.username}</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <Clock className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-[11px] text-muted-foreground font-bold">{formatTime(totalTime)}</span>
                                  <span className="text-[11px] text-muted-foreground">•</span>
                                  <span className="text-[11px] text-muted-foreground font-bold">{s.gamesPlayed || 0} Games</span>
                                </div>
                              </td>
                              {selectedGames.map(gId => {
                                const gd = s.gameHistory?.find(h => h.gameId === gId);
                                return (
                                  <td key={gId} className="px-6 py-5 text-center">
                                    {gd ? (
                                      <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-1.5 justify-center mb-1">
                                          <span className="font-mono font-black text-foreground text-[14px]">{gd.score}</span>
                                        </div>
                                        <div className="flex items-center gap-2 justify-center">
                                          <span className="text-[10px] text-success font-black">{gd.correctAnswers}/{gd.totalQuestions}</span>
                                          <span className="text-[10px] text-muted-foreground font-semibold tabular-nums">{formatTime(gd.timeTaken)}</span>
                                        </div>
                                      </div>
                                    ) : <span className="text-muted-foreground/30 font-black">—</span>}
                                  </td>
                                );
                              })}
                              <td className="px-6 py-5 text-right font-mono font-black text-foreground text-xl tracking-tighter">
                                {s.score}
                              </td>
                              <td className="px-6 py-5 text-right sticky right-0 bg-inherit z-10 shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.05)]">
                                <span className="font-mono font-black text-sky-600 text-xl tracking-tighter">
                                  {(() => {
                                    const totalPossible = selectedGames.reduce((acc, gId) => acc + (GAME_MAX_SCORES[gId] || 0), 0);
                                    if (totalPossible === 0) return '0%';
                                    return `${((s.score / totalPossible) * 100).toFixed(0)}%`;
                                  })()}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Create PIN Dialog */}
        {showCreatePinDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-border animate-in zoom-in-95 duration-200 p-6">
              <h2 className="text-lg font-bold text-foreground mb-1">Create New Session</h2>
              <p className="text-sm text-muted-foreground mb-6 font-medium">Select which games students will play.</p>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm text-muted-foreground font-semibold">Select Games</label>
                    <button
                      type="button"
                      onClick={() => {
                        const allIds = availableGamesList.map(g => g.id);
                        if (selectedGames.length === allIds.length) {
                          setSelectedGames(['bubble']);
                        } else {
                          setSelectedGames(allIds);
                        }
                      }}
                      className="text-[11px] font-black text-accent hover:text-accent/80 transition-colors uppercase tracking-wider"
                    >
                      {selectedGames.length === availableGamesList.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[280px] overflow-y-auto px-1 custom-scrollbar">
                    {availableGamesList.map(game => (
                      <button key={game.id}
                        onClick={() => setSelectedGames(prev => prev.includes(game.id) ? prev.filter(id => id !== game.id) : [...prev, game.id])}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all font-medium
                          ${selectedGames.includes(game.id) ? 'bg-accent/8 border-accent text-foreground' : 'bg-secondary border-border text-muted-foreground hover:bg-white hover:border-accent/30'}`}>
                        <span className="font-semibold">{game.name}</span>
                        {selectedGames.includes(game.id)
                          ? <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center"><Check className="w-4 h-4 text-accent-foreground" /></div>
                          : <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30" />}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-3 uppercase tracking-wider font-bold">
                    {selectedGames.length === 0 ? 'Select at least one game' : `${selectedGames.length} Game${selectedGames.length > 1 ? 's' : ''} Selected`}
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1 rounded-xl border-border" onClick={() => { setShowCreatePinDialog(false); setSelectedGames(['bubble']); }}>Cancel</Button>
                  <Button className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl shadow-md shadow-accent/20" onClick={handleCreatePin} disabled={selectedGames.length === 0 || isCreatingPin}>
                    {isCreatingPin ? 'Creating...' : 'Create PIN'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AshuDashboard;
