import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  XCircle,
  Settings,
  CreditCard,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  Search,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Navbar from '@/src/components/layout/Navbar';
import { apiJson } from '@/src/lib/api';
import { PaymentSettings } from '@/src/types';

type ManualPaymentRequest = {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  planType?: string;
  curriculumVersion?: string;
  subjectId?: string;
  subjectName?: string;
  gateway?: 'bkash' | 'nagad';
  senderNumber?: string;
  senderBkashNumber?: string;
  receiverBkashNumber?: string;
  receiverName?: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'submitted' | 'approved' | 'rejected';
  createdAt?: unknown;
  reviewedAt?: unknown;
};

const formatDateTime = (value: unknown) => {
  if (!value) return '-';
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return '-';
  return new Intl.DateTimeFormat('bn-BD', { dateStyle: 'medium', timeStyle: 'short' }).format(parsed);
};

const AdminManualPayments = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'requests' | 'settings'>('requests');
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [requests, setRequests] = useState<ManualPaymentRequest[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Payment settings state
  const [settings, setSettings] = useState<PaymentSettings>({
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
    discountExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    discountActive: true,
    paymentInstructions: '',
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [paymentsData, settingsData] = await Promise.all([
        apiJson<ManualPaymentRequest[]>('/api/admin/manual-payments'),
        apiJson<PaymentSettings>('/api/payment-settings').catch(() => null),
      ]);
      setRequests(paymentsData || []);
      if (settingsData) {
        setSettings({
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
          discountExpiresAt: settingsData.discountExpiresAt || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          discountActive: settingsData.discountActive !== undefined ? Boolean(settingsData.discountActive) : true,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load payment data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRequests();
  }, []);

  const handleApprove = async (requestItem: ManualPaymentRequest) => {
    if (requestItem.status !== 'submitted') {
      return;
    }

    setProcessingId(requestItem.id);
    try {
      await apiJson(`/api/admin/manual-payments/${requestItem.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'approved' }),
      });

      toast.success('পেমেন্ট অনুমোদিত হয়েছে এবং শিক্ষার্থীর সাবস্ক্রিপশন চালু হয়েছে।');
      await fetchRequests();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'অনুমোদন করতে ব্যর্থ হয়েছে।');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestItem: ManualPaymentRequest) => {
    if (requestItem.status !== 'submitted') {
      return;
    }

    setProcessingId(requestItem.id);
    try {
      await apiJson(`/api/admin/manual-payments/${requestItem.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'rejected' }),
      });

      toast.success('পেমেন্ট রিকোয়েস্ট বাতিল করা হয়েছে।');
      await fetchRequests();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'বাতিল করতে ব্যর্থ হয়েছে।');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await apiJson('/api/payment-settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      toast.success('পেমেন্ট ও সাবস্ক্রিপশন সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'সেটিংস সংরক্ষণ করতে ব্যর্থ হয়েছে।');
    } finally {
      setSavingSettings(false);
    }
  };

  const getCurriculumBadge = (version?: string) => {
    switch (version) {
      case 'bangla':
        return <Badge className="bg-emerald-100 text-emerald-800 border-none">বাংলা মাধ্যম</Badge>;
      case 'english':
        return <Badge className="bg-cyan-100 text-cyan-800 border-none">English Version</Badge>;
      case 'british':
        return <Badge className="bg-blue-100 text-blue-800 border-none">British (O/A Level)</Badge>;
      case 'ib':
        return <Badge className="bg-purple-100 text-purple-800 border-none">IB (MYP/DP)</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700 border-none">{version || 'General'}</Badge>;
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const userMatch = (r.userName || '').toLowerCase().includes(q) || (r.userEmail || '').toLowerCase().includes(q);
    const trxMatch = (r.transactionId || '').toLowerCase().includes(q);
    const senderMatch = (r.senderNumber || r.senderBkashNumber || '').toLowerCase().includes(q);
    return userMatch || trxMatch || senderMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar role="admin" />
      <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/dashboard')}
            className="-ml-3 gap-2 text-slate-500 shadow-none hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Button>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'requests'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>পেমেন্ট রিকোয়েস্ট ({requests.filter(r => r.status === 'submitted').length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4 text-purple-600" />
              <span>সাবস্ক্রিপশন ও নম্বর সেটিংস</span>
            </button>
          </div>
        </div>

        {/* TAB 1: Payment Requests List */}
        {activeTab === 'requests' && (
          <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-200">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    বিকাশ ও নগদ সাবস্ক্রিপশন পেমেন্ট রিকোয়েস্ট
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    শিক্ষার্থীদের পাঠানো TrxID যাচাই করে অনুমোদন (Approve) করুন। অনুমোদন দেওয়া মাত্রই তাদের ৩টি ফ্রি টেস্টের লিমিট উঠে গিয়ে আনলিমিটেড এক্সেস চালু হবে।
                  </p>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="নাম, ইমেইল বা TrxID খুঁজুন..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead>শিক্ষার্থী (User)</TableHead>
                        <TableHead>কারিকুলাম (Curriculum)</TableHead>
                        <TableHead>পদ্ধতি (Method)</TableHead>
                        <TableHead>ফি (Amount)</TableHead>
                        <TableHead>প্রেরক নম্বর (Sender)</TableHead>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>জমা দেওয়ার তারিখ</TableHead>
                        <TableHead>অবস্থা (Status)</TableHead>
                        <TableHead className="text-right">একশন (Actions)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.length > 0 ? (
                        filteredRequests.map((requestItem) => {
                          const isBusy = processingId === requestItem.id;
                          const canReview = requestItem.status === 'submitted' && !isBusy;
                          const gateway = requestItem.gateway || 'bkash';

                          return (
                            <TableRow key={requestItem.id}>
                              <TableCell>
                                <div className="font-bold text-slate-900">
                                  {requestItem.userName || 'Student'}
                                </div>
                                <div className="text-xs text-slate-500 font-sans">
                                  {requestItem.userEmail}
                                </div>
                              </TableCell>
                              <TableCell>
                                {getCurriculumBadge(requestItem.curriculumVersion)}
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                  gateway === 'nagad' ? 'bg-orange-100 text-orange-700' : 'bg-pink-100 text-pink-700'
                                }`}>
                                  {gateway === 'nagad' ? 'Nagad' : 'bKash'}
                                </span>
                              </TableCell>
                              <TableCell className="font-bold font-sans text-slate-900">
                                ৳{Number(requestItem.amount || 0).toFixed(0)}
                              </TableCell>
                              <TableCell className="font-mono text-xs font-bold text-slate-700">
                                {requestItem.senderNumber || requestItem.senderBkashNumber || '-'}
                              </TableCell>
                              <TableCell>
                                <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200 uppercase">
                                  {requestItem.transactionId}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs text-slate-500">
                                {formatDateTime(requestItem.createdAt)}
                              </TableCell>
                              <TableCell>
                                {requestItem.status === 'submitted' && (
                                  <Badge className="border-none bg-amber-100 text-amber-700 font-bold">Pending</Badge>
                                )}
                                {requestItem.status === 'approved' && (
                                  <Badge className="border-none bg-emerald-100 text-emerald-700 font-bold">Approved</Badge>
                                )}
                                {requestItem.status === 'rejected' && (
                                  <Badge className="border-none bg-rose-100 text-rose-700 font-bold">Rejected</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="inline-flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => void handleApprove(requestItem)}
                                    disabled={!canReview}
                                    className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs rounded-xl"
                                  >
                                    {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => void handleReject(requestItem)}
                                    disabled={!canReview}
                                    className="gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold text-xs rounded-xl"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                    Reject
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="py-14 text-center text-slate-500">
                            <div className="inline-flex items-center gap-2">
                              <Clock3 className="h-4 w-4" />
                              কোনো পেমেন্ট রিকোয়েস্ট পাওয়া যায়নি।
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 2: Payment & Subscription Pricing Settings */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-200">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    পার্সোনাল বিকাশ ও নগদ নম্বর কনফিগারেশন
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    শিক্ষার্থীরা সাবস্ক্রিপশন নেওয়ার সময় এই নম্বরগুলোতে Send Money করবে। যেকোনো সময় নম্বর ও অ্যাকাউন্টের নাম পরিবর্তন করতে পারেন।
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* bKash Personal */}
                  <div className="p-5 rounded-2xl bg-pink-50/50 border border-pink-100 space-y-3">
                    <div className="flex items-center gap-2 text-pink-700 font-bold text-sm">
                      <div className="w-7 h-7 rounded-lg bg-[#E2136E] text-white flex items-center justify-center text-xs font-bold">
                        bK
                      </div>
                      <span>বিকাশ পার্সোনাল সেটিংস (bKash Personal)</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        বিকাশ পার্সোনাল নম্বর *
                      </label>
                      <input
                        type="text"
                        required
                        value={settings.bkashNumber}
                        onChange={(e) => setSettings({ ...settings, bkashNumber: e.target.value })}
                        placeholder="017XXXXXXXX"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#E2136E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        অ্যাকাউন্টের নাম / বিবরণ
                      </label>
                      <input
                        type="text"
                        value={settings.bkashAccountName || ''}
                        onChange={(e) => setSettings({ ...settings, bkashAccountName: e.target.value })}
                        placeholder="যেমন: MCQ Onushilon (Personal)"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E2136E]"
                      />
                    </div>
                  </div>

                  {/* Nagad Personal */}
                  <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-100 space-y-3">
                    <div className="flex items-center gap-2 text-orange-700 font-bold text-sm">
                      <div className="w-7 h-7 rounded-lg bg-[#F7941D] text-white flex items-center justify-center text-xs font-bold">
                        নগদ
                      </div>
                      <span>নগদ পার্সোনাল সেটিংস (Nagad Personal)</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        নগদ পার্সোনাল নম্বর *
                      </label>
                      <input
                        type="text"
                        required
                        value={settings.nagadNumber || ''}
                        onChange={(e) => setSettings({ ...settings, nagadNumber: e.target.value })}
                        placeholder="018XXXXXXXX"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#F7941D]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        অ্যাকাউন্টের নাম / বিবরণ
                      </label>
                      <input
                        type="text"
                        value={settings.nagadAccountName || ''}
                        onChange={(e) => setSettings({ ...settings, nagadAccountName: e.target.value })}
                        placeholder="যেমন: MCQ Onushilon (Personal)"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F7941D]"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Discount & Countdown Timer Controls */}
            <Card className="rounded-3xl border-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 shadow-sm ring-1 ring-amber-200">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      মেগা ডিসকাউন্ট অফার ও লাইভ টাইমার
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">
                      অফার শিরোনাম ও কাউন্টডাউন টাইমার কনফিগারেশন
                    </h2>
                    <p className="text-xs text-slate-600">
                      এখানে যে সময় ও শিরোনাম সেট করবেন, সাবস্ক্রিপশন পেজে ও পপআপে শিক্ষার্থীদের সামনে লাইভ কাউন্টডাউন হিসেবে প্রদর্শিত হবে।
                    </p>
                  </div>
                  <label className="relative inline-flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-2xl border border-amber-300 shadow-xs">
                    <input
                      type="checkbox"
                      checked={settings.discountActive}
                      onChange={(e) => setSettings({ ...settings, discountActive: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800">অফার সক্রিয় রাখুন</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Discount Title */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      অফার শিরোনাম (Headline)
                    </label>
                    <input
                      type="text"
                      value={settings.discountTitle || ''}
                      onChange={(e) => setSettings({ ...settings, discountTitle: e.target.value })}
                      placeholder="উদাঃ সীমিত সময়ের মেগা অফার! ৫০% পর্যন্ত ছাড়"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold font-sans focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Discount Expiry DateTime */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      অফার শেষ হওয়ার তারিখ ও সময় (Expiry Date & Time)
                    </label>
                    <input
                      type="datetime-local"
                      value={settings.discountExpiresAt ? new Date(settings.discountExpiresAt).toISOString().slice(0, 16) : ''}
                      onChange={(e) => {
                        const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                        setSettings({ ...settings, discountExpiresAt: val });
                      }}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-sans font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    {settings.discountExpiresAt && (
                      <p className="text-[11px] text-amber-800 font-medium">
                        নির্ধারিত সময়: {new Date(settings.discountExpiresAt).toLocaleString('bn-BD', { dateStyle: 'full', timeStyle: 'short' })}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4 Curriculum Prices */}
            <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-200">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    ৪টি কারিকুলামের রেগুলার ও অফার সাবস্ক্রিপশন ফি (টাকায়)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    প্রতিটি কারিকুলামের বর্তমান অফার ফি এবং পূর্বের রেগুলার ফি নির্ধারণ করুন। শিক্ষার্থীরা কার্ডে স্ট্রাইক-থ্রু এবং ডিসকাউন্ট পার্সেন্টেজ দেখতে পাবে।
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* 1. Bangla Medium */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold">
                        বাংলা মাধ্যম (HSC & SSC)
                      </Badge>
                      {settings.originalPriceBangla && settings.priceBangla && settings.originalPriceBangla > settings.priceBangla && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                          {Math.round(((settings.originalPriceBangla - settings.priceBangla) / settings.originalPriceBangla) * 100)}% ছাড়
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">
                        বর্তমান অফার ফি (৳) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                        <input
                          type="number"
                          required
                          min="0"
                          value={settings.priceBangla}
                          onChange={(e) => setSettings({ ...settings, priceBangla: Number(e.target.value) })}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-base font-bold font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-500">
                        রেগুলার / মূল ফি (৳)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                        <input
                          type="number"
                          min="0"
                          value={settings.originalPriceBangla ?? 999}
                          onChange={(e) => setSettings({ ...settings, originalPriceBangla: Number(e.target.value) })}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold font-sans focus:outline-none focus:ring-2 focus:ring-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. English Version */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-cyan-100 text-cyan-800 border-none font-bold">
                        English Version (HSC & SSC)
                      </Badge>
                      {settings.originalPriceEnglish && settings.priceEnglish && settings.originalPriceEnglish > settings.priceEnglish && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-600 text-white shadow-xs">
                          {Math.round(((settings.originalPriceEnglish - settings.priceEnglish) / settings.originalPriceEnglish) * 100)}% ছাড়
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">
                        বর্তমান অফার ফি (৳) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                        <input
                          type="number"
                          required
                          min="0"
                          value={settings.priceEnglish}
                          onChange={(e) => setSettings({ ...settings, priceEnglish: Number(e.target.value) })}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-base font-bold font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-500">
                        রেগুলার / মূল ফি (৳)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                        <input
                          type="number"
                          min="0"
                          value={settings.originalPriceEnglish ?? 1299}
                          onChange={(e) => setSettings({ ...settings, originalPriceEnglish: Number(e.target.value) })}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold font-sans focus:outline-none focus:ring-2 focus:ring-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. British Curriculum */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-100 text-blue-800 border-none font-bold">
                        British (O/A Level)
                      </Badge>
                      {settings.originalPriceBritish && settings.priceBritish && settings.originalPriceBritish > settings.priceBritish && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                          {Math.round(((settings.originalPriceBritish - settings.priceBritish) / settings.originalPriceBritish) * 100)}% ছাড়
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">
                        বর্তমান অফার ফি (৳) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                        <input
                          type="number"
                          required
                          min="0"
                          value={settings.priceBritish}
                          onChange={(e) => setSettings({ ...settings, priceBritish: Number(e.target.value) })}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-base font-bold font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-500">
                        রেগুলার / মূল ফি (৳)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                        <input
                          type="number"
                          min="0"
                          value={settings.originalPriceBritish ?? 2000}
                          onChange={(e) => setSettings({ ...settings, originalPriceBritish: Number(e.target.value) })}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold font-sans focus:outline-none focus:ring-2 focus:ring-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. IB */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-purple-100 text-purple-800 border-none font-bold">
                        IB (MYP & DP)
                      </Badge>
                      {settings.originalPriceIb && settings.priceIb && settings.originalPriceIb > settings.priceIb && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white shadow-xs">
                          {Math.round(((settings.originalPriceIb - settings.priceIb) / settings.originalPriceIb) * 100)}% ছাড়
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">
                        বর্তমান অফার ফি (৳) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                        <input
                          type="number"
                          required
                          min="0"
                          value={settings.priceIb}
                          onChange={(e) => setSettings({ ...settings, priceIb: Number(e.target.value) })}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-base font-bold font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-500">
                        রেগুলার / মূল ফি (৳)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                        <input
                          type="number"
                          min="0"
                          value={settings.originalPriceIb ?? 2500}
                          onChange={(e) => setSettings({ ...settings, originalPriceIb: Number(e.target.value) })}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold font-sans focus:outline-none focus:ring-2 focus:ring-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>


                {/* Instructions */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    পেমেন্ট নির্দেশিকা টেক্সট (Payment Instructions)
                  </label>
                  <textarea
                    rows={4}
                    value={settings.paymentInstructions || ''}
                    onChange={(e) => setSettings({ ...settings, paymentInstructions: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="পেমেন্ট করার নিয়মাবলি লিখুন..."
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={savingSettings}
                    className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm gap-2 shadow-md cursor-pointer"
                  >
                    {savingSettings ? (
                      <span>সংরক্ষণ করা হচ্ছে...</span>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>সেটিংস সংরক্ষণ করুন (Save Settings)</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </main>
    </div>
  );
};

export default AdminManualPayments;
