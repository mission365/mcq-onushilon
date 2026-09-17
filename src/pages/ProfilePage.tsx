import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/src/components/layout/Navbar';
import { useAuthStore } from '@/src/lib/authStore';
import { apiJson } from '@/src/lib/api';
import { Button } from '@/components/ui/button';
import {
  User,
  Mail,
  Phone,
  School,
  GraduationCap,
  Award,
  ShieldCheck,
  Lock,
  Calendar,
  Clock,
  CheckCircle2,
  Trophy,
  Flame,
  KeyRound,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  Save,
  Compass,
  Globe2,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface ExamAttemptItem {
  id: string;
  examId: string;
  score: number | string;
  totalAttempted: number;
  correctCount: number;
  wrongCount: number;
  status: string;
  submittedAt: string;
  examTitle: string;
  totalMarks: number;
  examType: string;
  subjectName: string;
  subjectNameBn: string;
}

interface UserProfileData {
  id: string;
  email: string;
  fullName: string;
  role: string;
  phone?: string | null;
  institution?: string | null;
  isVerified: boolean;
  curriculumVersion?: string | null;
  academicLevel?: string | null;
  stream?: string | null;
  createdAt: string;
}

const toBnNumber = (n: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
};

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, login, token } = useAuthStore();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [recentAttempts, setRecentAttempts] = useState<ExamAttemptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'history'>('info');

  // Edit form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [savingInfo, setSavingInfo] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    completedExams: 0,
    avgScore: 0,
    streakDays: 0,
    totalAttempts: 0,
    totalQuestionsAttempted: 0,
    totalCorrect: 0,
    totalWrong: 0,
  });

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [profileRes, statsRes] = await Promise.all([
        apiJson<{ user: UserProfileData; recentAttempts: ExamAttemptItem[] }>('/api/user/profile'),
        apiJson<typeof stats>('/api/user/stats'),
      ]);

      if (profileRes?.user) {
        setProfile(profileRes.user);
        setFullName(profileRes.user.fullName || '');
        setPhone(profileRes.user.phone || '');
        setInstitution(profileRes.user.institution || '');
        setRecentAttempts(profileRes.recentAttempts || []);
      }
      if (statsRes) {
        setStats(statsRes);
      }
    } catch (err: any) {
      console.error('Failed to load profile data:', err);
      toast.error('প্রোফাইল তথ্য লোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('সম্পূর্ণ নাম প্রদান করুন।');
      return;
    }

    setSavingInfo(true);
    try {
      const res = await apiJson<{ success: boolean; user: any; token?: string; message: string }>(
        '/api/user/profile',
        {
          method: 'PUT',
          body: JSON.stringify({
            fullName: fullName.trim(),
            phone: phone.trim(),
            institution: institution.trim(),
          }),
        }
      );

      if (res?.success) {
        toast.success(res.message || 'প্রোফাইল সফলভাবে আপডেট হয়েছে!');
        if (res.user && token) {
          login(res.token || token, res.user);
        }
        setProfile((prev) => (prev ? { ...prev, fullName, phone, institution } : null));
      }
    } catch (err: any) {
      toast.error(err.message || 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('বর্তমান এবং নতুন উভয় পাসওয়ার্ড প্রদান করুন।');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('নতুন পাসওয়ার্ড ও নিশ্চিতকরণ পাসওয়ার্ড মিলছে না।');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await apiJson<{ success: boolean; message: string }>(
        '/api/user/change-password',
        {
          method: 'PUT',
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      if (res?.success) {
        toast.success(res.message || 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      toast.error(err.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।');
    } finally {
      setSavingPassword(false);
    }
  };

  const getCurriculumBadge = (version?: string | null) => {
    switch (version) {
      case 'british':
        return {
          title: 'British Curriculum',
          desc: 'CAIE / Pearson Edexcel',
          badge: 'bg-amber-100 text-amber-900 border-amber-200',
          icon: Award,
        };
      case 'ib':
        return {
          title: 'IB Curriculum',
          desc: 'International Baccalaureate (DP / MYP)',
          badge: 'bg-purple-100 text-purple-900 border-purple-200',
          icon: Compass,
        };
      case 'english':
        return {
          title: 'English Version',
          desc: 'NCTB National Curriculum (English Medium)',
          badge: 'bg-cyan-100 text-cyan-900 border-cyan-200',
          icon: Globe2,
        };
      case 'bangla':
      default:
        return {
          title: 'বাংলা মাধ্যম',
          desc: 'জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB)',
          badge: 'bg-blue-100 text-blue-900 border-blue-200',
          icon: BookOpen,
        };
    }
  };

  const getStreamBadge = (stream?: string | null) => {
    switch (stream) {
      case 'science':
        return { label: 'বিজ্ঞান বিভাগ (Science)', bg: 'bg-cyan-50 text-cyan-800 border-cyan-200' };
      case 'commerce':
        return { label: 'ব্যবসায় শিক্ষা (Business Studies)', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'humanities':
        return { label: 'মানবিক বিভাগ (Humanities)', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      default:
        return { label: 'সাধারণ / আবশ্যিক', bg: 'bg-slate-50 text-slate-800 border-slate-200' };
    }
  };

  const currInfo = getCurriculumBadge(profile?.curriculumVersion || user?.curriculumVersion);
  const streamInfo = getStreamBadge(profile?.stream || user?.stream);
  const CurrIcon = currInfo.icon;

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
            <span>ড্যাশবোর্ডে ফিরে যান</span>
          </Link>
        </div>

        {/* Profile Hero Header Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Avatar Icon */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-md shadow-blue-500/20 shrink-0">
                {(profile?.fullName || user?.fullName || 'U').charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {profile?.fullName || user?.fullName || 'শিক্ষার্থী'}
                  </h1>
                  {profile?.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ভেরিফাইড
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase">
                    {profile?.role === 'admin' ? 'অ্যাডমিন' : 'শিক্ষার্থী'}
                  </span>
                </div>
                <p className="text-slate-500 text-sm flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {profile?.email || user?.email}
                </p>
                {profile?.createdAt && (
                  <p className="text-slate-400 text-xs mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    যুক্ত হয়েছেন: {new Date(profile.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>
            </div>

            {/* Quick stats mini-chips on header */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <div className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-100 text-center">
                <div className="text-base sm:text-lg font-bold text-blue-900">
                  {toBnNumber(stats.completedExams)}টি
                </div>
                <div className="text-[11px] text-blue-600 font-medium">সমাপ্ত পরীক্ষা</div>
              </div>
              <div className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                <div className="text-base sm:text-lg font-bold text-emerald-900">
                  {toBnNumber(stats.avgScore)}%
                </div>
                <div className="text-[11px] text-emerald-600 font-medium">গড় স্কোর</div>
              </div>
              <div className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-100 text-center">
                <div className="text-base sm:text-lg font-bold text-amber-900">
                  {toBnNumber(stats.streakDays)} দিন
                </div>
                <div className="text-[11px] text-amber-600 font-medium">স্ট্রিক 🔥</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Left Column (Academic & Exam Info) + Right Column (Tabs: Edit, Security, History) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column: Academic & Curriculum Configuration (Locked) */}
          <div className="space-y-6">
            {/* Academic & Curriculum Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">পরীক্ষা ও কারিকুলাম তথ্য</h2>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  <Lock className="w-3 h-3 text-slate-500" />
                  স্থায়ী লক
                </span>
              </div>

              {/* Curriculum Version */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  নির্ধারিত কারিকুলাম (Curriculum)
                </label>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <CurrIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{currInfo.title}</div>
                    <div className="text-xs text-slate-500">{currInfo.desc}</div>
                  </div>
                </div>
              </div>

              {/* Academic Level */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  পরীক্ষার স্তর (Academic Level)
                </label>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-900 uppercase">
                    {(profile?.academicLevel || user?.academicLevel || 'HSC').toUpperCase()}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
                    অনুমোদিত স্তর
                  </span>
                </div>
              </div>

              {/* Stream / Group */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  বিভাগ (Stream / Group)
                </label>
                <div className={`p-3 rounded-2xl border text-sm font-bold ${streamInfo.bg}`}>
                  {streamInfo.label}
                </div>
              </div>

              {/* Security Lock Explanation Box */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  কেন এটি স্থায়ীভাবে সংরক্ষিত?
                </div>
                <p className="text-amber-800/90 text-[11px]">
                  পরীক্ষার বিষয় ও প্রশ্নাবলির সর্বোচ্চ নির্ভুলতা বজায় রাখতে শিক্ষার্থীদের পরীক্ষার স্তর ও বিভাগ প্রথমবার নির্বাচনের পর স্থায়ীভাবে লক হয়ে যায়। জরুরি প্রয়োজনে পরিবর্তনের জন্য অ্যাডমিন প্যানেলে যোগাযোগ করুন।
                </p>
              </div>
            </div>

            {/* Performance Overview Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900">পারফরম্যান্স সারসংক্ষেপ</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-500 mb-0.5">মোট প্রশ্ন উত্তর</div>
                  <div className="text-lg font-bold text-slate-900">
                    {toBnNumber(stats.totalQuestionsAttempted)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-500 mb-0.5">মোট পরীক্ষা অংশগ্রহণ</div>
                  <div className="text-lg font-bold text-slate-900">
                    {toBnNumber(stats.totalAttempts)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="text-xs text-emerald-600 mb-0.5">সঠিক উত্তর</div>
                  <div className="text-lg font-bold text-emerald-800">
                    {toBnNumber(stats.totalCorrect)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                  <div className="text-xs text-rose-600 mb-0.5">ভুল উত্তর</div>
                  <div className="text-lg font-bold text-rose-800">
                    {toBnNumber(stats.totalWrong)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Tabs (Edit Profile, Security, Exam History) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs Selector */}
            <div className="flex items-center gap-2 bg-slate-200/70 p-1.5 rounded-2xl overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'info'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                ব্যক্তিগত তথ্য
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('password')}
                className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'password'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                পাসওয়ার্ড পরিবর্তন
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'history'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-4 h-4" />
                পরীক্ষার ইতিহাস ({recentAttempts.length})
              </button>
            </div>

            {/* TAB 1: Edit Personal Information */}
            {activeTab === 'info' && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">ব্যক্তিগত প্রোফাইল তথ্য</h2>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                    তোমার নাম, মোবাইল নম্বর ও শিক্ষা প্রতিষ্ঠানের তথ্য আপডেট করো।
                  </p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      সম্পূর্ণ নাম (Full Name) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="আপনার নাম লিখুন"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      ইমেইল ঠিকানা (Email - অপরিবর্তনযোগ্য)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        disabled
                        value={profile?.email || user?.email || ''}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      মোবাইল নম্বর (Phone Number)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="০১৭XXXXXXXX"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      শিক্ষা প্রতিষ্ঠান / কলেজ (School / College)
                    </label>
                    <div className="relative">
                      <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="উদা: নটর ডেম কলেজ / ঢাকা কলেজ"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={savingInfo}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl gap-2 shadow-sm shadow-blue-500/20 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      {savingInfo ? 'সংরক্ষণ করা হচ্ছে...' : 'তথ্য সংরক্ষণ করুন'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: Change Password */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">পাসওয়ার্ড পরিবর্তন</h2>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                    আপনার অ্যাকাউন্টের সুরক্ষার জন্য নিয়মিত শক্তিশালী পাসওয়ার্ড ব্যবহার করুন।
                  </p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      বর্তমান পাসওয়ার্ড <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="বর্তমান পাসওয়ার্ড দিন"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="নতুন শক্তিশালী পাসওয়ার্ড দিন"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      নতুন পাসওয়ার্ড পুনরায় লিখুন <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="পুনরায় নতুন পাসওয়ার্ড লিখুন"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={savingPassword}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl gap-2 shadow-sm shadow-blue-500/20 cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4" />
                      {savingPassword ? 'পরিবর্তন করা হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: Recent Exam History */}
            {activeTab === 'history' && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">পূর্বের পরীক্ষার ফলাফল ও ইতিহাস</h2>
                    <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                      তোমার দেওয়া সাম্প্রতিক পরীক্ষাগুলোর স্কোর এবং বিশ্লেষণের তালিকা।
                    </p>
                  </div>
                </div>

                {recentAttempts.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                    <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-700">এখনও কোনো পরীক্ষা দেওয়া হয়নি</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      ড্যাশবোর্ড থেকে তোমার সিলেবাসের যেকোনো বিষয়ের মডেল টেস্ট বা বোর্ড প্রশ্ন অনুশীলন শুরু করো।
                    </p>
                    <Link to="/dashboard" className="inline-block mt-4">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-1.5 cursor-pointer">
                        পরীক্ষা শুরু করুন
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentAttempts.map((attempt) => {
                      const percentage = attempt.totalMarks > 0
                        ? Math.round((Number(attempt.score) / attempt.totalMarks) * 100)
                        : 0;

                      return (
                        <div
                          key={attempt.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-200 transition-all gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                {attempt.subjectNameBn || attempt.subjectName}
                              </span>
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(attempt.submittedAt).toLocaleDateString('bn-BD', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">{attempt.examTitle}</h4>
                            <div className="text-xs text-slate-500 flex items-center gap-3">
                              <span>মোট উত্তর: {toBnNumber(attempt.totalAttempted)}</span>
                              <span className="text-emerald-600 font-medium">সঠিক: {toBnNumber(attempt.correctCount)}</span>
                              <span className="text-rose-600 font-medium">ভুল: {toBnNumber(attempt.wrongCount)}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                            <div className="text-right">
                              <div className="text-base font-bold text-slate-900">
                                {toBnNumber(attempt.score)} / {toBnNumber(attempt.totalMarks)}
                              </div>
                              <div className={`text-xs font-bold ${
                                percentage >= 80 ? 'text-emerald-600' : percentage >= 50 ? 'text-blue-600' : 'text-amber-600'
                              }`}>
                                {toBnNumber(percentage)}% নম্বর
                              </div>
                            </div>

                            <Link to={`/exam/${attempt.id}/result`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-xl text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 gap-1 h-8 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                ফলাফল
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
