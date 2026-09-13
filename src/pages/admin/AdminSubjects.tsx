import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { ArrowLeft, Edit2, Loader2, Plus, Save, Trash2, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Navbar from '@/src/components/layout/Navbar';
import { DEFAULT_SUBJECT_UNLOCK_PRICE } from '@/src/lib/access';
import { db } from '@/src/lib/firebase';
import { PAYMENT_SETTINGS_SUBJECT_ID, isPaymentSettingsSubject } from '@/src/lib/paymentSettings';
import { PaymentSettings, Subject } from '@/src/types';

type SubjectFormState = {
  name: string;
  nameBn: string;
  isActive: boolean;
  unlockPrice: number;
};

const initialFormState: SubjectFormState = {
  name: '',
  nameBn: '',
  isActive: true,
  unlockPrice: DEFAULT_SUBJECT_UNLOCK_PRICE,
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

const AdminSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<SubjectFormState>(initialFormState);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettingsFormState>(initialPaymentSettings);
  const [savingPaymentSettings, setSavingPaymentSettings] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    void fetchSubjects();
    void fetchPaymentSettings();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);

    try {
      const snapshot = await getDocs(collection(db, 'subjects'));
      const nextSubjects = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() } as Subject))
        .filter((item) => !isPaymentSettingsSubject(item.id))
        .sort((a, b) => a.name.localeCompare(b.name));

      setSubjects(nextSubjects);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load subjects.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentSettings = async () => {
    try {
      const snapshot = await getDoc(doc(db, 'subjects', PAYMENT_SETTINGS_SUBJECT_ID));
      if (!snapshot.exists()) {
        setPaymentSettings(initialPaymentSettings);
        return;
      }

      const data = snapshot.data() as Partial<PaymentSettings>;
      setPaymentSettings({
        bkashNumber: data.bkashNumber || '',
        bkashAccountName: data.bkashAccountName || '',
        paymentInstructions: data.paymentInstructions || initialPaymentSettings.paymentInstructions,
      });
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
      await setDoc(
        doc(db, 'subjects', PAYMENT_SETTINGS_SUBJECT_ID),
        {
          name: 'Payment Settings',
          nameBn: 'Payment Settings',
          isActive: false,
          unlockPrice: 0,
          isSystem: true,
          bkashNumber: paymentSettings.bkashNumber.trim(),
          bkashAccountName: paymentSettings.bkashAccountName.trim(),
          paymentInstructions: paymentSettings.paymentInstructions.trim(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      toast.success('Payment settings saved.');
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

  const openCreateModal = () => {
    setEditingSubject(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      nameBn: subject.nameBn,
      isActive: subject.isActive,
      unlockPrice: subject.unlockPrice ?? DEFAULT_SUBJECT_UNLOCK_PRICE,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.nameBn.trim()) {
      toast.error('Please fill in both subject names.');
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        nameBn: formData.nameBn.trim(),
        isActive: formData.isActive,
        unlockPrice: Number(formData.unlockPrice) || 0,
      };

      if (editingSubject) {
        await updateDoc(doc(db, 'subjects', editingSubject.id), payload);
        toast.success('Subject updated successfully.');
      } else {
        await addDoc(collection(db, 'subjects'), {
          ...payload,
          createdAt: serverTimestamp(),
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

  const handleDelete = async (subjectId: string) => {
    if (!window.confirm('Delete this subject?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'subjects', subjectId));
      toast.success('Subject deleted.');
      void fetchSubjects();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete the subject.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      <Navbar role="admin" />

      <main className="mx-auto w-full max-w-6xl space-y-10 p-10">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/dashboard')}
            className="-ml-4 gap-2 text-slate-500 shadow-none hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={openCreateModal}
            className="h-12 gap-3 rounded-xl border-none bg-blue-600 px-8 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:translate-y-[-2px] hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Add Subject
          </Button>
        </div>

        <section>
          <Card className="mb-8 overflow-hidden rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-200">
            <CardContent className="p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e2136e] text-white shadow-lg shadow-pink-200">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Common bKash Payment Settings</h2>
                  <p className="text-sm text-slate-500">
                    Students will see this number and these instructions in the subject unlock sheet.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="ml-1 font-bold text-slate-700">bKash Number</Label>
                  <Input
                    value={paymentSettings.bkashNumber}
                    onChange={(event) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        bkashNumber: event.target.value,
                      })
                    }
                    placeholder="01XXXXXXXXX"
                    className="h-12 rounded-xl border-slate-200 focus:border-[#e2136e]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="ml-1 font-bold text-slate-700">Account Name</Label>
                  <Input
                    value={paymentSettings.bkashAccountName}
                    onChange={(event) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        bkashAccountName: event.target.value,
                      })
                    }
                    placeholder="e.g. HSC MCQ Platform"
                    className="h-12 rounded-xl border-slate-200 focus:border-[#e2136e]"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="ml-1 font-bold text-slate-700">Payment Instructions</Label>
                  <textarea
                    value={paymentSettings.paymentInstructions}
                    onChange={(event) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        paymentInstructions: event.target.value,
                      })
                    }
                    className="min-h-[120px] w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-[#e2136e]"
                    placeholder="Write the steps students should follow after sending bKash payment."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => void handleSavePaymentSettings()}
                  disabled={savingPaymentSettings}
                  className="h-12 gap-2 rounded-xl border-none bg-[#e2136e] px-6 font-bold text-white shadow-lg shadow-pink-200 hover:bg-[#c10f5d]"
                >
                  <Save className="h-4 w-4" />
                  {savingPaymentSettings ? 'Saving...' : 'Save Payment Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <header className="mb-8">
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-slate-900">Manage Subjects</h1>
            <p className="text-lg text-slate-500">
              Maintain subject names, publication status, and the one-time unlock price for premium tests.
            </p>
          </header>

          <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-200">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center p-20">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="border-b border-slate-100 bg-slate-50">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          English Name
                        </TableHead>
                        <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          Bangla Name
                        </TableHead>
                        <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          Unlock Price
                        </TableHead>
                        <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          Status
                        </TableHead>
                        <TableHead className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {subjects.length > 0 ? (
                        subjects.map((subject) => (
                          <TableRow
                            key={subject.id}
                            className="border-b border-slate-50 transition-colors hover:bg-slate-50/50 last:border-0"
                          >
                            <TableCell className="px-8 py-6 font-bold text-slate-900">
                              {subject.name}
                            </TableCell>
                            <TableCell className="px-8 py-6 text-lg font-bold text-slate-900 font-bengali">
                              {subject.nameBn}
                            </TableCell>
                            <TableCell className="px-8 py-6 font-bold text-slate-900">
                              BDT {Number(subject.unlockPrice ?? DEFAULT_SUBJECT_UNLOCK_PRICE).toFixed(0)}
                            </TableCell>
                            <TableCell className="px-8 py-6">
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                                  subject.isActive
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {subject.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </TableCell>
                            <TableCell className="space-x-3 px-8 py-6 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg border-slate-200 transition-all hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                                onClick={() => openEditModal(subject)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg border-slate-100 text-red-500 transition-all hover:border-red-500 hover:bg-red-500 hover:text-white"
                                onClick={() => void handleDelete(subject.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="py-20 text-center text-lg italic text-slate-400">
                            No subjects found yet. Use the button above to create one.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md overflow-hidden rounded-2xl border-slate-200 p-0 shadow-2xl">
          <div className="border-b border-slate-200 bg-slate-50 p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="space-y-6 p-8">
            <div className="space-y-2">
              <Label className="ml-1 font-bold text-slate-700">Subject English Name</Label>
              <Input
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                placeholder="e.g. Higher Math"
                className="h-12 rounded-xl border-slate-200 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="ml-1 font-bold text-slate-700">Subject Bangla Name</Label>
              <Input
                value={formData.nameBn}
                onChange={(event) => setFormData({ ...formData, nameBn: event.target.value })}
                placeholder="e.g. উচ্চতর গণিত"
                className="h-12 rounded-xl border-slate-200 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="ml-1 font-bold text-slate-700">Unlock Price (BDT)</Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={formData.unlockPrice}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    unlockPrice: Number(event.target.value) || 0,
                  })
                }
                placeholder="299"
                className="h-12 rounded-xl border-slate-200 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <Checkbox
                id="active"
                checked={formData.isActive}
                onCheckedChange={(value) => setFormData({ ...formData, isActive: !!value })}
                className="h-5 w-5 border-slate-300 data-[state=checked]:bg-blue-600"
              />
              <Label htmlFor="active" className="cursor-pointer font-medium text-slate-700">
                Show this subject to students
              </Label>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 p-8 sm:flex-row">
            <Button
              variant="ghost"
              onClick={resetModalState}
              className="h-14 flex-1 rounded-xl border border-slate-200 bg-white font-bold text-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleSave()}
              className="h-14 flex-1 rounded-xl border-none bg-blue-600 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:translate-y-[-2px] hover:bg-blue-700"
            >
              Save Subject
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubjects;
