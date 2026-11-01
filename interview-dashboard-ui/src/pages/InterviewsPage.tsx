import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/layout/Header';
import DataTable, { Column } from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { interviewsApi } from '../api/interviewsApi';
import { jobApplicationsApi } from '../api/jobApplicationsApi';
import { mockStore } from '../api/client';
import { Plus, Calendar, MessageSquare, AlertTriangle, Trash2, Eye, Edit3 } from 'lucide-react';
import { Interview, JobApplication, Technology } from '../types';
import { AppOutletContext } from '../components/layout/AppLayout';
import { CompanyAutocomplete } from '../components/common/CompanyAutocomplete';
import ViewInterviewModal from '../components/interviews/ViewInterviewModal';
import EditInterviewModal from '../components/interviews/EditInterviewModal';

export default function InterviewsPage() {
  const { toggleMobileMenu } = useOutletContext<AppOutletContext>();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [viewingInterview, setViewingInterview] = useState<Interview | null>(null);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [formData, setFormData] = useState({
    jobApplicationId: 0,
    stage: 'TECHNICAL',
    status: 'SCHEDULED',
    interviewDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
    companyName: '',
    role: '',
    notes: 'Focus on System Design and core concepts.',
  });

  useEffect(() => {
    let isMounted = true;
    const fetchAllData = async () => {
      try {
        const [intRes, appRes] = await Promise.allSettled([
          interviewsApi.getAll(),
          jobApplicationsApi.getAll({ page: 0, size: 50 }),
        ]);

        if (!isMounted) return;

        if (intRes.status === 'fulfilled' && intRes.value) {
          const list = intRes.value.content || (Array.isArray(intRes.value) ? intRes.value : []);
          setInterviews(list);
        } else {
          setInterviews(mockStore.interviews);
        }

        if (appRes.status === 'fulfilled' && appRes.value) {
          const appList = appRes.value.content || (Array.isArray(appRes.value) ? appRes.value : []);
          setApplications(appList);
          if (appList.length > 0 && formData.jobApplicationId === 0) {
            setFormData((prev) => ({
              ...prev,
              jobApplicationId: appList[0].id,
              companyName: appList[0].companyName || appList[0].company?.name || '',
              role: appList[0].role || '',
            }));
          }
        }
      } catch (err) {
        console.warn('Interviews fetch fallback:', err);
      }
    };

    fetchAllData();

    const handleSync = () => {
      if (isMounted) fetchAllData();
    };
    window.addEventListener('interviews-updated', handleSync);

    return () => {
      isMounted = false;
      window.removeEventListener('interviews-updated', handleSync);
    };
  }, []);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetApp = applications.find((a) => a.id === Number(formData.jobApplicationId));
    const payload = {
      jobApplicationId: formData.jobApplicationId ? Number(formData.jobApplicationId) : (applications[0]?.id || 1),
      interviewDate: formData.interviewDate,
      stage: formData.stage,
      status: formData.status,
      notes: formData.notes,
    };

    try {
      const created = await interviewsApi.create(payload);
      const enriched: Interview = {
        ...(created || payload),
        id: created?.id || Date.now(),
        companyName: targetApp ? (targetApp.companyName || targetApp.company?.name) : formData.companyName,
        role: targetApp ? targetApp.role : formData.role,
        questions: [],
        requiredImprovements: [],
      };
      setInterviews((prev) => [enriched, ...prev]);
    } catch (err: any) {
      console.warn('Schedule interview error:', err);
      const fallbackInterview: Interview = {
        id: Date.now(),
        ...payload,
        companyName: targetApp ? (targetApp.companyName || targetApp.company?.name) : formData.companyName,
        role: targetApp ? targetApp.role : formData.role,
        questions: [],
        requiredImprovements: [],
      };
      setInterviews((prev) => [fallbackInterview, ...prev]);
    }
    setIsScheduleOpen(false);
  };

  const handleDelete = async (e: React.MouseEvent, id?: number) => {
    e.stopPropagation();
    if (!id) return;
    if (!window.confirm('Delete this scheduled interview record?')) return;
    try {
      await interviewsApi.delete(id);
    } catch (err) {
      console.warn('Delete interview fallback:', err);
    }
    setInterviews((prev) => prev.filter((i) => i.id !== id));
  };

  const filteredInterviews = interviews.filter((item) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    const app = applications.find((a) => a.id === item.jobApplicationId);
    const co = (app?.companyName || app?.company?.name || item.companyName || '').toLowerCase();
    const role = (app?.role || item.role || '').toLowerCase();
    return co.includes(term) || role.includes(term);
  });

  const columns: Column<Interview>[] = [
    {
      key: 'companyName',
      label: 'Company & Role',
      render: (row) => {
        const app = applications.find((a) => a.id === row.jobApplicationId);
        const coName = app?.companyName || app?.company?.name || row.companyName || 'Enterprise';
        const roleName = app?.role || row.role || 'Software Engineer';
        return (
          <div>
            <div className="table-cell-title">{coName}</div>
            <div className="table-cell-subtitle">{roleName}</div>
          </div>
        );
      },
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
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="table-action-btn-group" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setViewingInterview(row);
            }}
            className="table-action-icon-btn action-show-btn"
            title="View Interview Debrief"
            aria-label="View Interview"
          >
            <Eye size={15} color="#5932EA" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditingInterview(row);
            }}
            className="table-action-icon-btn action-edit-btn"
            title="Edit Interview Round"
            aria-label="Edit Interview"
          >
            <Edit3 size={15} color="#2563EB" />
          </button>
          <button
            type="button"
            onClick={(e) => handleDelete(e, row.id)}
            className="table-action-icon-btn action-delete-btn"
            title="Delete Interview"
            aria-label="Delete Interview"
          >
            <Trash2 size={15} color="#DF0404" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <Header
        greeting="Interview Schedules 🎙️"
        placeholder="Search interview rounds..."
        searchValue={searchFilter}
        onSearchChange={setSearchFilter}
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
        data={filteredInterviews}
        totalEntries={filteredInterviews.length}
        onRowClick={(row) => setViewingInterview(row)}
      />

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title="Schedule Interview Round"
      >
        <form onSubmit={handleScheduleSubmit} className="modal-form">
          <div className="modal-form-group">
            <label className="modal-form-label">Target Job Application</label>
            <select
              value={formData.jobApplicationId}
              onChange={(e) => {
                const appId = Number(e.target.value);
                const app = applications.find((a) => a.id === appId);
                setFormData({
                  ...formData,
                  jobApplicationId: appId,
                  companyName: app ? (app.companyName || app.company?.name || '') : formData.companyName,
                  role: app ? app.role : formData.role,
                });
              }}
              className="modal-select-field"
              required
            >
              {applications.length === 0 ? (
                <option value={0}>No job applications registered yet</option>
              ) : (
                applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.role} at {app.companyName || app.company?.name || 'Company'} ({app.status})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-form-label">Company Name</label>
              <CompanyAutocomplete
                value={formData.companyName}
                onChange={(name) => {
                  const matchingApp = applications.find(
                    (a) =>
                      (a.companyName && a.companyName.toLowerCase() === name.toLowerCase()) ||
                      (a.company?.name && a.company.name.toLowerCase() === name.toLowerCase())
                  );
                  if (matchingApp) {
                    setFormData((prev) => ({
                      ...prev,
                      companyName: name,
                      jobApplicationId: matchingApp.id,
                      role: matchingApp.role || prev.role,
                    }));
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      companyName: name,
                    }));
                  }
                }}
                placeholder="e.g. SmartBear, Google, Microsoft..."
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
      <ViewInterviewModal
        isOpen={Boolean(viewingInterview)}
        onClose={() => setViewingInterview(null)}
        interview={viewingInterview}
        applications={applications}
        onEdit={(interview) => {
          setViewingInterview(null);
          setEditingInterview(interview);
        }}
      />

      {/* Edit Interview Modal */}
      <EditInterviewModal
        isOpen={Boolean(editingInterview)}
        onClose={() => setEditingInterview(null)}
        interview={editingInterview}
        applications={applications}
        onSuccess={(updated) => {
          setInterviews((prev) =>
            prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i))
          );
        }}
      />
    </div>
  );
}
