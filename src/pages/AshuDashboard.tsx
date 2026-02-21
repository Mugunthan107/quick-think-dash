import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Download, Trash2, LogOut, Plus, Users, Activity, Play, Search, X, Bell, Check } from 'lucide-react';
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
    rejectStudent
  } = useGame();
  const navigate = useNavigate();

  // Remove redirect effect
  // useEffect(() => {
  //   if (!adminLoggedIn) {
  //     navigate('/admin-login');
  //   }
  // }, [adminLoggedIn, navigate]);

  const [showCountdown, setShowCountdown] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [showCreatePinDialog, setShowCreatePinDialog] = useState(false);
  const [numGames, setNumGames] = useState(1);

  // Notify on new pending students
  useEffect(() => {
    if (pendingStudents.length > 0) {
      toast.info(`${pendingStudents.length} new join request(s)`, {
        action: {
          label: 'View',
          onClick: () => setShowRequestsModal(true)
        }
      });
    }
  }, [pendingStudents.length]);

  if (!adminLoggedIn) {
    return <AshuLogin />;
  }

  const handleCreatePin = async () => {
    try {
      const pin = await createTestPin(numGames);
      toast.success(`Test PIN created: ${pin} (${numGames} game${numGames > 1 ? 's' : ''})`);
      setShowCreatePinDialog(false);
      setNumGames(1);
    } catch (e) {
      toast.error('Failed to create PIN');
    }
  };

  const handleCopyPin = () => {
    if (currentTest) {
      navigator.clipboard.writeText(currentTest.pin);
      toast.success('PIN copied to clipboard');
    }
  };

  const handleDownload = () => {
    const leaderboard = getLeaderboard();
    if (leaderboard.length === 0) {
      toast.error('No completed results to download');
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Test Results - PIN: ${currentTest?.pin}`, 14, 22);

    doc.setFontSize(11);
    doc.text(`Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 30);
    doc.text(`Total Students: ${students.length}`, 14, 36);

    const tableColumn = ["Rank", "Student Name", "Avg Score", "Games Played", "Total Time (s)", "Breakdown"];
    const tableRows = leaderboard.map((student, index) => {
      const totalTime = student.gameHistory?.reduce((acc, g) => acc + g.timeTaken, 0) || 0;
      const timeTaken = totalTime.toFixed(1);

      // Create breakdown string
      const breakdown = student.gameHistory?.map(g => {
        const gameName = g.gameId === 'bubble' ? 'Bubble' : g.gameId === 'crossmath' ? 'Cross' : g.gameId;
        return `${gameName}: ${g.correctAnswers}✓`;
      }).join(', ') || 'N/A';

      return [
        index + 1,
        student.username,
        student.score, // This is now average score
        student.gamesPlayed || 0,
        timeTaken,
        breakdown
      ];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save(`test-results-${currentTest?.pin}.pdf`);
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

  return (
    <div className="min-h-screen p-4 sm:p-6 relative z-10">
      {showCountdown && <CountdownOverlay onComplete={() => setShowCountdown(false)} />}
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-10">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage tests and monitor progress</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { adminLogout(); navigate('/'); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Test PIN Section */}
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Test Session</h2>
            {sessions.length > 0 && (
              <Select
                value={currentTest?.pin}
                onValueChange={(value) => {
                  const selected = sessions.find(s => s.pin === value);
                  if (selected) setCurrentStudent(null);
                }}
              >
                <SelectTrigger className="w-[140px] sm:w-[180px] h-8 text-xs">
                  <SelectValue placeholder="Select Session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.pin} value={session.pin}>
                      PIN: {session.pin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {currentTest ? (
            <div className="space-y-4 sm:space-y-5">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Active Session Info */}
                <div className="bg-secondary rounded-xl px-4 sm:px-6 py-4 flex-1 min-w-0 border border-border/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Activity className="w-24 h-24" />
                  </div>

                  <span className="text-[10px] text-muted-foreground block mb-2 uppercase tracking-wider font-bold">Session Active</span>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-3xl sm:text-5xl font-mono font-bold text-accent tracking-[0.1em]">{currentTest.pin}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Created: {new Date(currentTest.createdAt).toLocaleTimeString()}</span>
                    <span>•</span>
                    <span>{students.length} Students Joined</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-2 shrink-0 sm:w-auto w-full">
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handleCopyPin} className="border-border text-foreground hover:bg-secondary h-12 w-12 rounded-xl shrink-0">
                      <Copy className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteSession(currentTest.pin)}
                      className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground h-12 w-12 rounded-xl shrink-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>

                  {currentTest.status === 'WAITING' ? (
                    <Button
                      onClick={() => {
                        startTest();
                        setShowCountdown(true);
                      }}
                      className="h-16 w-full sm:w-48 text-xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20 hover:shadow-green-900/40 transition-all hover:scale-105 active:scale-95 animate-pulse"
                    >
                      <Play className="w-6 h-6 mr-2 fill-current" />
                      START TEST
                    </Button>
                  ) : (
                    <div className="h-16 w-full sm:w-48 flex items-center justify-center bg-green-500/10 border border-green-500/20 rounded-xl">
                      <span className="text-green-500 font-bold flex items-center gap-2">
                        <Activity className="w-4 h-4 animate-pulse" />
                        RUNNING
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="bg-secondary rounded-xl p-2.5 sm:p-3 text-center">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground mx-auto mb-1" />
                  <span className="font-mono font-bold text-base sm:text-lg text-foreground block">{students.length}</span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground">Joined</span>
                </div>
                <div className="bg-secondary rounded-xl p-2.5 sm:p-3 text-center">
                  <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent mx-auto mb-1" />
                  <span className="font-mono font-bold text-base sm:text-lg text-foreground block">{active.length}</span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground">Active</span>
                </div>
                <div className="bg-secondary rounded-xl p-2.5 sm:p-3 text-center">
                  <span className="text-xs sm:text-sm">✓</span>
                  <span className="font-mono font-bold text-base sm:text-lg text-foreground block">{finished.length}</span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground">Done</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={() => setShowCreatePinDialog(true)} variant="outline" size="sm" className="flex-1 border-border text-foreground hover:bg-secondary rounded-lg text-xs sm:text-sm">
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  New Session
                </Button>
                <Button onClick={handleDownload} variant="outline" size="sm" className="flex-1 border-border text-foreground hover:bg-secondary rounded-lg text-xs sm:text-sm">
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Results
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm mb-4">No active session selected</p>
              <Button onClick={() => setShowCreatePinDialog(true)} className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl h-12 px-6">
                <Plus className="w-4 h-4 mr-2" />
                Create Test PIN
              </Button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap">
          <Button onClick={handleDownload} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-10 sm:h-11 text-xs sm:text-sm flex-1 sm:flex-none">
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Download PDF
          </Button>
          <Button onClick={() => setShowLeaderboardModal(true)} variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl h-10 sm:h-11 text-xs sm:text-sm flex-1 sm:flex-none">
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            View Leaderboard
          </Button>
          <Button onClick={handleDelete} variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-xl h-10 sm:h-11 text-xs sm:text-sm flex-1 sm:flex-none">
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Delete All
          </Button>
        </div>

        {/* Leaderboard Modal */}
        {showLeaderboardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
              <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between shrink-0">
                <h2 className="text-lg sm:text-xl font-bold">Leaderboard</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowLeaderboardModal(false)} className="rounded-full hover:bg-secondary">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-4 border-b border-border bg-secondary/30 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search query..."
                    value={leaderboardSearch}
                    onChange={(e) => setLeaderboardSearch(e.target.value)}
                    className="pl-9 bg-background"
                  />
                </div>
              </div>

              <div className="overflow-y-auto p-4 flex-1">
                <div className="space-y-2">
                  {students
                    .filter(s => s.isFinished) // Only show finished students
                    .filter(s => s.username.toLowerCase().includes(leaderboardSearch.toLowerCase()))
                    .sort((a, b) => b.score - a.score) // Simple sort by score for preview
                    .map((s, i) => {
                      const timeTaken = s.completedAt ? ((s.completedAt - s.startedAt) / 1000).toFixed(1) : '-';
                      return (
                        <div
                          key={s.username}
                          className={`flex items-center justify-between p-3 rounded-xl border ${i === 0 ? 'bg-yellow-500/10 border-yellow-500/50' :
                            i === 1 ? 'bg-slate-400/10 border-slate-400/50' :
                              i === 2 ? 'bg-orange-600/10 border-orange-600/50' :
                                'bg-card border-border'
                            }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${i === 0 ? 'bg-yellow-500 text-white' :
                              i === 1 ? 'bg-slate-400 text-white' :
                                i === 2 ? 'bg-orange-600 text-white' :
                                  'bg-secondary text-muted-foreground'
                              }`}>
                              {i + 1}
                            </span>
                            <div className="min-w-0">
                              <span className="font-semibold block truncate">{s.username}</span>
                              <span className="text-xs text-muted-foreground">Level {s.level}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-mono font-bold text-lg">{s.score}</div>
                            <div className="text-xs text-success font-medium">{s.correctAnswers || 0} / 30</div>
                            <div className="text-xs text-muted-foreground">{timeTaken}s</div>
                          </div>
                        </div>
                      );
                    })}
                  {students.filter(s => s.isFinished).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No completed results yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Leaderboard (Embedded) */}
        {finished.length > 0 && (
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Finishers</h2>
              <Button variant="link" size="sm" onClick={() => setShowLeaderboardModal(true)} className="h-auto p-0 text-accent">View All</Button>
            </div>
            <div className="space-y-2">
              {getLeaderboard().map((s, i) => {
                const timeTaken = s.completedAt ? ((s.completedAt - s.startedAt) / 1000).toFixed(1) : '-';
                return (
                  <div
                    key={s.username}
                    className={`flex items-center justify-between p-2.5 sm:p-3.5 rounded-xl transition-all ${i === 0 ? 'bg-accent/10 border border-accent/20' : 'bg-secondary'
                      }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 ${i === 0 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                        {i + 1}
                      </span>
                      <span className="font-medium text-foreground text-sm truncate">{s.username}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm shrink-0">
                      <span className="text-muted-foreground hidden sm:inline">Lvl {s.level}</span>
                      <span className="text-success font-medium hidden sm:inline">{s.correctAnswers || 0} / 30</span>
                      <span className="font-mono font-bold text-foreground">{s.score}</span>
                      <span className="text-muted-foreground w-12 sm:w-14 text-right">{timeTaken}s</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Join Requests Modal */}
        {showRequestsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border flex flex-col animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-accent" />
                  Join Requests
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setShowRequestsModal(false)} className="rounded-full hover:bg-secondary">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {pendingStudents.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No pending requests.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingStudents.map(student => (
                      <div key={student.username} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                            <Users className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <span className="font-semibold">{student.username}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10 rounded-full w-8 h-8"
                            onClick={() => rejectStudent(student.username)}
                          >
                            <X className="w-5 h-5" />
                          </Button>
                          <Button
                            size="icon"
                            className="bg-green-600 hover:bg-green-700 text-white rounded-full w-8 h-8"
                            onClick={() => approveStudent(student.username)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border animate-in zoom-in-95 duration-200 p-6">
              <h2 className="text-lg font-bold text-foreground mb-1">Create New Session</h2>
              <p className="text-sm text-muted-foreground mb-6">How many games should students play?</p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Number of Games</label>
                  <div className="flex gap-2">
                    {[1, 2, 3].map(n => (
                      <button
                        key={n}
                        onClick={() => setNumGames(n)}
                        className={`flex-1 h-14 rounded-xl font-bold text-lg transition-all ${numGames === n
                            ? 'bg-accent text-accent-foreground scale-105 shadow-lg shadow-accent/20'
                            : 'bg-secondary text-foreground hover:bg-secondary/80'
                          }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {numGames === 1 ? 'Students pick one game' : `Students play ${numGames} games. Leaderboard averages results.`}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => { setShowCreatePinDialog(false); setNumGames(1); }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl"
                    onClick={handleCreatePin}
                  >
                    Create PIN
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
