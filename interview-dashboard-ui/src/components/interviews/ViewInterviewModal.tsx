import React from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { Calendar, MessageSquare, AlertTriangle, Edit3, Building, Briefcase, FileText } from 'lucide-react';
import { Interview, JobApplication, Technology } from '../../types';

export interface ViewInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: Interview | null;
  applications?: JobApplication[];
  onEdit?: (interview: Interview) => void;
}

export default function ViewInterviewModal({
  isOpen,
  onClose,
  interview,
  applications = [],
  onEdit,
}: ViewInterviewModalProps) {
  if (!interview) return null;

  const app = applications.find((a) => a.id === interview.jobApplicationId);
  const companyName = app?.companyName || app?.company?.name || interview.companyName || 'Enterprise Co';
  const roleName = app?.role || interview.role || 'Software Engineer';

  const formattedDate = interview.interviewDate
    ? new Date(interview.interviewDate).toLocaleString([], {
        dateStyle: 'full',
        timeStyle: 'short',
      })
    : 'Date & Time to be decided';

  const questionsList: any[] = interview.questions || (interview as any).questionDTOs || [];
  const improvementsList: any[] = interview.requiredImprovements || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Interview Debrief — ${companyName}`}
    >
      <div className="application-view-container">
        {/* Header Hero */}
        <div className="application-view-hero">
          <div className="application-view-avatar">
            <Building size={24} color="#FFFFFF" />
          </div>
          <div className="application-view-header-info">
            <div className="application-view-title-row">
              <h2 className="application-view-role">{roleName}</h2>
              <StatusBadge status={interview.status} />
              <span className="stage-badge-pill">{interview.stage}</span>
            </div>
            <p className="application-view-company">{companyName}</p>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="application-view-grid">
          <div className="application-view-meta-item">
            <span className="application-view-meta-label">Scheduled Date & Time</span>
            <div className="application-view-meta-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="#5932EA" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="application-view-meta-item">
            <span className="application-view-meta-label">Interview Stage</span>
            <div className="application-view-meta-value">
              <span className="stage-badge-pill">{interview.stage}</span>
            </div>
          </div>

          <div className="application-view-meta-item">
            <span className="application-view-meta-label">Round Status</span>
            <div className="application-view-meta-value">
              <StatusBadge status={interview.status} />
            </div>
          </div>

          <div className="application-view-meta-item">
            <span className="application-view-meta-label">Questions Logged</span>
            <div className="application-view-meta-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={14} color="#16C098" />
              <span>{questionsList.length} Questions</span>
            </div>
          </div>
        </div>

        {/* Notes & Feedback */}
        <div className="application-view-section">
          <h4 className="application-view-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={15} color="#5932EA" />
            <span>Preparation & Debrief Notes</span>
          </h4>
          <p className="application-view-notes">
            {interview.notes || 'No specific notes entered for this interview round.'}
          </p>
        </div>

        {/* Questions Asked */}
        <div className="application-view-section">
          <h4 className="application-view-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageSquare size={15} color="#5932EA" />
            <span>Questions Asked in Round ({questionsList.length})</span>
          </h4>
          <div className="debrief-questions-list" style={{ marginTop: '8px' }}>
            {questionsList.length === 0 ? (
              <p className="debrief-empty-text">No questions logged for this round yet. Click Edit to log interview questions.</p>
            ) : (
              questionsList.map((q, idx) => (
                <div key={idx} className="interview-question-box">
                  <MessageSquare size={16} color="#5932EA" />
                  <span className="debrief-question-item-text">{q.question}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Identified Areas for Improvement */}
        <div className="application-view-section">
          <h4 className="application-view-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={15} color="#D0004B" />
            <span>Identified Skill Gaps / Areas for Improvement</span>
          </h4>
          <div className="debrief-improvements-wrap" style={{ marginTop: '8px' }}>
            {improvementsList.length === 0 ? (
              <p className="debrief-success-empty">No skill gaps identified for this round!</p>
            ) : (
              improvementsList.map((tech: Technology | string, idx: number) => {
                const techName = typeof tech === 'string' ? tech : tech.name;
                return (
                  <span key={idx} className="improvement-badge-pill">
                    <AlertTriangle size={12} color="#D0004B" />
                    {techName}
                  </span>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer-actions" style={{ marginTop: '24px' }}>
          <button type="button" onClick={onClose} className="modal-cancel-btn">
            Close
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(interview);
              }}
              className="modal-submit-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Edit3 size={15} />
              <span>Edit Interview</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
