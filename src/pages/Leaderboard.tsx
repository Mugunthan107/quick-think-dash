import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Trophy, Medal, Clock, ChevronLeft, Download, X, FileText, FileSpreadsheet, Crown, User } from 'lucide-react';
import DecorativeCurve from '@/components/DecorativeCurve';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const GAME_LABELS: Record<string, string> = {
  bubble: 'Bubble',
  crossmath: 'Cross Math',
  numlink: 'NumLink',
  aptirush: 'AptiRush',
  motion: 'Motion',
};

const formatTime = (s: number) => {
  if (!s || s <= 0) return '—';
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
};

// ─── Medal colors (Shared with Dashboard) ────────────────
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
const PodiumCard = ({ rank, name, score, correctAnswers, totalQuestions, timeTaken, large }: any) => {
  const m = MEDAL[rank as 1 | 2 | 3];
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

      {/* Circular Avatar */}
      <div
        className={`relative flex items-center justify-center rounded-full border-[3px] sm:border-[4px] p-1.5 transition-all duration-300 hover:scale-[1.05] cursor-default
          bg-white/60 backdrop-blur-xl ${m.border} ${m.shadow} ${m.glow}
          ${large ? 'w-24 h-24 sm:w-32 sm:h-32 z-20' : 'w-18 h-18 sm:w-24 sm:h-24 z-10'}`}
      >
        <div className={`w-full h-full rounded-full flex items-center justify-center ${m.bg} shadow-inner`}>
          <User className={`w-1/2 h-1/2 ${m.text}`} strokeWidth={2.5} />
        </div>
      </div>

      {/* Details underneath */}
      <div className="mt-3 sm:mt-4 text-center flex flex-col items-center bg-white/40 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-black/[0.03]">
        <span className={`font-bold text-foreground truncate w-20 sm:w-24 ${large ? 'text-[15px] sm:text-[16px]' : 'text-xs sm:text-sm'}`}>{name}</span>
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

const Leaderboard = () => {
  const { getLeaderboard, currentStudent, adminLoggedIn, currentTest } = useGame();
  const navigate = useNavigate();
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => { if (!adminLoggedIn) navigate('/'); }, [adminLoggedIn, navigate]);

  const leaderboard = getLeaderboard();
  const selectedGames: string[] = currentTest?.selectedGames || [];

  const rankStyle = (i: number) => {
    if (i === 0) return { bg: 'bg-[#FBBF24]', text: 'text-white', shadow: 'shadow-amber-500/30' };
    if (i === 1) return { bg: 'bg-slate-300', text: 'text-[#475569]', shadow: 'shadow-slate-500/10' };
    if (i === 2) return { bg: 'bg-[#B45309]/20', text: 'text-[#B45309]', shadow: 'shadow-orange-900/5' };
    return { bg: 'bg-white', text: 'text-[#64748B]', shadow: '' };
  };

  // ─── PDF Export ──────────────────────────────────────────────────────────────
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 12;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Leaderboard', margin, 18);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Test PIN: ${currentTest?.pin || '—'}   |   Candidates: ${leaderboard.length}   |   Generated: ${new Date().toLocaleString()}`, margin, 25);

    const colHeaders = ['#', 'Name', ...selectedGames.map(g => GAME_LABELS[g] || g), 'Total Score', 'Total Time'];
    const colWidths: number[] = [10, 50, ...selectedGames.map(() => 28), 28, 28];

    const tableTop = 32;
    const rowH = 10;
    doc.setFillColor(240, 247, 255);
    doc.rect(margin, tableTop - 6, pageW - 2 * margin, rowH, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    let x = margin;
    colHeaders.forEach((h, ci) => {
      doc.text(h, x + 2, tableTop);
      x += colWidths[ci];
    });

    doc.setFont('helvetica', 'normal');
    leaderboard.forEach((s, i) => {
      const y = tableTop + (i + 1) * rowH;
      if (i % 2 === 0) {
        doc.setFillColor(249, 252, 255);
        doc.rect(margin, y - 6, pageW - 2 * margin, rowH, 'F');
      }
      const totalTime = s.gameHistory?.reduce((acc, g) => acc + (g.timeTaken || 0), 0) || 0;
      const getGame = (id: string) => s.gameHistory?.find(h => h.gameId === id);
      let cx = margin;
      const cells = [
        String(i + 1),
        s.username,
        ...selectedGames.map(gId => {
          const g = getGame(gId);
          return g ? String(g.score) : '—';
        }),
        String(s.score),
        formatTime(totalTime),
      ];
      cells.forEach((cell, ci) => {
        doc.setFont('helvetica', ci === 1 ? 'bold' : 'normal');
        doc.text(String(cell), cx + 2, y);
        cx += colWidths[ci];
      });
    });
    doc.save(`leaderboard-${currentTest?.pin || 'export'}.pdf`);
    setShowExportModal(false);
  };

  // ─── Excel Export ─────────────────────────────────────────────────────────────
  const exportExcel = () => {
    const headers = ['Rank', 'Name', ...selectedGames.map(g => `${GAME_LABELS[g] || g} Score`), 'Total Score', 'Total Time (s)'];
    const rows = leaderboard.map((s, i) => {
      const totalTime = s.gameHistory?.reduce((acc, g) => acc + (g.timeTaken || 0), 0) || 0;
      const getGame = (id: string) => s.gameHistory?.find(h => h.gameId === id);
      return [
        i + 1,
        s.username,
        ...selectedGames.map(gId => getGame(gId)?.score ?? 0),
        s.score,
        Math.round(totalTime),
      ];
    });
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = [{ wch: 6 }, { wch: 24 }, ...selectedGames.map(() => ({ wch: 16 })), { wch: 14 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leaderboard');
    XLSX.writeFile(wb, `leaderboard-${currentTest?.pin || 'export'}.xlsx`);
    setShowExportModal(false);
  };

  return (
    <div className="flex flex-col flex-1 w-full bg-[#F0F7FF] font-sans selection:bg-sky-100 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#E0F2FE_0%,_#F0F9FF_40%,_#FFFFFF_100%)]" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#38BDF8] opacity-[0.04] blur-[120px] rounded-full" />
      </div>

      <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]"
        className="absolute -top-[100px] sm:-top-[150px] -left-[10%] w-[120%] z-0 rotate-180 pointer-events-none mix-blend-multiply" animate={true} />

      <div className="max-w-full mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 relative z-10 animate-fade-in">
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4 flex-wrap">
          <button onClick={() => navigate('/')}
            className="group flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-all font-bold text-[13px] sm:text-[14px] px-3 sm:px-4 py-2 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-xl border border-white/80 shadow-sm">
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back
          </button>
          <div className="relative">
            <button onClick={() => setShowExportModal(!showExportModal)}
              className="flex items-center gap-2 text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition-all font-bold text-[13px] sm:text-[14px] px-4 py-2 rounded-xl shadow-lg shadow-sky-500/20">
              <Download className="w-4 h-4" />
              Download
            </button>

            {showExportModal && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowExportModal(false)} />
                <div className="absolute top-full right-0 mt-2 z-50 w-[240px] bg-white rounded-2xl shadow-2xl border border-sky-100 p-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-2 mb-1">
                    <h3 className="text-[11px] font-black text-sky-400 uppercase tracking-widest px-2">Choose Format</h3>
                  </div>
                  <button
                    onClick={exportPDF}
                    className="flex items-center gap-3 w-full p-3 hover:bg-red-50 rounded-xl transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                      <FileText className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="text-left font-black text-[#0F172A] text-xs">PDF Document</div>
                  </button>
                  <button
                    onClick={exportExcel}
                    className="flex items-center gap-3 w-full p-3 hover:bg-emerald-50 rounded-xl transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-left font-black text-[#0F172A] text-xs">Excel Sheet</div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[1.5rem] sm:rounded-[2rem] bg-sky-500/10 flex items-center justify-center shadow-lg shadow-sky-500/5 rotate-3">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-sky-500" />
            </div>
            <div>
              <h1 className="text-[24px] sm:text-[42px] font-black text-[#0F172A] tracking-tight leading-none mb-1 sm:mb-2">Leaderboard</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[12px] sm:text-[14px] text-[#64748B] font-bold uppercase tracking-widest">{leaderboard.length} Candidates</p>
              </div>
            </div>
          </div>
          {currentTest?.pin && (
            <div className="text-right">
              <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1">Test PIN</span>
              <span className="font-mono font-black text-2xl text-sky-500">{currentTest.pin}</span>
            </div>
          )}
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-16 sm:py-24 bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)]">
            <Medal className="w-12 h-12 sm:w-16 sm:h-16 text-[#CBD5E1] mx-auto mb-4 sm:mb-6 opacity-40" />
            <h3 className="text-lg sm:text-xl font-black text-[#0F172A] mb-2">No results yet</h3>
            <p className="text-[#64748B] font-medium text-sm sm:text-base">Results will appear here as candidates complete their tests.</p>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-12">
            {/* Podium for Top 3 */}
            <div className="flex items-end justify-center gap-2 sm:gap-6 pt-8 pb-4">
              {(() => {
                const top3 = leaderboard.slice(0, 3);
                const [first, second, third] = top3;

                const getStudentData = (s: any) => {
                  if (!s) return null;
                  const totalTime = s.gameHistory?.reduce((acc: number, g: any) => acc + (g.timeTaken || 0), 0) || 0;
                  return {
                    name: s.username,
                    score: s.score,
                    correctAnswers: s.correctAnswers || 0,
                    totalQuestions: s.totalQuestions || 0,
                    timeTaken: totalTime
                  };
                };

                const f = getStudentData(first);
                const s = getStudentData(second);
                const t = getStudentData(third);

                return (
                  <>
                    {/* 2nd place */}
                    {s ? <PodiumCard rank={2} {...s} /> : <div className="w-18 sm:w-24 px-4" />}

                    {/* 1st place */}
                    {f ? <PodiumCard rank={1} {...f} large /> : null}

                    {/* 3rd place */}
                    {t ? <PodiumCard rank={3} {...t} /> : <div className="w-18 sm:w-24 px-4" />}
                  </>
                );
              })()}
            </div>

            <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ minWidth: `${400 + selectedGames.length * 120}px` }}>
                  <thead>
                    <tr className="bg-sky-50/60 border-b border-sky-100">
                      <th className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest px-3 py-4 text-center w-14 sticky left-0 bg-sky-50/60 z-10">#</th>
                      <th className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest px-3 py-4 text-left min-w-[140px] sticky left-14 bg-sky-50/60 z-10">Name</th>
                      {selectedGames.map(gId => (
                        <th key={gId} className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest px-3 py-4 text-center min-w-[120px]">{GAME_LABELS[gId] || gId}</th>
                      ))}
                      <th className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest px-3 py-4 text-right min-w-[110px]">Total Score</th>
                      <th className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest px-3 py-4 text-right min-w-[100px]">Total Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-50">
                    {leaderboard.map((s, idx) => {
                      const isMe = currentStudent?.username === s.username;
                      const totalTime = s.gameHistory?.reduce((acc, g) => acc + (g.timeTaken || 0), 0) || 0;
                      const getGame = (id: string) => s.gameHistory?.find(h => h.gameId === id);
                      const rs = rankStyle(idx);
                      return (
                        <tr key={s.username} className={`transition-all duration-300 hover:bg-sky-50/40 ${isMe ? 'bg-sky-50/30' : idx % 2 === 0 ? 'bg-white' : 'bg-sky-50/10'}`}>
                          <td className="text-center px-3 py-4 sticky left-0 z-10" style={{ background: 'inherit' }}>
                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-lg mx-auto ${rs.bg} ${rs.text} ${rs.shadow} ${idx > 2 ? 'border border-[#E2E8F0]' : ''}`}>{idx + 1}</span>
                          </td>
                          <td className="px-3 py-4 sticky left-14 z-10" style={{ background: 'inherit' }}>
                            <span className="font-black text-[#0F172A] text-[14px] block whitespace-nowrap">{s.username}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              {isMe && <span className="text-[10px] bg-sky-500 text-white px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">You</span>}
                              <span className="text-[11px] text-[#94A3B8] font-bold">{s.gamesPlayed || 0} Games</span>
                            </div>
                          </td>
                          {selectedGames.map(gId => {
                            const gd = getGame(gId);
                            return (
                              <td key={gId} className="text-center px-3 py-4">
                                {gd ? (
                                  <div className="flex flex-col items-center gap-0.5">
                                    <span className="font-mono font-black text-[14px] text-[#0F172A]">{gd.score}</span>
                                    <span className="text-[10px] text-sky-400 font-bold flex items-center gap-0.5">
                                      <Clock className="w-2.5 h-2.5" />{formatTime(gd.timeTaken)}
                                    </span>
                                  </div>
                                ) : <span className="text-[#CBD5E1] text-[13px] font-black">—</span>}
                              </td>
                            );
                          })}
                          <td className="text-right px-3 sm:px-4 py-4">
                            <span className="font-mono font-black text-[18px] sm:text-[20px] text-sky-500 tabular-nums" style={{ textShadow: '0 0 20px rgba(56,189,248,0.1)' }}>{s.score}</span>
                          </td>
                          <td className="text-right px-3 sm:px-4 py-4">
                            <div className="flex items-center gap-1.5 justify-end">
                              <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                              <span className="font-mono text-[13px] sm:text-[14px] font-black text-[#0F172A]">{formatTime(totalTime)}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>


      <DecorativeCurve opacity={0.04} height="h-[400px] sm:h-[550px]" className="absolute -bottom-[100px] -left-[10%] w-[120%] z-0 pointer-events-none" animate={true} />
    </div>
  );
};

export default Leaderboard;