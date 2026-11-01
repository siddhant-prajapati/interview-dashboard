import React, { useState, useEffect } from 'react';
import {
  X, Zap, ExternalLink, Sparkles, FileText, Send, Mail,
  Briefcase, Building2, Link, Calendar, DollarSign,
  ChevronDown, CheckSquare, Square, Info, Plus, CheckCircle,
  CheckCheck
} from 'lucide-react';
import { jobApplicationsApi } from '../../api/jobApplicationsApi';
import { platformsApi } from '../../api/platformsApi';
import { aiApi } from '../../api/aiApi';
import { DEFAULT_USER_ID, JobType, ApplicationStatus, Platform } from '../../types';
import SendRecruiterEmailModal from './SendRecruiterEmailModal';
import { CompanyAutocomplete } from '../common/CompanyAutocomplete';

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

interface ApplicationDraft {
  id: string;
  jdText: string;
  summarizing: boolean;
  submitting: boolean;
  error: string | null;
  aiSummary: string | null;
  isCreated: boolean;
  createdId?: number;
  form: {
    role: string;
    companyName: string;
    hrEmail: string;
    location: string;
    platformId: string;
    jobType: JobType;
    experience: string;
    expectedSalary: string;
    postingDate: string;
    applyDate: string;
    status: ApplicationStatus;
    followUpCount: string;
    jobUrl: string;
    technologies: string;
    about: string;
    portfolioShared: boolean;
    linkedInProfileShared: boolean;
  };
}

const createDefaultDraft = (id: string, defaultPlatformId: string = ''): ApplicationDraft => {
  const todayStr = new Date().toISOString().split('T')[0];
  return {
    id,
    jdText: '',
    summarizing: false,
    submitting: false,
    error: null,
    aiSummary: null,
    isCreated: false,
    form: {
      role: '',
      companyName: '',
      hrEmail: '',
      location: 'India',
      platformId: defaultPlatformId,
      jobType: 'REMOTE',
      experience: '2.0',
      expectedSalary: '₹12 LPA',
      postingDate: todayStr,
      applyDate: todayStr,
      status: 'APPLIED',
      followUpCount: '0',
      jobUrl: '',
      technologies: 'Java 21, Spring Boot, MySQL',
      about: '',
      portfolioShared: true,
      linkedInProfileShared: true,
    },
  };
};

export default function BulkApplyModal({ isOpen, onClose, onSuccess }: BulkApplyModalProps) {
  const [applications, setApplications] = useState<ApplicationDraft[]>(() => [createDefaultDraft('app-1')]);
  const [activeAppId, setActiveAppId] = useState<string>('app-1');
  const [userPlatforms, setUserPlatforms] = useState<Platform[]>([]);
  const [platformsLoading, setPlatformsLoading] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [creatingAll, setCreatingAll] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchPlatforms = async () => {
      setPlatformsLoading(true);
      try {
        const platforms = await platformsApi.getByUserId(DEFAULT_USER_ID);
        setUserPlatforms(platforms);
        if (platforms.length > 0) {
          const firstPlatId = String(platforms[0].id);
          setApplications(prev => prev.map(app => (
            !app.form.platformId ? { ...app, form: { ...app.form, platformId: firstPlatId } } : app
          )));
        }
      } catch { /* silent */ } finally {
        setPlatformsLoading(false);
      }
    };
    fetchPlatforms();
  }, [isOpen]);

  if (!isOpen) return null;

  // Active application accessor
  const activeApp = applications.find(a => a.id === activeAppId) || applications[0] || createDefaultDraft('app-1');

  const updateActiveApp = (updater: Partial<ApplicationDraft>) => {
    setApplications(prev => prev.map(app => {
      if (app.id !== activeApp.id) return app;
      return { ...app, ...updater };
    }));
  };

  const updateActiveForm = (formFields: Partial<ApplicationDraft['form']>) => {
    setApplications(prev => prev.map(app => {
      if (app.id !== activeApp.id) return app;
      return { ...app, form: { ...app.form, ...formFields } };
    }));
  };

  const handleLaunchAll = () => {
    PLATFORMS.forEach(p => window.open(p.url, '_blank', 'noopener,noreferrer'));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, type, value } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    updateActiveForm({ [name]: type === 'checkbox' ? checked : value });
  };

  const handleAddApplication = () => {
    const newId = 'app-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const defaultPlatformId = userPlatforms.length > 0 ? String(userPlatforms[0].id) : '';
    const newDraft = createDefaultDraft(newId, defaultPlatformId);
    setApplications(prev => [...prev, newDraft]);
    setActiveAppId(newId);
  };

  const handleRemoveApplication = (idToRemove: string) => {
    if (applications.length <= 1) return;
    setApplications(prev => {
      const filtered = prev.filter(a => a.id !== idToRemove);
      if (activeAppId === idToRemove) {
        const nextActive = filtered[filtered.length - 1];
        if (nextActive) setActiveAppId(nextActive.id);
      }
      return filtered;
    });
  };

  /** Call the backend LLM service to extract structured fields from the JD asynchronously */
  const handleSummarize = async () => {
    const targetApp = activeApp;
    if (!targetApp || !targetApp.jdText.trim()) return;
    const targetId = targetApp.id;
    const textToParse = targetApp.jdText;

    // Set summarizing for THIS application only
    setApplications(prev => prev.map(a => a.id === targetId ? {
      ...a,
      summarizing: true,
      error: null,
      aiSummary: null
    } : a));

    try {
      const parsed = await aiApi.parseJobDescription(textToParse);

      // Regex fallback to guarantee any career/recruiter email mentioned in JD is captured
      const emailMatch = textToParse.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const extractedEmail = parsed.hrEmail || (emailMatch ? emailMatch[0] : '');

      setApplications(prev => prev.map(a => {
        if (a.id !== targetId) return a;
        return {
          ...a,
          summarizing: false,
          aiSummary: parsed.summary || 'Job description parsed successfully.',
          form: {
            ...a.form,
            role:           parsed.role          || a.form.role,
            companyName:    parsed.companyName   || a.form.companyName,
            hrEmail:        extractedEmail       || a.form.hrEmail,
            location:       parsed.location      || a.form.location,
            technologies:   parsed.technologies  || a.form.technologies,
            expectedSalary: parsed.expectedSalary || a.form.expectedSalary,
            experience:     parsed.experience != null ? String(parsed.experience) : a.form.experience,
            jobType:        (parsed.jobType as JobType) || a.form.jobType,
            about:          parsed.about         || a.form.about,
            jobUrl:         parsed.jobUrl        || a.form.jobUrl,
          }
        };
      }));
    } catch (err: any) {
      setApplications(prev => prev.map(a => a.id === targetId ? {
        ...a,
        summarizing: false,
        error: 'AI parsing failed: ' + (err.message || 'Unknown error')
      } : a));
    }
  };

  const handleCreate = async () => {
    if (!activeApp) return;
    if (!activeApp.form.role.trim() || !activeApp.form.companyName.trim()) {
      updateActiveApp({ error: 'Please fill in Target Role and Company Name before creating.' });
      return;
    }

    const targetId = activeApp.id;
    updateActiveApp({ submitting: true, error: null });

    try {
      const selectedPlatform = userPlatforms.find(p => String(p.id) === activeApp.form.platformId);
      const platformId = selectedPlatform?.id ? Number(selectedPlatform.id) : undefined;
      const platformNested = !platformId
        ? { name: 'Other', userId: DEFAULT_USER_ID }
        : undefined;

      const payload = {
        role:                  activeApp.form.role.trim(),
        platformId:            platformId,
        platformNested:        platformNested,
        jobType:               activeApp.form.jobType,
        experience:            parseFloat(activeApp.form.experience) || 0,
        expectedSalary:        activeApp.form.expectedSalary.trim(),
        postingDate:           activeApp.form.postingDate || activeApp.form.applyDate,
        applyDate:             activeApp.form.applyDate,
        status:                activeApp.form.status,
        about:                 activeApp.form.about.trim(),
        jobUrl:                activeApp.form.jobUrl.trim(),
        followUpCount:         parseInt(activeApp.form.followUpCount, 10) || 0,
        portfolioShared:       Boolean(activeApp.form.portfolioShared),
        linkedInProfileShared: Boolean(activeApp.form.linkedInProfileShared),
        company: {
          name:           activeApp.form.companyName.trim(),
          location:       activeApp.form.location.trim() || 'Remote',
          allowedJobType: [activeApp.form.jobType],
          technologyTest: true,
          email:          activeApp.form.hrEmail.trim() || undefined,
        },
        resume: {
          resumeName:   'Primary_Resume.pdf',
          documentPath: '/resumes/Primary_Resume.pdf',
        },
        technologys: activeApp.form.technologies
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)
          .map(name => ({ name, type: 'LANGUAGE' })),
      };

      const result = await jobApplicationsApi.createComposite(payload);
      if (onSuccess) onSuccess(result);

      setApplications(prev => prev.map(a => a.id === targetId ? {
        ...a,
        submitting: false,
        isCreated: true,
        createdId: result?.id ? Number(result.id) : undefined,
      } : a));

      const uncreatedRemaining = applications.filter(a => a.id !== targetId && !a.isCreated);
      if (uncreatedRemaining.length > 0) {
        setToastMessage(`✓ Application for "${activeApp.form.companyName}" created!`);
        setTimeout(() => setToastMessage(null), 3500);
      } else {
        setToastMessage(`✓ Application for "${activeApp.form.companyName}" created!`);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      updateActiveApp({
        submitting: false,
        error: err.message || 'Failed to create job application',
      });
    }
  };

  const readyUncreatedApps = applications.filter(
    a => !a.isCreated && a.form.role.trim() && a.form.companyName.trim()
  );

  const handleCreateAll = async () => {
    if (readyUncreatedApps.length === 0 || creatingAll) return;
    setCreatingAll(true);

    for (const app of readyUncreatedApps) {
      try {
        const selectedPlatform = userPlatforms.find(p => String(p.id) === app.form.platformId);
        const platformId = selectedPlatform?.id ? Number(selectedPlatform.id) : undefined;
        const platformNested = !platformId
          ? { name: 'Other', userId: DEFAULT_USER_ID }
          : undefined;

        const payload = {
          role:                  app.form.role.trim(),
          platformId:            platformId,
          platformNested:        platformNested,
          jobType:               app.form.jobType,
          experience:            parseFloat(app.form.experience) || 0,
          expectedSalary:        app.form.expectedSalary.trim(),
          postingDate:           app.form.postingDate || app.form.applyDate,
          applyDate:             app.form.applyDate,
          status:                app.form.status,
          about:                 app.form.about.trim(),
          jobUrl:                app.form.jobUrl.trim(),
          followUpCount:         parseInt(app.form.followUpCount, 10) || 0,
          portfolioShared:       Boolean(app.form.portfolioShared),
          linkedInProfileShared: Boolean(app.form.linkedInProfileShared),
          company: {
            name:           app.form.companyName.trim(),
            location:       app.form.location.trim() || 'Remote',
            allowedJobType: [app.form.jobType],
            technologyTest: true,
            email:          app.form.hrEmail.trim() || undefined,
          },
          resume: {
            resumeName:   'Primary_Resume.pdf',
            documentPath: '/resumes/Primary_Resume.pdf',
          },
          technologys: app.form.technologies
            .split(',')
            .map(t => t.trim())
            .filter(Boolean)
            .map(name => ({ name, type: 'LANGUAGE' })),
        };

        const result = await jobApplicationsApi.createComposite(payload);
        if (onSuccess) onSuccess(result);

        setApplications(prev => prev.map(a => a.id === app.id ? {
          ...a,
          isCreated: true,
          createdId: result?.id ? Number(result.id) : undefined,
        } : a));
      } catch (err: any) {
        setApplications(prev => prev.map(a => a.id === app.id ? { ...a, error: err.message || 'Creation failed' } : a));
      }
    }

    setCreatingAll(false);
    setToastMessage(`✓ Created all ${readyUncreatedApps.length} ready applications!`);
    setTimeout(() => {
      onClose();
    }, 1500);
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
            {applications.length > 1 && (
              <span className="bulk-panel-badge" style={{ background: '#EDE9FE', color: '#6D28D9' }}>
                {applications.length} Applications
              </span>
            )}
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

        {/* ── MULTI-APPLICATION TAB BAR ─────────────── */}
        <div className="bulk-tabs-bar">
          <div className="bulk-tabs-scroll">
            {applications.map((app, index) => {
              const isActive = app.id === activeApp.id;
              const title = (app.form.role && app.form.companyName)
                ? `${app.form.role} @ ${app.form.companyName}`
                : app.form.role
                  ? app.form.role
                  : `Application #${index + 1}`;

              return (
                <div
                  key={app.id}
                  className={`bulk-tab ${isActive ? 'bulk-tab--active' : ''} ${app.isCreated ? 'bulk-tab--created' : ''}`}
                  onClick={() => setActiveAppId(app.id)}
                >
                  <span className="bulk-tab-num">#{index + 1}</span>
                  <span className="bulk-tab-title" title={title}>{title}</span>

                  {/* Status badge */}
                  {app.summarizing ? (
                    <span className="bulk-tab-status-pill bulk-tab-status-pill--parsing">
                      <span className="bulk-tab-dot-pulse" />
                      Parsing JD…
                    </span>
                  ) : app.isCreated ? (
                    <span className="bulk-tab-status-pill bulk-tab-status-pill--created">
                      <CheckCircle size={10} /> Created
                    </span>
                  ) : app.aiSummary ? (
                    <span className="bulk-tab-status-pill bulk-tab-status-pill--ready">
                      ✓ Ready
                    </span>
                  ) : app.error ? (
                    <span className="bulk-tab-status-pill bulk-tab-status-pill--error">
                      Error
                    </span>
                  ) : null}

                  {/* Close tab button */}
                  {applications.length > 1 && (
                    <button
                      type="button"
                      className="bulk-tab-close"
                      title="Discard this application draft"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveApplication(app.id);
                      }}
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bulk-tabs-actions">
            {readyUncreatedApps.length > 1 && (
              <button
                type="button"
                className="bulk-create-all-btn"
                onClick={handleCreateAll}
                disabled={creatingAll}
                title="Create all ready applications at once"
              >
                {creatingAll ? (
                  <><span className="bulk-spinner" /> Creating {readyUncreatedApps.length}…</>
                ) : (
                  <><CheckCheck size={13} /> Create All Ready ({readyUncreatedApps.length})</>
                )}
              </button>
            )}

            <button
              type="button"
              className="bulk-add-app-btn"
              onClick={handleAddApplication}
              title="Add another application to parse and apply"
            >
              <Plus size={13} />
              <span>Add another application</span>
            </button>
          </div>
        </div>

        {/* ── TOAST NOTIFICATION BANNER ─────────────── */}
        {toastMessage && (
          <div className="bulk-toast-banner">
            <span>{toastMessage}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065F46' }}
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* ── TWO-COLUMN BODY ─────────────────────────── */}
        <div className="bulk-panel-body">

          {/* ── LEFT: JD Input ──────────────────────── */}
          <div className="bulk-left-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="bulk-section-label">
                <FileText size={13} />
                Paste Job Description
              </div>
              {activeApp.summarizing && (
                <span style={{ fontSize: '11px', color: '#7C3AED', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="bulk-tab-dot-pulse" />
                  Background async parsing…
                </span>
              )}
            </div>

            <textarea
              className="bulk-jd-textarea"
              placeholder={"Paste the full job description here…\n\nRole, company, salary, skills, requirements — the more detail, the better the auto-fill.\n\nTip: You can add another application while this one parses!"}
              value={activeApp.jdText}
              onChange={e => {
                const val = e.target.value;
                setApplications(prev => prev.map(a => a.id === activeApp.id ? { ...a, jdText: val, aiSummary: null } : a));
              }}
            />

            <span className="bulk-jd-meta">
              {activeApp.jdText.length > 0 ? `${activeApp.jdText.length.toLocaleString()} characters` : 'No content yet'}
            </span>

            {activeApp.error && (
              <div className="modal-error-alert" style={{ margin: '0' }}>
                {activeApp.error}
              </div>
            )}

            {activeApp.aiSummary && (
              <div className="bulk-ai-summary-box">
                <Info size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>{activeApp.aiSummary}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bulk-actions-container">
              <div className="bulk-action-row">
                <button
                  type="button"
                  className="bulk-summarize-btn"
                  onClick={handleSummarize}
                  disabled={activeApp.summarizing || !activeApp.jdText.trim()}
                >
                  {activeApp.summarizing
                    ? <><span className="bulk-spinner" />Analyzing JD…</>
                    : <><Sparkles size={13} />Summarize &amp; Prefill</>
                  }
                </button>

                <button
                  type="button"
                  className="bulk-create-btn"
                  onClick={handleCreate}
                  disabled={activeApp.submitting || activeApp.isCreated}
                  style={activeApp.isCreated ? { background: '#059669', opacity: 0.9 } : undefined}
                >
                  {activeApp.submitting ? (
                    <><span className="bulk-spinner bulk-spinner--white" />Creating…</>
                  ) : activeApp.isCreated ? (
                    <><CheckCircle size={13} />Created ✓</>
                  ) : (
                    <><Send size={13} />Create Application</>
                  )}
                </button>
              </div>

              {/* Send Email button positioned below for clean, unclipped UI layout */}
              <button
                type="button"
                className="bulk-email-btn"
                onClick={() => setEmailModalOpen(true)}
                title="Generate alignment email preview and send outreach email to recruiter / HR"
              >
                <Mail size={14} />
                Send Email
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
              {activeApp.isCreated && (
                <span className="bulk-label-tag" style={{ background: '#ECFDF5', color: '#047857', border: '1px solid #6EE7B7' }}>
                  ✓ Created in System
                </span>
              )}
            </div>

            <div className="bulk-preview-form">

              {/* Role */}
              <div className="bulk-form-group">
                <label className="bulk-form-label"><Briefcase size={10} /> Target Role *</label>
                <input
                  className="bulk-form-input"
                  type="text"
                  name="role"
                  value={activeApp.form.role}
                  onChange={handleChange}
                  placeholder="e.g. Senior Java Engineer"
                />
              </div>

              {/* Company + Location */}
              <div className="bulk-form-row">
                <div className="bulk-form-group">
                  <label className="bulk-form-label"><Building2 size={10} /> Company *</label>
                  <CompanyAutocomplete
                    name="companyName"
                    value={activeApp.form.companyName}
                    onChange={(name, company) => {
                      updateActiveForm({
                        companyName: name,
                        location: company?.location && !activeApp.form.location ? company.location : activeApp.form.location,
                      });
                    }}
                    className="bulk-form-input"
                    placeholder="e.g. Microsoft, Google, SmartBear..."
                    required
                  />
                </div>
                <div className="bulk-form-group">
                  <label className="bulk-form-label">Location</label>
                  <input
                    className="bulk-form-input"
                    type="text"
                    name="location"
                    value={activeApp.form.location}
                    onChange={handleChange}
                    placeholder="Remote / India"
                  />
                </div>
              </div>

              {/* HR / Career Email + Job Listing URL */}
              <div className="bulk-form-row">
                <div className="bulk-form-group" style={{ flex: 1.15 }}>
                  <label className="bulk-form-label">
                    <Mail size={10} /> HR or Career Email
                    {activeApp.form.hrEmail && <span className="bulk-label-tag">Recruiter Contact</span>}
                  </label>
                  <div className="bulk-input-with-action">
                    <input
                      className="bulk-form-input"
                      type="email"
                      name="hrEmail"
                      value={activeApp.form.hrEmail}
                      onChange={handleChange}
                      placeholder="e.g. careers@company.com or hr@..."
                    />
                    {activeApp.form.hrEmail && (
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
                    value={activeApp.form.jobUrl}
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
                    <select
                      className="bulk-form-select"
                      name="platformId"
                      value={activeApp.form.platformId}
                      onChange={handleChange}
                      disabled={platformsLoading}
                    >
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
                    <select
                      className="bulk-form-select"
                      name="jobType"
                      value={activeApp.form.jobType}
                      onChange={handleChange}
                    >
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
                  <input
                    className="bulk-form-input"
                    type="number"
                    step="0.5"
                    min="0"
                    name="experience"
                    value={activeApp.form.experience}
                    onChange={handleChange}
                  />
                </div>
                <div className="bulk-form-group">
                  <label className="bulk-form-label"><DollarSign size={10} /> Expected Salary</label>
                  <input
                    className="bulk-form-input"
                    type="text"
                    name="expectedSalary"
                    value={activeApp.form.expectedSalary}
                    onChange={handleChange}
                    placeholder="₹12 LPA"
                  />
                </div>
              </div>

              {/* Posting Date + Apply Date */}
              <div className="bulk-form-row">
                <div className="bulk-form-group">
                  <label className="bulk-form-label"><Calendar size={10} /> Posting Date</label>
                  <input
                    className="bulk-form-input"
                    type="date"
                    name="postingDate"
                    value={activeApp.form.postingDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="bulk-form-group">
                  <label className="bulk-form-label"><Calendar size={10} /> Apply Date</label>
                  <input
                    className="bulk-form-input"
                    type="date"
                    name="applyDate"
                    value={activeApp.form.applyDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Status + Follow-Up */}
              <div className="bulk-form-row">
                <div className="bulk-form-group">
                  <label className="bulk-form-label">Status</label>
                  <div className="bulk-select-wrap">
                    <select
                      className="bulk-form-select"
                      name="status"
                      value={activeApp.form.status}
                      onChange={handleChange}
                    >
                      {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <ChevronDown size={12} className="bulk-select-chevron" />
                  </div>
                </div>
                <div className="bulk-form-group">
                  <label className="bulk-form-label">Follow-Up Count</label>
                  <input
                    className="bulk-form-input"
                    type="number"
                    min="0"
                    name="followUpCount"
                    value={activeApp.form.followUpCount}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Technologies */}
              <div className="bulk-form-group">
                <label className="bulk-form-label">Technologies (comma-separated)</label>
                <input
                  className="bulk-form-input"
                  type="text"
                  name="technologies"
                  value={activeApp.form.technologies}
                  onChange={handleChange}
                  placeholder="Java 21, Spring Boot, MySQL"
                />
              </div>

              {/* About */}
              <div className="bulk-form-group">
                <label className="bulk-form-label">About / Job Description</label>
                <textarea
                  className="bulk-form-textarea"
                  name="about"
                  rows={4}
                  value={activeApp.form.about}
                  onChange={handleChange}
                  placeholder="Key responsibilities, tech stack, recruiter notes…"
                />
              </div>

              {/* Checkboxes */}
              <div className="bulk-checkbox-row">
                <label
                  className="bulk-checkbox-label"
                  onClick={() => updateActiveForm({ portfolioShared: !activeApp.form.portfolioShared })}
                >
                  {activeApp.form.portfolioShared
                    ? <CheckSquare size={15} color="#5932EA" />
                    : <Square size={15} color="#9CA3AF" />
                  }
                  <span>Portfolio Shared</span>
                </label>
                <label
                  className="bulk-checkbox-label"
                  onClick={() => updateActiveForm({ linkedInProfileShared: !activeApp.form.linkedInProfileShared })}
                >
                  {activeApp.form.linkedInProfileShared
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
        recipientEmail={activeApp.form.hrEmail}
        onRecipientEmailChange={(email) => updateActiveForm({ hrEmail: email })}
        role={activeApp.form.role}
        companyName={activeApp.form.companyName}
        technologies={activeApp.form.technologies}
        experience={activeApp.form.experience}
        jdText={activeApp.jdText}
        jobUrl={activeApp.form.jobUrl}
        jobApplicationId={activeApp.createdId}
        onEmailSent={() => {
          updateActiveForm({
            followUpCount: String((parseInt(activeApp.form.followUpCount, 10) || 0) + 1),
          });
        }}
      />
    </div>
  );
}
