const nodemailer = require('nodemailer');

function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function sendMail(to, subject, text) {
  if (!isSmtpConfigured()) {
    console.log(`[CPRS] Email to ${to}: ${subject} — ${text}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });
}

async function sendPasswordResetEmail(to, resetUrl) {
  const subject = 'CPRS Password Reset';
  const text = `Reset your password using this link (valid for 1 hour):\n\n${resetUrl}`;

  if (!isSmtpConfigured()) {
    console.log(`[CPRS] Password reset link for ${to}: ${resetUrl}`);
    return;
  }

  await sendMail(to, subject, text);
}

async function sendStatusNotificationEmail(to, message) {
  await sendMail(to, 'CPRS Complaint Update', message);
}

module.exports = { sendPasswordResetEmail, sendStatusNotificationEmail };
