import { JobApplication, Company, Interview, PreparationTopic, Technology, Question, StatMetrics } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080/api';

export const mockStore = {
  stats: {
    totalApplications: 5423,
    totalApplicationsTrend: '+16% this month',
    activeInterviews: 1893,
    activeInterviewsTrend: '-1% this month',
    shortlistedNow: 189,
    avatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces'
    ]
  } as StatMetrics,
  
  jobApplications: [
    {
      id: 1,
      candidateName: "Jane Cooper",
      role: "Senior Java Engineer",
      platform: "LinkedIn",
      postingDate: "2026-09-01",
      applyDate: "2026-09-05",
      status: "APPLIED",
      jobType: "REMOTE",
      expectedSalary: "$130,000",
      experience: 5.0,
      portfolioShared: true,
      linkedInProfileShared: true,
      jobUrl: "https://linkedin.com/jobs/view/101",
      company: {
        id: 1,
        name: "Microsoft",
        contactNumber: "(225) 555-0118",
        email: "jane@microsoft.com",
        location: "United States",
        technologyTest: true,
        workOn: "Cloud & AI Platforms"
      },
      resume: { id: 1, resumeName: "Jane_Cooper_Java_Lead.pdf" },
      technologies: [{ id: 1, name: "Java 21" }, { id: 2, name: "Spring Boot" }, { id: 3, name: "MySQL" }],
      isActive: true
    },
    {
      id: 2,
      candidateName: "Floyd Miles",
      role: "Distributed Systems Architect",
      platform: "Wellfound",
      postingDate: "2026-08-28",
      applyDate: "2026-09-02",
      status: "REJECTED",
      jobType: "HYBRID",
      expectedSalary: "$145,000",
      experience: 7.0,
      portfolioShared: true,
      linkedInProfileShared: true,
      jobUrl: "https://wellfound.com/jobs/102",
      company: {
        id: 2,
        name: "Yahoo",
        contactNumber: "(205) 555-0100",
        email: "floyd@yahoo.com",
        location: "Kiribati",
        technologyTest: true,
        workOn: "Media & Ad Tech"
      },
      resume: { id: 2, resumeName: "Floyd_Miles_Architect.pdf" },
      technologies: [{ id: 1, name: "Java 21" }, { id: 4, name: "Kafka" }],
      isActive: false
    },
    {
      id: 3,
      candidateName: "Ronald Richards",
      role: "Backend Platform Engineer",
      platform: "Referral",
      postingDate: "2026-09-10",
      applyDate: "2026-09-12",
      status: "REJECTED",
      jobType: "ON_SITE",
      expectedSalary: "$125,000",
      experience: 4.0,
      portfolioShared: false,
      linkedInProfileShared: true,
      jobUrl: "https://adobe.com/careers/103",
      company: {
        id: 3,
        name: "Adobe",
        contactNumber: "(302) 555-0107",
        email: "ronald@adobe.com",
        location: "Israel",
        technologyTest: false,
        workOn: "Creative Cloud Services"
      },
      resume: { id: 1, resumeName: "Ronald_Richards_CV.pdf" },
      technologies: [{ id: 2, name: "Spring Boot" }, { id: 5, name: "Docker" }],
      isActive: false
    },
    {
      id: 4,
      candidateName: "Marvin McKinney",
      role: "Autopilot Cloud Infrastructure Engineer",
      platform: "Indeed",
      postingDate: "2026-09-11",
      applyDate: "2026-09-14",
      status: "TECHNICAL_ROUND",
      jobType: "REMOTE",
      expectedSalary: "$150,000",
      experience: 6.0,
      portfolioShared: true,
      linkedInProfileShared: true,
      jobUrl: "https://tesla.com/careers/104",
      company: {
        id: 4,
        name: "Tesla",
        contactNumber: "(252) 555-0126",
        email: "marvin@tesla.com",
        location: "Iran",
        technologyTest: true,
        workOn: "Autonomous Telemetry"
      },
      resume: { id: 1, resumeName: "Marvin_McKinney_Resume.pdf" },
      technologies: [{ id: 1, name: "Java 21" }, { id: 6, name: "AWS" }, { id: 7, name: "Kubernetes" }],
      isActive: true
    },
    {
      id: 5,
      candidateName: "Jerome Bell",
      role: "Core Banking Microservices Dev",
      platform: "LinkedIn",
      postingDate: "2026-09-08",
      applyDate: "2026-09-10",
      status: "HR_SCREENING",
      jobType: "HYBRID",
      expectedSalary: "$115,000",
      experience: 3.5,
      portfolioShared: true,
      linkedInProfileShared: false,
      jobUrl: "https://google.com/jobs/105",
      company: {
        id: 5,
        name: "Google",
        contactNumber: "(629) 555-0129",
        email: "jerome@google.com",
        location: "Réunion",
        technologyTest: true,
        workOn: "Google Cloud Spanner"
      },
      resume: { id: 1, resumeName: "Jerome_Bell_Resume.pdf" },
      technologies: [{ id: 1, name: "Java 21" }, { id: 2, name: "Spring Boot" }],
      isActive: true
    },
    {
      id: 6,
      candidateName: "Kathryn Murphy",
      role: "Staff Backend Engineer",
      platform: "Company Portal",
      postingDate: "2026-09-05",
      applyDate: "2026-09-07",
      status: "OFFER",
      jobType: "REMOTE",
      expectedSalary: "$165,000",
      experience: 8.0,
      portfolioShared: true,
      linkedInProfileShared: true,
      jobUrl: "https://microsoft.com/careers/106",
      company: {
        id: 1,
        name: "Microsoft",
        contactNumber: "(406) 555-0120",
        email: "kathryn@microsoft.com",
        location: "Curaçao",
        technologyTest: true,
        workOn: "Azure Database Services"
      },
      resume: { id: 1, resumeName: "Kathryn_Murphy_Staff.pdf" },
      technologies: [{ id: 1, name: "Java 21" }, { id: 2, name: "Spring Boot" }, { id: 8, name: "Redis" }],
      isActive: true
    },
    {
      id: 7,
      candidateName: "Jacob Jones",
      role: "Enterprise Systems Developer",
      platform: "Wellfound",
      postingDate: "2026-09-04",
      applyDate: "2026-09-06",
      status: "MANAGERIAL_ROUND",
      jobType: "ON_SITE",
      expectedSalary: "$128,000",
      experience: 5.0,
      portfolioShared: true,
      linkedInProfileShared: true,
      jobUrl: "https://yahoo.com/jobs/107",
      company: {
        id: 2,
        name: "Yahoo",
        contactNumber: "(208) 555-0112",
        email: "jacob@yahoo.com",
        location: "Brazil",
        technologyTest: false,
        workOn: "Yahoo Finance Backend"
      },
      resume: { id: 1, resumeName: "Jacob_Jones_CV.pdf" },
      technologies: [{ id: 1, name: "Java 21" }, { id: 3, name: "MySQL" }],
      isActive: true
    },
    {
      id: 8,
      candidateName: "Kristin Watson",
      role: "Full Stack Engineer",
      platform: "LinkedIn",
      postingDate: "2026-09-02",
      applyDate: "2026-09-04",
      status: "REJECTED",
      jobType: "REMOTE",
      expectedSalary: "$110,000",
      experience: 3.0,
      portfolioShared: true,
      linkedInProfileShared: true,
      jobUrl: "https://facebook.com/careers/108",
      company: {
        id: 6,
        name: "Facebook",
        contactNumber: "(704) 555-0127",
        email: "kristin@facebook.com",
        location: "Åland Islands",
        technologyTest: true,
        workOn: "Ads Infrastructure"
      },
      resume: { id: 1, resumeName: "Kristin_Watson_Dev.pdf" },
      technologies: [{ id: 9, name: "React" }, { id: 2, name: "Spring Boot" }],
      isActive: false
    }
  ] as JobApplication[],

  companies: [
    { id: 1, name: "Microsoft", location: "United States", email: "careers@microsoft.com", contactNumber: "(225) 555-0118", technologyTest: true, workOn: "Cloud & AI Platforms", allowedJobType: ["REMOTE", "HYBRID"] },
    { id: 2, name: "Yahoo", location: "Kiribati", email: "jobs@yahoo.com", contactNumber: "(205) 555-0100", technologyTest: true, workOn: "Media & Ad Tech", allowedJobType: ["HYBRID", "ON_SITE"] },
    { id: 3, name: "Adobe", location: "Israel", email: "talent@adobe.com", contactNumber: "(302) 555-0107", technologyTest: false, workOn: "Creative Cloud Services", allowedJobType: ["ON_SITE"] },
    { id: 4, name: "Tesla", location: "United States", email: "recruit@tesla.com", contactNumber: "(252) 555-0126", technologyTest: true, workOn: "Autonomous Telemetry", allowedJobType: ["REMOTE"] },
    { id: 5, name: "Google", location: "United States", email: "jobs@google.com", contactNumber: "(629) 555-0129", technologyTest: true, workOn: "Cloud Systems", allowedJobType: ["HYBRID", "REMOTE"] }
  ] as Company[],

  interviews: [
    {
      id: 1,
      interviewDate: "2026-09-22T14:30:00",
      stage: "TECHNICAL",
      status: "SCHEDULED",
      jobApplicationId: 4,
      companyName: "Tesla",
      role: "Autopilot Cloud Infrastructure Engineer",
      notes: "Focus on Spring Boot concurrency, Java 21 Virtual Threads, and distributed caching.",
      questions: [
        { id: 1, question: "Explain how Virtual Threads differ from OS Platform Threads in Java 21?" },
        { id: 2, question: "How does optimistic locking work in Hibernate with @Version?" }
      ],
      requiredImprovements: [
        { id: 4, name: "Kafka" },
        { id: 7, name: "Kubernetes" }
      ]
    },
    {
      id: 2,
      interviewDate: "2026-09-20T10:00:00",
      stage: "MANAGERIAL",
      status: "PASSED",
      jobApplicationId: 7,
      companyName: "Yahoo",
      role: "Enterprise Systems Developer",
      notes: "Behavioral and architecture trade-offs. Passed with strong feedback on system design.",
      questions: [
        { id: 3, question: "Describe a production incident where you handled high latency spikes." }
      ],
      requiredImprovements: []
    }
  ] as Interview[],

  preparationTopics: [
    { id: 1, name: "Java 21 Deep Dive", category: "JAVA", description: "Virtual threads, records, pattern matching, memory model", parentId: null, itemCount: 12, progress: 85 },
    { id: 2, name: "Spring Boot 3 & JPA", category: "SPRING_BOOT", description: "Hibernate caching, specifications, composite endpoints", parentId: null, itemCount: 18, progress: 92 },
    { id: 3, name: "System Design & Distributed Systems", category: "SYSTEM_DESIGN", description: "Sharding, replication, Kafka idempotency, consensus", parentId: null, itemCount: 24, progress: 65 },
    { id: 4, name: "Data Structures & Algorithms", category: "DSA", description: "Trees, Graphs, DP, Sliding Window", parentId: null, itemCount: 45, progress: 78 }
  ] as PreparationTopic[],

  technologies: [
    { id: 1, name: "Java 21", type: "LANGUAGE", description: "Core Java runtime with Virtual Threads" },
    { id: 2, name: "Spring Boot", type: "FRAMEWORK", description: "Enterprise Java microservices framework" },
    { id: 3, name: "MySQL", type: "DATABASE", description: "Relational database" },
    { id: 4, name: "Kafka", type: "TOOL", description: "Distributed event streaming" },
    { id: 5, name: "Docker", type: "TOOL", description: "Containerization" },
    { id: 6, name: "AWS", type: "CLOUD", description: "Cloud computing infrastructure" },
    { id: 7, name: "Kubernetes", type: "TOOL", description: "Container orchestration" },
    { id: 8, name: "Redis", type: "DATABASE", description: "In-memory key-value cache" },
    { id: 9, name: "React", type: "FRAMEWORK", description: "Modern frontend SPA library" }
  ] as Technology[],

  questions: [
    { id: 1, question: "Explain how Virtual Threads differ from OS Platform Threads in Java 21?", technologyName: "Java 21", listedDate: "2026-09-12" },
    { id: 2, question: "How does optimistic locking work in Hibernate with @Version?", technologyName: "Spring Boot", listedDate: "2026-09-14" },
    { id: 3, question: "What is the difference between @Mock and @MockBean in Spring Boot testing?", technologyName: "Spring Boot", listedDate: "2026-09-15" },
    { id: 4, question: "How do you guarantee exactly-once processing in Apache Kafka?", technologyName: "Kafka", listedDate: "2026-09-16" },
    { id: 5, question: "Explain the two-phase commit protocol and its alternatives (Saga pattern).", technologyName: "System Design", listedDate: "2026-09-17" }
  ] as Question[]
};

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: any;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || `HTTP Error ${response.status}` };
      }
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    return (await response.json()) as T;
  } catch (err: any) {
    const isNetworkError = err.name === 'TypeError' || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError');
    if (isNetworkError) {
      console.warn(`[API Client] Backend offline at ${url}. Using dynamic mock store.`, err.message);
      return handleMockFallback<T>(endpoint, options);
    }
    throw err;
  }
}

function handleMockFallback<T>(endpoint: string, options: RequestInit): T {
  const method = (options.method || 'GET').toUpperCase();
  const cleanEndpoint = endpoint.split('?')[0];

  if (cleanEndpoint === '/job-applications' && method === 'GET') {
    return {
      content: mockStore.jobApplications,
      totalElements: mockStore.jobApplications.length,
      totalPages: 1,
      size: 10,
      number: 0
    } as T;
  }

  if (cleanEndpoint === '/job-applications/composite' && method === 'POST') {
    const payload = JSON.parse((options.body as string) || '{}');
    const newApp: JobApplication = {
      id: Date.now(),
      candidateName: payload.candidateName || "Jane Cooper",
      role: payload.role || "Senior Software Engineer",
      platform: payload.platform || "LinkedIn",
      postingDate: payload.postingDate || new Date().toISOString().split('T')[0],
      applyDate: payload.applyDate || new Date().toISOString().split('T')[0],
      status: payload.status || "APPLIED",
      jobType: payload.jobType || "REMOTE",
      expectedSalary: payload.expectedSalary || "$130,000",
      experience: payload.experience || 4,
      portfolioShared: payload.portfolioShared ?? true,
      linkedInProfileShared: payload.linkedInProfileShared ?? true,
      jobUrl: payload.jobUrl || "",
      company: payload.company || { name: "New Enterprise Co", location: "Global" },
      resume: payload.resume || { resumeName: "Primary_Resume.pdf" },
      technologies: payload.technologys || [{ name: "Java 21" }],
      isActive: true
    };
    mockStore.jobApplications.unshift(newApp);
    return newApp as T;
  }

  if (cleanEndpoint === '/companies' && method === 'GET') {
    return {
      content: mockStore.companies,
      totalElements: mockStore.companies.length,
      totalPages: 1,
      size: 10,
      number: 0
    } as T;
  }

  if (cleanEndpoint === '/interviews' && method === 'GET') {
    return {
      content: mockStore.interviews,
      totalElements: mockStore.interviews.length,
      totalPages: 1,
      size: 10,
      number: 0
    } as T;
  }

  if (cleanEndpoint === '/preparation-topics' && method === 'GET') {
    return {
      content: mockStore.preparationTopics,
      totalElements: mockStore.preparationTopics.length,
      totalPages: 1,
      size: 10,
      number: 0
    } as T;
  }

  if (cleanEndpoint === '/technologies' && method === 'GET') {
    return {
      content: mockStore.technologies,
      totalElements: mockStore.technologies.length,
      totalPages: 1,
      size: 20,
      number: 0
    } as T;
  }

  if (cleanEndpoint === '/questions' && method === 'GET') {
    return {
      content: mockStore.questions,
      totalElements: mockStore.questions.length,
      totalPages: 1,
      size: 20,
      number: 0
    } as T;
  }

  return { content: [] } as T;
}
