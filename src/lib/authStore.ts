import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { CurriculumVersion, AcademicLevel } from '../types';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'student' | 'admin';
  isVerified?: boolean;
  curriculumVersion?: CurriculumVersion | null;
  academicLevel?: AcademicLevel | null;
  stream?: 'science' | 'commerce' | 'humanities' | 'common' | null;
  phone?: string | null;
  institution?: string | null;
  isSubscribed?: boolean;
  subscriptionStatus?: string;
  subscriptionCurriculum?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  setCurriculumVersion: (version: CurriculumVersion) => void;
  setAcademicLevel: (level: AcademicLevel) => void;
  setStream: (stream: 'science' | 'commerce' | 'humanities') => void;
  setSubscription: (isSubscribed: boolean, status: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,

      login: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: true,
          isAdmin: user.role === 'admin',
        }),

      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isAdmin: false,
        }),

      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
          isAdmin: user.role === 'admin',
        }),

      setCurriculumVersion: (version) =>
        set((state) => ({
          user: state.user ? { ...state.user, curriculumVersion: version } : null,
        })),

      setAcademicLevel: (level) =>
        set((state) => ({
          user: state.user ? { ...state.user, academicLevel: level } : null,
        })),

      setStream: (stream) =>
        set((state) => ({
          user: state.user ? { ...state.user, stream } : null,
        })),

      setSubscription: (isSubscribed, status) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, isSubscribed, subscriptionStatus: status }
            : null,
        })),
    }),
    {
      name: 'mcq-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
