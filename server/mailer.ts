import nodemailer from 'nodemailer';

type MailPayload = {
  html: string;
  subject: string;
  text: string;
  to: string;
};

const getMailerConfig = () => {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.RESET_EMAIL_FROM?.trim() || user;
  const secure =
    process.env.SMTP_SECURE?.trim() === 'true' || (!process.env.SMTP_SECURE && port === 465);

  if (!host || !port || !user || !pass || !from) {
    return null;
  }

  return {
    auth: {
      pass,
      user,
    },
    from,
    host,
    port,
    secure,
  };
};

export const isMailerConfigured = () => getMailerConfig() !== null;

export const sendMail = async (payload: MailPayload) => {
  const config = getMailerConfig();

  if (!config) {
    throw new Error(
      'SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and RESET_EMAIL_FROM.',
    );
  }

  const transporter = nodemailer.createTransport({
    auth: config.auth,
    host: config.host,
    port: config.port,
    secure: config.secure,
  });

  await transporter.sendMail({
    from: config.from,
    html: payload.html,
    subject: payload.subject,
    text: payload.text,
    to: payload.to,
  });
};
