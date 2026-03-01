import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Download, Trash2, LogOut, Plus, Users, Activity, Play, Search, X, Bell, Check, RefreshCw, Clock, Square } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from 'react';
import CountdownOverlay from '@/components/CountdownOverlay';

import AshuLogin from './AshuLogin';

// ─── Medal colors ────────────────────────────────────────
const MEDAL = {
  1: {
    bg: 'bg-amber-50',
    border: 'border-amber-300/60',
    shadow: 'shadow-[0_0_20px_hsl(45_90%_65%/0.25)]',
    iconBg: 'bg-amber-400',
    text: 'text-amber-600',
    label: '🥇',
    glow: 'hover:shadow-[0_0_28px_hsl(45_90%_65%/0.4)]',
  },
  2: {
    bg: 'bg-slate-50',
    border: 'border-slate-300/60',
    shadow: 'shadow-[0_0_14px_hsl(220_15%_70%/0.25)]',
    iconBg: 'bg-slate-400',
    text: 'text-slate-500',
    label: '🥈',
    glow: 'hover:shadow-[0_0_20px_hsl(220_15%_60%/0.35)]',
  },
  3: {
    bg: 'bg-orange-50',
    border: 'border-orange-300/50',
    shadow: 'shadow-[0_0_12px_hsl(25_80%_65%/0.2)]',
    iconBg: 'bg-orange-400',
    text: 'text-orange-500',
    label: '🥉',
    glow: 'hover:shadow-[0_0_18px_hsl(25_80%_65%/0.3)]',
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
    <div
      className={`flex flex-col items-center rounded-2xl border p-4 sm:p-5 transition-all duration-200 hover:scale-[1.03] cursor-default
        ${m.bg} ${m.border} ${m.shadow} ${m.glow}
        ${large ? 'w-36 sm:w-44' : 'w-28 sm:w-36'}`}
    >
      <span className={`text-3xl sm:text-4xl mb-2 ${large ? 'text-4xl sm:text-5xl' : ''}`}>{m.label}</span>
      <span className={`font-bold text-foreground text-center text-sm leading-tight truncate w-full text-center mb-1 ${large ? 'text-base' : 'text-sm'}`}>{name}</span>
      <span className={`font-mono font-bold ${m.text} ${large ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} mt-1`}>{score}</span>
      <span className="text-[10px] text-muted-foreground font-medium mt-0.5">{correctAnswers}/{totalQuestions} correct</span>
      <span className="text-[10px] text-muted-foreground font-medium">{timeTaken.toFixed(1)}s</span>
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
    <div className="flex items-end justify-center gap-3 sm:gap-4 py-4">
      {/* 2nd place — left, shorter */}
      {second ? (
        <div className="flex flex-col items-center gap-1">
          <PodiumCard
            rank={2}
            name={second.username}
            score={second.score}
            correctAnswers={second.correctAnswers}
            totalQuestions={second.totalQuestions}
            timeTaken={second.timeTaken}
          />
          <div className="w-full h-8 bg-slate-200/70 rounded-b-lg" />
        </div>
      ) : <div className="w-28 sm:w-36" />}

      {/* 1st place — center, tallest */}
      {first ? (
        <div className="flex flex-col items-center gap-1 -mb-0">
          <PodiumCard
            rank={1}
            name={first.username}
            score={first.score}
            correctAnswers={first.correctAnswers}
            totalQuestions={first.totalQuestions}
            timeTaken={first.timeTaken}
            large
          />
          <div className="w-full h-14 bg-amber-200/60 rounded-b-lg" />
        </div>
      ) : null}

      {/* 3rd place — right, shortest */}
      {third ? (
        <div className="flex flex-col items-center gap-1">
          <PodiumCard
            rank={3}
            name={third.username}
            score={third.score}
            correctAnswers={third.correctAnswers}
            totalQuestions={third.totalQuestions}
            timeTaken={third.timeTaken}
          />
          <div className="w-full h-5 bg-orange-200/50 rounded-b-lg" />
        </div>
      ) : <div className="w-28 sm:w-36" />}
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
  } = useGame();
  const navigate = useNavigate();

  const [showCountdown, setShowCountdown] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [leaderboardTab, setLeaderboardTab] = useState<'overall' | 'bubble' | 'crossmath' | 'numlink'>('overall');
  const [showCreatePinDialog, setShowCreatePinDialog] = useState(false);
  const [selectedGames, setSelectedGames] = useState<string[]>(['bubble']);
  const [isCreatingPin, setIsCreatingPin] = useState(false);

  const availableGamesList = [
    { id: 'bubble', name: 'Bubble' },
    { id: 'crossmath', name: 'Cross Math' },
    { id: 'numlink', name: 'NumLink' },
  ];

  useEffect(() => {
    if (pendingStudents.length > 0) {
      toast.info(`${pendingStudents.length} new join request(s)`, {
        action: { label: 'View', onClick: () => setShowRequestsModal(true) }
      });
    }
  }, [pendingStudents.length]);

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

  const handleDownload = () => {
    const leaderboard = getLeaderboard();
    if (leaderboard.length === 0) { toast.error('No completed results to download'); return; }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 20, 120);
    doc.text(`Bubble Results — PIN: ${currentTest?.pin}`, 14, 22);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 120);
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}   |   Total Students: ${students.length}`, 14, 30);

    const tableColumn = ["#", "Name", "Bubble", "CrossMath", "NumLink", "Total", "Time (s)"];

    const tableRows = leaderboard.map((student, index) => {
      const totalTime = student.gameHistory?.reduce((acc, g) => acc + g.timeTaken, 0) || 0;
      const getGameCell = (gameId: string) => {
        const g = student.gameHistory?.find(h => h.gameId === gameId);
        if (!g) return '—';
        return `${g.correctAnswers}/${g.totalQuestions} (${g.score}pts)`;
      };
      return [
        index + 1,
        student.username,
        getGameCell('bubble'),
        getGameCell('crossmath'),
        getGameCell('numlink'),
        student.score,
        totalTime.toFixed(1),
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
        overflow: 'linebreak',
        lineColor: [220, 215, 240],
        lineWidth: 0.3,
        textColor: [30, 20, 60],
        font: 'helvetica',
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 45, halign: 'left' },
        2: { cellWidth: 28, halign: 'center' },
        3: { cellWidth: 28, halign: 'center' },
        4: { cellWidth: 28, halign: 'center' },
        5: { cellWidth: 20, halign: 'right', fontStyle: 'bold' },
        6: { cellWidth: 20, halign: 'right' },
      },
      headStyles: {
        fillColor: [120, 60, 220],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center',
      },
      alternateRowStyles: { fillColor: [248, 246, 255] },
      rowPageBreak: 'avoid',
    });

    doc.save(`bubble-results-${currentTest?.pin}.pdf`);
    toast.success('Results downloaded as PDF');
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
      return { username: s.username, score: s.score, correctAnswers: s.correctAnswers || 0, totalQuestions: s.totalQuestions || 30, timeTaken: totalTime };
    }
    const h = s.gameHistory?.find((g: any) => g.gameId === leaderboardTab);
    return { username: s.username, score: h?.score || 0, correctAnswers: h?.correctAnswers || 0, totalQuestions: h?.totalQuestions || 30, timeTaken: h?.timeTaken || 0 };
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 relative z-10">
      {showCountdown && <CountdownOverlay onComplete={() => setShowCountdown(false)} />}
      <div className="max-w-2xl mx-auto animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-10">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">Manage tests and monitor progress</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost" size="icon"
                onClick={() => setShowRequestsModal(true)}
                className={`rounded-full hover:bg-secondary relative ${pendingStudents.length > 0 ? 'text-accent' : 'text-muted-foreground'}`}
              >
                <Bell className="w-5 h-5" />
                {pendingStudents.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {pendingStudents.length}
                  </span>
                )}
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { adminLogout(); navigate('/'); }} className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Test PIN Section */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border border-border shadow-[0_4px_16px_hsl(260_40%_90%/0.5)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">Test Session</h2>
            {sessions.length > 0 ? (
              <Select value={currentTest?.pin} onValueChange={(value) => {
                const selected = sessions.find(s => s.pin === value);
                if (selected) { setCurrentStudent(null); switchSession(selected); }
              }}>
                <SelectTrigger className="w-[140px] sm:w-[180px] h-8 text-xs">
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

          {currentTest ? (
            <div className="space-y-4 sm:space-y-5">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* PIN Display */}
                <div className="bg-accent/5 rounded-xl px-4 sm:px-6 py-4 flex-1 min-w-0 border border-accent/15 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Activity className="w-24 h-24 text-accent" />
                  </div>
                  <span className="text-[10px] text-accent font-bold block mb-2 uppercase tracking-wider">Session Active</span>
                  <div className="font-mono text-3xl sm:text-5xl font-bold text-accent tracking-[0.1em] mb-2">{currentTest.pin}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Created: {new Date(currentTest.createdAt).toLocaleTimeString()}</span>
                    <span>•</span>
                    <span>{students.length} Joined</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-2 shrink-0">
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handleCopyPin} className="border-border h-12 w-12 rounded-xl"><Copy className="w-5 h-5" /></Button>
                    <Button variant="outline" size="icon" onClick={() => deleteSession(currentTest.pin)} className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground h-12 w-12 rounded-xl"><Trash2 className="w-5 h-5" /></Button>
                  </div>
                  {currentTest.status === 'WAITING' ? (
                    <Button onClick={() => { startTest(); setShowCountdown(true); }} className="h-16 w-full sm:w-48 text-xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 animate-pulse">
                      <Play className="w-6 h-6 mr-2 fill-current" />START TEST
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="h-16 w-full sm:w-48 flex items-center justify-center bg-green-50 border border-green-200 rounded-xl">
                        <span className="text-green-600 font-bold flex items-center gap-2"><Activity className="w-4 h-4 animate-pulse" />RUNNING</span>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Stop the test? All students still playing will be marked as finished.')) {
                            stopTest();
                          }
                        }}
                        className="h-10 w-full sm:w-48 flex items-center justify-center gap-2 rounded-xl bg-destructive/10 hover:bg-destructive hover:text-white text-destructive border border-destructive/30 font-bold text-sm transition-all duration-200"
                      >
                        <Square className="w-4 h-4 fill-current" />Stop Test
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { icon: <Users className="w-3.5 h-3.5 text-muted-foreground" />, value: students.length, label: 'Joined' },
                  { icon: <Activity className="w-3.5 h-3.5 text-accent" />, value: active.length, label: 'Active' },
                  { icon: <span className="text-xs text-success">✓</span>, value: finished.length, label: 'Done' },
                ].map(({ icon, value, label }) => (
                  <div key={label} className="bg-secondary rounded-xl p-2.5 sm:p-3 text-center border border-border">
                    <div className="flex justify-center mb-1">{icon}</div>
                    <span className="font-mono font-bold text-base sm:text-lg text-foreground block">{value}</span>
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium">{label}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={() => setShowCreatePinDialog(true)} variant="outline" size="sm" className="flex-1 border-border rounded-lg text-xs sm:text-sm">
                  <Plus className="w-3.5 h-3.5 mr-1" />New Session
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm mb-4 font-medium">No active session selected</p>
              <Button onClick={() => setShowCreatePinDialog(true)} className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl h-12 px-6 shadow-md shadow-accent/20">
                <Plus className="w-4 h-4 mr-2" />Create Test PIN
              </Button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap">
          <Button onClick={handleDownload} className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl h-10 sm:h-11 text-xs sm:text-sm flex-1 sm:flex-none shadow-sm shadow-accent/20">
            <Download className="w-3.5 h-3.5 mr-1" />Download PDF
          </Button>
          <Button onClick={handleDelete} variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-xl h-10 sm:h-11 text-xs sm:text-sm flex-1 sm:flex-none">
            <Trash2 className="w-3.5 h-3.5 mr-1" />Delete All
          </Button>
        </div>

        {/* ── Embedded Podium Leaderboard ───────────────── */}
        {finished.length > 0 && (() => {
          const lb = getLeaderboard();
          const top3 = lb.slice(0, 3).map(s => ({
            username: s.username,
            score: s.score,
            correctAnswers: s.correctAnswers || 0,
            totalQuestions: s.totalQuestions || 30,
            timeTaken: s.gameHistory?.reduce((a: number, g: any) => a + g.timeTaken, 0) || 0,
          }));
          const rest = lb.slice(3);

          return (
            <div className="bg-white rounded-2xl border border-border shadow-[0_4px_16px_hsl(260_40%_90%/0.5)] overflow-hidden">
              {/* Section Header */}
              <div className="px-4 sm:px-6 pt-5 pb-2">
                <h2 className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">🏆 Leaderboard</h2>
              </div>

              {/* Podium */}
              {top3.length > 0 && (
                <div className="px-4 sm:px-6 pb-2">
                  <PodiumRow top3={top3} />
                </div>
              )}

              {/* Remaining players table */}
              {rest.length > 0 && (
                <div className="border-t border-border">
                  {/* Table header */}
                  <div className="grid grid-cols-[2rem_1fr_4.5rem_4.5rem_4.5rem] gap-2 px-4 py-2 bg-secondary/60">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase text-center">#</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Name</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase text-right">Score</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase text-right">Correct</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase text-right">Time</span>
                  </div>
                  <div className="divide-y divide-border">
                    {rest.map((s, idx) => {
                      const totalTime = s.gameHistory?.reduce((a: number, g: any) => a + g.timeTaken, 0) || 0;
                      return (
                        <div key={s.username} className={`grid grid-cols-[2rem_1fr_4.5rem_4.5rem_4.5rem] gap-2 px-4 py-2.5 items-center ${idx % 2 === 0 ? 'bg-white' : 'bg-secondary/30'}`}>
                          <span className="w-7 h-7 bg-secondary rounded-lg flex items-center justify-center text-xs font-bold text-muted-foreground mx-auto">{idx + 4}</span>
                          <span className="font-semibold text-sm text-foreground truncate">{s.username}</span>
                          <span className="font-mono font-bold text-sm text-foreground text-right">{s.score}</span>
                          <span className="font-mono text-xs text-success font-semibold text-right">{s.correctAnswers}/{s.totalQuestions}</span>
                          <span className="font-mono text-xs text-muted-foreground text-right">{totalTime.toFixed(1)}s</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Leaderboard Modal ─────────────────────────── */}
        {showLeaderboardModal && (() => {
          const displayList = getDisplayLeaderboard();
          const top3 = displayList.slice(0, 3).map(buildPodiumEntry);
          const rest = displayList.slice(3);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                {/* Modal Header */}
                <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between shrink-0">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">🏆 Leaderboard</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowLeaderboardModal(false)} className="rounded-full hover:bg-secondary"><X className="w-5 h-5" /></Button>
                </div>

                {/* Tabs + Search */}
                <div className="p-4 border-b border-border bg-secondary/40 shrink-0 space-y-3">
                  <div className="flex gap-1 p-1 bg-white rounded-xl border border-border flex-wrap">
                    {(['overall', 'bubble', 'crossmath', 'numlink'] as const).map(tab => (
                      <button key={tab} onClick={() => setLeaderboardTab(tab)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs sm:text-sm font-semibold transition-all min-w-[60px]
                          ${leaderboardTab === tab ? 'bg-accent text-accent-foreground shadow-sm' : 'hover:bg-secondary text-muted-foreground'}`}>
                        {tab === 'overall' ? 'Overall' : tab === 'bubble' ? 'Bubble' : tab === 'crossmath' ? 'Cross Math' : 'NumLink'}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search student..." value={leaderboardSearch} onChange={e => setLeaderboardSearch(e.target.value)} className="pl-9 bg-white border-border" />
                  </div>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto flex-1">
                  {displayList.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground font-medium">No completed results yet.</div>
                  ) : (
                    <>
                      {/* Podium (only when no search filter active or top3 passes filter) */}
                      {top3.length > 0 && (
                        <div className="px-4 sm:px-6 py-4 border-b border-border bg-gradient-to-b from-secondary/30 to-transparent">
                          <PodiumRow top3={top3} />
                        </div>
                      )}

                      {/* Remaining rows */}
                      {rest.length > 0 && (
                        <div>
                          {/* Table Header */}
                          <div className="grid grid-cols-[2.5rem_1fr_5rem_5rem_5rem] gap-2 px-4 py-2.5 bg-secondary/50 border-b border-border sticky top-0">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">#</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Name</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Score</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Correct</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Time</span>
                          </div>

                          <div className="divide-y divide-border">
                            {rest.map((s, idx) => {
                              const entry = buildPodiumEntry(s);
                              const totalTime = leaderboardTab === 'overall'
                                ? (s.gameHistory?.reduce((a: number, g: any) => a + g.timeTaken, 0) || 0)
                                : entry.timeTaken;

                              return (
                                <div key={s.username} className={`grid grid-cols-[2.5rem_1fr_5rem_5rem_5rem] gap-2 px-4 py-3 items-center ${idx % 2 === 0 ? 'bg-white' : 'bg-secondary/20'}`}>
                                  <span className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center text-xs font-bold text-muted-foreground mx-auto">
                                    {idx + 4}
                                  </span>
                                  <span className="font-semibold text-sm text-foreground truncate">{s.username}</span>
                                  <span className="font-mono font-bold text-sm text-foreground text-right">{entry.score}</span>
                                  <span className="font-mono text-sm text-success font-semibold text-right">{entry.correctAnswers}/{entry.totalQuestions}</span>
                                  <span className="font-mono text-xs text-muted-foreground text-right flex items-center justify-end gap-1">
                                    <Clock className="w-3 h-3 opacity-40" />{totalTime.toFixed(1)}s
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Join Requests Modal */}
        {showRequestsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-border flex flex-col animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2 text-foreground"><Bell className="w-5 h-5 text-accent" />Join Requests</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowRequestsModal(false)} className="rounded-full hover:bg-secondary"><X className="w-5 h-5" /></Button>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {pendingStudents.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground font-medium">No pending requests.</div>
                ) : (
                  <div className="space-y-3">
                    {pendingStudents.map(student => (
                      <div key={student.username} className="flex items-center justify-between p-3 bg-secondary rounded-xl border border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center">
                            <Users className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <span className="font-semibold text-foreground">{student.username}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10 rounded-full w-8 h-8" onClick={() => rejectStudent(student.username)}><X className="w-5 h-5" /></Button>
                          <Button size="icon" className="bg-green-600 hover:bg-green-700 text-white rounded-full w-8 h-8" onClick={() => approveStudent(student.username)}><Check className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create PIN Dialog */}
        {showCreatePinDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-border animate-in zoom-in-95 duration-200 p-6">
              <h2 className="text-lg font-bold text-foreground mb-1">Create New Session</h2>
              <p className="text-sm text-muted-foreground mb-6 font-medium">Select which games students will play.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-3 block font-semibold">Select Games</label>
                  <div className="space-y-2">
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
