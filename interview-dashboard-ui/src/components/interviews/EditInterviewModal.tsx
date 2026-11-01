import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { interviewsApi } from '../../api/interviewsApi';
import { Interview, JobApplication, InterviewStage, InterviewStatus } from '../../types';
import { CompanyAutocomplete } from '../common/CompanyAutocomplete';
import { Save, AlertCircle, Plus, Trash2, MessageSquare, AlertTriangle } from 'lucide-react';

export interface EditInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: Interview | null;
  applications?: JobApplication[];
  onSuccess?: (updated: Interview) => void;
}

export default function EditInterviewModal({
  isOpen,
  onClose,
  interview,
  applications = [],
  onSuccess,
}: EditInterviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    jobApplicationId: 0,
    companyName: '',
    role: '',
    stage: 'TECHNICAL' as InterviewStage,
    status: 'SCHEDULED' as InterviewStatus,
    interviewDate: '',
    notes: '',
  });

  const [questions, setQuestions] = useState<{ id?: number; question: string }[]>([]);
  const [newQuestionText, setNewQuestionText] = useState('');

  const [improvementsInput, setImprovementsInput] = useState('');

  useEffect(() => {
    if (interview) {
      const app = applications.find((a) => a.id === interview.jobApplicationId);
      const coName = app?.companyName || app?.company?.name || interview.companyName || '';
      const roleName = app?.role || interview.role || '';

      // Format ISO string to datetime-local format: YYYY-MM-DDTHH:mm
      let localDateStr = '';
      if (interview.interviewDate) {
        try {
          const d = new Date(interview.interviewDate);
          const pad = (n: number) => String(n).padStart(2, '0');
          localDateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        } catch {
          localDateStr = interview.interviewDate.slice(0, 16);
        }
      }

      setFormData({
        jobApplicationId: interview.jobApplicationId || app?.id || 0,
        companyName: coName,
        role: roleName,
        stage: interview.stage || 'TECHNICAL',
        status: interview.status || 'SCHEDULED',
        interviewDate: localDateStr,
        notes: interview.notes || '',
      });

      const initialQuestions = interview.questions || (interview as any).questionDTOs || [];
      setQuestions(initialQuestions);

      const rawImprovements = interview.requiredImprovements || [];
      const improvNames = rawImprovements.map((t: any) =>
        typeof t === 'string' ? t : t.name
      );
      setImprovementsInput(improvNames.join(', '));
      setError(null);
    }
  }, [interview, isOpen, applications]);

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    setQuestions((prev) => [...prev, { id: Date.now(), question: newQuestionText.trim() }]);
    setNewQuestionText('');
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interview || !interview.id) return;

    if (!formData.companyName.trim() || !formData.role.trim()) {
      setError('Company Name and Role are required.');
      return;
    }

    setLoading(true);
    setError(null);

    const parsedImprovements = improvementsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((name) => ({ name, type: 'LANGUAGE' }));

    const payload: any = {
      jobApplicationId: formData.jobApplicationId || interview.jobApplicationId,
      stage: formData.stage,
      status: formData.status,
      interviewDate: formData.interviewDate ? new Date(formData.interviewDate).toISOString() : new Date().toISOString(),
      notes: formData.notes.trim(),
      companyName: formData.companyName.trim(),
      role: formData.role.trim(),
      questionDTOs: questions,
      requiredImprovements: parsedImprovements,
    };

    try {
      const updated = await interviewsApi.update(interview.id, payload);
      window.dispatchEvent(new Event('interviews-updated'));
      setLoading(false);
      onClose();
      if (onSuccess) {
        onSuccess(updated || { ...interview, ...payload });
      }
    } catch (err: any) {
      console.warn('Backend interview update fallback:', err);
      const fallbackUpdated: Interview = {
        ...interview,
        ...payload,
      };
      window.dispatchEvent(new Event('interviews-updated'));
      setLoading(false);
      onClose();
      if (onSuccess) {
        onSuccess(fallbackUpdated);
      }
    }
  };

  if (!interview) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Interview — ${formData.companyName || 'Interview Round'}`}
    >
      {error && (
        <div className="modal-error-alert" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="modal-form">
        {/* Linked Application / Company */}
        <div className="modal-form-group">
          <label className="modal-form-label">Linked Job Application</label>
          <select
            value={formData.jobApplicationId}
            onChange={(e) => {
              const appId = Number(e.target.value);
              const matchedApp = applications.find((a) => a.id === appId);
              setFormData({
                ...formData,
                jobApplicationId: appId,
                companyName: matchedApp ? (matchedApp.companyName || matchedApp.company?.name || '') : formData.companyName,
                role: matchedApp ? matchedApp.role : formData.role,
              });
            }}
            className="modal-select-field"
          >
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.role} at {app.companyName || app.company?.name || 'Company'} ({app.status})
              </option>
            ))}
          </select>
        </div>

        {/* Company & Role Row */}
        <div className="modal-form-row">
          <div className="modal-form-group">
            <label className="modal-form-label">Company Name *</label>
            <CompanyAutocomplete
              value={formData.companyName}
              onChange={(name) => {
                setFormData((prev) => ({
                  ...prev,
                  companyName: name,
                }));
              }}
              placeholder="e.g. SmartBear, Microsoft..."
              required
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Target Role *</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="modal-input-field"
              placeholder="e.g. Assistant Java Developer"
              required
            />
          </div>
        </div>

        {/* Stage & Status Row */}
        <div className="modal-form-row">
          <div className="modal-form-group">
            <label className="modal-form-label">Interview Stage</label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value as InterviewStage })}
              className="modal-select-field"
            >
              <option value="HR">HR Screening</option>
              <option value="TECHNICAL">Technical Round</option>
              <option value="MANAGERIAL">Managerial Round</option>
              <option value="HR_FINAL">HR Final Round</option>
            </select>
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Round Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as InterviewStatus })}
              className="modal-select-field"
            >
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="PASSED">Passed</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="RESCHEDULED">Rescheduled</option>
            </select>
          </div>
        </div>

        {/* Scheduled Time */}
        <div className="modal-form-group">
          <label className="modal-form-label">Date & Time *</label>
          <input
            type="datetime-local"
            value={formData.interviewDate}
            onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
            className="modal-input-field"
            required
          />
        </div>

        {/* Preparation Notes */}
        <div className="modal-form-group">
          <label className="modal-form-label">Preparation & Debrief Notes</label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="modal-textarea-field"
            placeholder="Focus on Java 21, Spring Boot microservices, architecture trade-offs..."
          />
        </div>

        {/* Questions Manager */}
        <div className="modal-form-group">
          <label className="modal-form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageSquare size={14} color="#5932EA" />
            <span>Questions Asked / Logged ({questions.length})</span>
          </label>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddQuestion();
                }
              }}
              className="modal-input-field"
              placeholder="e.g. How does garbage collection work in G1 vs ZGC?"
            />
            <button
              type="button"
              onClick={handleAddQuestion}
              className="action-primary-btn"
              style={{ padding: '8px 14px', fontSize: '12.5px', whiteSpace: 'nowrap' }}
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          </div>

          <div className="debrief-questions-list" style={{ maxHeight: '160px', overflowY: 'auto' }}>
            {questions.length === 0 ? (
              <p className="debrief-empty-text" style={{ padding: '8px 0' }}>No questions logged yet.</p>
            ) : (
              questions.map((q, idx) => (
                <div key={idx} className="interview-question-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                    <MessageSquare size={14} color="#5932EA" style={{ flexShrink: 0 }} />
                    <span className="debrief-question-item-text" style={{ fontSize: '12.5px' }}>{q.question}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(idx)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#DF0404' }}
                    title="Remove question"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Identified Areas for Improvement */}
        <div className="modal-form-group">
          <label className="modal-form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={14} color="#D0004B" />
            <span>Identified Skill Gaps / Topics for Improvement (comma-separated)</span>
          </label>
          <input
            type="text"
            value={improvementsInput}
            onChange={(e) => setImprovementsInput(e.target.value)}
            className="modal-input-field"
            placeholder="e.g. Kafka Partitioning, Redis Caching, Kubernetes Ingress"
          />
        </div>

        {/* Footer Actions */}
        <div className="modal-footer-actions">
          <button type="button" onClick={onClose} className="modal-cancel-btn">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="modal-submit-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Save size={15} />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
