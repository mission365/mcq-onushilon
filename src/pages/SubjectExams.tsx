import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
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
import { auth, db } from '../lib/firebase';
import { PAYMENT_SETTINGS_SUBJECT_ID } from '../lib/paymentSettings';
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
        const subjectDoc = await getDoc(doc(db, 'subjects', subjectId));

        if (subjectDoc.exists()) {
          setSubject({ id: subjectDoc.id, ...subjectDoc.data() } as Subject);
        } else {
          setSubject(null);
        }

        const examsSnapshot = await getDocs(collection(db, 'exams'));
        const examList = examsSnapshot.docs
          .map((examDoc) => normalizeExam({ id: examDoc.id, ...examDoc.data() }))
          .filter((exam) => getExamSubjectId(exam) === subjectId && isExamPublished(exam))
          .sort((a, b) => a.serialNumber - b.serialNumber);

        setExams(examList);
      } catch (error) {
        console.error('Error fetching exams:', error);
        toast.error('Unable to load this subject right now.');
      } finally {
        setLoading(false);
      }

      try {
        const paymentSettingsDoc = await getDoc(doc(db, 'subjects', PAYMENT_SETTINGS_SUBJECT_ID));

        if (paymentSettingsDoc.exists()) {
          setPaymentSettings({
            id: paymentSettingsDoc.id,
            ...paymentSettingsDoc.data(),
          } as PaymentSettings);
        }
      } catch (paymentSettingsError) {
        console.error('Error fetching payment settings:', paymentSettingsError);
      }

      if (!auth.currentUser) {
        setAccessLoading(false);
        return;
      }

      try {
        const subjectAccessDoc = await getDoc(
          doc(db, 'profiles', auth.currentUser.uid, 'subject_access', subjectId),
        );

        if (subjectAccessDoc.exists()) {
          setSubjectAccess({
            id: subjectAccessDoc.id,
            ...subjectAccessDoc.data(),
          } as SubjectAccess);
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

    if (!auth.currentUser) {
      setSubmissionsLoading(false);
      return;
    }

    try {
      const attemptsQuery = query(
        collection(db, 'attempts'),
        where('examId', '==', exam.id),
        where('studentId', '==', auth.currentUser.uid),
      );

      const legacyQuestionsQuery = query(collection(db, 'questions'), where('exam_id', '==', exam.id));
      const currentQuestionsQuery = query(collection(db, 'questions'), where('examId', '==', exam.id));

      const [attemptsSnapshot, legacyQuestionsSnapshot, currentQuestionsSnapshot] = await Promise.all([
        getDocs(attemptsQuery),
        getDocs(legacyQuestionsQuery),
        getDocs(currentQuestionsQuery),
      ]);

      const questionMap = new Map<string, QuestionLookup>();
      [...legacyQuestionsSnapshot.docs, ...currentQuestionsSnapshot.docs].forEach((questionDoc) => {
        questionMap.set(questionDoc.id, {
          id: questionDoc.id,
          ...(questionDoc.data() as Record<string, unknown>),
        } as QuestionLookup);
      });

      const totalQuestions = questionMap.size;

      const attempts = attemptsSnapshot.docs
        .map((attemptDoc) => ({ id: attemptDoc.id, ...(attemptDoc.data() as Record<string, unknown>) } as Attempt))
        .sort((a, b) => {
          const timeA = timestampToMillis(a.submittedAt || a.startedAt);
          const timeB = timestampToMillis(b.submittedAt || b.startedAt);
          return timeB - timeA;
        });

      const rows = attempts.map((attempt, index) => {
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

    const currentUser = auth.currentUser;
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
      await addDoc(collection(db, 'manual_payment_requests'), {
        userId: currentUser.uid,
        subjectId,
        subjectName: subject?.nameBn || subject?.name || '',
        gateway: 'bkash',
        paymentMethod: 'manual',
        amount: subjectUnlockPrice,
        currency: 'BDT',
        senderBkashNumber: senderBkashNumber.trim(),
        receiverBkashNumber: paymentSettings.bkashNumber,
        receiverName: paymentSettings.bkashAccountName || '',
        transactionId: transactionId.trim().toUpperCase(),
        status: 'submitted',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
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
          className="-ml-4 mb-8 gap-2 text-slate-500 shadow-none hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Button>

        {subject && (
          <header className="mb-8">
            <h1 className="mb-3 text-4xl font-bold tracking-tight text-slate-900 font-bengali">
              {subject.nameBn} - Model Tests
            </h1>
            <p className="text-lg text-slate-500">
              Choose a test, review your previous submissions, and keep moving through the sequence.
            </p>
          </header>
        )}

        {subject && (
          <section
            className={`mb-8 rounded-2xl border p-6 shadow-sm ${
              hasSubjectAccess
                ? 'border-emerald-200 bg-emerald-50/80'
                : 'border-amber-200 bg-amber-50/80'
            }`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {hasSubjectAccess ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Lock className="h-5 w-5 text-amber-700" />
                  )}
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Subject Access
                  </p>
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {hasSubjectAccess
                    ? 'All model tests under this subject are unlocked.'
                    : 'The first 3 model tests are free. The rest stay locked until payment.'}
                </h2>
                <p className="text-sm leading-relaxed text-slate-600">
                  {hasSubjectAccess
                    ? 'Your premium access is active, so every published test in this subject is ready to start.'
                    : `Unlock every remaining test in this subject with a one-time bKash payment of BDT ${formatBdt(
                        subjectUnlockPrice,
                      )}.`}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <Badge
                  className={`border-none px-3 py-1 text-xs ${
                    hasSubjectAccess ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
                  }`}
                >
                  {hasSubjectAccess ? 'Premium Active' : '3 Free Tests'}
                </Badge>
                {!hasSubjectAccess && (
                  <Button
                    onClick={() => openUnlockModal()}
                    disabled={accessLoading || creatingPayment || !paymentSettings?.bkashNumber}
                    className="h-11 rounded-xl border-none bg-[#e2136e] px-6 font-bold text-white hover:bg-[#c10f5d]"
                  >
                    Unlock with bKash
                  </Button>
                )}
              </div>
            </div>
          </section>
        )}

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {exams.length > 0 ? (
              exams.map((exam) => {
                const freeExam = isFreeExam(exam);
                const examAccessible = canAccessExam(exam, hasSubjectAccess);

                return (
                  <Card
                    key={exam.id}
                    className={`overflow-hidden border bg-white shadow-sm transition-all ${
                      examAccessible
                        ? 'border-slate-200 hover:border-blue-300'
                        : 'border-amber-200/70 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-6 p-8 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-6">
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-xl border text-xl font-black transition-colors ${
                            examAccessible
                              ? 'border-slate-100 bg-slate-50 text-blue-600'
                              : 'border-amber-100 bg-amber-50 text-amber-700'
                          }`}
                        >
                          {exam.serialNumber.toString().padStart(2, '0')}
                        </div>

                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <Badge
                              className={`border-none px-2.5 py-1 text-[11px] uppercase tracking-wide ${
                                freeExam
                                  ? 'bg-blue-600 text-white'
                                  : examAccessible
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-amber-600 text-white'
                              }`}
                            >
                              {freeExam ? 'Free' : examAccessible ? 'Unlocked' : 'Locked'}
                            </Badge>
                            {!freeExam && !examAccessible && (
                              <Badge variant="outline" className="border-amber-300 text-amber-700">
                                Requires subject unlock
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-slate-800 font-bengali">{exam.title}</h3>
                          <div className="mt-2 flex flex-wrap items-center gap-4">
                            <span className="flex items-center gap-1.5 rounded bg-slate-50 px-2 py-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                              <Clock className="h-3.5 w-3.5" />
                              {exam.durationMinutes} min
                            </span>
                            <span className="flex items-center gap-1.5 rounded bg-slate-50 px-2 py-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                              <BookOpen className="h-3.5 w-3.5" />
                              marks: {exam.totalMarks}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button
                          variant="outline"
                          onClick={() => void openSubmissionModal(exam)}
                          disabled={!examAccessible || accessLoading}
                          className="h-12 rounded-md border-slate-200 px-6 font-bold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ListChecks className="mr-2 h-4 w-4" />
                          Submissions
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => (examAccessible ? openInstructionModal(exam) : openUnlockModal(exam))}
                          disabled={accessLoading}
                          className={`h-12 rounded-md px-8 font-bold transition-all ${
                            examAccessible
                              ? 'border-slate-200 text-slate-600 hover:border-blue-600 hover:bg-blue-600 hover:text-white'
                              : 'border-amber-300 bg-amber-50 text-amber-700 hover:border-amber-400 hover:bg-amber-100'
                          }`}
                        >
                          {examAccessible ? (
                            'Start Exam'
                          ) : (
                            <span className="inline-flex items-center gap-2">
                              <Lock className="h-4 w-4" />
                              Unlock
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white py-20 text-center">
                <AlertCircle className="mx-auto mb-6 h-16 w-16 text-slate-200" strokeWidth={1.5} />
                <p className="text-xl font-medium text-slate-400">
                  No published model tests are available for this subject yet.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <Dialog open={isInstructionModalOpen} onOpenChange={setIsInstructionModalOpen}>
        <DialogContent className="max-w-md overflow-hidden rounded-2xl border-slate-200 p-0 shadow-2xl">
          <div className="border-b border-slate-200 bg-slate-50 p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900 font-bengali">
                {selectedExam?.title}
              </DialogTitle>
              <DialogDescription className="pt-3 text-base leading-relaxed text-slate-500">
                Please review the exam instructions before you begin.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-6 p-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-2 text-[10px] font-black uppercase leading-none tracking-[0.2em] text-slate-400">
                  Duration
                </p>
                <p className="text-2xl font-black text-slate-900">
                  {selectedExam?.durationMinutes}
                  <span className="ml-1 text-sm font-bold uppercase tracking-tighter text-slate-400">
                    {' '}Min
                  </span>
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-2 text-[10px] font-black uppercase leading-none tracking-[0.2em] text-slate-400">
                  Total Marks
                </p>
                <p className="text-2xl font-black text-slate-900">
                  {selectedExam?.totalMarks}
                  <span className="ml-1 text-sm font-bold uppercase tracking-tighter text-slate-400">
                    {' '}Pts
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <h4 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                <AlertCircle className="h-3.5 w-3.5 text-blue-600" />
                Instructions
              </h4>
              <p className="whitespace-pre-line text-sm font-medium italic leading-relaxed text-slate-600">
                {selectedExam?.instructions ||
                  '1. Negative marking will apply for wrong answers.\n2. Do not leave the page after starting the exam.\n3. The exam will auto-submit when time runs out.'}
              </p>
            </div>
          </div>

          <DialogFooter className="border-slate-200 bg-slate-50 p-8">
            <Button
              variant="ghost"
              onClick={() => setIsInstructionModalOpen(false)}
              className="h-14 flex-1 rounded-xl border border-slate-200 bg-white font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartExam}
              className="h-14 flex-1 rounded-xl border-none bg-blue-600 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:translate-y-[-2px] hover:bg-blue-700"
            >
              <PlayCircle className="mr-2 h-6 w-6" />
              Start Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSubmissionModalOpen} onOpenChange={setIsSubmissionModalOpen}>
        <DialogContent className="max-w-[96vw] overflow-hidden rounded-2xl border-slate-200 p-0 shadow-2xl sm:max-w-6xl lg:max-w-7xl">
          <div className="border-b border-slate-200 bg-slate-50 p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900 font-bengali">
                {selectedExam?.title} - Submissions
              </DialogTitle>
              <DialogDescription className="pt-3 text-base leading-relaxed text-slate-500">
                Review how many times you attempted this exam and how each submission performed.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Badge className="border-none bg-blue-600 px-3 py-1 text-white">
                Total submissions: {submissionRows.length}
              </Badge>
              {selectedExam && (
                <Badge variant="outline" className="border-slate-300 px-3 py-1 text-slate-600">
                  Duration: {selectedExam.durationMinutes} min
                </Badge>
              )}
            </div>
          </div>

          <div className="p-8">
            {submissionsLoading ? (
              <div className="py-16 text-center text-slate-500">Loading submissions...</div>
            ) : submissionRows.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="px-4 py-3">Attempt</TableHead>
                      <TableHead className="px-4 py-3">Submitted At</TableHead>
                      <TableHead className="px-4 py-3">Correct</TableHead>
                      <TableHead className="px-4 py-3">Attempted</TableHead>
                      <TableHead className="px-4 py-3">Wrong</TableHead>
                      <TableHead className="px-4 py-3">Unanswered</TableHead>
                      <TableHead className="px-4 py-3">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissionRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="px-4 py-4 font-semibold text-slate-700">
                          #{row.attemptNumber}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-slate-600">
                          {formatAttemptDateTime(row.submittedAt, row.startedAt)}
                        </TableCell>
                        <TableCell className="px-4 py-4 font-semibold text-green-600">
                          {row.correct}
                        </TableCell>
                        <TableCell className="px-4 py-4 font-semibold text-blue-600">
                          {row.attempted}
                        </TableCell>
                        <TableCell className="px-4 py-4 font-semibold text-red-600">
                          {row.wrong}
                        </TableCell>
                        <TableCell className="px-4 py-4 font-semibold text-slate-500">
                          {row.unanswered}
                        </TableCell>
                        <TableCell className="px-4 py-4 font-semibold text-slate-900">
                          {row.score.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
                <ListChecks className="mx-auto mb-4 h-12 w-12 text-slate-200" />
                <p className="text-lg font-medium text-slate-400">
                  No submissions were found for this exam yet.
                </p>
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
