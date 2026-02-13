import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Copy, Download, Trash2, LogOut, Plus, Users, Activity } from 'lucide-react';
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
import { useEffect } from 'react';

const AdminDashboard = () => {
  const {
    adminLoggedIn,
    currentTest,
    students,
    sessions,
    createTestPin,
    deleteAllUsers,
    deleteSession,
    getLeaderboard,
    adminLogout,
    switchSession,
    setCurrentStudent
  } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminLoggedIn) {
      navigate('/admin-login');
    }
  }, [adminLoggedIn, navigate]);

  if (!adminLoggedIn) {
    return null;
  }

  const handleCreatePin = async () => {
    try {
      const pin = await createTestPin();
      toast.success(`Test PIN created: ${pin}`);
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

    const tableColumn = ["Rank", "Student Name", "Score", "Level", "Time (seconds)"];
    const tableRows = leaderboard.map((student, index) => {
      const timeTaken = student.completedAt
        ? ((student.completedAt - student.startedAt) / 1000).toFixed(1)
        : 'N/A';

      return [
        index + 1,
        student.username,
        student.score,
        student.level,
        timeTaken
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
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-10">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage tests and monitor progress</p>
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
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="bg-secondary rounded-xl px-4 sm:px-6 py-3 sm:py-4 flex-1 min-w-0">
                  <span className="text-[10px] text-muted-foreground block mb-1 uppercase tracking-wider">Active Test PIN</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-2xl sm:text-4xl font-mono font-bold text-accent tracking-[0.2em] sm:tracking-[0.3em]">{currentTest.pin}</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground tabular-nums hidden sm:block">
                      {new Date(currentTest.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="icon" onClick={handleCopyPin} className="border-border text-foreground hover:bg-secondary h-10 w-10 sm:h-12 sm:w-12 rounded-xl shrink-0">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => deleteSession(currentTest.pin)}
                  className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground h-10 w-10 sm:h-12 sm:w-12 rounded-xl shrink-0"
                  title="Delete this session"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
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
                <Button onClick={handleCreatePin} variant="outline" size="sm" className="flex-1 border-border text-foreground hover:bg-secondary rounded-lg text-xs sm:text-sm">
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
              <Button onClick={handleCreatePin} className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl h-12 px-6">
                <Plus className="w-4 h-4 mr-2" />
                Create Test PIN
              </Button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Button onClick={handleDownload} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-10 sm:h-11 text-xs sm:text-sm flex-1 sm:flex-none">
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Download
          </Button>
          <Button onClick={handleDelete} variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-xl h-10 sm:h-11 text-xs sm:text-sm flex-1 sm:flex-none">
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Delete All
          </Button>
        </div>

        {/* Leaderboard */}
        {finished.length > 0 && (
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-border">
            <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 sm:mb-4">Leaderboard</h2>
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
                      <span className="font-mono font-bold text-foreground">{s.score}</span>
                      <span className="text-muted-foreground w-12 sm:w-14 text-right">{timeTaken}s</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
