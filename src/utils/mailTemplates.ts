import { Config } from "../config";

/**
 * A wrapper for all emails
 * @param content - The specific HTML content for the email body.
 */
const htmlTemplate = (subject: string, content: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #333; text-align: center;">${subject}</h2>
      <p>Hello,</p>

      ${content}

      <p style="margin-top: 20px;">Cheers,<br>The ${
        Config.MAIL_FROM || "App Team"
      }</p>

      <div style="margin-top: 25px; text-align: center; font-size: 12px; color: #999;">
        <p>You received this email because this address was used on our platform.</p>
        <p>&copy; ${new Date().getFullYear()} Backend Template. All rights reserved.</p>
      </div>
    </div>
  `;
};

/**
 * Generates the HTML for a welcome email.
 * @param name - The user's name.
 */
export const getWelcomeEmailHtml = (name: string): string => {
  const subject = "Welcome to Our App!";
  const content = `
    <p>We are thrilled to have you on board, <strong>${name}</strong>!</p>
    <p>You've successfully registered your account. You can now start using all our features.</p>
    <p>If you have any questions, don't hesitate to reply to this email.</p>
  `;
  return htmlTemplate(subject, content);
};

/**
 * Generates the HTML for a security login alert.
 * @param ip - The IP address of the login.
 * @param device - The User-Agent string (simple device info).
 */
export const getLoginAlertEmailHtml = (ip: string, device: string): string => {
  const subject = "Security Alert: New Login to Your Account";
  const content = `
    <p>We detected a new login to your account with the following details:</p>
    <ul>
      <li><strong>IP Address:</strong> ${ip}</li>
      <li><strong>Device/Browser:</strong> ${device}</li>
      <li><strong>Time:</strong> ${new Date().toUTCString()}</li>
    </ul>
    <p>If this was you, you can safely ignore this email.</p>
    <p><strong>If this was not you</strong>, please secure your account immediately by resetting your password and contacting our support team.</p>
  `;
  return htmlTemplate(subject, content);
};

/**
 * Generates the HTML for a password reset email.
 * @param token - The plain-text reset token.
 */
export const getPasswordResetEmailHtml = (token: string): string => {
  const subject = "Your Password Reset Request";
  const resetUrl = `${Config.FRONTEND_URL}/reset-password?token=${token}`;

  const content = `
    <p>You requested a password reset. Please use the token below to reset your password. This token is valid for only 10 minutes.</p>
    <p><strong>Your Reset Token:</strong></p>
    <h1 style="text-align: center; letter-spacing: 2px; color: #333;">${token}</h1>
    <p>Alternatively, you can click this link (if your app supports it):</p>
    <a href="${resetUrl}" style="display: block; width: 200px; margin: 20px auto; padding: 10px; background-color: #007bff; color: #ffffff; text-align: center; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
  `;
  return htmlTemplate(subject, content);
};
