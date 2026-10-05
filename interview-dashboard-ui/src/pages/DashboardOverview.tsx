import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/layout/Header';
import StatGroup from '../components/dashboard/StatGroup';
import DataTable, { Column } from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import NewApplicationModal from '../components/applications/NewApplicationModal';
import { jobApplicationsApi } from '../api/jobApplicationsApi';
import { interviewsApi } from '../api/interviewsApi';
import { mockStore } from '../api/client';
import { Plus } from 'lucide-react';
import { JobApplication, StatMetrics } from '../types';
import { AppOutletContext } from '../components/layout/AppLayout';

export default function DashboardOverview() {
  const { toggleMobileMenu } = useOutletContext<AppOutletContext>();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [stats, setStats] = useState<StatMetrics>(mockStore.stats);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [appRes, interviewRes] = await Promise.allSettled([
          jobApplicationsApi.getAll({ page: 0, size: 10 }),
          interviewsApi.getAll({ page: 0, size: 100 }),
        ]);

        if (!isMounted) return;

        let apps: JobApplication[] = [];
        if (appRes.status === 'fulfilled' && appRes.value) {
          apps = appRes.value.content || (Array.isArray(appRes.value) ? appRes.value : []);
          setApplications(apps);
        } else {
          setApplications(mockStore.jobApplications);
          apps = mockStore.jobApplications;
        }

        const totalApps = appRes.status === 'fulfilled' && appRes.value?.totalElements != null
          ? appRes.value.totalElements
          : apps.length;

        let activeInts = 0;
        if (interviewRes.status === 'fulfilled' && interviewRes.value) {
          const ints = interviewRes.value.content || (Array.isArray(interviewRes.value) ? interviewRes.value : []);
          activeInts = ints.filter((i: any) => i.status === 'SCHEDULED').length;
        }

        const shortlisted = apps.filter((a) =>
          ['OFFER', 'HR_SCREENING', 'TECHNICAL_ROUND', 'MANAGERIAL_ROUND', 'HR_FINAL'].includes(a.status as string)
        ).length;

        setStats({
          totalApplications: totalApps,
          totalApplicationsTrend: '+16% this month',
          activeInterviews: activeInts,
          activeInterviewsTrend: 'Live from pipeline',
          shortlistedNow: shortlisted,
          avatars: mockStore.stats.avatars,
        });
      } catch (err) {
        console.warn('Dashboard data fetch fallback:', err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleApplicationCreated = (newApp: JobApplication) => {
    setApplications((prev) => [newApp, ...prev]);
    setStats((prev) => ({
      ...prev,
      totalApplications: typeof prev.totalApplications === 'number' ? prev.totalApplications + 1 : prev.totalApplications,
    }));
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
          <span className="table-cell-company">{row.companyName || row.company?.name || 'Company'}</span>
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
        pageSize={8}
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
