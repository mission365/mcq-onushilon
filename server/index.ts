import crypto from 'node:crypto';
import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';

import {
  AuthenticatedRequest,
  comparePassword,
  generateToken,
  hashPassword,
  optionalAuth,
  requireAdmin,
  requireAuth,
} from './auth';
import {
  createBkashPayment,
  executeBkashPayment,
  getBkashCallbackBaseUrl,
  queryBkashPayment,
  BkashApiError,
} from './bkash';
import { initDatabase, pool } from './db';
import { isMailerConfigured, sendMail, sendVerificationEmail } from './mailer';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);

app.use(express.json({ limit: '10mb' }));

// CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// Helper for SHA256
const hashValue = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
const normalizeEmail = (val: unknown) => (typeof val === 'string' ? val.trim().toLowerCase() : '');

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

// Helper to issue and email verification OTP
const issueVerificationOtp = async (email: string, fullName: string) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const codeHash = hashValue(otp);
  const now = Date.now();
  const expiresAt = now + 10 * 60 * 1000; // 10 minutes

  await pool.query(
    `INSERT INTO email_verification_otps (email, code_hash, expires_at_ms, last_requested_at_ms, verify_attempts)
     VALUES ($1, $2, $3, $4, 0)
     ON CONFLICT (email) DO UPDATE
     SET code_hash = $2, expires_at_ms = $3, last_requested_at_ms = $4, verify_attempts = 0`,
    [email, codeHash, expiresAt, now]
  );

  console.log(`🔑 [VERIFICATION OTP GENERATED] For: ${email} | Code: ${otp}`);

  try {
    await sendVerificationEmail({ to: email, fullName, otp });
  } catch (mailErr) {
    console.error('Failed to send verification email:', mailErr);
  }

  return otp;
};

// Register with Email & Password (requires OTP verification)
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const fullName = typeof req.body?.fullName === 'string' ? req.body.fullName.trim() : '';

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Email, password, and full name are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const existing = await pool.query('SELECT id, is_verified FROM users WHERE email = $1', [email]);
    if (existing.rowCount && existing.rowCount > 0) {
      if (!existing.rows[0].is_verified) {
        await issueVerificationOtp(email, fullName);
        return res.status(200).json({
          success: true,
          needsVerification: true,
          email,
          message: 'এই ইমেইলে পূর্বের একটি অপূর্ণ রেজিস্ট্রেশন রয়েছে। আপনার জিমেইলে নতুন ওটিপি (OTP) পাঠানো হয়েছে।',
        });
      }
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await hashPassword(password);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, is_verified)
       VALUES ($1, $2, $3, 'student', FALSE)
       RETURNING id, email, full_name, role, is_verified as "isVerified"`,
      [email, passwordHash, fullName]
    );

    // Send 6-digit OTP to Gmail
    await issueVerificationOtp(email, fullName);

    res.status(201).json({
      success: true,
      needsVerification: true,
      email,
      message: 'আপনার অ্যাকাউন্ট তৈরি হয়েছে। আপনার জিমেইল ইনবক্সে পাঠানো ৬ সংখ্যার ওটিপি (OTP) কোড দিয়ে যাচাই করুন।',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// Login with Email & Password
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const result = await pool.query(
      'SELECT id, email, password_hash, full_name, role, is_verified, curriculum_version, academic_level, stream, is_subscribed, subscription_status FROM users WHERE email = $1',
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const row = result.rows[0];
    if (!row.password_hash) {
      return res.status(401).json({ message: 'Please log in with Google for this account.' });
    }

    const isValid = await comparePassword(password, row.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // If student has not verified their email, block and resend OTP
    if (row.role !== 'admin' && !row.is_verified) {
      await issueVerificationOtp(row.email, row.full_name);
      return res.status(200).json({
        needsVerification: true,
        email: row.email,
        message: 'আপনার জিমেইল ভেরিফাই করা আবশ্যক। একটি নতুন ওটিপি কোড আপনার জিমেইলে পাঠানো হয়েছে।',
      });
    }

    const user = {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      role: row.role as 'student' | 'admin',
      isVerified: true,
      curriculumVersion: row.curriculum_version as 'bangla' | 'english' | null,
      academicLevel: (row.academic_level || 'hsc') as 'hsc' | 'ssc',
      stream: (row.stream || 'science') as 'science' | 'commerce' | 'humanities' | 'common',
      isSubscribed: Boolean(row.is_subscribed) || row.role === 'admin',
      subscriptionStatus: row.subscription_status || 'free',
    };

    const token = generateToken(user);
    res.json({ token, user, message: 'Login successful.' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// Send / Resend Email Verification OTP
app.post(['/api/auth/send-verification-otp', '/api/auth/resend-verification-otp'], async (req: Request, res: Response) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const userRes = await pool.query('SELECT id, full_name, is_verified FROM users WHERE email = $1', [email]);
    if (userRes.rowCount === 0) {
      return res.status(404).json({ message: 'No account found with this email.' });
    }

    if (userRes.rows[0].is_verified) {
      return res.status(400).json({ message: 'This email is already verified. You can log in directly.' });
    }

    // Rate limit check: 45s
    const otpRes = await pool.query('SELECT last_requested_at_ms FROM email_verification_otps WHERE email = $1', [email]);
    const now = Date.now();
    if (otpRes.rowCount && otpRes.rowCount > 0) {
      const lastReq = Number(otpRes.rows[0].last_requested_at_ms);
      if (now - lastReq < 45 * 1000) {
        return res.status(429).json({ message: 'Please wait 45 seconds before requesting another code.' });
      }
    }

    await issueVerificationOtp(email, userRes.rows[0].full_name);
    res.json({ success: true, message: 'একটি নতুন ৬-সংখ্যার ওটিপি কোড পাঠানো হয়েছে।' });
  } catch (error) {
    console.error('Send verification OTP error:', error);
    res.status(500).json({ message: 'Failed to send verification OTP.' });
  }
});

// Verify Email with OTP
app.post(['/api/auth/verify-email', '/api/auth/verify-email-otp'], async (req: Request, res: Response) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const otp = typeof req.body?.otp === 'string' ? req.body.otp.trim() : '';

    if (!email || !otp || otp.length !== 6) {
      return res.status(400).json({ message: 'সঠিক ৬ সংখ্যার ওটিপি (OTP) দিন।' });
    }

    const otpRes = await pool.query('SELECT * FROM email_verification_otps WHERE email = $1', [email]);
    if (otpRes.rowCount === 0) {
      return res.status(400).json({ message: 'কোনো ভেরিফিকেশন ওটিপি পাওয়া যায়নি। নতুন ওটিপি রিকোয়েস্ট করুন।' });
    }

    const row = otpRes.rows[0];
    const now = Date.now();

    if (Number(row.expires_at_ms) < now) {
      await pool.query('DELETE FROM email_verification_otps WHERE email = $1', [email]);
      return res.status(400).json({ message: 'ওটিপি কোডের মেয়াদ শেষ হয়ে গেছে। নতুন কোড রিকোয়েস্ট করুন।' });
    }

    if (Number(row.verify_attempts) >= 5) {
      return res.status(400).json({ message: 'অতিরিক্ত ভুল চেষ্টার কারণে কোডটি বাতিল করা হয়েছে। নতুন কোড রিকোয়েস্ট করুন।' });
    }

    if (hashValue(otp) !== row.code_hash) {
      await pool.query('UPDATE email_verification_otps SET verify_attempts = verify_attempts + 1 WHERE email = $1', [email]);
      return res.status(400).json({ message: 'ভুল ওটিপি কোড। অনুগ্রহ করে সঠিক কোডটি দিন।' });
    }

    // Mark user as verified
    const userUpdate = await pool.query(
      `UPDATE users
       SET is_verified = TRUE, email_verified_at = NOW()
       WHERE email = $1
       RETURNING id, email, full_name, role, is_verified as "isVerified", curriculum_version as "curriculumVersion", academic_level as "academicLevel", stream`,
      [email]
    );

    // Delete used OTP
    await pool.query('DELETE FROM email_verification_otps WHERE email = $1', [email]);

    if (userUpdate.rowCount === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = {
      id: userUpdate.rows[0].id,
      email: userUpdate.rows[0].email,
      fullName: userUpdate.rows[0].full_name,
      role: userUpdate.rows[0].role as 'student' | 'admin',
      isVerified: true,
      curriculumVersion: userUpdate.rows[0].curriculumVersion as 'bangla' | 'english' | null,
      academicLevel: (userUpdate.rows[0].academicLevel || 'hsc') as 'hsc' | 'ssc',
      stream: (userUpdate.rows[0].stream || 'science') as 'science' | 'commerce' | 'humanities' | 'common',
    };

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user,
      message: 'ইমেইল ভেরিফিকেশন সফল হয়েছে।',
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'ইমেইল ভেরিফিকেশনে ত্রুটি হয়েছে।' });
  }
});

// Update Student Curriculum Version (Bangla vs English Version) and Level / Stream
app.put('/api/user/curriculum-version', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const version = typeof req.body?.curriculumVersion === 'string' ? req.body.curriculumVersion.trim().toLowerCase() : '';
    const academicLevel = typeof req.body?.academicLevel === 'string' ? req.body.academicLevel.trim().toLowerCase() : undefined;
    const stream = typeof req.body?.stream === 'string' ? req.body.stream.trim().toLowerCase() : undefined;

    const validVersions = ['bangla', 'english', 'british', 'ib'];
    if (version && !validVersions.includes(version)) {
      return res.status(400).json({ message: 'Version must be one of: bangla, english, british, ib.' });
    }

    // If student already has curriculum set and is not an admin, lock changes permanently
    if (req.user!.role !== 'admin') {
      const existingUser = await pool.query(
        'SELECT curriculum_version FROM users WHERE id = $1',
        [req.user!.id]
      );
      if (existingUser.rows[0]?.curriculum_version) {
        return res.status(403).json({
          message: 'আপনার কারিকুলাম ও পরীক্ষার স্তর একবার নির্ধারণের পর স্থায়ীভাবে সংরক্ষিত। শুধুমাত্র অ্যাডমিন এটি পরিবর্তন করতে পারবেন।',
          locked: true,
        });
      }
    }

    const result = await pool.query(
      `UPDATE users
       SET curriculum_version = COALESCE($1, curriculum_version),
           academic_level = COALESCE($2, academic_level),
           stream = COALESCE($3, stream),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, full_name, role, is_verified as "isVerified", curriculum_version as "curriculumVersion", academic_level as "academicLevel", stream`,
      [version || null, academicLevel || null, stream || null, req.user!.id]
    );

    if (result.rowCount === 0) return res.status(404).json({ message: 'User not found.' });

    const user = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      fullName: result.rows[0].full_name,
      role: result.rows[0].role as 'student' | 'admin',
      isVerified: result.rows[0].isVerified,
      curriculumVersion: result.rows[0].curriculumVersion,
      academicLevel: result.rows[0].academicLevel,
      stream: result.rows[0].stream,
    };

    const token = generateToken(user);
    res.json({
      success: true,
      user,
      token,
      message: version === 'bangla' ? 'বাংলা ভার্সন সফলভাবে সংরক্ষিত হয়েছে।' : 'Curriculum & Stream successfully saved.',
    });
  } catch (error) {
    console.error('Curriculum version update error:', error);
    res.status(500).json({ message: 'Failed to update curriculum version.' });
  }
});

// Google OAuth sync (Google users are pre-verified)
app.post('/api/auth/google', async (req: Request, res: Response) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const fullName = typeof req.body?.fullName === 'string' ? req.body.fullName.trim() : 'Google User';
    const googleId = typeof req.body?.googleId === 'string' ? req.body.googleId : null;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    // Check if user exists
    let result = await pool.query(
      'SELECT id, email, full_name, role, is_verified, curriculum_version FROM users WHERE email = $1',
      [email]
    );

    let user;
    if (result.rowCount && result.rowCount > 0) {
      const row = result.rows[0];
      user = {
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        role: row.role as 'student' | 'admin',
        isVerified: true,
        curriculumVersion: row.curriculum_version as 'bangla' | 'english' | null,
      };
      await pool.query('UPDATE users SET google_id = COALESCE($1, google_id), is_verified = TRUE WHERE id = $2', [googleId, user.id]);
    } else {
      // Create new student
      const insertResult = await pool.query(
        `INSERT INTO users (email, full_name, google_id, role, is_verified, email_verified_at)
         VALUES ($1, $2, $3, 'student', TRUE, NOW())
         RETURNING id, email, full_name, role, is_verified as "isVerified", curriculum_version as "curriculumVersion"`,
        [email, fullName, googleId]
      );
      const row = insertResult.rows[0];
      user = {
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        role: row.role as 'student' | 'admin',
        isVerified: true,
        curriculumVersion: row.curriculumVersion as 'bangla' | 'english' | null,
        academicLevel: (row.academic_level || 'hsc') as 'hsc' | 'ssc',
        stream: (row.stream || 'science') as 'science' | 'commerce' | 'humanities' | 'common',
      };
    }

    const token = generateToken(user);
    res.json({ token, user });
  } catch (error) {
    console.error('Google auth sync error:', error);
    res.status(500).json({ message: 'Google authentication sync failed.' });
  }
});

// Current User Profile
app.get('/api/auth/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role, is_verified, curriculum_version, academic_level, stream, is_subscribed, subscription_status, created_at FROM users WHERE id = $1',
      [req.user!.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const row = result.rows[0];
    res.json({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      role: row.role,
      isVerified: row.is_verified,
      curriculumVersion: row.curriculum_version,
      academicLevel: row.academic_level || 'hsc',
      stream: row.stream || 'science',
      isSubscribed: Boolean(row.is_subscribed) || row.role === 'admin',
      subscriptionStatus: row.subscription_status || 'free',
      createdAt: row.created_at,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user profile.' });
  }
});

// ==========================================
// 2. PASSWORD RESET VIA OTP
// ==========================================
app.post('/api/auth/password-reset/request', async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body?.email);
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  if (!isMailerConfigured()) {
    return res.status(503).json({ message: 'Password reset email is not configured yet. Please contact support.' });
  }

  try {
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userRes.rowCount === 0) {
      return res.json({ message: 'If an account exists for this email, an OTP has been sent.' });
    }

    const existingOtpRes = await pool.query('SELECT last_requested_at_ms FROM password_reset_otps WHERE email = $1', [email]);
    const now = Date.now();
    if (existingOtpRes.rowCount && existingOtpRes.rowCount > 0) {
      const lastReq = Number(existingOtpRes.rows[0].last_requested_at_ms);
      if (now - lastReq < 45 * 1000) {
        return res.status(429).json({ message: 'Please wait 45 seconds before requesting another OTP.' });
      }
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const codeHash = hashValue(otp);
    const expiresAt = now + 10 * 60 * 1000;

    await pool.query(
      `INSERT INTO password_reset_otps (email, code_hash, expires_at_ms, last_requested_at_ms, verify_attempts)
       VALUES ($1, $2, $3, $4, 0)
       ON CONFLICT (email) DO UPDATE
       SET code_hash = $2, expires_at_ms = $3, last_requested_at_ms = $4, reset_token_hash = NULL, reset_token_expires_at_ms = NULL, verify_attempts = 0`,
      [email, codeHash, expiresAt, now]
    );

    await sendMail({
      to: email,
      subject: 'MCQOnushilon Password Reset OTP',
      text: `Your password reset OTP is ${otp}. It will expire in 10 minutes.`,
      html: `<p>Your password reset OTP is: <b style="font-size: 24px; color: #2563eb;">${otp}</b></p>`,
    });

    res.json({ message: 'We sent a 6-digit OTP to your email address.' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Unable to send OTP at this time.' });
  }
});

app.post('/api/auth/password-reset/verify', async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body?.email);
  const otp = typeof req.body?.otp === 'string' ? req.body.otp.trim() : '';
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

  try {
    const result = await pool.query('SELECT * FROM password_reset_otps WHERE email = $1', [email]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'No active OTP request found for this email.' });
    }

    const row = result.rows[0];
    const now = Date.now();

    if (!row.code_hash || Number(row.expires_at_ms) < now) {
      await pool.query('DELETE FROM password_reset_otps WHERE email = $1', [email]);
      return res.status(410).json({ message: 'This OTP has expired. Please request a new one.' });
    }

    if (row.verify_attempts >= 5) {
      await pool.query('DELETE FROM password_reset_otps WHERE email = $1', [email]);
      return res.status(429).json({ message: 'Too many incorrect attempts. Please request a new OTP.' });
    }

    if (hashValue(otp) !== row.code_hash) {
      await pool.query('UPDATE password_reset_otps SET verify_attempts = verify_attempts + 1 WHERE email = $1', [email]);
      return res.status(400).json({ message: 'The OTP you entered is incorrect.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = hashValue(resetToken);
    const resetExpiresAt = now + 15 * 60 * 1000;

    await pool.query(
      `UPDATE password_reset_otps
       SET code_hash = NULL, expires_at_ms = NULL, reset_token_hash = $1, reset_token_expires_at_ms = $2, verify_attempts = 0
       WHERE email = $3`,
      [resetTokenHash, resetExpiresAt, email]
    );

    res.json({ message: 'OTP verified. You can set a new password now.', resetToken });
  } catch (error) {
    res.status(500).json({ message: 'OTP verification failed.' });
  }
});

app.post('/api/auth/password-reset/confirm', async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body?.email);
  const resetToken = typeof req.body?.resetToken === 'string' ? req.body.resetToken.trim() : '';
  const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';

  if (!email || !resetToken || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Email, reset token, and new password (min 6 chars) are required.' });
  }

  try {
    const result = await pool.query('SELECT * FROM password_reset_otps WHERE email = $1', [email]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Your reset session has expired.' });
    }

    const row = result.rows[0];
    const now = Date.now();

    if (!row.reset_token_hash || Number(row.reset_token_expires_at_ms) < now || hashValue(resetToken) !== row.reset_token_hash) {
      await pool.query('DELETE FROM password_reset_otps WHERE email = $1', [email]);
      return res.status(400).json({ message: 'Invalid or expired reset session. Please request a new OTP.' });
    }

    const passwordHash = await hashPassword(newPassword);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2', [passwordHash, email]);
    await pool.query('DELETE FROM password_reset_otps WHERE email = $1', [email]);

    res.json({ message: 'Password updated successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to update password.' });
  }
});

// ==========================================
// 3. SUBJECTS ROUTES
// ==========================================

// Get all active subjects (or all if admin) with optional curriculum version, academic level, and stream filtering
app.get('/api/subjects', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isAdminUser = req.user?.role === 'admin';
    const version = typeof req.query?.version === 'string' ? req.query.version.trim().toLowerCase() : '';
    const level = typeof req.query?.level === 'string' ? req.query.level.trim().toLowerCase() : '';
    const stream = typeof req.query?.stream === 'string' ? req.query.stream.trim().toLowerCase() : '';

    let queryText = `
      SELECT s.id, s.name, s.name_bn as "nameBn", s.icon, s.is_active as "isActive",
             s.unlock_price as "unlockPrice", s.curriculum_version as "curriculumVersion",
             s.academic_level as "academicLevel", s.stream, s.created_at as "createdAt",
             COUNT(DISTINCT c.id)::int as "chapterCount",
             COUNT(DISTINCT e.id)::int as "examCount"
      FROM subjects s
      LEFT JOIN chapters c ON s.id = c.subject_id
      LEFT JOIN exams e ON s.id = e.subject_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (!isAdminUser) {
      queryText += ' AND s.is_active = TRUE';
    }

    if (version) {
      if (version === 'bangla') {
        queryText += " AND (s.curriculum_version = 'bangla' OR s.curriculum_version IS NULL)";
      } else {
        params.push(version);
        queryText += ` AND s.curriculum_version = $${params.length}`;
      }
    }

    if (level) {
      params.push(level);
      queryText += ` AND (s.academic_level = $${params.length} OR s.academic_level IS NULL)`;
    }

    const includeCommon = req.query?.include_common === 'true';
    if (stream && ['science', 'commerce', 'humanities', 'common', 'optional'].includes(stream)) {
      params.push(stream);
      if (includeCommon && stream !== 'common') {
        queryText += ` AND (s.stream = $${params.length} OR s.stream LIKE '%' || $${params.length} || '%' OR s.stream = 'common')`;
      } else {
        queryText += ` AND (s.stream = $${params.length} OR s.stream LIKE '%' || $${params.length} || '%')`;
      }
    }

    queryText += ' GROUP BY s.id ORDER BY s.curriculum_version ASC, s.academic_level ASC, s.stream ASC, s.name ASC';

    const result = await pool.query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to load subjects:', error);
    res.status(500).json({ message: 'Failed to load subjects.' });
  }
});

// Get single subject by ID
app.get('/api/subjects/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, name_bn as "nameBn", icon, is_active as "isActive",
              unlock_price as "unlockPrice", curriculum_version as "curriculumVersion",
              academic_level as "academicLevel", stream, created_at as "createdAt"
       FROM subjects WHERE id = $1`,
      [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Subject not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load subject.' });
  }
});

// Admin: Create Subject
app.post('/api/subjects', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, nameBn, icon, isActive, unlockPrice, curriculumVersion, academicLevel, stream } = req.body;
    if (!name || !nameBn) return res.status(400).json({ message: 'Both English and Bangla names are required.' });

    const result = await pool.query(
      `INSERT INTO subjects (name, name_bn, icon, is_active, unlock_price, curriculum_version, academic_level, stream)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, name_bn as "nameBn", icon, is_active as "isActive", unlock_price as "unlockPrice", curriculum_version as "curriculumVersion", academic_level as "academicLevel", stream`,
      [
        name.trim(),
        nameBn.trim(),
        icon || null,
        isActive !== false,
        Number(unlockPrice) || 299,
        curriculumVersion || 'bangla',
        academicLevel || 'hsc',
        stream || 'common',
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create subject.' });
  }
});

// Admin: Update Subject
app.put('/api/subjects/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, nameBn, icon, isActive, unlockPrice, curriculumVersion, academicLevel, stream } = req.body;
    const result = await pool.query(
      `UPDATE subjects
       SET name = COALESCE($1, name),
           name_bn = COALESCE($2, name_bn),
           icon = COALESCE($3, icon),
           is_active = COALESCE($4, is_active),
           unlock_price = COALESCE($5, unlock_price),
           curriculum_version = COALESCE($6, curriculum_version),
           academic_level = COALESCE($7, academic_level),
           stream = COALESCE($8, stream),
           updated_at = NOW()
       WHERE id = $9
       RETURNING id, name, name_bn as "nameBn", icon, is_active as "isActive", unlock_price as "unlockPrice", curriculum_version as "curriculumVersion", academic_level as "academicLevel", stream`,
      [
        name?.trim(),
        nameBn?.trim(),
        icon,
        isActive,
        unlockPrice !== undefined ? Number(unlockPrice) : undefined,
        curriculumVersion,
        academicLevel,
        stream,
        req.params.id,
      ]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Subject not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update subject.' });
  }
});

// Admin: Delete Subject
app.delete('/api/subjects/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM subjects WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Subject not found.' });
    res.json({ success: true, message: 'Subject deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete subject.' });
  }
});

// ==========================================
// 4. PAYMENT SETTINGS ROUTES
// ==========================================
app.get('/api/payment-settings', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id,
              bkash_number as "bkashNumber",
              bkash_account_name as "bkashAccountName",
              nagad_number as "nagadNumber",
              nagad_account_name as "nagadAccountName",
              price_bangla as "priceBangla",
              price_english as "priceEnglish",
              price_british as "priceBritish",
              price_ib as "priceIb",
              original_price_bangla as "originalPriceBangla",
              original_price_english as "originalPriceEnglish",
              original_price_british as "originalPriceBritish",
              original_price_ib as "originalPriceIb",
              discount_title as "discountTitle",
              discount_expires_at as "discountExpiresAt",
              discount_active as "discountActive",
              payment_instructions as "paymentInstructions"
       FROM payment_settings WHERE id = $1`,
      ['default']
    );
    if (result.rowCount === 0) {
      return res.json({
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
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load payment settings.' });
  }
});

app.put('/api/payment-settings', requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      bkashNumber,
      bkashAccountName,
      nagadNumber,
      nagadAccountName,
      priceBangla,
      priceEnglish,
      priceBritish,
      priceIb,
      originalPriceBangla,
      originalPriceEnglish,
      originalPriceBritish,
      originalPriceIb,
      discountTitle,
      discountExpiresAt,
      discountActive,
      paymentInstructions,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO payment_settings
         (id, bkash_number, bkash_account_name, nagad_number, nagad_account_name,
          price_bangla, price_english, price_british, price_ib,
          original_price_bangla, original_price_english, original_price_british, original_price_ib,
          discount_title, discount_expires_at, discount_active,
          payment_instructions, updated_at)
       VALUES ('default', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
       ON CONFLICT (id) DO UPDATE
       SET bkash_number = $1,
           bkash_account_name = $2,
           nagad_number = $3,
           nagad_account_name = $4,
           price_bangla = $5,
           price_english = $6,
           price_british = $7,
           price_ib = $8,
           original_price_bangla = $9,
           original_price_english = $10,
           original_price_british = $11,
           original_price_ib = $12,
           discount_title = $13,
           discount_expires_at = $14,
           discount_active = $15,
           payment_instructions = $16,
           updated_at = NOW()
       RETURNING id,
                 bkash_number as "bkashNumber",
                 bkash_account_name as "bkashAccountName",
                 nagad_number as "nagadNumber",
                 nagad_account_name as "nagadAccountName",
                 price_bangla as "priceBangla",
                 price_english as "priceEnglish",
                 price_british as "priceBritish",
                 price_ib as "priceIb",
                 original_price_bangla as "originalPriceBangla",
                 original_price_english as "originalPriceEnglish",
                 original_price_british as "originalPriceBritish",
                 original_price_ib as "originalPriceIb",
                 discount_title as "discountTitle",
                 discount_expires_at as "discountExpiresAt",
                 discount_active as "discountActive",
                 payment_instructions as "paymentInstructions"`,
      [
        bkashNumber?.trim() || '01700000000',
        bkashAccountName?.trim() || 'MCQ Onushilon (Personal)',
        nagadNumber?.trim() || '01800000000',
        nagadAccountName?.trim() || 'MCQ Onushilon (Personal)',
        Number(priceBangla) || 499,
        Number(priceEnglish) || 699,
        Number(priceBritish) || 1200,
        Number(priceIb) || 1500,
        Number(originalPriceBangla) || 999,
        Number(originalPriceEnglish) || 1299,
        Number(originalPriceBritish) || 2000,
        Number(originalPriceIb) || 2500,
        discountTitle?.trim() || 'সীমিত সময়ের মেগা অফার!',
        discountExpiresAt ? new Date(discountExpiresAt) : null,
        discountActive !== undefined ? Boolean(discountActive) : true,
        paymentInstructions?.trim() || '',
      ]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving payment settings:', error);
    res.status(500).json({ message: 'Failed to save payment settings.' });
  }
});

// ==========================================
// 5. EXAMS ROUTES
// ==========================================

// Get chapters for a subject with exam count
app.get('/api/subjects/:subjectId/chapters', async (req: Request, res: Response) => {
  try {
    const { subjectId } = req.params;
    const result = await pool.query(
      `SELECT c.id, c.subject_id as "subjectId", c.chapter_number as "chapterNumber",
              c.title, c.title_bn as "titleBn", c.description, c.serial_number as "serialNumber",
              COUNT(e.id)::int as "examCount"
       FROM chapters c
       LEFT JOIN exams e ON e.chapter_id = c.id AND e.is_published = TRUE
       WHERE c.subject_id = $1
       GROUP BY c.id
       ORDER BY c.chapter_number ASC, c.serial_number ASC`,
      [subjectId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch chapters error:', error);
    res.status(500).json({ message: 'Failed to fetch chapters.' });
  }
});

// Admin: Create chapter for a subject
app.post('/api/subjects/:subjectId/chapters', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { subjectId } = req.params;
    const { title, titleBn, chapterNumber, description, serialNumber } = req.body;
    if (!title && !titleBn) {
      return res.status(400).json({ message: 'Chapter title is required.' });
    }

    const result = await pool.query(
      `INSERT INTO chapters (subject_id, chapter_number, title, title_bn, description, serial_number)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, subject_id as "subjectId", chapter_number as "chapterNumber",
                 title, title_bn as "titleBn", description, serial_number as "serialNumber"`,
      [
        subjectId,
        Number(chapterNumber) || 1,
        title?.trim() || titleBn?.trim(),
        titleBn?.trim() || title?.trim(),
        description?.trim() || '',
        Number(serialNumber) || Number(chapterNumber) || 1,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create chapter error:', error);
    res.status(500).json({ message: 'Failed to create chapter.' });
  }
});

// Admin: Update chapter
app.put('/api/chapters/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, titleBn, chapterNumber, description, serialNumber } = req.body;

    const result = await pool.query(
      `UPDATE chapters
       SET title = COALESCE($1, title),
           title_bn = COALESCE($2, title_bn),
           chapter_number = COALESCE($3, chapter_number),
           description = COALESCE($4, description),
           serial_number = COALESCE($5, serial_number),
           updated_at = NOW()
       WHERE id = $6
       RETURNING id, subject_id as "subjectId", chapter_number as "chapterNumber",
                 title, title_bn as "titleBn", description, serial_number as "serialNumber"`,
      [
        title?.trim(),
        titleBn?.trim(),
        chapterNumber !== undefined ? Number(chapterNumber) : undefined,
        description,
        serialNumber !== undefined ? Number(serialNumber) : undefined,
        id,
      ]
    );

    if (result.rowCount === 0) return res.status(404).json({ message: 'Chapter not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update chapter error:', error);
    res.status(500).json({ message: 'Failed to update chapter.' });
  }
});

// Admin: Delete chapter
app.delete('/api/chapters/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM chapters WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Chapter not found.' });
    res.json({ success: true, message: 'Chapter deleted successfully.' });
  } catch (error) {
    console.error('Delete chapter error:', error);
    res.status(500).json({ message: 'Failed to delete chapter.' });
  }
});

// Get exams (optionally filtered by subjectId, chapterId, academicLevel, examType)
app.get('/api/exams', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { subjectId, chapterId, academicLevel, examType, stream } = req.query;
    const version = (req.query.version || req.query.curriculumVersion) as string | undefined;
    const isAdminUser = req.user?.role === 'admin';

    let queryText = `
      SELECT e.id, e.subject_id as "subjectId", e.chapter_id as "chapterId", e.title, e.serial_number as "serialNumber",
             e.duration_minutes as "durationMinutes", e.total_marks as "totalMarks",
             e.negative_mark as "negativeMark", e.instructions, e.is_published as "isPublished",
             e.curriculum_version as "curriculumVersion", e.academic_level as "academicLevel",
             e.exam_type as "examType", e.board_name as "boardName", e.exam_year as "examYear",
             e.created_at as "createdAt",
             s.name_bn as "subjectNameBn", s.name as "subjectName", s.stream as "subjectStream",
             c.title as "chapterTitle", c.title_bn as "chapterTitleBn", c.chapter_number as "chapterNumber"
      FROM exams e
      JOIN subjects s ON e.subject_id = s.id
      LEFT JOIN chapters c ON e.chapter_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (subjectId) {
      params.push(subjectId);
      queryText += ` AND e.subject_id = $${params.length}`;
    }

    if (chapterId) {
      params.push(chapterId);
      queryText += ` AND e.chapter_id = $${params.length}`;
    }

    if (academicLevel) {
      params.push(academicLevel);
      queryText += ` AND e.academic_level = $${params.length}`;
    }

    if (examType) {
      params.push(examType);
      queryText += ` AND e.exam_type = $${params.length}`;
    }

    if (stream && stream !== 'all') {
      params.push(stream);
      queryText += ` AND s.stream = $${params.length}`;
    }

    if (version === 'bangla') {
      queryText += ` AND (e.curriculum_version = 'bangla' OR e.curriculum_version IS NULL)`;
    } else if (version === 'english') {
      queryText += ` AND e.curriculum_version = 'english'`;
    } else if (version === 'british') {
      queryText += ` AND e.curriculum_version = 'british'`;
    } else if (version === 'ib') {
      queryText += ` AND e.curriculum_version = 'ib'`;
    }

    if (!isAdminUser) {
      queryText += ` AND e.is_published = TRUE`;
    }

    queryText += ` ORDER BY e.serial_number ASC, e.created_at ASC`;

    const result = await pool.query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to load exams:', error);
    res.status(500).json({ message: 'Failed to load exams.' });
  }
});

app.get('/api/exams/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT e.id, e.subject_id as "subjectId", e.chapter_id as "chapterId", e.title, e.serial_number as "serialNumber",
              e.duration_minutes as "durationMinutes", e.total_marks as "totalMarks",
              e.negative_mark as "negativeMark", e.instructions, e.is_published as "isPublished",
              e.curriculum_version as "curriculumVersion", e.academic_level as "academicLevel",
              e.exam_type as "examType", e.board_name as "boardName", e.exam_year as "examYear",
              e.created_at as "createdAt",
              s.name_bn as "subjectNameBn", s.name as "subjectName"
       FROM exams e
       JOIN subjects s ON e.subject_id = s.id
       WHERE e.id = $1`,
      [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Exam not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load exam.' });
  }
});

app.post('/api/exams', requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      subjectId,
      title,
      serialNumber,
      durationMinutes,
      totalMarks,
      negativeMark,
      instructions,
      isPublished,
      examType,
      boardName,
      examYear,
      chapterId,
      curriculumVersion,
      academicLevel,
    } = req.body;
    if (!subjectId || !title) return res.status(400).json({ message: 'Subject and title are required.' });

    let finalCurriculum = curriculumVersion;
    let finalLevel = academicLevel;
    if (!finalCurriculum || !finalLevel) {
      const subRes = await pool.query('SELECT curriculum_version, academic_level FROM subjects WHERE id = $1', [subjectId]);
      if (subRes.rowCount && subRes.rowCount > 0) {
        finalCurriculum = finalCurriculum || subRes.rows[0].curriculum_version || 'bangla';
        finalLevel = finalLevel || subRes.rows[0].academic_level || 'hsc';
      }
    }

    const result = await pool.query(
      `INSERT INTO exams (
         subject_id, title, serial_number, duration_minutes, total_marks, negative_mark,
         instructions, is_published, exam_type, board_name, exam_year, chapter_id,
         curriculum_version, academic_level
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id, subject_id as "subjectId", title, serial_number as "serialNumber",
                 duration_minutes as "durationMinutes", total_marks as "totalMarks",
                 negative_mark as "negativeMark", instructions, is_published as "isPublished",
                 exam_type as "examType", board_name as "boardName", exam_year as "examYear",
                 chapter_id as "chapterId", curriculum_version as "curriculumVersion",
                 academic_level as "academicLevel"`,
      [
        subjectId,
        title.trim(),
        Number(serialNumber) || 1,
        Number(durationMinutes) || 30,
        Number(totalMarks) || 25,
        Number(negativeMark) !== undefined ? Number(negativeMark) : 0.25,
        instructions || '',
        Boolean(isPublished),
        examType || 'model_test',
        boardName ? String(boardName).trim() : null,
        examYear ? Number(examYear) : null,
        chapterId || null,
        finalCurriculum || 'bangla',
        finalLevel || 'hsc',
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ message: 'Failed to create exam.' });
  }
});

app.put('/api/exams/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      subjectId,
      title,
      serialNumber,
      durationMinutes,
      totalMarks,
      negativeMark,
      instructions,
      isPublished,
      examType,
      boardName,
      examYear,
      chapterId,
      curriculumVersion,
      academicLevel,
    } = req.body;

    const result = await pool.query(
      `UPDATE exams
       SET subject_id = COALESCE($1, subject_id),
           title = COALESCE($2, title),
           serial_number = COALESCE($3, serial_number),
           duration_minutes = COALESCE($4, duration_minutes),
           total_marks = COALESCE($5, total_marks),
           negative_mark = COALESCE($6, negative_mark),
           instructions = COALESCE($7, instructions),
           is_published = COALESCE($8, is_published),
           exam_type = COALESCE($9, exam_type),
           board_name = CASE WHEN $10::text IS NOT NULL THEN $10 ELSE board_name END,
           exam_year = CASE WHEN $11::int IS NOT NULL THEN $11 ELSE exam_year END,
           chapter_id = CASE WHEN $12::uuid IS NOT NULL THEN $12 ELSE chapter_id END,
           curriculum_version = COALESCE($13, curriculum_version),
           academic_level = COALESCE($14, academic_level),
           updated_at = NOW()
       WHERE id = $15
       RETURNING id, subject_id as "subjectId", title, serial_number as "serialNumber",
                 duration_minutes as "durationMinutes", total_marks as "totalMarks",
                 negative_mark as "negativeMark", instructions, is_published as "isPublished",
                 exam_type as "examType", board_name as "boardName", exam_year as "examYear",
                 chapter_id as "chapterId", curriculum_version as "curriculumVersion",
                 academic_level as "academicLevel"`,
      [
        subjectId,
        title?.trim(),
        serialNumber !== undefined ? Number(serialNumber) : undefined,
        durationMinutes !== undefined ? Number(durationMinutes) : undefined,
        totalMarks !== undefined ? Number(totalMarks) : undefined,
        negativeMark !== undefined ? Number(negativeMark) : undefined,
        instructions,
        isPublished,
        examType,
        boardName ? String(boardName).trim() : null,
        examYear ? Number(examYear) : null,
        chapterId || null,
        curriculumVersion,
        academicLevel,
        req.params.id,
      ]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Exam not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update exam error:', error);
    res.status(500).json({ message: 'Failed to update exam.' });
  }
});

app.delete('/api/exams/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM exams WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Exam not found.' });
    res.json({ success: true, message: 'Exam deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete exam.' });
  }
});

// ==========================================
// 6. QUESTIONS ROUTES
// ==========================================

// Get questions for an exam (checks total 3 free tests limit & active subscription)
app.get('/api/exams/:examId/questions', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { examId } = req.params;
    const examRes = await pool.query('SELECT * FROM exams WHERE id = $1', [examId]);
    if (examRes.rowCount === 0) return res.status(404).json({ message: 'Exam not found.' });

    const exam = examRes.rows[0];
    const isAdminUser = req.user?.role === 'admin';

    let hasAccess = Boolean(isAdminUser);

    if (!hasAccess && req.user) {
      // 1. Check if user has active approved subscription
      const uRes = await pool.query('SELECT is_subscribed FROM users WHERE id = $1', [req.user.id]);
      if (uRes.rows[0]?.is_subscribed) {
        hasAccess = true;
      } else {
        // 2. Check if student already attempted this exam previously (retaking/reviewing does not consume extra slot)
        const existingAttempt = await pool.query(
          'SELECT id FROM attempts WHERE student_id = $1 AND exam_id = $2 LIMIT 1',
          [req.user.id, examId]
        );
        if (existingAttempt.rowCount && existingAttempt.rowCount > 0) {
          hasAccess = true;
        } else {
          // 3. Count distinct exams attempted across all subjects and board questions
          const attemptsCountRes = await pool.query(
            'SELECT COUNT(DISTINCT exam_id) as count FROM attempts WHERE student_id = $1',
            [req.user.id]
          );
          const distinctCount = parseInt(attemptsCountRes.rows[0]?.count || '0', 10);
          if (distinctCount < 3) {
            hasAccess = true;
          }
        }
      }
    }

    if (!hasAccess) {
      return res.status(403).json({
        message: 'আপনি আপনার ৩টি ফ্রি টেস্টের সুযোগ ব্যবহার করে ফেলেছেন। পরবর্তী সকল মডেল টেস্ট ও বোর্ড প্রশ্ন আনলক করতে সাবস্ক্রিপশন গ্রহণ করুন।',
        requiresSubscription: true,
        isLocked: true,
        freeLimit: 3,
      });
    }

    const questionsRes = await pool.query(
      `SELECT id, exam_id as "examId", stimulus, question_text as "questionText",
              option_a as "optionA", option_b as "optionB", option_c as "optionC", option_d as "optionD",
              correct_option as "correctOption", explanation, serial_number as "serialNumber",
              created_at as "createdAt"
       FROM questions
       WHERE exam_id = $1
       ORDER BY serial_number ASC`,
      [examId]
    );

    res.json(questionsRes.rows);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Failed to load questions.' });
  }
});

// Admin: Add Single Question
app.post('/api/exams/:examId/questions', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const { stimulus, questionText, optionA, optionB, optionC, optionD, correctOption, explanation, serialNumber } = req.body;

    if (!questionText || !optionA || !optionB || !correctOption) {
      return res.status(400).json({ message: 'Question text, option A, option B, and correct option are required.' });
    }

    const result = await pool.query(
      `INSERT INTO questions (exam_id, stimulus, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, serial_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, exam_id as "examId", stimulus, question_text as "questionText",
                 option_a as "optionA", option_b as "optionB", option_c as "optionC", option_d as "optionD",
                 correct_option as "correctOption", explanation, serial_number as "serialNumber"`,
      [
        examId,
        stimulus?.trim() || null,
        questionText.trim(),
        optionA.trim(),
        optionB.trim(),
        optionC?.trim() || '',
        optionD?.trim() || '',
        correctOption.toLowerCase(),
        explanation?.trim() || '',
        Number(serialNumber) || 1,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create question.' });
  }
});

// Admin: Bulk JSON Import Questions
app.post('/api/exams/:examId/questions/bulk', requireAdmin, async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { examId } = req.params;
    const questions = req.body?.questions;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Questions must be a non-empty array.' });
    }

    await client.query('BEGIN');
    let insertedCount = 0;

    for (const q of questions) {
      const qText = q.questionText || q.question_text || q.text;
      const optA = q.optionA || q.option_a || q.a;
      const optB = q.optionB || q.option_b || q.b;
      const optC = q.optionC || q.option_c || q.c || '';
      const optD = q.optionD || q.option_d || q.d || '';
      const stimulus = q.stimulus || q.uddipok || q['উদ্দীপক'] || '';
      const explanation = q.explanation || q.explain || '';
      const rawCorrect = String(q.correctOption || q.correct_option || q.answer || 'a').toLowerCase();
      const correctOption = ['a', 'b', 'c', 'd'].includes(rawCorrect) ? rawCorrect : 'a';
      const serialNumber = Number(q.serialNumber || q.serial_number || q.sn) || (insertedCount + 1);

      if (!qText || !optA || !optB) continue;

      await client.query(
        `INSERT INTO questions (exam_id, stimulus, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, serial_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [examId, stimulus || null, String(qText).trim(), String(optA).trim(), String(optB).trim(), String(optC).trim(), String(optD).trim(), correctOption, String(explanation).trim(), serialNumber]
      );
      insertedCount++;
    }

    await client.query('COMMIT');
    res.json({ success: true, count: insertedCount, message: `Successfully imported ${insertedCount} questions.` });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Bulk questions import error:', error);
    res.status(500).json({ message: 'Failed to import questions.' });
  } finally {
    client.release();
  }
});

// Admin: Update Question
app.put('/api/questions/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { stimulus, questionText, optionA, optionB, optionC, optionD, correctOption, explanation, serialNumber } = req.body;
    const result = await pool.query(
      `UPDATE questions
       SET stimulus = COALESCE($1, stimulus),
           question_text = COALESCE($2, question_text),
           option_a = COALESCE($3, option_a),
           option_b = COALESCE($4, option_b),
           option_c = COALESCE($5, option_c),
           option_d = COALESCE($6, option_d),
           correct_option = COALESCE($7, correct_option),
           explanation = COALESCE($8, explanation),
           serial_number = COALESCE($9, serial_number),
           updated_at = NOW()
       WHERE id = $10
       RETURNING id, exam_id as "examId", stimulus, question_text as "questionText",
                 option_a as "optionA", option_b as "optionB", option_c as "optionC", option_d as "optionD",
                 correct_option as "correctOption", explanation, serial_number as "serialNumber"`,
      [
        stimulus,
        questionText?.trim(),
        optionA?.trim(),
        optionB?.trim(),
        optionC?.trim(),
        optionD?.trim(),
        correctOption?.toLowerCase(),
        explanation?.trim(),
        serialNumber !== undefined ? Number(serialNumber) : undefined,
        req.params.id,
      ]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Question not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update question.' });
  }
});

// Admin: Delete Question
app.delete('/api/questions/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM questions WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Question not found.' });
    res.json({ success: true, message: 'Question deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete question.' });
  }
});

// ==========================================
// 7. EXAM ATTEMPTS & RESULTS
// ==========================================

// Submit an Exam
app.post('/api/exams/:examId/submit', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { examId } = req.params;
    const answers: Record<string, string | null> = req.body?.answers || {};
    const studentId = req.user!.id;

    const examRes = await client.query('SELECT id, negative_mark, total_marks FROM exams WHERE id = $1', [examId]);
    if (examRes.rowCount === 0) return res.status(404).json({ message: 'Exam not found.' });

    const exam = examRes.rows[0];
    const negativeMark = Number(exam.negative_mark) || 0.25;

    const questionsRes = await client.query('SELECT id, correct_option FROM questions WHERE exam_id = $1', [examId]);
    const questions = questionsRes.rows;

    let correct = 0;
    let wrong = 0;
    let attempted = 0;

    await client.query('BEGIN');

    // Create attempt
    const attemptInsert = await client.query(
      `INSERT INTO attempts (student_id, exam_id, score, total_attempted, correct_count, wrong_count, status, started_at, submitted_at)
       VALUES ($1, $2, 0, 0, 0, 0, 'completed', NOW(), NOW())
       RETURNING id`,
      [studentId, examId]
    );
    const attemptId = attemptInsert.rows[0].id;

    for (const q of questions) {
      const selectedOption = answers[q.id] ? String(answers[q.id]).toLowerCase() : null;
      let isCorrect = false;

      if (selectedOption) {
        attempted++;
        if (selectedOption === q.correct_option.toLowerCase()) {
          correct++;
          isCorrect = true;
        } else {
          wrong++;
        }
      }

      await client.query(
        `INSERT INTO attempt_answers (attempt_id, question_id, student_id, selected_option, is_correct)
         VALUES ($1, $2, $3, $4, $5)`,
        [attemptId, q.id, studentId, selectedOption, isCorrect]
      );
    }

    const calculatedScore = correct - wrong * negativeMark;
    const finalScore = Math.max(0, calculatedScore);

    await client.query(
      `UPDATE attempts
       SET score = $1, total_attempted = $2, correct_count = $3, wrong_count = $4
       WHERE id = $5`,
      [finalScore, attempted, correct, wrong, attemptId]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      attemptId,
      score: finalScore,
      totalAttempted: attempted,
      correctCount: correct,
      wrongCount: wrong,
      totalQuestions: questions.length,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Exam submission error:', error);
    res.status(500).json({ message: 'Failed to submit exam.' });
  } finally {
    client.release();
  }
});

// Get Attempt Result with detailed answer sheet
app.get('/api/attempts/:attemptId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { attemptId } = req.params;

    const attemptRes = await pool.query(
      `SELECT a.id, a.student_id as "studentId", a.exam_id as "examId",
              a.score, a.total_attempted as "totalAttempted", a.correct_count as "correctCount",
              a.wrong_count as "wrongCount", a.status, a.started_at as "startedAt", a.submitted_at as "submittedAt",
              e.title as "examTitle", e.total_marks as "totalMarks", e.duration_minutes as "durationMinutes",
              e.subject_id as "subjectId"
       FROM attempts a
       JOIN exams e ON e.id = a.exam_id
       WHERE a.id = $1`,
      [attemptId]
    );

    if (attemptRes.rowCount === 0) return res.status(404).json({ message: 'Attempt not found.' });
    const attempt = attemptRes.rows[0];

    // Only allow student who took the exam or admin to view
    if (attempt.studentId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Fetch questions and student answers
    const detailsRes = await pool.query(
      `SELECT q.id, q.stimulus, q.question_text as "questionText",
              q.option_a as "optionA", q.option_b as "optionB", q.option_c as "optionC", q.option_d as "optionD",
              q.correct_option as "correctOption", q.explanation, q.serial_number as "serialNumber",
              ans.selected_option as "selectedOption", ans.is_correct as "isCorrect"
       FROM questions q
       LEFT JOIN attempt_answers ans ON ans.question_id = q.id AND ans.attempt_id = $1
       WHERE q.exam_id = $2
       ORDER BY q.serial_number ASC`,
      [attemptId, attempt.examId]
    );

    res.json({
      attempt,
      exam: {
        id: attempt.examId,
        title: attempt.examTitle,
        totalMarks: attempt.totalMarks,
        durationMinutes: attempt.durationMinutes,
        subjectId: attempt.subjectId,
      },
      questions: detailsRes.rows,
    });
  } catch (error) {
    console.error('Error fetching attempt result:', error);
    res.status(500).json({ message: 'Failed to load attempt results.' });
  }
});

// Previous submissions for a specific exam
app.get('/api/exams/:examId/submissions', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { examId } = req.params;
    const studentId = req.user!.id;

    const result = await pool.query(
      `SELECT id, score, total_attempted as "totalAttempted",
              correct_count as "correctCount", wrong_count as "wrongCount",
              started_at as "startedAt", submitted_at as "submittedAt"
       FROM attempts
       WHERE exam_id = $1 AND student_id = $2
       ORDER BY submitted_at DESC`,
      [examId, studentId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load submissions.' });
  }
});

// Real-time student statistics (completed exams, avg score %, and daily study streak)
app.get('/api/user/stats', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.id;

    // 1. Completed exams count and total attempts
    const attemptsSummaryRes = await pool.query(
      `SELECT 
         COUNT(DISTINCT exam_id)::int as "completedExams",
         COUNT(id)::int as "totalAttempts",
         COALESCE(SUM(total_attempted), 0)::int as "totalQuestionsAttempted",
         COALESCE(SUM(correct_count), 0)::int as "totalCorrect",
         COALESCE(SUM(wrong_count), 0)::int as "totalWrong"
       FROM attempts
       WHERE student_id = $1 AND status = 'completed'`,
      [studentId]
    );
    const summary = attemptsSummaryRes.rows[0] || {
      completedExams: 0,
      totalAttempts: 0,
      totalQuestionsAttempted: 0,
      totalCorrect: 0,
      totalWrong: 0,
    };

    // 2. Accurate average percentage score calculation across completed exams
    const avgScoreRes = await pool.query(
      `SELECT 
         COALESCE(
           AVG(
             CASE 
               WHEN COALESCE(e.total_marks, 0) > 0 
               THEN LEAST(100.0, GREATEST(0.0, (a.score / e.total_marks) * 100.0))
               WHEN a.total_attempted > 0 
               THEN LEAST(100.0, GREATEST(0.0, (a.score / a.total_attempted) * 100.0))
               ELSE 0.0
             END
           ), 
           0.0
         ) as "avgPercentage"
       FROM attempts a
       LEFT JOIN exams e ON a.exam_id = e.id
       WHERE a.student_id = $1 AND a.status = 'completed'`,
      [studentId]
    );
    const avgScore = Math.round(Number(avgScoreRes.rows[0]?.avgPercentage || 0));

    // 3. Consecutive Daily Study Streak Calculation in Bangladesh Time (UTC+6)
    const datesRes = await pool.query(
      `SELECT DISTINCT TO_CHAR(submitted_at AT TIME ZONE 'Asia/Dhaka', 'YYYY-MM-DD') as "examDate"
       FROM attempts
       WHERE student_id = $1 AND status = 'completed'
       ORDER BY "examDate" DESC`,
      [studentId]
    );

    const activeDates: string[] = datesRes.rows.map((r: any) => r.examDate);

    // Get current date and yesterday in Dhaka time
    const nowInDhaka = new Date(Date.now() + 6 * 3600 * 1000);
    const todayStr = nowInDhaka.toISOString().slice(0, 10);
    const yesterdayInDhaka = new Date(Date.now() + 6 * 3600 * 1000 - 86400 * 1000);
    const yesterdayStr = yesterdayInDhaka.toISOString().slice(0, 10);

    let streakDays = 0;
    if (activeDates.length > 0) {
      let currentCheckDate: Date;

      if (activeDates[0] === todayStr) {
        streakDays = 1;
        currentCheckDate = new Date(nowInDhaka);
        currentCheckDate.setUTCDate(currentCheckDate.getUTCDate() - 1);
      } else if (activeDates[0] === yesterdayStr) {
        streakDays = 1;
        currentCheckDate = new Date(yesterdayInDhaka);
        currentCheckDate.setUTCDate(currentCheckDate.getUTCDate() - 1);
      } else {
        streakDays = 0;
        currentCheckDate = new Date(nowInDhaka);
      }

      if (streakDays > 0) {
        const dateSet = new Set(activeDates);
        for (let i = 1; i < 365; i++) {
          const checkStr = currentCheckDate.toISOString().slice(0, 10);
          if (dateSet.has(checkStr)) {
            streakDays++;
            currentCheckDate.setUTCDate(currentCheckDate.getUTCDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    res.json({
      completedExams: summary.completedExams,
      totalAttempts: summary.totalAttempts,
      avgScore,
      streakDays,
      totalQuestionsAttempted: summary.totalQuestionsAttempted,
      totalCorrect: summary.totalCorrect,
      totalWrong: summary.totalWrong
    });
  } catch (error) {
    console.error('Fetch user stats error:', error);
    res.status(500).json({ message: 'Failed to fetch user stats.' });
  }
});

// Get student profile, academic configuration, and recent exam attempts
app.get('/api/user/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // 1. Fetch user personal & academic info
    const userRes = await pool.query(
      `SELECT id, email, full_name as "fullName", role, phone, institution,
              is_verified as "isVerified", curriculum_version as "curriculumVersion",
              academic_level as "academicLevel", stream,
              is_subscribed as "isSubscribed", subscription_status as "subscriptionStatus",
              subscription_curriculum as "subscriptionCurriculum",
              created_at as "createdAt"
       FROM users
       WHERE id = $1`,
      [userId]
    );
    if (userRes.rowCount === 0) return res.status(404).json({ message: 'User not found.' });

    const profile = userRes.rows[0];

    // 2. Fetch recent 10 exam attempts with exam and subject titles
    const recentAttemptsRes = await pool.query(
      `SELECT a.id, a.exam_id as "examId", a.score, a.total_attempted as "totalAttempted",
              a.correct_count as "correctCount", a.wrong_count as "wrongCount",
              a.status, a.submitted_at as "submittedAt",
              e.title as "examTitle", e.total_marks as "totalMarks", e.exam_type as "examType",
              s.name as "subjectName", s.name_bn as "subjectNameBn"
       FROM attempts a
       JOIN exams e ON a.exam_id = e.id
       JOIN subjects s ON e.subject_id = s.id
       WHERE a.student_id = $1 AND a.status = 'completed'
       ORDER BY a.submitted_at DESC
       LIMIT 10`,
      [userId]
    );

    res.json({
      user: profile,
      recentAttempts: recentAttemptsRes.rows
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ message: 'Failed to fetch user profile.' });
  }
});

// Student's last activity for "Continue where you left off"
app.get('/api/user/recent-activity', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.id;
    const academicLevel = typeof req.query.academicLevel === 'string' ? req.query.academicLevel : null;
    const curriculumVersion = typeof req.query.curriculumVersion === 'string' ? req.query.curriculumVersion : null;

    // 1. Search for user's latest ongoing or submitted attempt
    let attemptQuery = `
      SELECT a.id as "attemptId", a.exam_id as "examId", a.score, a.total_attempted as "totalAttempted",
             a.correct_count as "correctCount", a.wrong_count as "wrongCount", a.status,
             a.started_at as "startedAt", a.submitted_at as "submittedAt",
             e.title as "examTitle", e.duration_minutes as "durationMinutes", e.total_marks as "totalMarks",
             COALESCE(e.academic_level, s.academic_level, 'hsc') as "academicLevel",
             COALESCE(e.curriculum_version, s.curriculum_version, 'bangla') as "curriculumVersion",
             s.id as "subjectId", s.name as "subjectName", s.name_bn as "subjectNameBn",
             COALESCE((SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id), 0)::int as "questionCount"
      FROM attempts a
      JOIN exams e ON a.exam_id = e.id
      JOIN subjects s ON e.subject_id = s.id
      WHERE a.student_id = $1
    `;
    const params: any[] = [studentId];
    if (academicLevel) {
      params.push(academicLevel);
      attemptQuery += ` AND (e.academic_level = $${params.length} OR s.academic_level = $${params.length})`;
    }
    attemptQuery += ` ORDER BY COALESCE(a.submitted_at, a.started_at) DESC LIMIT 1`;

    const attemptRes = await pool.query(attemptQuery, params);

    if (attemptRes.rowCount && attemptRes.rowCount > 0) {
      return res.json({
        hasActivity: true,
        type: 'attempt',
        activity: attemptRes.rows[0]
      });
    }

    // 2. If student has no attempts, find first published exam in this level/curriculum
    let fallbackQuery = `
      SELECT e.id as "examId", e.title as "examTitle", e.duration_minutes as "durationMinutes",
             e.total_marks as "totalMarks",
             COALESCE(e.academic_level, s.academic_level, 'hsc') as "academicLevel",
             COALESCE(e.curriculum_version, s.curriculum_version, 'bangla') as "curriculumVersion",
             s.id as "subjectId", s.name as "subjectName", s.name_bn as "subjectNameBn",
             COALESCE((SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id), 0)::int as "questionCount"
      FROM exams e
      JOIN subjects s ON e.subject_id = s.id
      WHERE e.is_published = TRUE
    `;
    const fallbackParams: any[] = [];
    if (academicLevel) {
      fallbackParams.push(academicLevel);
      fallbackQuery += ` AND (e.academic_level = $${fallbackParams.length} OR s.academic_level = $${fallbackParams.length})`;
    }
    if (curriculumVersion) {
      fallbackParams.push(curriculumVersion);
      fallbackQuery += ` AND (e.curriculum_version = $${fallbackParams.length} OR s.curriculum_version = $${fallbackParams.length})`;
    }
    fallbackQuery += ` ORDER BY s.created_at ASC, e.serial_number ASC LIMIT 1`;

    const fallbackRes = await pool.query(fallbackQuery, fallbackParams);

    if (fallbackRes.rowCount && fallbackRes.rowCount > 0) {
      return res.json({
        hasActivity: false,
        type: 'recommended',
        activity: fallbackRes.rows[0]
      });
    }

    // 3. Fallback to any published exam
    const anyExamRes = await pool.query(`
      SELECT e.id as "examId", e.title as "examTitle", e.duration_minutes as "durationMinutes",
             e.total_marks as "totalMarks",
             COALESCE(e.academic_level, s.academic_level, 'hsc') as "academicLevel",
             COALESCE(e.curriculum_version, s.curriculum_version, 'bangla') as "curriculumVersion",
             s.id as "subjectId", s.name as "subjectName", s.name_bn as "subjectNameBn",
             COALESCE((SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id), 0)::int as "questionCount"
      FROM exams e
      JOIN subjects s ON e.subject_id = s.id
      WHERE e.is_published = TRUE
      LIMIT 1
    `);

    if (anyExamRes.rowCount && anyExamRes.rowCount > 0) {
      return res.json({
        hasActivity: false,
        type: 'recommended',
        activity: anyExamRes.rows[0]
      });
    }

    res.json({ hasActivity: false, type: null, activity: null });
  } catch (error) {
    console.error('Fetch recent activity error:', error);
    res.status(500).json({ message: 'Failed to fetch recent activity.' });
  }
});

// Update student personal information (Name, Phone, Institution)
app.put('/api/user/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { fullName, phone, institution } = req.body;

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return res.status(400).json({ message: 'সম্পূর্ণ নাম আবশ্যক।' });
    }

    const updateRes = await pool.query(
      `UPDATE users
       SET full_name = $1,
           phone = $2,
           institution = $3,
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, full_name as "fullName", role, phone, institution,
                 is_verified as "isVerified", curriculum_version as "curriculumVersion",
                 academic_level as "academicLevel", stream, created_at as "createdAt"`,
      [fullName.trim(), phone ? phone.trim() : null, institution ? institution.trim() : null, userId]
    );

    const updatedUser = updateRes.rows[0];
    const newToken = generateToken({
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified,
      curriculumVersion: updatedUser.curriculumVersion,
      academicLevel: updatedUser.academicLevel,
      stream: updatedUser.stream
    });

    res.json({
      success: true,
      user: updatedUser,
      token: newToken,
      message: 'প্রোফাইল তথ্য সফলভাবে সংরক্ষণ করা হয়েছে।'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
});

// Change student password securely
app.put('/api/user/change-password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'বর্তমান ও নতুন উভয় পাসওয়ার্ড প্রদান করুন।' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' });
    }

    const userRes = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (userRes.rowCount === 0) return res.status(404).json({ message: 'User not found.' });

    const validPassword = await comparePassword(currentPassword, userRes.rows[0].password_hash);
    if (!validPassword) {
      return res.status(400).json({ message: 'বর্তমান পাসওয়ার্ডটি সঠিক নয়।' });
    }

    const newHash = await hashPassword(newPassword);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, userId]);

    res.json({
      success: true,
      message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password.' });
  }
});

// Student: Check Subscription Status & 3 Free Tests Limit
app.get('/api/user/subscription-status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRes = await pool.query(
      `SELECT id, is_subscribed as "isSubscribed",
              subscription_status as "subscriptionStatus",
              subscription_curriculum as "subscriptionCurriculum",
              curriculum_version as "curriculumVersion",
              role
       FROM users WHERE id = $1`,
      [userId]
    );
    if (userRes.rowCount === 0) return res.status(404).json({ message: 'User not found.' });

    const u = userRes.rows[0];
    const isSubscribed = Boolean(u.isSubscribed) || u.role === 'admin';

    // Count distinct exams taken
    const attemptsRes = await pool.query(
      'SELECT COUNT(DISTINCT exam_id) as "examsTakenCount", COUNT(*) as "totalAttempts" FROM attempts WHERE student_id = $1',
      [userId]
    );
    const examsTakenCount = parseInt(attemptsRes.rows[0]?.examsTakenCount || '0', 10);
    const totalAttempts = parseInt(attemptsRes.rows[0]?.totalAttempts || '0', 10);

    const freeLimit = 3;
    const freeTestsUsed = Math.min(examsTakenCount, freeLimit);
    const freeTestsRemaining = isSubscribed ? 9999 : Math.max(0, freeLimit - examsTakenCount);

    // Check if there is a pending subscription payment request
    const pendingPaymentRes = await pool.query(
      `SELECT id, amount, currency, gateway, sender_number as "senderNumber",
              transaction_id as "transactionId", status, created_at as "createdAt"
       FROM manual_payment_requests
       WHERE user_id = $1 AND status = 'submitted'
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    const pendingPayment = pendingPaymentRes.rows[0] || null;

    res.json({
      isSubscribed,
      subscriptionStatus: u.subscriptionStatus || (isSubscribed ? 'active' : 'free'),
      subscriptionCurriculum: u.subscriptionCurriculum || u.curriculumVersion || 'bangla',
      curriculumVersion: u.curriculumVersion || 'bangla',
      examsTakenCount,
      totalAttempts,
      freeLimit,
      freeTestsUsed,
      freeTestsRemaining,
      canTakeExam: isSubscribed || examsTakenCount < freeLimit,
      pendingPayment,
    });
  } catch (err) {
    console.error('Subscription status error:', err);
    res.status(500).json({ message: 'Failed to load subscription status.' });
  }
});

// Student: Submit Subscription Payment Request (Personal bKash or Nagad)
app.post('/api/subscription/submit', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const gateway = req.body?.gateway === 'nagad' ? 'nagad' : 'bkash';
    const senderNumber = typeof req.body?.senderNumber === 'string' ? req.body.senderNumber.trim() : '';
    const transactionId = typeof req.body?.transactionId === 'string' ? req.body.transactionId.trim().toUpperCase() : '';
    const curriculumVersion = typeof req.body?.curriculumVersion === 'string' ? req.body.curriculumVersion : (req.user?.curriculumVersion || 'bangla');

    if (!senderNumber || !transactionId) {
      return res.status(400).json({ message: 'প্রেরক মোবাইল নম্বর ও Transaction ID (TrxID) প্রদান করুন।' });
    }

    if (transactionId.length < 5) {
      return res.status(400).json({ message: 'অনুগ্রহ করে সঠিক Transaction ID (TrxID) প্রদান করুন।' });
    }

    // Check if TrxID already submitted
    const existingTrx = await pool.query(
      'SELECT id, status FROM manual_payment_requests WHERE UPPER(transaction_id) = $1',
      [transactionId]
    );
    if (existingTrx.rowCount && existingTrx.rowCount > 0) {
      return res.status(400).json({ message: 'এই Transaction ID (TrxID) টি ইতিপূর্বে জমা দেওয়া হয়েছে।' });
    }

    // Load current curriculum prices from payment_settings
    const settingsRes = await pool.query('SELECT * FROM payment_settings WHERE id = $1', ['default']);
    const settings = settingsRes.rows[0] || {};

    let amount = 499;
    if (curriculumVersion === 'english') amount = Number(settings.price_english) || 699;
    else if (curriculumVersion === 'british') amount = Number(settings.price_british) || 1200;
    else if (curriculumVersion === 'ib') amount = Number(settings.price_ib) || 1500;
    else amount = Number(settings.price_bangla) || 499;

    const receiverNumber = gateway === 'nagad' ? (settings.nagad_number || '01800000000') : (settings.bkash_number || '01700000000');
    const receiverName = gateway === 'nagad' ? (settings.nagad_account_name || 'MCQ Onushilon (Personal)') : (settings.bkash_account_name || 'MCQ Onushilon (Personal)');

    const insertRes = await pool.query(
      `INSERT INTO manual_payment_requests
         (user_id, plan_type, curriculum_version, gateway, payment_method, amount, currency, sender_number, sender_bkash_number, receiver_bkash_number, receiver_name, transaction_id, status)
       VALUES ($1, 'curriculum_subscription', $2, $3, 'manual', $4, 'BDT', $5, $5, $6, $7, $8, 'submitted')
       RETURNING id, status, amount, transaction_id as "transactionId", created_at as "createdAt"`,
      [userId, curriculumVersion, gateway, amount, senderNumber, receiverNumber, receiverName, transactionId]
    );

    // Update user's subscription_status to 'pending'
    await pool.query(
      "UPDATE users SET subscription_status = 'pending', subscription_curriculum = $1, updated_at = NOW() WHERE id = $2 AND is_subscribed = FALSE",
      [curriculumVersion, userId]
    );

    res.json({
      success: true,
      message: 'পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে। অ্যাডমিন পর্যালোচনার পর আপনার সাবস্ক্রিপশন চালু হবে।',
      payment: insertRes.rows[0],
    });
  } catch (error) {
    console.error('Subscription submit error:', error);
    res.status(500).json({ message: 'পেমেন্ট রিকোয়েস্ট জমা দিতে ব্যর্থ হয়েছে।' });
  }
});

// Check if user has unlocked a subject
app.get('/api/subjects/:subjectId/access', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { subjectId } = req.params;
    const userId = req.user!.id;

    if (req.user!.role === 'admin') {
      return res.json({ hasAccess: true, access: { status: 'active', gateway: 'admin' } });
    }

    const result = await pool.query(
      'SELECT * FROM subject_access WHERE user_id = $1 AND subject_id = $2 AND status = $3',
      [userId, subjectId, 'active']
    );

    if (result.rowCount && result.rowCount > 0) {
      res.json({ hasAccess: true, access: result.rows[0] });
    } else {
      res.json({ hasAccess: false, access: null });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to check subject access.' });
  }
});

// ==========================================
// 8. PAYMENTS (MANUAL BKASH & AUTOMATED)
// ==========================================

// Student: Submit manual bKash transaction
app.post('/api/payments/manual-bkash/submit', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const subjectId = typeof req.body?.subjectId === 'string' ? req.body.subjectId.trim() : '';
    const senderBkashNumber = typeof req.body?.senderBkashNumber === 'string' ? req.body.senderBkashNumber.trim() : '';
    const transactionId = typeof req.body?.transactionId === 'string' ? req.body.transactionId.trim().toUpperCase() : '';

    if (!subjectId || !senderBkashNumber || !transactionId) {
      return res.status(400).json({ message: 'Subject, sender number, and transaction ID are required.' });
    }

    // Check if subject exists
    const subjectRes = await pool.query('SELECT id, name_bn, unlock_price FROM subjects WHERE id = $1', [subjectId]);
    if (subjectRes.rowCount === 0) return res.status(404).json({ message: 'Subject not found.' });

    // Check if already unlocked
    const accessRes = await pool.query('SELECT id FROM subject_access WHERE user_id = $1 AND subject_id = $2 AND status = $3', [userId, subjectId, 'active']);
    if (accessRes.rowCount && accessRes.rowCount > 0) {
      return res.status(409).json({ message: 'This subject is already unlocked.' });
    }

    // Get payment settings
    const settingRes = await pool.query('SELECT bkash_number, bkash_account_name FROM payment_settings WHERE id = $1', ['default']);
    const paymentSettings = settingRes.rows[0] || {};

    const amount = Number(subjectRes.rows[0].unlock_price) || 299;
    const subjectName = subjectRes.rows[0].name_bn;

    await pool.query(
      `INSERT INTO manual_payment_requests
       (user_id, subject_id, subject_name, gateway, payment_method, amount, currency, sender_bkash_number, receiver_bkash_number, receiver_name, transaction_id, status)
       VALUES ($1, $2, $3, 'bkash', 'manual', $4, 'BDT', $5, $6, $7, $8, 'submitted')`,
      [userId, subjectId, subjectName, amount, senderBkashNumber, paymentSettings.bkash_number || '', paymentSettings.bkash_account_name || '', transactionId]
    );

    res.json({
      success: true,
      message: 'Payment submitted. Access will unlock after admin approval.',
      transactionId,
      amount,
    });
  } catch (error) {
    console.error('Manual bKash submit error:', error);
    res.status(500).json({ message: 'Failed to submit payment.' });
  }
});

// Admin: List all manual payment requests
app.get('/api/admin/manual-payments', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT m.id, m.user_id as "userId", u.full_name as "userName", u.email as "userEmail",
              m.plan_type as "planType", m.curriculum_version as "curriculumVersion",
              m.subject_id as "subjectId", m.subject_name as "subjectName",
              m.gateway, m.payment_method as "paymentMethod",
              m.amount, m.currency,
              COALESCE(m.sender_number, m.sender_bkash_number) as "senderNumber",
              m.sender_bkash_number as "senderBkashNumber",
              COALESCE(m.receiver_bkash_number, '') as "receiverBkashNumber",
              m.receiver_name as "receiverName",
              m.transaction_id as "transactionId",
              m.status, m.created_at as "createdAt", m.reviewed_at as "reviewedAt"
       FROM manual_payment_requests m
       JOIN users u ON u.id = m.user_id
       ORDER BY m.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load payment requests.' });
  }
});

// Admin: Approve or Reject manual payment (unlocks subscription or subject)
app.put('/api/admin/manual-payments/:id/status', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' | 'rejected'
    const adminId = req.user!.id;

    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ message: 'Status must be approved or rejected.' });
    }

    await client.query('BEGIN');

    const requestRes = await client.query('SELECT * FROM manual_payment_requests WHERE id = $1', [id]);
    if (requestRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Payment request not found.' });
    }

    const row = requestRes.rows[0];

    await client.query(
      `UPDATE manual_payment_requests
       SET status = $1, reviewed_by = $2, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $3`,
      [status, adminId, id]
    );

    if (status === 'approved') {
      // 1. Activate student's platform-wide subscription
      await client.query(
        `UPDATE users
         SET is_subscribed = TRUE,
             subscription_status = 'active',
             subscription_curriculum = COALESCE($1, curriculum_version, 'bangla'),
             subscription_activated_at = NOW(),
             updated_at = NOW()
         WHERE id = $2`,
        [row.curriculum_version, row.user_id]
      );

      // 2. If this payment was tied to a specific subject, also mark subject_access
      if (row.subject_id) {
        await client.query(
          `INSERT INTO subject_access
           (user_id, subject_id, amount, currency, gateway, payment_method, trx_id, status, unlocked_at)
           VALUES ($1, $2, $3, $4, $5, 'manual', $6, 'active', NOW())
           ON CONFLICT (user_id, subject_id) DO UPDATE
           SET status = 'active', amount = $3, trx_id = $6, unlocked_at = NOW()`,
          [row.user_id, row.subject_id, row.amount, row.currency, row.gateway || 'bkash', row.transaction_id]
        );
      }
    } else if (status === 'rejected') {
      // Reset user subscription_status to 'free' if not already subscribed
      await client.query(
        `UPDATE users
         SET subscription_status = 'free',
             updated_at = NOW()
         WHERE id = $1 AND is_subscribed = FALSE`,
        [row.user_id]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, message: `Payment request has been ${status}.` });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Failed to update payment status.' });
  } finally {
    client.release();
  }
});


// Admin Dashboard stats
app.get('/api/admin/stats', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const [usersRes, examsRes, subjectsRes, attemptsRes] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'student'"),
      pool.query('SELECT COUNT(*) FROM exams'),
      pool.query('SELECT COUNT(*) FROM subjects'),
      pool.query('SELECT COUNT(*) FROM attempts'),
    ]);

    res.json({
      users: parseInt(usersRes.rows[0].count, 10),
      exams: parseInt(examsRes.rows[0].count, 10),
      subjects: parseInt(subjectsRes.rows[0].count, 10),
      attempts: parseInt(attemptsRes.rows[0].count, 10),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load stats.' });
  }
});

// Admin: Search and list users/students
app.get('/api/admin/users', requireAdmin, async (req: Request, res: Response) => {
  try {
    const search = typeof req.query.q === 'string' ? req.query.q.trim() : (typeof req.query.query === 'string' ? (req.query.query as string).trim() : '');
    let queryText = `
      SELECT id, email, full_name as "fullName", role, is_verified as "isVerified",
             curriculum_version as "curriculumVersion", academic_level as "academicLevel",
             stream, is_subscribed as "isSubscribed", subscription_status as "subscriptionStatus",
             subscription_curriculum as "subscriptionCurriculum", created_at as "createdAt"
      FROM users
    `;
    const params: any[] = [];
    if (search) {
      params.push(`%${search}%`);
      queryText += ` WHERE email ILIKE $1 OR full_name ILIKE $1`;
    }
    queryText += ` ORDER BY created_at DESC LIMIT 100`;

    const result = await pool.query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch admin users error:', error);
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

// Admin: Update student curriculum version, academic level, and stream
app.put('/api/admin/users/:userId/curriculum', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { curriculumVersion, academicLevel, stream } = req.body;

    const validVersions = ['bangla', 'english', 'british', 'ib'];
    if (curriculumVersion && !validVersions.includes(curriculumVersion)) {
      return res.status(400).json({ message: 'Invalid curriculum version.' });
    }

    const result = await pool.query(
      `UPDATE users
       SET curriculum_version = COALESCE($1, curriculum_version),
           academic_level = COALESCE($2, academic_level),
           stream = COALESCE($3, stream),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, full_name as "fullName", role, is_verified as "isVerified",
                 curriculum_version as "curriculumVersion", academic_level as "academicLevel",
                 stream, is_subscribed as "isSubscribed", subscription_status as "subscriptionStatus",
                 subscription_curriculum as "subscriptionCurriculum", created_at as "createdAt"`,
      [curriculumVersion || null, academicLevel || null, stream || null, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      success: true,
      user: result.rows[0],
      message: 'শিক্ষার্থীর কারিকুলাম ও পরীক্ষার তথ্য সফলভাবে আপডেট করা হয়েছে।',
    });
  } catch (error) {
    console.error('Admin update user curriculum error:', error);
    res.status(500).json({ message: 'Failed to update student curriculum.' });
  }
});

// Admin: Manual Subscribe / Unsubscribe a student
app.put('/api/admin/users/:userId/subscription', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { isSubscribed, subscriptionCurriculum } = req.body;

    let result;
    if (isSubscribed) {
      result = await pool.query(
        `UPDATE users
         SET is_subscribed = TRUE,
             subscription_status = 'active',
             subscription_curriculum = COALESCE($1, curriculum_version, 'bangla'),
             subscription_activated_at = NOW(),
             updated_at = NOW()
         WHERE id = $2
         RETURNING id, email, full_name as "fullName", role, is_verified as "isVerified",
                   curriculum_version as "curriculumVersion", academic_level as "academicLevel",
                   stream, is_subscribed as "isSubscribed", subscription_status as "subscriptionStatus",
                   subscription_curriculum as "subscriptionCurriculum", created_at as "createdAt"`,
        [subscriptionCurriculum || null, userId]
      );
    } else {
      result = await pool.query(
        `UPDATE users
         SET is_subscribed = FALSE,
             subscription_status = 'free',
             subscription_expires_at = NOW(),
             updated_at = NOW()
         WHERE id = $1
         RETURNING id, email, full_name as "fullName", role, is_verified as "isVerified",
                   curriculum_version as "curriculumVersion", academic_level as "academicLevel",
                   stream, is_subscribed as "isSubscribed", subscription_status as "subscriptionStatus",
                   subscription_curriculum as "subscriptionCurriculum", created_at as "createdAt"`,
        [userId]
      );
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const updatedUser = result.rows[0];
    const msg = isSubscribed
      ? `${updatedUser.fullName}-এর সাবস্ক্রিপশন সফলভাবে সক্রিয় করা হয়েছে (PRO আনলকড)!`
      : `${updatedUser.fullName}-এর সাবস্ক্রিপশন সফলভাবে বাতিল করা হয়েছে (ফ্রি ট্রায়াল)!`;

    res.json({
      success: true,
      user: updatedUser,
      message: msg,
    });
  } catch (error) {
    console.error('Admin update user subscription error:', error);
    res.status(500).json({ message: 'Failed to update student subscription status.' });
  }
});

// Automated bKash create payment
app.post('/api/payments/bkash/create', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const subjectId = req.body?.subjectId;
    if (!subjectId) return res.status(400).json({ message: 'Subject is required.' });

    const subjectRes = await pool.query('SELECT id, name_bn, unlock_price FROM subjects WHERE id = $1', [subjectId]);
    if (subjectRes.rowCount === 0) return res.status(404).json({ message: 'Subject not found.' });

    const subject = subjectRes.rows[0];
    const amount = Number(subject.unlock_price) || 299;
    const merchantInvoiceNumber = `SUB-${subjectId.slice(0, 8)}-${Date.now()}`;
    const callbackBaseUrl = getBkashCallbackBaseUrl(req.headers.origin);

    const sessionRes = await pool.query(
      `INSERT INTO payment_sessions (user_id, subject_id, subject_name, amount, currency, merchant_invoice_number, status)
       VALUES ($1, $2, $3, $4, 'BDT', $5, 'pending')
       RETURNING id`,
      [user.id, subjectId, subject.name_bn, amount, merchantInvoiceNumber]
    );
    const sessionId = sessionRes.rows[0].id;
    const callbackURL = `${callbackBaseUrl}/payments/bkash/callback?sessionId=${sessionId}`;

    const createResponse = await createBkashPayment({
      amount,
      callbackURL,
      merchantInvoiceNumber,
      payerReference: user.id,
    });

    await pool.query(
      `UPDATE payment_sessions
       SET bkash_payment_id = $1, bkash_url = $2, callback_url = $3
       WHERE id = $4`,
      [createResponse.paymentID, createResponse.bKashURL, callbackURL, sessionId]
    );

    res.json({
      sessionId,
      subjectId,
      amount,
      redirectUrl: createResponse.bKashURL,
    });
  } catch (error) {
    console.error('bKash create payment error:', error);
    res.status(500).json({ message: error instanceof Error ? error.message : 'Unable to initiate bKash payment.' });
  }
});

// Automated bKash finalize payment
app.post('/api/payments/bkash/finalize', async (req: Request, res: Response) => {
  try {
    const { sessionId, status } = req.body;
    if (!sessionId) return res.status(400).json({ message: 'Session ID is required.' });

    const sessionRes = await pool.query('SELECT * FROM payment_sessions WHERE id = $1', [sessionId]);
    if (sessionRes.rowCount === 0) return res.status(404).json({ message: 'Payment session not found.' });

    const session = sessionRes.rows[0];
    if (status === 'cancel' || status === 'failure') {
      await pool.query('UPDATE payment_sessions SET status = $1, callback_status = $2, finalized_at = NOW() WHERE id = $3', [status === 'cancel' ? 'cancelled' : 'failed', status, sessionId]);
      return res.json({ success: false, status, subjectId: session.subject_id });
    }

    const executeRes = await executeBkashPayment(session.bkash_payment_id);
    if (executeRes.transactionStatus === 'Completed') {
      await pool.query(
        `INSERT INTO subject_access (user_id, subject_id, amount, currency, gateway, payment_method, trx_id, status, unlocked_at)
         VALUES ($1, $2, $3, 'BDT', 'bkash', 'gateway', $4, 'active', NOW())
         ON CONFLICT (user_id, subject_id) DO UPDATE SET status = 'active', unlocked_at = NOW()`,
        [session.user_id, session.subject_id, session.amount, executeRes.trxID]
      );
      await pool.query('UPDATE payment_sessions SET status = $1, transaction_status = $2, trx_id = $3, finalized_at = NOW() WHERE id = $4', ['completed', 'Completed', executeRes.trxID, sessionId]);
      return res.json({ success: true, status: 'completed', subjectId: session.subject_id });
    }

    res.status(409).json({ message: 'Payment could not be completed.' });
  } catch (error) {
    console.error('bKash finalize error:', error);
    res.status(500).json({ message: 'Failed to finalize bKash payment.' });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Start Express Server and initialize PostgreSQL
initDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 MCQOnushilon API server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('\n❌ [DATABASE CONNECTION ERROR] Failed to connect to PostgreSQL:');
    console.error(err?.message || err);
    console.error('\n👉 Troubleshooting Guide for Contributors / Windows:');
    console.error('   1. Is PostgreSQL installed and running on your machine?');
    console.error('      - Windows: Open "Services" (services.msc) and ensure "postgresql-x64-..." is Running.');
    console.error('   2. Does the database exist? Run: createdb mcq_onushilon (or in pgAdmin / psql: CREATE DATABASE mcq_onushilon;)');
    console.error('   3. If your postgres user has a password, set DATABASE_URL in .env:');
    console.error('      DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/mcq_onushilon"');
    console.error('   4. Alternatively, use a free cloud PostgreSQL database from https://neon.tech or https://supabase.com\n');
    process.exit(1);
  });
