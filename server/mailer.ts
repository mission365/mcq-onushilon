import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

type MailPayload = {
  html: string;
  subject: string;
  text: string;
  to: string;
};

const getMailerConfig = () => {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || '465');
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.RESET_EMAIL_FROM?.trim() || user || 'MCQ অনুশীলন <noreply@mcqonushilon.com>';
  const secure =
    process.env.SMTP_SECURE?.trim() === 'true' || (!process.env.SMTP_SECURE && port === 465);

  if (!user || !pass) {
    return null;
  }

  // If host is not provided but user is a gmail address, default to smtp.gmail.com
  const effectiveHost = host || (user.includes('@gmail.com') ? 'smtp.gmail.com' : undefined);
  if (!effectiveHost) {
    return null;
  }

  return {
    auth: {
      pass,
      user,
    },
    from,
    host: effectiveHost,
    port,
    secure,
  };
};

export const isMailerConfigured = () => getMailerConfig() !== null;

export const sendMail = async (payload: MailPayload) => {
  const config = getMailerConfig();

  if (!config) {
    console.error('❌ [MAIL ERROR] SMTP credentials (SMTP_USER / SMTP_PASS) not configured in .env.');
    throw new Error('SMTP configuration missing in .env');
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: config.from,
      html: payload.html,
      subject: payload.subject,
      text: payload.text,
      to: payload.to,
    });

    console.log(`✅ [EMAIL DISPATCHED] Verification email sent to: ${payload.to}`);
  } catch (error: any) {
    console.error(`❌ [EMAIL DISPATCH FAILED] Could not deliver to ${payload.to}:`, error?.message || error);
    throw error;
  }
};

/**
 * Professional HTML Email Template for Signup / Email Verification OTP
 */
export const sendVerificationEmail = async ({
  to,
  fullName,
  otp,
}: {
  to: string;
  fullName: string;
  otp: string;
}) => {
  const subject = `[MCQ অনুশীলন] আপনার ইমেইল ভেরিফিকেশন কোড: ${otp}`;
  const text = `আসসালামু আলাইকুম ${fullName || 'শিক্ষার্থী'},\n\nআপনার MCQ অনুশীলন একাউন্ট ভেরিফাই করার জন্য ৬ সংখ্যার OTP কোডটি হলো: ${otp}\n\nএই কোডটি আগামী ১০ মিনিটের জন্য কার্যকর থাকবে। নিরাপত্তার স্বার্থে কোডটি কারো সাথে শেয়ার করবেন না।\n\nধন্যবাদ,\nMCQ অনুশীলন টিম`;

  const html = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ইমেইল ভেরিফিকেশন</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #071B3B 0%, #0F2D5C 100%); padding: 36px 30px; text-align: center;">
              <div style="display: inline-block; background-color: rgba(37, 99, 235, 0.2); border: 1px solid rgba(255,255,255,0.2); padding: 8px 18px; border-radius: 9999px; margin-bottom: 12px;">
                <span style="color: #60a5fa; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">অনলাইন মডেল টেস্ট ও প্রস্তুতি</span>
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">MCQ অনুশীলন</h1>
              <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 14px;">ইমেইল ভেরিফিকেশন কোড</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <h2 style="font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 14px;">
                আসসালামু আলাইকুম ${escapeHtml(fullName || 'শিক্ষার্থী')},
              </h2>
              <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                MCQ অনুশীলনে যোগদানের জন্য আপনাকে স্বাগতম! আপনার অ্যাকাউন্টটি নিরাপদে সক্রিয় করতে নিচের <strong>৬ সংখ্যার ওটিপি (OTP)</strong> কোডটি ব্যবহার করুন:
              </p>

              <!-- OTP Code Display Card -->
              <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 14px; padding: 24px; text-align: center; margin: 28px 0;">
                <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 1.5px; margin-bottom: 8px;">
                  আপনার ভেরিফিকেশন ওটিপি কোড
                </div>
                <div style="font-size: 38px; font-weight: 800; color: #2563eb; letter-spacing: 8px; font-family: monospace; margin: 6px 0;">
                  ${otp}
                </div>
                <div style="display: inline-block; background-color: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 9999px; margin-top: 8px;">
                  ⏱️ মেয়াদ: ১০ মিনিট
                </div>
              </div>

              <!-- Security Notice -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 14px 16px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
                      <strong>নিরাপত্তা বার্তা:</strong> এই ওটিপি কোডটি অত্যন্ত গোপনীয়। MCQ অনুশীলন টিমের কোনো প্রতিনিধি কখনো আপনার কোড বা পাসওয়ার্ড চাইবে না।
                    </p>
                  </td>
                </tr>
              </table>

              <p style="font-size: 14px; line-height: 1.5; color: #64748b; margin: 0;">
                আপনি যদি এই রিকোয়েস্ট না করে থাকেন, তবে এই ইমেইলটি উপেক্ষা করুন। আপনার অ্যাকাউন্ট সুরক্ষিত থাকবে।
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 36px; text-align: center;">
              <p style="font-size: 13px; color: #64748b; margin: 0 0 6px 0; font-weight: 500;">
                MCQ অনুশীলন — SSC, HSC এবং সকল বোর্ড পরীক্ষার প্রস্তুতি প্ল্যাটফর্ম
              </p>
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                &copy; ${new Date().getFullYear()} MCQOnushilon. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await sendMail({
    to,
    subject,
    text,
    html,
  });
};

const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
