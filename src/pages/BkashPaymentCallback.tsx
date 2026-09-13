import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, ShieldAlert, Wallet } from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { apiJson } from '../lib/api';

type FinalizePaymentResponse = {
  success?: boolean;
  status?: 'completed' | 'cancel' | 'failure';
  subjectId?: string;
  subjectName?: string;
  paymentID?: string;
  trxID?: string;
  alreadyUnlocked?: boolean;
};

const BkashPaymentCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSubjectId = searchParams.get('subjectId');
  const callbackStatus = searchParams.get('status');
  const sessionId = searchParams.get('sessionId');
  const paymentID = searchParams.get('paymentID');
  const [state, setState] = useState<'loading' | 'success' | 'cancel' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your bKash payment...');
  const [subjectId, setSubjectId] = useState<string | null>(initialSubjectId);

  const returnPath = useMemo(() => (subjectId ? `/subjects/${subjectId}` : '/dashboard'), [subjectId]);

  useEffect(() => {
    let cancelled = false;

    const finalizePayment = async () => {
      if (!sessionId && !paymentID) {
        setState('error');
        setMessage('Missing payment reference. Please return to your dashboard and try again.');
        return;
      }

      try {
        const result = await apiJson<FinalizePaymentResponse>('/api/payments/bkash/finalize', {
          method: 'POST',
          body: JSON.stringify({
            sessionId,
            paymentID,
            status: callbackStatus,
          }),
        });

        if (cancelled) return;

        setSubjectId(result.subjectId || initialSubjectId);

        if (result.success) {
          setState('success');
          setMessage(
            result.alreadyUnlocked
              ? 'This subject is already unlocked on your account.'
              : 'Payment confirmed. Your locked model tests are now unlocked.',
          );

          window.setTimeout(() => {
            navigate(result.subjectId ? `/subjects/${result.subjectId}` : '/dashboard');
          }, 1800);
          return;
        }

        if (callbackStatus === 'cancel') {
          setState('cancel');
          setMessage('You cancelled the bKash payment before completion.');
          return;
        }

        setState('error');
        setMessage('The payment did not complete. Please try again.');
      } catch (error) {
        if (cancelled) return;

        if (callbackStatus === 'cancel') {
          setState('cancel');
          setMessage('You cancelled the bKash payment before completion.');
          return;
        }

        setState('error');
        setMessage(error instanceof Error ? error.message : 'Unable to verify the payment right now.');
      }
    };

    void finalizePayment();

    return () => {
      cancelled = true;
    };
  }, [callbackStatus, initialSubjectId, navigate, paymentID, sessionId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 font-sans text-slate-900">
      <Card className="w-full max-w-xl overflow-hidden rounded-3xl border-slate-200 bg-white shadow-xl">
        <CardHeader className="border-b border-slate-100 bg-slate-50 p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e2136e] text-white shadow-lg shadow-pink-200">
            {state === 'loading' ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : state === 'success' ? (
              <CheckCircle2 className="h-8 w-8" />
            ) : state === 'cancel' ? (
              <Wallet className="h-8 w-8" />
            ) : (
              <ShieldAlert className="h-8 w-8" />
            )}
          </div>
          <CardTitle className="text-3xl font-bold text-slate-900">
            {state === 'loading'
              ? 'Checking payment'
              : state === 'success'
                ? 'Unlock complete'
                : state === 'cancel'
                  ? 'Payment cancelled'
                  : 'Payment issue'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 p-8 text-center">
          <p className="text-base leading-relaxed text-slate-600">{message}</p>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left text-sm text-slate-500">
            <p>
              <span className="font-semibold text-slate-700">Payment ID:</span>{' '}
              {paymentID || 'Not available'}
            </p>
            <p className="mt-2">
              <span className="font-semibold text-slate-700">Callback status:</span>{' '}
              {callbackStatus || 'Not available'}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={() => navigate(returnPath)}
              className="h-12 rounded-xl border-none bg-slate-900 px-6 font-bold text-white hover:bg-slate-800"
            >
              Go to subject
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="h-12 rounded-xl border-slate-200 px-6 font-bold text-slate-700 hover:bg-slate-100"
            >
              Back to dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BkashPaymentCallback;
