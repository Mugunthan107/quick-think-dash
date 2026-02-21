import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import supabase from '../utils/supabase';
import { toast } from 'sonner';

export interface GameResult {
  gameId: string;
  score: number;
  timeTaken: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: number;
}

export interface Student {
  username: string;
  testPin: string;
  score: number;
  level: number;
  completedAt: number | null;
  startedAt: number;
  isFinished: boolean;
  correctAnswers: number;
  status: 'APPROVED' | 'PENDING';
  gameHistory: GameResult[];
  gamesPlayed: number;
}

export interface TestSession {
  pin: string;
  createdAt: number;
  isActive: boolean;
  status: 'WAITING' | 'STARTED' | 'FINISHED';
  numGames: number;
}

interface GameState {
  adminLoggedIn: boolean;
  currentTest: TestSession | null;
  students: Student[];
  currentStudent: Student | null;
  pendingStudents: Student[];
  sessions: TestSession[];
}

interface GameContextType extends GameState {
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  createTestPin: (numGames?: number) => Promise<string>;
  verifyTestPin: (pin: string) => Promise<boolean>;
  joinTest: (pin: string, username: string) => Promise<{ success: boolean; error?: string; pending?: boolean }>;
  startTest: () => Promise<void>;
  updateStudentScore: (username: string, score: number, level: number, correctAnswers: number) => Promise<void>;
  submitGameResult: (username: string, result: GameResult) => Promise<void>;
  finishTest: (username: string) => Promise<void>;
  getLeaderboard: () => Student[];
  deleteAllUsers: () => Promise<void>;
  deleteSession: (pin: string) => Promise<void>;
  setCurrentStudent: (s: Student | null) => void;
  fetchSessions: () => Promise<void>;
  switchSession: (s: TestSession | null) => void;
  approveStudent: (username: string) => Promise<void>;
  rejectStudent: (username: string) => Promise<void>;
}

const ADMIN_PASSWORD = 'admin123';

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [currentTest, setCurrentTest] = useState<TestSession | null>(null);
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [pendingStudents, setPendingStudents] = useState<Student[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  // Fetch all active sessions
  const fetchSessions = useCallback(async () => {
    const { data, error } = await supabase
      .from('test_sessions')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      return;
    }

    if (data) {
      const mappedSessions = data.map((row: any) => ({
        pin: row.pin,
        createdAt: new Date(row.created_at).getTime(),
        isActive: row.is_active,
        status: row.status || 'WAITING',
        numGames: row.num_games || 1,
      }));
      setSessions(mappedSessions);
      // Automatically select the most recent session if none selected
      if (!currentTest && mappedSessions.length > 0) {
        setCurrentTest(mappedSessions[0]);
      }
    }
  }, [currentTest]);

  // Fetch students for the current test periodically or on change
  const fetchStudents = useCallback(async (pin: string) => {
    const { data, error } = await supabase
      .from('exam_results')
      .select('*')
      .eq('test_pin', pin);

    if (error) {
      console.error('Error fetching students:', error);
      return;
    }

    if (data) {
      const mappedStudents: Student[] = data.map((row: any) => {
        const gameHistory = row.game_history || [];
        return {
          username: row.student_name,
          testPin: row.test_pin,
          score: row.score,
          level: row.level,
          completedAt: row.completed_at ? new Date(row.completed_at).getTime() : null,
          startedAt: new Date(row.started_at).getTime(),
          isFinished: !!row.completed_at,
          correctAnswers: row.correct_answers || 0,
          status: row.status || 'APPROVED',
          gameHistory: gameHistory,
          gamesPlayed: gameHistory.length,
        };
      });
      setStudents(mappedStudents.filter(s => s.status === 'APPROVED'));
      setPendingStudents(mappedStudents.filter(s => s.status === 'PENDING'));
    }
  }, []);

  // Poll for updates if there's an active test (for both admin and students)
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    const fetchTestStatus = async (pin: string) => {
      const { data, error } = await supabase
        .from('test_sessions')
        .select('*')
        .eq('pin', pin)
        .single();

      if (!error && data) {
        setCurrentTest(prev => {
          if (!prev) return null;
          // Only update if status/isActive changed to avoid unnecessary re-renders
          if (prev.status !== data.status || prev.isActive !== data.is_active || prev.numGames !== data.num_games) {
            return {
              ...prev,
              isActive: data.is_active,
              status: data.status || 'WAITING',
              numGames: data.num_games || 1,
            };
          }
          return prev;
        });
      }
    };

    if (currentTest) {
      fetchStudents(currentTest.pin); // Initial fetch
      fetchTestStatus(currentTest.pin);

      interval = setInterval(() => {
        fetchStudents(currentTest.pin);
        fetchTestStatus(currentTest.pin);
      }, 1000); // Poll every 1 second
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentTest?.pin, fetchStudents]);

  // Initial load for admin
  useEffect(() => {
    if (adminLoggedIn) {
      fetchSessions();
    }
  }, [adminLoggedIn, fetchSessions]);

  const adminLogin = useCallback((password: string) => {
    if (password === ADMIN_PASSWORD) {
      setAdminLoggedIn(true);
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => {
    setAdminLoggedIn(false);
    setCurrentTest(null);
    setStudents([]);
    setPendingStudents([]);
    setSessions([]);
  }, []);

  const createTestPin = useCallback(async (numGames: number = 1) => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    const { error } = await supabase
      .from('test_sessions')
      .insert([{ pin, is_active: true, status: 'WAITING', num_games: numGames }]);

    if (error) {
      console.error('Error creating test session:', error);
      toast.error('Failed to create test session: ' + error.message);
      throw error;
    }

    const newTest: TestSession = { pin, createdAt: Date.now(), isActive: true, status: 'WAITING', numGames };
    setCurrentTest(newTest);
    setStudents([]);
    setPendingStudents([]);
    await fetchSessions();
    return pin;
  }, [fetchSessions]);

  const startTest = useCallback(async () => {
    if (!currentTest) return;

    const { error } = await supabase
      .from('test_sessions')
      .update({ status: 'STARTED' })
      .eq('pin', currentTest.pin);

    if (error) {
      toast.error('Failed to start test');
      return;
    }

    setCurrentTest(prev => prev ? { ...prev, status: 'STARTED' } : null);
    toast.success('Test started!');
  }, [currentTest]);

  const verifyTestPin = useCallback(async (pin: string) => {
    const { data, error } = await supabase
      .from('test_sessions')
      .select('is_active')
      .eq('pin', pin)
      .single();

    if (error || !data || !data.is_active) {
      return false;
    }
    return true;
  }, []);

  const joinTest = useCallback(async (pin: string, username: string) => {
    const trimmed = username.trim();
    if (!trimmed) {
      return { success: false, error: 'Username is required' };
    }

    // Check if test exists
    const { data: testData, error: testError } = await supabase
      .from('test_sessions')
      .select('*')
      .eq('pin', pin)
      .single();

    if (testError || !testData) {
      return { success: false, error: 'Invalid test PIN' };
    }

    if (!testData.is_active) {
      return { success: false, error: 'Test is no longer active' };
    }

    // Check status
    const isLateJoin = testData.status === 'STARTED';
    const status = isLateJoin ? 'PENDING' : 'APPROVED';

    // Join the test
    const { error: joinError } = await supabase
      .from('exam_results')
      .insert([{
        test_pin: pin,
        student_name: trimmed,
        started_at: new Date().toISOString(),
        status: status,
        correct_answers: 0,
        game_history: [],
        score: 0
      }]);

    if (joinError) {
      if (joinError.code === '23505') { // Unique violation
        // Check if student exists to possibly resume
        const { data: existingStudent } = await supabase
          .from('exam_results')
          .select('*')
          .eq('test_pin', pin)
          .eq('student_name', trimmed)
          .single();

        if (existingStudent) {
          const student: Student = {
            username: trimmed,
            testPin: pin,
            score: existingStudent.score,
            level: existingStudent.level,
            completedAt: existingStudent.completed_at ? new Date(existingStudent.completed_at).getTime() : null,
            startedAt: new Date(existingStudent.started_at).getTime(),
            isFinished: !!existingStudent.completed_at,
            correctAnswers: existingStudent.correct_answers || 0,
            status: existingStudent.status || 'APPROVED',
            gameHistory: existingStudent.game_history || [],
            gamesPlayed: (existingStudent.game_history || []).length
          };
          setCurrentTest({ pin, createdAt: new Date(testData.created_at).getTime(), isActive: testData.is_active, status: testData.status || 'WAITING', numGames: testData.num_games || 1 });
          setCurrentStudent(student);
          return { success: true, pending: student.status === 'PENDING' };
        }
        return { success: false, error: 'Username already taken for this test' };
      }
      return { success: false, error: joinError.message };
    }

    const student: Student = {
      username: trimmed,
      testPin: pin,
      score: 0,
      level: 1,
      completedAt: null,
      startedAt: Date.now(),
      isFinished: false,
      correctAnswers: 0,
      status: status,
      gameHistory: [],
      gamesPlayed: 0
    };

    if (isLateJoin) {
      return { success: true, pending: true };
    }

    setCurrentTest({ pin, createdAt: new Date(testData.created_at).getTime(), isActive: testData.is_active, status: testData.status || 'WAITING', numGames: testData.num_games || 1 });
    setCurrentStudent(student);
    return { success: true };
  }, []);

  const approveStudent = useCallback(async (username: string) => {
    if (!currentTest) return;
    await supabase.from('exam_results').update({ status: 'APPROVED' }).eq('test_pin', currentTest.pin).eq('student_name', username);
    setPendingStudents(prev => prev.filter(s => s.username !== username));
    fetchStudents(currentTest.pin);
  }, [currentTest, fetchStudents]);

  const rejectStudent = useCallback(async (username: string) => {
    if (!currentTest) return;
    await supabase.from('exam_results').delete().eq('test_pin', currentTest.pin).eq('student_name', username);
    setPendingStudents(prev => prev.filter(s => s.username !== username));
    fetchStudents(currentTest.pin);
  }, [currentTest, fetchStudents]);

  // Deprecated/Legacy: keeping for backward compatibility but simpler apps should use submitGameResult
  const updateStudentScore = useCallback(async (username: string, score: number, level: number, correctAnswers: number) => {
    if (!currentStudent) return;
    setCurrentStudent(prev => prev ? { ...prev, score, level, correctAnswers } : null);
    await supabase
      .from('exam_results')
      .update({ score, level, correct_answers: correctAnswers })
      .eq('test_pin', currentStudent.testPin)
      .eq('student_name', username);
  }, [currentStudent]);

  const submitGameResult = useCallback(async (username: string, result: GameResult) => {
    if (!currentStudent) return;

    // Helper to calculate average score and total time
    const newHistory = [...(currentStudent.gameHistory || []), result];
    const totalScore = newHistory.reduce((acc, curr) => acc + curr.score, 0);
    const avgScore = Math.round(totalScore / newHistory.length);
    const totalCorrect = newHistory.reduce((acc, curr) => acc + curr.correctAnswers, 0);

    // Optimistic update
    setCurrentStudent(prev => prev ? {
      ...prev,
      score: avgScore,
      correctAnswers: totalCorrect,
      gameHistory: newHistory,
      gamesPlayed: newHistory.length
    } : null);

    // DB Update
    await supabase
      .from('exam_results')
      .update({
        score: avgScore,
        correct_answers: totalCorrect,
        game_history: newHistory
      })
      .eq('test_pin', currentStudent.testPin)
      .eq('student_name', username);

  }, [currentStudent]);

  const finishTest = useCallback(async (username: string) => {
    if (!currentStudent) return;

    const now = new Date();

    // Optimistic update
    setCurrentStudent(prev => prev ? { ...prev, isFinished: true, completedAt: now.getTime() } : null);

    await supabase
      .from('exam_results')
      .update({ completed_at: now.toISOString() })
      .eq('test_pin', currentStudent.testPin)
      .eq('student_name', username);
  }, [currentStudent]);

  const getLeaderboard = useCallback(() => {
    return [...students]
      .filter(s => s.isFinished)
      .sort((a, b) => {
        // Primary: Score (Descending - higher is better)
        if (b.score !== a.score) return b.score - a.score;

        // Secondary: Total Time (Ascending - lower is better)
        // Calculate total time from history
        const timeA = a.gameHistory?.reduce((acc, g) => acc + g.timeTaken, 0) || (a.completedAt! - a.startedAt) / 1000;
        const timeB = b.gameHistory?.reduce((acc, g) => acc + g.timeTaken, 0) || (b.completedAt! - b.startedAt) / 1000;

        return timeA - timeB;
      });
  }, [students]);

  const deleteAllUsers = useCallback(async () => {
    if (!currentTest) return;

    const { error } = await supabase
      .from('exam_results')
      .delete()
      .eq('test_pin', currentTest.pin);

    if (error) {
      toast.error('Failed to delete users');
      return;
    }

    setStudents([]);
    setPendingStudents([]);
  }, [currentTest]);

  const deleteSession = useCallback(async (pin: string) => {
    const { error } = await supabase
      .from('test_sessions')
      .delete()
      .eq('pin', pin);

    if (error) {
      toast.error('Failed to delete session');
      return;
    }

    if (currentTest?.pin === pin) {
      setCurrentTest(null);
      setStudents([]);
      setPendingStudents([]);
    }
    await fetchSessions();
    toast.success('Session deleted');
  }, [currentTest, fetchSessions]);

  return (
    <GameContext.Provider
      value={{
        adminLoggedIn,
        currentTest,
        sessions,
        students,
        currentStudent,
        pendingStudents,
        adminLogin,
        adminLogout,
        createTestPin,
        verifyTestPin,
        joinTest,
        startTest,
        updateStudentScore,
        submitGameResult,
        finishTest,
        getLeaderboard,
        deleteAllUsers,
        deleteSession,
        setCurrentStudent,
        fetchSessions,
        switchSession: setCurrentTest,
        approveStudent,
        rejectStudent,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

