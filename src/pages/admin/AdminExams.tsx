import React, { useEffect, useState, useMemo } from 'react';
import { Exam, Subject, Chapter, CurriculumVersion, AcademicLevel } from '@/src/types';
import Navbar from '@/src/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Edit2,
  Trash2,
  Plus,
  ArrowLeft,
  Loader2,
  ListTree,
  BookOpen,
  Landmark,
  GraduationCap,
  Layers,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { apiJson } from '@/src/lib/api';

const BANGLA_BOARDS = [
  'ঢাকা বোর্ড',
  'চট্টগ্রাম বোর্ড',
  'রাজশাহী বোর্ড',
  'কুমিল্লা বোর্ড',
  'যশোর বোর্ড',
  'বরিশাল বোর্ড',
  'সিলেট বোর্ড',
  'দিনাজপুর বোর্ড',
  'ময়মনসিংহ বোর্ড',
  'বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ড',
  'বাংলাদেশ কারিগরি শিক্ষা বোর্ড',
  'সকল বোর্ড সমন্বিত প্রশ্ন',
];

const BRITISH_BOARDS = [
  'Cambridge International (CAIE)',
  'Pearson Edexcel',
  'Oxford AQA',
];

const IB_BOARDS = [
  'International Baccalaureate (IB Assessment Paper 1)',
  'International Baccalaureate (IB Assessment Paper 2)',
];

const EXAM_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016];

const AdminExams = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [activeCurriculum, setActiveCurriculum] = useState<CurriculumVersion>('bangla');
  const [activeLevel, setActiveLevel] = useState<string>('all');
  const [activeExamType, setActiveExamType] = useState<string>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Exam Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Subject Chapters for Exam Modal
  const [formChapters, setFormChapters] = useState<Chapter[]>([]);
  const [loadingFormChapters, setLoadingFormChapters] = useState(false);

  // Exam Form Data
  const [formData, setFormData] = useState({
    curriculumVersion: 'bangla' as CurriculumVersion,
    academicLevel: 'hsc' as AcademicLevel,
    examType: 'model_test' as 'model_test' | 'board_question' | 'chapter_test',
    subjectId: '',
    boardName: '',
    examYear: 2025,
    chapterId: '',
    title: '',
    serialNumber: 1,
    durationMinutes: 30,
    totalMarks: 25,
    negativeMark: 0.25,
    instructions: '',
    isPublished: false,
  });

  // Manage Chapters Modal State
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [chapterSubjectId, setChapterSubjectId] = useState<string>('');
  const [chaptersList, setChaptersList] = useState<Chapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [newChapterForm, setNewChapterForm] = useState({
    chapterNumber: 1,
    title: '',
    titleBn: '',
    description: '',
  });

  useEffect(() => {
    fetchExams();
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await apiJson<Subject[]>('/api/subjects');
      setSubjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExams = async () => {
    setLoading(true);
    try {
      const data = await apiJson<Exam[]>('/api/exams');
      setExams(data);
    } catch (err) {
      console.error(err);
      toast.error('পরীক্ষার ডাটা লোড হয়নি');
    } finally {
      setLoading(false);
    }
  };

  // Load chapters when form subject changes
  const fetchFormChapters = async (subId: string) => {
    if (!subId) {
      setFormChapters([]);
      return;
    }
    setLoadingFormChapters(true);
    try {
      const data = await apiJson<Chapter[]>(`/api/subjects/${subId}/chapters`);
      setFormChapters(data);
    } catch (err) {
      setFormChapters([]);
    } finally {
      setLoadingFormChapters(false);
    }
  };

  // Load chapters for Chapter Manager
  const loadChaptersForSubject = async (subId: string) => {
    if (!subId) return;
    setLoadingChapters(true);
    try {
      const data = await apiJson<Chapter[]>(`/api/subjects/${subId}/chapters`);
      setChaptersList(data);
      setNewChapterForm((prev) => ({ ...prev, chapterNumber: (data.length || 0) + 1 }));
    } catch (err) {
      toast.error('অধ্যায়ের ডাটা লোড হয়নি');
    } finally {
      setLoadingChapters(false);
    }
  };

  // Filtered Subjects based on curriculum tab & level filter
  const filteredSubjects = useMemo(() => {
    return subjects.filter((sub) => {
      const matchCurr = sub.curriculumVersion === activeCurriculum || sub.curriculumVersion === 'both';
      const matchLvl = activeLevel === 'all' || sub.academicLevel === activeLevel;
      return matchCurr && matchLvl;
    });
  }, [subjects, activeCurriculum, activeLevel]);

  // Available Level Options for active curriculum
  const availableLevels = useMemo(() => {
    switch (activeCurriculum) {
      case 'british':
        return [
          { value: 'all', label: 'All Levels' },
          { value: 'alevel', label: 'A Level' },
          { value: 'olevel', label: 'O Level' },
        ];
      case 'ib':
        return [
          { value: 'all', label: 'All Levels' },
          { value: 'dp', label: 'IB DP' },
          { value: 'myp', label: 'IB MYP' },
        ];
      case 'english':
      case 'bangla':
      default:
        return [
          { value: 'all', label: 'সকল লেভেল' },
          { value: 'hsc', label: 'এইচএসসি (HSC)' },
          { value: 'ssc', label: 'এসএসসি (SSC)' },
        ];
    }
  }, [activeCurriculum]);

  // Board options for current curriculum
  const currentBoardOptions = useMemo(() => {
    if (activeCurriculum === 'british') return BRITISH_BOARDS;
    if (activeCurriculum === 'ib') return IB_BOARDS;
    return BANGLA_BOARDS;
  }, [activeCurriculum]);

  // Filtered Exams Table
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      // 1. Curriculum Match
      const matchCurr = (exam.curriculumVersion || 'bangla') === activeCurriculum;
      if (!matchCurr) return false;

      // 2. Level Match
      if (activeLevel !== 'all' && exam.academicLevel !== activeLevel) return false;

      // 3. Exam Type Match
      if (activeExamType !== 'all') {
        const type = exam.examType || 'model_test';
        if (type !== activeExamType) return false;
      }

      // 4. Subject Filter
      if (selectedSubjectFilter !== 'all' && exam.subjectId !== selectedSubjectFilter) return false;

      // 5. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = exam.title.toLowerCase().includes(query);
        const boardMatch = (exam.boardName || '').toLowerCase().includes(query);
        const subNameMatch = (exam.subjectName || '').toLowerCase().includes(query) || (exam.subjectNameBn || '').toLowerCase().includes(query);
        const yearMatch = String(exam.examYear || '').includes(query);
        const chapterMatch = (exam.chapterTitle || '').toLowerCase().includes(query) || (exam.chapterTitleBn || '').toLowerCase().includes(query);
        if (!titleMatch && !boardMatch && !subNameMatch && !yearMatch && !chapterMatch) {
          return false;
        }
      }

      return true;
    });
  }, [exams, activeCurriculum, activeLevel, activeExamType, selectedSubjectFilter, searchQuery]);

  const handleOpenCreateModal = (presetExamType?: 'model_test' | 'board_question' | 'chapter_test', presetChapterId?: string, presetSubId?: string) => {
    const subId = presetSubId || filteredSubjects[0]?.id || subjects[0]?.id || '';
    const initialLevel = (activeLevel !== 'all' ? activeLevel : (activeCurriculum === 'british' ? 'alevel' : activeCurriculum === 'ib' ? 'myp' : 'hsc')) as AcademicLevel;
    const initialExamType = presetExamType || (activeExamType !== 'all' ? (activeExamType as any) : 'model_test');

    const defaultBoard = activeCurriculum === 'british' ? 'Cambridge International (CAIE)' : activeCurriculum === 'ib' ? 'International Baccalaureate (IB Assessment Paper 1)' : 'ঢাকা বোর্ড';

    setEditingExam(null);
    setFormData({
      curriculumVersion: activeCurriculum,
      academicLevel: initialLevel,
      examType: initialExamType,
      subjectId: subId,
      boardName: defaultBoard,
      examYear: 2025,
      chapterId: presetChapterId || '',
      title: initialExamType === 'board_question' ? `${defaultBoard} ২০২৫` : '',
      serialNumber: exams.length + 1,
      durationMinutes: 30,
      totalMarks: 25,
      negativeMark: 0.25,
      instructions: '',
      isPublished: true,
    });

    fetchFormChapters(subId);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      curriculumVersion: (exam.curriculumVersion as CurriculumVersion) || 'bangla',
      academicLevel: exam.academicLevel || 'hsc',
      examType: exam.examType || 'model_test',
      subjectId: exam.subjectId,
      boardName: exam.boardName || '',
      examYear: exam.examYear || 2025,
      chapterId: exam.chapterId || '',
      title: exam.title,
      serialNumber: exam.serialNumber,
      durationMinutes: exam.durationMinutes,
      totalMarks: exam.totalMarks,
      negativeMark: exam.negativeMark,
      instructions: exam.instructions || '',
      isPublished: exam.isPublished,
    });

    fetchFormChapters(exam.subjectId);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.subjectId) {
      return toast.error('দয়া করে বিষয় এবং পরীক্ষার শিরোনাম পূরণ করুন');
    }

    try {
      const payload = {
        ...formData,
        serialNumber: Number(formData.serialNumber) || 1,
        durationMinutes: Number(formData.durationMinutes) || 30,
        totalMarks: Number(formData.totalMarks) || 25,
        negativeMark: Number(formData.negativeMark) !== undefined ? Number(formData.negativeMark) : 0.25,
        examYear: formData.examType === 'board_question' ? Number(formData.examYear) : null,
        boardName: formData.examType === 'board_question' ? formData.boardName : null,
        chapterId: formData.examType === 'chapter_test' ? formData.chapterId || null : null,
      };

      if (editingExam) {
        await apiJson(`/api/exams/${editingExam.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast.success('পরীক্ষা সফলভাবে আপডেট করা হয়েছে');
      } else {
        await apiJson('/api/exams', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('নতুন পরীক্ষা তৈরি করা হয়েছে');
      }
      setIsModalOpen(false);
      fetchExams();
    } catch (err) {
      toast.error('সংরক্ষণ করা যায়নি');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি এই পরীক্ষাটি মুছে ফেলতে নিশ্চিত? এর সকল প্রশ্নও মুছে যাবে।')) return;
    try {
      await apiJson(`/api/exams/${id}`, { method: 'DELETE' });
      toast.success('পরীক্ষা ডিলিট করা হয়েছে');
      fetchExams();
    } catch (err) {
      toast.error('ডিলিট করা যায়নি');
    }
  };

  // Chapter Modal Actions
  const handleOpenChapterManager = (subId?: string) => {
    const initialSubId = subId || filteredSubjects[0]?.id || subjects[0]?.id || '';
    setChapterSubjectId(initialSubId);
    loadChaptersForSubject(initialSubId);
    setIsChapterModalOpen(true);
  };

  const handleCreateChapter = async () => {
    if (!chapterSubjectId) return toast.error('বিষয় নির্বাচন করুন');
    if (!newChapterForm.title && !newChapterForm.titleBn) {
      return toast.error('অধ্যায়ের শিরোনাম লিখুন');
    }

    try {
      await apiJson(`/api/subjects/${chapterSubjectId}/chapters`, {
        method: 'POST',
        body: JSON.stringify(newChapterForm),
      });
      toast.success('নতুন অধ্যায় যোগ করা হয়েছে');
      setNewChapterForm({
        chapterNumber: chaptersList.length + 2,
        title: '',
        titleBn: '',
        description: '',
      });
      loadChaptersForSubject(chapterSubjectId);
    } catch (err) {
      toast.error('অধ্যায় তৈরি করা যায়নি');
    }
  };

  const handleDeleteChapter = async (chapId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই অধ্যায়টি মুছতে চান?')) return;
    try {
      await apiJson(`/api/chapters/${chapId}`, { method: 'DELETE' });
      toast.success('অধ্যায় মুছে ফেলা হয়েছে');
      loadChaptersForSubject(chapterSubjectId);
      fetchExams();
    } catch (err) {
      toast.error('অধ্যায় মোছা যায়নি');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar role="admin" />

      <main className="max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Top Navigation & Action Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/dashboard')}
            className="font-bengali gap-2 text-slate-500 hover:text-slate-900 shadow-none -ml-3"
          >
            <ArrowLeft className="w-4 h-4" /> ড্যাশবোর্ডে ফিরে যান
          </Button>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => handleOpenChapterManager()}
              className="font-bengali h-11 px-4 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold gap-2 cursor-pointer shadow-xs"
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>অধ্যায়সমূহ ম্যানেজ করুন</span>
            </Button>

            <Button
              onClick={() => handleOpenCreateModal()}
              className="bg-[#006837] hover:bg-[#00522c] text-white font-bengali h-11 px-5 rounded-xl font-bold gap-2 shadow-md shadow-emerald-800/20 border-none cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন পরীক্ষা / বোর্ড প্রশ্ন যোগ করুন</span>
            </Button>
          </div>
        </div>

        {/* Page Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-sans text-slate-900 tracking-tight">
            Manage Exams & Board Question Bank
          </h1>
          <p className="text-slate-500 font-bengali text-sm mt-1">
            বোর্ড প্রশ্নাবলি, অধ্যায়ভিত্তিক টেস্ট এবং সাধারণ মডেল টেস্ট পরিচালনা ও MCQ এন্ট্রি করুন।
          </p>
        </div>

        {/* 1. CURRICULUM SELECTOR TABS */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-1.5">
          {[
            { id: 'bangla', label: 'বাংলা মাধ্যম (HSC/SSC)', icon: GraduationCap },
            { id: 'english', label: 'English Version (HSC/SSC)', icon: GraduationCap },
            { id: 'british', label: 'British Curriculum (O/A Level)', icon: Landmark },
            { id: 'ib', label: 'IB Curriculum (MYP/DP)', icon: Layers },
          ].map((curr) => {
            const Icon = curr.icon;
            const isSelected = activeCurriculum === curr.id;
            return (
              <button
                key={curr.id}
                onClick={() => {
                  setActiveCurriculum(curr.id as CurriculumVersion);
                  setActiveLevel('all');
                  setSelectedSubjectFilter('all');
                }}
                className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl font-bold text-xs sm:text-sm font-bengali flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#006837] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{curr.label}</span>
              </button>
            );
          })}
        </div>

        {/* 2. FILTER CONTROLS BAR */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Level Selector Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">লেভেল:</span>
              {availableLevels.map((lvl) => (
                <button
                  key={lvl.value}
                  onClick={() => setActiveLevel(lvl.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeLevel === lvl.value
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>

            {/* Exam Type Selector Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">ক্যাটাগরি:</span>
              {[
                { id: 'all', label: 'সব ক্যাটাগরি' },
                { id: 'board_question', label: '🏛️ বিগত বোর্ড প্রশ্ন' },
                { id: 'chapter_test', label: '📖 অধ্যায়ভিত্তিক টেস্ট' },
                { id: 'model_test', label: '📝 মডেল টেস্ট' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveExamType(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeExamType === t.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 border-t border-slate-100">
            {/* Subject Dropdown Filter */}
            <div className="sm:col-span-4">
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-bengali text-xs font-bold outline-none focus:border-emerald-600"
              >
                <option value="all">সকল বিষয় ({filteredSubjects.length}টি বিষয়)</option>
                {filteredSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.nameBn} ({sub.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="পরীক্ষার নাম, বোর্ডের নাম, সাল বা বিষয় দিয়ে খুঁজুন..."
                className="h-10 pl-9 rounded-xl border-slate-200 text-xs font-bengali"
              />
            </div>
          </div>
        </div>

        {/* 3. EXAMS DATA TABLE */}
        <Card className="rounded-2xl border border-slate-200 shadow-xs overflow-hidden bg-white">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-16 gap-3">
                <Loader2 className="animate-spin text-emerald-600 w-8 h-8" />
                <span className="text-slate-500 font-bengali text-sm">ডাটা লোড হচ্ছে...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/80 border-b border-slate-100">
                    <TableRow>
                      <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-slate-400">SN</TableHead>
                      <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-slate-400">পরীক্ষার নাম ও টাইপ</TableHead>
                      <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-slate-400">বিষয় ও অধ্যায়</TableHead>
                      <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-slate-400">সময় ও নম্বর</TableHead>
                      <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-slate-400">স্ট্যাটাস</TableHead>
                      <TableHead className="py-4 px-6 text-right text-[10px] font-black uppercase tracking-wider text-slate-400">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExams.length > 0 ? (
                      filteredExams.map((exam) => {
                        const isBoard = exam.examType === 'board_question';
                        const isChapter = exam.examType === 'chapter_test';

                        return (
                          <TableRow key={exam.id} className="hover:bg-slate-50/60 transition-colors border-b border-slate-100 last:border-0">
                            <TableCell className="py-4 px-6 font-mono text-xs font-bold text-slate-400">
                              #{exam.serialNumber}
                            </TableCell>

                            <TableCell className="py-4 px-6">
                              <div className="space-y-1">
                                <div className="font-bengali font-bold text-slate-900 text-base flex items-center gap-2">
                                  <span>{exam.title}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {isBoard && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] font-bold font-bengali">
                                      <Landmark className="w-3 h-3 text-amber-600" />
                                      {exam.boardName || 'বোর্ড প্রশ্ন'} {exam.examYear ? `(${exam.examYear})` : ''}
                                    </span>
                                  )}
                                  {isChapter && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200/80 text-teal-800 text-[11px] font-bold font-bengali">
                                      <BookOpen className="w-3 h-3 text-teal-600" />
                                      {exam.chapterTitleBn || exam.chapterTitle || 'অধ্যায় টেস্ট'}
                                    </span>
                                  )}
                                  {!isBoard && !isChapter && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold font-bengali">
                                      মডেল টেস্ট
                                    </span>
                                  )}
                                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-mono font-bold">
                                    {exam.academicLevel || 'HSC'}
                                  </span>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="py-4 px-6">
                              <div className="font-bengali text-xs font-bold text-slate-700">
                                {exam.subjectNameBn || exam.subjectName || '-'}
                              </div>
                              {exam.subjectStream && exam.subjectStream !== 'common' && (
                                <span className="text-[10px] text-slate-400 uppercase font-sans">
                                  {exam.subjectStream}
                                </span>
                              )}
                            </TableCell>

                            <TableCell className="py-4 px-6 font-sans text-xs text-slate-600">
                              <div className="flex flex-col gap-0.5 font-medium">
                                <span>⏱️ {exam.durationMinutes} মি.</span>
                                <span>🎯 {exam.totalMarks} নম্বর</span>
                              </div>
                            </TableCell>

                            <TableCell className="py-4 px-6">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  exam.isPublished
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                }`}
                              >
                                {exam.isPublished ? 'Published' : 'Draft'}
                              </span>
                            </TableCell>

                            <TableCell className="py-4 px-6 text-right space-x-2">
                              {/* Manage Questions Button */}
                              <Link to={`/admin/exams/${exam.id}/questions`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="font-bengali h-9 px-3 gap-1.5 text-emerald-700 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 rounded-xl shadow-xs transition-colors cursor-pointer"
                                >
                                  <ListTree className="w-3.5 h-3.5" />
                                  <span>প্রশ্ন যোগ / ম্যানেজ</span>
                                </Button>
                              </Link>

                              {/* Edit Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 p-0 border-slate-200 hover:bg-slate-100 rounded-xl cursor-pointer"
                                onClick={() => handleOpenEditModal(exam)}
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-700" />
                              </Button>

                              {/* Delete Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 p-0 border-rose-100 hover:bg-rose-50 text-rose-600 rounded-xl cursor-pointer"
                                onClick={() => handleDelete(exam.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="py-16 text-center text-slate-400 font-bengali text-sm">
                          এই ক্যাটাগরিতে কোনো পরীক্ষা বা বোর্ড প্রশ্ন পাওয়া যায়নি।
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* MODAL 1: ADD / EDIT EXAM OR BOARD QUESTION */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl rounded-3xl border-slate-200 shadow-2xl p-0 overflow-hidden">
          <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center justify-between">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold font-bengali text-slate-900">
                {editingExam ? 'পরীক্ষা / বোর্ড প্রশ্ন সম্পাদন করুন' : 'নতুন পরীক্ষা বা বোর্ড প্রশ্ন যোগ করুন'}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto">
            {/* Curriculum Selection */}
            <div className="space-y-1.5">
              <Label className="font-bengali font-bold text-xs text-slate-700">কারিকুলাম (Curriculum)</Label>
              <select
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-bengali text-xs font-bold outline-none"
                value={formData.curriculumVersion}
                onChange={(e) => {
                  const newCurr = e.target.value as CurriculumVersion;
                  setFormData((prev) => ({
                    ...prev,
                    curriculumVersion: newCurr,
                    academicLevel: (newCurr === 'british' ? 'alevel' : newCurr === 'ib' ? 'myp' : 'hsc') as AcademicLevel,
                  }));
                }}
              >
                <option value="bangla">বাংলা মাধ্যম</option>
                <option value="english">English Version</option>
                <option value="british">British Curriculum (O/A Level)</option>
                <option value="ib">IB Curriculum (MYP/DP)</option>
              </select>
            </div>

            {/* Academic Level */}
            <div className="space-y-1.5">
              <Label className="font-bengali font-bold text-xs text-slate-700">লেভেল / শ্রেণী (Academic Level)</Label>
              <select
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-bengali text-xs font-bold outline-none"
                value={formData.academicLevel}
                onChange={(e) => setFormData((prev) => ({ ...prev, academicLevel: e.target.value as AcademicLevel }))}
              >
                {formData.curriculumVersion === 'british' ? (
                  <>
                    <option value="alevel">A Level</option>
                    <option value="olevel">O Level</option>
                  </>
                ) : formData.curriculumVersion === 'ib' ? (
                  <>
                    <option value="dp">IB DP</option>
                    <option value="myp">IB MYP</option>
                  </>
                ) : (
                  <>
                    <option value="hsc">এইচএসসি (HSC)</option>
                    <option value="ssc">এসএসসি (SSC)</option>
                  </>
                )}
              </select>
            </div>

            {/* Exam Type Selector */}
            <div className="space-y-1.5 col-span-full">
              <Label className="font-bengali font-bold text-xs text-slate-700">পরীক্ষার ধরণ (Exam Type)</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'board_question', label: '🏛️ বোর্ড প্রশ্ন' },
                  { id: 'chapter_test', label: '📖 অধ্যায়ভিত্তিক টেস্ট' },
                  { id: 'model_test', label: '📝 সাধারণ মডেল টেস্ট' },
                ].map((typeOption) => (
                  <button
                    key={typeOption.id}
                    type="button"
                    onClick={() => {
                      const t = typeOption.id as any;
                      setFormData((prev) => ({
                        ...prev,
                        examType: t,
                        title: t === 'board_question' ? `${prev.boardName || currentBoardOptions[0]} ${prev.examYear}` : prev.title,
                      }));
                    }}
                    className={`h-10 px-3 rounded-xl text-xs font-bold font-bengali border transition-all cursor-pointer ${
                      formData.examType === typeOption.id
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {typeOption.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Selector */}
            <div className="space-y-1.5 col-span-full">
              <Label className="font-bengali font-bold text-xs text-slate-700">বিষয় নির্বাচন (Subject)</Label>
              <select
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-bengali text-xs font-bold outline-none"
                value={formData.subjectId}
                onChange={(e) => {
                  const newSubId = e.target.value;
                  setFormData((prev) => ({ ...prev, subjectId: newSubId, chapterId: '' }));
                  fetchFormChapters(newSubId);
                }}
              >
                <option value="">বিষয় নির্বাচন করুন</option>
                {subjects
                  .filter((s) => s.curriculumVersion === formData.curriculumVersion || s.curriculumVersion === 'both')
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nameBn} ({s.name})
                    </option>
                  ))}
              </select>
            </div>

            {/* Conditional: If Board Question */}
            {formData.examType === 'board_question' && (
              <>
                <div className="space-y-1.5">
                  <Label className="font-bengali font-bold text-xs text-slate-700">বোর্ডের নাম (Board Name)</Label>
                  <select
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-bengali text-xs font-bold outline-none"
                    value={formData.boardName}
                    onChange={(e) => {
                      const newBoard = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        boardName: newBoard,
                        title: `${newBoard} ${prev.examYear}`,
                      }));
                    }}
                  >
                    {currentBoardOptions.map((board) => (
                      <option key={board} value={board}>
                        {board}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bengali font-bold text-xs text-slate-700">পরীক্ষার সাল (Year)</Label>
                  <select
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-sans text-xs font-bold outline-none"
                    value={formData.examYear}
                    onChange={(e) => {
                      const newYear = Number(e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        examYear: newYear,
                        title: `${prev.boardName || currentBoardOptions[0]} ${newYear}`,
                      }));
                    }}
                  >
                    {EXAM_YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Conditional: If Chapter Test */}
            {formData.examType === 'chapter_test' && (
              <div className="space-y-1.5 col-span-full">
                <div className="flex items-center justify-between">
                  <Label className="font-bengali font-bold text-xs text-slate-700">অধ্যায় নির্বাচন (Chapter)</Label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.subjectId) return toast.error('আগে বিষয় নির্বাচন করুন');
                      handleOpenChapterManager(formData.subjectId);
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> নতুন অধ্যায় তৈরি করুন
                  </button>
                </div>
                <select
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-bengali text-xs font-bold outline-none"
                  value={formData.chapterId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, chapterId: e.target.value }))}
                >
                  <option value="">অধ্যায় নির্বাচন করুন (ঐচ্ছিক)</option>
                  {formChapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      অধ্যায় {c.chapterNumber}: {c.titleBn || c.title}
                    </option>
                  ))}
                </select>
                {formChapters.length === 0 && formData.subjectId && (
                  <p className="text-[11px] text-amber-600 font-bengali">
                    এই বিষয়ের কোনো অধ্যায় তৈরি করা নেই। উপরে "নতুন অধ্যায় তৈরি করুন" বাটনে ক্লিক করে যোগ করতে পারেন।
                  </p>
                )}
              </div>
            )}

            {/* Exam Title */}
            <div className="space-y-1.5 col-span-full">
              <Label className="font-bengali font-bold text-xs text-slate-700">পরীক্ষার নাম (Title)</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="যেমন: ঢাকা বোর্ড ২০২৪ অথবা মডেল টেস্ট - ১"
                className="h-10 rounded-xl border-slate-200 font-bengali text-sm"
              />
            </div>

            {/* Serial, Duration, Total Marks, Negative Mark */}
            <div className="space-y-1.5">
              <Label className="font-bengali font-bold text-xs text-slate-700">ক্রমিক নম্বর (Serial)</Label>
              <Input
                type="number"
                value={formData.serialNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, serialNumber: parseInt(e.target.value) || 1 }))}
                className="h-10 rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bengali font-bold text-xs text-slate-700">সময় (মিনিট)</Label>
              <Input
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => setFormData((prev) => ({ ...prev, durationMinutes: parseInt(e.target.value) || 30 }))}
                className="h-10 rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bengali font-bold text-xs text-slate-700">মোট নম্বর</Label>
              <Input
                type="number"
                value={formData.totalMarks}
                onChange={(e) => setFormData((prev) => ({ ...prev, totalMarks: parseInt(e.target.value) || 25 }))}
                className="h-10 rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bengali font-bold text-xs text-slate-700">নেগেটিভ মার্কিং</Label>
              <Input
                type="number"
                step="0.05"
                value={formData.negativeMark}
                onChange={(e) => setFormData((prev) => ({ ...prev, negativeMark: parseFloat(e.target.value) || 0 }))}
                className="h-10 rounded-xl border-slate-200"
              />
            </div>

            {/* Instructions */}
            <div className="space-y-1.5 col-span-full">
              <Label className="font-bengali font-bold text-xs text-slate-700">নির্দেশনাবলি (Instructions - Optional)</Label>
              <textarea
                className="w-full p-3 rounded-xl border border-slate-200 font-bengali text-xs outline-none focus:border-emerald-600 min-h-[70px]"
                placeholder="পরীক্ষার নিয়মাবলি..."
                value={formData.instructions}
                onChange={(e) => setFormData((prev) => ({ ...prev, instructions: e.target.value }))}
              />
            </div>

            {/* Publish Checkbox */}
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 col-span-full">
              <Checkbox
                id="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(val) => setFormData((prev) => ({ ...prev, isPublished: !!val }))}
                className="data-[state=checked]:bg-emerald-600"
              />
              <Label htmlFor="isPublished" className="cursor-pointer font-bold text-xs text-slate-700 font-bengali">
                অনলাইনে সরাসরি শিক্ষার্থীদের জন্য প্রকাশ করুন (Publish Live)
              </Label>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="h-10 px-5 rounded-xl font-bengali text-xs">
              বাতিল
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#006837] hover:bg-[#00522c] text-white h-10 px-6 rounded-xl font-bold font-bengali text-xs shadow-sm cursor-pointer"
            >
              সংরক্ষণ করুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: MANAGE SUBJECT CHAPTERS */}
      <Dialog open={isChapterModalOpen} onOpenChange={setIsChapterModalOpen}>
        <DialogContent className="max-w-3xl rounded-3xl border-slate-200 shadow-2xl p-0 overflow-hidden">
          <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center justify-between">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold font-bengali text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>বিষয়ভিত্তিক অধ্যায় ব্যবস্থাপনা (Subject Chapters)</span>
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Subject Selector */}
            <div className="space-y-1.5">
              <Label className="font-bengali font-bold text-xs text-slate-700">বিষয় নির্বাচন করুন</Label>
              <select
                className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white font-bengali text-sm font-bold outline-none"
                value={chapterSubjectId}
                onChange={(e) => {
                  setChapterSubjectId(e.target.value);
                  loadChaptersForSubject(e.target.value);
                }}
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    [{sub.curriculumVersion?.toUpperCase() || 'BANGLA'}] {sub.nameBn} ({sub.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Existing Chapters List */}
            <div className="space-y-3">
              <h3 className="font-bengali font-bold text-sm text-slate-800 flex items-center justify-between">
                <span>বিদ্যমান অধ্যায়সমূহ ({chaptersList.length}টি)</span>
              </h3>

              {loadingChapters ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="animate-spin text-emerald-600 w-6 h-6" />
                </div>
              ) : chaptersList.length > 0 ? (
                <div className="space-y-2">
                  {chaptersList.map((chap) => (
                    <div
                      key={chap.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center font-mono">
                          {chap.chapterNumber}
                        </span>
                        <div>
                          <h4 className="font-bengali font-bold text-slate-900 text-sm">{chap.titleBn || chap.title}</h4>
                          {chap.title && chap.title !== chap.titleBn && (
                            <p className="text-xs text-slate-400 font-sans">{chap.title}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsChapterModalOpen(false);
                            handleOpenCreateModal('chapter_test', chap.id, chapterSubjectId);
                          }}
                          className="font-bengali text-xs h-8 px-2.5 rounded-lg border-emerald-200 text-emerald-800 hover:bg-emerald-50 shadow-none cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>টেস্ট তৈরি</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteChapter(chap.id)}
                          className="h-8 w-8 p-0 border-rose-100 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-400 font-bengali text-xs">
                  এই বিষয়ের কোনো অধ্যায় পাওয়া যায়নি। নিচে নতুন অধ্যায় যোগ করুন।
                </div>
              )}
            </div>

            {/* Add New Chapter Form */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <h4 className="font-bengali font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>নতুন অধ্যায় যোগ করুন</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-3 space-y-1">
                  <Label className="font-bengali text-[11px] text-slate-600">অধ্যায় নম্বর</Label>
                  <Input
                    type="number"
                    value={newChapterForm.chapterNumber}
                    onChange={(e) => setNewChapterForm((prev) => ({ ...prev, chapterNumber: parseInt(e.target.value) || 1 }))}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>

                <div className="sm:col-span-9 space-y-1">
                  <Label className="font-bengali text-[11px] text-slate-600">অধ্যায়ের নাম (বাংলা)</Label>
                  <Input
                    value={newChapterForm.titleBn}
                    onChange={(e) => setNewChapterForm((prev) => ({ ...prev, titleBn: e.target.value }))}
                    placeholder="যেমন: কোষ ও এর গঠন"
                    className="h-9 text-xs font-bengali rounded-xl"
                  />
                </div>

                <div className="sm:col-span-12 space-y-1">
                  <Label className="font-sans text-[11px] text-slate-600">Chapter Title (English / Secondary)</Label>
                  <Input
                    value={newChapterForm.title}
                    onChange={(e) => setNewChapterForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Cell and its structure"
                    className="h-9 text-xs font-sans rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleCreateChapter}
                  className="bg-[#006837] hover:bg-[#00522c] text-white font-bengali font-bold text-xs h-9 px-4 rounded-xl cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  অধ্যায় সংরক্ষণ করুন
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <Button variant="outline" onClick={() => setIsChapterModalOpen(false)} className="h-9 px-5 rounded-xl font-bengali text-xs">
              বন্ধ করুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminExams;
