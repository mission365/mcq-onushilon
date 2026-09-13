import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  ListChecks,
  RotateCcw,
  Target,
  XCircle,
  Zap,
} from 'lucide-react';

import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { canAccessExam } from '../lib/access';
import { getExamSubjectId, isExamPublished, normalizeExam } from '../lib/exam';
import { auth, db } from '../lib/firebase';
import { QuestionLookup, getOptionText, getQuestionStimulus } from '../lib/question';
import { useExamStore } from '../store/examStore';
import { Attempt, AttemptAnswer, Exam } from '../types';

const ResultPage = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const answerSheetRef = useRef<HTMLDivElement>(null);

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<QuestionLookup[]>([]);
  const [answers, setAnswers] = useState<Record<string, AttemptAnswer>>({});
  const [loading, setLoading] = useState(true);
  const [showAnswerSheet, setShowAnswerSheet] = useState(false);

  const setExamStore = useExamStore((state) => state.setExam);
  const currentResultPath = `${location.pathname}${location.search}${location.hash}`;

  useEffect(() => {
    const fetchData = async () => {
      if (!attemptId) return;

      try {
        const attemptDoc = await getDoc(doc(db, 'attempts', attemptId));
        if (!attemptDoc.exists()) {
          navigate('/dashboard');
          return;
        }

        const attemptData = { id: attemptDoc.id, ...attemptDoc.data() } as Attempt;
        setAttempt(attemptData);

        const examDoc = await getDoc(doc(db, 'exams', attemptData.examId));
        if (examDoc.exists()) {
          setExam({ id: examDoc.id, ...examDoc.data() } as Exam);
        }

        const legacyQuestionsQuery = query(collection(db, 'questions'), where('exam_id', '==', attemptData.examId));
        const currentQuestionsQuery = query(collection(db, 'questions'), where('examId', '==', attemptData.examId));
        const [legacyQuestionsSnapshot, currentQuestionsSnapshot] = await Promise.all([
          getDocs(legacyQuestionsQuery),
          getDocs(currentQuestionsQuery),
        ]);

        const questionMap = new Map<string, QuestionLookup>();
        [...legacyQuestionsSnapshot.docs, ...currentQuestionsSnapshot.docs].forEach((questionDoc) => {
          questionMap.set(questionDoc.id, {
            id: questionDoc.id,
            ...questionDoc.data(),
          } as QuestionLookup);
        });

        const questionList = Array.from(questionMap.values()).sort(
          (a, b) => (a.serialNumber || 0) - (b.serialNumber || 0),
        );
        setQuestions(questionList);

        const answersQuery = query(collection(db, 'attempt_answers'), where('attemptId', '==', attemptId));
        const answersSnapshot = await getDocs(answersQuery);
        const answersData: Record<string, AttemptAnswer> = {};

        answersSnapshot.docs.forEach((answerDoc) => {
          const answer = { id: answerDoc.id, ...answerDoc.data() } as AttemptAnswer;
          answersData[answer.questionId] = answer;
        });

        setAnswers(answersData);
      } catch (error) {
        console.error('Result fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [attemptId, navigate]);

  const normalizedScore = Math.max(0, attempt?.score || 0);
  const scorePercentage =
    exam?.totalMarks && exam.totalMarks > 0
      ? Math.min((normalizedScore / exam.totalMarks) * 100, 100)
      : 0;

  const stats = [
    { label: 'মোট প্রশ্ন', value: questions.length, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'অংশগ্রহণ', value: attempt?.totalAttempted || 0, icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'সঠিক', value: attempt?.correctCount || 0, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'ভুল', value: attempt?.wrongCount || 0, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const handleGoToModelTests = () => {
    if (exam?.subjectId) {
      navigate(`/subjects/${exam.subjectId}`);
      return;
    }

    navigate('/dashboard');
  };

  const handleRetryExam = () => {
    if (!exam) return;

    setExamStore(exam.id, exam.durationMinutes);
    navigate(`/exam/${exam.id}/start`, {
      state: { returnTo: currentResultPath },
    });
  };

  const handleToggleAnswerSheet = () => {
    setShowAnswerSheet((previous) => {
      const next = !previous;

      if (next) {
        window.setTimeout(() => {
          answerSheetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }

      return next;
    });
  };

  const handleNextExam = async () => {
    if (!exam?.subjectId) return;

    try {
      const examsSnapshot = await getDocs(collection(db, 'exams'));
      const examList = examsSnapshot.docs
        .map((examDoc) => normalizeExam({ id: examDoc.id, ...examDoc.data() }))
        .filter((item) => getExamSubjectId(item) === exam.subjectId && isExamPublished(item))
        .sort((a, b) => a.serialNumber - b.serialNumber);

      const currentExamIndex = examList.findIndex((item) => item.id === exam.id);
      const nextExam = currentExamIndex >= 0 ? examList[currentExamIndex + 1] : null;

      if (!nextExam) {
        toast.success('ধন্যবাদ, আপনি সফলভাবে সব এক্সামে অংশগ্রহণ করেছেন।');
        return;
      }

      const user = auth.currentUser;
      const paidAccessSnapshot = user
        ? await getDoc(doc(db, 'profiles', user.uid, 'subject_access', exam.subjectId))
        : null;

      if (!canAccessExam(nextExam, paidAccessSnapshot?.exists() || false)) {
        toast.info('The next test is locked. Unlock this subject first.');
        navigate(`/subjects/${exam.subjectId}`);
        return;
      }

      setExamStore(nextExam.id, nextExam.durationMinutes);
      navigate(`/exam/${nextExam.id}/start`, {
        state: { returnTo: currentResultPath },
      });
    } catch (error) {
      console.error('Next exam navigation error:', error);
      toast.error('পরবর্তী মডেল টেস্ট খুলতে সমস্যা হয়েছে।');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center font-bengali">
        ফলাফল তৈরি হচ্ছে...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 font-sans sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50"
        >
          <div className="relative overflow-hidden bg-slate-900 p-12 text-center">
            <div className="absolute right-0 top-0 -mr-32 -mt-32 h-64 w-64 animate-pulse rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-32 -ml-32 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

            <h1 className="mb-2 text-4xl font-bold text-white font-bengali">{exam?.title}</h1>
            <p className="mb-12 font-medium text-slate-400">পরীক্ষার ফলাফল বিশ্লেষণ</p>

            <div className="relative mb-8 inline-flex items-center justify-center">
              <svg className="h-48 w-48 -rotate-90 transform">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-white/5"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={552.92}
                  strokeDashoffset={552.92 - (552.92 * scorePercentage) / 100}
                  className="text-blue-500 transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute flex flex-col items-center">
                <div className="flex items-baseline justify-center gap-1 leading-none">
                  <span className="font-sans text-3xl font-black tracking-tighter text-white tabular-nums">
                    {normalizedScore.toFixed(2)}
                  </span>
                  <span className="font-sans text-3xl font-bold text-gray-300 tabular-nums">
                    / {exam?.totalMarks}
                  </span>
                </div>
                <span className="mt-1 text-xs font-bold uppercase tracking-widest text-blue-400">
                  Total Score
                </span>
              </div>
            </div>
          </div>

          <div className="p-12">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`${stat.bg} flex flex-col items-center justify-center rounded-3xl border border-white p-6 shadow-sm transition-transform hover:scale-105`}
                >
                  <stat.icon className={`mb-3 h-8 w-8 ${stat.color}`} />
                  <span className="text-2xl font-black text-slate-800">{stat.value}</span>
                  <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Button
                onClick={handleGoToModelTests}
                className="h-14 justify-center gap-3 rounded-2xl border-none bg-slate-900 text-lg font-bold text-white hover:bg-slate-800"
              >
                <ListChecks className="h-5 w-5 shrink-0" />
                <span className="font-bengali">মডেল টেস্টসমূহ</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleRetryExam}
                className="h-14 justify-center gap-3 rounded-2xl border-2 border-slate-200 text-lg font-bold text-slate-700 transition-all hover:border-blue-400 hover:bg-blue-50"
              >
                <RotateCcw className="h-5 w-5 shrink-0" />
                <span className="font-bengali">পুনরায় পরীক্ষা দাও</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleToggleAnswerSheet}
                className={`h-14 justify-center gap-3 rounded-2xl border-2 text-lg font-bold transition-all ${
                  showAnswerSheet
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50'
                }`}
              >
                <FileText className="h-5 w-5 shrink-0" />
                <span className="font-bengali">উত্তরপত্র</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleNextExam}
                className="h-14 justify-center gap-3 rounded-2xl border-2 border-slate-200 text-lg font-bold text-slate-700 transition-all hover:border-violet-400 hover:bg-violet-50"
              >
                <ArrowRight className="h-5 w-5 shrink-0" />
                <span className="font-bengali">পরবর্তী প্রশ্ন</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {showAnswerSheet && (
          <div ref={answerSheetRef} className="space-y-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="h-8 w-1 rounded-full bg-blue-600"></div>
              <h2 className="text-2xl font-bold text-slate-900 font-bengali">প্রশ্নের বিস্তারিত উত্তরসমূহ</h2>
            </div>

            {questions.map((question, index) => {
              const studentAnswer = answers[question.id];
              const isCorrect = studentAnswer?.isCorrect;
              const hasAnswered = !!studentAnswer?.selectedOption;
              const stimulusText = getQuestionStimulus(question);

              return (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <Card
                    className={`overflow-hidden rounded-3xl border-none shadow-sm ${
                      isCorrect
                        ? 'bg-green-50/30 ring-1 ring-green-100'
                        : hasAnswered
                          ? 'bg-red-50/30 ring-1 ring-red-100'
                          : 'bg-slate-50/50 ring-1 ring-slate-100'
                    }`}
                  >
                    <CardHeader className="p-8 pb-4">
                      <div className="flex gap-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white font-bold text-slate-400 shadow-sm">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          {stimulusText && (
                            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700 font-bengali">
                                উদ্দীপক
                              </div>
                              <p className="text-sm leading-relaxed text-slate-700 font-bengali whitespace-pre-line">
                                {stimulusText}
                              </p>
                            </div>
                          )}
                          <h4 className="text-lg font-bold leading-relaxed text-slate-900 font-bengali">
                            {question.questionText}
                          </h4>
                          <div className="mt-3 flex items-center gap-2">
                            {!hasAnswered && (
                              <Badge variant="secondary" className="font-bengali opacity-70">
                                উত্তর দাওনি
                              </Badge>
                            )}
                            {hasAnswered && isCorrect && (
                              <Badge className="border-none bg-green-600 text-white font-bengali">
                                সঠিক উত্তর
                              </Badge>
                            )}
                            {hasAnswered && !isCorrect && (
                              <Badge className="border-none bg-red-600 text-white font-bengali">
                                ভুল উত্তর
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-8 pt-4">
                      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {(['a', 'b', 'c', 'd'] as const).map((option) => {
                          const optionText = getOptionText(question, option);
                          const isCorrectOption = question.correctOption === option;
                          const isStudentOption = studentAnswer?.selectedOption === option;

                          let optionStyle = 'border-slate-100 bg-white text-slate-700';
                          if (isCorrectOption) {
                            optionStyle =
                              'border-green-300 bg-green-100 text-green-900 font-bold ring-2 ring-green-400 shadow-sm';
                          } else if (isStudentOption && !isCorrect) {
                            optionStyle =
                              'border-red-300 bg-red-100 text-red-900 font-bold ring-2 ring-red-400 shadow-sm';
                          }

                          return (
                            <div
                              key={option}
                              className={`flex items-center rounded-2xl border-2 p-4 transition-all ${optionStyle}`}
                            >
                              <span
                                className={`mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-bold ${
                                  isCorrectOption
                                    ? 'bg-green-600 text-white'
                                    : isStudentOption
                                      ? 'bg-red-600 text-white'
                                      : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {option.toUpperCase()}
                              </span>
                              <span className="font-bengali">
                                {optionText || <span className="text-xs italic text-slate-300">(Empty)</span>}
                              </span>
                              {isCorrectOption && <CheckCircle2 className="ml-auto h-5 w-5 text-green-600" />}
                            </div>
                          );
                        })}
                      </div>

                      {question.explanation && (
                        <div className="rounded-2xl border border-slate-200 bg-white/60 p-6">
                          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-600">
                            <AlertCircle className="h-4 w-4 text-blue-500" /> ব্যাখ্যা
                          </div>
                          <p className="text-sm leading-relaxed text-slate-700 font-bengali">
                            {question.explanation}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPage;
