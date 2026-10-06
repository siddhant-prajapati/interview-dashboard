import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/layout/Header';
import { AppOutletContext } from '../components/layout/AppLayout';
import { useUser } from '../context/UserContext';
import { platformsApi } from '../api/platformsApi';
import { Platform, UserUpdateRequest } from '../types';
import { 
  User as UserIcon, 
  Mail, 
  Briefcase, 
  Globe, 
  Code, 
  ExternalLink, 
  Save, 
  CheckCircle, 
  ShieldCheck, 
  Layers, 
  Clock,
  Edit3
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/common/BrandIcons';

export default function ProfilePage() {
  const { toggleMobileMenu } = useOutletContext<AppOutletContext>();
  const { currentUser, updateUser, isLoading } = useUser();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');

  // Form State
  const [formData, setFormData] = useState<UserUpdateRequest>({
    name: '',
    username: '',
    email: '',
    experience: 0,
    roles: [],
    portfolioLink: '',
    githubLink: '',
    linkedInLink: '',
    leetcodeLink: '',
    hackerrankLink: '',
  });

  const [rolesInput, setRolesInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        username: currentUser.username || '',
        email: currentUser.email || '',
        experience: currentUser.experience || 0,
        roles: currentUser.roles || [],
        portfolioLink: currentUser.portfolioLink || '',
        githubLink: currentUser.githubLink || '',
        linkedInLink: currentUser.linkedInLink || '',
        leetcodeLink: currentUser.leetcodeLink || '',
        hackerrankLink: currentUser.hackerrankLink || '',
      });
      setRolesInput((currentUser.roles || []).join(', '));
    }
  }, [currentUser]);

  // Fetch connected platforms for current user (userId=1)
  useEffect(() => {
    let isMounted = true;
    const userId = currentUser?.id || 1;
    platformsApi.getByUserId(userId)
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setPlatforms(data);
        }
      })
      .catch((err) => {
        console.warn('Could not load platforms for user:', err);
      });
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  const getInitials = (name?: string, username?: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (username) return username.slice(0, 2).toUpperCase();
    return 'SP';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const parsedRoles = rolesInput
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

      const payload: UserUpdateRequest = {
        ...formData,
        roles: parsedRoles,
        experience: Number(formData.experience) || 0,
      };

      await updateUser(payload);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setActiveTab('view');
      }, 1400);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in profile-page-container">
      {/* Top Header */}
      <Header
        greeting="My Profile 👤"
        placeholder="Search profile details..."
        onToggleMobileMenu={toggleMobileMenu}
        actionButton={
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'view' ? 'edit' : 'view')}
            className="action-primary-btn"
          >
            <Edit3 size={16} />
            <span>{activeTab === 'view' ? 'Edit Profile' : 'View Profile'}</span>
          </button>
        }
      />

      {/* Spring Security / User Session Info Banner */}
      <div className="profile-notice-banner">
        <ShieldCheck size={20} color="#5932EA" />
        <div>
          <strong>Current Active Session:</strong> Viewing profile for <strong>User ID: {currentUser?.id || 1}</strong> ({currentUser?.username || 'siddhant'}).
          Spring Security authentication is currently not implemented, defaulting session to primary user (ID 1).
        </div>
      </div>

      {/* Hero Profile Card */}
      <div className="profile-hero-card">
        <div className="profile-hero-left">
          <div className="user-avatar-badge large">
            {getInitials(currentUser?.name, currentUser?.username)}
          </div>
          <div className="profile-hero-details">
            <div className="profile-hero-name-row">
              <h2 className="profile-hero-name">{currentUser?.name || 'Siddhant Prajapati'}</h2>
              <span className="profile-user-id-tag">User #{currentUser?.id || 1}</span>
            </div>
            <div className="profile-hero-sub">
              <div className="profile-hero-sub-item">
                <UserIcon size={14} color="#6B7280" />
                <span>@{currentUser?.username || 'siddhant'}</span>
              </div>
              <div className="profile-hero-sub-item">
                <Mail size={14} color="#6B7280" />
                <span>{currentUser?.email || 'sidkp.official@gmail.com'}</span>
              </div>
              {currentUser?.experience != null && (
                <div className="profile-hero-sub-item">
                  <Briefcase size={14} color="#6B7280" />
                  <span>{currentUser.experience} Years Experience</span>
                </div>
              )}
            </div>
            <div className="profile-roles-row">
              {(currentUser?.roles || ['Java Developer', 'Full Stack Developer']).map((role, idx) => (
                <span key={idx} className="profile-role-tag">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="profile-hero-actions">
          <button
            type="button"
            onClick={() => setActiveTab('view')}
            className={`filter-tab-btn ${activeTab === 'view' ? 'active' : ''}`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`filter-tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
          >
            Edit Information
          </button>
        </div>
      </div>

      {/* Success / Error Feedback Banner */}
      {saveSuccess && (
        <div className="profile-save-status success">
          <CheckCircle size={18} color="#059669" />
          <span>Profile changes saved and synchronized with database!</span>
        </div>
      )}

      {saveError && (
        <div className="profile-save-status error">
          <span>{saveError}</span>
        </div>
      )}

      {/* Main Grid: Overview vs Edit Mode */}
      <div className="profile-grid-layout">
        {/* Left Column: Accounts & Portfolios + Connected Platforms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* External Socials & Links Card */}
          <div className="profile-section-card">
            <h3 className="profile-card-title">
              <span>Portfolios & Links</span>
            </h3>
            <p className="profile-card-subtitle">Direct links to candidate profiles and portfolios</p>

            <div className="profile-links-list">
              {currentUser?.portfolioLink ? (
                <a 
                  href={currentUser.portfolioLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="profile-link-item"
                >
                  <div className="profile-link-left">
                    <div className="profile-link-icon-box">
                      <Globe size={18} color="#5932EA" />
                    </div>
                    <div>
                      <div className="profile-link-title">Personal Portfolio</div>
                      <div className="profile-link-url">{currentUser.portfolioLink}</div>
                    </div>
                  </div>
                  <ExternalLink size={16} color="#9CA3AF" />
                </a>
              ) : null}

              {currentUser?.githubLink ? (
                <a 
                  href={currentUser.githubLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="profile-link-item"
                >
                  <div className="profile-link-left">
                    <div className="profile-link-icon-box">
                      <GithubIcon size={18} color="#111827" />
                    </div>
                    <div>
                      <div className="profile-link-title">GitHub</div>
                      <div className="profile-link-url">{currentUser.githubLink}</div>
                    </div>
                  </div>
                  <ExternalLink size={16} color="#9CA3AF" />
                </a>
              ) : null}

              {currentUser?.linkedInLink ? (
                <a 
                  href={currentUser.linkedInLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="profile-link-item"
                >
                  <div className="profile-link-left">
                    <div className="profile-link-icon-box">
                      <LinkedinIcon size={18} color="#0A66C2" />
                    </div>
                    <div>
                      <div className="profile-link-title">LinkedIn</div>
                      <div className="profile-link-url">{currentUser.linkedInLink}</div>
                    </div>
                  </div>
                  <ExternalLink size={16} color="#9CA3AF" />
                </a>
              ) : null}

              {currentUser?.leetcodeLink ? (
                <a 
                  href={currentUser.leetcodeLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="profile-link-item"
                >
                  <div className="profile-link-left">
                    <div className="profile-link-icon-box">
                      <Code size={18} color="#FFA116" />
                    </div>
                    <div>
                      <div className="profile-link-title">LeetCode</div>
                      <div className="profile-link-url">{currentUser.leetcodeLink}</div>
                    </div>
                  </div>
                  <ExternalLink size={16} color="#9CA3AF" />
                </a>
              ) : null}

              {!currentUser?.portfolioLink && !currentUser?.githubLink && !currentUser?.linkedInLink && (
                <div className="profile-link-empty">
                  No public links configured yet. Use Edit mode to add your GitHub, LinkedIn, or Portfolio.
                </div>
              )}
            </div>
          </div>

          {/* Connected Job Hunting Platforms */}
          <div className="profile-section-card">
            <h3 className="profile-card-title">
              <span>Connected Job Platforms</span>
              <span className="tag-pill">{platforms.length} Platforms</span>
            </h3>
            <p className="profile-card-subtitle">Job search platforms linked to User #{currentUser?.id || 1}</p>

            {platforms.length > 0 ? (
              <div className="platforms-grid">
                {platforms.map((plat) => (
                  <a
                    key={plat.id || plat.name}
                    href={plat.accountLink || '#'}
                    target={plat.accountLink ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="platform-pill-card"
                  >
                    <div>
                      <div className="platform-pill-name">{plat.name}</div>
                      {plat.accountLink && (
                        <div style={{ fontSize: '11px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                          <span>Open Profile</span>
                          <ExternalLink size={10} />
                        </div>
                      )}
                    </div>
                    {plat.jobPostCount != null && plat.jobPostCount > 0 && (
                      <span className="platform-post-count">{plat.jobPostCount} posts</span>
                    )}
                  </a>
                ))}
              </div>
            ) : (
              <div className="profile-link-empty">No platforms associated with this user yet.</div>
            )}
          </div>
        </div>

        {/* Right Column: Form or Overview Details */}
        <div className="profile-section-card">
          {activeTab === 'view' ? (
            <div>
              <h3 className="profile-card-title">
                <span>Account Information</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className="filter-tab-btn"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  Edit Information
                </button>
              </h3>
              <p className="profile-card-subtitle" style={{ marginBottom: '20px' }}>
                Primary user profile data stored in database
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Full Name</div>
                  <div style={{ fontSize: '15px', color: '#111827', fontWeight: 600, marginTop: '4px' }}>
                    {currentUser?.name || '—'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Username</div>
                  <div style={{ fontSize: '15px', color: '#111827', fontWeight: 600, marginTop: '4px' }}>
                    @{currentUser?.username || '—'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Email Address</div>
                  <div style={{ fontSize: '15px', color: '#111827', fontWeight: 600, marginTop: '4px' }}>
                    {currentUser?.email || '—'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Total Experience</div>
                  <div style={{ fontSize: '15px', color: '#111827', fontWeight: 600, marginTop: '4px' }}>
                    {currentUser?.experience != null ? `${currentUser.experience} Years` : '—'}
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Target Job Roles</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {(currentUser?.roles || []).map((r, i) => (
                      <span key={i} className="profile-role-tag">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                {currentUser?.createdAt && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Account Registered</div>
                    <div style={{ fontSize: '13px', color: '#374151', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} color="#9CA3AF" />
                      <span>{new Date(currentUser.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Edit Form */
            <form onSubmit={handleSave} className="modal-form">
              <h3 className="profile-card-title">
                <span>Update Profile Details</span>
              </h3>
              <p className="profile-card-subtitle">
                Changes will be saved to MySQL database via Spring Boot REST endpoint `PUT /api/users/{currentUser?.id || 1}`
              </p>

              <div className="profile-form-grid">
                <div className="modal-form-group">
                  <label className="modal-form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="modal-input-field"
                    placeholder="Siddhant Prajapati"
                  />
                </div>

                <div className="modal-form-group">
                  <label className="modal-form-label">Username *</label>
                  <input
                    type="text"
                    required
                    value={formData.username || ''}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="modal-input-field"
                    placeholder="siddhant"
                  />
                </div>

                <div className="modal-form-group">
                  <label className="modal-form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="modal-input-field"
                    placeholder="sidkp.official@gmail.com"
                  />
                </div>

                <div className="modal-form-group">
                  <label className="modal-form-label">Years of Experience</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.experience ?? ''}
                    onChange={(e) => setFormData({ ...formData, experience: parseFloat(e.target.value) || 0 })}
                    className="modal-input-field"
                    placeholder="2.7"
                  />
                </div>

                <div className="modal-form-group profile-form-full">
                  <label className="modal-form-label">Target Roles (comma-separated)</label>
                  <input
                    type="text"
                    value={rolesInput}
                    onChange={(e) => setRolesInput(e.target.value)}
                    className="modal-input-field"
                    placeholder="Java Developer, Full Stack Developer, Backend Engineer"
                  />
                </div>

                <div className="modal-form-group profile-form-full">
                  <label className="modal-form-label">Personal Portfolio URL</label>
                  <input
                    type="url"
                    value={formData.portfolioLink || ''}
                    onChange={(e) => setFormData({ ...formData, portfolioLink: e.target.value })}
                    className="modal-input-field"
                    placeholder="https://siddhant-portfolio-k3vf.onrender.com/"
                  />
                </div>

                <div className="modal-form-group">
                  <label className="modal-form-label">GitHub Profile URL</label>
                  <input
                    type="url"
                    value={formData.githubLink || ''}
                    onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                    className="modal-input-field"
                    placeholder="https://github.com/siddhant-prajapati"
                  />
                </div>

                <div className="modal-form-group">
                  <label className="modal-form-label">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={formData.linkedInLink || ''}
                    onChange={(e) => setFormData({ ...formData, linkedInLink: e.target.value })}
                    className="modal-input-field"
                    placeholder="https://www.linkedin.com/in/siddhant-prajapati-..."
                  />
                </div>

                <div className="modal-form-group">
                  <label className="modal-form-label">LeetCode Profile URL</label>
                  <input
                    type="url"
                    value={formData.leetcodeLink || ''}
                    onChange={(e) => setFormData({ ...formData, leetcodeLink: e.target.value })}
                    className="modal-input-field"
                    placeholder="https://leetcode.com/u/..."
                  />
                </div>

                <div className="modal-form-group">
                  <label className="modal-form-label">HackerRank Profile URL</label>
                  <input
                    type="url"
                    value={formData.hackerrankLink || ''}
                    onChange={(e) => setFormData({ ...formData, hackerrankLink: e.target.value })}
                    className="modal-input-field"
                    placeholder="https://hackerrank.com/..."
                  />
                </div>
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  onClick={() => setActiveTab('view')}
                  className="modal-cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="modal-submit-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Save size={16} />
                  <span>{isSubmitting ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
