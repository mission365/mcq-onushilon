import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Copy,
  ListChecks,
  Lock,
  PlayCircle,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import Navbar from '../components/layout/Navbar';
import { canAccessExam, formatBdt, getSubjectUnlockPrice, isFreeExam } from '../lib/access';
import { getExamSubjectId, isExamPublished, normalizeExam } from '../lib/exam';
import { apiJson } from '../lib/api';
import { useAuthStore } from '../lib/authStore';
import { useExamStore } from '../store/examStore';
import { Attempt, Exam, PaymentSettings, Question, Subject, SubjectAccess } from '../types';

type QuestionLookup = Question & Record<string, unknown>;

type SubmissionRow = {
  id: string;
  attemptNumber: number;
  attempted: number;
  correct: number;
  wrong: number;
  unanswered: number;
  score: number;
  submittedAt: unknown;
  startedAt: unknown;
};

const timestampToMillis = (value: unknown) => {
  if (!value) return 0;

  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const timestamp = value as { toDate: () => Date };
    return timestamp.toDate().getTime();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const formatAttemptDateTime = (submittedAt: unknown, startedAt: unknown) => {
  const source = submittedAt || startedAt;
  const millis = timestampToMillis(source);

  if (!millis) return 'Date unavailable';

  return new Intl.DateTimeFormat('bn-BD', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(millis));
};

const SubjectExams = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useAuthStore();
  const version = user?.curriculumVersion || 'bangla';
  const isEnglishUi = version !== 'bangla';

  const [subject, setSubject] = useState<Subject | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessLoading, setAccessLoading] = useState(true);

  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [subjectAccess, setSubjectAccess] = useState<SubjectAccess | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [submissionRows, setSubmissionRows] = useState<SubmissionRow[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [senderBkashNumber, setSenderBkashNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [examFilter, setExamFilter] = useState<'all' | 'board_question' | 'model_test'>('all');

  const setExamStore = useExamStore((state) => state.setExam);
  const currentSubjectPath = `${location.pathname}${location.search}${location.hash}`;
  const hasSubjectAccess = Boolean(subjectAccess);
  const subjectUnlockPrice = getSubjectUnlockPrice(subject);

  useEffect(() => {
    const fetchData = async () => {
      if (!subjectId) {
        setLoading(false);
        setAccessLoading(false);
        return;
      }

      setLoading(true);
      setAccessLoading(true);
      setPaymentSettings(null);
      setSubjectAccess(null);

      try {
        const [subjectData, examList, pSettings] = await Promise.all([
          apiJson<Subject>(`/api/subjects/${subjectId}`).catch(() => null),
          apiJson<Exam[]>(`/api/exams?subjectId=${subjectId}`).catch(() => []),
          apiJson<PaymentSettings>('/api/payment-settings').catch(() => null),
        ]);

        if (subjectData) {
          setSubject(subjectData);
        } else {
          setSubject(null);
        }

        const filteredExams = (examList || [])
          .map((examDoc) => normalizeExam(examDoc))
          .filter((exam) => getExamSubjectId(exam) === subjectId && isExamPublished(exam))
          .sort((a, b) => a.serialNumber - b.serialNumber);

        setExams(filteredExams);

        if (pSettings) {
          setPaymentSettings(pSettings);
        }
      } catch (error) {
        console.error('Error fetching exams:', error);
        toast.error('Unable to load this subject right now.');
      } finally {
        setLoading(false);
      }

      const currentUser = useAuthStore.getState().user;
      if (!currentUser) {
        setAccessLoading(false);
        return;
      }

      try {
        const accessData = await apiJson<{ hasAccess: boolean; access?: SubjectAccess }>(
          `/api/subjects/${subjectId}/access`
        );
        if (accessData?.hasAccess && accessData.access) {
          setSubjectAccess(accessData.access);
        }
      } catch (accessError) {
        console.error('Error fetching subject access:', accessError);
      } finally {
        setAccessLoading(false);
      }
    };

    void fetchData();
  }, [subjectId]);

  const openInstructionModal = (exam: Exam) => {
    setSelectedExam(exam);
    setIsInstructionModalOpen(true);
  };

  const openUnlockModal = (exam?: Exam) => {
    setSelectedExam(exam || null);
    setSenderBkashNumber('');
    setTransactionId('');
    setIsUnlockModalOpen(true);
  };

  const openSubmissionModal = async (exam: Exam) => {
    setSelectedExam(exam);
    setIsSubmissionModalOpen(true);
    setSubmissionsLoading(true);
    setSubmissionRows([]);

    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      setSubmissionsLoading(false);
      return;
    }

    try {
      const [attempts, questions] = await Promise.all([
        apiJson<any[]>(`/api/exams/${exam.id}/submissions`).catch(() => []),
        apiJson<any[]>(`/api/exams/${exam.id}/questions`).catch(() => []),
      ]);

      const totalQuestions = questions.length;

      const rows = (attempts || []).map((attempt, index) => {
        const attempted = attempt.totalAttempted || 0;
        return {
          id: attempt.id,
          attemptNumber: attempts.length - index,
          attempted,
          correct: attempt.correctCount || 0,
          wrong: attempt.wrongCount || 0,
          unanswered: Math.max(totalQuestions - attempted, 0),
          score: attempt.score || 0,
          submittedAt: attempt.submittedAt,
          startedAt: attempt.startedAt,
        };
      });

      setSubmissionRows(rows);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleStartExam = () => {
    if (!selectedExam) return;

    setExamStore(selectedExam.id, selectedExam.durationMinutes);
    navigate(`/exam/${selectedExam.id}/start`, {
      state: { returnTo: currentSubjectPath },
    });
  };

  const handleUnlockSubject = async () => {
    if (!subjectId) return;

    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      toast.error('Please login again to continue payment.');
      navigate('/login');
      return;
    }

    if (!paymentSettings?.bkashNumber) {
      toast.error('Admin has not configured the bKash number yet.');
      return;
    }

    if (!senderBkashNumber.trim() || !transactionId.trim()) {
      toast.error('Enter your sender bKash number and transaction ID.');
      return;
    }

    try {
      setCreatingPayment(true);
      await apiJson('/api/payments/manual-bkash/submit', {
        method: 'POST',
        body: JSON.stringify({
          subjectId,
          senderBkashNumber: senderBkashNumber.trim(),
          transactionId: transactionId.trim().toUpperCase(),
        }),
      });

      toast.success('Payment submitted. Access will unlock after admin approval.');
      setIsUnlockModalOpen(false);
      setSenderBkashNumber('');
      setTransactionId('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to start bKash payment.';
      toast.error(message);
    } finally {
      setCreatingPayment(false);
    }
  };

  const handleCopyBkashNumber = async () => {
    if (!paymentSettings?.bkashNumber) return;

    try {
      await navigator.clipboard.writeText(paymentSettings.bkashNumber);
      toast.success('bKash number copied.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to copy the number.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-5xl p-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="-ml-4 mb-6 gap-2 text-slate-500 shadow-none hover:text-slate-900 font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEnglishUi ? 'Back to Dashboard' : 'ড্যাশবোর্ডে ফিরে যান'}
        </Button>

        {subject && (
          <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
                <BookOpen className="w-3.5 h-3.5" />
                {version === 'british'
                  ? 'British Curriculum (CAIE / Edexcel)'
                  : version === 'ib'
                  ? 'IB World School Programme'
                  : version === 'english'
                  ? 'NCTB English Version'
                  : 'NCTB সিলেবাস মডেল টেস্ট'}
              </div>
              <h1 className="mb-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                {isEnglishUi ? subject.name : `${subject.nameBn} — মডেল টেস্টসমূহ`}
              </h1>
              <p className="text-base text-slate-500 font-sans">
                {version === 'british'
                  ? `${subject.name} • Cambridge Assessment & Pearson Edexcel Past Papers`
                  : version === 'ib'
                  ? `${subject.name} • International Baccalaureate (IB) Assessments`
                  : isEnglishUi
                  ? `${subject.name} • Official Board Questions & Top College Model Tests`
                  : `${subject.name} • বোর্ড প্রশ্ন ও শীর্ষ কলেজের মডেল টেস্ট`}
              </p>
            </div>

            {/* Right-side Subject Cover Visual (~320x180 style, rounded-2xl, soft shadow) */}
            <div className="shrink-0 w-full sm:w-[260px] md:w-[280px] h-[140px] rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-50">
              <img
                src="/web_desgin_images/books_study_materials.png"
                alt="Subject study materials"
                className="w-full h-full object-cover"
              />
            </div>
          </header>
        )}

        {subject && (
          <section
            className={`mb-8 rounded-3xl border p-6 sm:p-7 shadow-sm ${
              hasSubjectAccess
                ? 'border-emerald-200 bg-emerald-50/60'
                : 'border-blue-200 bg-gradient-to-r from-blue-50/70 via-white to-slate-50'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  {hasSubjectAccess ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                  )}
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Subject Access
                  </p>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {hasSubjectAccess
                    ? (isEnglishUi ? 'All test papers in this subject are unlocked.' : 'এই বিষয়ের সকল মডেল টেস্ট আনলক করা আছে।')
                    : (isEnglishUi ? 'Unlock All Test Papers for this Subject' : 'সম্পূর্ণ বিষয়ের সকল মডেল টেস্ট আনলক করুন')}
                </h2>
                <p className="text-sm leading-relaxed text-slate-600">
                  {hasSubjectAccess
                    ? (isEnglishUi
                        ? 'Your premium access is active. Practice every test with full answer keys and detailed explanations.'
                        : 'আপনার প্রিমিয়াম অ্যাক্সেস সক্রিয় রয়েছে। প্রতিটি মডেল টেস্টে পূর্ণাঙ্গ ব্যাখ্যা সহ অনুশীলন করতে পারবেন।')
                    : (isEnglishUi
                        ? 'Get unlimited access to all chapter-wise model tests and full past papers for your curriculum.'
                        : 'এইচএসসি ও বোর্ড পরীক্ষার জন্য প্রতিটি বিষয়ের সব অধ্যায়ভিত্তিক ও পূর্ণাঙ্গ মডেল টেস্ট উপভোগ করুন।')}
                </p>

                {/* 3 Feature Bullets */}
                {!hasSubjectAccess && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs sm:text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        ✓
                      </div>
                      <span>{isEnglishUi ? 'First 3 tests completely free' : 'প্রথম ৩টি টেস্ট সম্পূর্ণ ফ্রি'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        ✓
                      </div>
                      <span>{isEnglishUi ? 'One-time payment' : 'একবার পেমেন্ট (One-time)'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        ✓
                      </div>
                      <span>{isEnglishUi ? 'Lifetime full access' : 'আজীবন অ্যাক্সেস'}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
                <Badge
                  className={`border-none px-3.5 py-1 text-xs font-bold ${
                    hasSubjectAccess ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                  }`}
                >
                  {hasSubjectAccess
                    ? (isEnglishUi ? 'Premium Active' : 'প্রিমিয়াম সক্রিয়')
                    : (isEnglishUi ? '3 Free Tests Available' : '৩টি ফ্রি টেস্ট চালু আছে')}
                </Badge>
                {!hasSubjectAccess && (
                  <div className="space-y-1.5 w-full sm:w-auto">
                    <Button
                      onClick={() => openUnlockModal()}
                      disabled={accessLoading || creatingPayment || !paymentSettings?.bkashNumber}
                      className="h-12 w-full rounded-xl border-none bg-[#e2136e] px-7 font-bold text-white hover:bg-[#c10f5d] shadow-md shadow-[#e2136e]/20 text-sm cursor-pointer"
                    >
                      <Lock className="w-4 h-4 mr-1.5" />
                      {isEnglishUi
                        ? `Unlock with bKash (BDT ${formatBdt(subjectUnlockPrice)})`
                        : `বিকাশ দিয়ে আনলক করুন (BDT ${formatBdt(subjectUnlockPrice)})`}
                    </Button>
                    <div className="text-[11px] text-slate-400 text-center">
                      {isEnglishUi ? 'Secure Payment • One-time Purchase' : 'নিরাপদ পেমেন্ট • ১ বার পেমেন্ট'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filter Tabs between All, Board Questions, and Model Tests */}
            {exams.some((e) => e.examType === 'board_question') && (
              <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl w-fit text-xs font-bold border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setExamFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    examFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isEnglishUi ? `All (${exams.length})` : `সবগুলো (${exams.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => setExamFilter('board_question')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    examFilter === 'board_question'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-indigo-700'
                  }`}
                >
                  {version === 'british'
                    ? `🇬🇧 Past Papers (${exams.filter((e) => e.examType === 'board_question').length})`
                    : version === 'ib'
                    ? `🌐 Past Assessments (${exams.filter((e) => e.examType === 'board_question').length})`
                    : isEnglishUi
                    ? `🏛️ Board Questions (${exams.filter((e) => e.examType === 'board_question').length})`
                    : `🏛️ বোর্ড প্রশ্ন (${exams.filter((e) => e.examType === 'board_question').length})`}
                </button>
                <button
                  type="button"
                  onClick={() => setExamFilter('model_test')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    examFilter === 'model_test'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-blue-700'
                  }`}
                >
                  {isEnglishUi
                    ? `📝 Model Tests (${exams.filter((e) => (e.examType || 'model_test') === 'model_test').length})`
                    : `📝 মডেল টেস্ট (${exams.filter((e) => (e.examType || 'model_test') === 'model_test').length})`}
                </button>
              </div>
            )}

            {exams.filter((e) => examFilter === 'all' || (e.examType || 'model_test') === examFilter).length > 0 ? (
              exams
                .filter((e) => examFilter === 'all' || (e.examType || 'model_test') === examFilter)
                .map((exam) => {
                  const freeExam = isFreeExam(exam);
                  const examAccessible = canAccessExam(exam, hasSubjectAccess);

                  return (
                    <Card
                      key={exam.id}
                      className={`overflow-hidden border rounded-2xl bg-white shadow-sm transition-all hover:shadow-md ${
                        examAccessible
                          ? 'border-slate-200 hover:border-blue-300'
                          : 'border-amber-200/70 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex flex-col justify-between gap-6 p-6 sm:p-8 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-5">
                          <div
                            className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-xl font-black transition-colors shrink-0 font-sans ${
                              examAccessible
                                ? exam.examType === 'board_question'
                                  ? 'border-indigo-100 bg-indigo-50 text-indigo-700'
                                  : 'border-blue-100 bg-blue-50 text-blue-600'
                                : 'border-amber-100 bg-amber-50 text-amber-700'
                            }`}
                          >
                            {exam.serialNumber.toString().padStart(2, '0')}
                          </div>

                          <div>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              {exam.examType === 'board_question' && (
                                <Badge className="border-none px-2.5 py-0.5 text-xs font-bold bg-indigo-600 text-white">
                                  {version === 'british'
                                    ? `🇬🇧 ${exam.boardName || 'Cambridge CAIE'} ${exam.examYear ? `(${exam.examYear})` : ''}`
                                    : version === 'ib'
                                    ? `🌐 ${exam.boardName || 'IB Assessment'} ${exam.examYear ? `(${exam.examYear})` : ''}`
                                    : isEnglishUi
                                    ? `🏛️ ${exam.boardName || 'Dhaka Board'} ${exam.examYear ? `(${exam.examYear})` : ''}`
                                    : `🏛️ বোর্ড প্রশ্ন ${exam.examYear ? `(${exam.examYear})` : ''} • ${exam.boardName || 'সকল বোর্ড'}`}
                                </Badge>
                              )}
                              <Badge
                                className={`border-none px-2.5 py-0.5 text-xs font-bold ${
                                  freeExam
                                    ? 'bg-emerald-600 text-white'
                                    : examAccessible
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-amber-600 text-white'
                                }`}
                              >
                                {freeExam
                                  ? (isEnglishUi ? 'Free Test' : 'ফ্রি টেস্ট')
                                  : examAccessible
                                  ? (isEnglishUi ? 'Unlocked' : 'আনলকড')
                                  : (isEnglishUi ? 'Premium' : 'প্রিমিয়াম')}
                              </Badge>
                              {!freeExam && !examAccessible && (
                                <Badge variant="outline" className="border-amber-300 text-amber-700 text-xs">
                                  {isEnglishUi ? 'Requires Unlock' : 'আনলক প্রয়োজন'}
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">{exam.title}</h3>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                              <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-slate-700">
                                <Clock className="h-3.5 w-3.5 text-blue-600" />
                                {exam.durationMinutes} {isEnglishUi ? 'mins' : 'মিনিট'}
                              </span>
                              <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-slate-700">
                                <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                                {exam.totalMarks} {isEnglishUi ? 'Marks (MCQs)' : 'নম্বর (টি MCQ)'}
                              </span>
                              <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-slate-700">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                {isEnglishUi ? 'Negative Mark: 0.25' : 'নেগেটিভ মার্ক: ০.২৫'}
                              </span>
                            </div>
                          </div>
                        </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          variant="outline"
                          onClick={() => void openSubmissionModal(exam)}
                          disabled={!examAccessible || accessLoading}
                          className="h-11 rounded-xl border-slate-200 px-5 font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                        >
                          <ListChecks className="mr-1.5 h-4 w-4" />
                          {isEnglishUi ? 'Past Attempts' : 'পূর্বের ফলাফল'}
                        </Button>
                        <Button
                          onClick={() => (examAccessible ? openInstructionModal(exam) : openUnlockModal(exam))}
                          disabled={accessLoading}
                          className={`h-11 rounded-xl px-7 font-bold text-sm shadow-md transition-all cursor-pointer ${
                            examAccessible
                              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/25'
                              : 'border-amber-300 bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20'
                          }`}
                        >
                          {examAccessible ? (
                            <span className="inline-flex items-center gap-1.5">
                              <PlayCircle className="w-4 h-4" />
                              {isEnglishUi ? 'Start Test' : 'পরীক্ষা দিন'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5">
                              <Lock className="h-4 w-4" />
                              {isEnglishUi ? 'Unlock Exam' : 'আনলক করুন'}
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
                <AlertCircle className="mx-auto mb-4 h-14 w-14 text-slate-300" strokeWidth={1.5} />
                <p className="text-xl font-medium text-slate-500">
                  {isEnglishUi
                    ? 'No test papers or assessments have been published for this subject yet.'
                    : 'এই বিষয়ের জন্য এখনো কোনো মডেল টেস্ট প্রকাশ করা হয়নি।'}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Instruction Modal with Top Color Strip */}
      <Dialog open={isInstructionModalOpen} onOpenChange={setIsInstructionModalOpen}>
        <DialogContent className="max-w-md overflow-hidden rounded-3xl border-slate-200 p-0 shadow-2xl">
          {/* Top Subject Color Strip */}
          <div className="h-2.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />

          <div className="border-b border-slate-200 bg-slate-50 p-6 sm:p-7">
            <DialogHeader>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                সুরক্ষিত পরীক্ষা ব্যবস্থা
              </div>
              <DialogTitle className="text-2xl font-bold text-slate-900 font-bengali">
                {selectedExam?.title}
              </DialogTitle>
              <DialogDescription className="pt-1.5 text-sm font-bengali text-slate-500">
                পরীক্ষা শুরু করার পূর্বে নির্দেশাবলী মনোযোগ সহকারে পড়ুন।
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-5 p-6 sm:p-7 font-bengali">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="mb-1 text-xs font-bold text-slate-500">
                  পরীক্ষার সময়
                </p>
                <p className="text-2xl font-black text-slate-900 font-sans">
                  {selectedExam?.durationMinutes}
                  <span className="ml-1 text-xs font-bold text-slate-500 font-bengali"> মিনিট</span>
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="mb-1 text-xs font-bold text-slate-500">
                  মোট প্রশ্ন ও নম্বর
                </p>
                <p className="text-2xl font-black text-slate-900 font-sans">
                  {selectedExam?.totalMarks}
                  <span className="ml-1 text-xs font-bold text-slate-500 font-bengali"> টি MCQ</span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs sm:text-sm text-slate-600 space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                গুরুত্বপূর্ণ নির্দেশিকা:
              </div>
              <p>১. প্রতিটি ভুল উত্তরের জন্য ০.২৫ নম্বর কাটা যাবে।</p>
              <p>২. পরীক্ষা চলাকালীন ট্যাব বা উইন্ডো পরিবর্তন করবেন না।</p>
              <p>৩. নির্ধারিত সময় শেষে স্বয়ংক্রিয়ভাবে খাতা জমা হয়ে যাবে।</p>
            </div>
          </div>

          <DialogFooter className="border-slate-200 bg-slate-50 p-6 flex flex-row gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsInstructionModalOpen(false)}
              className="h-12 flex-1 rounded-xl border border-slate-200 bg-white font-bold font-bengali text-slate-600 hover:bg-slate-100"
            >
              বাতিল
            </Button>
            <Button
              onClick={handleStartExam}
              className="h-12 flex-1 rounded-xl border-none bg-blue-600 hover:bg-blue-700 font-bold font-bengali text-white shadow-md shadow-blue-600/25 cursor-pointer"
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              পরীক্ষা শুরু করো
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submission Modal with Empty State */}
      <Dialog open={isSubmissionModalOpen} onOpenChange={setIsSubmissionModalOpen}>
        <DialogContent className="max-w-[96vw] overflow-hidden rounded-3xl border-slate-200 p-0 shadow-2xl sm:max-w-4xl">
          <div className="border-b border-slate-200 bg-slate-50 p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900 font-bengali">
                {selectedExam?.title} — পূর্বের ফলাফলসমূহ
              </DialogTitle>
              <DialogDescription className="pt-1.5 text-sm font-bengali text-slate-500">
                এই পরীক্ষায় আপনার পূর্ববর্তী অংশগ্রহণের স্কোর ও বিস্তারিত মূল্যায়ন।
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Badge className="border-none bg-blue-600 px-3 py-1 text-white font-bengali text-xs">
                মোট অংশগ্রহণ: {submissionRows.length} বার
              </Badge>
              {selectedExam && (
                <Badge variant="outline" className="border-slate-300 px-3 py-1 text-slate-600 font-bengali text-xs">
                  সময়: {selectedExam.durationMinutes} মিনিট
                </Badge>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {submissionsLoading ? (
              <div className="py-16 text-center text-slate-500 font-bengali">ফলাফল লোড হচ্ছে...</div>
            ) : submissionRows.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50 font-bengali">
                      <TableHead className="px-4 py-3">চেষ্টা</TableHead>
                      <TableHead className="px-4 py-3">জমা দেওয়ার সময়</TableHead>
                      <TableHead className="px-4 py-3">সঠিক</TableHead>
                      <TableHead className="px-4 py-3">উত্তর দিয়েছে</TableHead>
                      <TableHead className="px-4 py-3">ভুল</TableHead>
                      <TableHead className="px-4 py-3">অনুত্তর</TableHead>
                      <TableHead className="px-4 py-3">মোট স্কোর</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissionRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="px-4 py-4 font-bold text-slate-800">
                          #{row.attemptNumber}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-slate-600 font-bengali text-xs">
                          {formatAttemptDateTime(row.submittedAt, row.startedAt)}
                        </TableCell>
                        <TableCell className="px-4 py-4 font-bold text-emerald-600">
                          {row.correct}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-slate-700 font-medium">
                          {row.attempted}
                        </TableCell>
                        <TableCell className="px-4 py-4 font-bold text-rose-500">
                          {row.wrong}
                        </TableCell>
                        <TableCell className="px-4 py-4 font-semibold text-slate-400">
                          {row.unanswered}
                        </TableCell>
                        <TableCell className="px-4 py-4 font-black text-blue-600 font-sans text-base">
                          {row.score.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-14 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-2xs">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 font-bengali">
                  আপনি এখনো এই পরীক্ষাটি দেননি
                </h4>
                <p className="mt-1 text-sm text-slate-500 font-bengali">
                  আপনার প্রস্তুতি যাচাই করার জন্য এখনই পরীক্ষায় অংশগ্রহণ করুন।
                </p>
                {selectedExam && (
                  <Button
                    onClick={() => {
                      setIsSubmissionModalOpen(false);
                      handleStartExam();
                    }}
                    className="mt-5 h-11 rounded-xl border-none bg-blue-600 px-6 font-bold text-white hover:bg-blue-700 font-bengali shadow-xs"
                  >
                    এখনই পরীক্ষা দিন
                  </Button>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="border-slate-200 bg-slate-50 p-8">
            <Button
              variant="ghost"
              onClick={() => setIsSubmissionModalOpen(false)}
              className="h-12 rounded-xl border border-slate-200 bg-white px-6 font-bold text-slate-600 hover:bg-slate-100"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUnlockModalOpen} onOpenChange={setIsUnlockModalOpen}>
        <DialogContent className="max-w-2xl overflow-hidden rounded-2xl border-slate-200 p-0 shadow-2xl">
          <div className="border-b border-slate-200 bg-slate-50 p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-lg font-bold text-slate-900">
                <Wallet className="h-4.5 w-4.5 text-[#e2136e]" />
                Unlock with bKash
              </DialogTitle>
              <DialogDescription className="pt-2 text-xs leading-relaxed text-slate-500">
                Pay once for this subject, then submit your sender number and transaction ID to unlock all remaining tests.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-4 p-5 pb-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Subject
                  </p>
                  <h3 className="mt-1.5 text-lg font-bold text-slate-900 font-bengali">
                    {subject?.nameBn}
                  </h3>
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    {selectedExam
                      ? `Selected locked test: ${selectedExam.title}`
                      : 'This purchase applies to every locked test under the subject.'}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#e2136e] px-4 py-3 text-right text-white shadow-lg shadow-pink-200">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-pink-100">
                    One-time Price
                  </p>
                  <p className="mt-1.5 text-xl font-black">BDT {formatBdt(subjectUnlockPrice)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Pay to this bKash number
              </p>
              <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                <div>
                  <p className="text-lg font-black text-slate-900">
                    {paymentSettings?.bkashNumber || 'Not configured'}
                  </p>
                  {paymentSettings?.bkashAccountName && (
                    <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                      {paymentSettings.bkashAccountName}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleCopyBkashNumber()}
                  disabled={!paymentSettings?.bkashNumber}
                  className="h-10 rounded-xl border-slate-200 px-4 font-bold text-slate-700"
                >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[11px] leading-relaxed text-amber-900 whitespace-pre-line">
              {paymentSettings?.paymentInstructions ||
                '1. Send the exact amount to the bKash number above.\n2. Keep the transaction ID.\n3. Submit the details below to unlock this subject.'}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700">Your Sender bKash Number</label>
                <input
                  value={senderBkashNumber}
                  onChange={(event) => setSenderBkashNumber(event.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 text-xs outline-none focus:border-[#e2136e]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700">Transaction ID</label>
                <input
                  value={transactionId}
                  onChange={(event) => setTransactionId(event.target.value)}
                  placeholder="e.g. 9ABCD12345"
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 text-xs uppercase outline-none focus:border-[#e2136e]"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="items-center justify-center border-slate-200 bg-slate-50 p-5 sm:justify-center">
            <Button
              variant="ghost"
              onClick={() => setIsUnlockModalOpen(false)}
              className="h-12 rounded-xl border border-slate-200 bg-white px-6 font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleUnlockSubject()}
              disabled={
                creatingPayment ||
                !paymentSettings?.bkashNumber ||
                !senderBkashNumber.trim() ||
                !transactionId.trim()
              }
              className="h-12 rounded-xl border-none bg-[#e2136e] px-8 font-bold text-white shadow-lg shadow-pink-200 hover:bg-[#c10f5d]"
            >
              {creatingPayment ? 'Unlocking...' : 'I have paid, unlock now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubjectExams;
