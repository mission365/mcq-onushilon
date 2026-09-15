import React, { useEffect, useState } from 'react';
import { Exam, Subject } from '@/src/types';
import Navbar from '@/src/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Edit2, Trash2, Plus, ArrowLeft, Loader2, ListTree } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { apiJson } from '@/src/lib/api';

const AdminExams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  
  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    serialNumber: 1,
    durationMinutes: 30,
    totalMarks: 25,
    negativeMark: 0.25,
    instructions: '',
    isPublished: false
  });

  const navigate = useNavigate();

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
      toast.error("ডাটা লোড হয়নি");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.subjectId) return toast.error("সবগুলো ঘর পূরণ করুন");
    
    try {
      const payload = {
        ...formData,
        serialNumber: Number(formData.serialNumber),
        durationMinutes: Number(formData.durationMinutes),
        totalMarks: Number(formData.totalMarks),
        negativeMark: Number(formData.negativeMark),
      };

      if (editingExam) {
        await apiJson(`/api/exams/${editingExam.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast.success("আপডেট সফল হয়েছে");
      } else {
        await apiJson('/api/exams', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success("নতুন পরীক্ষা যোগ করা হয়েছে");
      }
      setIsModalOpen(false);
      fetchExams();
    } catch (err) {
      toast.error("সেভ করা যায়নি");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত?")) return;
    try {
      await apiJson(`/api/exams/${id}`, { method: 'DELETE' });
      toast.success("ডিলিট করা হয়েছে");
      fetchExams();
    } catch (err) {
      toast.error("ডিলিট করা যায়নি");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar role="admin" />
      <main className="max-w-7xl w-full mx-auto p-10 space-y-10">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/dashboard')} 
            className="font-bengali gap-2 text-slate-500 hover:text-slate-900 shadow-none -ml-4"
          >
            <ArrowLeft className="w-4 h-4" /> ফিরে যাও
          </Button>
          <Button 
            onClick={() => {
              setEditingExam(null);
              setFormData({
                subjectId: subjects[0]?.id || '',
                title: '',
                serialNumber: exams.length + 1,
                durationMinutes: 30,
                totalMarks: 25,
                negativeMark: 0.25,
                instructions: '',
                isPublished: false
              });
              setIsModalOpen(true);
            }} 
            className="bg-blue-600 hover:bg-blue-700 font-bengali h-12 px-8 rounded-xl font-bold gap-3 shadow-lg shadow-blue-200 border-none text-white transition-all transform hover:translate-y-[-2px]"
          >
            <Plus className="w-5 h-5" /> নতুন পরীক্ষা যোগ করুন
          </Button>
        </div>

        <section>
          <header className="mb-8">
            <h1 className="text-4xl font-bold font-sans text-slate-900 mb-2 tracking-tight">Manage Exams</h1>
            <p className="text-slate-500 font-bengali text-lg">মডেল টেস্ট এবং পরীক্ষার সময়সূচী এখান থেকে নিয়ন্ত্রণ করুন।</p>
          </header>

          <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-white border-0 ring-1 ring-slate-200">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 border-b border-slate-100">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-sans font-black text-[10px] uppercase tracking-[0.2em] py-5 px-8 text-slate-400">SN</TableHead>
                        <TableHead className="font-bengali font-black text-[10px] uppercase tracking-[0.2em] py-5 px-8 text-slate-400">Test Title</TableHead>
                        <TableHead className="font-bengali font-black text-[10px] uppercase tracking-[0.2em] py-5 px-8 text-slate-400">Subject</TableHead>
                        <TableHead className="font-sans font-black text-[10px] uppercase tracking-[0.2em] py-5 px-8 text-slate-400">Settings</TableHead>
                        <TableHead className="font-sans font-black text-[10px] uppercase tracking-[0.2em] py-5 px-8 text-slate-400">Status</TableHead>
                        <TableHead className="text-right font-sans font-black text-[10px] uppercase tracking-[0.2em] py-5 px-8 text-slate-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exams.length > 0 ? (
                        exams.map((exam) => {
                          const sub = subjects.find(s => s.id === exam.subjectId);
                          return (
                            <TableRow key={exam.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                              <TableCell className="py-6 px-8 font-sans font-black text-slate-300">#{exam.serialNumber}</TableCell>
                              <TableCell className="py-6 px-8">
                                <span className="font-bengali font-bold text-slate-900 text-lg">{exam.title}</span>
                              </TableCell>
                              <TableCell className="py-6 px-8">
                                <span className="inline-flex items-center px-3 py-1 bg-slate-100 rounded-lg text-slate-600 font-bengali font-bold text-sm">
                                  {sub?.nameBn || '-'}
                                </span>
                              </TableCell>
                              <TableCell className="py-6 px-8 font-sans text-xs font-semibold text-slate-500">
                                <div className="flex flex-col gap-1">
                                  <span>⏰ {exam.durationMinutes} Min</span>
                                  <span>📝 {exam.totalMarks} Marks</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-6 px-8">
                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${exam.isPublished ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                                  {exam.isPublished ? 'Published' : 'Draft'}
                                </span>
                              </TableCell>
                              <TableCell className="py-6 px-8 text-right space-x-3">
                                <Link to={`/admin/exams/${exam.id}/questions`}>
                                  <Button variant="outline" size="sm" className="font-bengali h-10 px-4 gap-2 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all rounded-xl shadow-none">
                                    <ListTree className="w-4 h-4" /> প্রশ্নসমূহ
                                  </Button>
                                </Link>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-10 w-10 border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all rounded-xl shadow-none"
                                  onClick={() => {
                                    setEditingExam(exam);
                                    setFormData({
                                      subjectId: exam.subjectId,
                                      title: exam.title,
                                      serialNumber: exam.serialNumber,
                                      durationMinutes: exam.durationMinutes,
                                      totalMarks: exam.totalMarks,
                                      negativeMark: exam.negativeMark,
                                      instructions: exam.instructions,
                                      isPublished: exam.isPublished
                                    });
                                    setIsModalOpen(true);
                                  }}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-10 w-10 text-red-500 border-slate-100 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all rounded-xl shadow-none"
                                  onClick={() => handleDelete(exam.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="py-20 text-center text-slate-400 font-bengali text-lg italic">
                            কোনো পরীক্ষা পাওয়া যায়নি। নতুন পরীক্ষা যোগ করুন।
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl rounded-3xl border-slate-200 shadow-2xl p-0 overflow-hidden">
          <div className="bg-slate-50 p-8 border-b border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold font-sans text-slate-900">{editingExam ? 'Edit Exam configuration' : 'Configure New Exam'}</DialogTitle>
            </DialogHeader>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2 col-span-full">
              <Label className="font-sans font-bold text-slate-700 ml-1">Select Subject</Label>
              <select 
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-blue-500 bg-white font-bengali font-bold outline-none"
                value={formData.subjectId}
                onChange={e => setFormData({...formData, subjectId: e.target.value})}
              >
                <option value="">বিষয় নির্বাচন করুন</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.nameBn}</option>)}
              </select>
            </div>
            <div className="space-y-2 col-span-full">
              <Label className="font-bengali font-bold text-slate-700 ml-1">পরীক্ষার শিরোনাম (Title)</Label>
              <Input 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                placeholder="মডেল টেস্ট - ১"
                className="h-12 rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-sans font-bold text-slate-700 ml-1">Serial Number</Label>
              <Input 
                type="number" 
                value={formData.serialNumber} 
                onChange={e => setFormData({...formData, serialNumber: parseInt(e.target.value) || 0})} 
                className="h-12 rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-sans font-bold text-slate-700 ml-1">Duration (Minutes)</Label>
              <Input 
                type="number" 
                value={formData.durationMinutes} 
                onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value) || 0})} 
                className="h-12 rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-sans font-bold text-slate-700 ml-1">Total Marks</Label>
              <Input 
                type="number" 
                value={formData.totalMarks} 
                onChange={e => setFormData({...formData, totalMarks: parseInt(e.target.value) || 0})} 
                className="h-12 rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-sans font-bold text-slate-700 ml-1">Negative Marking</Label>
              <Input 
                type="number" 
                step="0.05" 
                value={formData.negativeMark} 
                onChange={e => setFormData({...formData, negativeMark: parseFloat(e.target.value) || 0})} 
                className="h-12 rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-2 col-span-full">
              <Label className="font-bengali font-bold text-slate-700 ml-1">নির্দেশনাবলি (Instructions)</Label>
              <textarea 
                className="w-full p-4 rounded-xl border border-slate-200 min-h-[120px] font-bengali ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="পরীক্ষার নিয়মাবলী এখানে লিখুন..."
                value={formData.instructions}
                onChange={e => setFormData({...formData, instructions: e.target.value})}
              />
            </div>
            <div className="flex items-center gap-3 p-5 bg-slate-50 rounded-2xl border border-slate-200 col-span-full">
              <Checkbox 
                id="published" 
                checked={formData.isPublished} 
                onCheckedChange={(val) => setFormData({...formData, isPublished: !!val})} 
                className="w-6 h-6 border-slate-300 data-[state=checked]:bg-green-600"
              />
              <Label htmlFor="published" className="cursor-pointer font-bold text-slate-700">অনলাইনে প্রকাশ করুন (Publish now)</Label>
            </div>
          </div>
          
          <div className="p-8 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="h-14 bg-white border border-slate-200 text-slate-600 flex-1 rounded-2xl font-bold">
              বাতিল
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 h-14 flex-1 rounded-2xl font-bold shadow-lg shadow-blue-200 border-none text-white transition-all transform hover:translate-y-[-2px]">
              সংরক্ষণ করুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminExams;
