import { apiRequest } from './client';

export interface SendEmailPayload {
  to: string;
  subject: string;
  body: string;
  candidateName?: string;
  candidateEmail?: string;
  companyName?: string;
  role?: string;
  jobApplicationId?: number;
}

export interface SendEmailResult {
  success: boolean;
  message: string;
  to: string;
  subject: string;
  sentAt: string;
}

export const emailApi = {
  /**
   * POST /api/email/send
   * Dispatches an email to the HR or career contact.
   */
  async sendEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
    return apiRequest<SendEmailResult>('/email/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
