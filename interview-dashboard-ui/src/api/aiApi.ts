import { apiRequest } from './client';
import { DEFAULT_USER_ID } from '../types';

export interface JdParseResult {
  role:           string;
  companyName:    string;
  location:       string;
  technologies:   string;
  expectedSalary: string;
  experience:     number | null;
  jobType:        'REMOTE' | 'HYBRID' | 'ON_SITE';
  about:          string;
  jobUrl:         string;
  platform:       string;
  benefits:       string;
  summary:        string;
  hrEmail?:       string;
}

export interface AlignmentEmailParams {
  userId?: number;
  jobApplicationId?: number;
  role?: string;
  companyName?: string;
  technologies?: string;
  jdText?: string;
}

export interface ColdEmailGenerateParams {
  role?: string;
  companyName?: string;
  technologies?: string;
  candidateName?: string;
  candidateExperience?: number;
  portfolioLink?: string;
  linkedInLink?: string;
  jobDescription?: string;
}

export interface PromptResponse {
  subject?: string;
  body?: string;
  email?: string;
}

export const aiApi = {
  /**
   * POST /api/ai/jd/parse
   * Sends raw job description text to the backend LLM service and
   * returns a structured JdParseResult ready to prefill the Bulk Apply form.
   */
  async parseJobDescription(jobDescription: string): Promise<JdParseResult> {
    return apiRequest<JdParseResult>('/ai/jd/parse', {
      method: 'POST',
      body: JSON.stringify({ jobDescription }),
    });
  },

  /**
   * POST /api/ai/emails/alignment
   * Generates a skill alignment email directly from the LLM via /api/ai/emails/alignment.
   */
  async generateAlignmentEmail(params: AlignmentEmailParams): Promise<{ subject: string; body: string }> {
    const res = await apiRequest<PromptResponse>('/ai/emails/alignment', {
      method: 'POST',
      body: JSON.stringify({
        userId: params.userId || DEFAULT_USER_ID,
        jobApplicationId: params.jobApplicationId,
        role: params.role,
        company: params.companyName,
        technologies: params.technologies,
        jdText: params.jdText,
      }),
    });
    return {
      subject: res.subject || 'Skill Alignment Analysis',
      body: res.body || res.email || '',
    };
  },

  /**
   * Generates a tailored cold job application / outreach email via the LLM.
   * Uses /api/ai/emails/alignment.
   */
  async generateColdEmail(params: ColdEmailGenerateParams): Promise<string> {
    const res = await this.generateAlignmentEmail({
      role: params.role,
      companyName: params.companyName,
      technologies: params.technologies,
      jdText: params.jobDescription,
    });
    return res.body;
  },
};
