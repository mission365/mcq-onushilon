import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { canAccessExam } from '../lib/access';
import { apiJson } from '../lib/api';
import { useAuthStore } from '../lib/authStore';
import {
  AnswerOption,
  QuestionLookup,
  getOptionText,
  getQuestionStimulus,
} from '../lib/question';
import { useExamStore } from '../store/examStore';
import { Exam } from '../types';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBeforeUnload, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import SubscriptionModal from '../components/subscription/SubscriptionModal';

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
  const [requiresSubscription, setRequiresSubscription] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

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
      const user = useAuthStore.getState().user;
      if (!user) {
        toast.error('Please login again to continue.');
        navigate('/login');
        return;
      }

      const data = await apiJson<Exam>(`/api/exams/${examId}`);
      if (!data) {
        toast.error('পরীক্ষাটি পাওয়া যায়নি');
        navigate('/dashboard');
        return;
      }
      setExamData(data);

      if (timeLeft === null) {
        setStoreExam(data.id, data.durationMinutes);
      }

      const questionsList = await apiJson<QuestionLookup[]>(`/api/exams/${examId}/questions`);
      setQuestions(questionsList.sort((a, b) => (a.serialNumber || 0) - (b.serialNumber || 0)));
    } catch (error: any) {
      console.error('Error fetching exam data:', error);
      if (error?.requiresSubscription || error?.status === 403 || String(error?.message).includes('ফ্রি টেস্ট')) {
        setRequiresSubscription(true);
        setIsSubscriptionModalOpen(true);
      } else {
        toast.error(error?.message || 'ডাটা লোড করতে সমস্যা হয়েছে');
      }
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

    const user = useAuthStore.getState().user;
    if (!user) {
      toast.error('লগইন করা নেই');
      return;
    }

    setSubmitting(true);

    try {
      const result = await apiJson<{
        success: boolean;
        attemptId: string;
        score: number;
        totalAttempted: number;
        correctCount: number;
        wrongCount: number;
      }>(`/api/exams/${examData.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });

      skipLeaveGuardRef.current = true;
      clearExam();
      toast.success('পরীক্ষা সম্পন্ন হয়েছে');

      if (options?.onSubmitted) {
        options.onSubmitted();
      } else {
        navigate(`/exam/${result.attemptId}/result`);
      }
    } catch (error) {
      console.error('Submission failed:', error);
      toast.error('সাবমিট করতে ত্রুটি হয়েছে');
      setSubmitting(false);
    }
  }, [answers, clearExam, examData, navigate, submitting]);

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

  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const toggleMarkForReview = (qId: string) => {
    setMarkedForReview(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const answeredCount = Object.values(answers).filter((value) => value !== null).length;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;
  const remainingCount = Math.max(questions.length - answeredCount, 0);
  const isCriticalTime = timeLeft !== null && timeLeft <= 120; // < 2 min warning
  const isLowTime = timeLeft !== null && timeLeft <= 300;

  const scrollToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    document.getElementById(`question-${index}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 font-bengali text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="font-semibold">পরীক্ষার প্রশ্নপত্র লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (requiresSubscription) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 p-4 font-sans text-slate-900">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-bengali">
            সাবস্ক্রিপশন আবশ্যক
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed font-bengali">
            আপনি ইতিমধ্যে ৩টি ফ্রি টেস্টের সুযোগ ব্যবহার করে ফেলেছেন। পরবর্তী সকল মডেল টেস্ট ও বোর্ড প্রশ্ন আনলক করতে সাবস্ক্রিপশন গ্রহণ করুন।
          </p>
          <div className="pt-2 flex flex-col gap-2.5">
            <Button
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md cursor-pointer"
            >
              সাবস্ক্রিপশন গ্রহণ করুন
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="w-full h-11 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-semibold cursor-pointer"
            >
              ড্যাশবোর্ডে ফিরে যান
            </Button>
          </div>
        </div>
        <SubscriptionModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          onSuccess={() => void fetchExamData()}
        />
      </div>
    );
  }

  return (
    <div
      ref={examContainerRef}
      className="flex h-screen w-full flex-col overflow-hidden bg-slate-50 font-sans text-slate-900"
    >
      {/* Sticky Header with Timer & Quick Submit */}
      <header className="sticky top-0 z-50 flex h-14 sm:h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-2.5 sm:px-4 md:px-8 shadow-xs gap-2">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-blue-600 shadow-xs shrink-0">
            <span className="text-xs sm:text-base font-black uppercase text-white font-bengali">পরীক্ষা</span>
          </div>
          <div className="min-w-0">
            <h1 className="max-w-[110px] xs:max-w-[150px] sm:max-w-xs md:max-w-md truncate text-xs sm:text-base md:text-lg leading-tight font-bold text-slate-900 font-bengali">
              {examData?.title}
            </h1>
            <p className="text-[10px] sm:text-xs font-medium text-slate-500 flex items-center gap-1.5 truncate">
              <span>নম্বর: {examData?.totalMarks}</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold hidden xs:inline">নেগেটিভ মার্কিং: নেই</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 shrink-0">
          {/* Timer with < 2 min warning */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="text-right">
              <span className="hidden xs:block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                অবশিষ্ট সময়
              </span>
              <span
                className={`text-base sm:text-xl md:text-2xl font-mono font-bold tabular-nums transition-colors ${
                  isCriticalTime
                    ? 'animate-pulse text-red-600 font-black'
                    : isLowTime
                    ? 'text-amber-600'
                    : 'text-blue-600'
                }`}
              >
                {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
              </span>
            </div>
            {isCriticalTime && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 animate-pulse font-bengali">
                দ্রুত শেষ করুন!
              </span>
            )}
          </div>

          <div className="hidden h-6 sm:h-8 w-px bg-slate-200 sm:block" />

          <Button
            onClick={() => void submitExam()}
            disabled={submitting}
            className="h-8 sm:h-10 rounded-lg sm:rounded-xl border-none bg-red-500 px-2.5 sm:px-5 md:px-7 text-xs sm:text-sm font-bold text-white hover:bg-red-600 font-bengali transition-colors shadow-xs shrink-0"
          >
            সাবমিট
          </Button>
        </div>
      </header>

      {/* Main Layout: Left Palette + Centered 880-920px Questions */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Palette */}
        <aside className="hidden w-76 shrink-0 flex-col border-r border-slate-200 bg-white shadow-xs md:flex">
          {/* Progress Bar & Summary */}
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-bengali mb-3">
              পরীক্ষার অগ্রগতি
            </h2>
            
            {/* Progress Bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 mb-4">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${(answeredCount / (questions.length || 1)) * 100}%` }}
              />
            </div>

            {/* Status Legend */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-emerald-50 p-2 border border-emerald-100">
                <p className="text-base font-bold text-emerald-700">{answeredCount}</p>
                <p className="text-[11px] font-medium text-emerald-600 font-bengali">উত্তর দেওয়া</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2 border border-amber-100">
                <p className="text-base font-bold text-amber-700">{markedCount}</p>
                <p className="text-[11px] font-medium text-amber-600 font-bengali">রিভিউ</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-2 border border-slate-200">
                <p className="text-base font-bold text-slate-700">{remainingCount}</p>
                <p className="text-[11px] font-medium text-slate-600 font-bengali">বাকি আছে</p>
              </div>
            </div>
          </div>

          {/* Question Grid Numbers */}
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-xs font-semibold text-slate-400 mb-3 font-bengali">
              প্রশ্ন তালিকা ({questions.length}টি)
            </p>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((question, index) => {
                const answered = !!answers[question.id];
                const isMarked = !!markedForReview[question.id];
                const isCurrent = currentQuestionIndex === index;

                let btnStyle = 'border-slate-200 bg-white text-slate-600 hover:border-blue-300';
                if (isMarked) {
                  btnStyle = 'border-amber-400 bg-amber-50 text-amber-700 font-bold';
                } else if (answered) {
                  btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold';
                }

                return (
                  <button
                    key={question.id}
                    onClick={() => scrollToQuestion(index)}
                    className={`relative h-10 rounded-lg border text-xs font-bold transition-all ${btnStyle} ${
                      isCurrent ? 'ring-2 ring-blue-600 ring-offset-1' : ''
                    }`}
                  >
                    {(index + 1).toString().padStart(2, '0')}
                    {isMarked && (
                      <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secure Exam Badge Footer */}
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-medium text-slate-500 font-bengali">
              সুরক্ষিত লাইভ পরীক্ষা সেশন
            </span>
          </div>
        </aside>

        {/* Question Area: Max-Width 880-920px */}
        <section className="flex-1 overflow-y-auto px-4 py-6 md:px-8 pb-32">
          <div className="mx-auto max-w-[900px] space-y-6">
            {questions.map((question, index) => {
              const isMarked = !!markedForReview[question.id];

              return (
                <div
                  key={question.id}
                  id={`question-${index}`}
                  className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs transition-all hover:border-slate-300"
                >
                  <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 font-bengali">
                      প্রশ্ন {index + 1} / {questions.length}
                    </span>

                    {/* Mark for Review Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleMarkForReview(question.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors font-bengali ${
                        isMarked
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${isMarked ? 'bg-amber-500' : 'bg-slate-400'}`} />
                      {isMarked ? 'রিভিউ মার্ক করা' : 'রিভিউর জন্য মার্ক করুন'}
                    </button>
                  </div>

                  {getQuestionStimulus(question) && (
                    <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                      <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-800 font-bengali">
                        উদ্দীপক
                      </p>
                      <p className="text-base leading-relaxed text-slate-800 font-bengali whitespace-pre-line">
                        {getQuestionStimulus(question)}
                      </p>
                    </div>
                  )}

                  <h3 className="text-lg md:text-xl leading-relaxed font-bold text-slate-900 font-bengali mb-6">
                    {question.questionText}
                  </h3>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {answerOptions.map((option) => {
                      const isSelected = answers[question.id] === option;
                      const optionText = getOptionText(question, option);

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setAnswer(question.id, option);
                            setCurrentQuestionIndex(index);
                          }}
                          className={`group flex items-center rounded-xl border p-4 text-left transition-all ${
                            isSelected
                              ? 'border-2 border-blue-600 bg-blue-50/80 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                          }`}
                        >
                          <div
                            className={`mr-3.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-bold uppercase transition-all ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                                : 'border-slate-200 text-slate-600 group-hover:border-blue-400 group-hover:text-blue-600'
                            }`}
                          >
                            {option.toUpperCase()}
                          </div>
                          <span
                            className={`text-base font-medium font-bengali leading-snug ${
                              isSelected ? 'font-bold text-blue-950' : 'text-slate-800'
                            }`}
                          >
                            {optionText || (
                              <span className="text-xs italic text-slate-300">(ফাঁকা অপশন)</span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Bottom Sticky Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-2.5 sm:px-4 py-2.5 sm:py-3 shadow-lg backdrop-blur-md">
        <div className="mx-auto flex max-w-[900px] items-center justify-between gap-1.5 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (currentQuestionIndex > 0) {
                scrollToQuestion(currentQuestionIndex - 1);
              }
            }}
            disabled={currentQuestionIndex === 0}
            className="h-9 sm:h-11 px-2.5 sm:px-4 rounded-xl border-slate-300 font-bold text-slate-700 font-bengali hover:bg-slate-100 text-xs sm:text-sm shrink-0"
          >
            <span className="hidden sm:inline">← আগের প্রশ্ন</span>
            <span className="sm:hidden">← আগের</span>
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 font-bengali hidden sm:inline">
              মোট উত্তর: <strong className="text-blue-600">{answeredCount}</strong> / {questions.length}
            </span>
            <Button
              onClick={() => void submitExam()}
              disabled={submitting}
              className="h-9 sm:h-11 rounded-xl border-none bg-blue-600 px-3 sm:px-6 font-bold text-white hover:bg-blue-700 font-bengali shadow-xs text-xs sm:text-sm shrink-0"
            >
              <span className="hidden sm:inline">রিভিউ ও সাবমিট</span>
              <span className="sm:hidden">সাবমিট ({answeredCount}/{questions.length})</span>
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              if (currentQuestionIndex < questions.length - 1) {
                scrollToQuestion(currentQuestionIndex + 1);
              }
            }}
            disabled={currentQuestionIndex >= questions.length - 1}
            className="h-9 sm:h-11 px-2.5 sm:px-4 rounded-xl border-slate-300 font-bold text-slate-700 font-bengali hover:bg-slate-100 text-xs sm:text-sm shrink-0"
          >
            <span className="hidden sm:inline">পরের প্রশ্ন →</span>
            <span className="sm:hidden">পরের →</span>
          </Button>
        </div>
      </div>

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
