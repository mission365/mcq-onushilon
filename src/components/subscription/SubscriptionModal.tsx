import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/src/lib/authStore';
import { apiJson } from '@/src/lib/api';
import { PaymentSettings, UserSubscriptionStatus, CurriculumVersion } from '@/src/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { DiscountCountdown } from '@/src/components/subscription/DiscountCountdown';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
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
  const [senderNumber, setSenderNumber] = useState('');
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
      console.error('Failed to load subscription modal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void fetchData();
      setSenderNumber(user?.phone || '');
      setTransactionId('');
    }
  }, [isOpen]);

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

  const getCurriculumNameBn = (curriculum: CurriculumVersion) => {
    switch (curriculum) {
      case 'bangla':
        return 'বাংলা মাধ্যম (HSC / SSC)';
      case 'english':
        return 'English Version (HSC / SSC)';
      case 'british':
        return 'British Curriculum (O/A Level)';
      case 'ib':
        return 'IB (MYP & DP)';
      default:
        return curriculum;
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
      await fetchData();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'পেমেন্ট রিকোয়েস্ট জমা দিতে ব্যর্থ হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-[95vw] p-0 overflow-hidden rounded-3xl border-slate-200 bg-white shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header with gradient */}
        <div className="p-6 sm:p-7 bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white relative shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              {isEnglishUi ? 'Premium Subscription' : 'প্রিমিয়াম সাবস্ক্রিপশন'}
            </span>
            <span className="text-xs text-blue-200/80 font-medium">
              {isEnglishUi ? 'Unlimited Exams & Past Papers' : 'আনলিমিটেড মডেল টেস্ট ও বোর্ড প্রশ্ন'}
            </span>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {isEnglishUi
              ? 'Upgrade to Full Access'
              : 'সম্পূর্ণ সিলেবাস ও সকল প্রশ্ন আনলক করুন'}
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-xs sm:text-sm mt-1">
            {isEnglishUi
              ? 'Every student gets 3 free tests. Subscribe to practice all chapter tests and board questions without limits.'
              : 'প্রতিটি শিক্ষার্থী সর্বোচ্চ ৩টি টেস্ট সম্পূর্ণ ফ্রি দিতে পারে। পরবর্তী সকল চ্যাপ্টার ও বোর্ড পরীক্ষার প্রশ্ন পেতে সাবস্ক্রিপশন নিন।'}
          </DialogDescription>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm">
          {/* Free Tests Limit Status Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                {isEnglishUi ? 'Free Tests Usage Status' : 'ফ্রি টেস্ট ব্যবহারের তথ্য'}
              </div>
              <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>
                  {isEnglishUi
                    ? `${subStatus?.freeTestsUsed ?? 0} of ${subStatus?.freeLimit ?? 3} Free Tests Used`
                    : `৩টির মধ্যে ${subStatus?.freeTestsUsed ?? 0}টি ফ্রি টেস্ট সম্পন্ন`}
                </span>
                {(subStatus?.freeTestsRemaining ?? 3) === 0 ? (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700">
                    {isEnglishUi ? 'Limit Reached' : 'লিমিট শেষ'}
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                    {isEnglishUi
                      ? `${subStatus?.freeTestsRemaining ?? 0} Remaining`
                      : `${subStatus?.freeTestsRemaining ?? 0}টি বাকি`}
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full sm:w-44 bg-slate-200 rounded-full h-2.5 overflow-hidden">
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

          {/* Pending Payment Warning if already submitted */}
          {subStatus?.pendingPayment && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">
                  {isEnglishUi ? 'Payment Verification Pending' : 'পেমেন্ট যাচাই প্রক্রিয়াধীন'}
                </h4>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  আপনার TrxID <strong className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">{subStatus.pendingPayment.transactionId}</strong> ({subStatus.pendingPayment.gateway.toUpperCase()}) জমা হয়েছে। অ্যাডমিন প্যানেল থেকে অনুমোদন হওয়া মাত্রই আপনার সাবস্ক্রিপশন চালু হয়ে যাবে।
                </p>
              </div>
            </div>
          )}

          {/* Live Discount Countdown */}
          <div className="flex justify-center">
            <DiscountCountdown
              expiresAt={paymentSettings.discountExpiresAt}
              title={paymentSettings.discountTitle}
              active={paymentSettings.discountActive}
              variant="compact"
              isEnglishUi={isEnglishUi}
            />
          </div>

          {/* 4 Curriculum Pricing Cards */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isEnglishUi ? 'Curriculum Subscription Pricing' : 'কারিকুলাম ভিত্তিক সাবস্ক্রিপশন ফি'}
              </span>
              <span className="text-xs text-blue-600 font-semibold">
                {isEnglishUi ? 'One-time fee • Unlimited access' : 'এককালীন ফি • আনলিমিটেড এক্সেস'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(['bangla', 'english', 'british', 'ib'] as CurriculumVersion[]).map((ver) => {
                const isUserCurriculum = userCurriculum === ver;
                const price = getCurriculumPrice(ver);
                const origPrice = getCurriculumOriginalPrice(ver);
                const hasDiscount = origPrice > price;
                const discountPct = hasDiscount ? Math.round(((origPrice - price) / origPrice) * 100) : null;

                return (
                  <div
                    key={ver}
                    className={`p-3 rounded-2xl border text-center transition-all relative ${
                      isUserCurriculum
                        ? 'border-blue-500 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white opacity-85 hover:opacity-100'
                    }`}
                  >
                    {isUserCurriculum && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.2 bg-blue-600 text-white text-[9px] font-bold rounded-full shadow-xs">
                        {isEnglishUi ? 'Your Curriculum' : 'আপনার কারিকুলাম'}
                      </div>
                    )}
                    <div className="text-xs font-bold text-slate-800 capitalize truncate mt-1">
                      {ver === 'bangla'
                        ? 'বাংলা মাধ্যম'
                        : ver === 'english'
                        ? 'English Ver.'
                        : ver === 'british'
                        ? 'O/A Level'
                        : 'IB MYP/DP'}
                    </div>

                    {hasDiscount && (
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <span className="line-through text-slate-400 font-bold text-[10px] font-sans">
                          ৳{origPrice}
                        </span>
                        <span className="text-[9px] font-extrabold px-1 rounded bg-rose-100 text-rose-700">
                          {discountPct}%
                        </span>
                      </div>
                    )}

                    <div className="text-lg font-black text-blue-700 font-sans mt-0.5">
                      ৳{price}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {isEnglishUi ? 'Full Syllabus' : 'সম্পূর্ণ এক্সেস'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Personal Payment Gateway Selector */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              {isEnglishUi ? 'Select Payment Method (Personal Number)' : 'পেমেন্ট মেথড নির্বাচন করুন (পার্সোনাল নম্বর)'}
            </span>

            <div className="grid grid-cols-2 gap-3">
              {/* bKash */}
              <button
                type="button"
                onClick={() => setSelectedGateway('bkash')}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                  selectedGateway === 'bkash'
                    ? 'border-[#E2136E] bg-pink-50/60 ring-2 ring-[#E2136E]/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#E2136E] text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
                  bK
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <span>বিকাশ (bKash)</span>
                    {selectedGateway === 'bkash' && (
                      <CheckCircle2 className="w-4 h-4 text-[#E2136E]" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">Send Money (Personal)</div>
                </div>
              </button>

              {/* Nagad */}
              <button
                type="button"
                onClick={() => setSelectedGateway('nagad')}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                  selectedGateway === 'nagad'
                    ? 'border-[#F7941D] bg-orange-50/60 ring-2 ring-[#F7941D]/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#F7941D] text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
                  নগদ
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <span>নগদ (Nagad)</span>
                    {selectedGateway === 'nagad' && (
                      <CheckCircle2 className="w-4 h-4 text-[#F7941D]" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">Send Money (Personal)</div>
                </div>
              </button>
            </div>

            {/* Display Active Personal Number Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm border border-slate-700">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    selectedGateway === 'bkash' ? 'bg-[#E2136E] text-white' : 'bg-[#F7941D] text-white'
                  }`}>
                    {selectedGateway === 'bkash' ? 'bKash Personal' : 'Nagad Personal'}
                  </span>
                  <span className="text-xs text-slate-300">
                    ফি: <strong className="text-white font-sans">৳{activeAmount}</strong>
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono tracking-wider text-white">
                  {activeNumber}
                </div>
              </div>

              <Button
                type="button"
                onClick={() => handleCopy(activeNumber, selectedGateway === 'bkash' ? 'বিকাশ' : 'নগদ')}
                className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs gap-2 shrink-0 cursor-pointer"
              >
                {copiedNumber ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedNumber ? 'কপি হয়েছে' : 'নম্বর কপি করুন'}</span>
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 leading-relaxed space-y-1">
            <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>পেমেন্ট নির্দেশিকা (Payment Steps):</span>
            </div>
            <p>১. আপনার বিকাশ বা নগদ অ্যাপ থেকে <strong>Send Money</strong> অপশন ব্যবহার করে উপরের নম্বরে <strong>৳{activeAmount}</strong> পাঠান।</p>
            <p>২. পেমেন্ট সফল হলে ফিরতি SMS বা অ্যাপ থেকে প্রাপ্ত <strong>Transaction ID (TrxID)</strong> কপি করুন।</p>
            <p>৩. নিচের ফর্মে প্রেরক নম্বর ও TrxID বসিয়ে 'পেমেন্ট রিকোয়েস্ট পাঠান' বাটনে ক্লিক করুন।</p>
          </div>

          {/* Submission Form */}
          <form onSubmit={handleSubmitPayment} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  প্রেরক মোবাইল নম্বর (Sender Number) *
                </label>
                <input
                  type="text"
                  required
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Transaction ID (TrxID) *
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="যেমন: BL9K2X99A"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-11 px-5 rounded-xl font-semibold text-slate-600"
              >
                {isEnglishUi ? 'Cancel' : 'বাতিল'}
              </Button>

              <Button
                type="submit"
                disabled={submitting}
                className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm gap-2 shadow-sm cursor-pointer"
              >
                {submitting ? (
                  <span>যাচাই হচ্ছে...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{isEnglishUi ? 'Submit Payment' : 'পেমেন্ট রিকোয়েস্ট পাঠান'}</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;
