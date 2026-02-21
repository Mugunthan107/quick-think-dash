import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import supabase from '../utils/supabase';
import { toast } from 'sonner';

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
  completedGames: string[];
}

interface GameContextType extends GameState {
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  createTestPin: (numGames?: number) => Promise<string>;
  verifyTestPin: (pin: string) => Promise<boolean>;
  joinTest: (pin: string, username: string) => Promise<{ success: boolean; error?: string; pending?: boolean }>;
  startTest: () => Promise<void>;
  updateStudentScore: (username: string, score: number, level: number, correctAnswers: number) => Promise<void>;
  finishTest: (username: string) => Promise<void>;
  getLeaderboard: () => Student[];
  deleteAllUsers: () => Promise<void>;
  deleteSession: (pin: string) => Promise<void>;
  setCurrentStudent: (s: Student | null) => void;
  fetchSessions: () => Promise<void>;
  switchSession: (s: TestSession | null) => void;
  approveStudent: (username: string) => Promise<void>;
  rejectStudent: (username: string) => Promise<void>;
  addCompletedGame: (gameId: string) => void;
  getNextGame: () => string | null;
  resetCompletedGames: () => void;
}

const ADMIN_PASSWORD = 'admin123';

const AVAILABLE_GAMES = ['bubble', 'crossmath'];

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
  const [completedGames, setCompletedGames] = useState<string[]>([]);

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
      if (!currentTest && mappedSessions.length > 0) {
        setCurrentTest(mappedSessions[0]);
      }
    }
  }, [currentTest]);

  // Fetch students for the current test
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
      const mappedStudents: Student[] = data.map((row: any) => ({
        username: row.student_name,
        testPin: row.test_pin,
        score: row.score,
        level: row.level,
        completedAt: row.completed_at ? new Date(row.completed_at).getTime() : null,
        startedAt: new Date(row.started_at).getTime(),
        isFinished: !!row.completed_at,
        correctAnswers: row.correct_answers || 0,
        status: row.status || 'APPROVED',
      }));
      setStudents(mappedStudents.filter(s => s.status === 'APPROVED'));
      setPendingStudents(mappedStudents.filter(s => s.status === 'PENDING'));
    }
  }, []);

  // Poll for updates
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
          if (prev.status !== data.status || prev.isActive !== data.is_active) {
            return {
              ...prev,
              isActive: data.is_active,
              status: data.status || 'WAITING'
            };
          }
          return prev;
        });
      }
    };

    if (currentTest) {
      fetchStudents(currentTest.pin);
      fetchTestStatus(currentTest.pin);

      interval = setInterval(() => {
        fetchStudents(currentTest.pin);
        fetchTestStatus(currentTest.pin);
      }, 1000);
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
    // Cap numGames at available games count
    const cappedNumGames = Math.min(numGames, AVAILABLE_GAMES.length);
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    const { error } = await supabase
      .from('test_sessions')
      .insert([{ pin, is_active: true, status: 'WAITING', num_games: cappedNumGames }]);

    if (error) {
      console.error('Error creating test session:', error);
      toast.error('Failed to create test session: ' + error.message);
      throw error;
    }

    const newTest: TestSession = { pin, createdAt: Date.now(), isActive: true, status: 'WAITING', numGames: cappedNumGames };
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

    const isLateJoin = testData.status === 'STARTED';
    const status = isLateJoin ? 'PENDING' : 'APPROVED';

    // Try to join
    const { error: joinError } = await supabase
      .from('exam_results')
      .insert([{
        test_pin: pin,
        student_name: trimmed,
        started_at: new Date().toISOString(),
        status: status,
        correct_answers: 0,
      }]);

    if (joinError) {
      if (joinError.code === '23505') {
        // Unique violation - check if user exists and is approved (re-login scenario)
        const { data: existingUser } = await supabase
          .from('exam_results')
          .select('*')
          .eq('test_pin', pin)
          .eq('student_name', trimmed)
          .single();

        if (existingUser && existingUser.status === 'APPROVED') {
          // Re-login as existing approved user
          const student: Student = {
            username: trimmed,
            testPin: pin,
            score: existingUser.score || 0,
            level: existingUser.level || 1,
            completedAt: existingUser.completed_at ? new Date(existingUser.completed_at).getTime() : null,
            startedAt: new Date(existingUser.started_at).getTime(),
            isFinished: !!existingUser.completed_at,
            correctAnswers: existingUser.correct_answers || 0,
            status: 'APPROVED'
          };
          setCurrentTest({
            pin,
            createdAt: new Date(testData.created_at).getTime(),
            isActive: testData.is_active,
            status: testData.status || 'WAITING',
            numGames: testData.num_games || 1
          });
          setCurrentStudent(student);
          setCompletedGames([]);
          return { success: true };
        }

        if (existingUser && existingUser.status === 'PENDING') {
          return { success: true, pending: true };
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
      status: status
    };

    if (isLateJoin) {
      return { success: true, pending: true };
    }

    setCurrentTest({ pin, createdAt: new Date(testData.created_at).getTime(), isActive: testData.is_active, status: testData.status || 'WAITING', numGames: testData.num_games || 1 });
    setCurrentStudent(student);
    setCompletedGames([]);
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

  const updateStudentScore = useCallback(async (username: string, score: number, level: number, correctAnswers: number) => {
    if (!currentStudent) return;

    setCurrentStudent(prev => prev ? { ...prev, score, level, correctAnswers } : null);

    await supabase
      .from('exam_results')
      .update({ score, level, correct_answers: correctAnswers })
      .eq('test_pin', currentStudent.testPin)
      .eq('student_name', username);
  }, [currentStudent]);

  const finishTest = useCallback(async (username: string) => {
    if (!currentStudent) return;

    const now = new Date();
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
        if (b.score !== a.score) return b.score - a.score;
        const timeA = a.completedAt! - a.startedAt;
        const timeB = b.completedAt! - b.startedAt;
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

  // Multi-game tracking
  const addCompletedGame = useCallback((gameId: string) => {
    setCompletedGames(prev => {
      if (prev.includes(gameId)) return prev;
      return [...prev, gameId];
    });
  }, []);

  const getNextGame = useCallback((): string | null => {
    if (!currentTest) return null;
    const numGames = currentTest.numGames;
    const remaining = AVAILABLE_GAMES.filter(g => !completedGames.includes(g));
    if (completedGames.length >= numGames || remaining.length === 0) return null;
    return remaining[0];
  }, [currentTest, completedGames]);

  const resetCompletedGames = useCallback(() => {
    setCompletedGames([]);
  }, []);

  return (
    <GameContext.Provider
      value={{
        adminLoggedIn,
        currentTest,
        sessions,
        students,
        currentStudent,
        pendingStudents,
        completedGames,
        adminLogin,
        adminLogout,
        createTestPin,
        verifyTestPin,
        joinTest,
        startTest,
        updateStudentScore,
        finishTest,
        getLeaderboard,
        deleteAllUsers,
        deleteSession,
        setCurrentStudent,
        fetchSessions,
        switchSession: setCurrentTest,
        approveStudent,
        rejectStudent,
        addCompletedGame,
        getNextGame,
        resetCompletedGames,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
