import transporter from '../Config/Nodemailer';
import logger from '../Config/Logger';
import { config } from '../Config/config';

export interface EmailSendResult {
  messageId?: string;
  success: boolean;
  error?: string;
}

export class EmailAdapter {

  static async send(to: string, subject: string, html: string): Promise<EmailSendResult> {
    try {
      const mailOptions = {
        from: config?.email?.user,
        to,
        subject,
        html,
      };

      const info = await transporter.sendMail(mailOptions as any);

      logger.info(`Email sent successfully to ${to} with messageId: ${info.messageId}`);

      return {
        messageId: info.messageId,
        success: true,
      };
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async sendBulk(emails: Array<{ to: string; subject: string; html: string }>): Promise<EmailSendResult[]> {
    const results: EmailSendResult[] = [];

    for (const email of emails) {
      const result = await this.send(email.to, email.subject, email.html);
      results.push(result);
    }

    return results;
  }
}
