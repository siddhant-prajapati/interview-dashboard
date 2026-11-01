import React, { useState, useEffect } from 'react';
import {
  X, Mail, Sparkles, Send, Copy, Check, ExternalLink,
  AlertCircle, CheckCircle2, RotateCcw
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { emailApi } from '../../api/emailApi';
import { aiApi } from '../../api/aiApi';

interface SendRecruiterEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail: string;
  onRecipientEmailChange?: (email: string) => void;
  role: string;
  companyName: string;
  technologies: string;
  experience: string;
  jdText: string;
  jobUrl?: string;
  jobApplicationId?: number;
  onEmailSent?: () => void;
}

export default function SendRecruiterEmailModal({
  isOpen,
  onClose,
  recipientEmail,
  onRecipientEmailChange,
  role,
  companyName,
  technologies,
  experience,
  jdText,
  jobUrl,
  jobApplicationId,
  onEmailSent,
}: SendRecruiterEmailModalProps) {
  const { currentUser } = useUser();

  const [to, setTo] = useState(recipientEmail || '');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const getCleanTemplate = () => {
    const candidateName = currentUser?.name || 'Siddhant Prajapati';
    const candidateEmail = currentUser?.email || 'sidkp.official@gmail.com';
    const targetRole = role.trim() || 'Software Engineer';
    const targetCompany = companyName.trim() || 'your company';
    const techStack = technologies.trim() || 'Java 21, Spring Boot, MySQL, REST APIs';
    const portfolio = currentUser?.portfolioLink || 'https://siddhant-portfolio-k3vf.onrender.com/';
    const linkedin = currentUser?.linkedInLink || 'https://www.linkedin.com/in/siddhant-prajapati-79680b233';
    const github = currentUser?.githubLink || 'https://github.com/siddhant-prajapati';

    return `Dear Hiring Team at ${targetCompany},

I am writing to express my strong interest in the ${targetRole} opportunity. With over ${experience || '2.0'} years of hands-on engineering experience in ${techStack}, I have designed and delivered scalable backend architectures and high-throughput web applications.

Key Highlights of My Experience:
• Core Technologies: ${techStack}
• Portfolio: ${portfolio}
• LinkedIn: ${linkedin}
• GitHub: ${github}

I have attached my resume for your review and would welcome the chance to briefly connect and explore how my experience can contribute to ${targetCompany}'s engineering goals.

Thank you for your time and consideration.

Best regards,
${candidateName}
${candidateEmail}`;
  };

  const autoGenerateEmailPreview = async () => {
    setIsAiGenerating(true);
    setStatusMsg(null);
    try {
      const generated = await aiApi.generateAlignmentEmail({
        userId: currentUser?.id,
        jobApplicationId: jobApplicationId,
        role: role.trim() || 'Software Engineer',
        companyName: companyName.trim() || 'Hiring Team',
        technologies: technologies.trim() || 'Java 21, Spring Boot, MySQL',
        jdText: jdText || '',
      });

      if (generated) {
        if (generated.subject) {
          setSubject(generated.subject);
        }
        if (generated.body) {
          setBody(generated.body);
        }
      }
    } catch (err: any) {
      console.warn('AI email preview fallback:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setStatusMsg(null);
      return;
    }
    const currentTo = recipientEmail || '';
    setTo(currentTo);
    const targetRole = role.trim() || 'Software Engineer';
    const candidateName = currentUser?.name || 'Siddhant Prajapati';
    setSubject(`Application for ${targetRole} - ${candidateName}`);
    setBody(getCleanTemplate());
    setStatusMsg(null);

    // Auto-generate preview on modal open
    autoGenerateEmailPreview();
  }, [isOpen, recipientEmail, role, companyName, technologies, experience]);

  if (!isOpen) return null;

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTo(e.target.value);
    if (onRecipientEmailChange) {
      onRecipientEmailChange(e.target.value);
    }
  };

  const handleResetTemplate = () => {
    setBody(getCleanTemplate());
    const targetRole = role.trim() || 'Software Engineer';
    const candidateName = currentUser?.name || 'Siddhant Prajapati';
    setSubject(`Application for ${targetRole} - ${candidateName}`);
    setStatusMsg(null);
  };

  const handleAiPolish = async () => {
    await autoGenerateEmailPreview();
  };

  const handleSendEmail = async () => {
    if (!to.trim()) {
      setStatusMsg({ type: 'error', text: 'Please specify an HR or Career email address (To).' });
      return;
    }
    if (!subject.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter an email subject line.' });
      return;
    }
    if (!body.trim()) {
      setStatusMsg({ type: 'error', text: 'Email body cannot be empty.' });
      return;
    }

    setIsSending(true);
    setStatusMsg(null);

    try {
      const res = await emailApi.sendEmail({
        to: to.trim(),
        subject: subject.trim(),
        body: body.trim(),
        candidateName: currentUser?.name || 'Siddhant Prajapati',
        candidateEmail: currentUser?.email || 'sidkp.official@gmail.com',
        companyName: companyName.trim(),
        role: role.trim(),
      });

      setStatusMsg({
        type: 'success',
        text: res.message || `Email dispatched successfully to ${to.trim()}!`,
      });

      if (onEmailSent) {
        onEmailSent();
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'Failed to dispatch email. Please verify connection and retry.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = () => {
    const fullText = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mailtoHref = `mailto:${encodeURIComponent(to.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div className="email-modal-overlay" onClick={onClose}>
      <div className="email-modal-card" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="email-modal-header">
          <div className="email-modal-title-group">
            <div className="email-modal-icon">
              <Mail size={16} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                Send Recruiter Outreach Email
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                Direct cold outreach for <strong style={{ color: '#374151' }}>{role || 'Role'}</strong> at <strong style={{ color: '#374151' }}>{companyName || 'Company'}</strong>
              </div>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} color="#7E7E7E" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="email-modal-body">

          {/* AI Generating Indicator */}
          {isAiGenerating && (
            <div className="email-generating-banner">
              <Sparkles size={14} className="email-sparkle-spin" />
              <span>Generating tailored alignment email from job description…</span>
            </div>
          )}

          {/* Feedback status */}
          {statusMsg && (
            <div className={`email-status-banner email-status-banner--${statusMsg.type}`}>
              {statusMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Recipient Field */}
          <div className="bulk-form-group">
            <label className="bulk-form-label">
              <Mail size={10} /> Recipient Email (HR / Careers) *
            </label>
            <input
              className="bulk-form-input"
              type="email"
              value={to}
              onChange={handleToChange}
              placeholder="e.g. careers@company.com or hr@company.com"
              autoFocus={!to}
            />
          </div>

          {/* Subject Field */}
          <div className="bulk-form-group">
            <label className="bulk-form-label">Subject Line *</label>
            <input
              className="bulk-form-input"
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Application for Software Engineer - Candidate Name"
            />
          </div>

          {/* Email Body & AI generator action */}
          <div className="bulk-form-group">
            <div className="email-body-actions">
              <label className="bulk-form-label" style={{ margin: 0 }}>
                Email Message Body *
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="email-ai-polish-btn"
                  onClick={handleAiPolish}
                  disabled={isAiGenerating}
                  title="Tailor this email based on the Job Description with AI"
                >
                  <Sparkles size={11} />
                  {isAiGenerating ? 'Crafting with AI…' : 'AI Polish & Tailor'}
                </button>

                <button
                  type="button"
                  onClick={handleResetTemplate}
                  className="filter-tab-btn"
                  style={{ padding: '3px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="Reset to clean default template"
                >
                  <RotateCcw size={11} />
                  Reset
                </button>
              </div>
            </div>

            <textarea
              className="bulk-form-textarea"
              rows={9}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write or customize your application email..."
              style={{ fontSize: '12.5px', lineHeight: 1.6 }}
            />
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="email-modal-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleCopy}
              className="filter-tab-btn"
              style={{
                padding: '7px 12px',
                fontSize: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: copied ? '#ECFDF5' : '#FFFFFF',
                color: copied ? '#059669' : '#374151',
                borderColor: copied ? '#10B981' : '#E5E7EB',
              }}
              title="Copy email text to clipboard"
            >
              {copied ? <Check size={13} color="#059669" /> : <Copy size={13} />}
              <span>{copied ? 'Copied Note' : 'Copy Text'}</span>
            </button>

            {to.trim() && (
              <a
                href={mailtoHref}
                className="email-mailto-btn"
                title="Open in your default email client (Outlook, Gmail, Apple Mail)"
              >
                <ExternalLink size={12} />
                Open in Email App
              </a>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              Close
            </button>

            <button
              type="button"
              className="email-send-submit-btn"
              onClick={handleSendEmail}
              disabled={isSending || !to.trim()}
            >
              {isSending ? (
                <>
                  <span className="bulk-spinner bulk-spinner--white" />
                  Sending…
                </>
              ) : (
                <>
                  <Send size={13} />
                  Send Email
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
