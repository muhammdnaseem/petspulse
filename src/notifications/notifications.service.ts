import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import * as twilio from 'twilio';

@Injectable()
export class NotificationsService {
  private twilioClient: twilio.Twilio;

  constructor(private configService: ConfigService) {
    // Initialize SendGrid
    const sendGridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (sendGridApiKey) {
      sgMail.setApiKey(sendGridApiKey);
    }

    // Initialize Twilio
    const twilioAccountSid = this.configService.get<string>(
      'TWILIO_ACCOUNT_SID',
    );
    const twilioAuthToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    if (twilioAccountSid && twilioAuthToken) {
      this.twilioClient = twilio(twilioAccountSid, twilioAuthToken);
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    const from = this.configService.get<string>('EMAIL_FROM') || 'noreply@petspulse.com';
    
    if (!this.configService.get<string>('SENDGRID_API_KEY')) {
      console.log('Email would be sent:', { to, subject, html });
      return;
    }

    try {
      await sgMail.send({
        to,
        from,
        subject,
        html,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    const html = `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await this.sendEmail(email, 'Password Reset Request', html);
  }

  async sendAlertEmail(email: string, title: string, message: string, petName: string) {
    const html = `
      <h2>Pet Health Alert: ${title}</h2>
      <p><strong>Pet:</strong> ${petName}</p>
      <p><strong>Message:</strong> ${message}</p>
      <p>Please check your PetPulse dashboard for more details.</p>
    `;

    await this.sendEmail(email, `PetPulse Alert: ${title}`, html);
  }

  async sendSms(to: string, message: string) {
    const twilioPhoneNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');

    if (!this.twilioClient || !twilioPhoneNumber) {
      console.log('SMS would be sent:', { to, message });
      return;
    }

    try {
      await this.twilioClient.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to,
      });
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  async sendAlertSms(phoneNumber: string, message: string) {
    await this.sendSms(phoneNumber, `PetPulse Alert: ${message}`);
  }
}

