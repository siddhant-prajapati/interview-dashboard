import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/layout/Header';
import StatGroup from '../components/dashboard/StatGroup';
import DataTable, { Column } from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import NewApplicationModal from '../components/applications/NewApplicationModal';
import PlatformCirclesBar from '../components/dashboard/PlatformCirclesBar';
import FollowUpModal from '../components/dashboard/FollowUpModal';
import SetDayModal from '../components/dashboard/SetDayModal';
import BulkApplyModal from '../components/dashboard/BulkApplyModal';
import { jobApplicationsApi } from '../api/jobApplicationsApi';
import { interviewsApi } from '../api/interviewsApi';
import { mockStore } from '../api/client';
import { Plus, Send, Calendar } from 'lucide-react';
import { JobApplication, StatMetrics } from '../types';
import { AppOutletContext } from '../components/layout/AppLayout';
import { useUser } from '../context/UserContext';

export default function DashboardOverview() {
  const { toggleMobileMenu } = useOutletContext<AppOutletContext>();
  const { currentUser } = useUser();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [stats, setStats] = useState<StatMetrics>(mockStore.stats);

  // Modals state
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [isBulkApplyOpen, setIsBulkApplyOpen] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [isSetDayOpen, setIsSetDayOpen] = useState(false);

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
            {row.candidateName || currentUser?.name || 'Candidate'} • {typeof row.platform === 'string' ? row.platform : (row.platformName || 'Direct')}
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

  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : (currentUser?.username || 'Candidate');

  return (
    <div className="animate-fade-in">
      {/* Header bar */}
      <Header
        greeting={`Hello ${firstName} 👋,`}
        placeholder="Search applications..."
        onToggleMobileMenu={toggleMobileMenu}
        actionButton={
          <button
            type="button"
            onClick={() => setIsAddJobOpen(true)}
            className="action-primary-btn"
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
            <span>Add Job</span>
          </button>
        }
      />

      {/* 1. Platforms Section with (N) (U) (I) (C) (W) (F) (L) and Bulk Apply / Add Job buttons */}
      <PlatformCirclesBar
        onOpenAddJob={() => setIsAddJobOpen(true)}
        onOpenBulkApply={() => setIsBulkApplyOpen(true)}
      />

      {/* 2. Middle Action Bar: [Send Follow Up] and [Set Day] */}
      <div className="middle-actions-bar">
        <button
          type="button"
          onClick={() => setIsFollowUpOpen(true)}
          className="action-pill-btn action-pill-follow-up"
          title="Review and dispatch follow up communications to recruiters"
        >
          <Send size={18} />
          <span>Send Follow Up</span>
        </button>

        <button
          type="button"
          onClick={() => setIsSetDayOpen(true)}
          className="action-pill-btn action-pill-set-day"
          title="Configure daily application goals and focus deadlines"
        >
          <Calendar size={18} />
          <span>Set Day</span>
        </button>
      </div>

      {/* Top 3 Stat KPI Cards Row */}
      <StatGroup stats={stats} />

      {/* 3. Job Application Data Table */}
      <DataTable
        title="Job Application"
        subtitle="Active Pipeline & Interview Stages"
        columns={columns}
        data={applications}
        pageSize={8}
      />

      {/* Modals */}
      <NewApplicationModal
        isOpen={isAddJobOpen}
        onClose={() => setIsAddJobOpen(false)}
        onSuccess={handleApplicationCreated}
      />

      <BulkApplyModal
        isOpen={isBulkApplyOpen}
        onClose={() => setIsBulkApplyOpen(false)}
      />

      <FollowUpModal
        isOpen={isFollowUpOpen}
        onClose={() => setIsFollowUpOpen(false)}
        applications={applications}
      />

      <SetDayModal
        isOpen={isSetDayOpen}
        onClose={() => setIsSetDayOpen(false)}
        applicationsCountToday={applications.length}
      />
    </div>
  );
}
