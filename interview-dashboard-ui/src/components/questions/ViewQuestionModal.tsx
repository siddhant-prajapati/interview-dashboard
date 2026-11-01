import React from 'react';
import Modal from '../common/Modal';
import { HelpCircle, Calendar, Tag, Edit3, Hash, Layers } from 'lucide-react';
import { Question, Technology } from '../../types';

export interface ViewQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  technologies?: Technology[];
  onEdit?: (question: Question) => void;
}

export default function ViewQuestionModal({
  isOpen,
  onClose,
  question,
  technologies = [],
  onEdit,
}: ViewQuestionModalProps) {
  if (!question) return null;

  const techObj = technologies.find((t) => t.id === (question as any).technologyId);
  const techName = question.technologyName || question.technology?.name || techObj?.name || 'General';
  const techType = techObj?.type || question.technology?.type || 'Topic';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Interview Question Details"
    >
      <div className="application-view-container">
        {/* Header Hero */}
        <div className="application-view-hero">
          <div className="application-view-avatar" style={{ backgroundColor: '#5932EA' }}>
            <HelpCircle size={24} color="#FFFFFF" />
          </div>
          <div className="application-view-header-info">
            <div className="application-view-title-row">
              <span className="tech-pill-tag" style={{ fontSize: '13px', padding: '4px 10px' }}>
                <Tag size={13} />
                {techName}
              </span>
              <span className="stage-badge-pill">{techType}</span>
            </div>
            <p className="application-view-company" style={{ marginTop: '4px' }}>
              ID: #{question.id}
            </p>
          </div>
        </div>

        {/* Full Question Text */}
        <div style={{ marginTop: '16px' }}>
          <label className="modal-form-label" style={{ marginBottom: '8px', display: 'block', color: '#4B5563' }}>
            Full Question
          </label>
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              fontSize: '15px',
              lineHeight: '1.65',
              color: '#1E293B',
              fontWeight: 500,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {question.question}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="application-view-grid" style={{ marginTop: '16px' }}>
          <div className="application-view-meta-item">
            <span className="application-view-meta-label">Technology Domain</span>
            <div className="application-view-meta-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} color="#5932EA" />
              <span>{techName}</span>
            </div>
          </div>

          <div className="application-view-meta-item">
            <span className="application-view-meta-label">Domain Classification</span>
            <div className="application-view-meta-value">
              <span className="stage-badge-pill">{techType}</span>
            </div>
          </div>

          <div className="application-view-meta-item">
            <span className="application-view-meta-label">Date Listed</span>
            <div className="application-view-meta-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="#5932EA" />
              <span>{question.listedDate || 'Recent'}</span>
            </div>
          </div>

          <div className="application-view-meta-item">
            <span className="application-view-meta-label">Reference ID</span>
            <div className="application-view-meta-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Hash size={14} color="#9197B3" />
              <span>{question.id}</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="modal-footer-actions" style={{ marginTop: '24px' }}>
          <button type="button" onClick={onClose} className="modal-cancel-btn">
            Close
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(question);
              }}
              className="modal-submit-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Edit3 size={15} />
              <span>Edit Question</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
