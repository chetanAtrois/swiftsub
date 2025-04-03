const nodemailer = require('nodemailer');
const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const { Otp } = require('../models');
const ApiError = require('../utils/ApiError');

// Initialize SMTP transport
const transport = nodemailer.createTransport(config.email.smtp);

// Verify SMTP connection (skip in test environment)
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Base email sending function
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 */
const sendEmail = async (to, subject, text) => {
  const msg = { from: config.email.from, to, subject, text };
  await transport.sendMail(msg);
};

/**
 * Send password reset email with OTP
 * @param {string} to - Recipient email 
 * @param {string} token - Reset token
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`;
  
  // Generate and store OTP
  const code = Math.floor(1000 + Math.random() * 9000);
  await Otp.create({
    otp: code,
    email: to,
    method: 'forgot-password',
    lastOtpSentTime: new Date(),
  });

  const text = `Dear user,
To reset your password:
- Use this verification code: ${code}
- Or click this link: ${resetPasswordUrl}

If you didn't request this, please ignore this email.`;
  
  await sendEmail(to, subject, text);
};

/**
 * Send email verification message
 * @param {string} to - Recipient email
 * @param {string} token - Verification token 
 */
const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  const verificationEmailUrl = `http://link-to-app/verify-email?token=${token}`;
  const code = Math.floor(1000 + Math.random() * 9000);

  const text = `Dear user,
To verify your email:
- Use this code: ${code}  
- Or click: ${verificationEmailUrl}

If you didn't create an account, please ignore this email.`;
  
  await sendEmail(to, subject, text);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail
};