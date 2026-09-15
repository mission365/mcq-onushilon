import React, { useCallback, useEffect, useState } from 'react';
import {
  Edit2,
  Trash2,
  Plus,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Upload,
  FileJson,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';

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
  findValueByAliases,
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

const AdminQuestions = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<QuestionLookup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionLookup | null>(null);
  const [formData, setFormData] = useState<QuestionFormState>(createEmptyFormData(1));
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
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

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !examId) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) {
          throw new Error('JSON must be an array of questions');
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

  const handleSave = async () => {
    if (!examId) {
      toast.error('পরীক্ষা পাওয়া যায়নি');
      return;
    }

    if (!formData.questionText || !formData.optionA || !formData.correctOption) {
      toast.error('সবগুলো ঘর পূরণ করুন');
      return;
    }

    try {
      const normalizedStimulus = formData.stimulus.trim();
      const payload = {
        ...formData,
        stimulus: normalizedStimulus,
        serialNumber: Number(formData.serialNumber),
      };

      if (editingQuestion) {
        await apiJson(`/api/questions/${editingQuestion.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast.success('আপডেট সফল হয়েছে');
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
      toast.error('সেভ করা যায়নি');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত?')) return;

    try {
      await apiJson(`/api/questions/${id}`, { method: 'DELETE' });
      toast.success('ডিলিট করা হয়েছে');
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
      stimulus: getQuestionStimulus(question),
      questionText: question.questionText,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      correctOption: question.correctOption,
      explanation: question.explanation || '',
      serialNumber: question.serialNumber,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar role="admin" />

      <main className="max-w-7xl w-full mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/exams')}
            className="font-bengali gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> ফিরে যাও
          </Button>

          <div className="flex items-center gap-2 sm:gap-4">
            {exam && (
              <span className="text-gray-500 font-bengali hidden sm:block">
                পরীক্ষা: <b>{exam.title}</b>
              </span>
            )}

            <Button
              variant="outline"
              onClick={() => setIsBulkModalOpen(true)}
              className="font-bengali gap-2 border-dashed border-2"
            >
              <Upload className="w-4 h-4" /> বাল্ক আপলোড
            </Button>

            <Button onClick={handleOpenCreateModal} className="bg-blue-600 font-bengali gap-2">
              <Plus className="w-4 h-4" /> নতুন প্রশ্ন
            </Button>
          </div>
        </div>

        <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-bold font-sans">
              Manage Questions ({questions.length})
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex justify-center p-10">
                <Loader2 className="animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-16">SN</TableHead>
                      <TableHead>উদ্দীপক ও প্রশ্ন</TableHead>
                      <TableHead>Options (Correct marked)</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {questions.map((question) => {
                      const stimulusText = getQuestionStimulus(question);

                      return (
                        <TableRow key={question.id}>
                          <TableCell className="font-sans font-bold">
                            {question.serialNumber}
                          </TableCell>

                          <TableCell className="max-w-md">
                            {stimulusText && (
                              <div className="mb-3 rounded-xl border border-amber-100 bg-amber-50 p-3">
                                <p className="mb-1 text-[11px] font-bold text-amber-700 font-bengali">
                                  উদ্দীপক
                                </p>
                                <p className="text-sm leading-relaxed text-slate-700 font-bengali whitespace-pre-line">
                                  {stimulusText}
                                </p>
                              </div>
                            )}

                            <p className="font-bengali font-bold whitespace-pre-line">
                              {question.questionText}
                            </p>
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-wrap gap-2 text-xs">
                              {(['a', 'b', 'c', 'd'] as const).map((option) => {
                                const isCorrect = question.correctOption === option;
                                const optionText = getOptionText(question, option);

                                return (
                                  <Badge
                                    key={option}
                                    variant={isCorrect ? 'default' : 'outline'}
                                    className={`font-bengali h-auto py-1 ${
                                      isCorrect
                                        ? 'bg-green-600 border-green-600'
                                        : 'text-slate-500'
                                    }`}
                                  >
                                    {option.toUpperCase()}: {optionText || (
                                      <span className="text-slate-300 italic opacity-50">
                                        Empty
                                      </span>
                                    )}
                                  </Badge>
                                );
                              })}
                            </div>
                          </TableCell>

                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditModal(question)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500"
                              onClick={() => handleDelete(question.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
        <DialogContent className="max-w-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-sans flex items-center gap-2">
              <FileJson className="w-6 h-6 text-blue-600" />
              Bulk Import via JSON
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-blue-50 p-4 rounded-xl space-y-2">
              <p className="text-sm font-semibold text-blue-800 font-bengali">
                ফরম্যাট অনুসরণ করুন:
              </p>

              <pre className="text-[10px] bg-white p-3 rounded-lg border border-blue-100 overflow-x-auto text-blue-900">
{`[
  {
    "uddipok": "উদ্দীপক এখানে...",
    "questionText": "প্রশ্ন এখানে...",
    "optionA": "অপশন ১",
    "optionB": "অপশন ২",
    "optionC": "অপশন ৩",
    "optionD": "অপশন ৪",
    "correctOption": "a",
    "explanation": "ব্যাখ্যা এখানে...",
    "serialNumber": 1
  }
]`}
              </pre>

              <p className="text-[11px] text-blue-600 italic font-bengali mt-2">
                * correctOption এ ছোট হাতের a, b, c অথবা d ব্যবহার করুন।
              </p>
              <p className="text-[11px] text-blue-600 italic font-bengali">
                * `uddipok` এর বদলে `stimulus` key দিলেও একইভাবে কাজ করবে।
              </p>
            </div>

            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-8 hover:border-blue-400 hover:bg-blue-50 transition-all group relative">
              {bulkUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                  <p className="text-sm font-bold text-blue-600 font-sans">
                    Uploading Questions...
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-400 group-hover:text-blue-500 mb-2" />
                  <p className="text-sm font-bold text-gray-600 group-hover:text-blue-700 font-bengali">
                    ক্লিক করুন অথবা ফাইল ড্র্যাগ করুন
                  </p>
                  <p className="text-xs text-gray-400 font-sans">
                    Only .json files are supported
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleBulkUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-sans">
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-2 col-span-full">
              <Label className="font-bengali">উদ্দীপক (Stimulus)</Label>
              <textarea
                className="w-full p-3 rounded-md border border-gray-200 min-h-[100px] font-bengali"
                value={formData.stimulus}
                onChange={(e) => setFormData({ ...formData, stimulus: e.target.value })}
              />
            </div>

            <div className="space-y-2 col-span-full">
              <Label className="font-bengali">প্রশ্ন (Question Text)</Label>
              <textarea
                className="w-full p-3 rounded-md border border-gray-200 min-h-[80px] font-bengali"
                value={formData.questionText}
                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              />
            </div>

            {(['a', 'b', 'c', 'd'] as const).map((option) => {
              const optionKey = `option${option.toUpperCase()}` as 'optionA' | 'optionB' | 'optionC' | 'optionD';

              return (
                <div key={option} className="space-y-2">
                  <Label className="font-sans flex items-center justify-between">
                    Option {option.toUpperCase()}
                    <Button
                      variant={formData.correctOption === option ? 'default' : 'outline'}
                      size="sm"
                      className={`h-7 text-xs rounded-full ${
                        formData.correctOption === option ? 'bg-green-600 hover:bg-green-700' : ''
                      }`}
                      onClick={() => setFormData({ ...formData, correctOption: option })}
                    >
                      {formData.correctOption === option ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : null}
                      Correct Answer
                    </Button>
                  </Label>

                  <Input
                    value={formData[optionKey]}
                    onChange={(e) => setFormData({ ...formData, [optionKey]: e.target.value })}
                    className="font-bengali"
                  />
                </div>
              );
            })}

            <div className="space-y-2 col-span-full">
              <Label className="font-bengali">ব্যাখ্যা (Explanation)</Label>
              <textarea
                className="w-full p-3 rounded-md border border-gray-200 min-h-[100px] font-bengali"
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Serial Number</Label>
              <Input
                type="number"
                value={formData.serialNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    serialNumber: parseInt(e.target.value, 10) || 0,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600">
              Save Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminQuestions;
