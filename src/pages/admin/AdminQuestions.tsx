import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  Edit2,
  Trash2,
  Plus,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Upload,
  FileJson,
  ClipboardCopy,
  Landmark,
  BookOpen,
  HelpCircle,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useParams, Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Navbar from '@/src/components/layout/Navbar';
import { apiJson } from '@/src/lib/api';
import {
  QuestionLookup,
  getOptionText,
  getQuestionStimulus,
} from '@/src/lib/question';
import { Exam, Question } from '@/src/types';

type QuestionFormState = {
  stimulus: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: Question['correctOption'];
  explanation: string;
  serialNumber: number;
};

const createEmptyFormData = (serialNumber: number): QuestionFormState => ({
  stimulus: '',
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctOption: 'a',
  explanation: '',
  serialNumber,
});

const SAMPLE_JSON_TEMPLATE = `[
  {
    "serialNumber": 1,
    "stimulus": "উদ্দীপক (ঐচ্ছিক - না থাকলে এই লাইন বাদ দিতে পারেন)",
    "questionText": "উদ্ভিদকোষের প্রধান গঠন উপাদান কোনটি?",
    "optionA": "সেলুলোজ",
    "optionB": "কাইটিন",
    "optionC": "লিপিড",
    "optionD": "পেপটাইডোগ্লাইকান",
    "correctOption": "a",
    "explanation": "উদ্ভিদকোষের কোষপ্রাচীর প্রধানত সেলুলোজ দ্বারা গঠিত।"
  },
  {
    "serialNumber": 2,
    "questionText": "কোন অঙ্গাণুকে কোষের পাওয়ার হাউস বলা হয়?",
    "optionA": "রাইবোসোম",
    "optionB": "মাইটোকন্ড্রিয়া",
    "optionC": "গলগি বডি",
    "optionD": "লাইসোজোম",
    "correctOption": "b",
    "explanation": ""
  }
]`;

const AdminQuestions = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<QuestionLookup[]>([]);
  const [loading, setLoading] = useState(true);

  // Single Question Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionLookup | null>(null);
  const [formData, setFormData] = useState<QuestionFormState>(createEmptyFormData(1));

  // Bulk JSON Modal
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState<'upload' | 'paste'>('paste');
  const [jsonText, setJsonText] = useState('');
  const [bulkUploading, setBulkUploading] = useState(false);

  const fetchQuestions = useCallback(async () => {
    if (!examId) return;

    setLoading(true);

    try {
      const [examData, questionsData] = await Promise.all([
        apiJson<Exam>(`/api/exams/${examId}`).catch(() => null),
        apiJson<QuestionLookup[]>(`/api/exams/${examId}/questions`).catch(() => []),
      ]);

      if (examData) {
        setExam(examData);
      }

      const sortedQuestions = (questionsData || []).sort(
        (a, b) => (a.serialNumber || 0) - (b.serialNumber || 0),
      );

      setQuestions(sortedQuestions);
    } catch (error) {
      toast.error('ডাটা লোড হয়নি');
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    void fetchQuestions();
  }, [fetchQuestions]);

  // Validate parsed JSON questions
  const parsedJsonPreview = useMemo(() => {
    if (!jsonText.trim()) return null;
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        return { valid: false, error: 'JSON একটি Array (তালিকা) হতে হবে।' };
      }
      if (parsed.length === 0) {
        return { valid: false, error: 'কোনো প্রশ্ন পাওয়া যায়নি।' };
      }
      return { valid: true, count: parsed.length, data: parsed };
    } catch (err: any) {
      return { valid: false, error: 'JSON ফরম্যাটে ভুল রয়েছে। কমা বা ব্র্যাকেট চেক করুন।' };
    }
  }, [jsonText]);

  // Bulk File Upload Handler
  const handleBulkFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !examId) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) {
          throw new Error('JSON ফাইলটিতে অবশ্যই প্রশ্নের একটি array ([...]) থাকতে হবে');
        }

        setBulkUploading(true);

        const res = await apiJson<{ success: boolean; count: number; message: string }>(
          `/api/exams/${examId}/questions/bulk`,
          {
            method: 'POST',
            body: JSON.stringify({ questions: json }),
          }
        );

        toast.success(res.message || `${res.count} টি প্রশ্ন সফলভাবে যোগ করা হয়েছে`);
        setIsBulkModalOpen(false);
        setJsonText('');
        await fetchQuestions();
      } catch (error: any) {
        toast.error(error.message || 'JSON ফাইলটি সঠিক নয় বা আপলোড সমস্যা হয়েছে');
      } finally {
        setBulkUploading(false);
        if (e.target) e.target.value = '';
      }
    };

    reader.readAsText(file);
  };

  // Bulk Text Submit Handler
  const handleBulkTextSubmit = async () => {
    if (!parsedJsonPreview?.valid || !parsedJsonPreview.data || !examId) {
      return toast.error('দয়া করে সঠিক JSON ডাটা পেস্ট করুন');
    }

    setBulkUploading(true);
    try {
      const res = await apiJson<{ success: boolean; count: number; message: string }>(
        `/api/exams/${examId}/questions/bulk`,
        {
          method: 'POST',
          body: JSON.stringify({ questions: parsedJsonPreview.data }),
        }
      );

      toast.success(res.message || `${res.count} টি প্রশ্ন সফলভাবে যোগ করা হয়েছে`);
      setIsBulkModalOpen(false);
      setJsonText('');
      await fetchQuestions();
    } catch (error: any) {
      toast.error(error.message || 'প্রশ্নগুলো ইমপোর্ট করা যায়নি');
    } finally {
      setBulkUploading(false);
    }
  };

  const handleSave = async () => {
    if (!examId) {
      toast.error('পরীক্ষা পাওয়া যায়নি');
      return;
    }

    if (!formData.questionText.trim() || !formData.optionA.trim() || !formData.optionB.trim() || !formData.correctOption) {
      toast.error('প্রশ্ন, অপশন ১ ও অপশন ২ এবং সঠিক উত্তর আবশ্যক');
      return;
    }

    try {
      const normalizedStimulus = formData.stimulus.trim();
      const payload = {
        ...formData,
        stimulus: normalizedStimulus || null,
        explanation: formData.explanation.trim() || '',
        serialNumber: Number(formData.serialNumber) || 1,
      };

      if (editingQuestion) {
        await apiJson(`/api/questions/${editingQuestion.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast.success('প্রশ্ন আপডেট সফল হয়েছে');
      } else {
        await apiJson(`/api/exams/${examId}/questions`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('নতুন প্রশ্ন যোগ করা হয়েছে');
      }

      setIsModalOpen(false);
      await fetchQuestions();
    } catch (error) {
      toast.error('সংরক্ষণ করা যায়নি');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি এই প্রশ্নটি মুছে ফেলতে চান?')) return;

    try {
      await apiJson(`/api/questions/${id}`, { method: 'DELETE' });
      toast.success('প্রশ্ন ডিলিট করা হয়েছে');
      setQuestions((previous) => previous.filter((question) => question.id !== id));
    } catch (error) {
      toast.error('ডিলিট করা যায়নি');
    }
  };

  const handleOpenCreateModal = () => {
    setEditingQuestion(null);
    setFormData(createEmptyFormData(questions.length + 1));
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (question: QuestionLookup) => {
    setEditingQuestion(question);
    setFormData({
      stimulus: getQuestionStimulus(question) || '',
      questionText: question.questionText,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC || '',
      optionD: question.optionD || '',
      correctOption: question.correctOption,
      explanation: question.explanation || '',
      serialNumber: question.serialNumber || 1,
    });
    setIsModalOpen(true);
  };

  const isBoard = exam?.examType === 'board_question';
  const isChapter = exam?.examType === 'chapter_test';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar role="admin" />

      <main className="max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Back and Header Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/exams')}
            className="font-bengali gap-2 text-slate-500 hover:text-slate-900 shadow-none -ml-3"
          >
            <ArrowLeft className="w-4 h-4" /> সকল পরীক্ষায় ফিরে যান
          </Button>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Bulk Import Button */}
            <Button
              variant="outline"
              onClick={() => setIsBulkModalOpen(true)}
              className="font-bengali h-11 px-4 rounded-xl border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold gap-2 cursor-pointer shadow-xs"
            >
              <FileJson className="w-4 h-4 text-emerald-700" />
              <span>বাল্ক JSON এন্ট্রি (Bulk Import)</span>
            </Button>

            {/* Single Question Add Button */}
            <Button
              onClick={handleOpenCreateModal}
              className="bg-[#006837] hover:bg-[#00522c] text-white font-bengali h-11 px-5 rounded-xl font-bold gap-2 shadow-md shadow-emerald-800/20 border-none cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>একটি প্রশ্ন যোগ করুন</span>
            </Button>
          </div>
        </div>

        {/* Exam Details Banner */}
        {exam && (
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs font-mono uppercase">
                  {exam.curriculumVersion || 'BANGLA'} • {(exam.academicLevel || 'HSC').toUpperCase()}
                </span>
                {isBoard && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold font-bengali">
                    <Landmark className="w-3.5 h-3.5 text-amber-600" />
                    {exam.boardName || 'বোর্ড প্রশ্ন'} {exam.examYear ? `(${exam.examYear})` : ''}
                  </span>
                )}
                {isChapter && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold font-bengali">
                    <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                    {exam.chapterTitleBn || exam.chapterTitle || 'অধ্যায়ভিত্তিক টেস্ট'}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-bengali text-slate-900 tracking-tight">
                {exam.subjectNameBn || exam.subjectName} — <span className="text-emerald-800">{exam.title}</span>
              </h1>
              <p className="text-xs text-slate-500 font-sans">
                Duration: {exam.durationMinutes} mins | Total Marks: {exam.totalMarks} | Negative Mark: {exam.negativeMark}
              </p>
            </div>

            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6">
              <div className="text-left md:text-right">
                <div className="text-2xl font-black font-mono text-emerald-700">{questions.length}</div>
                <div className="text-xs font-bengali text-slate-400 font-bold">মোট প্রশ্ন সংখ্যা</div>
              </div>
            </div>
          </div>
        )}

        {/* Questions Table */}
        <Card className="rounded-2xl border border-slate-200 shadow-xs overflow-hidden bg-white">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-16 gap-3">
                <Loader2 className="animate-spin text-emerald-600 w-8 h-8" />
                <span className="text-slate-500 font-bengali text-sm">প্রশ্ন লোড হচ্ছে...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/80 border-b border-slate-100">
                    <TableRow>
                      <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-slate-400 w-16">SN</TableHead>
                      <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-slate-400">প্রশ্ন ও উদ্দীপক</TableHead>
                      <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-slate-400">অপশনসমূহ ও সঠিক উত্তর</TableHead>
                      <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-slate-400">ব্যাখ্যা (Explanation)</TableHead>
                      <TableHead className="py-4 px-6 text-right text-[10px] font-black uppercase tracking-wider text-slate-400 w-24">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.length > 0 ? (
                      questions.map((question) => {
                        const stimulus = getQuestionStimulus(question);

                        return (
                          <TableRow key={question.id} className="hover:bg-slate-50/60 transition-colors border-b border-slate-100 last:border-0">
                            <TableCell className="py-4 px-6 font-mono text-xs font-bold text-slate-400">
                              #{question.serialNumber}
                            </TableCell>

                            <TableCell className="py-4 px-6 max-w-md">
                              <div className="space-y-1.5">
                                {stimulus ? (
                                  <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/60 text-xs font-bengali text-slate-700 leading-relaxed">
                                    <span className="font-bold text-amber-800 mr-1">[উদ্দীপক]:</span>
                                    {stimulus}
                                  </div>
                                ) : null}
                                <div className="font-bengali font-bold text-slate-900 text-sm leading-snug">
                                  {question.questionText}
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="py-4 px-6">
                              <div className="grid grid-cols-2 gap-1.5 min-w-[280px]">
                                {(['a', 'b', 'c', 'd'] as const).map((opt) => {
                                  const isCorrect = question.correctOption?.toLowerCase() === opt;
                                  const text = getOptionText(question, opt);

                                  return (
                                    <div
                                      key={opt}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bengali flex items-center gap-1.5 border ${
                                        isCorrect
                                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-xs'
                                          : 'bg-slate-50 border-slate-200/80 text-slate-600'
                                      }`}
                                    >
                                      <span className="font-mono uppercase font-bold text-[10px] opacity-70">
                                        {opt}.
                                      </span>
                                      <span className="truncate">{text || '—'}</span>
                                      {isCorrect && <CheckCircle2 className="w-3 h-3 text-emerald-600 ml-auto shrink-0" />}
                                    </div>
                                  );
                                })}
                              </div>
                            </TableCell>

                            <TableCell className="py-4 px-6 max-w-xs">
                              {question.explanation ? (
                                <p className="text-xs text-slate-600 font-bengali line-clamp-2">
                                  {question.explanation}
                                </p>
                              ) : (
                                <span className="text-[11px] text-slate-300 italic font-bengali">
                                  ব্যাখ্যা নেই
                                </span>
                              )}
                            </TableCell>

                            <TableCell className="py-4 px-6 text-right space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg cursor-pointer"
                                onClick={() => handleOpenEditModal(question)}
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-700" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                                onClick={() => handleDelete(question.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="py-16 text-center text-slate-400 font-bengali text-sm">
                          এই পরীক্ষায় কোনো প্রশ্ন যোগ করা হয়নি। উপরের বাটনে ক্লিক করে প্রশ্ন এন্ট্রি করুন।
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

      {/* MODAL 1: SINGLE QUESTION ADD / EDIT */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl rounded-3xl border-slate-200 shadow-2xl p-0 overflow-hidden">
          <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center justify-between">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold font-bengali text-slate-900">
                {editingQuestion ? 'প্রশ্ন সম্পাদন করুন (Edit MCQ)' : 'নতুন প্রশ্ন যোগ করুন (Single MCQ)'}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
            {/* Serial Number */}
            <div className="w-36 space-y-1">
              <Label className="font-bengali font-bold text-xs text-slate-700">ক্রমিক নম্বর</Label>
              <Input
                type="number"
                value={formData.serialNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, serialNumber: parseInt(e.target.value) || 1 }))}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            {/* Stimulus (Optional) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="font-bengali font-bold text-xs text-slate-700">
                  উদ্দীপক / অনুচ্ছেদ (Stimulus)
                </Label>
                <span className="text-[11px] text-slate-400 font-bengali italic">ঐচ্ছিক (না থাকলে খালি রাখুন)</span>
              </div>
              <textarea
                className="w-full p-3 rounded-xl border border-slate-200 font-bengali text-xs outline-none focus:border-emerald-600 min-h-[60px]"
                placeholder="উদ্দীপকভিত্তিক প্রশ্ন হলে এখানে অনুচ্ছেদটি লিখুন..."
                value={formData.stimulus}
                onChange={(e) => setFormData((prev) => ({ ...prev, stimulus: e.target.value }))}
              />
            </div>

            {/* Question Text */}
            <div className="space-y-1">
              <Label className="font-bengali font-bold text-xs text-slate-700">
                প্রশ্ন (Question Text) <span className="text-rose-500">*</span>
              </Label>
              <textarea
                className="w-full p-3 rounded-xl border border-slate-200 font-bengali text-xs font-medium outline-none focus:border-emerald-600 min-h-[70px]"
                placeholder="মূল প্রশ্নটি এখানে লিখুন..."
                value={formData.questionText}
                onChange={(e) => setFormData((prev) => ({ ...prev, questionText: e.target.value }))}
              />
            </div>

            {/* 4 Options Grid with Correct Answer selection */}
            <div className="space-y-2">
              <Label className="font-bengali font-bold text-xs text-slate-700">
                ৪টি অপশন এবং সঠিক উত্তর চিহ্নিত করুন
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['a', 'b', 'c', 'd'] as const).map((opt) => {
                  const optKey = `option${opt.toUpperCase()}` as 'optionA' | 'optionB' | 'optionC' | 'optionD';
                  const isCorrect = formData.correctOption === opt;

                  return (
                    <div
                      key={opt}
                      className={`p-3 rounded-xl border transition-all ${
                        isCorrect ? 'bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-300' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono font-bold text-xs uppercase text-slate-700">
                          অপশন {opt.toUpperCase()}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, correctOption: opt }))}
                          className={`text-[11px] font-bengali font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                            isCorrect
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {isCorrect ? '✓ সঠিক উত্তর' : 'সঠিক চিহ্নিত করুন'}
                        </button>
                      </div>
                      <Input
                        value={formData[optKey]}
                        onChange={(e) => setFormData((prev) => ({ ...prev, [optKey]: e.target.value }))}
                        placeholder={`অপশন ${opt.toUpperCase()} এর উত্তর...`}
                        className="h-9 text-xs font-bengali rounded-lg border-slate-200"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explanation (Optional per user request) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="font-bengali font-bold text-xs text-slate-700">
                  ব্যাখ্যা (Explanation)
                </Label>
                <span className="text-[11px] text-emerald-700 font-bengali font-semibold">
                  (ঐচ্ছিক — চাইলে খালি রাখতে পারেন)
                </span>
              </div>
              <textarea
                className="w-full p-3 rounded-xl border border-slate-200 font-bengali text-xs outline-none focus:border-emerald-600 min-h-[70px]"
                placeholder="প্রশ্নের সঠিক উত্তরের বিশ্লেষণ বা বিস্তারিত ব্যাখ্যা (ঐচ্ছিক)..."
                value={formData.explanation}
                onChange={(e) => setFormData((prev) => ({ ...prev, explanation: e.target.value }))}
              />
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

      {/* MODAL 2: BULK JSON IMPORT (FILE UPLOAD + TEXT PASTE) */}
      <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
        <DialogContent className="max-w-2xl rounded-3xl border-slate-200 shadow-2xl p-0 overflow-hidden">
          <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center justify-between">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold font-bengali text-slate-900 flex items-center gap-2">
                <FileJson className="w-5 h-5 text-emerald-600" />
                <span>বাল্ক MCQ ইমপোর্ট (JSON ফরম্যাট)</span>
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setBulkMode('paste')}
                className={`flex-1 py-2 text-xs font-bold font-bengali rounded-lg transition-all cursor-pointer ${
                  bulkMode === 'paste' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                📋 সরাসরি JSON পেস্ট করুন
              </button>
              <button
                type="button"
                onClick={() => setBulkMode('upload')}
                className={`flex-1 py-2 text-xs font-bold font-bengali rounded-lg transition-all cursor-pointer ${
                  bulkMode === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                📁 .json ফাইল আপলোড করুন
              </button>
            </div>

            {/* Template Copy Helper Banner */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-bengali text-emerald-900">
                  সঠিক JSON ফরম্যাট কপি করে প্রশ্নের মান বসিয়ে নিন। ব্যাখ্যা (explanation) সম্পূর্ণ ঐচ্ছিক।
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(SAMPLE_JSON_TEMPLATE);
                  setJsonText(SAMPLE_JSON_TEMPLATE);
                  toast.success('নমুনা JSON টেমপ্লেট লোড ও কপি হয়েছে!');
                }}
                className="h-8 px-3 text-[11px] font-bengali font-bold border-emerald-300 text-emerald-800 bg-white hover:bg-emerald-50 rounded-lg cursor-pointer shrink-0"
              >
                <ClipboardCopy className="w-3 h-3 mr-1" />
                নমুনা টেমপ্লেট
              </Button>
            </div>

            {/* Mode 1: Paste Text */}
            {bulkMode === 'paste' ? (
              <div className="space-y-3">
                <textarea
                  className="w-full h-56 p-3.5 rounded-xl border border-slate-200 font-mono text-xs outline-none focus:border-emerald-600 bg-slate-50/50 leading-relaxed"
                  placeholder="এখানে JSON array পেস্ট করুন: [ { ... }, { ... } ]"
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                />

                {/* Validation Status Preview */}
                {parsedJsonPreview && (
                  <div>
                    {parsedJsonPreview.valid ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold font-bengali">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>সঠিক ফরম্যাট! মোট {parsedJsonPreview.count}টি প্রশ্ন শনাক্ত হয়েছে।</span>
                      </div>
                    ) : (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-bold font-bengali">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{parsedJsonPreview.error}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Mode 2: File Upload */
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-10 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all group relative">
                {bulkUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                    <p className="text-xs font-bold text-emerald-800 font-bengali">প্রশ্নসমূহ প্রসেস হচ্ছে...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-slate-300 group-hover:text-emerald-600 mb-2 transition-colors" />
                    <p className="text-sm font-bold text-slate-700 group-hover:text-emerald-800 font-bengali">
                      ক্লিক করে .json ফাইল নির্বাচন করুন
                    </p>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">Only .json files are supported</p>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleBulkFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </>
                )}
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setIsBulkModalOpen(false)} className="h-10 px-5 rounded-xl font-bengali text-xs">
              বাতিল
            </Button>
            {bulkMode === 'paste' && (
              <Button
                onClick={handleBulkTextSubmit}
                disabled={!parsedJsonPreview?.valid || bulkUploading}
                className="bg-[#006837] hover:bg-[#00522c] text-white h-10 px-6 rounded-xl font-bold font-bengali text-xs shadow-sm cursor-pointer disabled:opacity-50"
              >
                {bulkUploading ? 'ইমপোর্ট হচ্ছে...' : 'ইমপোর্ট সম্পন্ন করুন'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminQuestions;
