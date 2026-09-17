import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Subject, Exam, CurriculumVersion, AcademicLevel, UserSubscriptionStatus } from '@/src/types';
import Navbar from '@/src/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookMarked,
  ChevronRight,
  Sparkles,
  Globe2,
  BookOpen,
  Trophy,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  Star,
  PlayCircle,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Award,
  Compass,
  Building2,
  User,
  ShieldCheck,
  Lock,
  Play,
  HelpCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { apiJson } from '@/src/lib/api';
import { useAuthStore } from '@/src/lib/authStore';

const toBnNumber = (n: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [subStatus, setSubStatus] = useState<UserSubscriptionStatus | null>(null);
  const [stats, setStats] = useState<{
    completedExams: number;
    avgScore: number;
    streakDays: number;
    totalAttempts: number;
  }>({
    completedExams: 0,
    avgScore: 0,
    streakDays: 0,
    totalAttempts: 0,
  });
  const version: CurriculumVersion = user?.curriculumVersion || 'bangla';
  const isEnglishUi = version !== 'bangla';

  const getDefaultLevelForVersion = (ver: CurriculumVersion): AcademicLevel => {
    switch (ver) {
      case 'british':
        return 'alevel';
      case 'ib':
        return 'dp';
      case 'english':
      case 'bangla':
      default:
        return 'hsc';
    }
  };

  const userStream = (user?.stream || 'science') as 'science' | 'commerce' | 'humanities';
  const [selectedLevel, setSelectedLevel] = useState<AcademicLevel>(
    user?.academicLevel || getDefaultLevelForVersion(version)
  );
  const [selectedStream, setSelectedStream] = useState<'my_stream' | 'science' | 'commerce' | 'humanities' | 'common' | 'optional' | 'all'>('my_stream');

  interface RecentActivity {
    hasActivity: boolean;
    type: 'attempt' | 'recommended' | null;
    activity: {
      attemptId?: string;
      examId: string;
      score?: number;
      totalAttempted?: number;
      correctCount?: number;
      wrongCount?: number;
      status?: 'ongoing' | 'completed';
      startedAt?: string;
      submittedAt?: string;
      examTitle: string;
      durationMinutes: number;
      totalMarks: number;
      academicLevel: string;
      curriculumVersion: string;
      subjectId: string;
      subjectName: string;
      subjectNameBn: string;
      questionCount: number;
    } | null;
  }

  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);

  useEffect(() => {
    if (user?.academicLevel) {
      setSelectedLevel(user.academicLevel);
    } else {
      setSelectedLevel(getDefaultLevelForVersion(version));
    }
  }, [user?.academicLevel, version]);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const data = await apiJson<RecentActivity>(
          `/api/user/recent-activity?academicLevel=${selectedLevel}&curriculumVersion=${version}`
        );
        if (data) {
          setRecentActivity(data);
        }
      } catch (err) {
        console.error('Failed to load recent activity:', err);
      }
    };

    if (user) {
      void fetchRecentActivity();
    }
  }, [user, selectedLevel, version]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiJson<{
          completedExams: number;
          avgScore: number;
          streakDays: number;
          totalAttempts: number;
        }>('/api/user/stats');
        if (data) {
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to load user stats:', err);
      }
    };

    const fetchSubStatus = async () => {
      try {
        const data = await apiJson<UserSubscriptionStatus>('/api/user/subscription-status');
        setSubStatus(data);
      } catch (err) {
        console.error('Failed to load subscription status:', err);
      }
    };

    if (user) {
      fetchStats();
      fetchSubStatus();
    }
  }, [user]);

  useEffect(() => {
    // If student has not selected a curriculum version yet, prompt them
    if (user && user.role !== 'admin' && !user.curriculumVersion) {
      navigate('/select-version');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (version) queryParams.set('version', version);
        if (selectedLevel) queryParams.set('level', selectedLevel);

        if (user?.role !== 'admin') {
          // Strictly isolate student subjects to their own stream + compulsory
          if (selectedStream === 'common') {
            queryParams.set('stream', 'common');
          } else if (selectedStream === 'optional') {
            queryParams.set('stream', 'optional');
          } else if (selectedStream === 'stream_core') {
            queryParams.set('stream', userStream);
          } else {
            // 'my_stream' or 'all' - show full student syllabus (stream + common + optional)
            queryParams.set('stream', userStream);
            queryParams.set('include_common', 'true');
          }
        } else {
          if (selectedStream === 'my_stream') {
            queryParams.set('stream', userStream);
            queryParams.set('include_common', 'true');
          } else if (selectedStream !== 'all') {
            queryParams.set('stream', selectedStream);
          }
        }

        const data = await apiJson<Subject[]>(`/api/subjects?${queryParams.toString()}`);
        setSubjects(data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [version, selectedLevel, selectedStream, userStream, user, navigate]);

  const getStreamBadge = (stream?: string) => {
    if (isEnglishUi) {
      switch (stream) {
        case 'science':
          return { label: 'Science', bg: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
        case 'commerce':
          return { label: 'Business Studies', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
        case 'humanities':
          return { label: 'Humanities & Arts', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
        case 'common':
          return { label: 'Compulsory Core', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
        case 'optional':
          return { label: 'Elective (4th)', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
        default:
          return { label: 'Subject', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
      }
    }

    switch (stream) {
      case 'science':
        return { label: 'বিজ্ঞান (Science)', bg: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
      case 'commerce':
        return { label: 'ব্যবসায় শিক্ষা', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'humanities':
        return { label: 'মানবিক বিভাগ', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'common':
        return { label: 'আবশ্যিক বিষয়', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'optional':
        return { label: 'ঐচ্ছিক বিষয় (৪র্থ)', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      default:
        return { label: 'বিষয়', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const getShortLevelName = (level: string) => {
    switch (level) {
      case 'alevel': return 'A Level';
      case 'olevel': return 'O Level';
      case 'dp': return 'IB DP';
      case 'myp': return 'IB MYP';
      case 'hsc': return 'HSC';
      case 'ssc': return 'SSC';
      default: return level ? level.toUpperCase() : '';
    }
  };

  const getUserStreamNameBn = (s: string) => {
    if (isEnglishUi) {
      if (s === 'science') return 'Science Stream';
      if (s === 'commerce') return 'Business Studies';
      if (s === 'humanities') return 'Humanities & Arts';
      return 'Science Stream';
    }
    if (s === 'science') return 'বিজ্ঞান বিভাগ (Science)';
    if (s === 'commerce') return 'ব্যবসায় শিক্ষা (Commerce)';
    if (s === 'humanities') return 'মানবিক বিভাগ (Humanities)';
    return 'বিজ্ঞান বিভাগ';
  };

  const getStreamDescription = () => {
    if (isEnglishUi) {
      if (selectedStream === 'science') {
        return version === 'british'
          ? 'Physics, Chemistry, Biology, Mathematics and Further Mathematics'
          : version === 'ib'
            ? 'Physics HL/SL, Chemistry HL/SL, Biology HL/SL and Mathematics'
            : selectedLevel === 'ssc'
              ? 'Physics, Chemistry, Biology, Higher Mathematics and Bangladesh & Global Studies'
              : 'Physics, Chemistry, Biology (Botany & Zoology) and Higher Mathematics';
      }
      if (selectedStream === 'commerce') {
        return version === 'british'
          ? 'Accounting, Economics, Business Studies and Commerce'
          : version === 'ib'
            ? 'Economics HL/SL, Business Management HL/SL'
            : 'Accounting, Finance & Banking, Business Organization & Management';
      }
      if (selectedStream === 'humanities') {
        return 'Economics, History, Geography, Sociology, Logic and Global Perspectives';
      }
      if (selectedStream === 'common') {
        if (version === 'british') {
          return selectedLevel === 'alevel'
            ? 'English General Paper, Global Perspectives & Research, Thinking Skills and Information Technology'
            : 'Bengali, English Language, Mathematics (Syllabus D) and Information & Communication Technology';
        }
        if (version === 'ib') {
          return selectedLevel === 'dp'
            ? 'Theory of Knowledge (TOK), English A: Language & Literature, Extended Essay and Environmental Systems'
            : 'Mathematics, Language Acquisition (English) and Language & Literature';
        }
        return selectedLevel === 'ssc'
          ? 'Bangla, English, General Mathematics, ICT, Religion & Physical Education'
          : 'Bangla 1st & 2nd, English 1st & 2nd, and ICT';
      }
      if (selectedStream === 'optional') {
        return 'Environmental Management, Computer Science, Global Perspectives and Electives';
      }
      if (selectedStream === 'my_stream') {
        return `Full syllabus for ${getUserStreamNameBn(userStream)} and all core compulsory subjects`;
      }
      return 'All core curriculum and elective courses';
    }

    if (selectedStream === 'science') {
      return selectedLevel === 'ssc'
        ? 'পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান, উচ্চতর গণিত ও বাংলাদেশ ও বিশ্বপরিচয় (BGS)'
        : 'পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান (উদ্ভিদবিজ্ঞান ও প্রাণিবিজ্ঞান) এবং উচ্চতর গণিত (১ম ও ২য় পত্র)';
    }
    if (selectedStream === 'commerce') {
      return selectedLevel === 'ssc'
        ? 'হিসাববিজ্ঞান, ফিন্যান্স ও ব্যাংকিং, ব্যবসায় উদ্যোগ ও সাধারণ বিজ্ঞান'
        : 'হিসাববিজ্ঞান, ব্যবসায় সংগঠন ও ব্যবস্থাপনা, ফিন্যান্স ব্যাংকিং ও বীমা, উৎপাদন ব্যবস্থাপনা ও বিপণন';
    }
    if (selectedStream === 'humanities') {
      return selectedLevel === 'ssc'
        ? 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা, পৌরনীতি ও নাগরিকতা, ভূগোল ও পরিবেশ, সাধারণ বিজ্ঞান ও অর্থনীতি'
        : 'পৌরনীতি ও সুশাসন, ইতিহাস/ইসলামের ইতিহাস ও সংস্কৃতি, ভূগোল, অর্থনীতি, যুক্তিবিদ্যা, সমাজবিজ্ঞান ও সমাজকর্ম';
    }
    if (selectedStream === 'common') {
      return selectedLevel === 'ssc'
        ? 'বাংলা (১ম ও ২য় পত্র), ইংরেজি (১ম ও ২য় পত্র), সাধারণ গণিত, আইসিটি, ইসলাম/ধর্ম ও শারীরিক শিক্ষা'
        : 'বাংলা (১ম ও ২য় পত্র), ইংরেজি (১ম ও ২য় পত্র) এবং তথ্য ও যোগাযোগ প্রযুক্তি (আইসিটি)';
    }
    if (selectedStream === 'optional') {
      return selectedLevel === 'ssc'
        ? 'কৃষি শিক্ষা, গার্হস্থ্য বিজ্ঞান ইত্যাদি ৪র্থ/ঐচ্ছিক বিষয়'
        : 'কৃষি শিক্ষা, গার্হস্থ্য বিজ্ঞান, পরিসংখ্যান, মনোবিজ্ঞান ইত্যাদি ৪র্থ/ঐচ্ছিক বিষয়';
    }
    if (selectedStream === 'my_stream') {
      return `${getUserStreamNameBn(userStream)} ও সকল আবশ্যিক বিষয়ের পূর্ণাঙ্গ বিষয়সূচি`;
    }
    return 'আবশ্যিক ও বিভাগভিত্তিক সকল পাঠ্যবই';
  };

  // Separation when viewing "my_stream"
  const myGroupSubjects = subjects.filter((s) => s.stream !== 'common');
  const myCompulsorySubjects = subjects.filter((s) => s.stream === 'common');

  const renderSubjectCard = (subject: Subject, idx: number) => {
    const badge = getStreamBadge(subject.stream);
    const isSubscribed = user?.role === 'admin' || user?.isSubscribed || subStatus?.isSubscribed;
    const isLocked = !isSubscribed && subStatus && !subStatus.canTakeExam;

    return (
      <motion.div
        key={subject.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(idx * 0.03, 0.3) }}
        whileHover={{ y: -4 }}
      >
        <Link to={`/subjects/${subject.id}`}>
          <Card className={`group transition-all cursor-pointer overflow-hidden border shadow-sm rounded-2xl h-full bg-white flex flex-col justify-between ${
            isLocked
              ? 'border-amber-200/80 hover:border-amber-400 hover:shadow-md'
              : 'border-slate-200 hover:border-blue-500 hover:shadow-lg'
          }`}>
            <CardHeader className="p-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${
                  isLocked
                    ? 'bg-amber-50 text-amber-600 border-amber-200 group-hover:bg-amber-600 group-hover:text-white'
                    : 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white'
                }`}>
                  {isLocked ? <Lock className="w-6 h-6" /> : <BookMarked className="w-6 h-6" />}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {subject.stream && (
                    <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold uppercase ${badge.bg}`}>
                      {badge.label}
                    </span>
                  )}
                  {isSubscribed ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      {isEnglishUi ? 'Free' : 'ফ্রি'}
                    </span>
                  ) : isLocked ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-600" />
                      {isEnglishUi ? 'Locked' : 'লকড'}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {isEnglishUi ? 'Free' : 'ফ্রি'}
                    </span>
                  )}
                </div>
              </div>

              <CardTitle className={`text-xl font-bold transition-colors line-clamp-1 ${
                isLocked ? 'text-slate-800 group-hover:text-amber-700' : 'text-slate-800 group-hover:text-blue-600'
              }`}>
                {isEnglishUi ? subject.name : subject.nameBn}
              </CardTitle>
              <p className="text-xs text-slate-400 font-sans mt-0.5 truncate">
                {isEnglishUi ? subject.nameBn : subject.name}
              </p>
            </CardHeader>

            <CardContent className="px-6 pb-6 pt-0">
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                <span>{isEnglishUi ? '20+ Model Tests' : '২০+ মডেল টেস্ট'}</span>
                {isLocked ? (
                  <div className="flex items-center text-amber-600 font-bold group-hover:translate-x-1 transition-transform">
                    <Lock className="w-3.5 h-3.5 mr-1" />
                    {isEnglishUi ? 'Locked' : 'লকড'} <ChevronRight className="w-4 h-4 ml-0.5" />
                  </div>
                ) : (
                  <div className="flex items-center text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
                    {isEnglishUi ? 'View Exams' : 'পরীক্ষাসমূহ'} <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    );
  };

  const getLevelDisplayName = (lvl: AcademicLevel) => {
    switch (lvl) {
      case 'alevel':
        return 'A Level';
      case 'olevel':
        return 'O Level / IGCSE';
      case 'dp':
        return 'IB DP';
      case 'myp':
        return 'IB MYP';
      case 'hsc':
        return isEnglishUi ? 'HSC (Grade 11-12)' : 'HSC (একাদশ-দ্বাদশ)';
      case 'ssc':
        return isEnglishUi ? 'SSC (Grade 9-10)' : 'SSC (নবম-দশম)';
      default:
        return String(lvl).toUpperCase();
    }
  };

  const renderCurriculumBadge = () => {
    switch (version) {
      case 'british':
        return (
          <>
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>British Curriculum (Edexcel / CAIE)</span>
          </>
        );
      case 'ib':
        return (
          <>
            <Compass className="w-3.5 h-3.5 text-purple-500" />
            <span>IB World School (MYP & DP)</span>
          </>
        );
      case 'english':
        return (
          <>
            <Globe2 className="w-3.5 h-3.5 text-blue-500" />
            <span>NCTB English Version</span>
          </>
        );
      case 'bangla':
      default:
        return (
          <>
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>NCTB বাংলা ভার্সন</span>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Top Header with Quick Practice Summary & Profile Link */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isEnglishUi ? 'Online Practice Arena' : 'অনলাইন অনুশীলন ও মডেল টেস্ট'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {isEnglishUi ? 'Practice Dashboard' : 'অনুশীলন ড্যাশবোর্ড'}
            </h1>
            <p className="text-slate-500 text-sm sm:text-base mt-0.5">
              {isEnglishUi
                ? 'Select your subjects and prepare with comprehensive chapter tests and board questions.'
                : 'তোমার নির্ধারিত সিলেবাসের বিষয়ভিত্তিক অধ্যায় ও বিগত বছরের বোর্ড প্রশ্নাবলি অনুশীলন করো।'}
            </p>
          </div>

          {/* Right Progress Summary Small Cards */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 shrink-0">
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-center transition-all hover:shadow-md hover:border-blue-200">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center mx-auto mb-1 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="text-base sm:text-lg font-bold text-slate-900 font-sans">
                  {isEnglishUi ? stats.completedExams.toString() : `${toBnNumber(stats.completedExams)}টি`}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {isEnglishUi ? 'Completed' : 'সমাপ্ত পরীক্ষা'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center transition-all hover:shadow-md hover:border-emerald-200">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center mx-auto mb-1 shadow-sm">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
                <div className="text-base sm:text-lg font-bold text-slate-900 font-sans">
                  {isEnglishUi ? `${stats.avgScore}%` : `${toBnNumber(stats.avgScore)}%`}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {isEnglishUi ? 'Avg Score' : 'গড় স্কোর'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 text-center transition-all hover:shadow-md hover:border-amber-200">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center mx-auto mb-1 shadow-sm">
                  <Flame className="w-3.5 h-3.5" />
                </div>
                <div className="text-base sm:text-lg font-bold text-slate-900 font-sans">
                  {isEnglishUi
                    ? `${stats.streakDays}d`
                    : `${toBnNumber(stats.streakDays)} দিন`}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {isEnglishUi ? 'Streak 🔥' : 'স্ট্রিক 🔥'}
                </div>
              </div>

              {/* Subscription Status Card */}
              <Link
                to="/subscription"
                className={`p-3 rounded-2xl border text-center transition-all hover:shadow-md block ${
                  user?.isSubscribed || subStatus?.isSubscribed
                    ? 'bg-teal-50/80 border-teal-200 hover:border-teal-300'
                    : 'bg-orange-50/80 border-orange-200 hover:border-orange-300'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1 shadow-sm text-white ${
                    user?.isSubscribed || subStatus?.isSubscribed
                      ? 'bg-teal-600'
                      : 'bg-orange-500'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="text-base sm:text-lg font-bold text-slate-900 font-sans">
                  {user?.isSubscribed || subStatus?.isSubscribed
                    ? 'PRO'
                    : `${subStatus ? subStatus.freeTestsRemaining : 3}/3`}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {user?.isSubscribed || subStatus?.isSubscribed
                    ? (isEnglishUi ? 'Unlimited' : 'আনলিমিটেড')
                    : (isEnglishUi ? 'Free Tests' : 'ফ্রি টেস্ট বাকি')}
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Free Quota Notice if student has not subscribed yet */}
        {subStatus && !subStatus.isSubscribed && user?.role !== 'admin' && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-extrabold flex flex-col items-center justify-center shadow-sm shrink-0 font-sans">
                <span className="text-base leading-none">{subStatus.freeTestsUsed}</span>
                <span className="text-[9px] uppercase tracking-tighter opacity-90">of 3 used</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                    {isEnglishUi ? '3 Free Tests Policy' : '৩টি ফ্রি টেস্ট নীতি'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {subStatus.canTakeExam
                      ? isEnglishUi
                        ? `${subStatus.freeTestsRemaining} test(s) left`
                        : `${subStatus.freeTestsRemaining}টি টেস্ট ফ্রি বাকি আছে`
                      : isEnglishUi
                        ? 'Quota reached'
                        : 'কোটা সমাপ্ত'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {subStatus.canTakeExam
                    ? isEnglishUi
                      ? 'You can attempt any 3 tests across the entire platform before subscribing.'
                      : 'বোর্ড প্রশ্ন বা যেকোনো বিষয়ের মোট ৩টি পরীক্ষা বিনামূল্যে দিতে পারবে।'
                    : isEnglishUi
                      ? 'You have reached your 3 free tests limit. Subscribe for unlimited access.'
                      : 'তোমার ৩টি ফ্রি টেস্ট শেষ হয়েছে। বাকি সব পরীক্ষা দিতে সাবস্ক্রিপশন গ্রহণ করো।'}
                </h3>
              </div>
            </div>
            <Link to="/subscription" className="shrink-0">
              <Button className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl text-xs gap-1.5 shadow-md shadow-amber-500/20 px-4 py-2.5 h-auto cursor-pointer">
                <Sparkles className="w-4 h-4" />
                {isEnglishUi ? 'View Subscription Plans' : 'সাবস্ক্রিপশন প্যাকেজ দেখুন'}
              </Button>
            </Link>
          </div>
        )}

        {/* Top Banner Image with a_boy_reading.png */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-md h-[220px] sm:h-[260px] bg-slate-900">
          <img
            src="/web_desgin_images/a_boy_reading.png"
            alt="Student studying"
            className="w-full h-full object-cover object-center opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent flex items-center p-6 sm:p-10">
            <div className="max-w-md text-white">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200 text-xs font-semibold mb-2 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {isEnglishUi
                  ? `${selectedLevel.toUpperCase()} Exam Preparation`
                  : `${selectedLevel.toUpperCase()} বোর্ড প্রস্তুতি`}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
                {isEnglishUi ? 'Consistent Practice, Outstanding Results' : 'নিয়মিত অনুশীলন, ভালো ফলাফল'}
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mb-4 line-clamp-2">
                {isEnglishUi
                  ? "Test your knowledge with today's scheduled model test and track your preparation."
                  : 'আজকের নির্ধারিত মডেল টেস্ট দিয়ে নিজের প্রস্তুতি যাচাই করে নাও।'}
              </p>
              {subjects.length > 0 && (
                <Link to={`/subjects/${subjects[0].id}`}>
                  <Button className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md gap-2 cursor-pointer">
                    {isEnglishUi ? 'Start Practice Test' : 'আজকের টেস্ট শুরু করো'} <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Section: Academic Level & Stream Filter Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            {/* Locked Academic Level Display — read-only, cannot be changed after signup */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md select-none">
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span>{getLevelDisplayName(selectedLevel)}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 select-none">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                {isEnglishUi ? 'Locked — set during registration' : 'লক — নিবন্ধনের সময় নির্ধারিত'}
              </div>
            </div>
          </div>

          {/* Group / Stream Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 text-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              {isEnglishUi ? 'Filter:' : 'ফিল্টার:'}
            </span>

            {/* All My Subjects */}
            <button
              type="button"
              onClick={() => setSelectedStream('my_stream')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${selectedStream === 'my_stream' || selectedStream === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-blue-200 text-blue-700 hover:bg-blue-50'
                }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              {isEnglishUi
                ? `All My Subjects (${getUserStreamNameBn(userStream).split(' ')[0]})`
                : `আমার সকল বিষয় (${getUserStreamNameBn(userStream).split(' ')[0]})`}
            </button>

            {/* Core Stream Group */}
            <button
              type="button"
              onClick={() => setSelectedStream('stream_core')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${selectedStream === 'stream_core'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              {getUserStreamNameBn(userStream)}
            </button>

            {/* Compulsory Option */}
            <button
              type="button"
              onClick={() => setSelectedStream('common')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${selectedStream === 'common'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              {isEnglishUi ? 'Core Compulsory' : 'আবশ্যিক বিষয় (Compulsory)'}
            </button>

            {/* Optional Option */}
            <button
              type="button"
              onClick={() => setSelectedStream('optional')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${selectedStream === 'optional'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {isEnglishUi ? 'Optional Subjects' : 'ঐচ্ছিক বিষয় (Optional)'}
            </button>
          </div>
        </div>

        {/* Section: Continue where you left off - Vibrant Animated Gradient Rim & Rounded Motion Design */}
        {(() => {
          const act = recentActivity?.activity;
          if (!act && subjects.length === 0) return null;

          const isOngoing = act?.status === 'ongoing';
          const isCompleted = act?.status === 'completed';

          const examTitle = act?.examTitle || (isEnglishUi ? 'Model Test 1' : 'মডেল টেস্ট ১');
          const subjectTitle = act
            ? (isEnglishUi ? act.subjectName : act.subjectNameBn)
            : (subjects[0] ? (isEnglishUi ? subjects[0].name : subjects[0].nameBn) : '');
          const questionCount = act?.questionCount || 10;
          const durationMinutes = act?.durationMinutes || 15;
          const recentScore = act?.score;
          const totalMarks = act?.totalMarks || 25;
          const targetLink = act
            ? `/exam/${act.examId}/start`
            : (subjects[0] ? `/subjects/${subjects[0].id}` : '/dashboard');

          return (
            <div className="relative rounded-[32px] p-[2.5px] bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 shadow-xl shadow-emerald-950/10 hover:shadow-emerald-700/20 transition-all duration-500 overflow-hidden group">
              {/* Inner Card Container with crisp white background & soft brand accents */}
              <div className="rounded-[30px] bg-white p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
                {/* Background Subtle Ambient Brand Glows */}
                <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-emerald-100/40 blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
                <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-teal-100/30 blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />

                {/* Content area */}
                <div className="flex items-start sm:items-center gap-4 sm:gap-5 relative z-10">
                  {/* Pulsating Play Squircle with brand emerald glow matching the logo's graduation cap */}
                  <div className="relative shrink-0 flex items-center justify-center">
                    <span className="absolute -inset-1.5 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 opacity-60 blur-xs group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 animate-pulse" />
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#006837] via-[#047857] to-[#059669] text-white flex items-center justify-center shadow-lg shadow-emerald-700/35 group-hover:rotate-3 transition-transform duration-300">
                      <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Text & Meta info */}
                  <div className="space-y-1.5">
                    {/* Eyebrow Pill with live blinking dot matching logo accents */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-black text-[11px] uppercase tracking-wider border shadow-xs ${
                      isOngoing
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-600/10 text-emerald-800 border-emerald-200/80'
                    }`}>
                      <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          isOngoing ? 'bg-rose-500' : 'bg-emerald-500'
                        }`} />
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${
                          isOngoing ? 'bg-rose-600' : 'bg-emerald-600'
                        }`} />
                      </span>
                      <span>
                        {isOngoing
                          ? (isEnglishUi ? `Ongoing Exam (${selectedLevel.toUpperCase()})` : `চলমান পরীক্ষা (${selectedLevel.toUpperCase()})`)
                          : isCompleted
                          ? (isEnglishUi ? `Continue Where You Left Off (${selectedLevel.toUpperCase()})` : `যেখান থেকে শেষ করেছিলে (${selectedLevel.toUpperCase()})`)
                          : (isEnglishUi ? `Recommended Starter (${selectedLevel.toUpperCase()})` : `প্রস্তাবিত টেস্ট (${selectedLevel.toUpperCase()})`)}
                      </span>
                    </div>

                    {/* Exam & Subject Title */}
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                      {subjectTitle} — <span className="text-emerald-900">{examTitle}</span>
                    </h3>

                    {/* Metadata Chips: Questions, Time, Score */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/90 text-slate-700 text-xs font-semibold border border-slate-200/80 shadow-xs">
                        <HelpCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {toBnNumber(questionCount)} {isEnglishUi ? 'Questions' : 'টি প্রশ্ন'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/90 text-slate-700 text-xs font-semibold border border-slate-200/80 shadow-xs">
                        <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        {toBnNumber(durationMinutes)} {isEnglishUi ? 'Minutes' : 'মিনিট'}
                      </span>
                      {recentScore !== undefined && recentScore !== null && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200/80 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          {isEnglishUi ? 'Recent Score:' : 'সর্বশেষ স্কোর:'} {toBnNumber(recentScore)}/{toBnNumber(totalMarks)}
                        </span>
                      )}
                      {isOngoing && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
                          <Zap className="w-3 h-3 text-rose-600 animate-bounce" />
                          {isEnglishUi ? 'In Progress' : 'চলমান'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center relative z-10 w-full sm:w-auto justify-end">
                  {act?.attemptId && isCompleted && (
                    <Link to={`/exam/${act.attemptId}/result`}>
                      <Button
                        variant="outline"
                        className="h-11 px-4 rounded-xl border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-xs gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        <span>{isEnglishUi ? 'View Result' : 'ফলাফল দেখুন'}</span>
                      </Button>
                    </Link>
                  )}

                  <Link to={targetLink}>
                    <button
                      type="button"
                      className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#006837] via-[#047857] to-[#059669] hover:from-[#005a30] hover:to-[#047857] text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-700/25 hover:shadow-lg hover:shadow-emerald-700/35 flex items-center gap-2 cursor-pointer transition-all duration-300 group/btn"
                    >
                      <span>
                        {isOngoing
                          ? (isEnglishUi ? 'Resume Exam' : 'চালিয়ে যাও')
                          : isCompleted
                          ? (isEnglishUi ? 'Practice Again' : 'আবার টেস্ট দাও')
                          : (isEnglishUi ? 'Start Practice' : 'টেস্ট শুরু করো')}
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })()}
        {/* Gateway Banner Card to Dedicated Board Questions Page */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-blue-900/60">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center shrink-0 shadow-inner">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/30 text-blue-200 text-[11px] font-bold mb-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                {version === 'british'
                  ? 'Official CAIE & Edexcel Archive (2020 - 2025)'
                  : version === 'ib'
                    ? 'Official IB Assessment Papers (2021 - 2025)'
                    : 'বিগত বছরের বোর্ড প্রশ্ন ব্যাংক (২০১৬ - ২০২৫)'}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {version === 'british'
                  ? 'Cambridge & Edexcel Past Question Papers'
                  : version === 'ib'
                    ? 'IB DP & MYP Past Assessment Papers'
                    : 'এইচএসসি ও এসএসসি বিগত বছরের বোর্ড প্রশ্নাবলি'}
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm">
                {isEnglishUi
                  ? 'Practice official past questions with real timers, verified marking schemes and instant performance analysis.'
                  : 'সকল শিক্ষা বোর্ডের বিগত বছরের প্রশ্নপত্র সময় ধরে পরীক্ষা দাও ও ব্যাখ্যাসহ নির্ভুল উত্তর জেনে নাও।'}
              </p>
            </div>
          </div>
          <Link to="/board-questions" className="shrink-0 w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm gap-2 shadow-sm cursor-pointer">
              <span>{isEnglishUi ? 'Browse Past Papers' : 'বোর্ড প্রশ্নাবলি দেখুন'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Section: Subjects Grid */}
        <div className="space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-white border border-slate-200 rounded-2xl" />
              ))}
            </div>
          ) : subjects.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {isEnglishUi ? 'No Subjects Found' : 'কোনো বিষয় পাওয়া যায়নি'}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {isEnglishUi
                  ? 'Try selecting another stream or curriculum level above.'
                  : 'অন্য কোনো বিভাগ বা ভার্সন নির্বাচন করে দেখতে পারেন।'}
              </p>
            </div>
          ) : selectedStream === 'my_stream' ? (
            // Two-section clean layout for My Stream
            <div className="space-y-10">
              {/* 1. Group Specific Subjects */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                      <span>
                        {getShortLevelName(selectedLevel)} {getUserStreamNameBn(userStream)} {isEnglishUi ? 'Courses' : 'বিষয়সমূহ'}
                      </span>
                      <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {isEnglishUi ? `${myGroupSubjects.length} Courses` : `${myGroupSubjects.length}টি`}
                      </span>
                    </h2>
                    <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                      {getStreamDescription()}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myGroupSubjects.map((subject, idx) => renderSubjectCard(subject, idx))}
                </div>
              </div>

              {/* 2. Compulsory / Common Subjects */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                      <span>
                        {getShortLevelName(selectedLevel)} {isEnglishUi ? 'Compulsory Core Subjects' : 'আবশ্যিক বিষয়সমূহ (সবার জন্য বাধ্যতামূলক)'}
                      </span>
                      <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                        {isEnglishUi ? `${myCompulsorySubjects.length} Courses` : `${myCompulsorySubjects.length}টি`}
                      </span>
                    </h2>
                    <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                      {isEnglishUi
                        ? selectedLevel === 'alevel'
                          ? 'English General Paper, Global Perspectives & Research, Thinking Skills and Information Technology'
                          : selectedLevel === 'olevel'
                            ? 'Bengali, English Language, Mathematics (Syllabus D) and Information & Communication Technology'
                            : selectedLevel === 'dp'
                              ? 'Theory of Knowledge (TOK), English A: Language & Literature, Extended Essay and Environmental Systems'
                              : selectedLevel === 'myp'
                                ? 'Mathematics, Language Acquisition (English) and Language & Literature'
                                : 'English Language, Literature, Core Mathematics and Information Technology'
                        : selectedLevel === 'ssc'
                          ? 'বাংলা, ইংরেজি, সাধারণ গণিত, আইসিটি, ধর্ম ও শারীরিক শিক্ষা'
                          : 'বাংলা ১ম ও ২য় পত্র, ইংরেজি ১ম ও ২য় পত্র এবং তথ্য ও যোগাযোগ প্রযুক্তি (আইসিটি)'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myCompulsorySubjects.map((subject, idx) => renderSubjectCard(subject, idx))}
                </div>
              </div>
            </div>
          ) : (
            // Dedicated Single Filter view showing JUST the selected option's subjects
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <span>
                      {getShortLevelName(selectedLevel)} {
                        selectedStream === 'science'
                          ? (isEnglishUi ? 'Science Stream Courses' : 'বিজ্ঞান বিভাগের বিষয়সমূহ')
                          : selectedStream === 'commerce'
                            ? (isEnglishUi ? 'Business Studies Courses' : 'ব্যবসায় শিক্ষা বিভাগের বিষয়সমূহ')
                            : selectedStream === 'humanities'
                              ? (isEnglishUi ? 'Humanities & Arts Courses' : 'মানবিক বিভাগের বিষয়সমূহ')
                              : selectedStream === 'common'
                                ? (isEnglishUi ? 'Core Compulsory Courses' : 'আবশ্যিক বিষয়সমূহ (Compulsory)')
                                : selectedStream === 'optional'
                                  ? (isEnglishUi ? 'Elective / Optional Courses' : 'ঐচ্ছিক / ৪র্থ বিষয়সমূহ (Optional)')
                                  : (isEnglishUi ? 'All Available Courses' : 'সকল বিষয়সমূহ')
                      }
                    </span>
                    <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {isEnglishUi ? `${subjects.length} Courses` : `${subjects.length}টি`}
                    </span>
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                    {getStreamDescription()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject, idx) => renderSubjectCard(subject, idx))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
