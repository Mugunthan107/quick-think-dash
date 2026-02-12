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
}

export interface TestSession {
  pin: string;
  createdAt: number;
  isActive: boolean;
}

interface GameState {
  adminLoggedIn: boolean;
  currentTest: TestSession | null;
  students: Student[];
  currentStudent: Student | null;
}

interface GameContextType extends GameState {
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  createTestPin: () => Promise<string>;
  joinTest: (pin: string, username: string) => Promise<{ success: boolean; error?: string }>;
  updateStudentScore: (username: string, score: number, level: number) => Promise<void>;
  finishTest: (username: string) => Promise<void>;
  getLeaderboard: () => Student[];
  deleteAllUsers: () => Promise<void>;
  setCurrentStudent: (s: Student | null) => void;
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
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

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
      const mappedStudents: Student[] = data.map((row: any) => ({
        username: row.student_name,
        testPin: row.test_pin,
        score: row.score,
        level: row.level,
        completedAt: row.completed_at ? new Date(row.completed_at).getTime() : null,
        startedAt: new Date(row.started_at).getTime(),
        isFinished: !!row.completed_at,
      }));
      setStudents(mappedStudents);
    }
  }, []);

  // Poll for updates if there's an active test (for both admin and students)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentTest) {
      fetchStudents(currentTest.pin); // Initial fetch
      interval = setInterval(() => {
        fetchStudents(currentTest.pin);
      }, 5000); // Poll every 5 seconds
    }
    return () => clearInterval(interval);
  }, [currentTest, fetchStudents]);

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
  }, []);

  const createTestPin = useCallback(async () => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    const { error } = await supabase
      .from('test_sessions')
      .insert([{ pin, is_active: true }]);

    if (error) {
      toast.error('Failed to create test session');
      throw error;
    }

    const newTest = { pin, createdAt: Date.now(), isActive: true };
    setCurrentTest(newTest);
    setStudents([]);
    return pin;
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

    // Join the test
    const { error: joinError } = await supabase
      .from('exam_results')
      .insert([{
        test_pin: pin,
        student_name: trimmed,
        started_at: new Date().toISOString()
      }]);

    if (joinError) {
      if (joinError.code === '23505') { // Unique violation
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
    };

    setCurrentTest({ pin, createdAt: new Date(testData.created_at).getTime(), isActive: testData.is_active });
    setCurrentStudent(student);
    return { success: true };
  }, []);

  const updateStudentScore = useCallback(async (username: string, score: number, level: number) => {
    if (!currentStudent) return;

    // Optimistic update
    setCurrentStudent(prev => prev ? { ...prev, score, level } : null);

    await supabase
      .from('exam_results')
      .update({ score, level })
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
    // Return locally filtered/sorted students
    // This assumes 'students' state is being refreshed by the poller or initial fetch
    return [...students]
      .filter(s => s.isFinished)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        // Ascending time (lower is better)
        const timeA = a.completedAt! - a.startedAt;
        const timeB = b.completedAt! - b.startedAt;
        return timeA - timeB;
      });
  }, [students]);

  const deleteAllUsers = useCallback(async () => {
    if (!currentTest) return;

    // Delete all results for current test
    const { error } = await supabase
      .from('exam_results')
      .delete()
      .eq('test_pin', currentTest.pin);

    if (error) {
      toast.error('Failed to delete users');
      return;
    }

    setStudents([]);
    setCurrentStudent(null);
  }, [currentTest]);

  return (
    <GameContext.Provider
      value={{
        adminLoggedIn,
        currentTest,
        students,
        currentStudent,
        adminLogin,
        adminLogout,
        createTestPin,
        joinTest,
        updateStudentScore,
        finishTest,
        getLeaderboard,
        deleteAllUsers,
        setCurrentStudent,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

