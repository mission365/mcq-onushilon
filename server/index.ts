import crypto from 'node:crypto';

import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import { FieldValue } from 'firebase-admin/firestore';

import { DEFAULT_SUBJECT_UNLOCK_PRICE } from '../src/lib/access';
import { PAYMENT_SETTINGS_SUBJECT_ID } from '../src/lib/paymentSettings';
import { Subject } from '../src/types';
import {
  BkashApiError,
  createBkashPayment,
  executeBkashPayment,
  getBkashCallbackBaseUrl,
  queryBkashPayment,
} from './bkash';
import { adminAuth, adminDb } from './firebaseAdmin';
import { isMailerConfigured, sendMail } from './mailer';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);

app.use(express.json({ limit: '1mb' }));

app.use((request, response, next) => {
  const origin = request.headers.origin;

  if (origin) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
  }

  response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (request.method === 'OPTIONS') {
    response.sendStatus(204);
    return;
  }

  next();
});

type VerifiedUser = {
  uid: string;
  email?: string;
};

type PaymentSessionRecord = {
  userId: string;
  subjectId: string;
  subjectName: string;
  gateway: 'bkash';
  paymentMethod?: 'gateway' | 'manual';
  amount: number;
  currency: 'BDT';
  merchantInvoiceNumber: string;
  status: 'creating' | 'pending' | 'completed' | 'failed' | 'cancelled';
  bkashPaymentID?: string;
  bkashURL?: string;
  callbackURL?: string;
  callbackStatus?: 'success' | 'failure' | 'cancel';
  transactionStatus?: string;
  trxID?: string;
};

type ManualPaymentRequestRecord = {
  userId: string;
  subjectId: string;
  subjectName: string;
  gateway: 'bkash';
  paymentMethod: 'manual';
  amount: number;
  currency: 'BDT';
  senderBkashNumber: string;
  receiverBkashNumber: string;
  receiverName?: string;
  transactionId: string;
  status: 'submitted' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: unknown;
  reviewNote?: string;
};

type PasswordResetOtpRecord = {
  codeHash: string | null;
  email: string;
  expiresAtMs: number | null;
  lastRequestedAtMs: number;
  resetTokenExpiresAtMs?: number | null;
  resetTokenHash?: string | null;
  userId: string;
  verifyAttempts: number;
};

const paymentSessions = adminDb.collection('payment_sessions');
const manualPaymentRequests = adminDb.collection('manual_payment_requests');
const passwordResetOtps = adminDb.collection('password_reset_otps');

const PASSWORD_RESET_OTP_LENGTH = 6;
const PASSWORD_RESET_OTP_TTL_MS = 10 * 60 * 1000;
const PASSWORD_RESET_OTP_RESEND_COOLDOWN_MS = 45 * 1000;
const PASSWORD_RESET_MAX_VERIFY_ATTEMPTS = 5;
const PASSWORD_RESET_SESSION_TTL_MS = 15 * 60 * 1000;

const toPlainObject = <T,>(value: T) => JSON.parse(JSON.stringify(value)) as T;

const normalizeEmail = (value: unknown) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const hashValue = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

const getPasswordResetDocId = (email: string) => hashValue(email);

const generateOtp = () =>
  crypto.randomInt(0, 10 ** PASSWORD_RESET_OTP_LENGTH).toString().padStart(PASSWORD_RESET_OTP_LENGTH, '0');

const getPasswordResetEmailHtml = (otp: string) => `
  <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
    <h2 style="margin: 0 0 12px;">MCQOnushilon Password Reset</h2>
    <p style="margin: 0 0 12px;">Use the OTP below to reset your password.</p>
    <div style="margin: 20px 0; font-size: 30px; font-weight: 700; letter-spacing: 8px; color: #2563eb;">
      ${otp}
    </div>
    <p style="margin: 0 0 12px;">This OTP will expire in 10 minutes.</p>
    <p style="margin: 0;">If you did not request a password reset, you can ignore this email.</p>
  </div>
`;

const sendPasswordResetOtpEmail = async (email: string, otp: string) => {
  await sendMail({
    html: getPasswordResetEmailHtml(otp),
    subject: 'Your MCQOnushilon password reset OTP',
    text: `Your MCQOnushilon password reset OTP is ${otp}. It will expire in 10 minutes.`,
    to: email,
  });
};

const getUserByEmailOrNull = async (email: string) => {
  try {
    return await adminAuth.getUserByEmail(email);
  } catch (error: any) {
    if (error?.code === 'auth/user-not-found') {
      return null;
    }

    throw error;
  }
};

const getBearerToken = (request: Request) => {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    throw new Error('Missing Firebase authorization token.');
  }

  return authorization.slice('Bearer '.length).trim();
};

const verifyUser = async (request: Request): Promise<VerifiedUser> => {
  const token = getBearerToken(request);
  const decodedToken = await adminAuth.verifyIdToken(token);

  return {
    uid: decodedToken.uid,
    email: decodedToken.email,
  };
};

const getSubjectUnlockPrice = (subject: Subject) => {
  if (typeof subject.unlockPrice === 'number' && subject.unlockPrice > 0) {
    return subject.unlockPrice;
  }

  const envPrice = Number(process.env.BKASH_DEFAULT_SUBJECT_UNLOCK_PRICE);

  if (!Number.isNaN(envPrice) && envPrice > 0) {
    return envPrice;
  }

  return DEFAULT_SUBJECT_UNLOCK_PRICE;
};

const findPaymentSession = async (input: { sessionId?: string; paymentID?: string }) => {
  if (input.sessionId) {
    const docSnapshot = await paymentSessions.doc(input.sessionId).get();
    if (!docSnapshot.exists) return null;

    return {
      ref: docSnapshot.ref,
      data: docSnapshot.data() as PaymentSessionRecord,
      id: docSnapshot.id,
    };
  }

  if (!input.paymentID) return null;

  const querySnapshot = await paymentSessions.where('bkashPaymentID', '==', input.paymentID).limit(1).get();
  const docSnapshot = querySnapshot.docs[0];

  if (!docSnapshot) {
    return null;
  }

  return {
    ref: docSnapshot.ref,
    data: docSnapshot.data() as PaymentSessionRecord,
    id: docSnapshot.id,
  };
};

const grantSubjectAccess = async (input: {
  sessionId: string;
  session: PaymentSessionRecord;
  paymentID: string;
  trxID?: string;
  transactionStatus?: string;
  executeResponse?: unknown;
  queryResponse?: unknown;
}) => {
  const accessRef = adminDb
    .collection('profiles')
    .doc(input.session.userId)
    .collection('subject_access')
    .doc(input.session.subjectId);

  await accessRef.set(
    {
      subjectId: input.session.subjectId,
      gateway: 'bkash',
      paymentMethod: input.session.paymentMethod || 'gateway',
      status: 'active',
      amount: input.session.amount,
      currency: 'BDT',
      paymentID: input.paymentID,
      trxID: input.trxID || null,
      merchantInvoiceNumber: input.session.merchantInvoiceNumber,
      paymentSessionId: input.sessionId,
      unlockedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  await paymentSessions.doc(input.sessionId).set(
    {
      status: 'completed',
      transactionStatus: input.transactionStatus || 'Completed',
      trxID: input.trxID || null,
      executeResponse: input.executeResponse ? toPlainObject(input.executeResponse) : null,
      queryResponse: input.queryResponse ? toPlainObject(input.queryResponse) : null,
      finalizedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
};

app.post('/api/auth/password-reset/request', async (request: Request, response: Response) => {
  const email = normalizeEmail(request.body?.email);

  if (!email) {
    response.status(400).json({ message: 'Email is required.' });
    return;
  }

  if (!isMailerConfigured()) {
    response.status(503).json({
      message: 'Password reset email is not configured yet. Please contact support.',
    });
    return;
  }

  try {
    const user = await getUserByEmailOrNull(email);

    if (!user) {
      response.json({
        message: 'If an account exists for this email, an OTP has been sent.',
      });
      return;
    }

    const docId = getPasswordResetDocId(email);
    const otpRef = passwordResetOtps.doc(docId);
    const existingSnapshot = await otpRef.get();
    const existingRecord = existingSnapshot.exists ? (existingSnapshot.data() as PasswordResetOtpRecord) : null;
    const now = Date.now();

    if (
      existingRecord &&
      now - existingRecord.lastRequestedAtMs < PASSWORD_RESET_OTP_RESEND_COOLDOWN_MS
    ) {
      response.status(429).json({
        message: 'Please wait a little before requesting another OTP.',
      });
      return;
    }

    const otp = generateOtp();

    await otpRef.set({
      codeHash: hashValue(otp),
      createdAt: FieldValue.serverTimestamp(),
      email,
      expiresAtMs: now + PASSWORD_RESET_OTP_TTL_MS,
      lastRequestedAtMs: now,
      resetTokenExpiresAtMs: null,
      resetTokenHash: null,
      updatedAt: FieldValue.serverTimestamp(),
      userId: user.uid,
      verifyAttempts: 0,
    });

    try {
      await sendPasswordResetOtpEmail(email, otp);
    } catch (error) {
      await otpRef.delete();
      throw error;
    }

    response.json({
      message: 'We sent a 6-digit OTP to your email address.',
    });
  } catch (error) {
    console.error('Password reset OTP request failed:', error);
    response.status(500).json({
      message: error instanceof Error ? error.message : 'Unable to send the OTP right now.',
    });
  }
});

app.post('/api/auth/password-reset/verify', async (request: Request, response: Response) => {
  const email = normalizeEmail(request.body?.email);
  const otp = typeof request.body?.otp === 'string' ? request.body.otp.trim() : '';

  if (!email || !otp) {
    response.status(400).json({ message: 'Email and OTP are required.' });
    return;
  }

  try {
    const docId = getPasswordResetDocId(email);
    const otpRef = passwordResetOtps.doc(docId);
    const otpSnapshot = await otpRef.get();

    if (!otpSnapshot.exists) {
      response.status(404).json({ message: 'No active OTP request found for this email.' });
      return;
    }

    const otpRecord = otpSnapshot.data() as PasswordResetOtpRecord;
    const now = Date.now();

    if (!otpRecord.codeHash || !otpRecord.expiresAtMs) {
      response.status(409).json({ message: 'This OTP has already been used. Please request a new one.' });
      return;
    }

    if (otpRecord.expiresAtMs < now) {
      await otpRef.delete();
      response.status(410).json({ message: 'This OTP has expired. Please request a new one.' });
      return;
    }

    if (otpRecord.verifyAttempts >= PASSWORD_RESET_MAX_VERIFY_ATTEMPTS) {
      await otpRef.delete();
      response.status(429).json({ message: 'Too many incorrect attempts. Please request a new OTP.' });
      return;
    }

    if (hashValue(otp) !== otpRecord.codeHash) {
      await otpRef.set(
        {
          updatedAt: FieldValue.serverTimestamp(),
          verifyAttempts: otpRecord.verifyAttempts + 1,
        },
        { merge: true },
      );

      response.status(400).json({ message: 'The OTP you entered is incorrect.' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    await otpRef.set(
      {
        codeHash: null,
        expiresAtMs: null,
        resetTokenExpiresAtMs: now + PASSWORD_RESET_SESSION_TTL_MS,
        resetTokenHash: hashValue(resetToken),
        updatedAt: FieldValue.serverTimestamp(),
        verifiedAt: FieldValue.serverTimestamp(),
        verifyAttempts: 0,
      },
      { merge: true },
    );

    response.json({
      message: 'OTP verified. You can set a new password now.',
      resetToken,
    });
  } catch (error) {
    console.error('Password reset OTP verification failed:', error);
    response.status(500).json({
      message: error instanceof Error ? error.message : 'Unable to verify the OTP right now.',
    });
  }
});

app.post('/api/auth/password-reset/confirm', async (request: Request, response: Response) => {
  const email = normalizeEmail(request.body?.email);
  const resetToken = typeof request.body?.resetToken === 'string' ? request.body.resetToken.trim() : '';
  const newPassword = typeof request.body?.newPassword === 'string' ? request.body.newPassword : '';

  if (!email || !resetToken || !newPassword) {
    response.status(400).json({ message: 'Email, reset token, and new password are required.' });
    return;
  }

  if (newPassword.length < 6) {
    response.status(400).json({ message: 'Password must be at least 6 characters long.' });
    return;
  }

  try {
    const docId = getPasswordResetDocId(email);
    const otpRef = passwordResetOtps.doc(docId);
    const otpSnapshot = await otpRef.get();

    if (!otpSnapshot.exists) {
      response.status(404).json({ message: 'Your reset session has expired. Please request a new OTP.' });
      return;
    }

    const otpRecord = otpSnapshot.data() as PasswordResetOtpRecord;
    const now = Date.now();

    if (!otpRecord.resetTokenHash || !otpRecord.resetTokenExpiresAtMs || otpRecord.resetTokenExpiresAtMs < now) {
      await otpRef.delete();
      response.status(410).json({ message: 'Your reset session has expired. Please request a new OTP.' });
      return;
    }

    if (hashValue(resetToken) !== otpRecord.resetTokenHash) {
      response.status(400).json({ message: 'Invalid reset session. Please verify the OTP again.' });
      return;
    }

    await adminAuth.updateUser(otpRecord.userId, {
      password: newPassword,
    });
    await adminAuth.revokeRefreshTokens(otpRecord.userId);
    await otpRef.delete();

    response.json({
      message: 'Your password has been updated successfully. Please log in again.',
    });
  } catch (error) {
    console.error('Password reset confirmation failed:', error);
    response.status(500).json({
      message: error instanceof Error ? error.message : 'Unable to update the password right now.',
    });
  }
});

app.get('/api/health', (_request, response) => {
  response.json({ ok: true });
});

app.post('/api/payments/manual-bkash/submit', async (request: Request, response: Response) => {
  try {
    const user = await verifyUser(request);
    const subjectId = typeof request.body?.subjectId === 'string' ? request.body.subjectId.trim() : '';
    const senderBkashNumber =
      typeof request.body?.senderBkashNumber === 'string' ? request.body.senderBkashNumber.trim() : '';
    const transactionId =
      typeof request.body?.transactionId === 'string' ? request.body.transactionId.trim().toUpperCase() : '';

    if (!subjectId || !senderBkashNumber || !transactionId) {
      response.status(400).json({ message: 'Subject, sender number, and transaction ID are required.' });
      return;
    }

    const [subjectSnapshot, paymentSettingsSnapshot, accessSnapshot] = await Promise.all([
      adminDb.collection('subjects').doc(subjectId).get(),
      adminDb.collection('subjects').doc(PAYMENT_SETTINGS_SUBJECT_ID).get(),
      adminDb.collection('profiles').doc(user.uid).collection('subject_access').doc(subjectId).get(),
    ]);

    if (!subjectSnapshot.exists) {
      response.status(404).json({ message: 'Subject not found.' });
      return;
    }

    if (accessSnapshot.exists) {
      response.status(409).json({ message: 'This subject is already unlocked.' });
      return;
    }

    let paymentSettings = paymentSettingsSnapshot.data() as
      | { bkashNumber?: string; bkashAccountName?: string }
      | undefined;

    if (!paymentSettings?.bkashNumber) {
      const legacyPaymentSettingsSnapshot = await adminDb.collection('app_settings').doc('payment').get();
      paymentSettings = legacyPaymentSettingsSnapshot.data() as
        | { bkashNumber?: string; bkashAccountName?: string }
        | undefined;
    }

    if (!paymentSettings?.bkashNumber) {
      response.status(409).json({ message: 'Admin has not configured the bKash number yet.' });
      return;
    }

    const subject = { id: subjectSnapshot.id, ...subjectSnapshot.data() } as Subject;
    const amount = getSubjectUnlockPrice(subject);
    const requestId = crypto.randomUUID();
    const merchantInvoiceNumber = `MANUAL-${subjectId.slice(0, 12)}-${Date.now()}`;

    const requestPayload: ManualPaymentRequestRecord = {
      userId: user.uid,
      subjectId,
      subjectName: subject.nameBn || subject.name,
      gateway: 'bkash',
      paymentMethod: 'manual',
      amount,
      currency: 'BDT',
      senderBkashNumber,
      receiverBkashNumber: paymentSettings.bkashNumber,
      receiverName: paymentSettings.bkashAccountName || '',
      transactionId,
      status: 'submitted',
    };

    await manualPaymentRequests.doc(requestId).set({
      ...requestPayload,
      merchantInvoiceNumber,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    response.json({
      success: true,
      subjectId,
      subjectName: requestPayload.subjectName,
      amount,
      currency: 'BDT',
      transactionId,
      message: 'Payment submitted. Access will unlock after admin approval.',
    });
  } catch (error) {
    console.error('Manual bKash submission failed:', error);

    response.status(500).json({
      message: error instanceof Error ? error.message : 'Unable to submit manual bKash payment.',
    });
  }
});

app.post('/api/payments/bkash/create', async (request: Request, response: Response) => {
  try {
    const user = await verifyUser(request);
    const subjectId = typeof request.body?.subjectId === 'string' ? request.body.subjectId.trim() : '';

    if (!subjectId) {
      response.status(400).json({ message: 'Subject is required.' });
      return;
    }

    const subjectSnapshot = await adminDb.collection('subjects').doc(subjectId).get();
    if (!subjectSnapshot.exists) {
      response.status(404).json({ message: 'Subject not found.' });
      return;
    }

    const subject = { id: subjectSnapshot.id, ...subjectSnapshot.data() } as Subject;
    const accessSnapshot = await adminDb
      .collection('profiles')
      .doc(user.uid)
      .collection('subject_access')
      .doc(subjectId)
      .get();

    if (accessSnapshot.exists) {
      response.status(409).json({ message: 'This subject is already unlocked.' });
      return;
    }

    const sessionId = crypto.randomUUID();
    const amount = getSubjectUnlockPrice(subject);
    const merchantInvoiceNumber = `SUB-${subjectId.slice(0, 12)}-${Date.now()}`;
    const callbackBaseUrl = getBkashCallbackBaseUrl(request.headers.origin);
    const callbackURL = `${callbackBaseUrl}/payments/bkash/callback?sessionId=${encodeURIComponent(sessionId)}`;

    const sessionPayload: PaymentSessionRecord = {
      userId: user.uid,
      subjectId,
      subjectName: subject.nameBn || subject.name,
      gateway: 'bkash',
      paymentMethod: 'gateway',
      amount,
      currency: 'BDT',
      merchantInvoiceNumber,
      status: 'creating',
    };

    await paymentSessions.doc(sessionId).set({
      ...sessionPayload,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    try {
      const createResponse = await createBkashPayment({
        amount,
        callbackURL,
        merchantInvoiceNumber,
        payerReference: user.uid,
      });

      await paymentSessions.doc(sessionId).set(
        {
          status: 'pending',
          bkashPaymentID: createResponse.paymentID,
          bkashURL: createResponse.bKashURL,
          callbackURL,
          createResponse: toPlainObject(createResponse),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      response.json({
        sessionId,
        subjectId,
        subjectName: sessionPayload.subjectName,
        amount,
        currency: 'BDT',
        paymentID: createResponse.paymentID,
        redirectUrl: createResponse.bKashURL,
      });
    } catch (error) {
      await paymentSessions.doc(sessionId).set(
        {
          status: 'failed',
          error:
            error instanceof Error
              ? {
                  name: error.name,
                  message: error.message,
                }
              : { message: 'Unknown error' },
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      throw error;
    }
  } catch (error) {
    console.error('bKash create payment failed:', error);

    const message =
      error instanceof BkashApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Unable to start bKash payment.';

    response.status(500).json({ message });
  }
});

app.post('/api/payments/bkash/finalize', async (request: Request, response: Response) => {
  const sessionId = typeof request.body?.sessionId === 'string' ? request.body.sessionId.trim() : '';
  const paymentID = typeof request.body?.paymentID === 'string' ? request.body.paymentID.trim() : '';
  const callbackStatus =
    request.body?.status === 'success' || request.body?.status === 'failure' || request.body?.status === 'cancel'
      ? request.body.status
      : undefined;

  if (!sessionId && !paymentID) {
    response.status(400).json({ message: 'Missing payment session reference.' });
    return;
  }

  try {
    const paymentSession = await findPaymentSession({ sessionId: sessionId || undefined, paymentID: paymentID || undefined });

    if (!paymentSession) {
      response.status(404).json({ message: 'Payment session not found.' });
      return;
    }

    const resolvedPaymentID = paymentID || paymentSession.data.bkashPaymentID;
    if (!resolvedPaymentID) {
      response.status(400).json({ message: 'Missing bKash payment ID for this session.' });
      return;
    }

    if (callbackStatus === 'cancel' || callbackStatus === 'failure') {
      await paymentSession.ref.set(
        {
          status: callbackStatus === 'cancel' ? 'cancelled' : 'failed',
          callbackStatus,
          updatedAt: FieldValue.serverTimestamp(),
          finalizedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      response.json({
        success: false,
        status: callbackStatus,
        subjectId: paymentSession.data.subjectId,
        subjectName: paymentSession.data.subjectName,
      });
      return;
    }

    const existingAccess = await adminDb
      .collection('profiles')
      .doc(paymentSession.data.userId)
      .collection('subject_access')
      .doc(paymentSession.data.subjectId)
      .get();

    if (existingAccess.exists || paymentSession.data.status === 'completed') {
      response.json({
        success: true,
        status: 'completed',
        subjectId: paymentSession.data.subjectId,
        subjectName: paymentSession.data.subjectName,
        alreadyUnlocked: true,
      });
      return;
    }

    let executeResponse: Awaited<ReturnType<typeof executeBkashPayment>> | null = null;
    let queryResponse: Awaited<ReturnType<typeof queryBkashPayment>> | null = null;

    try {
      executeResponse = await executeBkashPayment(resolvedPaymentID);
    } catch (error) {
      if (error instanceof BkashApiError) {
        queryResponse = await queryBkashPayment(resolvedPaymentID);
      } else {
        throw error;
      }
    }

    const completedResponse =
      executeResponse?.transactionStatus === 'Completed'
        ? executeResponse
        : queryResponse?.transactionStatus === 'Completed'
          ? queryResponse
          : null;

    if (!completedResponse) {
      const transactionStatus =
        executeResponse?.transactionStatus || queryResponse?.transactionStatus || 'Unknown';

      await paymentSession.ref.set(
        {
          status: 'failed',
          callbackStatus: callbackStatus || 'success',
          transactionStatus,
          executeResponse: executeResponse ? toPlainObject(executeResponse) : null,
          queryResponse: queryResponse ? toPlainObject(queryResponse) : null,
          updatedAt: FieldValue.serverTimestamp(),
          finalizedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      response.status(409).json({
        message: `Payment could not be completed. Current transaction status: ${transactionStatus}.`,
        subjectId: paymentSession.data.subjectId,
        subjectName: paymentSession.data.subjectName,
      });
      return;
    }

    await grantSubjectAccess({
      sessionId: paymentSession.id,
      session: paymentSession.data,
      paymentID: resolvedPaymentID,
      trxID: completedResponse.trxID,
      transactionStatus: completedResponse.transactionStatus,
      executeResponse,
      queryResponse,
    });

    await paymentSession.ref.set(
      {
        callbackStatus: callbackStatus || 'success',
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    response.json({
      success: true,
      status: 'completed',
      subjectId: paymentSession.data.subjectId,
      subjectName: paymentSession.data.subjectName,
      paymentID: resolvedPaymentID,
      trxID: completedResponse.trxID,
    });
  } catch (error) {
    console.error('bKash finalize payment failed:', error);

    const message =
      error instanceof BkashApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Unable to finalize bKash payment.';

    response.status(500).json({ message });
  }
});

app.listen(port, () => {
  console.log(`bKash API server listening on http://localhost:${port}`);
});
