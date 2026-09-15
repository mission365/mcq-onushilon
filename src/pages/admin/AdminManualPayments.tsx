import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock3, Loader2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Navbar from '@/src/components/layout/Navbar';
import { apiJson } from '@/src/lib/api';

type ManualPaymentRequest = {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  subjectId: string;
  subjectName: string;
  senderBkashNumber: string;
  receiverBkashNumber: string;
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
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ManualPaymentRequest[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await apiJson<ManualPaymentRequest[]>('/api/admin/manual-payments');
      setRequests(data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load payment requests.');
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

      toast.success('Payment approved and subject unlocked.');
      await fetchRequests();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to approve this request.');
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

      toast.success('Payment request rejected.');
      await fetchRequests();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to reject this request.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar role="admin" />
      <main className="mx-auto w-full max-w-7xl space-y-8 p-8">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/dashboard')}
            className="-ml-3 gap-2 text-slate-500 shadow-none hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <Card className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-200">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Manual bKash Payment Requests</h1>
                <p className="text-sm text-slate-500">
                  Approve a request to unlock all locked tests for that subject.
                </p>
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
                      <TableHead>User</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Sender Number</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Submitted At</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.length > 0 ? (
                      requests.map((requestItem) => {
                        const isBusy = processingId === requestItem.id;
                        const canReview = requestItem.status === 'submitted' && !isBusy;

                        return (
                          <TableRow key={requestItem.id}>
                            <TableCell className="font-semibold text-slate-800">
                              {requestItem.userName || requestItem.userEmail || requestItem.userId}
                            </TableCell>
                            <TableCell className="font-medium text-slate-700">{requestItem.subjectName}</TableCell>
                            <TableCell className="font-semibold text-slate-800">
                              {requestItem.currency || 'BDT'} {Number(requestItem.amount || 0).toFixed(0)}
                            </TableCell>
                            <TableCell>{requestItem.senderBkashNumber}</TableCell>
                            <TableCell className="font-semibold uppercase">{requestItem.transactionId}</TableCell>
                            <TableCell>{formatDateTime(requestItem.createdAt)}</TableCell>
                            <TableCell>
                              {requestItem.status === 'submitted' && (
                                <Badge className="border-none bg-amber-100 text-amber-700">Pending</Badge>
                              )}
                              {requestItem.status === 'approved' && (
                                <Badge className="border-none bg-emerald-100 text-emerald-700">Approved</Badge>
                              )}
                              {requestItem.status === 'rejected' && (
                                <Badge className="border-none bg-rose-100 text-rose-700">Rejected</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="inline-flex items-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => void handleApprove(requestItem)}
                                  disabled={!canReview}
                                  className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                  {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => void handleReject(requestItem)}
                                  disabled={!canReview}
                                  className="gap-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="py-14 text-center text-slate-500">
                          <div className="inline-flex items-center gap-2">
                            <Clock3 className="h-4 w-4" />
                            No payment requests yet.
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
      </main>
    </div>
  );
};

export default AdminManualPayments;
