import React, { useState } from 'react';
import { X, Send, Copy, Check, Clock, AlertCircle } from 'lucide-react';
import { JobApplication } from '../../types';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: JobApplication[];
  onUpdateApplication?: (app: JobApplication) => void;
}

export default function FollowUpModal({
  isOpen,
  onClose,
  applications,
}: FollowUpModalProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  if (!isOpen) return null;

  // Filter applications that are APPLIED or UNDER_REVIEW
  const activeApps = applications.filter((a) =>
    ['APPLIED', 'UNDER_REVIEW', 'SAVED'].includes(a.status as string)
  );

  const getTemplate = (app: JobApplication) => {
    const comp = app.companyName || (typeof app.company === 'object' ? app.company?.name : 'the team') || 'your company';
    return `Hi Hiring Team,

I recently applied for the ${app.role} role at ${comp}. I am very enthusiastic about this opportunity and would love to check on the status of my application. Please let me know if you need any additional portfolio or background information.

Best regards!`;
  };

  const handleCopy = (app: JobApplication) => {
    const text = getTemplate(app);
    navigator.clipboard.writeText(text);
    setCopiedId(app.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div 
        className="modal-box-card" 
        style={{ maxWidth: '650px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="modal-title-text">Send Follow Up</span>
            <span className="tag-pill" style={{ backgroundColor: '#EDE9FE', color: '#5932EA' }}>
              {activeApps.length} Active Applications
            </span>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="modal-close-btn"
            aria-label="Close"
          >
            <X size={18} color="#7E7E7E" />
          </button>
        </div>

        <div className="modal-body-content">
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '18px' }}>
            Following up on submitted applications boosts response rates by over 40%. Copy recruiter follow-up templates below or open their platform to send a message.
          </p>

          {activeApps.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF' }}>
              <AlertCircle size={32} style={{ margin: '0 auto 10px auto', display: 'block', color: '#9CA3AF' }} />
              No pending applications requiring follow up right now. Great job staying on top of your pipeline!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeApps.slice(0, 8).map((app) => (
                <div key={app.id} className="followup-card-item">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                        {app.role}
                      </span>
                      <span className="tag-pill">
                        {app.companyName || (typeof app.company === 'object' ? app.company?.name : 'Company')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '12px', color: '#6B7280' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} />
                        <span>Applied: {app.applyDate || 'Recent'}</span>
                      </div>
                      <span>•</span>
                      <span>Follow-ups: {app.followUpCount || 0}</span>
                      <span>•</span>
                      <span>Platform: {typeof app.platform === 'string' ? app.platform : app.platformName || 'Direct'}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleCopy(app)}
                      className="filter-tab-btn"
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: copiedId === app.id ? '#ECFDF5' : '#FFFFFF',
                        color: copiedId === app.id ? '#059669' : '#374151',
                        border: copiedId === app.id ? '1px solid #10B981' : '1px solid #E5E7EB',
                      }}
                      title="Copy professional follow-up note to clipboard"
                    >
                      {copiedId === app.id ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                      <span>{copiedId === app.id ? 'Copied Note!' : 'Copy Template'}</span>
                    </button>

                    {app.jobUrl && (
                      <a
                        href={app.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="filter-tab-btn"
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                        title="Open Job Listing"
                      >
                        <Send size={13} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
