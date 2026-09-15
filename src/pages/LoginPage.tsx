import React, { useState, useEffect } from 'react';
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
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Star,
  ShieldCheck,
  Zap,
  BookOpen,
  Award,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLottie } from 'lottie-react';

// Reusable animated Lottie player with safe fallback
const LottiePlayer = ({ animationUrl, className }: { animationUrl: string; className?: string }) => {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    fetch(animationUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load animation');
        return res.json();
      })
      .then((data) => {
        if (isMounted) setAnimationData(data);
      })
      .catch((err) => {
        console.warn('Lottie animation failed to load:', err);
      });
    return () => {
      isMounted = false;
    };
  }, [animationUrl]);

  if (!animationData) {
    return (
      <div className={`flex items-center justify-center bg-white/5 rounded-2xl animate-pulse ${className}`}>
        <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-blue-400 animate-spin" />
      </div>
    );
  }

  return <LottieAnimationContent animationData={animationData} className={className} />;
};

const LottieAnimationContent = ({ animationData, className }: { animationData: any; className?: string }) => {
  const options = {
    animationData,
    loop: true,
    autoplay: true,
  };
  const { View } = useLottie(options);
  return <div className={className}>{View}</div>;
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('ইমেইল ও পাসওয়ার্ড প্রদান করুন');
      return;
    }

    setLoading(true);
    try {
      const data = await apiJson<any>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (data.needsVerification) {
        toast.info(data.message || 'আপনার ইমেইল ভেরিফাই করা প্রয়োজন। ওটিপি কোড পাঠানো হয়েছে।');
        navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`);
        return;
      }

      useAuthStore.getState().login(data.token, data.user);

      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
        toast.success('অ্যাডমিন প্যানেলে স্বাগতম');
      } else if (!data.user.curriculumVersion) {
        navigate('/select-version');
        toast.success('স্বাগতম! আপনার পাঠ্যক্রম ভার্সন নির্বাচন করুন।');
      } else {
        navigate('/dashboard');
        toast.success('ড্যাশবোর্ডে স্বাগতম');
      }
    } catch (error: any) {
      toast.error(error.message || 'লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করে পুনরায় চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
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
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-3 sm:p-6 lg:p-10 font-sans">
      {/* Background Decorative Mesh Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl w-full bg-white rounded-3xl sm:rounded-[32px] border border-slate-200/80 shadow-2xl shadow-slate-300/50 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]"
      >
        {/* ============================================================
            LEFT PANEL: Visual Showcase, Lottie Animation, & Image Card
           ============================================================ */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-6 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-8 xl:p-10 flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Light Orbs */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Row: Brand & Live Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 p-2.5 px-4 rounded-2xl bg-white shadow-lg shadow-black/20 hover:scale-105 transition-all"
            >
              <img
                src="/images/logo.png"
                alt="MCQ Onushilon"
                className="h-8 w-auto object-contain"
              />
            </Link>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span>স্মার্ট MCQ প্ল্যাটফর্ম</span>
            </span>
          </div>

          {/* Center Stage: Split Lottie & Educational Image Card */}
          <div className="relative z-10 my-6 space-y-5">
            {/* Lottie Animation Container */}
            <div className="flex items-center justify-center -my-2">
              <div className="w-56 h-48 xl:w-64 xl:h-52 relative">
                <LottiePlayer
                  animationUrl="/animations/education_study.json"
                  className="w-full h-full object-contain filter drop-shadow-xl"
                />
              </div>
            </div>

            {/* Editorial Showcase Card with Real-world Learning Image */}
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-white/5 backdrop-blur-md shadow-2xl p-3">
              <div className="relative rounded-xl overflow-hidden aspect-[16/9] max-h-44 bg-slate-900/50">
                <img
                  src="/web_desgin_images/girl_with_leptop_practice_mcq.png"
                  alt="Students practicing MCQ online"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                {/* Floating Micro-Badge Top Left */}
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md border border-white/20 text-[11px] font-bold text-emerald-400 shadow-md"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>৯৮.৪% সফলতার হার</span>
                </motion.div>

                {/* Floating Micro-Badge Bottom Right */}
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600/90 backdrop-blur-md border border-blue-400/30 text-[11px] font-bold text-white shadow-md"
                >
                  <Clock className="w-3 h-3 text-cyan-300" />
                  <span>লাইভ টাইমার ও OMR টেস্ট</span>
                </motion.div>
              </div>

              {/* Card Bottom Tagline */}
              <div className="pt-2.5 px-1 flex items-center justify-between text-xs text-blue-200/90 font-bengali">
                <span className="font-semibold text-white">বোর্ড ও আন্তর্জাতিক কারিকুলাম</span>
                <span className="text-cyan-300">১৫৭+ প্রামাণিক কোর্স</span>
              </div>
            </div>

            {/* Quick Benefit Points */}
            <div className="space-y-2 pt-1 font-bengali text-xs xl:text-sm text-blue-100/90">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>এইচএসসি, এসএসসি, ব্রিটিশ O/A Level ও IB DP প্রশ্নব্যাংক</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>তাৎক্ষণিক ফলাফল, নির্ভুল ব্যাখ্যা ও বিস্তারিত দুর্বলতা বিশ্লেষণ</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust & Student Count */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-blue-200">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
              <span className="text-white font-bold ml-1">৪.৯/৫</span>
            </div>
            <span className="font-bengali font-semibold text-white">৫০,০০০+ শিক্ষার্থী অনুশীলনে যুক্ত</span>
          </div>
        </div>

        {/* ============================================================
            RIGHT PANEL: Interactive Login Form
           ============================================================ */}
        <div className="lg:col-span-6 xl:col-span-6 p-6 sm:p-10 xl:p-12 flex flex-col justify-between bg-white">
          {/* Top Quick Links */}
          <div className="flex items-center justify-between mb-6">
            {/* Mobile Logo Only */}
            <div className="lg:hidden">
              <Link to="/">
                <img src="/images/logo.png" alt="MCQ Onushilon" className="h-8 w-auto object-contain" />
              </Link>
            </div>

            <div className="ml-auto">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-bengali">হোম পেজে ফিরে যান</span>
              </Link>
            </div>
          </div>

          {/* Form Container */}
          <div className="max-w-md w-full mx-auto my-auto space-y-6">
            {/* Header / Titles */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span>MCQ ONUSHILON LOGIN</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-bengali text-slate-900 tracking-tight flex items-center gap-2">
                <span>স্বাগতম জানাচ্ছি!</span>
                <span className="inline-block animate-bounce text-2xl">👋</span>
              </h1>
              <p className="text-slate-500 font-bengali text-sm">
                আপনার অ্যাকাউন্টে প্রবেশ করে মডেল টেস্ট ও অনুশীলন শুরু করুন।
              </p>
            </div>

            {/* Google Sign-in Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full h-12 flex items-center justify-center gap-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold text-sm shadow-xs hover:shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span className="font-bengali">গুগল দিয়ে দ্রুত প্রবেশ করুন</span>
            </button>

            {/* Modern Divider */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider font-bengali">
                অথবা ইমেইল দিয়ে প্রবেশ করুন
              </span>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="font-bengali text-slate-700 font-bold text-xs ml-1 flex items-center gap-1">
                  <span>ইমেইল ঠিকানা</span>
                  <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-10 pr-4 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" title="password" className="font-bengali text-slate-700 font-bold text-xs flex items-center gap-1">
                    <span>পাসওয়ার্ড</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline font-bengali transition-colors"
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="আপনার পাসওয়ার্ড দিন"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-10 pr-11 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs font-semibold text-slate-600 font-bengali cursor-pointer select-none">
                  আমাকে মনে রাখুন
                </label>
              </div>

              {/* Primary Login Button */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bengali font-bold text-base shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>লগইন হচ্ছে...</span>
                  </div>
                ) : (
                  <>
                    <span>লগইন করুন</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bottom Registration Prompt & Security Footer */}
          <div className="pt-6 mt-4 border-t border-slate-100 text-center space-y-3">
            <p className="text-xs sm:text-sm text-slate-600 font-bengali">
              <span>এখনও অ্যাকাউন্ট নেই? </span>
              <Link
                to="/register"
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                নতুন অ্যাকাউন্ট তৈরি করুন (ফ্রি)
              </Link>
            </p>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-bengali">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>নিরাপদ ও এনক্রিপ্টেড ডাটা ট্রান্সফার • MCQ Onushilon</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
