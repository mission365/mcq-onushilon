import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Edit2,
  ExternalLink,
  Filter,
  GraduationCap,
  Layers,
  Loader2,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
  Wallet,
  XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Navbar from '@/src/components/layout/Navbar';
import { DEFAULT_SUBJECT_UNLOCK_PRICE } from '@/src/lib/access';
import { apiJson } from '@/src/lib/api';
import { PaymentSettings, Subject } from '@/src/types';

type SubjectFormState = {
  name: string;
  nameBn: string;
  isActive: boolean;
  unlockPrice: number;
  academicLevel: 'hsc' | 'ssc' | 'olevel' | 'alevel' | 'igcse' | 'myp' | 'dp';
  stream: 'science' | 'commerce' | 'humanities' | 'common' | 'optional';
  curriculumVersion: 'bangla' | 'english' | 'british' | 'cambridge' | 'ib';
};

const initialFormState: SubjectFormState = {
  name: '',
  nameBn: '',
  isActive: true,
  unlockPrice: DEFAULT_SUBJECT_UNLOCK_PRICE,
  academicLevel: 'hsc',
  stream: 'common',
  curriculumVersion: 'bangla',
};

type PaymentSettingsFormState = {
  bkashNumber: string;
  bkashAccountName: string;
  paymentInstructions: string;
};

const initialPaymentSettings: PaymentSettingsFormState = {
  bkashNumber: '',
  bkashAccountName: '',
  paymentInstructions:
    '1. Send the exact amount to the bKash number shown here.\n2. Use Send Money or Payment and keep the transaction ID.\n3. Submit your sender number and transaction ID to unlock the subject instantly.',
};

const CURRICULUM_CONFIG: Record<
  string,
  { label: string; flag: string; badgeClass: string; borderClass: string; bgClass: string }
> = {
  bangla: {
    label: 'NCTB Bangla Version',
    flag: '🇧🇩',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    borderClass: 'border-emerald-200',
    bgClass: 'bg-emerald-50/50',
  },
  english: {
    label: 'NCTB English Version',
    flag: '🇬🇧',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    borderClass: 'border-blue-200',
    bgClass: 'bg-blue-50/50',
  },
  british: {
    label: 'British Curriculum (CAIE / Edexcel)',
    flag: '🇬🇧',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    borderClass: 'border-purple-200',
    bgClass: 'bg-purple-50/50',
  },
  cambridge: {
    label: 'Cambridge International',
    flag: '🌐',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
    borderClass: 'border-sky-200',
    bgClass: 'bg-sky-50/50',
  },
  ib: {
    label: 'International Baccalaureate (IB)',
    flag: '🌍',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    borderClass: 'border-amber-200',
    bgClass: 'bg-amber-50/50',
  },
};

const STREAM_CONFIG: Record<
  string,
  { label: string; icon: string; badgeClass: string }
> = {
  science: {
    label: 'Science (বিজ্ঞান)',
    icon: '🔬',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  commerce: {
    label: 'Business / Commerce (ব্যবসায় শিক্ষা)',
    icon: '💼',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  humanities: {
    label: 'Humanities / Arts (মানবিক)',
    icon: '📚',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  common: {
    label: 'Common / Compulsory (আবশ্যিক)',
    icon: '📖',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  optional: {
    label: 'Optional / 4th Subject (ঐচ্ছিক)',
    icon: '⚙️',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

const LEVEL_LABELS: Record<string, string> = {
  hsc: 'HSC (Higher Secondary • একাদশ-দ্বাদশ)',
  ssc: 'SSC (Secondary • নবম-দশম)',
  alevel: 'A Level (Advanced Level)',
  olevel: 'O Level (Ordinary Level)',
  igcse: 'IGCSE (Cambridge / Edexcel)',
  dp: 'IB DP (Diploma Programme)',
  myp: 'IB MYP (Middle Years Programme)',
};

const AdminSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<SubjectFormState>(initialFormState);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettingsFormState>(initialPaymentSettings);
  const [savingPaymentSettings, setSavingPaymentSettings] = useState(false);
  const [showPaymentSettings, setShowPaymentSettings] = useState(false);

  // Filters
  const [activeCurriculumTab, setActiveCurriculumTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [streamFilter, setStreamFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Collapsed sections tracker: key is "curriculum_level"
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const navigate = useNavigate();

  useEffect(() => {
    void fetchSubjects();
    void fetchPaymentSettings();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const data = await apiJson<Subject[]>('/api/subjects');
      setSubjects(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load subjects.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentSettings = async () => {
    try {
      const data = await apiJson<Partial<PaymentSettings>>('/api/payment-settings');
      if (data) {
        setPaymentSettings({
          bkashNumber: data.bkashNumber || '',
          bkashAccountName: data.bkashAccountName || '',
          paymentInstructions: data.paymentInstructions || initialPaymentSettings.paymentInstructions,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load payment settings.');
    }
  };

  const handleSavePaymentSettings = async () => {
    if (!paymentSettings.bkashNumber.trim()) {
      toast.error('Enter the bKash number students will pay to.');
      return;
    }

    try {
      setSavingPaymentSettings(true);
      await apiJson('/api/payment-settings', {
        method: 'POST',
        body: JSON.stringify({
          bkashNumber: paymentSettings.bkashNumber.trim(),
          bkashAccountName: paymentSettings.bkashAccountName.trim(),
          paymentInstructions: paymentSettings.paymentInstructions.trim(),
        }),
      });
      toast.success('Payment settings saved.');
      setShowPaymentSettings(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save payment settings.');
    } finally {
      setSavingPaymentSettings(false);
    }
  };

  const resetModalState = () => {
    setEditingSubject(null);
    setFormData(initialFormState);
    setIsModalOpen(false);
  };

  const openCreateModal = (curriculum?: string, level?: string, stream?: string) => {
    setEditingSubject(null);
    setFormData({
      ...initialFormState,
      curriculumVersion: (curriculum && curriculum !== 'all' ? curriculum : activeCurriculumTab !== 'all' ? activeCurriculumTab : 'bangla') as any,
      academicLevel: (level && level !== 'all' ? level : levelFilter !== 'all' ? levelFilter : 'hsc') as any,
      stream: (stream && stream !== 'all' ? stream : streamFilter !== 'all' ? streamFilter : 'common') as any,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      nameBn: subject.nameBn,
      isActive: subject.isActive,
      unlockPrice: subject.unlockPrice ?? DEFAULT_SUBJECT_UNLOCK_PRICE,
      academicLevel: (subject.academicLevel as any) || 'hsc',
      stream: (subject.stream as any) || 'common',
      curriculumVersion: (subject.curriculumVersion as any) || 'bangla',
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (subject: Subject) => {
    try {
      const updatedStatus = !subject.isActive;
      await apiJson(`/api/subjects/${subject.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: updatedStatus }),
      });
      setSubjects((prev) =>
        prev.map((s) => (s.id === subject.id ? { ...s, isActive: updatedStatus } : s))
      );
      toast.success(`"${subject.name}" is now ${updatedStatus ? 'Active' : 'Inactive'}.`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status.');
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.nameBn.trim()) {
      toast.error('Please enter both English and Bangla/alternate names.');
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        nameBn: formData.nameBn.trim(),
        isActive: formData.isActive,
        unlockPrice: Number(formData.unlockPrice) || 0,
        academicLevel: formData.academicLevel,
        stream: formData.stream,
        curriculumVersion: formData.curriculumVersion,
      };

      if (editingSubject) {
        await apiJson(`/api/subjects/${editingSubject.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast.success('Subject updated successfully.');
      } else {
        await apiJson('/api/subjects', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('New subject created.');
      }

      resetModalState();
      void fetchSubjects();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save the subject.');
    }
  };

  const handleDelete = async (subjectId: string, subjectName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${subjectName}"? This will delete associated chapters and exams.`)) {
      return;
    }

    try {
      await apiJson(`/api/subjects/${subjectId}`, { method: 'DELETE' });
      toast.success('Subject deleted.');
      void fetchSubjects();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete the subject.');
    }
  };

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // ── Curriculum Counts ────────────────────────────────────────────────────────
  const curriculumCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: subjects.length,
      bangla: 0,
      english: 0,
      british: 0,
      cambridge: 0,
      ib: 0,
    };
    subjects.forEach((s) => {
      const v = s.curriculumVersion || 'bangla';
      if (counts[v] !== undefined) {
        counts[v]++;
      }
    });
    return counts;
  }, [subjects]);

  // ── Filtered Subjects ────────────────────────────────────────────────────────
  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      // Curriculum filter
      if (activeCurriculumTab !== 'all') {
        const v = subject.curriculumVersion || 'bangla';
        if (v !== activeCurriculumTab) return false;
      }

      // Level filter
      if (levelFilter !== 'all') {
        if (subject.academicLevel !== levelFilter) return false;
      }

      // Stream filter
      if (streamFilter !== 'all') {
        if (subject.stream !== streamFilter) return false;
      }

      // Status filter
      if (statusFilter === 'active' && !subject.isActive) return false;
      if (statusFilter === 'inactive' && subject.isActive) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = subject.name?.toLowerCase().includes(q);
        const matchesNameBn = subject.nameBn?.toLowerCase().includes(q);
        if (!matchesName && !matchesNameBn) return false;
      }

      return true;
    });
  }, [subjects, activeCurriculumTab, levelFilter, streamFilter, statusFilter, searchQuery]);

  // ── Hierarchical Grouping: Curriculum -> Academic Level -> Stream ────────────
  type GroupedData = {
    curriculum: string;
    levels: {
      level: string;
      streams: {
        stream: string;
        subjects: Subject[];
      }[];
    }[];
  }[];

  const groupedSections: GroupedData = useMemo(() => {
    const streamOrder = ['common', 'science', 'commerce', 'humanities', 'optional'];
    const levelOrder = ['hsc', 'ssc', 'alevel', 'olevel', 'igcse', 'dp', 'myp'];
    const curriculumOrder = ['bangla', 'english', 'british', 'cambridge', 'ib'];

    // Group into nested map
    const map = new Map<string, Map<string, Map<string, Subject[]>>>();

    filteredSubjects.forEach((sub) => {
      const curr = sub.curriculumVersion || 'bangla';
      const lvl = sub.academicLevel || 'other';
      const strm = sub.stream || 'common';

      if (!map.has(curr)) map.set(curr, new Map());
      const levelMap = map.get(curr)!;

      if (!levelMap.has(lvl)) levelMap.set(lvl, new Map());
      const streamMap = levelMap.get(lvl)!;

      if (!streamMap.has(strm)) streamMap.set(strm, []);
      streamMap.get(strm)!.push(sub);
    });

    // Sort and convert to array
    const result: GroupedData = [];
    const sortedCurricula = Array.from(map.keys()).sort(
      (a, b) => curriculumOrder.indexOf(a) - curriculumOrder.indexOf(b)
    );

    for (const curr of sortedCurricula) {
      const levelMap = map.get(curr)!;
      const sortedLevels = Array.from(levelMap.keys()).sort(
        (a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b)
      );

      const levelsArr = [];
      for (const lvl of sortedLevels) {
        const streamMap = levelMap.get(lvl)!;
        const sortedStreams = Array.from(streamMap.keys()).sort(
          (a, b) => streamOrder.indexOf(a) - streamOrder.indexOf(b)
        );

        const streamsArr = sortedStreams.map((strm) => ({
          stream: strm,
          subjects: streamMap.get(strm)!,
        }));

        levelsArr.push({
          level: lvl,
          streams: streamsArr,
        });
      }

      result.push({
        curriculum: curr,
        levels: levelsArr,
      });
    }

    return result;
  }, [filteredSubjects]);

  // Overall stats
  const totalChapters = useMemo(() => subjects.reduce((sum, s) => sum + (s.chapterCount || 0), 0), [subjects]);
  const totalExams = useMemo(() => subjects.reduce((sum, s) => sum + (s.examCount || 0), 0), [subjects]);
  const activeCount = useMemo(() => subjects.filter((s) => s.isActive).length, [subjects]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      <Navbar role="admin" />

      <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/dashboard')}
                className="-ml-3 h-8 gap-1.5 text-slate-500 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
              <span className="text-slate-300">/</span>
              <span className="text-sm font-bold text-blue-600">Subjects Management</span>
            </div>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Manage Subjects
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Curriculum, Academic Level, and Group/Stream-wise accurate section management.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPaymentSettings(!showPaymentSettings)}
              className="h-11 gap-2 rounded-xl border-slate-200 bg-white font-bold text-slate-700 shadow-xs hover:border-pink-300 hover:text-pink-600"
            >
              <Wallet className="h-4 w-4 text-[#e2136e]" />
              bKash Payment Settings
            </Button>

            <Button
              onClick={() => openCreateModal()}
              className="h-11 gap-2 rounded-xl border-none bg-blue-600 px-6 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:translate-y-[-1px] hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Subject
            </Button>
          </div>
        </div>

        {/* Collapsible Payment Settings */}
        {showPaymentSettings && (
          <Card className="overflow-hidden rounded-2xl border border-pink-200 bg-white shadow-sm ring-1 ring-pink-100">
            <CardContent className="p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e2136e] text-white shadow-md shadow-pink-200">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Common bKash Payment Settings</h2>
                    <p className="text-xs text-slate-500">
                      Students will see this number and these instructions in the subject unlock sheet.
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPaymentSettings(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  Close
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="ml-1 text-xs font-bold text-slate-700">bKash Number</Label>
                  <Input
                    value={paymentSettings.bkashNumber}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, bkashNumber: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    className="h-11 rounded-xl border-slate-200 focus:border-[#e2136e]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="ml-1 text-xs font-bold text-slate-700">Account Name</Label>
                  <Input
                    value={paymentSettings.bkashAccountName}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, bkashAccountName: e.target.value })}
                    placeholder="e.g. HSC MCQ Platform"
                    className="h-11 rounded-xl border-slate-200 focus:border-[#e2136e]"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="ml-1 text-xs font-bold text-slate-700">Payment Instructions</Label>
                  <textarea
                    value={paymentSettings.paymentInstructions}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, paymentInstructions: e.target.value })}
                    className="min-h-[100px] w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#e2136e]"
                    placeholder="Write the steps students should follow after sending bKash payment."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => void handleSavePaymentSettings()}
                  disabled={savingPaymentSettings}
                  className="h-11 gap-2 rounded-xl border-none bg-[#e2136e] px-6 font-bold text-white shadow-md shadow-pink-200 hover:bg-[#c10f5d]"
                >
                  <Save className="h-4 w-4" />
                  {savingPaymentSettings ? 'Saving...' : 'Save Payment Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Subjects</span>
              <BookOpen className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">{subjects.length}</p>
            <p className="mt-0.5 text-xs text-slate-400">{activeCount} active in system</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Curricula</span>
              <Layers className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-black text-emerald-600">5</p>
            <p className="mt-0.5 text-xs text-slate-400">NCTB, British, Cambridge, IB</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Chapters</span>
              <GraduationCap className="h-4 w-4 text-purple-500" />
            </div>
            <p className="mt-2 text-2xl font-black text-purple-600">{totalChapters}</p>
            <p className="mt-0.5 text-xs text-slate-400">Mapped topics & chapters</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Test Papers</span>
              <Sparkles className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-black text-amber-600">{totalExams}</p>
            <p className="mt-0.5 text-xs text-slate-400">Model tests & board papers</p>
          </div>
        </div>

        {/* Curriculum Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveCurriculumTab('all')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all cursor-pointer ${
              activeCurriculumTab === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>All Curricula</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                activeCurriculumTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {curriculumCounts.all}
            </span>
          </button>

          {Object.entries(CURRICULUM_CONFIG).map(([key, cfg]) => {
            const count = curriculumCounts[key] || 0;
            const isSelected = activeCurriculumTab === key;

            return (
              <button
                key={key}
                onClick={() => setActiveCurriculumTab(key)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{cfg.flag}</span>
                <span>{cfg.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Toolbar */}
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search subject or code..."
                  className="h-10 pl-9 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus:bg-white"
                />
              </div>

              {/* Level Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-semibold text-slate-700 focus:bg-white focus:border-blue-500"
                >
                  <option value="all">All Academic Levels</option>
                  <option value="hsc">HSC (একাদশ-দ্বাদশ)</option>
                  <option value="ssc">SSC (নবম-দশম)</option>
                  <option value="alevel">A Level</option>
                  <option value="olevel">O Level</option>
                  <option value="igcse">IGCSE</option>
                  <option value="dp">IB DP</option>
                  <option value="myp">IB MYP</option>
                </select>
              </div>

              {/* Stream / Group Filter */}
              <div>
                <select
                  value={streamFilter}
                  onChange={(e) => setStreamFilter(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-semibold text-slate-700 focus:bg-white focus:border-blue-500"
                >
                  <option value="all">All Groups / Streams</option>
                  <option value="science">🔬 Science (বিজ্ঞান)</option>
                  <option value="commerce">💼 Business / Commerce</option>
                  <option value="humanities">📚 Humanities / Arts</option>
                  <option value="common">📖 Common / Compulsory</option>
                  <option value="optional">⚙️ Optional / 4th</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-semibold text-slate-700 focus:bg-white focus:border-blue-500"
                >
                  <option value="all">All Status (Active & Inactive)</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            {/* Active filter tags */}
            {(searchQuery || levelFilter !== 'all' || streamFilter !== 'all' || statusFilter !== 'all') && (
              <div className="mt-3 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span className="font-semibold">Filtered results: {filteredSubjects.length} subjects</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setLevelFilter('all');
                    setStreamFilter('all');
                    setStatusFilter('all');
                  }}
                  className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  Reset all filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SECTION-WISE DIVIDED SUBJECTS */}
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-24 shadow-2xs">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="mt-4 text-sm font-bold text-slate-600">Loading categorized subjects...</p>
          </div>
        ) : groupedSections.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center shadow-2xs">
            <Layers className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-bold text-slate-800">No subjects match your filters</h3>
            <p className="mt-1 text-sm text-slate-500">
              Try adjusting your search query, academic level, or group filter.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setLevelFilter('all');
                setStreamFilter('all');
                setStatusFilter('all');
                setActiveCurriculumTab('all');
              }}
              className="mt-4 rounded-xl border-slate-200"
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {groupedSections.map((currSection) => {
              const currCfg = CURRICULUM_CONFIG[currSection.curriculum] || {
                label: currSection.curriculum.toUpperCase(),
                flag: '📚',
                badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
                borderClass: 'border-slate-200',
                bgClass: 'bg-slate-50/50',
              };

              const currSubjectCount = currSection.levels.reduce(
                (sum, l) => sum + l.streams.reduce((s2, st) => s2 + st.subjects.length, 0),
                0
              );

              return (
                <div key={currSection.curriculum} className="space-y-6">
                  {/* Top Curriculum Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-200 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{currCfg.flag}</span>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                          {currCfg.label}
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                          {currSubjectCount} {currSubjectCount === 1 ? 'subject' : 'subjects'} configured
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => openCreateModal(currSection.curriculum)}
                      className="h-9 gap-1.5 rounded-xl border-none bg-blue-600 px-3.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 self-start sm:self-auto"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add to this Curriculum
                    </Button>
                  </div>

                  {/* Academic Level Sections */}
                  {currSection.levels.map((levelSection) => {
                    const levelKey = `${currSection.curriculum}_${levelSection.level}`;
                    const isCollapsed = !!collapsedSections[levelKey];
                    const levelLabel = LEVEL_LABELS[levelSection.level] || levelSection.level.toUpperCase();
                    const levelSubjectCount = levelSection.streams.reduce(
                      (sum, st) => sum + st.subjects.length,
                      0
                    );

                    return (
                      <div
                        key={levelKey}
                        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs transition-all"
                      >
                        {/* Level Header Strip */}
                        <div
                          onClick={() => toggleSection(levelKey)}
                          className="flex cursor-pointer items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50/50 p-4 sm:p-5 hover:bg-slate-100/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                              <GraduationCap className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                                  {levelLabel}
                                </h3>
                                <Badge variant="secondary" className="font-bold text-xs">
                                  {levelSubjectCount} {levelSubjectCount === 1 ? 'Subject' : 'Subjects'}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-400">
                                Click to {isCollapsed ? 'expand' : 'collapse'} groups under this level
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-slate-400">
                            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </div>
                        </div>

                        {/* Stream / Group Subsections */}
                        {!isCollapsed && (
                          <div className="divide-y divide-slate-100 p-4 sm:p-6 space-y-6">
                            {levelSection.streams.map((streamSection) => {
                              const streamCfg = STREAM_CONFIG[streamSection.stream] || {
                                label: streamSection.stream.toUpperCase(),
                                icon: '📁',
                                badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                              };

                              return (
                                <div key={streamSection.stream} className="space-y-3 pt-4 first:pt-0">
                                  {/* Group Header */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">{streamCfg.icon}</span>
                                      <h4 className="text-sm sm:text-base font-bold text-slate-800">
                                        {streamCfg.label}
                                      </h4>
                                      <Badge
                                        variant="outline"
                                        className={`text-[11px] font-bold ${streamCfg.badgeClass}`}
                                      >
                                        {streamSection.subjects.length}{' '}
                                        {streamSection.subjects.length === 1 ? 'subject' : 'subjects'}
                                      </Badge>
                                    </div>

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        openCreateModal(
                                          currSection.curriculum,
                                          levelSection.level,
                                          streamSection.stream
                                        )
                                      }
                                      className="h-7 gap-1 px-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                    >
                                      <Plus className="h-3 w-3" />
                                      Add here
                                    </Button>
                                  </div>

                                  {/* Subjects Table */}
                                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                                    <Table>
                                      <TableHeader className="bg-slate-50/80">
                                        <TableRow className="hover:bg-transparent">
                                          <TableHead className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            Subject Name (English & Alternate)
                                          </TableHead>
                                          <TableHead className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            Curriculum / Level
                                          </TableHead>
                                          <TableHead className="py-3 px-4 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            Chapters
                                          </TableHead>
                                          <TableHead className="py-3 px-4 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            Tests
                                          </TableHead>
                                          <TableHead className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            Price
                                          </TableHead>
                                          <TableHead className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            Status
                                          </TableHead>
                                          <TableHead className="py-3 px-4 text-right text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            Actions
                                          </TableHead>
                                        </TableRow>
                                      </TableHeader>

                                      <TableBody>
                                        {streamSection.subjects.map((sub) => (
                                          <TableRow
                                            key={sub.id}
                                            className="hover:bg-slate-50/50 transition-colors"
                                          >
                                            {/* Name */}
                                            <TableCell className="py-3.5 px-4 font-bold text-slate-900">
                                              <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                  <span className="text-sm font-bold text-slate-900">
                                                    {sub.name}
                                                  </span>
                                                  <button
                                                    onClick={() => navigate(`/subjects/${sub.id}`)}
                                                    title="View subject test papers"
                                                    className="text-slate-400 hover:text-blue-600 transition-colors"
                                                  >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                  </button>
                                                </div>
                                                {sub.nameBn && (
                                                  <p className="text-xs text-slate-500 font-sans">
                                                    {sub.nameBn}
                                                  </p>
                                                )}
                                              </div>
                                            </TableCell>

                                            {/* Curriculum / Level badge */}
                                            <TableCell className="py-3.5 px-4">
                                              <div className="flex flex-wrap items-center gap-1.5">
                                                <Badge
                                                  variant="outline"
                                                  className={`text-[10px] font-bold ${currCfg.badgeClass}`}
                                                >
                                                  {currSection.curriculum.toUpperCase()}
                                                </Badge>
                                                <Badge
                                                  variant="secondary"
                                                  className="text-[10px] font-bold bg-slate-100 text-slate-700"
                                                >
                                                  {sub.academicLevel?.toUpperCase() || 'HSC'}
                                                </Badge>
                                              </div>
                                            </TableCell>

                                            {/* Chapters Count */}
                                            <TableCell className="py-3.5 px-4 text-center">
                                              <span
                                                className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${
                                                  (sub.chapterCount || 0) > 0
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                                    : 'bg-slate-100 text-slate-400'
                                                }`}
                                              >
                                                {sub.chapterCount || 0} Ch
                                              </span>
                                            </TableCell>

                                            {/* Exams Count */}
                                            <TableCell className="py-3.5 px-4 text-center">
                                              <span
                                                className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${
                                                  (sub.examCount || 0) > 0
                                                    ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                                    : 'bg-slate-100 text-slate-400'
                                                }`}
                                              >
                                                {sub.examCount || 0} Tests
                                              </span>
                                            </TableCell>

                                            {/* Price */}
                                            <TableCell className="py-3.5 px-4 text-xs font-bold text-slate-700">
                                              BDT {Number(sub.unlockPrice ?? DEFAULT_SUBJECT_UNLOCK_PRICE).toFixed(0)}
                                            </TableCell>

                                            {/* Active / Inactive Switch */}
                                            <TableCell className="py-3.5 px-4">
                                              <button
                                                onClick={() => void handleToggleStatus(sub)}
                                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                                  sub.isActive
                                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                }`}
                                                title="Click to toggle Active / Inactive"
                                              >
                                                {sub.isActive ? (
                                                  <>
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Active
                                                  </>
                                                ) : (
                                                  <>
                                                    <XCircle className="h-3 w-3" />
                                                    Inactive
                                                  </>
                                                )}
                                              </button>
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="py-3.5 px-4 text-right">
                                              <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="h-8 rounded-lg border-slate-200 text-xs font-bold text-slate-700 hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                                                  onClick={() => navigate(`/subjects/${sub.id}`)}
                                                >
                                                  Tests
                                                </Button>

                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="h-8 rounded-lg border-slate-200 text-xs font-bold text-slate-700 hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                                                  onClick={() => openEditModal(sub)}
                                                >
                                                  <Edit2 className="h-3.5 w-3.5" />
                                                </Button>

                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="h-8 rounded-lg border-slate-200 text-red-500 hover:border-red-500 hover:bg-red-500 hover:text-white"
                                                  onClick={() => void handleDelete(sub.id, sub.name)}
                                                >
                                                  <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* CREATE / EDIT SUBJECT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg overflow-hidden rounded-3xl border-slate-200 p-0 shadow-2xl">
          <div className="border-b border-slate-200 bg-slate-50 p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="space-y-4 p-6 max-h-[75vh] overflow-y-auto">
            {/* Curriculum Selection */}
            <div className="space-y-1.5">
              <Label className="ml-1 text-xs font-bold text-slate-700">Curriculum Version</Label>
              <select
                value={formData.curriculumVersion}
                onChange={(e) => setFormData({ ...formData, curriculumVersion: e.target.value as any })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 font-semibold text-slate-800 text-sm focus:border-blue-500"
              >
                <option value="bangla">🇧🇩 NCTB Bangla Version (বাংলা মাধ্যম)</option>
                <option value="english">🇬🇧 NCTB English Version (ইংরেজি ভার্সন)</option>
                <option value="british">🇬🇧 British Curriculum (CAIE / Edexcel Past Papers)</option>
                <option value="cambridge">🌐 Cambridge International (O/A Level, IGCSE)</option>
                <option value="ib">🌍 International Baccalaureate (IB DP / MYP)</option>
              </select>
            </div>

            {/* Academic Level & Stream */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="ml-1 text-xs font-bold text-slate-700">Academic Level</Label>
                <select
                  value={formData.academicLevel}
                  onChange={(e) => setFormData({ ...formData, academicLevel: e.target.value as any })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 font-semibold text-slate-800 text-sm focus:border-blue-500"
                >
                  <option value="hsc">HSC (Higher Secondary)</option>
                  <option value="ssc">SSC (Secondary)</option>
                  <option value="alevel">A Level (Advanced Level)</option>
                  <option value="olevel">O Level (Ordinary Level)</option>
                  <option value="igcse">IGCSE</option>
                  <option value="dp">IB DP</option>
                  <option value="myp">IB MYP</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="ml-1 text-xs font-bold text-slate-700">Group / Stream</Label>
                <select
                  value={formData.stream}
                  onChange={(e) => setFormData({ ...formData, stream: e.target.value as any })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 font-semibold text-slate-800 text-sm focus:border-blue-500"
                >
                  <option value="common">📖 Common / Compulsory</option>
                  <option value="science">🔬 Science (বিজ্ঞান)</option>
                  <option value="commerce">💼 Business / Commerce</option>
                  <option value="humanities">📚 Humanities / Arts</option>
                  <option value="optional">⚙️ Optional / 4th</option>
                </select>
              </div>
            </div>

            {/* English Name */}
            <div className="space-y-1.5">
              <Label className="ml-1 text-xs font-bold text-slate-700">Subject Name (English)</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Higher Mathematics 1st Paper"
                className="h-11 rounded-xl border-slate-200 text-sm focus:border-blue-500"
              />
            </div>

            {/* Bangla / Alternate Name */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="ml-1 text-xs font-bold text-slate-700">
                  {formData.curriculumVersion === 'bangla'
                    ? 'Subject Name (বাংলা নাম)'
                    : 'Alternate / Code / Clean Title'}
                </Label>
                {formData.curriculumVersion !== 'bangla' && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, nameBn: formData.name })}
                    className="text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    Same as English Name
                  </button>
                )}
              </div>
              <Input
                value={formData.nameBn}
                onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                placeholder={
                  formData.curriculumVersion === 'bangla'
                    ? 'যেমন: উচ্চতর গণিত ১ম পত্র'
                    : 'e.g. Pure Mathematics (9709) or same as English name'
                }
                className="h-11 rounded-xl border-slate-200 text-sm focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400">
                {formData.curriculumVersion === 'bangla'
                  ? 'বাংলা মাধ্যমের জন্য বাংলায় লিখুন।'
                  : 'For English/British/Cambridge/IB, keep in English or subject code.'}
              </p>
            </div>

            {/* Unlock Price */}
            <div className="space-y-1.5">
              <Label className="ml-1 text-xs font-bold text-slate-700">Unlock Price (BDT)</Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={formData.unlockPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unlockPrice: Number(e.target.value) || 0,
                  })
                }
                placeholder="299"
                className="h-11 rounded-xl border-slate-200 text-sm focus:border-blue-500"
              />
            </div>

            {/* Is Active Checkbox */}
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
              <Checkbox
                id="active"
                checked={formData.isActive}
                onCheckedChange={(val) => setFormData({ ...formData, isActive: !!val })}
                className="h-5 w-5 border-slate-300 data-[state=checked]:bg-blue-600"
              />
              <Label htmlFor="active" className="cursor-pointer text-xs font-bold text-slate-700">
                Active (Publish and show this subject to students)
              </Label>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-slate-200 bg-slate-50 p-6">
            <Button
              variant="outline"
              onClick={resetModalState}
              className="h-11 flex-1 rounded-xl border-slate-200 bg-white font-bold text-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleSave()}
              className="h-11 flex-1 rounded-xl border-none bg-blue-600 font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700"
            >
              {editingSubject ? 'Save Changes' : 'Create Subject'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubjects;
