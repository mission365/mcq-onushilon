import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, GraduationCap, KeyRound, Lock, Mail, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiJson } from '../lib/api';

type PasswordResetRequestResponse = {
  message: string;
};

type PasswordResetVerifyResponse = {
  message: string;
  resetToken: string;
};

type PasswordResetConfirmResponse = {
  message: string;
};

const ForgotPasswordPage = () => {
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const navigate = useNavigate();

  const normalizedEmail = email.trim().toLowerCase();
  const otpValue = otp.trim();

  const requestOtp = async () => {
    if (!normalizedEmail) {
      toast.error('Enter your email address first.');
      return false;
    }

    setRequestingOtp(true);
    try {
      const response = await apiJson<PasswordResetRequestResponse>('/api/auth/password-reset/request', {
        body: JSON.stringify({ email: normalizedEmail }),
        method: 'POST',
      });

      toast.success(response.message);
      setStep('verify');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Could not send the OTP.');
      return false;
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleRequestSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await requestOtp();
  };

  const handleVerifySubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!normalizedEmail) {
      toast.error('Enter your email address first.');
      return;
    }

    if (otpValue.length !== 6) {
      toast.error('Enter the 6-digit OTP sent to your email.');
      return;
    }

    setVerifyingOtp(true);
    try {
      const response = await apiJson<PasswordResetVerifyResponse>('/api/auth/password-reset/verify', {
        body: JSON.stringify({ email: normalizedEmail, otp: otpValue }),
        method: 'POST',
      });

      setResetToken(response.resetToken);
      setStep('reset');
      toast.success(response.message);
    } catch (error: any) {
      toast.error(error.message || 'OTP verification failed.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResetSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!resetToken) {
      toast.error('Verify your OTP first.');
      setStep('verify');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Use a password with at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      const response = await apiJson<PasswordResetConfirmResponse>('/api/auth/password-reset/confirm', {
        body: JSON.stringify({
          email: normalizedEmail,
          newPassword,
          resetToken,
        }),
        method: 'POST',
      });

      toast.success(response.message);
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Could not update your password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-xl">
            <CardHeader className="space-y-3 border-b border-slate-100 bg-slate-50 px-8 pb-8 pt-10 text-center">
              <div className="mb-5 flex justify-center">
                <Link to="/">
                  <img
                    src="/images/logo.png"
                    alt="MCQ Onushilon"
                    className="h-10 w-auto object-contain hover:opacity-90 transition-opacity"
                  />
                </Link>
              </div>
              <CardTitle className="text-3xl font-bold text-slate-900">Reset your password</CardTitle>
              <CardDescription className="text-base text-slate-500">
                Use your email, verify the OTP, then set a new password for your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              {step === 'request' && (
                <form onSubmit={handleRequestSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="font-semibold text-slate-700">
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="name@example.com"
                        required
                        className="h-12 rounded-xl border-slate-200 pl-11 focus:border-blue-500 transition-all"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="h-14 w-full rounded-xl border-none bg-blue-600 text-lg font-semibold text-white shadow-lg shadow-blue-100 hover:bg-blue-700"
                    disabled={requestingOtp}
                  >
                    {requestingOtp ? 'Sending OTP...' : 'Send OTP'}
                  </Button>
                </form>
              )}

              {step === 'verify' && (
                <form onSubmit={handleVerifySubmit} className="space-y-5">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    We sent a 6-digit OTP to <span className="font-semibold">{normalizedEmail}</span>.
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reset-otp" className="font-semibold text-slate-700">
                      Enter OTP
                    </Label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="reset-otp"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="123456"
                        required
                        className="h-12 rounded-xl border-slate-200 pl-11 tracking-[0.35em] focus:border-blue-500 transition-all"
                        value={otp}
                        onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="h-14 w-full rounded-xl border-none bg-blue-600 text-lg font-semibold text-white shadow-lg shadow-blue-100 hover:bg-blue-700"
                    disabled={verifyingOtp}
                  >
                    {verifyingOtp ? 'Verifying OTP...' : 'Verify OTP'}
                  </Button>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => void requestOtp()}
                      disabled={requestingOtp || verifyingOtp}
                      className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {requestingOtp ? 'Sending again...' : 'Resend OTP'}
                    </button>
                  </div>
                </form>
              )}

              {step === 'reset' && (
                <form onSubmit={handleResetSubmit} className="space-y-5">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    OTP verified for <span className="font-semibold">{normalizedEmail}</span>. Set your new password now.
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="font-semibold text-slate-700">
                      New password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="new-password"
                        type="password"
                        required
                        className="h-12 rounded-xl border-slate-200 pl-11 focus:border-blue-500 transition-all"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password" className="font-semibold text-slate-700">
                      Confirm new password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="confirm-new-password"
                        type="password"
                        required
                        className="h-12 rounded-xl border-slate-200 pl-11 focus:border-blue-500 transition-all"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="h-14 w-full rounded-xl border-none bg-blue-600 text-lg font-semibold text-white shadow-lg shadow-blue-100 hover:bg-blue-700"
                    disabled={savingPassword}
                  >
                    {savingPassword ? 'Saving password...' : 'Save new password'}
                  </Button>
                </form>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t border-slate-100 bg-slate-50 p-8">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600">
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
              <div className="flex items-center justify-center gap-3 text-slate-400">
                <GraduationCap className="h-5 w-5" />
                <span className="text-sm font-semibold">MCQOnushilon account recovery</span>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
