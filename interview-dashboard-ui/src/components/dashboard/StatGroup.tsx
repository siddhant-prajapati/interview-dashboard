import { Users, UserCheck, Monitor, ArrowUp, ArrowDown } from 'lucide-react';
import { StatMetrics } from '../../types';

interface StatGroupProps {
  stats?: StatMetrics;
}

export default function StatGroup({ 
  stats = {
    totalApplications: 5423,
    totalApplicationsTrend: '+16% this month',
    activeInterviews: 1893,
    activeInterviewsTrend: '-1% this month',
    shortlistedNow: 189,
    avatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces'
    ]
  }
}: StatGroupProps) {
  return (
    <div className="stat-group-card">
      {/* Stat 1: Total Applications */}
      <div className="stat-item">
        <div className="stat-icon-circle">
          <Users size={32} color="#00AC4F" strokeWidth={2} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Total Applications</span>
          <h2 className="stat-value">
            {typeof stats.totalApplications === 'number' 
              ? stats.totalApplications.toLocaleString() 
              : stats.totalApplications}
          </h2>
          <div className="stat-trend-up">
            <ArrowUp size={14} strokeWidth={3} />
            <span>{stats.totalApplicationsTrend || '16% this month'}</span>
          </div>
        </div>
      </div>

      <div className="stat-divider" />

      {/* Stat 2: Active Interviews */}
      <div className="stat-item">
        <div className="stat-icon-circle">
          <UserCheck size={32} color="#00AC4F" strokeWidth={2} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Active Interviews</span>
          <h2 className="stat-value">
            {typeof stats.activeInterviews === 'number' 
              ? stats.activeInterviews.toLocaleString() 
              : stats.activeInterviews}
          </h2>
          <div className="stat-trend-down">
            <ArrowDown size={14} strokeWidth={3} />
            <span>{stats.activeInterviewsTrend || '1% this month'}</span>
          </div>
        </div>
      </div>

      <div className="stat-divider" />

      {/* Stat 3: Shortlisted / In Pipeline */}
      <div className="stat-item">
        <div className="stat-icon-circle">
          <Monitor size={32} color="#00AC4F" strokeWidth={2} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Shortlisted Now</span>
          <h2 className="stat-value">{stats.shortlistedNow}</h2>
          <div className="stat-avatar-stack">
            {(stats.avatars || []).map((imgUrl, idx) => (
              <img
                key={idx}
                src={imgUrl}
                alt="Active applicant"
                className="stat-avatar-img"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
