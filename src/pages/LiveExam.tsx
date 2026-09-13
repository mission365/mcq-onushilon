import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { auth, db } from '../lib/firebase';
import { canAccessExam } from '../lib/access';
import {
  AnswerOption,
  QuestionLookup,
  getOptionText,
  getQuestionStimulus,
} from '../lib/question';
import { useExamStore } from '../store/examStore';
import { Exam } from '../types';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBeforeUnload, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

type LiveExamLocationState = {
  returnTo?: string;
};
type SubmitExamOptions = {
  onSubmitted?: () => void;
};

const answerOptions: AnswerOption[] = ['a', 'b', 'c', 'd'];

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const LiveExam = () => {
  const { examId } = useParams<{ examId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [examData, setExamData] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<QuestionLookup[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  const examContainerRef = useRef<HTMLDivElement>(null);
  const skipLeaveGuardRef = useRef(false);

  const { answers, setAnswer, timeLeft, setTimeLeft, clearExam, setExam: setStoreExam } = useExamStore();

  const fetchExamData = useCallback(async () => {
    if (!examId) {
      toast.error('পরীক্ষার তথ্য পাওয়া যায়নি');
      navigate('/dashboard');
      setLoading(false);
      return;
    }

    try {
      const examDoc = await getDoc(doc(db, 'exams', examId));
      if (!examDoc.exists()) {
        toast.error('পরীক্ষাটি পাওয়া যায়নি');
        navigate('/dashboard');
        return;
      }

      const data = { id: examDoc.id, ...examDoc.data() } as Exam;

      if (!auth.currentUser) {
        toast.error('Please login again to continue.');
        navigate('/login');
        return;
      }

      const paidAccessSnapshot = await getDoc(
        doc(db, 'profiles', auth.currentUser.uid, 'subject_access', data.subjectId),
      );

      if (!canAccessExam(data, paidAccessSnapshot.exists())) {
        toast.error('This exam is locked. Unlock the subject to continue.');
        navigate(`/subjects/${data.subjectId}`);
        return;
      }

      setExamData(data);

      if (timeLeft === null) {
        setStoreExam(data.id, data.durationMinutes);
      }

      const legacyQuery = query(collection(db, 'questions'), where('exam_id', '==', examId));
      const currentQuery = query(collection(db, 'questions'), where('examId', '==', examId));
      const [legacySnapshot, currentSnapshot] = await Promise.all([getDocs(legacyQuery), getDocs(currentQuery)]);

      const allQuestionsMap = new Map<string, QuestionLookup>();
      [...legacySnapshot.docs, ...currentSnapshot.docs].forEach((questionDoc) => {
        allQuestionsMap.set(questionDoc.id, {
          id: questionDoc.id,
          ...questionDoc.data(),
        } as QuestionLookup);
      });

      const questionsList = Array.from(allQuestionsMap.values()).sort(
        (a, b) => (a.serialNumber || 0) - (b.serialNumber || 0),
      );

      setQuestions(questionsList);
    } catch (error) {
      console.error('Error fetching exam data:', error);
      toast.error('ডাটা লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  }, [examId, navigate, setStoreExam, timeLeft]);

  useEffect(() => {
    void fetchExamData();
  }, [fetchExamData]);

  const getLeaveDestination = useCallback(() => {
    const state = location.state as LiveExamLocationState | null;
    if (typeof state?.returnTo === 'string' && state.returnTo.trim() !== '') {
      return state.returnTo;
    }

    if (examData?.subjectId) {
      return `/subjects/${examData.subjectId}`;
    }

    return '/dashboard';
  }, [examData?.subjectId, location.state]);

  const submitExam = useCallback(async (options?: SubmitExamOptions) => {
    if (!examData || submitting) return;

    if (!auth.currentUser) {
      toast.error('লগইন করা নেই');
      return;
    }

    setSubmitting(true);

    try {
      let correct = 0;
      let wrong = 0;
      let attempted = 0;

      questions.forEach((question) => {
        const studentAnswer = answers[question.id];
        if (!studentAnswer) return;

        attempted += 1;
        if (studentAnswer.toLowerCase() === question.correctOption.toLowerCase()) {
          correct += 1;
        } else {
          wrong += 1;
        }
      });

      const negativeMark =
        typeof examData.negativeMark === 'number' && !Number.isNaN(examData.negativeMark)
          ? examData.negativeMark
          : 0.25;

      const score = correct - wrong * negativeMark;

      const attemptRef = await addDoc(collection(db, 'attempts'), {
        examId: examData.id,
        studentId: auth.currentUser.uid,
        startedAt: serverTimestamp(),
        submittedAt: serverTimestamp(),
        score,
        totalAttempted: attempted,
        correctCount: correct,
        wrongCount: wrong,
        status: 'completed',
      });

      const batch = writeBatch(db);
      questions.forEach((question) => {
        const answerDocRef = doc(collection(db, 'attempt_answers'));
        const selectedOption = answers[question.id] || null;

        batch.set(answerDocRef, {
          attemptId: attemptRef.id,
          questionId: question.id,
          studentId: auth.currentUser?.uid,
          selectedOption,
          isCorrect: selectedOption
            ? selectedOption.toLowerCase() === question.correctOption.toLowerCase()
            : false,
        });
      });

      await batch.commit();

      skipLeaveGuardRef.current = true;
      clearExam();
      toast.success('পরীক্ষা সম্পন্ন হয়েছে');

      if (options?.onSubmitted) {
        options.onSubmitted();
      } else {
        navigate(`/exam/${attemptRef.id}/result`);
      }
    } catch (error) {
      console.error('Submission failed:', error);
      toast.error('সাবমিট করতে ত্রুটি হয়েছে');
      setSubmitting(false);
    }
  }, [answers, clearExam, examData, navigate, questions, submitting]);

  const handleAutoSubmit = useCallback(() => {
    toast.info('সময় শেষ! অটো-সাবমিট করা হচ্ছে...');
    void submitExam();
  }, [submitExam]);

  useEffect(() => {
    if (loading || submitting || timeLeft === null) return;

    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [handleAutoSubmit, loading, setTimeLeft, submitting, timeLeft]);

  const isExamActive = !loading && !submitting && !!examData;

  const pushLeaveGuardEntry = useCallback(() => {
    const existingState =
      typeof window.history.state === 'object' && window.history.state !== null
        ? window.history.state as Record<string, unknown>
        : {};

    window.history.pushState(
      {
        ...existingState,
        liveExamGuard: true,
        guardedExamId: examId ?? null,
      },
      '',
      window.location.href,
    );
  }, [examId]);

  const handleStayOnExam = useCallback(() => {
    setIsLeaveDialogOpen(false);
  }, []);

  const handleLeaveAfterSubmit = useCallback(() => {
    setIsLeaveDialogOpen(false);
    const leaveDestination = getLeaveDestination();

    void submitExam({
      onSubmitted: () => {
        skipLeaveGuardRef.current = true;
        navigate(leaveDestination, { replace: true });
      },
    });
  }, [getLeaveDestination, navigate, submitExam]);

  useBeforeUnload(
    useCallback((event) => {
      if (!isExamActive || skipLeaveGuardRef.current) return;

      event.preventDefault();
      event.returnValue = '';
    }, [isExamActive]),
  );

  useEffect(() => {
    if (!isExamActive) return;

    skipLeaveGuardRef.current = false;
    pushLeaveGuardEntry();

    const handlePopState = () => {
      if (!isExamActive || skipLeaveGuardRef.current) return;

      pushLeaveGuardEntry();
      setIsLeaveDialogOpen(true);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isExamActive, pushLeaveGuardEntry]);

  const answeredCount = Object.values(answers).filter((value) => value !== null).length;
  const remainingCount = Math.max(questions.length - answeredCount, 0);
  const isLowTime = timeLeft !== null && timeLeft <= 300;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div
      ref={examContainerRef}
      className="flex h-screen w-full flex-col overflow-hidden bg-slate-50 font-sans text-slate-900"
    >
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-600">
            <span className="text-xl font-bold uppercase italic text-white">E</span>
          </div>
          <div>
            <h1 className="max-w-[200px] truncate text-lg leading-none font-bold md:max-w-md font-bengali">
              {examData?.title}
            </h1>
            <p className="text-xs font-medium text-slate-500">
              Secure Exam Session • Total Marks: {examData?.totalMarks}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Time Remaining
            </span>
            <span
              className={`text-2xl font-mono font-bold tabular-nums ${
                isLowTime ? 'animate-pulse text-red-500' : 'text-blue-600'
              }`}
            >
              {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
            </span>
          </div>
          <div className="hidden h-10 w-px bg-slate-200 sm:block" />
          <Button
            onClick={() => void submitExam()}
            disabled={submitting}
            className="h-11 rounded-md border-none bg-red-500 px-8 py-2 text-sm font-bold text-white hover:bg-red-600 font-bengali"
          >
            সাবমিট করো
          </Button>
        </div>
      </header>

      <main className="flex flex-1 gap-6 overflow-hidden p-6">
        <aside className="hidden w-80 shrink-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm lg:flex">
          <div className="border-b border-slate-100 p-4">
            <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-700">
              Exam Status
            </h2>
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-blue-600" />
                <span className="text-slate-600">{answeredCount} Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full border border-slate-200 bg-slate-100" />
                <span className="text-slate-600">{remainingCount} Left</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((question, index) => {
                const answered = !!answers[question.id];

                return (
                  <button
                    key={question.id}
                    onClick={() =>
                      document.getElementById(`question-${index}`)?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                      })
                    }
                    className={`h-10 rounded border text-xs font-bold transition-all ${
                      answered
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {(index + 1).toString().padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-b-xl border-t border-slate-200 bg-slate-50 p-4">
            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Secure Session Active
            </p>
          </div>
        </aside>

        <section className="custom-scrollbar flex flex-1 flex-col space-y-6 overflow-y-auto pb-20 pr-2">
          {questions.map((question, index) => (
            <div
              key={question.id}
              id={`question-${index}`}
              className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm md:p-10"
            >
              <div className="space-y-5">
                <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Question {index + 1} of {questions.length}
                </span>
                {getQuestionStimulus(question) && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700 font-bengali">
                      উদ্দীপক
                    </p>
                    <p className="text-lg leading-relaxed text-slate-700 font-bengali whitespace-pre-line">
                      {getQuestionStimulus(question)}
                    </p>
                  </div>
                )}
                <h3 className="text-2xl leading-relaxed font-bold text-slate-800 font-bengali">
                  {question.questionText}
                </h3>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                {answerOptions.map((option) => {
                  const isSelected = answers[question.id] === option;
                  const optionText = getOptionText(question, option);

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setAnswer(question.id, option)}
                      className={`group flex items-center rounded-xl border p-5 text-left transition-all ${
                        isSelected
                          ? 'border-2 border-blue-600 bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-blue-400'
                      }`}
                    >
                      <div
                        className={`mr-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-300 font-bold uppercase transition-colors ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'text-slate-500 group-hover:bg-blue-50'
                        }`}
                      >
                        {option.toUpperCase()}
                      </div>
                      <span
                        className={`text-lg font-medium font-bengali ${
                          isSelected ? 'font-bold text-blue-900' : 'text-slate-700'
                        }`}
                      >
                        {optionText || (
                          <span className="text-sm italic text-slate-300">(Empty Option)</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:hidden">
            <p className="text-center text-xs font-medium text-slate-400">
              আপনি কি নিশ্চিত যে আপনার পরীক্ষা শেষ হয়েছে?
            </p>
            <Button onClick={() => void submitExam()} className="h-12 w-full border-none bg-green-600 font-bengali">
              সাবমিট করুন
            </Button>
          </div>
        </section>
      </main>

      <footer className="h-1 w-full shrink-0 bg-slate-200">
        <div
          className="h-full bg-blue-600 transition-all duration-500"
          style={{ width: `${(answeredCount / (questions.length || 1)) * 100}%` }}
        />
      </footer>

      <AnimatePresence>
        {submitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md"
          >
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="mt-4 text-xl font-bold text-slate-900 font-bengali">
              সাবমিট হচ্ছে। অপেক্ষা করুন...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={isLeaveDialogOpen} onOpenChange={(open) => { if (!open) handleStayOnExam(); }}>
        <DialogContent showCloseButton={false} className="max-w-md rounded-2xl border-slate-200 p-0 shadow-2xl">
          <div className="border-b border-slate-200 bg-slate-50 p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 font-bengali">
                পরীক্ষা চলছে
              </DialogTitle>
              <DialogDescription className="pt-2 text-sm leading-relaxed text-slate-500 font-bengali">
                এই পেইজ থেকে বের হতে চাইলে আগে পরীক্ষা সাবমিট করুন। সাবমিট করলে আপনি যেখানে যেতে চেয়েছিলেন সেখানে যেতে পারবেন।
              </DialogDescription>
            </DialogHeader>
          </div>

          <DialogFooter className="border-slate-200 bg-slate-50 p-6">
            <Button
              variant="ghost"
              onClick={handleStayOnExam}
              className="h-12 flex-1 rounded-xl border border-slate-200 bg-white font-bold text-slate-600 hover:bg-slate-100 font-bengali"
            >
              থাকুন
            </Button>
            <Button
              onClick={handleLeaveAfterSubmit}
              className="h-12 flex-1 rounded-xl border-none bg-red-500 font-bold text-white hover:bg-red-600 font-bengali"
            >
              সাবমিট করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LiveExam;
