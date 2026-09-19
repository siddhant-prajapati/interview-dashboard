import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/layout/Header';
import DataTable, { Column } from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { interviewsApi } from '../api/interviewsApi';
import { mockStore } from '../api/client';
import { Plus, Calendar, MessageSquare, AlertTriangle } from 'lucide-react';
import { Interview, Technology } from '../types';
import { AppOutletContext } from '../components/layout/AppLayout';

export default function InterviewsPage() {
  const { toggleMobileMenu } = useOutletContext<AppOutletContext>();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [formData, setFormData] = useState({
    stage: 'TECHNICAL',
    status: 'SCHEDULED',
    interviewDate: '2026-09-25T15:00',
    companyName: 'Microsoft',
    role: 'Senior Java Backend',
    notes: 'Focus on System Design and JPA performance optimization.',
  });

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await interviewsApi.getAll();
        if (!isMounted) return;
        if (res && res.content) {
          setInterviews(res.content);
        } else if (Array.isArray(res)) {
          setInterviews(res);
        } else {
          setInterviews(mockStore.interviews);
        }
      } catch {
        if (isMounted) {
          setInterviews(mockStore.interviews);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newInterview: Interview = {
      id: Date.now(),
      interviewDate: formData.interviewDate,
      stage: formData.stage,
      status: formData.status,
      companyName: formData.companyName,
      role: formData.role,
      notes: formData.notes,
      questions: [],
      requiredImprovements: [],
    };
    try {
      await interviewsApi.create(newInterview);
    } catch (err) {
      console.warn('Backend offline, saving to memory:', err);
    }
    setInterviews((prev) => [newInterview, ...prev]);
    setIsScheduleOpen(false);
  };

  const columns: Column<Interview>[] = [
    {
      key: 'companyName',
      label: 'Company & Role',
      render: (row) => (
        <div>
          <div className="table-cell-title">{row.companyName || 'Enterprise'}</div>
          <div className="table-cell-subtitle">{row.role || 'Software Engineer'}</div>
        </div>
      ),
    },
    {
      key: 'stage',
      label: 'Stage',
      render: (row) => (
        <span className="stage-badge-pill">
          {row.stage}
        </span>
      ),
    },
    {
      key: 'interviewDate',
      label: 'Scheduled Time',
      render: (row) => (
        <div className="table-cell-row-flex">
          <Calendar size={14} color="#5932EA" />
          <span>{row.interviewDate ? new Date(row.interviewDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'TBD'}</span>
        </div>
      ),
    },
    {
      key: 'questions',
      label: 'Questions Logged',
      render: (row) => (
        <div className="table-cell-row-flex">
          <MessageSquare size={14} color="#16C098" />
          <span>{row.questions ? row.questions.length : 0} Questions</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Round Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="animate-fade-in">
      <Header
        greeting="Interview Schedules 🎙️"
        placeholder="Search interview rounds..."
        onToggleMobileMenu={toggleMobileMenu}
        actionButton={
          <button 
            type="button" 
            onClick={() => setIsScheduleOpen(true)} 
            className="action-primary-btn"
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
            <span>Schedule Round</span>
          </button>
        }
      />

      <DataTable
        title="Interviews & Debriefs"
        subtitle="Review feedback, questions asked, and skill gaps"
        columns={columns}
        data={interviews}
        totalEntries={interviews.length}
        onRowClick={(row) => setSelectedInterview(row)}
      />

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title="Schedule Interview Round"
      >
        <form onSubmit={handleScheduleSubmit} className="modal-form">
          <div className="modal-form-group">
            <label className="modal-form-label">Company</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="modal-input-field"
              required
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Role</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="modal-input-field"
              required
            />
          </div>

          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-form-label">Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="modal-select-field"
              >
                <option value="HR">HR Screening</option>
                <option value="TECHNICAL">Technical Round</option>
                <option value="MANAGERIAL">Managerial</option>
                <option value="HR_FINAL">HR Final</option>
              </select>
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">Date & Time</label>
              <input
                type="datetime-local"
                value={formData.interviewDate}
                onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                className="modal-input-field"
                required
              />
            </div>
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Preparation Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="modal-textarea-field"
            />
          </div>

          <div className="modal-footer-actions">
            <button type="button" onClick={() => setIsScheduleOpen(false)} className="modal-cancel-btn">
              Cancel
            </button>
            <button type="submit" className="modal-submit-btn">
              Save Round
            </button>
          </div>
        </form>
      </Modal>

      {/* View Interview Details & Questions Modal */}
      {selectedInterview && (
        <Modal
          isOpen={Boolean(selectedInterview)}
          onClose={() => setSelectedInterview(null)}
          title={`Interview Debrief — ${selectedInterview.companyName || 'Interview'}`}
        >
          <div className="debrief-section-group">
            <div className="debrief-two-col">
              <div>
                <span className="debrief-meta-label">
                  Stage
                </span>
                <div className="debrief-meta-value">
                  <span className="stage-badge-pill">{selectedInterview.stage}</span>
                </div>
              </div>
              <div>
                <span className="debrief-meta-label">
                  Status
                </span>
                <div className="debrief-meta-value">
                  <StatusBadge status={selectedInterview.status} />
                </div>
              </div>
            </div>

            <div>
              <span className="debrief-meta-label">
                Debrief Notes
              </span>
              <p className="debrief-notes-text">
                {selectedInterview.notes || 'No specific notes entered.'}
              </p>
            </div>

            {/* Questions Asked */}
            <div>
              <span className="debrief-meta-label">
                Questions Asked in Round
              </span>
              <div className="debrief-questions-list">
                {(selectedInterview.questions || []).length === 0 ? (
                  <p className="debrief-empty-text">No questions logged for this round yet.</p>
                ) : (
                  selectedInterview.questions?.map((q, idx) => (
                    <div key={idx} className="interview-question-box">
                      <MessageSquare size={16} color="#5932EA" />
                      <span className="debrief-question-item-text">{q.question}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Required Improvements */}
            <div>
              <span className="debrief-meta-label">
                Identified Areas for Improvement
              </span>
              <div className="debrief-improvements-wrap">
                {(selectedInterview.requiredImprovements || []).length === 0 ? (
                  <p className="debrief-success-empty">No skill gaps identified!</p>
                ) : (
                  selectedInterview.requiredImprovements?.map((tech: Technology | string, idx: number) => {
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
          </div>
        </Modal>
      )}
    </div>
  );
}
