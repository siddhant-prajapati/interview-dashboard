import React, { useState, useEffect } from 'react';
import {
  X, Zap, ExternalLink, Sparkles, FileText, Send, Mail,
  Briefcase, Building2, Link, Calendar, DollarSign,
  ChevronDown, CheckSquare, Square, Info
} from 'lucide-react';
import { jobApplicationsApi } from '../../api/jobApplicationsApi';
import { platformsApi } from '../../api/platformsApi';
import { aiApi } from '../../api/aiApi';
import { DEFAULT_USER_ID, JobType, ApplicationStatus, Platform } from '../../types';
import SendRecruiterEmailModal from './SendRecruiterEmailModal';


interface BulkApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newApp: any) => void;
}

interface PlatformTarget {
  name: string;
  letter: string;
  url: string;
  color: string;
}

const PLATFORMS: PlatformTarget[] = [
  { name: 'Naukri.com',  letter: 'N', url: 'https://www.naukri.com/mnjuser/homepage',            color: '#FF7555' },
  { name: 'Unstop',      letter: 'U', url: 'https://unstop.com/u/siddhpra69395',                 color: '#5932EA' },
  { name: 'Instahyre',   letter: 'I', url: 'https://www.instahyre.com/candidate/profile/',        color: '#00B87A' },
  { name: 'Cutshort',    letter: 'C', url: 'https://cutshort.io/profile/candidate-dashboard',    color: '#F59E0B' },
  { name: 'Wellfound',   letter: 'W', url: 'https://wellfound.com/jobs/home',                    color: '#0EA5E9' },
  { name: 'FoundIt',     letter: 'F', url: 'https://www.foundit.in/seeker/profile',              color: '#EC4899' },
  { name: 'LinkedIn',    letter: 'L', url: 'https://www.linkedin.com/jobs/',                     color: '#0077B5' },
];

const JOB_TYPE_OPTIONS: { value: JobType; label: string }[] = [
  { value: 'REMOTE',  label: 'Remote'  },
  { value: 'HYBRID',  label: 'Hybrid'  },
  { value: 'ON_SITE', label: 'On-Site' },
];

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: 'SAVED',            label: 'Saved'            },
  { value: 'APPLIED',          label: 'Applied'          },
  { value: 'HR_SCREENING',     label: 'HR Screening'     },
  { value: 'TECHNICAL_ROUND',  label: 'Technical Round'  },
  { value: 'MANAGERIAL_ROUND', label: 'Managerial Round' },
  { value: 'HR_FINAL',         label: 'HR Final'         },
  { value: 'OFFER',            label: 'Offer'            },
  { value: 'REJECTED',         label: 'Rejected'         },
  { value: 'ON_HOLD',          label: 'On Hold'          },
];

export default function BulkApplyModal({ isOpen, onClose, onSuccess }: BulkApplyModalProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [jdText, setJdText]           = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [aiSummary, setAiSummary]     = useState<string | null>(null);
  const [userPlatforms, setUserPlatforms] = useState<Platform[]>([]);
  const [platformsLoading, setPlatformsLoading] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  const [form, setForm] = useState({
    role:                  '',
    companyName:           '',
    hrEmail:               '',
    location:              'India',
    platformId:            '',
    jobType:               'REMOTE' as JobType,
    experience:            '2.0',
    expectedSalary:        '₹12 LPA',
    postingDate:           todayStr,
    applyDate:             todayStr,
    status:                'APPLIED' as ApplicationStatus,
    followUpCount:         '0',
    jobUrl:                '',
    technologies:          'Java 21, Spring Boot, MySQL',
    about:                 '',
    portfolioShared:       true,
    linkedInProfileShared: true,
  });

  useEffect(() => {
    if (!isOpen) return;
    const fetchPlatforms = async () => {
      setPlatformsLoading(true);
      try {
        const platforms = await platformsApi.getByUserId(DEFAULT_USER_ID);
        setUserPlatforms(platforms);
        if (platforms.length > 0) {
          setForm(prev => ({ ...prev, platformId: String(platforms[0].id) }));
        }
      } catch { /* silent */ } finally {
        setPlatformsLoading(false);
      }
    };
    fetchPlatforms();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLaunchAll = () => {
    PLATFORMS.forEach(p => window.open(p.url, '_blank', 'noopener,noreferrer'));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, type, value } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  /** Call the backend LLM service to extract structured fields from the JD */
  const handleSummarize = async () => {
    if (!jdText.trim()) return;
    setSummarizing(true);
    setError(null);
    setAiSummary(null);

    try {
      const parsed = await aiApi.parseJobDescription(jdText);

      // Regex fallback to guarantee any career/recruiter email mentioned in JD is captured
      const emailMatch = jdText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const extractedEmail = parsed.hrEmail || (emailMatch ? emailMatch[0] : '');

      setForm(prev => ({
        ...prev,
        role:           parsed.role          || prev.role,
        companyName:    parsed.companyName   || prev.companyName,
        hrEmail:        extractedEmail       || prev.hrEmail,
        location:       parsed.location      || prev.location,
        technologies:   parsed.technologies  || prev.technologies,
        expectedSalary: parsed.expectedSalary || prev.expectedSalary,
        experience:     parsed.experience != null ? String(parsed.experience) : prev.experience,
        jobType:        (parsed.jobType as JobType) || prev.jobType,
        about:          parsed.about         || prev.about,
        jobUrl:         parsed.jobUrl        || prev.jobUrl,
      }));

      if (parsed.summary) setAiSummary(parsed.summary);
    } catch (err: any) {
      setError('AI parsing failed: ' + (err.message || 'Unknown error'));
    } finally {
      setSummarizing(false);
    }
  };

  const handleCreate = async () => {
    if (!form.role.trim() || !form.companyName.trim()) {
      setError('Please fill in Target Role and Company Name before creating.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const selectedPlatform = userPlatforms.find(p => String(p.id) === form.platformId);
      const platformId = selectedPlatform?.id ? Number(selectedPlatform.id) : undefined;
      const platformNested = !platformId
        ? { name: 'Other', userId: DEFAULT_USER_ID }
        : undefined;

      const payload = {
        role:                  form.role.trim(),
        platformId:            platformId,
        platformNested:        platformNested,
        jobType:               form.jobType,
        experience:            parseFloat(form.experience) || 0,
        expectedSalary:        form.expectedSalary.trim(),
        postingDate:           form.postingDate || form.applyDate,
        applyDate:             form.applyDate,
        status:                form.status,
        about:                 form.about.trim(),
        jobUrl:                form.jobUrl.trim(),
        followUpCount:         parseInt(form.followUpCount, 10) || 0,
        portfolioShared:       Boolean(form.portfolioShared),
        linkedInProfileShared: Boolean(form.linkedInProfileShared),
        company: {
          name:           form.companyName.trim(),
          location:       form.location.trim() || 'Remote',
          allowedJobType: [form.jobType],
          technologyTest: true,
          email:          form.hrEmail.trim() || undefined,
        },
        resume: {
          resumeName:   'Primary_Resume.pdf',
          documentPath: '/resumes/Primary_Resume.pdf',
        },
        technologys: form.technologies
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)
          .map(name => ({ name, type: 'LANGUAGE' })),
      };

      const result = await jobApplicationsApi.createComposite(payload);
      setSubmitting(false);
      onClose();
      if (onSuccess) onSuccess(result);
    } catch (err: any) {
      setSubmitting(false);
      setError(err.message || 'Failed to create job application');
    }
  };

  return (
    <div className="bulk-panel-backdrop" onClick={onClose}>
      <div className="bulk-panel-drawer" onClick={e => e.stopPropagation()}>

        {/* ── HEADER ─────────────────────────────────── */}
        <div className="bulk-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="bulk-panel-header-icon">
              <Zap size={15} color="#FFFFFF" />
            </div>
            <span className="bulk-panel-title">Bulk Apply Hub</span>
            <span className="bulk-panel-badge">7 Platforms</span>
          </div>

          {/* Quick-launch strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {PLATFORMS.map(p => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                title={p.name}
                className="bulk-platform-dot"
                style={{ backgroundColor: p.color }}
              >
                {p.letter}
              </a>
            ))}
            <button type="button" className="bulk-launch-all-btn" onClick={handleLaunchAll}>
              <Zap size={12} />
              Launch All
            </button>
          </div>

          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} color="#7E7E7E" />
          </button>
        </div>

        {/* ── TWO-COLUMN BODY ─────────────────────────── */}
        <div className="bulk-panel-body">

          {/* ── LEFT: JD Input ──────────────────────── */}
          <div className="bulk-left-panel">
            <div className="bulk-section-label">
              <FileText size={13} />
              Paste Job Description
            </div>

            <textarea
              className="bulk-jd-textarea"
              placeholder={"Paste the full job description here…\n\nRole, company, salary, skills, requirements — the more detail, the better the auto-fill."}
              value={jdText}
              onChange={e => { setJdText(e.target.value); setAiSummary(null); }}
            />

            <span className="bulk-jd-meta">
              {jdText.length > 0 ? `${jdText.length.toLocaleString()} characters` : 'No content yet'}
            </span>

            {error && (
              <div className="modal-error-alert" style={{ margin: '0' }}>
                {error}
              </div>
            )}

            {aiSummary && (
              <div className="bulk-ai-summary-box">
                <Info size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>{aiSummary}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bulk-action-row">
              <button
                type="button"
                className="bulk-summarize-btn"
                onClick={handleSummarize}
                disabled={summarizing || !jdText.trim()}
              >
                {summarizing
                  ? <><span className="bulk-spinner" />Analyzing JD…</>
                  : <><Sparkles size={13} />Summarize &amp; Prefill</>
                }
              </button>

              <button
                type="button"
                className="bulk-email-btn"
                onClick={() => setEmailModalOpen(true)}
                title="Compose and send outreach email to HR/Career contact"
              >
                <Mail size={13} />
                Send Email
              </button>

              <button
                type="button"
                className="bulk-create-btn"
                onClick={handleCreate}
                disabled={submitting}
              >
                {submitting
                  ? <><span className="bulk-spinner bulk-spinner--white" />Creating…</>
                  : <><Send size={13} />Create Application</>
                }
              </button>
            </div>

            {/* Individual platform links */}
            <div className="bulk-platforms-list">
              <div className="bulk-section-label" style={{ marginBottom: '10px' }}>
                <ExternalLink size={13} />
                Individual Platforms
              </div>
              {PLATFORMS.map(p => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bulk-platform-row"
                >
                  <span className="bulk-platform-avatar" style={{ backgroundColor: p.color }}>
                    {p.letter}
                  </span>
                  <span>{p.name}</span>
                  <ExternalLink size={11} style={{ marginLeft: 'auto', opacity: 0.35 }} />
                </a>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Live Preview Form ─────────────── */}
          <div className="bulk-right-panel">
            <div className="bulk-section-label" style={{ marginBottom: '14px' }}>
              <Briefcase size={13} />
              Application Preview
              <span className="bulk-preview-hint">Auto-filled from JD</span>
            </div>

            <div className="bulk-preview-form">

              {/* Role */}
              <div className="bulk-form-group">
                <label className="bulk-form-label"><Briefcase size={10} /> Target Role *</label>
                <input className="bulk-form-input" type="text" name="role" value={form.role} onChange={handleChange} placeholder="e.g. Senior Java Engineer" />
              </div>

              {/* Company + Location */}
              <div className="bulk-form-row">
                <div className="bulk-form-group">
                  <label className="bulk-form-label"><Building2 size={10} /> Company *</label>
                  <input className="bulk-form-input" type="text" name="companyName" value={form.companyName} onChange={handleChange} placeholder="e.g. Microsoft" />
                </div>
                <div className="bulk-form-group">
                  <label className="bulk-form-label">Location</label>
                  <input className="bulk-form-input" type="text" name="location" value={form.location} onChange={handleChange} placeholder="Remote / India" />
                </div>
              </div>

              {/* HR / Career Email + Job Listing URL */}
              <div className="bulk-form-row">
                <div className="bulk-form-group" style={{ flex: 1.15 }}>
                  <label className="bulk-form-label">
                    <Mail size={10} /> HR or Career Email
                    {form.hrEmail && <span className="bulk-label-tag">Recruiter Contact</span>}
                  </label>
                  <div className="bulk-input-with-action">
                    <input
                      className="bulk-form-input"
                      type="email"
                      name="hrEmail"
                      value={form.hrEmail}
                      onChange={handleChange}
                      placeholder="e.g. careers@company.com or hr@..."
                    />
                    {form.hrEmail && (
                      <button
                        type="button"
                        className="bulk-inline-mail-btn"
                        onClick={() => setEmailModalOpen(true)}
                        title="Send email to this HR / Career address"
                      >
                        <Send size={11} /> Send
                      </button>
                    )}
                  </div>
                </div>
                <div className="bulk-form-group" style={{ flex: 0.85 }}>
                  <label className="bulk-form-label"><Link size={10} /> Job Listing URL</label>
                  <input
                    className="bulk-form-input"
                    type="url"
                    name="jobUrl"
                    value={form.jobUrl}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/jobs/view/..."
                  />
                </div>
              </div>

              {/* Platform + Job Type */}
              <div className="bulk-form-row">
                <div className="bulk-form-group">
                  <label className="bulk-form-label">Platform</label>
                  <div className="bulk-select-wrap">
                    <select className="bulk-form-select" name="platformId" value={form.platformId} onChange={handleChange} disabled={platformsLoading}>
                      {platformsLoading
                        ? <option>Loading…</option>
                        : userPlatforms.length === 0
                          ? <option>No platforms</option>
                          : userPlatforms.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)
                      }
                    </select>
                    <ChevronDown size={12} className="bulk-select-chevron" />
                  </div>
                </div>
                <div className="bulk-form-group">
                  <label className="bulk-form-label">Job Type</label>
                  <div className="bulk-select-wrap">
                    <select className="bulk-form-select" name="jobType" value={form.jobType} onChange={handleChange}>
                      {JOB_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <ChevronDown size={12} className="bulk-select-chevron" />
                  </div>
                </div>
              </div>

              {/* Experience + Salary */}
              <div className="bulk-form-row">
                <div className="bulk-form-group">
                  <label className="bulk-form-label">Experience (yrs)</label>
                  <input className="bulk-form-input" type="number" step="0.5" min="0" name="experience" value={form.experience} onChange={handleChange} />
                </div>
                <div className="bulk-form-group">
                  <label className="bulk-form-label"><DollarSign size={10} /> Expected Salary</label>
                  <input className="bulk-form-input" type="text" name="expectedSalary" value={form.expectedSalary} onChange={handleChange} placeholder="₹12 LPA" />
                </div>
              </div>

              {/* Posting Date + Apply Date */}
              <div className="bulk-form-row">
                <div className="bulk-form-group">
                  <label className="bulk-form-label"><Calendar size={10} /> Posting Date</label>
                  <input className="bulk-form-input" type="date" name="postingDate" value={form.postingDate} onChange={handleChange} />
                </div>
                <div className="bulk-form-group">
                  <label className="bulk-form-label"><Calendar size={10} /> Apply Date</label>
                  <input className="bulk-form-input" type="date" name="applyDate" value={form.applyDate} onChange={handleChange} />
                </div>
              </div>

              {/* Status + Follow-Up */}
              <div className="bulk-form-row">
                <div className="bulk-form-group">
                  <label className="bulk-form-label">Status</label>
                  <div className="bulk-select-wrap">
                    <select className="bulk-form-select" name="status" value={form.status} onChange={handleChange}>
                      {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <ChevronDown size={12} className="bulk-select-chevron" />
                  </div>
                </div>
                <div className="bulk-form-group">
                  <label className="bulk-form-label">Follow-Up Count</label>
                  <input className="bulk-form-input" type="number" min="0" name="followUpCount" value={form.followUpCount} onChange={handleChange} />
                </div>
              </div>

              {/* Technologies */}
              <div className="bulk-form-group">
                <label className="bulk-form-label">Technologies (comma-separated)</label>
                <input className="bulk-form-input" type="text" name="technologies" value={form.technologies} onChange={handleChange} placeholder="Java 21, Spring Boot, MySQL" />
              </div>

              {/* About */}
              <div className="bulk-form-group">
                <label className="bulk-form-label">About / Job Description</label>
                <textarea className="bulk-form-textarea" name="about" rows={4} value={form.about} onChange={handleChange} placeholder="Key responsibilities, tech stack, recruiter notes…" />
              </div>

              {/* Checkboxes */}
              <div className="bulk-checkbox-row">
                <label
                  className="bulk-checkbox-label"
                  onClick={() => setForm(p => ({ ...p, portfolioShared: !p.portfolioShared }))}
                >
                  {form.portfolioShared
                    ? <CheckSquare size={15} color="#5932EA" />
                    : <Square size={15} color="#9CA3AF" />
                  }
                  <span>Portfolio Shared</span>
                </label>
                <label
                  className="bulk-checkbox-label"
                  onClick={() => setForm(p => ({ ...p, linkedInProfileShared: !p.linkedInProfileShared }))}
                >
                  {form.linkedInProfileShared
                    ? <CheckSquare size={15} color="#5932EA" />
                    : <Square size={15} color="#9CA3AF" />
                  }
                  <span>LinkedIn Shared</span>
                </label>
              </div>

            </div>{/* /bulk-preview-form */}
          </div>{/* /bulk-right-panel */}
        </div>{/* /bulk-panel-body */}
      </div>{/* /bulk-panel-drawer */}

      {/* ── Recruiter Outreach Email Composer ── */}
      <SendRecruiterEmailModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        recipientEmail={form.hrEmail}
        onRecipientEmailChange={(email) => setForm(p => ({ ...p, hrEmail: email }))}
        role={form.role}
        companyName={form.companyName}
        technologies={form.technologies}
        experience={form.experience}
        jdText={jdText}
        jobUrl={form.jobUrl}
        onEmailSent={() => {
          setForm(p => ({
            ...p,
            followUpCount: String((parseInt(p.followUpCount, 10) || 0) + 1),
          }));
        }}
      />
    </div>
  );
}
