import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ExamState {
  currentExamId: string | null;
  answers: Record<string, 'a' | 'b' | 'c' | 'd' | null>;
  startTime: number | null;
  durationMinutes: number | null;
  timeLeft: number | null;
  
  setExam: (examId: string, durationMinutes: number) => void;
  setAnswer: (questionId: string, option: 'a' | 'b' | 'c' | 'd' | null) => void;
  setTimeLeft: (time: number) => void;
  clearExam: () => void;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set) => ({
      currentExamId: null,
      answers: {},
      startTime: null,
      durationMinutes: null,
      timeLeft: null,

      setExam: (examId, durationMinutes) => set({
        currentExamId: examId,
        durationMinutes,
        startTime: Date.now(),
        timeLeft: durationMinutes * 60,
        answers: {},
      }),

      setAnswer: (questionId, option) => set((state) => ({
        answers: { ...state.answers, [questionId]: option }
      })),

      setTimeLeft: (time) => set({ timeLeft: time }),

      clearExam: () => set({
        currentExamId: null,
        answers: {},
        startTime: null,
        durationMinutes: null,
        timeLeft: null,
      }),
    }),
    {
      name: 'exam-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
