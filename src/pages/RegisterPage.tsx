import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/src/lib/firebase';
import { useAuthStore } from '@/src/lib/authStore';
import { apiJson } from '@/src/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Chrome,
  CheckCircle2,
  Sparkles,
  Clock,
  Award,
  Star,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('পাসওয়ার্ড মেলেনি');
    }
    if (password.length < 6) {
      return toast.error('পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে');
    }

    setLoading(true);
    try {
      const data = await apiJson<any>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
        }),
      });

      if (data.needsVerification) {
        toast.success(data.message || 'আপনার ইমেইলে একটি ভেরিফিকেশন ওটিপি পাঠানো হয়েছে।');
        navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`);
        return;
      }

      if (data.token && data.user) {
        useAuthStore.getState().login(data.token, data.user);
        toast.success('রেজিস্ট্রেশন সফল হয়েছে');
        if (!data.user.curriculumVersion) {
          navigate('/select-version');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const data = await apiJson<any>('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          email: user.email,
          fullName: user.displayName || 'Google User',
          googleId: user.uid,
        }),
      });

      useAuthStore.getState().login(data.token, data.user);

      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
        toast.success('অ্যাডমিন প্যানেলে স্বাগতম');
      } else if (!data.user.curriculumVersion) {
        navigate('/select-version');
        toast.success('লগইন সফল হয়েছে');
      } else {
        navigate('/dashboard');
        toast.success('লগইন সফল হয়েছে');
      }
    } catch (error: any) {
      toast.error(error.message || 'গুগল লগইন ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-5xl w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
        {/* Left Visual Panel (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-b from-blue-600 to-indigo-900 text-white p-8 flex-col justify-between relative overflow-hidden">
          {/* Subtle glow circles */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

          {/* Top Logo & Branding */}
          <div className="relative z-10">
            <Link to="/" className="inline-block p-2 px-3.5 rounded-xl bg-white shadow-md">
              <img
                src="/images/logo.png"
                alt="MCQ Onushilon"
                className="h-8 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Center Image Crop */}
          <div className="relative z-10 my-4">
            <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl aspect-[4/3] max-h-56 bg-slate-950/20">
              <img
                src="/web_desgin_images/girl_with_leptop_practice_mcq.png"
                alt="Online MCQ practice"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>

          {/* Overlay Content & Benefits */}
          <div className="relative z-10 space-y-4">
            <div>
              <h2 className="text-2xl font-bold font-bengali text-white mb-2 leading-snug">
                আজই প্রস্তুতি শুরু করুন
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm font-bengali leading-relaxed">
                বোর্ড স্ট্যান্ডার্ড পরীক্ষা ও তাৎক্ষণিক মূল্যায়নের মাধ্যমে এগিয়ে থাকুন সবার চেয়ে।
              </p>
            </div>

            {/* 3 Bullet Benefits */}
            <div className="space-y-2 pt-1 font-bengali text-sm text-blue-50">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>টাইমড পরীক্ষা ও লাইভ কাউন্টডাউন</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>বিষয়ভিত্তিক মডেল টেস্ট ও বোর্ড প্রশ্ন</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>তাৎক্ষণিক ফলাফল ও বিস্তারিত ব্যাখ্যা</span>
              </div>
            </div>

            {/* Small Review / Stat Badge */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-blue-100">
              <div className="flex items-center gap-1 text-amber-300">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="font-bengali font-medium">৫০,০০০+ শিক্ষার্থী যুক্ত</span>
            </div>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="lg:col-span-7 p-4 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            {/* Step Progress Indicator */}
            <div className="flex items-center justify-between mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-slate-100 text-[11px] sm:text-xs font-bengali font-semibold">
              <div className="flex items-center gap-1 sm:gap-1.5 text-blue-600">
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] sm:text-[11px]">
                  ১
                </span>
                <span>তথ্য দিন</span>
              </div>
              <div className="w-3 sm:w-8 h-0.5 bg-slate-200" />
              <div className="flex items-center gap-1 sm:gap-1.5 text-slate-400">
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] sm:text-[11px]">
                  ২
                </span>
                <span>ইমেইল ওটিপি</span>
              </div>
              <div className="w-3 sm:w-8 h-0.5 bg-slate-200" />
              <div className="flex items-center gap-1 sm:gap-1.5 text-slate-400">
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] sm:text-[11px]">
                  ৩
                </span>
                <span>পরীক্ষা শুরু</span>
              </div>
            </div>

            {/* Mobile Logo */}
            <div className="flex justify-center mb-6 lg:hidden">
              <Link to="/">
                <img src="/images/logo.png" alt="MCQ Onushilon" className="h-9 w-auto object-contain" />
              </Link>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold font-bengali text-slate-900 tracking-tight">
                নতুন অ্যাকাউন্ট তৈরি করুন
              </h1>
              <p className="text-slate-500 font-bengali text-sm mt-1">
                বিনামূল্যে রেজিস্ট্রেশন করে আজই ৩টি ফ্রি মডেল টেস্ট শুরু করুন।
              </p>
            </div>

            {/* Google Signup Button */}
            <Button
              onClick={handleGoogleLogin}
              type="button"
              variant="outline"
              className="w-full h-11 flex items-center justify-center gap-3 border-slate-200 hover:bg-slate-50 transition-all font-bold text-slate-700 rounded-xl mb-6 shadow-sm cursor-pointer"
              disabled={loading}
            >
              <Chrome className="w-5 h-5 text-blue-500" />
              <span className="font-bengali text-sm">গুগল দিয়ে শুরু করো</span>
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200/80"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-bold tracking-widest font-bengali">
                  অথবা ইমেইল দিয়ে
                </span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="font-bengali text-slate-700 font-bold text-sm">
                  পূর্ণ নাম
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="fullName"
                    placeholder="আপনার নাম"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 h-11 bg-slate-50/50 border-slate-200 rounded-xl font-bengali focus:bg-white transition-all text-sm"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-bengali ml-1">নামের বানান সঠিক দিন</p>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="font-bengali text-slate-700 font-bold text-sm">
                  জিমেইল বা ইমেইল ঠিকানা
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-slate-50/50 border-slate-200 rounded-xl font-sans focus:bg-white transition-all text-sm"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-bengali ml-1">
                  এই ইমেইলে ৬ সংখ্যার ভেরিফিকেশন ওটিপি পাঠানো হবে
                </p>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="font-bengali text-slate-700 font-bold text-sm">
                    পাসওয়ার্ড
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-11 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white transition-all text-sm"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 font-bengali ml-1">কমপক্ষে ৬ অক্ষর</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="font-bengali text-slate-700 font-bold text-sm">
                    কনফার্ম পাসওয়ার্ড
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 h-11 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white transition-all text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bengali font-bold text-base rounded-xl shadow-lg shadow-blue-600/25 transition-all mt-4 cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <span className="font-bengali">অ্যাকাউন্ট তৈরি হচ্ছে...</span>
                ) : (
                  <span className="font-bengali flex items-center justify-center gap-2">
                    অ্যাকাউন্ট খুলুন ও ওটিপি পাঠান <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Footer switch to login */}
            <div className="text-center mt-6 pt-4 border-t border-slate-100">
              <p className="text-sm font-bengali text-slate-500">
                ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                <Link to="/login" className="text-blue-600 font-bold hover:underline">
                  লগইন করুন
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
