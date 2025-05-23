/**
 * Email Utility
 * 
 * This module provides email functionality for the application.
 */

import { logger } from './logger';

// Email configuration
interface EmailConfig {
  from: string;
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email options
interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: any[];
}

// Email service interface
interface EmailService {
  sendEmail(options: EmailOptions): Promise<boolean>;
  sendSecurityAlert(to: string, subject: string, details: any): Promise<boolean>;
  sendPasswordReset(to: string, resetToken: string, username: string): Promise<boolean>;
  sendVerificationEmail(to: string, verificationToken: string, username: string): Promise<boolean>;
  sendWelcomeEmail(to: string, username: string): Promise<boolean>;
}

/**
 * Mock email service for development
 */
class MockEmailService implements EmailService {
  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    logger.info(`[MOCK EMAIL] Sending email to ${options.to}`, {
      subject: options.subject,
      text: options.text,
      html: options.html ? '[HTML CONTENT]' : undefined,
      attachments: options.attachments ? `[${options.attachments.length} attachments]` : undefined
    });
    
    return true;
  }
  
  /**
   * Send a security alert email
   */
  async sendSecurityAlert(to: string, subject: string, details: any): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Security Alert: ${subject}`,
      text: `A security event has been detected on your account.\n\nDetails: ${JSON.stringify(details, null, 2)}\n\nIf this was not you, please contact support immediately.`
    });
  }
  
  /**
   * Send a password reset email
   */
  async sendPasswordReset(to: string, resetToken: string, username: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Password Reset Request',
      text: `Hello ${username},\n\nYou have requested to reset your password. Please use the following token to reset your password: ${resetToken}\n\nIf you did not request this, please ignore this email.`
    });
  }
  
  /**
   * Send a verification email
   */
  async sendVerificationEmail(to: string, verificationToken: string, username: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Verify Your Email',
      text: `Hello ${username},\n\nPlease verify your email address by using the following token: ${verificationToken}\n\nThank you for registering with CareUnity.`
    });
  }
  
  /**
   * Send a welcome email
   */
  async sendWelcomeEmail(to: string, username: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Welcome to CareUnity',
      text: `Hello ${username},\n\nWelcome to CareUnity! We're excited to have you on board.\n\nIf you have any questions, please don't hesitate to contact our support team.`
    });
  }
}

// Create and export the email service
const emailService = new MockEmailService();
export { emailService, EmailOptions, EmailService };
