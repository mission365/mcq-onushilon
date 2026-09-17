import React, { useEffect, useState } from 'react';
import Navbar from '@/src/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Users,
  GraduationCap,
  ShieldCheck,
  Edit,
  Save,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  BookOpen,
  Filter,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiJson } from '@/src/lib/api';

interface StudentUser {
  id: string;
  email: string;
  fullName: string;
  role: 'student' | 'admin';
  isVerified: boolean;
  isSubscribed?: boolean;
  subscriptionStatus?: string;
  subscriptionCurriculum?: string | null;
  curriculumVersion: 'bangla' | 'english' | 'british' | 'ib' | null;
  academicLevel: 'hsc' | 'ssc' | 'alevel' | 'olevel' | 'dp' | 'myp' | null;
  stream: 'science' | 'commerce' | 'humanities' | 'common' | null;
  createdAt: string;
}

export const AdminStudents: React.FC = () => {
  const [users, setUsers] = useState<StudentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<StudentUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  // Edit form state
  const [editCurriculum, setEditCurriculum] = useState<string>('bangla');
  const [editLevel, setEditLevel] = useState<string>('hsc');
  const [editStream, setEditStream] = useState<string>('science');

  const fetchUsers = async (query = '') => {
    setLoading(true);
    try {
      const qParam = query ? `?q=${encodeURIComponent(query)}` : '';
      const data = await apiJson<StudentUser[]>(`/api/admin/users${qParam}`);
      setUsers(data || []);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      toast.error('শিক্ষার্থীদের তালিকা লোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubscription = async (student: StudentUser, willSubscribe: boolean) => {
    setTogglingUserId(student.id);
    try {
      const res = await apiJson<{ success: boolean; user: StudentUser; message: string }>(
        `/api/admin/users/${student.id}/subscription`,
        {
          method: 'PUT',
          body: JSON.stringify({
            isSubscribed: willSubscribe,
            subscriptionCurriculum: student.curriculumVersion || 'bangla',
          }),
        }
      );
      toast.success(res.message);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === student.id
            ? {
                ...u,
                isSubscribed: willSubscribe,
                subscriptionStatus: willSubscribe ? 'active' : 'free',
              }
            : u
        )
      );
    } catch (err: any) {
      console.error('Failed to toggle subscription:', err);
      toast.error(err.message || 'সাবস্ক্রিপশন আপডেট করতে ব্যর্থ হয়েছে।');
    } finally {
      setTogglingUserId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(searchQuery);
  };

  const handleOpenEdit = (user: StudentUser) => {
    setSelectedUser(user);
    setEditCurriculum(user.curriculumVersion || 'bangla');
    setEditLevel(user.academicLevel || 'hsc');
    setEditStream(user.stream || 'science');
    setIsEditModalOpen(true);
  };

  const handleSaveCurriculum = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const res = await apiJson<any>(`/api/admin/users/${selectedUser.id}/curriculum`, {
        method: 'PUT',
        body: JSON.stringify({
          curriculumVersion: editCurriculum,
          academicLevel: editLevel,
          stream: editStream,
        }),
      });

      toast.success(res.message || 'শিক্ষার্থীর কারিকুলাম সফলভাবে আপডেট হয়েছে।');

      // Update in local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? {
                ...u,
                curriculumVersion: editCurriculum as any,
                academicLevel: editLevel as any,
                stream: editStream as any,
              }
            : u
        )
      );
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error('Failed to update student curriculum:', err);
      toast.error(err.message || 'আপডেট করতে ব্যর্থ হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  const getCurriculumBadge = (version: string | null) => {
    switch (version) {
      case 'bangla':
        return <Badge className="bg-emerald-600 text-white border-none">বাংলা মাধ্যম (NCTB)</Badge>;
      case 'english':
        return <Badge className="bg-blue-600 text-white border-none">English Version (NCTB)</Badge>;
      case 'british':
        return <Badge className="bg-indigo-600 text-white border-none">British (CAIE / Edexcel)</Badge>;
      case 'ib':
        return <Badge className="bg-amber-600 text-white border-none">IB World School</Badge>;
      default:
        return <Badge variant="outline" className="text-slate-400">নির্ধারিত নয়</Badge>;
    }
  };

  const getLevelBadge = (lvl: string | null) => {
    switch (lvl) {
      case 'hsc':
        return <Badge variant="secondary" className="bg-slate-100 text-slate-800 font-bold">HSC (একাদশ-দ্বাদশ)</Badge>;
      case 'ssc':
        return <Badge variant="secondary" className="bg-slate-100 text-slate-800 font-bold">SSC (নবম-দশম)</Badge>;
      case 'alevel':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800 font-bold">A Level</Badge>;
      case 'olevel':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800 font-bold">O Level</Badge>;
      case 'dp':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 font-bold">IB DP</Badge>;
      case 'myp':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 font-bold">IB MYP</Badge>;
      default:
        return <span className="text-slate-400 text-xs">-</span>;
    }
  };

  const getStreamBadge = (stream: string | null) => {
    switch (stream) {
      case 'science':
        return <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200 border">বিজ্ঞান (Science)</Badge>;
      case 'commerce':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border">ব্যবসায় শিক্ষা (Commerce)</Badge>;
      case 'humanities':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 border">মানবিক (Humanities)</Badge>;
      default:
        return <span className="text-slate-400 text-xs">সাধারণ</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar role="admin" />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>অ্যাডমিন ম্যানেজমেন্ট</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 font-bengali">
              শিক্ষার্থী ও কারিকুলাম ম্যানেজমেন্ট
            </h1>
            <p className="text-slate-500 text-sm font-bengali mt-1">
              যেকোনো শিক্ষার্থীর ইমেইল সার্চ করে তাদের কারিকুলাম, পরীক্ষার স্তর ও গ্রুপ সরাসরি পরিবর্তন করুন।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => fetchUsers(searchQuery)}
              variant="outline"
              className="rounded-xl border-slate-200 font-bengali text-slate-700 cursor-pointer"
            >
              রিফ্রেশ করুন
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="rounded-3xl border-slate-200/80 shadow-sm p-4 sm:p-6 bg-white">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="শিক্ষার্থীর ইমেইল (e.g. student@gmail.com) অথবা নাম লিখে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-sm"
              />
            </div>
            <Button
              type="submit"
              className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bengali font-bold gap-2 cursor-pointer shadow-md shadow-blue-600/20"
            >
              <Search className="w-4 h-4" /> সার্চ করুন
            </Button>
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  fetchUsers('');
                }}
                className="h-12 px-4 rounded-2xl text-slate-500 hover:text-slate-800 font-bengali cursor-pointer"
              >
                রিসেট
              </Button>
            )}
          </form>
        </Card>

        {/* Students Table */}
        <Card className="rounded-3xl border-slate-200/80 shadow-sm overflow-hidden bg-white">
          <CardHeader className="p-6 border-b border-slate-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Users className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg font-bold font-bengali text-slate-800">
                শিক্ষার্থীদের তালিকা ({users.length} জন)
              </CardTitle>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              সর্বশেষ ১০০ জন শিক্ষার্থী
            </span>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-sm font-bengali">তথ্য লোড হচ্ছে...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <AlertCircle className="w-10 h-10 mx-auto text-slate-300" />
                <p className="font-bengali font-bold">কোনো শিক্ষার্থী পাওয়া যায়নি</p>
                <p className="text-xs text-slate-400 font-bengali">ইমেইল বা নাম সঠিক আছে কিনা যাচাই করুন।</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-6">নাম ও ইমেইল</th>
                      <th className="py-3.5 px-6">কারিকুলাম</th>
                      <th className="py-3.5 px-6">স্তর (Level)</th>
                      <th className="py-3.5 px-6">বিভাগ (Group)</th>
                      <th className="py-3.5 px-6">সাবস্ক্রিপশন</th>
                      <th className="py-3.5 px-6">ভেরিফিকেশন</th>
                      <th className="py-3.5 px-6 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {users.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">{student.fullName}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{student.email}</div>
                          {student.role === 'admin' && (
                            <Badge className="mt-1 bg-rose-100 text-rose-700 border-none text-[10px]">অ্যাডমিন</Badge>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {getCurriculumBadge(student.curriculumVersion)}
                        </td>
                        <td className="py-4 px-6">
                          {getLevelBadge(student.academicLevel)}
                        </td>
                        <td className="py-4 px-6">
                          {getStreamBadge(student.stream)}
                        </td>
                        <td className="py-4 px-6">
                          {student.isSubscribed ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200 shadow-xs">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> PRO সক্রিয়
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                              ফ্রি ট্রায়াল
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {student.isVerified ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                              <CheckCircle2 className="w-3.5 h-3.5" /> ভেরিফাইড
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                              <XCircle className="w-3.5 h-3.5" /> পেন্ডিং
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {student.isSubscribed ? (
                              <Button
                                onClick={() => handleToggleSubscription(student, false)}
                                disabled={togglingUserId === student.id}
                                size="sm"
                                variant="outline"
                                className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-bengali font-bold gap-1 text-xs cursor-pointer transition-all"
                                title="শিক্ষার্থীর PRO এক্সেস বাতিল করুন"
                              >
                                {togglingUserId === student.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5" />
                                )}
                                আনসাবস্ক্রাইব
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleToggleSubscription(student, true)}
                                disabled={togglingUserId === student.id}
                                size="sm"
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bengali font-bold gap-1 text-xs shadow-xs cursor-pointer transition-all"
                                title="শিক্ষার্থীকে সরাসরি PRO সাবস্ক্রিপশন দিন"
                              >
                                {togglingUserId === student.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Sparkles className="w-3.5 h-3.5" />
                                )}
                                সাবস্ক্রাইব করুন
                              </Button>
                            )}

                            <Button
                              onClick={() => handleOpenEdit(student)}
                              size="sm"
                              variant="outline"
                              className="rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border-blue-200 font-bengali font-bold gap-1.5 cursor-pointer transition-all text-xs"
                            >
                              <Edit className="w-3.5 h-3.5" /> কারিকুলাম
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Curriculum Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6 sm:p-8 border-slate-200">
          <DialogHeader>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              অ্যাডমিন এডিট মোড
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900 font-bengali">
              কারিকুলাম ও গ্রুপ পরিবর্তন
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-bengali pt-1">
              শিক্ষার্থী: <strong className="text-slate-800">{selectedUser?.fullName}</strong> ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4 font-bengali">
            {/* Curriculum Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                ১. কারিকুলাম বা শিক্ষাপদ্ধতি নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'bangla', label: 'বাংলা মাধ্যম (NCTB)' },
                  { id: 'english', label: 'English Version' },
                  { id: 'british', label: 'British (CAIE/Edexcel)' },
                  { id: 'ib', label: 'IB World School' },
                ].map((cur) => (
                  <button
                    key={cur.id}
                    type="button"
                    onClick={() => {
                      setEditCurriculum(cur.id);
                      if (cur.id === 'british') setEditLevel('alevel');
                      else if (cur.id === 'ib') setEditLevel('dp');
                      else setEditLevel('hsc');
                    }}
                    className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      editCurriculum === cur.id
                        ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {cur.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Academic Level Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                ২. শ্রেণি / পরীক্ষার স্তর নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {editCurriculum === 'british' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditLevel('alevel')}
                      className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        editLevel === 'alevel'
                          ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      A Level (Advanced Level)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditLevel('olevel')}
                      className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        editLevel === 'olevel'
                          ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      O Level (Ordinary Level)
                    </button>
                  </>
                ) : editCurriculum === 'ib' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditLevel('dp')}
                      className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        editLevel === 'dp'
                          ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      IB DP (Diploma Programme)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditLevel('myp')}
                      className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        editLevel === 'myp'
                          ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      IB MYP (Middle Years)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditLevel('hsc')}
                      className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        editLevel === 'hsc'
                          ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      HSC (একাদশ - দ্বাদশ শ্রেণি)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditLevel('ssc')}
                      className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        editLevel === 'ssc'
                          ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      SSC (নবম - দশম শ্রেণি)
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Stream / Group Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                ৩. বিভাগ (Group / Stream) নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'science', label: 'বিজ্ঞান (Science)' },
                  { id: 'commerce', label: 'ব্যবসায় শিক্ষা' },
                  { id: 'humanities', label: 'মানবিক' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setEditStream(st.id)}
                    className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      editStream === st.id
                        ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-xl border-slate-200 font-bengali cursor-pointer"
            >
              বাতিল
            </Button>
            <Button
              onClick={handleSaveCurriculum}
              disabled={saving}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bengali font-bold gap-2 cursor-pointer shadow-md"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              পরিবর্তন সংরক্ষণ করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStudents;
