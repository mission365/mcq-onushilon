import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

console.log('\n======================================================');
console.log('       MCQOnushilon SMTP & Email Diagnostic Tool      ');
console.log('======================================================\n');

const host = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
const port = Number(process.env.SMTP_PORT || '465');
const user = process.env.SMTP_USER?.trim();
const pass = process.env.SMTP_PASS?.trim();
const from = process.env.RESET_EMAIL_FROM?.trim() || user || 'noreply@mcqonushilon.com';
const secure = process.env.SMTP_SECURE === 'true' || (!process.env.SMTP_SECURE && port === 465);

console.log('1. Checking .env Configuration:');
console.log(`   - SMTP_HOST : ${host}`);
console.log(`   - SMTP_PORT : ${port}`);
console.log(`   - SMTP_USER : ${user ? user : '❌ NOT SET'}`);
console.log(`   - SMTP_PASS : ${pass ? '•••••••••••••••• (' + pass.length + ' chars)' : '❌ NOT SET'}`);
console.log(`   - SMTP_SECURE: ${secure}`);
console.log(`   - FROM      : ${from}\n`);

if (!user || !pass) {
  console.error('❌ ERROR: SMTP_USER or SMTP_PASS is missing in .env!');
  console.error('👉 Please add SMTP_USER="your_email@gmail.com" and SMTP_PASS="your_app_password" to .env.\n');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user,
    pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

console.log('2. Verifying connection to mail server...');

transporter
  .verify()
  .then(async () => {
    console.log('✅ Connection to SMTP server successful!\n');

    const testRecipient = process.argv[2] || user;
    console.log(`3. Sending test email to: ${testRecipient}...`);

    await transporter.sendMail({
      from,
      to: testRecipient,
      subject: '[MCQ অনুশীলন] টেস্ট ইমেইল ভেরিফিকেশন (Diagnostic Test)',
      text: 'আসসালামু আলাইকুম,\n\nএটি একটি টেস্ট ইমেইল। আপনার SMTP কনফিগারেশন সম্পূর্ণ সঠিকভাবে কাজ করছে!\n\nধন্যবাদ,\nMCQ অনুশীলন টিম',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
          <h2 style="color: #006837; margin-top: 0;">MCQ অনুশীলন - টেস্ট ইমেইল</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            অভিনন্দন! আপনার লোকাল ডেভেলপমেন্ট এনভায়রনমেন্ট থেকে SMTP ইমেইল ডেলিভারি সম্পূর্ণ সফল হয়েছে।
          </p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <strong style="color: #166534;">✅ Status:</strong> <span style="color: #15803d;">SMTP Verified & Connected</span>
          </div>
          <p style="color: #64748b; font-size: 13px;">Time: ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    console.log(`✅ Test email successfully delivered to ${testRecipient}!`);
    console.log('\n======================================================');
    console.log('🎉 All checks passed! Your email service is ready.');
    console.log('======================================================\n');
    process.exit(0);
  })
  .catch((err: any) => {
    console.error('\n❌ SMTP Connection Failed!');
    console.error('Error Code   :', err.code || 'N/A');
    console.error('Error Message:', err.message || err);
    console.log('\n--- Troubleshooting Tips for Windows & Local Machines ---');
    console.log('1. If error is "EAUTH" / "Invalid login":');
    console.log('   - Gmail requires an App Password (16 letters), not your standard account password.');
    console.log('   - Go to Google Account -> Security -> 2-Step Verification -> App Passwords.');
    console.log('2. If error is "ETIMEDOUT" or "ECONNREFUSED":');
    console.log('   - Port 465 might be blocked by Windows Defender Firewall, Antivirus, or ISP.');
    console.log('   - Try port 587 with SMTP_SECURE="false" in .env.');
    console.log('3. Ensure no trailing spaces or special quote characters around values in .env.\n');
    process.exit(1);
  });
