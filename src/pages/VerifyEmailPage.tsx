import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle2, RefreshCw, ArrowLeft, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiJson } from '@/src/lib/api';
import { useAuthStore, AuthUser } from '@/src/lib/authStore';

interface VerifyResponse {
  success: boolean;
  token: string;
  user: AuthUser;
  message: string;
}

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(45);

  const navigate = useNavigate();

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  // Resend cooldown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (!email.trim()) {
      return toast.error('ইমেইল ঠিকানা দিন');
    }
    if (cleanOtp.length !== 6) {
      return toast.error('৬ সংখ্যার ওটিপি কোডটি দিন');
    }

    setLoading(true);
    try {
      const data = await apiJson<VerifyResponse>('/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), otp: cleanOtp }),
      });

      useAuthStore.getState().login(data.token, data.user);
      toast.success(data.message || 'ইমেইল ভেরিফিকেশন সফল হয়েছে!');

      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (!data.user.curriculumVersion) {
        navigate('/select-version');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'ভেরিফিকেশন ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || resending) return;
    if (!email.trim()) {
      return toast.error('ইমেইল ঠিকানা দিন');
    }

    setResending(true);
    try {
      const res = await apiJson<{ success: boolean; message: string }>('/api/auth/send-verification-otp', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });
      toast.success(res.message || 'নতুন ওটিপি আপনার জিমেইলে পাঠানো হয়েছে।');
      setCountdown(45);
    } catch (error: any) {
      toast.error(error.message || 'ওটিপি পাঠাতে সমস্যা হয়েছে');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="border-slate-200 shadow-xl rounded-2xl overflow-hidden bg-white">
          <CardHeader className="space-y-2 text-center pb-6 pt-10 px-8 bg-slate-50 border-b border-slate-100">
            <div className="flex justify-center mb-4">
              <Link to="/">
                <img src="/images/logo.png" alt="MCQ Onushilon" className="h-10 w-auto object-contain hover:opacity-90 transition-opacity" />
              </Link>
            </div>
            <CardTitle className="text-3xl font-bold font-bengali text-slate-900 tracking-tight">
              জিমেইল ভেরিফিকেশন
            </CardTitle>
            <CardDescription className="font-bengali text-slate-500 text-base">
              আপনার জিমেইলে পাঠানো ৬ সংখ্যার ওটিপি (OTP) দিয়ে একাউন্ট নিশ্চিত করুন
            </CardDescription>
            {email && (
              <div className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                {email}
              </div>
            )}
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleVerify} className="space-y-6">
              {!emailParam && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-bengali text-slate-700 font-bold ml-1">
                    ইমেইল ঠিকানা
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl border-slate-200"
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="otp" className="font-bengali text-slate-700 font-bold ml-1">
                    ৬ সংখ্যার ওটিপি (OTP)
                  </Label>
                  <span className="text-xs text-slate-400 font-sans">১০ মিনিট কার্যকর</span>
                </div>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="h-14 text-center text-3xl font-mono tracking-[0.5em] font-bold rounded-xl border-slate-200 focus:border-blue-500 transition-all text-slate-800"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bengali font-bold text-lg rounded-xl shadow-lg shadow-blue-100 border-none transition-all"
                disabled={loading || otp.length !== 6}
              >
                {loading ? 'যাচাই করা হচ্ছে...' : 'ভেরিফাই ও সম্পন্ন করুন'}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || resending}
                  className="text-sm font-bengali text-slate-500 hover:text-blue-600 disabled:text-slate-400 inline-flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  {countdown > 0 ? (
                    <span>নতুন কোড পাঠাতে অপেক্ষা করুন ({countdown}s)</span>
                  ) : (
                    <span className="font-bold text-blue-600 underline">কোড পুনরায় পাঠান</span>
                  )}
                </button>
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center p-6 bg-slate-50 border-t border-slate-100">
            <Link
              to="/login"
              className="text-sm text-slate-500 hover:text-slate-800 font-bengali flex items-center gap-2 font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> লগইন পেজে ফিরে যাও
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
