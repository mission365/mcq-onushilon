import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../lib/authStore';
import { apiJson } from '../lib/api';
import { CurriculumVersion, AcademicLevel } from '../types';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Globe2,
  Award,
  Compass,
  ShieldCheck,
} from 'lucide-react';

import { toast } from 'sonner';

export const SelectVersionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setCurriculumVersion, setAcademicLevel, setStream } = useAuthStore();

  useEffect(() => {
    if (user?.curriculumVersion && user?.role !== 'admin') {
      toast.info('আপনার কারিকুলাম ও পরীক্ষার স্তর ইতিমধ্যেই স্থায়ীভাবে সংরক্ষিত রয়েছে।');
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const [selectedVersion, setSelectedVersion] = useState<CurriculumVersion>(
    user?.curriculumVersion || 'bangla'
  );

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

  const [selectedLevel, setSelectedLevel] = useState<AcademicLevel>(
    user?.academicLevel || getDefaultLevelForVersion(user?.curriculumVersion || 'bangla')
  );

  const [selectedStream, setSelectedStream] = useState<'science' | 'commerce' | 'humanities'>(
    (user?.stream as any) || 'science'
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVersionChange = (newVersion: CurriculumVersion) => {
    setSelectedVersion(newVersion);
    setSelectedLevel(getDefaultLevelForVersion(newVersion));
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await apiJson('/api/user/curriculum-version', {
        method: 'PUT',
        body: JSON.stringify({
          curriculumVersion: selectedVersion,
          academicLevel: selectedLevel,
          stream: selectedStream,
        }),
      });
      setCurriculumVersion(selectedVersion);
      setAcademicLevel(selectedLevel);
      setStream(selectedStream);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Failed to save selected curriculum and level.');
    } finally {
      setLoading(false);
    }
  };

  const isEnglishUi = selectedVersion !== 'bangla';

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/40 via-white to-slate-50 font-sans">
      <div className="max-w-4xl w-full mx-auto">
        <div className="flex justify-center mb-6">
          <Link to="/">
            <img
              src="/images/logo.png"
              alt="MCQ Onushilon"
              className="h-11 w-auto object-contain hover:opacity-90 transition-opacity"
            />
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-3 shadow-xs">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>
              {isEnglishUi
                ? 'Curriculum & Academic Stream Onboarding'
                : 'পাঠ্যক্রম ও শিক্ষাপদ্ধতি নির্বাচন'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-bengali">
            {isEnglishUi
              ? 'Select Your Education Curriculum & Level'
              : 'আপনার পাঠ্যক্রম (কারিকুলাম) ও শ্রেণি নির্বাচন করুন'}
          </h1>
          <p className="mt-2.5 text-slate-600 text-sm sm:text-base max-w-2xl mx-auto font-bengali">
            {isEnglishUi
              ? 'Choose your specific education system in Bangladesh to receive strictly isolated syllabus, MCQs, and past papers tailored to your exams.'
              : 'বাংলাদেশে ইংরেজি ও বাংলা মাধ্যমের নির্দিষ্ট কারিকুলাম অনুযায়ী আলাদা সিলেবাস ও নির্ভুল প্রশ্ন পেতে আপনার সঠিক শিক্ষাপদ্ধতি নির্বাচন করুন।'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2 font-bengali">
            <span>{error}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* Step 1: Curriculum Selection (4 Distinct Curriculums) */}
        {/* ============================================================ */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 font-bengali flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-sans font-bold">1</span>
              <span>{isEnglishUi ? 'Choose Your Curriculum:' : 'আপনার কারিকুলাম বা শিক্ষাপদ্ধতি নির্বাচন করুন:'}</span>
            </label>
            <span className="text-xs text-slate-400 font-medium">
              {isEnglishUi ? '4 Separate Systems' : '৪টি ভিন্ন শিক্ষাপদ্ধতি'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Bangla Medium (NCTB) */}
            <div
              onClick={() => handleVersionChange('bangla')}
              className={`relative rounded-3xl p-6 border-2 cursor-pointer transition-all duration-200 bg-white flex flex-col justify-between ${
                selectedVersion === 'bangla'
                  ? 'border-blue-600 shadow-lg shadow-blue-600/10 ring-2 ring-blue-600/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  {selectedVersion === 'bangla' && <CheckCircle2 className="w-6 h-6 text-blue-600" />}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-slate-900 font-bengali">বাংলা মাধ্যম (NCTB)</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">জাতীয় শিক্ষাক্রম</span>
                </div>
                <p className="text-xs font-semibold text-slate-500 mb-2 font-sans">
                  National Curriculum in Bengali (SSC & HSC)
                </p>
                <p className="text-xs text-slate-600 font-bengali leading-relaxed">
                  বাংলাদেশ সরকারের সরকারি পাঠ্যবই ও ৮টি সাধারণ শিক্ষা বোর্ডের অধীনে অনুষ্ঠিত এসএসসি ও এইচএসসি পরীক্ষার পূর্ণাঙ্গ প্রস্তুতি।
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-bengali">
                <span>বোর্ড: সাধারণ শিক্ষা বোর্ড</span>
                <span className="font-semibold text-blue-600">SSC • HSC</span>
              </div>
            </div>

            {/* 2. English Version (NCTB) */}
            <div
              onClick={() => handleVersionChange('english')}
              className={`relative rounded-3xl p-6 border-2 cursor-pointer transition-all duration-200 bg-white flex flex-col justify-between ${
                selectedVersion === 'english'
                  ? 'border-blue-600 shadow-lg shadow-blue-600/10 ring-2 ring-blue-600/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
                    <Globe2 className="w-5 h-5" />
                  </div>
                  {selectedVersion === 'english' && <CheckCircle2 className="w-6 h-6 text-blue-600" />}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-slate-900 font-sans">English Version (NCTB)</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">National (EV)</span>
                </div>
                <p className="text-xs font-semibold text-slate-500 mb-2 font-sans">
                  National Curriculum Translated to English (SSC & HSC)
                </p>
                <p className="text-xs text-slate-600 font-bengali leading-relaxed">
                  জাতীয় শিক্ষাক্রমের সরকারি বইগুলোর ইংরেজি অনুবাদ সংস্করণ। সাধারণ শিক্ষা বোর্ডের অধীনে ইংরেজিতে প্রশ্নপত্র হয়।
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-sans">
                <span>Boards: 8 General Education Boards</span>
                <span className="font-semibold text-blue-600">SSC • HSC (English)</span>
              </div>
            </div>

            {/* 3. British Curriculum (English Medium — O Level / A Level) */}
            <div
              onClick={() => handleVersionChange('british')}
              className={`relative rounded-3xl p-6 border-2 cursor-pointer transition-all duration-200 bg-white flex flex-col justify-between ${
                selectedVersion === 'british'
                  ? 'border-blue-600 shadow-lg shadow-blue-600/10 ring-2 ring-blue-600/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold border border-purple-100">
                    <Award className="w-5 h-5" />
                  </div>
                  {selectedVersion === 'british' && <CheckCircle2 className="w-6 h-6 text-blue-600" />}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-slate-900 font-sans">British Curriculum</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-sans">O / A Level</span>
                </div>
                <p className="text-xs font-semibold text-slate-500 mb-2 font-sans">
                  Cambridge Assessment & Pearson Edexcel (UK)
                </p>
                <p className="text-xs text-slate-600 font-bengali leading-relaxed">
                  যুক্তরাজ্যের আন্তর্জাতিক পাঠ্যপদ্ধতি। ১০ম শ্রেণি সমমানে O Level এবং ১২তম শ্রেণি সমমানে A Level পরীক্ষা পরিচালিত হয় British Council-এর মাধ্যমে।
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-sans">
                <span>Boards: Cambridge (CAIE) & Edexcel</span>
                <span className="font-semibold text-purple-600">O Level • A Level</span>
              </div>
            </div>

            {/* 4. IB Curriculum (International Baccalaureate) */}
            <div
              onClick={() => handleVersionChange('ib')}
              className={`relative rounded-3xl p-6 border-2 cursor-pointer transition-all duration-200 bg-white flex flex-col justify-between ${
                selectedVersion === 'ib'
                  ? 'border-blue-600 shadow-lg shadow-blue-600/10 ring-2 ring-blue-600/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-100">
                    <Compass className="w-5 h-5" />
                  </div>
                  {selectedVersion === 'ib' && <CheckCircle2 className="w-6 h-6 text-blue-600" />}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-slate-900 font-sans">IB Curriculum</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-sans">MYP / DP</span>
                </div>
                <p className="text-xs font-semibold text-slate-500 mb-2 font-sans">
                  International Baccalaureate (Switzerland)
                </p>
                <p className="text-xs text-slate-600 font-bengali leading-relaxed">
                  সুইজারল্যান্ড ভিত্তিক আধুনিক বৈশ্বিক শিক্ষাপদ্ধতি (ISD, Aga Khan ইত্যাদি প্রিমিয়াম স্কুল)। প্রজেক্ট ও গবেষণাভিত্তিক MYP ও IB Diploma Programme (DP)।
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-sans">
                <span>Framework: International Baccalaureate</span>
                <span className="font-semibold text-amber-600">IB MYP • IB DP</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Step 2: Academic Level Selection (Dynamic per Curriculum) */}
        {/* ============================================================ */}
        <div className="mb-10">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 font-bengali mb-3 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-sans font-bold">2</span>
            <span>{isEnglishUi ? 'Select Academic Level / Class:' : 'আপনার শ্রেণি / পরীক্ষার স্তর নির্বাচন করুন:'}</span>
          </label>

          {/* NCTB (Bangla & English Version): HSC vs SSC */}
          {(selectedVersion === 'bangla' || selectedVersion === 'english') && (
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedLevel('hsc')}
                className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  selectedLevel === 'hsc'
                    ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-black text-blue-600 font-sans">HSC</span>
                  {selectedLevel === 'hsc' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                </div>
                <p className="text-base sm:text-lg font-bold text-slate-900 font-bengali">
                  {selectedVersion === 'english' ? 'Class 11 - 12 (Higher Secondary)' : 'একাদশ - দ্বাদশ শ্রেণি (এইচএসসি)'}
                </p>
                <p className="text-xs text-slate-500 font-sans mt-0.5">Higher Secondary Certificate</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLevel('ssc')}
                className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  selectedLevel === 'ssc'
                    ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-black text-blue-600 font-sans">SSC</span>
                  {selectedLevel === 'ssc' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                </div>
                <p className="text-base sm:text-lg font-bold text-slate-900 font-bengali">
                  {selectedVersion === 'english' ? 'Class 9 - 10 (Secondary)' : 'নবম - দশম শ্রেণি (এসএসসি)'}
                </p>
                <p className="text-xs text-slate-500 font-sans mt-0.5">Secondary School Certificate</p>
              </button>
            </div>
          )}

          {/* British Curriculum: A Level vs O Level */}
          {selectedVersion === 'british' && (
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedLevel('alevel')}
                className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  selectedLevel === 'alevel'
                    ? 'border-purple-600 bg-purple-50/60 shadow-md ring-2 ring-purple-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-black text-purple-600 font-sans">A Level</span>
                  {selectedLevel === 'alevel' && <CheckCircle2 className="w-5 h-5 text-purple-600" />}
                </div>
                <p className="text-base sm:text-lg font-bold text-slate-900 font-sans">Advanced Level (Year 12 - 13)</p>
                <p className="text-xs text-slate-500 font-sans mt-0.5">HSC Equivalent International Qualification</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLevel('olevel')}
                className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  selectedLevel === 'olevel'
                    ? 'border-purple-600 bg-purple-50/60 shadow-md ring-2 ring-purple-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-black text-purple-600 font-sans">O Level</span>
                  {selectedLevel === 'olevel' && <CheckCircle2 className="w-5 h-5 text-purple-600" />}
                </div>
                <p className="text-base sm:text-lg font-bold text-slate-900 font-sans">Ordinary Level / IGCSE (Year 10 - 11)</p>
                <p className="text-xs text-slate-500 font-sans mt-0.5">SSC Equivalent International Qualification</p>
              </button>
            </div>
          )}

          {/* IB Curriculum: IB DP vs IB MYP */}
          {selectedVersion === 'ib' && (
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedLevel('dp')}
                className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  selectedLevel === 'dp'
                    ? 'border-amber-600 bg-amber-50/60 shadow-md ring-2 ring-amber-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-black text-amber-600 font-sans">IB DP</span>
                  {selectedLevel === 'dp' && <CheckCircle2 className="w-5 h-5 text-amber-600" />}
                </div>
                <p className="text-base sm:text-lg font-bold text-slate-900 font-sans">Diploma Programme (Grade 11 - 12)</p>
                <p className="text-xs text-slate-500 font-sans mt-0.5">A Level / HSC Equivalent IB Qualification</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLevel('myp')}
                className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  selectedLevel === 'myp'
                    ? 'border-amber-600 bg-amber-50/60 shadow-md ring-2 ring-amber-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-black text-amber-600 font-sans">IB MYP</span>
                  {selectedLevel === 'myp' && <CheckCircle2 className="w-5 h-5 text-amber-600" />}
                </div>
                <p className="text-base sm:text-lg font-bold text-slate-900 font-sans">Middle Years Programme (Grade 9 - 10)</p>
                <p className="text-xs text-slate-500 font-sans mt-0.5">O Level / SSC Equivalent IB Qualification</p>
              </button>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* Step 3: Stream / Group Selection */}
        {/* ============================================================ */}
        <div className="mb-10">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 font-bengali mb-3 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-sans font-bold">3</span>
            <span>{isEnglishUi ? 'Choose Your Study Stream:' : 'আপনার বিভাগ (Group) নির্বাচন করুন:'}</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setSelectedStream('science')}
              className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                selectedStream === 'science'
                  ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold shadow-xs ring-1 ring-blue-600/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <span className="block text-base font-bold font-sans">
                {selectedVersion === 'bangla' ? 'বিজ্ঞান (Science)' : 'Science'}
              </span>
              <span className="text-[11px] text-slate-500">Physics, Chemistry, Math...</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStream('commerce')}
              className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                selectedStream === 'commerce'
                  ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold shadow-xs ring-1 ring-blue-600/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <span className="block text-base font-bold font-sans">
                {selectedVersion === 'bangla' ? 'ব্যবসায় শিক্ষা' : 'Business Studies'}
              </span>
              <span className="text-[11px] text-slate-500">Accounting, Economics...</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStream('humanities')}
              className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                selectedStream === 'humanities'
                  ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold shadow-xs ring-1 ring-blue-600/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <span className="block text-base font-bold font-sans">
                {selectedVersion === 'bangla' ? 'মানবিক (Humanities)' : 'Humanities'}
              </span>
              <span className="text-[11px] text-slate-500">Societies, Arts, History...</span>
            </button>
          </div>
        </div>

        {/* Confirmation & Proceed Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-md">
          <div className="flex items-center gap-3 text-slate-600 text-sm">
            <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0" />
            <div className="text-xs sm:text-sm">
              <div className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                {isEnglishUi ? 'Selected Configuration' : 'নির্বাচিত কনফিগারেশন'}
              </div>
              <div className="font-bold text-slate-900 mt-0.5">
                <span className="text-blue-600 uppercase font-extrabold">{selectedLevel}</span> •{' '}
                <span>
                  {selectedVersion === 'bangla'
                    ? 'বাংলা মাধ্যম (NCTB)'
                    : selectedVersion === 'english'
                    ? 'English Version (NCTB)'
                    : selectedVersion === 'british'
                    ? 'British Curriculum'
                    : 'IB Curriculum'}
                </span> •{' '}
                <span className="capitalize">{selectedStream}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/25 transition-all gap-2 cursor-pointer"
          >
            {loading ? (
              <span>{isEnglishUi ? 'Saving...' : 'সংরক্ষণ করা হচ্ছে...'}</span>
            ) : (
              <>
                <span>{isEnglishUi ? 'Confirm & Enter Dashboard' : 'নিশ্চিত করুন এবং ড্যাশবোর্ডে প্রবেশ করুন'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectVersionPage;
