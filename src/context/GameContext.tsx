import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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
  createTestPin: () => string;
  joinTest: (pin: string, username: string) => { success: boolean; error?: string };
  updateStudentScore: (username: string, score: number, level: number) => void;
  finishTest: (username: string) => void;
  getLeaderboard: () => Student[];
  deleteAllUsers: () => void;
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

  const adminLogin = useCallback((password: string) => {
    if (password === ADMIN_PASSWORD) {
      setAdminLoggedIn(true);
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => {
    setAdminLoggedIn(false);
  }, []);

  const createTestPin = useCallback(() => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    setCurrentTest({ pin, createdAt: Date.now(), isActive: true });
    setStudents([]);
    return pin;
  }, []);

  const joinTest = useCallback((pin: string, username: string) => {
    if (!currentTest || currentTest.pin !== pin) {
      return { success: false, error: 'Invalid test PIN' };
    }
    if (!currentTest.isActive) {
      return { success: false, error: 'Test is no longer active' };
    }
    const trimmed = username.trim();
    if (!trimmed) {
      return { success: false, error: 'Username is required' };
    }
    const exists = students.some(
      s => s.username.toLowerCase() === trimmed.toLowerCase() && s.testPin === pin
    );
    if (exists) {
      return { success: false, error: 'Username already taken for this test' };
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
    setStudents(prev => [...prev, student]);
    setCurrentStudent(student);
    return { success: true };
  }, [currentTest, students]);

  const updateStudentScore = useCallback((username: string, score: number, level: number) => {
    setStudents(prev =>
      prev.map(s =>
        s.username === username ? { ...s, score, level } : s
      )
    );
    setCurrentStudent(prev =>
      prev && prev.username === username ? { ...prev, score, level } : prev
    );
  }, []);

  const finishTest = useCallback((username: string) => {
    const now = Date.now();
    setStudents(prev =>
      prev.map(s =>
        s.username === username ? { ...s, isFinished: true, completedAt: now } : s
      )
    );
    setCurrentStudent(prev =>
      prev && prev.username === username ? { ...prev, isFinished: true, completedAt: now } : prev
    );
  }, []);

  const getLeaderboard = useCallback(() => {
    return [...students]
      .filter(s => s.isFinished)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.completedAt! - a.startedAt) - (b.completedAt! - b.startedAt);
      });
  }, [students]);

  const deleteAllUsers = useCallback(() => {
    setStudents([]);
    setCurrentStudent(null);
  }, []);

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
