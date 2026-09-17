import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/src/components/layout/Navbar';
import { useAuthStore } from '@/src/lib/authStore';
import { apiJson } from '@/src/lib/api';
import { PaymentSettings, UserSubscriptionStatus, CurriculumVersion } from '@/src/types';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  GraduationCap,
  Clock,
  ShieldCheck,
  Send,
  ArrowLeft,
  CheckCheck,
  Star,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { DiscountCountdown } from '@/src/components/subscription/DiscountCountdown';

export const SubscriptionPage: React.FC = () => {
  const { user, setSubscription } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    id: 'default',
    bkashNumber: '01700000000',
    bkashAccountName: 'MCQ Onushilon (Personal)',
    nagadNumber: '01800000000',
    nagadAccountName: 'MCQ Onushilon (Personal)',
    priceBangla: 499,
    priceEnglish: 699,
    priceBritish: 1200,
    priceIb: 1500,
    originalPriceBangla: 999,
    originalPriceEnglish: 1299,
    originalPriceBritish: 2000,
    originalPriceIb: 2500,
    discountTitle: 'সীমিত সময়ের মেগা অফার!',
    discountExpiresAt: null,
    discountActive: true,
    paymentInstructions: '',
  });

  const [subStatus, setSubStatus] = useState<UserSubscriptionStatus | null>(null);

  const [selectedGateway, setSelectedGateway] = useState<'bkash' | 'nagad'>('bkash');
  const [senderNumber, setSenderNumber] = useState(user?.phone || '');
  const [transactionId, setTransactionId] = useState('');

  const userCurriculum: CurriculumVersion = user?.curriculumVersion || 'bangla';
  const isEnglishUi = userCurriculum !== 'bangla';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsData, statusData] = await Promise.all([
        apiJson<PaymentSettings>('/api/payment-settings').catch(() => null),
        apiJson<UserSubscriptionStatus>('/api/user/subscription-status').catch(() => null),
      ]);

      if (settingsData) {
        setPaymentSettings({
          ...settingsData,
          priceBangla: Number(settingsData.priceBangla) || 499,
          priceEnglish: Number(settingsData.priceEnglish) || 699,
          priceBritish: Number(settingsData.priceBritish) || 1200,
          priceIb: Number(settingsData.priceIb) || 1500,
          originalPriceBangla: Number(settingsData.originalPriceBangla) || 999,
          originalPriceEnglish: Number(settingsData.originalPriceEnglish) || 1299,
          originalPriceBritish: Number(settingsData.originalPriceBritish) || 2000,
          originalPriceIb: Number(settingsData.originalPriceIb) || 2500,
          discountTitle: settingsData.discountTitle || 'সীমিত সময়ের মেগা অফার!',
          discountExpiresAt: settingsData.discountExpiresAt || null,
          discountActive: settingsData.discountActive !== undefined ? Boolean(settingsData.discountActive) : true,
        });
      }

      if (statusData) {
        setSubStatus(statusData);
        if (statusData.isSubscribed && user) {
          setSubscription(true, 'active');
        }
      }
    } catch (err) {
      console.error('Failed to load subscription page data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(label);
    toast.success(`${label} নম্বর কপি করা হয়েছে!`);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const getCurriculumPrice = (curriculum: CurriculumVersion) => {
    switch (curriculum) {
      case 'english':
        return Number(paymentSettings.priceEnglish) || 699;
      case 'british':
        return Number(paymentSettings.priceBritish) || 1200;
      case 'ib':
        return Number(paymentSettings.priceIb) || 1500;
      case 'bangla':
      default:
        return Number(paymentSettings.priceBangla) || 499;
    }
  };

  const getCurriculumOriginalPrice = (curriculum: CurriculumVersion) => {
    switch (curriculum) {
      case 'english':
        return Number(paymentSettings.originalPriceEnglish) || 1299;
      case 'british':
        return Number(paymentSettings.originalPriceBritish) || 2000;
      case 'ib':
        return Number(paymentSettings.originalPriceIb) || 2500;
      case 'bangla':
      default:
        return Number(paymentSettings.originalPriceBangla) || 999;
    }
  };

  const activeAmount = getCurriculumPrice(userCurriculum);
  const activeNumber =
    selectedGateway === 'nagad'
      ? paymentSettings.nagadNumber || '01800000000'
      : paymentSettings.bkashNumber || '01700000000';

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderNumber.trim()) {
      toast.error('যে নম্বর থেকে টাকা পাঠিয়েছেন তা উল্লেখ করুন।');
      return;
    }
    if (!transactionId.trim() || transactionId.trim().length < 5) {
      toast.error('সঠিক Transaction ID (TrxID) প্রদান করুন।');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiJson<{ success: boolean; message: string }>('/api/subscription/submit', {
        method: 'POST',
        body: JSON.stringify({
          gateway: selectedGateway,
          senderNumber: senderNumber.trim(),
          transactionId: transactionId.trim().toUpperCase(),
          curriculumVersion: userCurriculum,
        }),
      });

      toast.success(res.message || 'পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে!');
      setTransactionId('');
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'পেমেন্ট রিকোয়েস্ট জমা দিতে ব্যর্থ হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isEnglishUi ? 'Back to Dashboard' : 'ড্যাশবোর্ডে ফিরে যান'}</span>
          </Link>
          <div className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
            {userCurriculum.toUpperCase()} • {user?.academicLevel?.toUpperCase() || 'HSC'}
          </div>
        </div>

        {/* Hero Banner Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              {isEnglishUi ? 'Full Academic Subscription' : 'পূর্ণাঙ্গ একাডেমি সাবস্ক্রিপশন'}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              {isEnglishUi
                ? 'Unlimited Practice & Comprehensive Board Exams'
                : 'আনলিমিটেড মডেল টেস্ট ও বোর্ড পরীক্ষার পূর্ণাঙ্গ প্রস্তুতি'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {isEnglishUi
                ? 'Every student gets 3 free tests across chapter tests and past papers. Upgrade your account to unlock unlimited exams, instant solutions, and real-time timers.'
                : 'প্রতিটি শিক্ষার্থী সর্বোচ্চ ৩টি টেস্ট সম্পূর্ণ ফ্রিতে দিতে পারে। সাবস্ক্রিপশনের মাধ্যমে সকল বিষয়ের চ্যাপ্টার টেস্ট, বিগত বছরের বোর্ড প্রশ্নাবলি ও টাইমারসহ পূর্ণাঙ্গ অনুশীলন আনলক করুন।'}
            </p>
          </div>
        </div>

        {/* If Subscribed: Congratulatory Banner */}
        {subStatus?.isSubscribed && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isEnglishUi ? 'Active Pro Subscription' : 'আপনার প্রো সাবস্ক্রিপশন সক্রিয় রয়েছে!'}
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                {isEnglishUi
                  ? 'You have unlimited access to all chapter tests, subject questions, and past board papers.'
                  : 'আপনি যেকোনো চ্যাপ্টার এবং বিগত বছরের সকল বোর্ড প্রশ্ন আনলিমিটেড সময় ধরে পরীক্ষা দিতে পারবেন।'}
              </p>
            </div>
          </div>
        )}

        {/* Free Test Limit Usage Tracker */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              {isEnglishUi ? 'Free Tests Usage Status' : 'ফ্রি টেস্ট ব্যবহারের তথ্য'}
            </div>
            <div className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>
                {isEnglishUi
                  ? `${subStatus?.freeTestsUsed ?? 0} of ${subStatus?.freeLimit ?? 3} Free Tests Used`
                  : `৩টির মধ্যে ${subStatus?.freeTestsUsed ?? 0}টি ফ্রি টেস্ট সম্পন্ন`}
              </span>
              {(subStatus?.freeTestsRemaining ?? 3) === 0 ? (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-red-100 text-red-700">
                  {isEnglishUi ? 'Free Limit Reached' : 'ফ্রি টেস্ট শেষ'}
                </span>
              ) : (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                  {isEnglishUi
                    ? `${subStatus?.freeTestsRemaining ?? 0} Remaining`
                    : `${subStatus?.freeTestsRemaining ?? 0}টি অবশিষ্ট`}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isEnglishUi
                ? 'Total exams taken across all subjects and board papers.'
                : 'সকল বিষয় ও বোর্ড প্রশ্নাবলি মিলিয়ে মোট সম্পন্ন করা পরীক্ষা।'}
            </p>
          </div>

          <div className="w-full sm:w-56 space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>{Math.round((((subStatus?.freeTestsUsed ?? 0) / 3) * 100))}% ব্যবহৃত</span>
              <span>৩ টেস্ট লিমিট</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (subStatus?.freeTestsUsed ?? 0) >= 3 ? 'bg-red-500' : 'bg-blue-600'
                }`}
                style={{
                  width: `${Math.min(100, (((subStatus?.freeTestsUsed ?? 0) / 3) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Pending Verification Notice */}
        {subStatus?.pendingPayment && (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm sm:text-base">
                {isEnglishUi ? 'Payment Verification in Progress' : 'পেমেন্ট যাচাই প্রক্রিয়াধীন'}
              </h4>
              <p className="text-xs sm:text-sm text-amber-800 mt-0.5 leading-relaxed">
                আপনার TrxID <strong className="font-mono bg-amber-100 px-1.5 py-0.5 rounded font-bold">{subStatus.pendingPayment.transactionId}</strong> ({subStatus.pendingPayment.gateway.toUpperCase()}) এর আবেদন জমা রয়েছে। অ্যাডমিন ভেরিফিকেশন সম্পন্ন হওয়া মাত্রই আপনার একাউন্ট সম্পূর্ণ আনলক হয়ে যাবে।
              </p>
            </div>
          </div>
        )}

        {/* Mega Discount & Countdown Banner */}
        <DiscountCountdown
          expiresAt={paymentSettings.discountExpiresAt}
          title={paymentSettings.discountTitle}
          active={paymentSettings.discountActive}
          isEnglishUi={isEnglishUi}
        />

        {/* 4 Curriculum Pricing Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEnglishUi ? 'Curriculum Subscription Plans' : 'কারিকুলাম ভিত্তিক সাবস্ক্রিপশন ফি'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEnglishUi
                  ? 'Admin-approved transparent pricing for each curriculum stream.'
                  : 'প্রতিটি কারিকুলামের জন্য নির্ধারিত এককালীন ফি।'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['bangla', 'english', 'british', 'ib'] as CurriculumVersion[]).map((ver) => {
              const isUserCurriculum = userCurriculum === ver;
              const price = getCurriculumPrice(ver);
              const origPrice = getCurriculumOriginalPrice(ver);
              const hasDiscount = origPrice > price;
              const discountPct = hasDiscount ? Math.round(((origPrice - price) / origPrice) * 100) : null;

              return (
                <div
                  key={ver}
                  className={`p-5 rounded-3xl border transition-all relative flex flex-col justify-between ${
                    isUserCurriculum
                      ? 'border-blue-500 bg-blue-50/70 shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white shadow-xs opacity-90'
                  }`}
                >
                  {isUserCurriculum && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full shadow-xs flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current text-amber-300" />
                      {isEnglishUi ? 'Your Registered Curriculum' : 'আপনার নিবন্ধিত কারিকুলাম'}
                    </div>
                  )}

                  <div>
                    <div className="text-sm font-bold text-slate-800 mb-1">
                      {ver === 'bangla'
                        ? 'বাংলা মাধ্যম (HSC / SSC)'
                        : ver === 'english'
                        ? 'English Version (HSC / SSC)'
                        : ver === 'british'
                        ? 'British O/A Level (CAIE/Edexcel)'
                        : 'IB MYP & DP Programme'}
                    </div>

                    {/* Dual Pricing & Discount Badge */}
                    <div className="my-2.5 space-y-0.5">
                      {hasDiscount && (
                        <div className="flex items-center gap-2">
                          <span className="line-through text-slate-400 font-bold text-xs font-sans">
                            ৳{origPrice}
                          </span>
                          <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-700 border border-rose-200">
                            {discountPct}% {isEnglishUi ? 'OFF' : 'ছাড়'}
                          </span>
                        </div>
                      )}
                      <div className="text-2xl sm:text-3xl font-black text-blue-700 font-sans tracking-tight">
                        ৳{price}
                      </div>
                    </div>

                    <ul className="text-xs text-slate-600 space-y-1.5 mb-4">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>সকল বিষয়ের অধ্যায়ভিত্তিক টেস্ট</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>বিগত বছরের সকল বোর্ড প্রশ্নাবলি</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>ব্যাখ্যাসহ নির্ভুল উত্তরমালা ও টাইমার</span>
                      </li>
                    </ul>
                  </div>

                  <div className="text-[11px] font-bold text-center py-1.5 px-3 rounded-xl bg-white border border-slate-200 text-slate-700">
                    {isUserCurriculum ? 'নির্বাচিত কারিকুলাম' : 'অন্যান্য কারিকুলাম'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods & Submission Form Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              {isEnglishUi ? 'Pay via Personal bKash or Nagad' : 'পার্সোনাল বিকাশ বা নগদ এর মাধ্যমে পেমেন্ট করুন'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEnglishUi
                ? 'Send Money to the personal number below and enter the Transaction ID.'
                : 'নিচের বিকাশ বা নগদ পার্সোনাল নম্বরে সেন্ড মানি করুন এবং প্রাপ্ত TrxID নিচে সাবমিট করুন।'}
            </p>
          </div>

          {/* Gateway Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* bKash */}
            <button
              type="button"
              onClick={() => setSelectedGateway('bkash')}
              className={`p-4 rounded-2xl border flex items-center gap-4 transition-all cursor-pointer ${
                selectedGateway === 'bkash'
                  ? 'border-[#E2136E] bg-pink-50/60 ring-2 ring-[#E2136E]/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-[#E2136E] text-white font-bold flex items-center justify-center text-lg shrink-0 shadow-xs">
                bK
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>বিকাশ (bKash)</span>
                  {selectedGateway === 'bkash' && (
                    <CheckCircle2 className="w-4 h-4 text-[#E2136E]" />
                  )}
                </div>
                <div className="text-xs text-slate-500">Send Money (Personal)</div>
              </div>
            </button>

            {/* Nagad */}
            <button
              type="button"
              onClick={() => setSelectedGateway('nagad')}
              className={`p-4 rounded-2xl border flex items-center gap-4 transition-all cursor-pointer ${
                selectedGateway === 'nagad'
                  ? 'border-[#F7941D] bg-orange-50/60 ring-2 ring-[#F7941D]/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-[#F7941D] text-white font-bold flex items-center justify-center text-lg shrink-0 shadow-xs">
                নগদ
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>নগদ (Nagad)</span>
                  {selectedGateway === 'nagad' && (
                    <CheckCircle2 className="w-4 h-4 text-[#F7941D]" />
                  )}
                </div>
                <div className="text-xs text-slate-500">Send Money (Personal)</div>
              </div>
            </button>
          </div>

          {/* Display Personal Number Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-700 shadow-md">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                  selectedGateway === 'bkash' ? 'bg-[#E2136E] text-white' : 'bg-[#F7941D] text-white'
                }`}>
                  {selectedGateway === 'bkash' ? 'bKash Personal' : 'Nagad Personal'}
                </span>
                <span className="text-xs text-slate-300">
                  নির্ধারিত ফি: <strong className="text-white font-sans text-sm">৳{activeAmount}</strong>
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tracking-wider text-white">
                {activeNumber}
              </div>
            </div>

            <Button
              type="button"
              onClick={() => handleCopy(activeNumber, selectedGateway === 'bkash' ? 'বিকাশ' : 'নগদ')}
              className="h-11 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs gap-2 shrink-0 cursor-pointer"
            >
              {copiedNumber ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedNumber ? 'কপি হয়েছে' : 'নম্বর কপি করুন'}</span>
            </Button>
          </div>

          {/* Payment Steps Instructions */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5 leading-relaxed">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm mb-1">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>ধাপসমূহ (How to Pay):</span>
            </div>
            <p>১. আপনার বিকাশ বা নগদ অ্যাপে প্রবেশ করে <strong>Send Money</strong> অপশন চাপুন।</p>
            <p>২. প্রাপক হিসেবে উপরের পার্সোনাল নম্বর <strong>{activeNumber}</strong> এবং টাকার পরিমাণ হিসেবে <strong>৳{activeAmount}</strong> দিন।</p>
            <p>৩. পেমেন্ট সম্পন্ন হলে ফিরতি মেসেজ থেকে <strong>Transaction ID (TrxID)</strong> কপি করুন।</p>
            <p>৪. নিচের ফর্মে আপনার প্রেরক নম্বর ও TrxID লিখে সাবমিট করুন। অ্যাডমিন প্যানেল থেকে অনুমোদন দিলে সাথে সাথে সব টেস্ট চালু হবে।</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitPayment} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  প্রেরক মোবাইল নম্বর (Sender Mobile Number) *
                </label>
                <input
                  type="text"
                  required
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Transaction ID (TrxID) *
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="যেমন: BLA92K810"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm gap-2 shadow-md cursor-pointer"
            >
              {submitting ? (
                <span>সাবমিট করা হচ্ছে...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>পেমেন্ট রিকোয়েস্ট পাঠান (Submit Payment)</span>
                </>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionPage;
