import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/layout/Header';
import StatGroup from '../components/dashboard/StatGroup';
import DataTable, { Column } from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import NewApplicationModal from '../components/applications/NewApplicationModal';
import { jobApplicationsApi } from '../api/jobApplicationsApi';
import { mockStore } from '../api/client';
import { Plus } from 'lucide-react';
import { JobApplication } from '../types';
import { AppOutletContext } from '../components/layout/AppLayout';

export default function DashboardOverview() {
  const { toggleMobileMenu } = useOutletContext<AppOutletContext>();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [stats] = useState(mockStore.stats);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await jobApplicationsApi.getAll({ page: 0, size: 10 });
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

  const handleApplicationCreated = (newApp: JobApplication) => {
    setApplications((prev) => [newApp, ...prev]);
  };

  // Columns displaying Job Application Data
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
      )
    },
    { 
      key: 'company.name', 
      label: 'Company',
      render: (row) => (
        <div>
          <span className="table-cell-company">{row.company?.name || 'Company'}</span>
          <div className="table-cell-subtitle">{row.company?.location || 'Remote'}</div>
        </div>
      )
    },
    { 
      key: 'jobType', 
      label: 'Work Policy',
      render: (row) => <span className="tag-pill">{row.jobType || 'REMOTE'}</span>
    },
    { 
      key: 'expectedSalary', 
      label: 'Compensation',
      render: (row) => row.expectedSalary || '$120k - $140k'
    },
    { 
      key: 'applyDate', 
      label: 'Applied On',
      render: (row) => row.applyDate || 'Recent'
    },
    { 
      key: 'status', 
      label: 'Stage Status',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div className="animate-fade-in">
      {/* Header with hamburger toggle for mobile */}
      <Header
        greeting="Hello Evano 👋,"
        placeholder="Search applications..."
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

      {/* Top 3 Stat Cards Row */}
      <StatGroup stats={stats} />

      {/* Main Job Application Data Table */}
      <DataTable
        title="All Applications"
        subtitle="Active Pipeline & Interview Stages"
        columns={columns}
        data={applications}
        totalEntries={256000}
        pageSize={8}
        currentPage={1}
      />

      {/* Application Creation Modal */}
      <NewApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleApplicationCreated}
      />
    </div>
  );
}
