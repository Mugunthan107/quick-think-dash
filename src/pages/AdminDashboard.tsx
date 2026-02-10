import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Copy, Download, Trash2, LogOut, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { adminLoggedIn, currentTest, students, createTestPin, deleteAllUsers, getLeaderboard, adminLogout } = useGame();
  const navigate = useNavigate();

  if (!adminLoggedIn) {
    navigate('/admin-login');
    return null;
  }

  const handleCreatePin = () => {
    const pin = createTestPin();
    toast.success(`Test PIN created: ${pin}`);
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
    const csv = [
      'Rank,Username,Score,Level,Time Taken (seconds)',
      ...leaderboard.map((s, i) => {
        const timeTaken = s.completedAt ? ((s.completedAt - s.startedAt) / 1000).toFixed(1) : 'N/A';
        return `${i + 1},${s.username},${s.score},${s.level},${timeTaken}`;
      }),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-results-${currentTest?.pin || 'unknown'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Results downloaded');
  };

  const handleDelete = () => {
    deleteAllUsers();
    toast.success('All student data deleted');
  };

  const finished = students.filter(s => s.isFinished);
  const active = students.filter(s => !s.isFinished);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
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
        <div className="bg-card rounded-lg p-6 mb-6 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Test Session</h2>
          {currentTest ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-secondary rounded-lg px-6 py-3">
                  <span className="text-xs text-muted-foreground block mb-1">TEST PIN</span>
                  <span className="text-3xl font-mono font-bold text-accent tracking-widest">{currentTest.pin}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleCopyPin} className="border-border text-foreground hover:bg-secondary">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{students.length} joined · {finished.length} completed · {active.length} active</span>
              </div>
              <Button onClick={handleCreatePin} variant="outline" size="sm" className="border-border text-foreground hover:bg-secondary">
                <Plus className="w-4 h-4 mr-2" />
                Create New PIN
              </Button>
            </div>
          ) : (
            <Button onClick={handleCreatePin} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Test PIN
            </Button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <Button onClick={handleDownload} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="w-4 h-4 mr-2" />
            Download Results
          </Button>
          <Button onClick={handleDelete} variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete All Users
          </Button>
        </div>

        {/* Live Leaderboard */}
        {finished.length > 0 && (
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Leaderboard</h2>
            <div className="space-y-2">
              {getLeaderboard().map((s, i) => {
                const timeTaken = s.completedAt ? ((s.completedAt - s.startedAt) / 1000).toFixed(1) : '-';
                return (
                  <div
                    key={s.username}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      i === 0 ? 'bg-accent/10 border border-accent/30' : 'bg-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        i === 0 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {i + 1}
                      </span>
                      <span className="font-medium text-foreground">{s.username}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Lvl {s.level}</span>
                      <span className="font-mono font-bold text-foreground">{s.score} pts</span>
                      <span className="text-muted-foreground">{timeTaken}s</span>
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
