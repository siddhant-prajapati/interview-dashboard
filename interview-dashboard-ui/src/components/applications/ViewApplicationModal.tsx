import React from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import {
  Building2, MapPin, Briefcase, DollarSign, Calendar,
  Globe, ExternalLink, Edit3, Award, FileText, CheckCircle2,
  XCircle, Clock, Link as LinkIcon
} from 'lucide-react';
import { JobApplication, Technology } from '../../types';

export interface ViewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: JobApplication | null;
  onEdit: (application: JobApplication) => void;
}

export default function ViewApplicationModal({
  isOpen,
  onClose,
  application,
  onEdit,
}: ViewApplicationModalProps) {
  if (!application) return null;

  const companyName =
    application.companyName || application.company?.name || 'Company';
  const location = application.company?.location || 'Remote';
  const platformName =
    typeof application.platform === 'object' && application.platform
      ? application.platform.name
      : (application.platform as string) || application.platformName || 'Direct';

  const techList = (application.technologies || []).map((t) =>
    typeof t === 'string' ? t : (t as Technology).name
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Job Application Details"
    >
      <div className="application-view-container">
        {/* Hero Card */}
        <div className="application-view-hero">
          <div className="application-view-avatar">
            <Building2 size={24} color="#FFFFFF" />
          </div>
          <div className="application-view-header-info">
            <div className="application-view-title-row">
              <h3 className="application-view-role">{application.role}</h3>
              <StatusBadge status={application.status} />
            </div>
            <div className="application-view-company-line">
              <span className="application-view-company-name">{companyName}</span>
              <span className="application-view-dot">•</span>
              <span className="application-view-location">
                <MapPin size={12} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                {location}
              </span>
            </div>
            <div className="application-view-badge-row">
              <span className="tag-pill">{application.jobType || 'REMOTE'}</span>
              <span className="policy-badge-pill">
                <Globe size={11} style={{ marginRight: 4 }} />
                {platformName}
              </span>
              {application.experience !== undefined && (
                <span className="policy-badge-pill">
                  <Award size={11} style={{ marginRight: 4 }} />
                  {application.experience} yrs exp
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="application-view-grid">
          <div className="application-view-card">
            <span className="application-view-card-label">
              <DollarSign size={13} color="#5932EA" />
              Target Compensation
            </span>
            <span className="application-view-card-value highlight-val">
              {application.expectedSalary || 'Competitive / Not Disclosed'}
            </span>
          </div>

          <div className="application-view-card">
            <span className="application-view-card-label">
              <Calendar size={13} color="#5932EA" />
              Application Date
            </span>
            <span className="application-view-card-value">
              {application.applyDate || 'Recent'}
            </span>
          </div>

          <div className="application-view-card">
            <span className="application-view-card-label">
              <Clock size={13} color="#5932EA" />
              Job Posting Date
            </span>
            <span className="application-view-card-value">
              {application.postingDate || application.applyDate || '—'}
            </span>
          </div>

          <div className="application-view-card">
            <span className="application-view-card-label">
              <Briefcase size={13} color="#5932EA" />
              Follow-Up Activity
            </span>
            <span className="application-view-card-value">
              {application.followUpCount || 0} touchpoints logged
            </span>
          </div>

          <div className="application-view-card">
            <span className="application-view-card-label">
              <FileText size={13} color="#5932EA" />
              Resume Attached
            </span>
            <span className="application-view-card-value">
              {application.resume?.resumeName || 'Primary Resume'}
            </span>
          </div>

          <div className="application-view-card">
            <span className="application-view-card-label">
              <LinkIcon size={13} color="#5932EA" />
              Outreach Assets Shared
            </span>
            <div className="application-view-share-status">
              <span className={`share-pill ${application.portfolioShared ? 'shared' : 'not-shared'}`}>
                {application.portfolioShared ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                Portfolio
              </span>
              <span className={`share-pill ${application.linkedInProfileShared ? 'shared' : 'not-shared'}`}>
                {application.linkedInProfileShared ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                LinkedIn
              </span>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        {techList.length > 0 && (
          <div className="application-view-section">
            <span className="application-view-section-title">Required Tech Stack & Skills</span>
            <div className="table-tags-wrap" style={{ marginTop: '8px' }}>
              {techList.map((tech, idx) => (
                <span key={idx} className="tech-badge-pill large-pill">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* About / Notes */}
        {application.about && (
          <div className="application-view-section">
            <span className="application-view-section-title">About the Role / Notes</span>
            <div className="application-view-notes-box">
              {application.about}
            </div>
          </div>
        )}

        {/* Job URL if present */}
        {application.jobUrl && (
          <div className="application-view-url-banner">
            <div className="application-view-url-left">
              <ExternalLink size={16} color="#5932EA" />
              <span className="application-view-url-text">{application.jobUrl}</span>
            </div>
            <a
              href={application.jobUrl}
              target="_blank"
              rel="noreferrer"
              className="application-view-url-btn"
            >
              Open Job Listing
            </a>
          </div>
        )}

        {/* Footer Actions */}
        <div className="modal-footer-actions">
          <button type="button" onClick={onClose} className="modal-cancel-btn">
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(application);
            }}
            className="modal-submit-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Edit3 size={15} />
            <span>Edit Application</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
