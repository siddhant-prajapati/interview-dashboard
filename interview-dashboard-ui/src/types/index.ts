/**
 * Core Domain Types & Interfaces for Interview Dashboard
 */

export type ApplicationStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'HR_SCREENING'
  | 'TECHNICAL_ROUND'
  | 'MANAGERIAL_ROUND'
  | 'HR_FINAL'
  | 'OFFER'
  | 'REJECTED'
  | 'ON_HOLD'
  | 'WITHDRAWN';

export type InterviewStage = 'HR' | 'TECHNICAL' | 'MANAGERIAL' | 'HR_FINAL';

export type InterviewStatus =
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'PASSED'
  | 'FAILED'
  | 'CANCELLED'
  | 'RESCHEDULED';

export type JobType = 'REMOTE' | 'ON_SITE' | 'HYBRID';

export type TechnologyType =
  | 'LANGUAGE'
  | 'FRAMEWORK'
  | 'DATABASE'
  | 'CLOUD'
  | 'TOOL'
  | 'CONCEPT'
  | 'LIBRARY'
  | 'PROTOCOL';

export type TopicCategory =
  | 'DSA'
  | 'JAVA'
  | 'SPRING_BOOT'
  | 'SPRING_SECURITY'
  | 'REACT'
  | 'SQL'
  | 'SYSTEM_DESIGN'
  | 'AWS'
  | 'DEVOPS'
  | 'OTHER';

export interface Technology {
  id?: number;
  name: string;
  type?: TechnologyType | string;
  description?: string;
}

export interface Company {
  id?: number;
  name: string;
  technologyTest?: boolean;
  workOn?: string;
  allowedJobType?: JobType[];
  contactNumber?: string;
  email?: string;
  location?: string;
}

export interface Resume {
  id?: number;
  resumeName: string;
  documentPath?: string;
}

export interface JobApplication {
  id: number;
  candidateName?: string;
  role: string;
  platform?: string;
  postingDate?: string;
  about?: string;
  experience?: number;
  expectedSalary?: string;
  jobType?: JobType | string;
  applyDate?: string;
  status: ApplicationStatus | string;
  followUpCount?: number;
  portfolioShared?: boolean;
  linkedInProfileShared?: boolean;
  jobUrl?: string;
  company?: Company;
  resume?: Resume;
  technologies?: (Technology | string)[];
  isActive?: boolean;
}

export interface Question {
  id: number;
  question: string;
  technology?: Technology;
  technologyName?: string;
  listedDate?: string;
}

export interface Interview {
  id: number;
  interviewDate?: string;
  stage: InterviewStage | string;
  status: InterviewStatus | string;
  jobApplicationId?: number;
  companyName?: string;
  role?: string;
  notes?: string;
  questions?: Question[];
  requiredImprovements?: Technology[];
}

export interface PreparationTopic {
  id: number;
  name: string;
  category: TopicCategory | string;
  description?: string;
  parentId?: number | null;
  itemCount?: number;
  progress?: number;
}

export interface PreparationItem {
  id: number;
  title: string;
  description?: string;
  type: string;
  difficulty?: number;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface StatMetrics {
  totalApplications: number | string;
  totalApplicationsTrend?: string;
  activeInterviews: number | string;
  activeInterviewsTrend?: string;
  shortlistedNow: number | string;
  avatars?: string[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}
