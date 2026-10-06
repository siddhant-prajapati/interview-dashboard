import React from 'react';
import { X, Zap, ExternalLink, Globe, CheckCircle } from 'lucide-react';

interface BulkApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PlatformTarget {
  name: string;
  letter: string;
  url: string;
  roleHint: string;
}

const PLATFORMS: PlatformTarget[] = [
  { name: 'Naukari.com', letter: 'N', url: 'https://www.naukri.com/mnjuser/homepage', roleHint: 'India & Remote IT Jobs' },
  { name: 'Unstop', letter: 'U', url: 'https://unstop.com/u/siddhpra69395', roleHint: 'Hackathons, Hiring & Tech Roles' },
  { name: 'Instahyre.com', letter: 'I', url: 'https://www.instahyre.com/candidate/profile/', roleHint: 'AI-curated Inbound Offers' },
  { name: 'Cutshort', letter: 'C', url: 'https://cutshort.io/profile/candidate-dashboard', roleHint: 'Direct Tech Recruiter Connect' },
  { name: 'Wellfound', letter: 'W', url: 'https://wellfound.com/jobs/home', roleHint: 'Global Startups & Remote' },
  { name: 'FoundIt', letter: 'F', url: 'https://www.foundit.in/seeker/profile', roleHint: 'Enterprise & MNC Openings' },
  { name: 'LinkedIn', letter: 'L', url: 'https://www.linkedin.com/jobs/', roleHint: 'Global Network & Easy Apply' },
];

export default function BulkApplyModal({ isOpen, onClose }: BulkApplyModalProps) {
  if (!isOpen) return null;

  const handleLaunchAll = () => {
    PLATFORMS.forEach((p) => {
      window.open(p.url, '_blank', 'noopener,noreferrer');
    });
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div 
        className="modal-box-card" 
        style={{ maxWidth: '640px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="modal-title-text">Bulk Apply Hub</span>
            <span className="tag-pill" style={{ backgroundColor: '#F3EFFF', color: '#5932EA' }}>
              7 Platforms
            </span>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="modal-close-btn"
            aria-label="Close"
          >
            <X size={18} color="#7E7E7E" />
          </button>
        </div>

        <div className="modal-body-content">
          {/* Hero Banner: 1-Click Launch All */}
          <div style={{ 
            background: 'linear-gradient(135deg, #5932EA 0%, #7C3AED 100%)', 
            borderRadius: '16px', 
            padding: '20px', 
            color: '#FFFFFF',
            marginBottom: '20px',
            boxShadow: '0 8px 24px rgba(89, 50, 234, 0.3)'
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px 0' }}>
              🚀 Launch All Job Platforms Simultaneously
            </h4>
            <p style={{ fontSize: '12.5px', opacity: 0.9, lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Open all 7 connected job hunting platforms in parallel browser tabs to quickly review active job posts and submit applications.
            </p>
            <button
              type="button"
              onClick={handleLaunchAll}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#5932EA',
                padding: '9px 18px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              <Zap size={15} color="#5932EA" />
              <span>Launch All 7 Platforms Now</span>
            </button>
          </div>

          <h5 style={{ fontSize: '13.5px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
            Individual Platform Job Boards
          </h5>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {PLATFORMS.map((plat) => (
              <div 
                key={plat.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #ECEEF3'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #5932EA',
                    color: '#5932EA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '13px'
                  }}>
                    {plat.letter}
                  </div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>
                      {plat.name}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#6B7280' }}>
                      {plat.roleHint}
                    </div>
                  </div>
                </div>

                <a
                  href={plat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="filter-tab-btn"
                  style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>Open</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
