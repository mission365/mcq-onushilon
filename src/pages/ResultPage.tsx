import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
import { apiJson } from '../lib/api';
import { useAuthStore } from '../lib/authStore';
import { getExamSubjectId, isExamPublished, normalizeExam } from '../lib/exam';
import { QuestionLookup, getOptionText, getQuestionStimulus } from '../lib/question';
import { useExamStore } from '../store/examStore';
import { Attempt, AttemptAnswer, Exam } from '../types';

type ApiResultResponse = {
  attempt: Attempt;
  exam: Exam;
  questions: (QuestionLookup & { selectedOption: string | null; isCorrect: boolean })[];
};

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
        const data = await apiJson<ApiResultResponse>(`/api/attempts/${attemptId}`);
        setAttempt(data.attempt);
        setExam(data.exam);

        const answersData: Record<string, AttemptAnswer> = {};
        const qList: QuestionLookup[] = data.questions.map((q) => {
          answersData[q.id] = {
            id: q.id,
            attemptId,
            questionId: q.id,
            selectedOption: q.selectedOption,
            isCorrect: q.isCorrect,
          } as AttemptAnswer;

          return q;
        });

        setQuestions(qList);
        setAnswers(answersData);
      } catch (error) {
        console.error('Result fetch error:', error);
        toast.error('ফলাফল লোড করতে ত্রুটি হয়েছে');
        navigate('/dashboard');
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

  const totalAttempted = attempt?.totalAttempted || 0;
  const correctCount = attempt?.correctCount || 0;
  const wrongCount = attempt?.wrongCount || 0;
  const skippedCount = Math.max(0, questions.length - totalAttempted);
  const accuracyPercentage = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;
  const timeUsedMinutes = exam?.durationMinutes || 15;

  const stats = [
    { label: 'মোট প্রাপ্ত নম্বর', value: `${normalizedScore.toFixed(1)}`, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50/70', border: 'border-blue-100' },
    { label: 'সঠিক উত্তর', value: `${correctCount}টি`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/70', border: 'border-emerald-100' },
    { label: 'ভুল উত্তর', value: `${wrongCount}টি`, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50/70', border: 'border-rose-100' },
    { label: 'নির্ভুলতা (Accuracy)', value: `${accuracyPercentage}%`, icon: Zap, color: 'text-violet-600', bg: 'bg-violet-50/70', border: 'border-violet-100' },
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
      const [rawExamList, accessData] = await Promise.all([
        apiJson<Exam[]>(`/api/exams?subjectId=${exam.subjectId}`).catch(() => []),
        apiJson<{ hasAccess: boolean }>(`/api/subjects/${exam.subjectId}/access`).catch(() => ({ hasAccess: false })),
      ]);

      const examList = (rawExamList || [])
        .map((examDoc) => normalizeExam(examDoc))
        .filter((item) => getExamSubjectId(item) === exam.subjectId && isExamPublished(item))
        .sort((a, b) => a.serialNumber - b.serialNumber);

      const currentExamIndex = examList.findIndex((item) => item.id === exam.id);
      const nextExam = currentExamIndex >= 0 ? examList[currentExamIndex + 1] : null;

      if (!nextExam) {
        toast.success('ধন্যবাদ, আপনি সফলভাবে সব এক্সামে অংশগ্রহণ করেছেন।');
        return;
      }

      if (!canAccessExam(nextExam, accessData.hasAccess)) {
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
      <div className="flex h-screen items-center justify-center font-bengali text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="font-semibold">ফলাফল ও বিশ্লেষণ তৈরি হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 font-sans sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-md"
        >
          {/* Top Hero: Compact Height & Raised Score Circle */}
          <div className="relative overflow-hidden bg-slate-900 px-6 py-10 md:py-12 text-center">
            <div className="absolute right-0 top-0 -mr-24 -mt-24 h-56 w-56 rounded-full bg-blue-500/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-56 w-56 rounded-full bg-indigo-500/10 blur-2xl" />

            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-300 font-bengali mb-3">
              পরীক্ষার ফলাফল বিশ্লেষণ
            </span>

            <h1 className="text-2xl md:text-3xl font-bold text-white font-bengali max-w-2xl mx-auto">
              {exam?.title}
            </h1>

            {/* Quick Summary Sentence */}
            <p className="mt-2 text-sm md:text-base font-medium text-slate-300 font-bengali">
              আপনি {questions.length}টির মধ্যে <span className="font-bold text-emerald-400">{correctCount}টি সঠিক</span> উত্তর দিয়েছেন
            </p>

            {/* Score Ring */}
            <div className="relative mt-6 mb-2 inline-flex items-center justify-center">
              <svg className="h-40 w-40 -rotate-90 transform">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-white/10"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={439.8}
                  strokeDashoffset={439.8 - (439.8 * scorePercentage) / 100}
                  className="text-blue-500 transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute flex flex-col items-center">
                <div className="flex items-baseline justify-center gap-1 leading-none">
                  <span className="font-sans text-3xl md:text-4xl font-black tracking-tight text-white tabular-nums">
                    {normalizedScore.toFixed(1)}
                  </span>
                  <span className="font-sans text-xl font-bold text-slate-400 tabular-nums">
                    / {exam?.totalMarks}
                  </span>
                </div>
                <span className="mt-1 text-[11px] font-bold uppercase tracking-wider text-blue-400 font-bengali">
                  মোট স্কোর
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`${stat.bg} ${stat.border} flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all hover:scale-[1.02] shadow-2xs`}
                >
                  <stat.icon className={`mb-2 h-6 w-6 ${stat.color}`} />
                  <span className="text-xl md:text-2xl font-black text-slate-800 font-sans">{stat.value}</span>
                  <span className="mt-1 text-xs font-semibold text-slate-500 font-bengali">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Performance Breakdown Strip */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 font-bengali mb-2">
                <span>পারফরম্যান্স অনুপাত</span>
                <span>মোট প্রশ্ন: {questions.length}টি</span>
              </div>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="bg-emerald-500 transition-all duration-500"
                  style={{ width: `${(correctCount / (questions.length || 1)) * 100}%` }}
                  title={`সঠিক: ${correctCount}`}
                />
                <div
                  className="bg-rose-500 transition-all duration-500"
                  style={{ width: `${(wrongCount / (questions.length || 1)) * 100}%` }}
                  title={`ভুল: ${wrongCount}`}
                />
                <div
                  className="bg-slate-300 transition-all duration-500"
                  style={{ width: `${(skippedCount / (questions.length || 1)) * 100}%` }}
                  title={`উত্তর দেননি: ${skippedCount}`}
                />
              </div>
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs font-medium font-bengali">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> সঠিক ({correctCount})
                </span>
                <span className="flex items-center gap-1.5 text-rose-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> ভুল ({wrongCount})
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> উত্তর দেননি ({skippedCount})
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button
                onClick={handleGoToModelTests}
                className="h-12 justify-center gap-2 rounded-xl border-none bg-blue-600 text-base font-bold text-white hover:bg-blue-700 font-bengali shadow-xs"
              >
                <ListChecks className="h-5 w-5 shrink-0" />
                <span>মডেল টেস্ট তালিকা</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleRetryExam}
                className="h-12 justify-center gap-2 rounded-xl border-2 border-slate-200 text-base font-bold text-slate-700 transition-all hover:border-blue-400 hover:bg-blue-50 font-bengali"
              >
                <RotateCcw className="h-5 w-5 shrink-0" />
                <span>পুনরায় পরীক্ষা দিন</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleToggleAnswerSheet}
                className={`h-12 justify-center gap-2 rounded-xl border-2 text-base font-bold transition-all font-bengali ${
                  showAnswerSheet
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50'
                }`}
              >
                <FileText className="h-5 w-5 shrink-0" />
                <span>{showAnswerSheet ? 'উত্তরপত্র বন্ধ করুন' : 'ব্যাখ্যাসহ উত্তরপত্র দেখুন'}</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleNextExam}
                className="h-12 justify-center gap-2 rounded-xl border-2 border-slate-200 text-base font-bold text-slate-700 transition-all hover:border-violet-400 hover:bg-violet-50 font-bengali"
              >
                <ArrowRight className="h-5 w-5 shrink-0" />
                <span>পরবর্তী মডেল টেস্ট</span>
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
