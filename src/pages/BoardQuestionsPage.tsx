import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/src/components/layout/Navbar';
import { useAuthStore } from '@/src/lib/authStore';
import { apiJson } from '@/src/lib/api';
import { Exam, CurriculumVersion, AcademicLevel, UserSubscriptionStatus } from '@/src/types';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  BookOpen,
  Building2,
  Sparkles,
  Search,
  Award,
  Compass,
  Globe2,
  PlayCircle,
  FileCheck2,
  Filter,
  Lock,
} from 'lucide-react';
import SubscriptionModal from '@/src/components/subscription/SubscriptionModal';

export const BoardQuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
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
  const selectedLevel = user?.academicLevel || getDefaultLevelForVersion(version);

  const [boardExams, setBoardExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [boardStreamFilter, setBoardStreamFilter] = useState<'all' | 'science' | 'commerce' | 'humanities' | 'common'>('all');
  const [boardYearFilter, setBoardYearFilter] = useState<number | 'all'>('all');
  const [boardSpecificFilter, setBoardSpecificFilter] = useState<string>('all');
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({});
  const [subStatus, setSubStatus] = useState<UserSubscriptionStatus | null>(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const toggleYearExpanded = (year: number) => {
    setExpandedYears((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  };

  const fetchSubStatus = async () => {
    try {
      const data = await apiJson<UserSubscriptionStatus>('/api/user/subscription-status');
      setSubStatus(data);
    } catch (err) {
      console.error('Failed to load subscription status:', err);
    }
  };

  const fetchBoardExams = async () => {
    setLoading(true);
    try {
      const data = await apiJson<Exam[]>(
        `/api/exams?academicLevel=${selectedLevel}&examType=board_question&version=${version}`
      );
      const examList = data || [];
      setBoardExams(examList);

      const years = Array.from(
        new Set(examList.map((e) => e.examYear).filter((y): y is number => typeof y === 'number'))
      ).sort((a, b) => b - a);

      if (years.length > 0) {
        setBoardYearFilter(years[0]);
      }
    } catch (err) {
      console.error('Failed to load board exams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardExams();
    fetchSubStatus();
  }, [selectedLevel, version]);

  const handleStartExam = (examId: string) => {
    if (user?.role === 'admin' || subStatus?.isSubscribed) {
      navigate(`/exam/${examId}/start`);
      return;
    }
    if (subStatus && !subStatus.canTakeExam) {
      setIsSubscriptionModalOpen(true);
      return;
    }
    navigate(`/exam/${examId}/start`);
  };

  // Isolate board questions to student's allowed stream + compulsory
  const allowedBoardExams = boardExams.filter((exam) => {
    if (user?.role === 'admin') return true;
    const stream = (exam.subjectStream || 'common').toLowerCase();
    return stream === userStream || stream === 'common';
  });

  const availableBoardYears = Array.from(
    new Set(allowedBoardExams.map((e) => e.examYear).filter((y): y is number => typeof y === 'number'))
  ).sort((a, b) => b - a);

  const availableBoards = Array.from(
    new Set(allowedBoardExams.map((e) => e.boardName).filter((b): b is string => Boolean(b)))
  );

  const filteredBoardExams = allowedBoardExams.filter((exam) => {
    if (boardStreamFilter !== 'all' && (exam.subjectStream || 'common') !== boardStreamFilter) return false;
    if (boardYearFilter !== 'all' && exam.examYear !== boardYearFilter) return false;
    if (boardSpecificFilter !== 'all' && exam.boardName !== boardSpecificFilter) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = exam.title.toLowerCase().includes(query);
      const matchSub = (exam.subjectName || '').toLowerCase().includes(query) || (exam.subjectNameBn || '').toLowerCase().includes(query);
      const matchBoard = (exam.boardName || '').toLowerCase().includes(query);
      if (!matchTitle && !matchSub && !matchBoard) return false;
    }
    return true;
  });

  const groupedBoardExamsByYear = (boardYearFilter === 'all' ? availableBoardYears : [boardYearFilter]).reduce<
    Record<number, Exam[]>
  >((acc, yr) => {
    if (typeof yr !== 'number') return acc;
    const matched = filteredBoardExams.filter((e) => e.examYear === yr);
    if (matched.length > 0) {
      acc[yr] = matched;
    }
    return acc;
  }, {});

  const getUserStreamNameBn = (str: string) => {
    switch (str) {
      case 'science':
        return isEnglishUi ? 'Science Stream' : 'বিজ্ঞান বিভাগ';
      case 'commerce':
        return isEnglishUi ? 'Business Studies' : 'ব্যবসায় শিক্ষা বিভাগ';
      case 'humanities':
        return isEnglishUi ? 'Humanities & Arts' : 'মানবিক বিভাগ';
      default:
        return isEnglishUi ? 'Core Compulsory' : 'আবশ্যিক বিষয়';
    }
  };

  const getShortLevelName = (lvl: string) => {
    switch (lvl) {
      case 'hsc':
        return 'HSC';
      case 'ssc':
        return 'SSC';
      case 'alevel':
        return 'A Level';
      case 'olevel':
        return 'O Level';
      case 'dp':
        return 'IB DP';
      case 'myp':
        return 'IB MYP';
      default:
        return lvl.toUpperCase();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isEnglishUi ? 'Back to Dashboard' : 'ড্যাশবোর্ডে ফিরে যান'}</span>
          </Link>
          <div className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
            {getShortLevelName(selectedLevel)} • {getUserStreamNameBn(userStream)}
          </div>
        </div>

        {/* Free Quota Banner if not subscribed */}
        {subStatus && !subStatus.isSubscribed && user?.role !== 'admin' && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-extrabold flex flex-col items-center justify-center shadow-sm shrink-0">
                <span className="text-base leading-none">{subStatus.freeTestsUsed}</span>
                <span className="text-[9px] uppercase tracking-tighter opacity-90">of 3 used</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                    {isEnglishUi ? 'Free Trial Limit' : 'ফ্রি ট্রায়াল কোটা'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {subStatus.canTakeExam
                      ? isEnglishUi
                        ? `${subStatus.freeTestsRemaining} free test(s) left`
                        : `আরও ${subStatus.freeTestsRemaining}টি টেস্ট ফ্রি বাকি আছে`
                      : isEnglishUi
                        ? 'Trial tests used up'
                        : '৩টি ফ্রি টেস্ট সম্পন্ন হয়েছে'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {subStatus.canTakeExam
                    ? isEnglishUi
                      ? 'You can take up to 3 tests across the platform for free!'
                      : 'প্ল্যাটফর্মের যেকোনো ৩টি পরীক্ষা বিনামূল্যে দিতে পারবেন!'
                    : isEnglishUi
                      ? 'Subscribe to get unlimited access to all board papers and chapter exams'
                      : 'সকল বোর্ড প্রশ্ন ও অধ্যায়ভিত্তিক পরীক্ষায় আনলিমিটেড অংশ নিতে সাবস্ক্রাইব করুন'}
                </h3>
              </div>
            </div>
            <Button
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl text-xs gap-1.5 shadow-md shadow-amber-500/20 shrink-0 px-4 py-2.5 h-auto cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {isEnglishUi ? 'Upgrade to Unlimited' : 'আনলিমিটেড সাবস্ক্রিপশন নিন'}
            </Button>
          </div>
        )}

        {/* Hero Banner Card for Past Papers Archive */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3 flex-wrap">
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
              </h1>

              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-4xl font-normal">
                {version === 'british'
                  ? 'Practice official Cambridge Assessment International Education (CAIE) and Pearson Edexcel past question papers with verified answers and real-time timers.'
                  : version === 'ib'
                    ? 'Practice official International Baccalaureate (IB) assessment papers with structured markschemes and real exam pacing.'
                    : isEnglishUi
                      ? 'Practice official board exam papers across Science, Business Studies, and Humanities with real-time timers and instant solutions.'
                      : 'বিজ্ঞান, ব্যবসায় শিক্ষা ও মানবিক বিভাগের সকল সাধারণ শিক্ষা বোর্ডের প্রশ্নপত্র সময় ধরে পরীক্ষা দিয়ে প্রস্তুতি নাও।'}
              </p>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEnglishUi ? 'Search past papers...' : 'বোর্ড প্রশ্ন বা বিষয় খুঁজুন...'}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Filter Controls Bar: Stream Switcher Tabs & Exam Board Dropdown */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-4 border-t border-slate-100">
            {/* Stream Switcher Tabs for Board Questions */}
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/70 overflow-x-auto text-xs shrink-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setBoardStreamFilter('all')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                  boardStreamFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isEnglishUi ? `All Allowed (${allowedBoardExams.length})` : `সকল বোর্ড প্রশ্ন (${allowedBoardExams.length})`}
              </button>
              <button
                type="button"
                onClick={() => setBoardStreamFilter(userStream)}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  boardStreamFilter === userStream
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-cyan-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                {getUserStreamNameBn(userStream)}
              </button>
              <button
                type="button"
                onClick={() => setBoardStreamFilter('common')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  boardStreamFilter === 'common'
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
              <div className="flex items-center gap-2 bg-slate-50/90 hover:bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/90 text-xs shrink-0 w-full sm:w-auto transition-colors">
                <span className="text-slate-700 font-bold px-2 shrink-0 flex items-center gap-1.5 whitespace-nowrap">
                  <span className="p-1 rounded-lg bg-blue-100/70 text-blue-600 flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5" />
                  </span>
                  {version === 'british' ? 'Exam Board:' : version === 'ib' ? 'Assessment Series:' : isEnglishUi ? 'Exam Board:' : 'শিক্ষা বোর্ড:'}
                </span>
                <select
                  value={boardSpecificFilter}
                  onChange={(e) => setBoardSpecificFilter(e.target.value)}
                  className="bg-white border border-slate-300/80 rounded-xl px-3 py-1.5 text-slate-800 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-2xs w-full sm:w-auto"
                >
                  <option value="all">
                    {version === 'british'
                      ? 'All Exam Boards (CAIE & Edexcel)'
                      : version === 'ib'
                        ? 'All Examination Series'
                        : isEnglishUi
                          ? 'All Education Boards'
                          : 'সকল শিক্ষা বোর্ড'}
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

          {/* Year Tabs Filter */}
          {availableBoardYears.length > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100/80 overflow-x-auto text-xs pb-1 scrollbar-none">
              <span className="text-slate-400 font-bold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {isEnglishUi ? 'Exam Year:' : 'পরীক্ষার সাল:'}
              </span>
              <button
                type="button"
                onClick={() => setBoardYearFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                  boardYearFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isEnglishUi
                  ? `All Years (${availableBoardYears[availableBoardYears.length - 1]} - ${availableBoardYears[0]})`
                  : `সকল সাল (${availableBoardYears[availableBoardYears.length - 1]} - ${availableBoardYears[0]})`}
              </button>
              {availableBoardYears.map((year) => {
                const countForYear = allowedBoardExams.filter((e) => e.examYear === year).length;
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setBoardYearFilter(year)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      boardYearFilter === year
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{getShortLevelName(selectedLevel)} {year}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        boardYearFilter === year ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {countForYear}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse pt-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-44 bg-slate-100 rounded-2xl border border-slate-200" />
              ))}
            </div>
          ) : Object.keys(groupedBoardExamsByYear).length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 my-4">
              <BookOpen className="w-10 h-10 mx-auto text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-700">কোনো বোর্ড প্রশ্ন পাওয়া যায়নি</h3>
              <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                {isEnglishUi
                  ? 'No past examination questions matched your selected filters or search query.'
                  : 'নির্বাচিত ফিল্টার বা অনুসন্ধানের ফলাফলে বর্তমানে কোনো প্রশ্ন পাওয়া যায়নি। অন্য সাল বা বোর্ড নির্বাচন করুন।'}
              </p>
            </div>
          ) : (
            <div className="space-y-8 pt-2">
              {Object.keys(groupedBoardExamsByYear)
                .map(Number)
                .sort((a, b) => b - a)
                .map((year) => {
                  const examsInYear = groupedBoardExamsByYear[year];
                  const isExpanded = Boolean(expandedYears[year]);
                  const displayedExams = isExpanded ? examsInYear : examsInYear.slice(0, 8);

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
                            {isEnglishUi ? `${examsInYear.length} Papers` : `${examsInYear.length}টি পরীক্ষা`}
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
                            className="flex flex-col justify-between p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all group"
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 font-sans uppercase">
                                  {exam.academicLevel} {exam.examYear}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${
                                      exam.subjectStream === 'science'
                                        ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                        : exam.subjectStream === 'commerce'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : exam.subjectStream === 'humanities'
                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                            : 'bg-purple-50 text-purple-700 border-purple-200'
                                    }`}
                                  >
                                    {exam.subjectStream || 'common'}
                                  </span>
                                  {user?.role === 'admin' || user?.isSubscribed || subStatus?.isSubscribed ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                      <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                                      {isEnglishUi ? 'Free' : 'ফ্রি'}
                                    </span>
                                  ) : subStatus && !subStatus.canTakeExam ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                                      <Lock className="w-2.5 h-2.5 text-amber-600" />
                                      {isEnglishUi ? 'Locked' : 'লকড'}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      {isEnglishUi ? 'Free' : 'ফ্রি'}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {exam.boardName && (
                                <div className="text-[11px] font-semibold text-blue-700 flex items-center gap-1 line-clamp-1">
                                  {version === 'british' ? '🇬🇧' : '🏛️'} {exam.boardName}
                                </div>
                              )}

                              <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                                {exam.title}
                              </h4>

                              <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 border-t border-slate-100">
                                <span className="flex items-center gap-1 font-sans">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  {exam.durationMinutes} {isEnglishUi ? 'mins' : 'মিনিট'}
                                </span>
                                <span className="flex items-center gap-1 font-sans">
                                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                                  {exam.totalMarks} {isEnglishUi ? 'MCQs' : 'টি প্রশ্ন'}
                                </span>
                              </div>
                            </div>

                            <div className="pt-4">
                              <Button
                                size="sm"
                                onClick={() => handleStartExam(exam.id)}
                                className={`w-full font-bold rounded-xl text-xs gap-1.5 shadow-xs cursor-pointer ${
                                  subStatus && !subStatus.canTakeExam && !subStatus.isSubscribed && user?.role !== 'admin'
                                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                              >
                                {subStatus && !subStatus.canTakeExam && !subStatus.isSubscribed && user?.role !== 'admin' ? (
                                  <>
                                    <Lock className="w-3.5 h-3.5" />
                                    {isEnglishUi ? 'Unlock with Subscription' : 'সাবস্ক্রাইব করে আনলক করুন'}
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle className="w-3.5 h-3.5" />
                                    {isEnglishUi ? 'Start Exam Paper' : 'পরীক্ষা শুরু করুন'}
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Expand / Collapse Button if year has more than 8 exams */}
                      {examsInYear.length > 8 && (
                        <div className="text-center pt-2">
                          <button
                            type="button"
                            onClick={() => toggleYearExpanded(year)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/80 transition-all cursor-pointer"
                          >
                            {isExpanded ? (
                              <>
                                <span>{isEnglishUi ? 'Show Less' : 'কম দেখুন'}</span>
                                <ChevronUp className="w-3.5 h-3.5" />
                              </>
                            ) : (
                              <>
                                <span>
                                  {isEnglishUi
                                    ? `Show All (${examsInYear.length - 8} more papers)`
                                    : `সকল দেখুন (আরও ${examsInYear.length - 8}টি পরীক্ষা)`}
                                </span>
                                <ChevronDown className="w-3.5 h-3.5" />
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
        </div>

        <SubscriptionModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          onSuccess={() => void fetchSubStatus()}
        />
      </main>
    </div>
  );
};

export default BoardQuestionsPage;
