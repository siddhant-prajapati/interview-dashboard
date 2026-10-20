import { apiRequest } from './client';

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
  email: string;
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
   * POST /api/ai/emails/generate-cold-email
   * Generates a tailored cold job application / outreach email via the LLM.
   */
  async generateColdEmail(params: ColdEmailGenerateParams): Promise<string> {
    const res = await apiRequest<PromptResponse>('/ai/emails/generate-cold-email', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return res.email;
  },
};
