import React, { useEffect, useState } from 'react';
import { Plus, Zap, ExternalLink } from 'lucide-react';
import { platformsApi } from '../../api/platformsApi';
import { Platform } from '../../types';
import { useUser } from '../../context/UserContext';

interface PlatformCirclesBarProps {
  onOpenAddJob: () => void;
  onOpenBulkApply: () => void;
}

interface DisplayPlatform {
  id?: number;
  letter: string;
  name: string;
  shortName: string;
  url: string;
  jobPostCount?: number | null;
  themeClass: string;
}

// Fallback platforms matching userId=1 in platforms.json
const DEFAULT_PLATFORMS: DisplayPlatform[] = [
  {
    letter: 'N',
    name: 'Naukari.com',
    shortName: 'Naukri',
    url: 'https://www.naukri.com/mnjuser/homepage',
    jobPostCount: 1,
    themeClass: 'theme-naukri',
  },
  {
    letter: 'U',
    name: 'Unstop',
    shortName: 'Unstop',
    url: 'https://unstop.com/u/siddhpra69395',
    jobPostCount: 2,
    themeClass: 'theme-unstop',
  },
  {
    letter: 'I',
    name: 'Instahyre.com',
    shortName: 'Instahyre',
    url: 'https://www.instahyre.com/candidate/profile/',
    jobPostCount: null,
    themeClass: 'theme-instahyre',
  },
  {
    letter: 'C',
    name: 'Cutshort',
    shortName: 'Cutshort',
    url: 'https://cutshort.io/profile/candidate-dashboard',
    jobPostCount: null,
    themeClass: 'theme-cutshort',
  },
  {
    letter: 'W',
    name: 'Wellfound',
    shortName: 'Wellfound',
    url: 'https://wellfound.com/jobs/home',
    jobPostCount: null,
    themeClass: 'theme-wellfound',
  },
  {
    letter: 'F',
    name: 'FoundIt',
    shortName: 'FoundIt',
    url: 'https://www.foundit.in/seeker/profile',
    jobPostCount: null,
    themeClass: 'theme-foundit',
  },
  {
    letter: 'L',
    name: 'LinkedIn',
    shortName: 'LinkedIn',
    url: 'https://www.linkedin.com/jobs/',
    jobPostCount: null,
    themeClass: 'theme-linkedin',
  },
];

const getThemeForName = (name: string): { letter: string; themeClass: string; fallbackUrl: string; shortName: string } => {
  const lower = name.toLowerCase();
  if (lower.includes('nauk')) return { letter: 'N', themeClass: 'theme-naukri', fallbackUrl: 'https://www.naukri.com/mnjuser/homepage', shortName: 'Naukri' };
  if (lower.includes('unstop')) return { letter: 'U', themeClass: 'theme-unstop', fallbackUrl: 'https://unstop.com/u/siddhpra69395', shortName: 'Unstop' };
  if (lower.includes('insta')) return { letter: 'I', themeClass: 'theme-instahyre', fallbackUrl: 'https://www.instahyre.com/candidate/profile/', shortName: 'Instahyre' };
  if (lower.includes('cut')) return { letter: 'C', themeClass: 'theme-cutshort', fallbackUrl: 'https://cutshort.io/profile/candidate-dashboard', shortName: 'Cutshort' };
  if (lower.includes('well')) return { letter: 'W', themeClass: 'theme-wellfound', fallbackUrl: 'https://wellfound.com/jobs/home', shortName: 'Wellfound' };
  if (lower.includes('found')) return { letter: 'F', themeClass: 'theme-foundit', fallbackUrl: 'https://www.foundit.in/seeker/profile', shortName: 'FoundIt' };
  if (lower.includes('link')) return { letter: 'L', themeClass: 'theme-linkedin', fallbackUrl: 'https://www.linkedin.com/jobs/', shortName: 'LinkedIn' };
  
  const letter = (name.trim()[0] || 'P').toUpperCase();
  return { letter, themeClass: 'theme-default', fallbackUrl: '#', shortName: name };
};

export default function PlatformCirclesBar({ onOpenAddJob, onOpenBulkApply }: PlatformCirclesBarProps) {
  const { currentUser } = useUser();
  const [platformsList, setPlatformsList] = useState<DisplayPlatform[]>(DEFAULT_PLATFORMS);

  useEffect(() => {
    let isMounted = true;
    const targetUserId = currentUser?.id || 1;
    
    platformsApi.getByUserId(targetUserId)
      .then((apiPlatforms) => {
        if (!isMounted || !Array.isArray(apiPlatforms) || apiPlatforms.length === 0) return;

        // Map API records to display platforms
        const mapped: DisplayPlatform[] = apiPlatforms.map((p) => {
          const info = getThemeForName(p.name);
          return {
            id: p.id,
            letter: info.letter,
            name: p.name,
            shortName: info.shortName,
            url: p.accountLink && p.accountLink.trim() ? p.accountLink : info.fallbackUrl,
            jobPostCount: p.jobPostCount,
            themeClass: info.themeClass,
          };
        });

        // Ensure LinkedIn is present if not already in the mapped list
        const hasLinkedIn = mapped.some((m) => m.letter === 'L');
        if (!hasLinkedIn) {
          mapped.push({
            letter: 'L',
            name: 'LinkedIn',
            shortName: 'LinkedIn',
            url: currentUser?.linkedInLink || 'https://www.linkedin.com/jobs/',
            jobPostCount: null,
            themeClass: 'theme-linkedin',
          });
        }

        setPlatformsList(mapped);
      })
      .catch((err) => {
        console.warn('Error fetching platforms for circles bar, keeping default list:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id, currentUser?.linkedInLink]);

  const handlePlatformClick = (platform: DisplayPlatform) => {
    if (platform.url && platform.url !== '#') {
      window.open(platform.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="platforms-card">
      {/* Header with Title and Action Buttons (Bulk Apply & Add Job) */}
      <div className="platforms-card-header">
        <div className="platforms-title-group">
          <div>
            <h2 className="platforms-card-title">Platforms</h2>
            <p className="platforms-subtitle">Click any platform circle to find & apply for jobs</p>
          </div>
        </div>

        <div className="platforms-actions-group">
          <button
            type="button"
            onClick={onOpenBulkApply}
            className="btn-bulk-apply"
            title="Bulk launch platforms and fast-track job applications"
          >
            <Zap size={15} />
            <span>Bulk Apply</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddJob}
            className="btn-add-job"
            title="Add a new job application to pipeline"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Job</span>
          </button>
        </div>
      </div>

      {/* Row of Platform Circles: (N) (U) (I) (C) (W) (F) (L) */}
      <div className="platform-circles-row">
        {platformsList.map((p, index) => (
          <button
            key={p.id || `${p.letter}-${index}`}
            type="button"
            onClick={() => handlePlatformClick(p)}
            className="platform-circle-item"
            title={`Open ${p.name} for job searching`}
          >
            <div className={`platform-circle-avatar ${p.themeClass}`}>
              {p.letter}
              {p.jobPostCount != null && p.jobPostCount > 0 && (
                <span className="platform-circle-badge" title={`${p.jobPostCount} active job posts`}>
                  {p.jobPostCount}
                </span>
              )}
            </div>
            <span className="platform-circle-name">{p.shortName}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
