import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Copy, Download, Trash2, LogOut, Plus, Users, Activity } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminDashboard = () => {
  const { adminLoggedIn, currentTest, students, createTestPin, deleteAllUsers, getLeaderboard, adminLogout } = useGame();
  const navigate = useNavigate();

  if (!adminLoggedIn) {
    navigate('/admin-login');
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

    // Title
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage tests and monitor progress</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { adminLogout(); navigate('/'); }}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Test PIN Section */}
        <div className="bg-card rounded-2xl p-6 mb-6 border border-border">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Test Session</h2>
          {currentTest ? (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="bg-secondary rounded-xl px-6 py-4 flex-1">
                  <span className="text-[10px] text-muted-foreground block mb-1 uppercase tracking-wider">Test PIN</span>
                  <span className="text-4xl font-mono font-bold text-accent tracking-[0.3em]">{currentTest.pin}</span>
                </div>
                <Button variant="outline" size="icon" onClick={handleCopyPin} className="border-border text-foreground hover:bg-secondary h-12 w-12 rounded-xl">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <Users className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <span className="font-mono font-bold text-lg text-foreground block">{students.length}</span>
                  <span className="text-[10px] text-muted-foreground">Joined</span>
                </div>
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <Activity className="w-4 h-4 text-accent mx-auto mb-1" />
                  <span className="font-mono font-bold text-lg text-foreground block">{active.length}</span>
                  <span className="text-[10px] text-muted-foreground">Active</span>
                </div>
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <span className="text-sm">✓</span>
                  <span className="font-mono font-bold text-lg text-foreground block">{finished.length}</span>
                  <span className="text-[10px] text-muted-foreground">Done</span>
                </div>
              </div>

              <Button onClick={handleCreatePin} variant="outline" size="sm" className="border-border text-foreground hover:bg-secondary rounded-lg">
                <Plus className="w-4 h-4 mr-2" />
                New PIN
              </Button>
            </div>
          ) : (
            <Button onClick={handleCreatePin} className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl h-12 px-6">
              <Plus className="w-4 h-4 mr-2" />
              Create Test PIN
            </Button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <Button onClick={handleDownload} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11">
            <Download className="w-4 h-4 mr-2" />
            Download Results
          </Button>
          <Button onClick={handleDelete} variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-xl h-11">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete All Users
          </Button>
        </div>

        {/* Leaderboard */}
        {finished.length > 0 && (
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Leaderboard</h2>
            <div className="space-y-2">
              {getLeaderboard().map((s, i) => {
                const timeTaken = s.completedAt ? ((s.completedAt - s.startedAt) / 1000).toFixed(1) : '-';
                return (
                  <div
                    key={s.username}
                    className={`flex items-center justify-between p-3.5 rounded-xl transition-all ${i === 0 ? 'bg-accent/10 border border-accent/20' : 'bg-secondary'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                        {i + 1}
                      </span>
                      <span className="font-medium text-foreground">{s.username}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Lvl {s.level}</span>
                      <span className="font-mono font-bold text-foreground">{s.score}</span>
                      <span className="text-muted-foreground w-14 text-right">{timeTaken}s</span>
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
