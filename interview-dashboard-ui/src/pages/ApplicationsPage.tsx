import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/layout/Header';
import DataTable, { Column } from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import NewApplicationModal from '../components/applications/NewApplicationModal';
import { jobApplicationsApi } from '../api/jobApplicationsApi';
import { mockStore } from '../api/client';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { JobApplication, Technology } from '../types';
import { AppOutletContext } from '../components/layout/AppLayout';

export default function ApplicationsPage() {
  const { toggleMobileMenu } = useOutletContext<AppOutletContext>();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await jobApplicationsApi.getAll();
        if (!isMounted) return;
        if (res && res.content) {
          setApplications(res.content);
        } else if (Array.isArray(res)) {
          setApplications(res);
        } else {
          setApplications(mockStore.jobApplications);
        }
      } catch {
        if (isMounted) {
          setApplications(mockStore.jobApplications);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('Delete this application record?')) return;
    try {
      await jobApplicationsApi.delete(id);
    } catch (err) {
      console.warn('Backend delete simulated:', err);
    }
    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  const filteredData = applications.filter((app) => {
    if (activeTab !== 'ALL' && app.status !== activeTab) return false;
    if (!searchFilter) return true;
    const term = searchFilter.toLowerCase();
    return (
      (app.role && app.role.toLowerCase().includes(term)) ||
      (app.candidateName && app.candidateName.toLowerCase().includes(term)) ||
      (app.company?.name && app.company.name.toLowerCase().includes(term)) ||
      (app.platform && app.platform.toLowerCase().includes(term))
    );
  });

  const columns: Column<JobApplication>[] = [
    {
      key: 'role',
      label: 'Target Role & Candidate',
      render: (row) => (
        <div>
          <div className="table-cell-title">{row.role}</div>
          <div className="table-cell-subtitle">
            {row.candidateName || 'Candidate'} • {row.platform || 'Direct'}
          </div>
        </div>
      ),
    },
    {
      key: 'company.name',
      label: 'Company',
      render: (row) => (
        <div>
          <span className="table-cell-company">{row.company?.name || 'Company'}</span>
          <div className="table-cell-subtitle">{row.company?.location || 'Remote'}</div>
        </div>
      ),
    },
    {
      key: 'jobType',
      label: 'Type',
      render: (row) => (
        <span className="tag-pill">{row.jobType || 'REMOTE'}</span>
      ),
    },
    {
      key: 'expectedSalary',
      label: 'Compensation',
      render: (row) => row.expectedSalary || 'Competitive',
    },
    {
      key: 'applyDate',
      label: 'Applied On',
      render: (row) => row.applyDate || 'Recent',
    },
    {
      key: 'technologies',
      label: 'Tech Stack',
      render: (row) => (
        <div className="table-tags-wrap">
          {(row.technologies || []).map((t, idx) => {
            const techName = typeof t === 'string' ? t : (t as Technology).name;
            return (
              <span key={idx} className="tech-badge-pill">
                {techName}
              </span>
            );
          })}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Stage Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="table-action-btn-group">
          {row.jobUrl && (
            <a
              href={row.jobUrl}
              target="_blank"
              rel="noreferrer"
              className="table-action-icon-btn"
              title="Open Job Listing"
            >
              <ExternalLink size={16} color="#7E7E7E" />
            </a>
          )}
          <button
            type="button"
            onClick={(e) => handleDelete(e, row.id)}
            className="table-action-icon-btn"
            title="Delete Application"
          >
            <Trash2 size={16} color="#DF0404" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <Header
        greeting="Job Applications 💼"
        placeholder="Filter by role, platform, company..."
        searchValue={searchFilter}
        onSearchChange={setSearchFilter}
        onToggleMobileMenu={toggleMobileMenu}
        actionButton={
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="action-primary-btn"
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
            <span>New Application</span>
          </button>
        }
      />

      {/* Tabs */}
      <div className="filter-tabs-container">
        {[
          { id: 'ALL', label: 'All Applications' },
          { id: 'APPLIED', label: 'Applied' },
          { id: 'TECHNICAL_ROUND', label: 'Technical Rounds' },
          { id: 'MANAGERIAL_ROUND', label: 'Managerial' },
          { id: 'OFFER', label: 'Offers 🎉' },
          { id: 'REJECTED', label: 'Archived / Rejected' },
        ].map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`filter-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        title="All Applications"
        subtitle={`Tracking ${filteredData.length} Pipeline Records`}
        columns={columns}
        data={filteredData}
        totalEntries={filteredData.length}
        pageSize={8}
      />

      <NewApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newApp) => setApplications((prev) => [newApp, ...prev])}
      />
    </div>
  );
}
