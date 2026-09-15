import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Subject, Exam, CurriculumVersion, AcademicLevel } from '@/src/types';
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
} from 'lucide-react';
import { motion } from 'motion/react';
import { apiJson } from '@/src/lib/api';
import { useAuthStore } from '@/src/lib/authStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Board Questions State
  const [boardExams, setBoardExams] = useState<Exam[]>([]);
  const [boardStreamFilter, setBoardStreamFilter] = useState<'all' | 'science' | 'commerce' | 'humanities' | 'common'>('all');
  const [boardYearFilter, setBoardYearFilter] = useState<number | 'all'>(2025);
  const [boardSpecificFilter, setBoardSpecificFilter] = useState<string>('all');
  const [loadingBoardExams, setLoadingBoardExams] = useState(false);
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({});

  const toggleYearExpanded = (year: number) => {
    setExpandedYears((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  };

  useEffect(() => {
    if (user?.academicLevel) {
      setSelectedLevel(user.academicLevel);
    } else {
      setSelectedLevel(getDefaultLevelForVersion(version));
    }
  }, [user?.academicLevel, version]);

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

        if (selectedStream === 'my_stream') {
          queryParams.set('stream', userStream);
          queryParams.set('include_common', 'true');
        } else if (selectedStream !== 'all') {
          queryParams.set('stream', selectedStream);
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

  // Fetch Board Question Exams
  useEffect(() => {
    const fetchBoardExams = async () => {
      setLoadingBoardExams(true);
      try {
        const data = await apiJson<Exam[]>(`/api/exams?academicLevel=${selectedLevel}&examType=board_question&version=${version}`);
        const examList = data || [];
        setBoardExams(examList);

        // Auto-select the latest available year (e.g. 2025)
        const years = Array.from(
          new Set(examList.map((e) => e.examYear).filter((y): y is number => typeof y === 'number'))
        ).sort((a, b) => b - a);

        if (years.length > 0) {
          setBoardYearFilter((prev) => (typeof prev === 'number' && years.includes(prev) ? prev : years[0]));
        }
      } catch (err) {
        console.error('Failed to load board exams:', err);
      } finally {
        setLoadingBoardExams(false);
      }
    };
    fetchBoardExams();
  }, [selectedLevel, version]);

  // Extract distinct years and boards available for selected level
  const availableBoardYears = Array.from(
    new Set(boardExams.map((e) => e.examYear).filter((y): y is number => typeof y === 'number'))
  ).sort((a, b) => b - a);

  const availableBoards = Array.from(
    new Set(boardExams.map((e) => e.boardName).filter((b): b is string => Boolean(b)))
  );

  const filteredBoardExams = boardExams.filter((exam) => {
    if (boardStreamFilter !== 'all' && exam.subjectStream !== boardStreamFilter) return false;
    if (boardYearFilter !== 'all' && exam.examYear !== boardYearFilter) return false;
    if (boardSpecificFilter !== 'all' && exam.boardName !== boardSpecificFilter) return false;
    return true;
  });

  // Group filtered exams by Year
  const groupedBoardExamsByYear = availableBoardYears.reduce<Record<number, Exam[]>>((acc, yr) => {
    const matched = filteredBoardExams.filter((e) => e.examYear === yr);
    if (matched.length > 0) {
      acc[yr] = matched;
    }
    return acc;
  }, {});

  // Quick switch level and persist to user profile
  const handleLevelChange = async (level: AcademicLevel) => {
    setSelectedLevel(level);
    if (user) {
      try {
        await apiJson('/api/user/curriculum-version', {
          method: 'PUT',
          body: JSON.stringify({ academicLevel: level }),
        });
        useAuthStore.getState().setAcademicLevel(level);
      } catch (err) {
        console.error('Failed to update academic level:', err);
      }
    }
  };

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
    return (
      <motion.div
        key={subject.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(idx * 0.03, 0.3) }}
        whileHover={{ y: -4 }}
      >
        <Link to={`/subjects/${subject.id}`}>
          <Card className="group hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer overflow-hidden border-slate-200 shadow-sm rounded-2xl h-full bg-white flex flex-col justify-between">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <BookMarked className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {subject.stream && (
                    <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold uppercase ${badge.bg}`}>
                      {badge.label}
                    </span>
                  )}
                  {Number(subject.unlockPrice) === 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {isEnglishUi ? 'Free' : 'ফ্রি'}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                      {isEnglishUi ? 'Premium' : 'প্রিমিয়াম'}
                    </span>
                  )}
                </div>
              </div>

              <CardTitle className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                {isEnglishUi ? subject.name : subject.nameBn}
              </CardTitle>
              <p className="text-xs text-slate-400 font-sans mt-0.5 truncate">
                {isEnglishUi ? subject.nameBn : subject.name}
              </p>
            </CardHeader>

            <CardContent className="px-6 pb-6 pt-0">
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                <span>{isEnglishUi ? '20+ Model Tests' : '২০+ মডেল টেস্ট'}</span>
                <div className="flex items-center text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
                  {isEnglishUi ? 'View Exams' : 'পরীক্ষাসমূহ'} <ChevronRight className="w-4 h-4 ml-1" />
                </div>
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
        {/* Top Welcome Header with Progress Cards */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
              <span className="font-bold uppercase tracking-wider">{selectedLevel.toUpperCase()}</span>
              <span>•</span>
              <span className="font-medium">{getUserStreamNameBn(userStream)}</span>
              <span>•</span>
              {renderCurriculumBadge()}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              {isEnglishUi ? (
                <>Welcome, <span className="text-blue-600">{user?.fullName || 'Student'}</span>!</>
              ) : (
                <>স্বাগতম, <span className="text-blue-600">{user?.fullName || 'শিক্ষার্থী'}</span>!</>
              )}
            </h1>
            <p className="text-slate-500 text-base sm:text-lg mt-1">
              {isEnglishUi
                ? `Ready to practice today? Ensure comprehensive preparation for your ${selectedLevel.toUpperCase()} examinations.`
                : `আজ কী অনুশীলন করতে চাও? ${selectedLevel.toUpperCase()} বোর্ড পরীক্ষায় নিশ্চিত করো পূর্ণাঙ্গ প্রস্তুতি।`}
            </p>
          </div>

          {/* Right Progress Summary Small Cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 font-sans">
                {isEnglishUi ? '5' : '৫টি'}
              </div>
              <div className="text-[11px] text-slate-500">
                {isEnglishUi ? 'Completed' : 'পরীক্ষা দিয়েছো'}
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-1.5 shadow-sm">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 font-sans">
                {isEnglishUi ? '82%' : '৮২%'}
              </div>
              <div className="text-[11px] text-slate-500">
                {isEnglishUi ? 'Avg Score' : 'গড় স্কোর'}
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-100 text-center">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center mx-auto mb-1.5 shadow-sm">
                <Flame className="w-4 h-4" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 font-sans">
                {isEnglishUi ? '3 Days' : '৩ দিন'}
              </div>
              <div className="text-[11px] text-slate-500">
                {isEnglishUi ? 'Streak 🔥' : 'স্ট্রিক 🔥'}
              </div>
            </div>
          </div>
        </header>

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
            {/* Dynamic Academic Level Switcher Buttons */}
            <div className="flex items-center p-1.5 bg-slate-200/70 rounded-2xl border border-slate-300/70">
              {version === 'british' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleLevelChange('alevel')}
                    className={`px-6 py-2 rounded-xl text-base font-bold transition-all cursor-pointer ${selectedLevel === 'alevel'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 hover:text-slate-900'
                      }`}
                  >
                    A Level (Grade 11-12)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLevelChange('olevel')}
                    className={`px-6 py-2 rounded-xl text-base font-bold transition-all cursor-pointer ${selectedLevel === 'olevel'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 hover:text-slate-900'
                      }`}
                  >
                    O Level / IGCSE (Grade 9-10)
                  </button>
                </>
              ) : version === 'ib' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleLevelChange('dp')}
                    className={`px-6 py-2 rounded-xl text-base font-bold transition-all cursor-pointer ${selectedLevel === 'dp'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 hover:text-slate-900'
                      }`}
                  >
                    IB DP (Diploma Programme)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLevelChange('myp')}
                    className={`px-6 py-2 rounded-xl text-base font-bold transition-all cursor-pointer ${selectedLevel === 'myp'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 hover:text-slate-900'
                      }`}
                  >
                    IB MYP (Middle Years)
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleLevelChange('hsc')}
                    className={`px-6 py-2 rounded-xl text-base font-bold transition-all cursor-pointer ${selectedLevel === 'hsc'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 hover:text-slate-900'
                      }`}
                  >
                    {isEnglishUi ? 'HSC (Grade 11-12)' : 'HSC (একাদশ-দ্বাদশ)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLevelChange('ssc')}
                    className={`px-6 py-2 rounded-xl text-base font-bold transition-all cursor-pointer ${selectedLevel === 'ssc'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 hover:text-slate-900'
                      }`}
                  >
                    {isEnglishUi ? 'SSC (Grade 9-10)' : 'SSC (নবম-দশম)'}
                  </button>
                </>
              )}
            </div>

            <Link
              to="/select-version"
              className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 transition-colors shadow-xs inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              {isEnglishUi ? 'Switch Curriculum & Stream' : 'কারিকুলাম ও বিভাগ পরিবর্তন'}
            </Link>
          </div>

          {/* Group / Stream Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 text-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              {isEnglishUi ? 'Filter:' : 'ফিল্টার:'}
            </span>

            {/* My Stream Personalized Option */}
            <button
              type="button"
              onClick={() => setSelectedStream('my_stream')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${selectedStream === 'my_stream'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-blue-200 text-blue-700 hover:bg-blue-50'
                }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              {isEnglishUi
                ? `My Stream (${getUserStreamNameBn(userStream).split(' ')[0]})`
                : `আমার পাঠ্যসূচি (${getUserStreamNameBn(userStream).split(' ')[0]})`}
            </button>

            {/* Science Option */}
            <button
              type="button"
              onClick={() => setSelectedStream('science')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${selectedStream === 'science'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              {isEnglishUi ? 'Science' : 'বিজ্ঞান বিভাগ (Science)'}
            </button>

            {/* Commerce Option */}
            <button
              type="button"
              onClick={() => setSelectedStream('commerce')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${selectedStream === 'commerce'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {isEnglishUi ? 'Business Studies' : 'ব্যবসায় শিক্ষা (Commerce)'}
            </button>

            {/* Humanities Option */}
            <button
              type="button"
              onClick={() => setSelectedStream('humanities')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${selectedStream === 'humanities'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {isEnglishUi ? 'Humanities' : 'মানবিক বিভাগ (Humanities)'}
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

            {/* Optional 4th Subject Option */}
            <button
              type="button"
              onClick={() => setSelectedStream('optional')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${selectedStream === 'optional'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              {isEnglishUi ? 'Electives' : 'ঐচ্ছিক বিষয় (Optional)'}
            </button>

            {/* All Option */}
            <button
              type="button"
              onClick={() => setSelectedStream('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${selectedStream === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
            >
              {isEnglishUi ? 'All Subjects' : 'সকল বিষয়'}
            </button>
          </div>
        </div>

        {/* Section: Continue where you left off */}
        {subjects.length > 0 && (
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <PlayCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  {isEnglishUi
                    ? `Continue Where You Left Off (${selectedLevel.toUpperCase()})`
                    : `যেখান থেকে শেষ করেছিলে (${selectedLevel.toUpperCase()})`}
                </div>
                <div className="text-lg font-bold text-slate-900">
                  {isEnglishUi ? subjects[0].name : subjects[0].nameBn} — {isEnglishUi ? 'Model Test 1' : 'মডেল টেস্ট ১'}
                </div>
                <div className="text-xs text-slate-500">
                  {isEnglishUi
                    ? '10 Questions • 15 Minutes • Recent Score: 8/10'
                    : '১০টি প্রশ্ন • ১৫ মিনিট • সর্বশেষ স্কোর: ৮/১০'}
                </div>
              </div>
            </div>
            <Link to={`/subjects/${subjects[0].id}`}>
              <Button variant="outline" className="rounded-xl font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-300 gap-1.5 cursor-pointer">
                {isEnglishUi ? 'Continue' : 'চালিয়ে যাও'} <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}

        {/* Section: Past Board / Examination Papers Archive */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
          {/* Header Title & Subtitle Area (Spacious & Refined) */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700 text-xs font-bold">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              {version === 'british'
                ? `Past Papers Archive • ${selectedLevel === 'alevel' ? 'A Level' : 'O Level'} (2020 - 2025)`
                : version === 'ib'
                  ? `IB Past Assessments • ${selectedLevel === 'dp' ? 'IB DP' : 'IB MYP'} (2021 - 2025)`
                  : version === 'english'
                    ? `Board Question Bank • ${selectedLevel.toUpperCase()} (2018 - 2025)`
                    : `বোর্ড প্রশ্ন ব্যাংক • ${selectedLevel.toUpperCase()} (২০১৬ - ২০২৫)`}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3 flex-wrap">
              <span>
                {version === 'british'
                  ? `${selectedLevel === 'alevel' ? 'A Level' : 'O Level'} Cambridge & Edexcel Past Question Papers`
                  : version === 'ib'
                    ? `${selectedLevel === 'dp' ? 'IB DP' : 'IB MYP'} Past Examination Papers & Markschemes`
                    : version === 'english'
                      ? `${selectedLevel.toUpperCase()} Past Board Examination Papers & Solutions`
                      : `${selectedLevel.toUpperCase()} বিগত বছরের বোর্ড পরীক্ষার প্রশ্ন ও সমাধান`}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {version === 'british'
                  ? 'CAIE & Edexcel Verified'
                  : version === 'ib'
                    ? 'IBO Verified Markschemes'
                    : isEnglishUi
                      ? 'Verified Answers & Explanations'
                      : 'ব্যাখ্যাসহ নির্ভুল উত্তরমালা'}
              </span>
            </h2>

            <p className="text-slate-500 text-xs sm:text-[12.5px] md:text-[13px] leading-relaxed max-w-4xl xl:max-w-5xl font-normal">
              {version === 'british'
                ? 'Practice official Cambridge Assessment International Education (CAIE) and Pearson Edexcel past question papers with verified answers and real-time timers.'
                : version === 'ib'
                  ? 'Practice official International Baccalaureate (IB) assessment papers with structured markschemes and real exam pacing.'
                  : isEnglishUi
                    ? 'Practice official board exam papers across Science, Business Studies, and Humanities with real-time timers and instant solutions.'
                    : 'বিজ্ঞান, ব্যবসায় শিক্ষা ও মানবিক বিভাগের সকল সাধারণ শিক্ষা বোর্ডের প্রশ্নপত্র সময় ধরে পরীক্ষা দিয়ে প্রস্তুতি নাও।'}
            </p>
          </div>

          {/* Filter Controls Bar: Stream Switcher Tabs & Exam Board Dropdown */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3.5 border-t border-slate-100">
            {/* Stream Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/70 overflow-x-auto text-xs shrink-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setBoardStreamFilter('all')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${boardStreamFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                {isEnglishUi ? `All Groups (${boardExams.length})` : `সব বিভাগ (${boardExams.length})`}
              </button>
              <button
                type="button"
                onClick={() => setBoardStreamFilter('science')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${boardStreamFilter === 'science'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-cyan-700'
                  }`}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                {isEnglishUi ? 'Science' : 'বিজ্ঞান'}
              </button>
              <button
                type="button"
                onClick={() => setBoardStreamFilter('commerce')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${boardStreamFilter === 'commerce'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-emerald-700'
                  }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {isEnglishUi ? 'Business Studies' : 'ব্যবসায় শিক্ষা'}
              </button>
              <button
                type="button"
                onClick={() => setBoardStreamFilter('humanities')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${boardStreamFilter === 'humanities'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-amber-700'
                  }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {isEnglishUi ? 'Humanities' : 'মানবিক'}
              </button>
              <button
                type="button"
                onClick={() => setBoardStreamFilter('common')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${boardStreamFilter === 'common'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-700'
                  }`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                {isEnglishUi ? 'Compulsory' : 'আবশ্যিক'}
              </button>
            </div>

            {/* Specific Board Dropdown / Selector */}
            {availableBoards.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-50/90 hover:bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/90 text-xs shrink-0 w-full sm:w-auto shadow-2xs transition-colors">
                <span className="text-slate-700 font-bold px-2 shrink-0 flex items-center gap-1.5 whitespace-nowrap">
                  <span className="p-1 rounded-lg bg-blue-100/70 text-blue-600 flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5" />
                  </span>
                  <span>
                    {version === 'british'
                      ? 'Exam Board:'
                      : version === 'ib'
                        ? 'Authority:'
                        : isEnglishUi
                          ? 'Board:'
                          : 'বোর্ড:'}
                  </span>
                </span>
                <select
                  value={boardSpecificFilter}
                  onChange={(e) => setBoardSpecificFilter(e.target.value)}
                  className="bg-white text-slate-800 font-medium rounded-xl px-3 py-1.5 border border-slate-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer text-xs w-full sm:w-auto min-w-[220px] transition-all"
                >
                  <option value="all">
                    {version === 'british'
                      ? 'All Exam Boards (CAIE & Edexcel)'
                      : version === 'ib'
                        ? 'International Baccalaureate (IB)'
                        : isEnglishUi
                          ? 'All Boards (8 General Boards)'
                          : 'সকল বোর্ড (৮টি সাধারণ বোর্ড)'}
                  </option>
                  {availableBoards.map((bName) => (
                    <option key={bName} value={bName}>
                      {bName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Year-wise Quick Navigation Tabs */}
          {availableBoardYears.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 text-xs border-b border-slate-100 pt-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {isEnglishUi ? 'Exam Year:' : 'পরীক্ষার সাল:'}
              </span>
              <button
                type="button"
                onClick={() => setBoardYearFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${boardYearFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {isEnglishUi
                  ? `All Years (${availableBoardYears[availableBoardYears.length - 1]} - ${availableBoardYears[0]})`
                  : `সকল সাল (${availableBoardYears[availableBoardYears.length - 1]} - ${availableBoardYears[0]})`}
              </button>
              {availableBoardYears.map((year) => {
                const countForYear = boardExams.filter((e) => e.examYear === year).length;
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setBoardYearFilter(year)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${boardYearFilter === year
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                  >
                    <span>{getShortLevelName(selectedLevel)} {year}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${boardYearFilter === year ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                      {countForYear}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Board Questions Cards Section (Year-Wise Grouped Display) */}
          {loadingBoardExams ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-44 bg-slate-100 rounded-2xl border border-slate-200" />
              ))}
            </div>
          ) : Object.keys(groupedBoardExamsByYear).length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
              <BookOpen className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-slate-500 text-sm">
                {isEnglishUi
                  ? 'No past examination questions found for the selected filter.'
                  : 'নির্বাচিত ফিল্টারে বর্তমানে কোনো বোর্ড প্রশ্ন পাওয়া যায়নি।'}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.keys(groupedBoardExamsByYear)
                .map(Number)
                .sort((a, b) => b - a)
                .map((year) => {
                  const examsInYear = groupedBoardExamsByYear[year];
                  const isExpanded = Boolean(expandedYears[year]);
                  const displayedExams = isExpanded ? examsInYear : examsInYear.slice(0, 4);

                  return (
                    <div key={year} className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                          <h3 className="text-lg font-bold text-slate-900">
                            {version === 'british'
                              ? `${selectedLevel === 'alevel' ? 'A Level' : 'O Level'} ${year} Past Question Papers`
                              : version === 'ib'
                                ? `${selectedLevel === 'dp' ? 'IB DP' : 'IB MYP'} ${year} Assessment Papers`
                                : version === 'english'
                                  ? `${selectedLevel.toUpperCase()} ${year} Board Examination Papers`
                                  : `${selectedLevel.toUpperCase()} ${year} বোর্ড পরীক্ষার প্রশ্নপত্র`}
                          </h3>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-sans">
                            {isEnglishUi ? `${examsInYear.length} Question Papers` : `${examsInYear.length}টি পরীক্ষা`}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 hidden sm:inline">
                          {version === 'british'
                            ? 'Cambridge Assessment (CAIE) & Pearson Edexcel Past Papers'
                            : version === 'ib'
                              ? 'International Baccalaureate Organization Assessment Series'
                              : isEnglishUi
                                ? '8 General Education Boards Questions & Solutions'
                                : '৮টি সাধারণ শিক্ষা বোর্ডের প্রশ্ন ও সমাধান'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {displayedExams.map((exam) => (
                          <div
                            key={exam.id}
                            className="group p-5 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-2.5">
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 font-sans uppercase">
                                  {(exam.academicLevel || selectedLevel).toUpperCase()} {exam.examYear || year}
                                </span>
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${exam.subjectStream === 'science'
                                    ? 'bg-cyan-100 text-cyan-800 border-cyan-200'
                                    : exam.subjectStream === 'commerce'
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                      : exam.subjectStream === 'humanities'
                                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                                        : 'bg-purple-100 text-purple-800 border-purple-200'
                                  }`}>
                                  {isEnglishUi
                                    ? (exam.subjectStream === 'science'
                                      ? 'Science'
                                      : exam.subjectStream === 'commerce'
                                        ? 'Business'
                                        : exam.subjectStream === 'humanities'
                                          ? 'Humanities'
                                          : 'Compulsory')
                                    : (exam.subjectStream === 'science'
                                      ? 'বিজ্ঞান'
                                      : exam.subjectStream === 'commerce'
                                        ? 'ব্যবসায় শিক্ষা'
                                        : exam.subjectStream === 'humanities'
                                          ? 'মানবিক'
                                          : 'আবশ্যিক')}
                                </span>
                              </div>

                              <div className="text-xs text-blue-700 font-bold mb-1 flex items-center gap-1">
                                <span>
                                  {version === 'british'
                                    ? `🇬🇧 ${exam.boardName || 'Cambridge CAIE'}`
                                    : version === 'ib'
                                      ? `🌐 ${exam.boardName || 'International Baccalaureate'}`
                                      : `🏛️ ${exam.boardName || (isEnglishUi ? 'Dhaka Board' : 'ঢাকা বোর্ড')}`}
                                </span>
                              </div>

                              <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-3">
                                {exam.title}
                              </h4>

                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-4">
                                <span className="inline-flex items-center gap-1 font-medium bg-white px-2 py-1 rounded-md border border-slate-200">
                                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                                  {exam.durationMinutes} {isEnglishUi ? 'mins' : 'মিনিট'}
                                </span>
                                <span className="inline-flex items-center gap-1 font-medium bg-white px-2 py-1 rounded-md border border-slate-200">
                                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                                  {exam.totalMarks} {isEnglishUi ? 'MCQs' : 'টি MCQ'}
                                </span>
                              </div>
                            </div>

                            <Link to={`/subjects/${exam.subjectId}`}>
                              <Button className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 shadow-xs cursor-pointer">
                                {version === 'ib'
                                  ? 'Start Assessment'
                                  : isEnglishUi
                                    ? 'Start Exam Paper'
                                    : 'পরীক্ষা শুরু করো'} <ArrowRight className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>

                      {/* Show More / Show Less Button */}
                      {examsInYear.length > 4 && (
                        <div className="flex justify-center pt-2">
                          <button
                            type="button"
                            onClick={() => toggleYearExpanded(year)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 hover:text-blue-800 font-bold text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                          >
                            {isExpanded ? (
                              <>
                                <span>{isEnglishUi ? 'Show Less (First 4 only)' : 'সংক্ষেপ করুন (প্রথম ৪টি দেখান)'}</span>
                                <ChevronUp className="w-4 h-4 text-blue-600" />
                              </>
                            ) : (
                              <>
                                <span>
                                  {isEnglishUi
                                    ? `Show More (${examsInYear.length - 4} questions remaining)`
                                    : `আরও দেখুন (${examsInYear.length - 4}টি প্রশ্ন বাকি)`}
                                </span>
                                <ChevronDown className="w-4 h-4 text-blue-600" />
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </section>

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
