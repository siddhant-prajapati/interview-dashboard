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
  Edit3,
  Plus,
  Trash2,
  Eye,
  AlertCircle
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/common/BrandIcons';
import Modal from '../components/common/Modal';

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

  // Platform Modal & Management State
  const [viewingPlatform, setViewingPlatform] = useState<Platform | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [addPlatformForm, setAddPlatformForm] = useState({ name: '', accountLink: '', jobPostCount: '0' });
  const [editPlatformForm, setEditPlatformForm] = useState({ name: '', accountLink: '', jobPostCount: '0' });
  const [isSubmittingPlatform, setIsSubmittingPlatform] = useState(false);
  const [platformFeedback, setPlatformFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
  const loadPlatforms = async () => {
    const userId = currentUser?.id || 1;
    try {
      const data = await platformsApi.getByUserId(userId);
      if (Array.isArray(data)) {
        setPlatforms(data);
      }
    } catch (err) {
      console.warn('Could not load platforms for user:', err);
    }
  };

  useEffect(() => {
    loadPlatforms();
    const handlePlatformSync = () => loadPlatforms();
    window.addEventListener('platforms-updated', handlePlatformSync);
    return () => window.removeEventListener('platforms-updated', handlePlatformSync);
  }, [currentUser?.id]);

  const handleAddPlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addPlatformForm.name.trim()) return;

    setIsSubmittingPlatform(true);
    try {
      const created = await platformsApi.create({
        name: addPlatformForm.name.trim(),
        accountLink: addPlatformForm.accountLink.trim(),
        jobPostCount: parseInt(addPlatformForm.jobPostCount, 10) || 0,
        userId: currentUser?.id || 1,
      });

      const enriched: Platform = {
        id: created?.id || Date.now(),
        name: addPlatformForm.name.trim(),
        accountLink: addPlatformForm.accountLink.trim(),
        jobPostCount: parseInt(addPlatformForm.jobPostCount, 10) || 0,
        userId: currentUser?.id || 1,
      };

      setPlatforms((prev) => [...prev, created || enriched]);
      setIsAddModalOpen(false);
      setAddPlatformForm({ name: '', accountLink: '', jobPostCount: '0' });
      setPlatformFeedback({ type: 'success', text: `Platform "${enriched.name}" added successfully!` });
      setTimeout(() => setPlatformFeedback(null), 3000);
      window.dispatchEvent(new Event('platforms-updated'));
    } catch (err: any) {
      setPlatformFeedback({ type: 'error', text: err.message || 'Failed to add platform' });
    } finally {
      setIsSubmittingPlatform(false);
    }
  };

  const handleUpdatePlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlatform || !editPlatformForm.name.trim()) return;

    setIsSubmittingPlatform(true);
    try {
      const payload = {
        name: editPlatformForm.name.trim(),
        accountLink: editPlatformForm.accountLink.trim(),
        jobPostCount: parseInt(editPlatformForm.jobPostCount, 10) || 0,
        userId: currentUser?.id || 1,
      };

      const updated = await platformsApi.update(editingPlatform.id!, payload);
      setPlatforms((prev) =>
        prev.map((p) => (p.id === editingPlatform.id ? { ...p, ...payload, ...(updated || {}) } : p))
      );
      setEditingPlatform(null);
      setPlatformFeedback({ type: 'success', text: `Platform "${payload.name}" updated successfully!` });
      setTimeout(() => setPlatformFeedback(null), 3000);
      window.dispatchEvent(new Event('platforms-updated'));
    } catch (err: any) {
      setPlatformFeedback({ type: 'error', text: err.message || 'Failed to update platform' });
    } finally {
      setIsSubmittingPlatform(false);
    }
  };

  const handleDeletePlatform = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove platform "${name}"?`)) return;

    try {
      await platformsApi.delete(id);
      setPlatforms((prev) => prev.filter((p) => p.id !== id));
      if (viewingPlatform?.id === id) setViewingPlatform(null);
      setPlatformFeedback({ type: 'success', text: `Platform "${name}" removed.` });
      setTimeout(() => setPlatformFeedback(null), 3000);
      window.dispatchEvent(new Event('platforms-updated'));
    } catch (err: any) {
      setPlatformFeedback({ type: 'error', text: err.message || 'Failed to delete platform' });
    }
  };

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
        {/* Left Column: Accounts & Portfolios */}
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

      {/* Connected Job Hunting Platforms — Full Width Section */}
      <div className="profile-section-card profile-platforms-fullwidth-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 className="profile-card-title" style={{ margin: 0 }}>
              <span>Connected Job Platforms</span>
              <span className="tag-pill">{platforms.length} Platforms</span>
            </h3>
            <p className="profile-card-subtitle" style={{ marginTop: '4px', marginBottom: 0 }}>
              Job search and application platforms linked to User #{currentUser?.id || 1}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setAddPlatformForm({ name: '', accountLink: '', jobPostCount: '0' });
              setIsAddModalOpen(true);
            }}
            className="platform-add-btn-header"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Add Platform</span>
          </button>
        </div>

        {platformFeedback && (
          <div
            className={`profile-save-status ${platformFeedback.type}`}
            style={{ padding: '10px 14px', fontSize: '12.5px', marginTop: '14px', marginBottom: '4px' }}
          >
            {platformFeedback.type === 'success' ? (
              <CheckCircle size={15} color="#059669" />
            ) : (
              <AlertCircle size={15} color="#991B1B" />
            )}
            <span>{platformFeedback.text}</span>
          </div>
        )}

        {platforms.length > 0 ? (
          <div className="platforms-grid" style={{ marginTop: '18px' }}>
            {platforms.map((plat) => (
              <div
                key={plat.id || plat.name}
                className="platform-pill-card platform-interactive-card"
              >
                <div
                  className="platform-card-main-info"
                  onClick={() => setViewingPlatform(plat)}
                  style={{ cursor: 'pointer', flex: 1, minWidth: 0 }}
                  title="Click to view platform details"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="platform-pill-name">{plat.name}</span>
                    {plat.jobPostCount != null && plat.jobPostCount > 0 && (
                      <span className="platform-post-count">{plat.jobPostCount} posts</span>
                    )}
                  </div>
                  {plat.accountLink ? (
                    <a
                      href={plat.accountLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="platform-link-subtext"
                      title={`Open ${plat.name} in new tab`}
                    >
                      <span>Open Profile</span>
                      <ExternalLink size={11} />
                    </a>
                  ) : (
                    <span style={{ fontSize: '11.5px', color: '#9CA3AF' }}>No URL linked</span>
                  )}
                </div>

                <div className="platform-card-action-bar">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingPlatform(plat);
                    }}
                    className="platform-action-btn view-btn"
                    title="View Platform Details"
                    aria-label={`View ${plat.name}`}
                  >
                    <Eye size={14} color="#5932EA" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPlatform(plat);
                      setEditPlatformForm({
                        name: plat.name,
                        accountLink: plat.accountLink || '',
                        jobPostCount: String(plat.jobPostCount ?? 0),
                      });
                    }}
                    className="platform-action-btn edit-btn"
                    title="Edit Platform"
                    aria-label={`Edit ${plat.name}`}
                  >
                    <Edit3 size={14} color="#2563EB" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlatform(plat.id!, plat.name);
                    }}
                    className="platform-action-btn delete-btn"
                    title="Remove Platform"
                    aria-label={`Remove ${plat.name}`}
                  >
                    <Trash2 size={14} color="#DF0404" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="profile-link-empty" style={{ marginTop: '16px' }}>
            No platforms associated with this user yet.
          </div>
        )}
      </div>

      {/* View Platform Details Modal */}
      <Modal
        isOpen={!!viewingPlatform}
        onClose={() => setViewingPlatform(null)}
        title={`Platform Details — ${viewingPlatform?.name || ''}`}
      >
        {viewingPlatform && (
          <div className="application-view-container">
            <div className="application-view-hero">
              <div className="application-view-avatar">
                <Globe size={24} color="#FFFFFF" />
              </div>
              <div className="application-view-header-info">
                <div className="application-view-title-row">
                  <h3 className="application-view-role">{viewingPlatform.name}</h3>
                  <span className="platform-post-count" style={{ fontSize: '12px', padding: '4px 10px' }}>
                    {viewingPlatform.jobPostCount ?? 0} Applications Logged
                  </span>
                </div>
                <div className="application-view-company-line">
                  <span>Linked to Candidate Profile #{viewingPlatform.userId || 1}</span>
                </div>
              </div>
            </div>

            <div className="application-view-grid">
              <div className="application-view-card">
                <span className="application-view-card-label">Platform Name</span>
                <span className="application-view-card-value">{viewingPlatform.name}</span>
              </div>
              <div className="application-view-card">
                <span className="application-view-card-label">Applications / Posts</span>
                <span className="application-view-card-value highlight-val">
                  {viewingPlatform.jobPostCount ?? 0}
                </span>
              </div>
              <div className="application-view-card" style={{ gridColumn: '1 / -1' }}>
                <span className="application-view-card-label">Account / Portal URL</span>
                {viewingPlatform.accountLink ? (
                  <a
                    href={viewingPlatform.accountLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="company-view-card-link"
                    style={{ marginTop: '4px' }}
                  >
                    <span>{viewingPlatform.accountLink}</span>
                    <ExternalLink size={13} />
                  </a>
                ) : (
                  <span className="application-view-card-value">—</span>
                )}
              </div>
            </div>

            <div className="modal-footer-actions">
              <button
                type="button"
                onClick={() => setViewingPlatform(null)}
                className="modal-cancel-btn"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const plat = viewingPlatform;
                  setViewingPlatform(null);
                  setEditingPlatform(plat);
                  setEditPlatformForm({
                    name: plat.name,
                    accountLink: plat.accountLink || '',
                    jobPostCount: String(plat.jobPostCount ?? 0),
                  });
                }}
                className="modal-submit-btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Edit3 size={15} />
                <span>Edit Platform</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Platform Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Job Search Platform"
      >
        <form onSubmit={handleAddPlatform} className="modal-form">
          <div className="modal-form-group">
            <label className="modal-form-label">Platform Name *</label>
            <input
              type="text"
              required
              value={addPlatformForm.name}
              onChange={(e) => setAddPlatformForm({ ...addPlatformForm, name: e.target.value })}
              className="modal-input-field"
              placeholder="e.g. LinkedIn, Wellfound, Indeed, Dice"
              autoFocus
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Account / Profile URL</label>
            <input
              type="url"
              value={addPlatformForm.accountLink}
              onChange={(e) => setAddPlatformForm({ ...addPlatformForm, accountLink: e.target.value })}
              className="modal-input-field"
              placeholder="https://..."
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Applications / Job Post Count</label>
            <input
              type="number"
              min="0"
              value={addPlatformForm.jobPostCount}
              onChange={(e) => setAddPlatformForm({ ...addPlatformForm, jobPostCount: e.target.value })}
              className="modal-input-field"
              placeholder="0"
            />
          </div>

          <div className="modal-footer-actions">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="modal-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingPlatform}
              className="modal-submit-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} />
              <span>{isSubmittingPlatform ? 'Adding...' : 'Add Platform'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Platform Modal */}
      <Modal
        isOpen={!!editingPlatform}
        onClose={() => setEditingPlatform(null)}
        title={`Edit Platform — ${editingPlatform?.name || ''}`}
      >
        <form onSubmit={handleUpdatePlatform} className="modal-form">
          <div className="modal-form-group">
            <label className="modal-form-label">Platform Name *</label>
            <input
              type="text"
              required
              value={editPlatformForm.name}
              onChange={(e) => setEditPlatformForm({ ...editPlatformForm, name: e.target.value })}
              className="modal-input-field"
              placeholder="e.g. LinkedIn, Wellfound"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Account / Profile URL</label>
            <input
              type="url"
              value={editPlatformForm.accountLink}
              onChange={(e) => setEditPlatformForm({ ...editPlatformForm, accountLink: e.target.value })}
              className="modal-input-field"
              placeholder="https://..."
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Applications / Job Post Count</label>
            <input
              type="number"
              min="0"
              value={editPlatformForm.jobPostCount}
              onChange={(e) => setEditPlatformForm({ ...editPlatformForm, jobPostCount: e.target.value })}
              className="modal-input-field"
              placeholder="0"
            />
          </div>

          <div className="modal-footer-actions">
            <button
              type="button"
              onClick={() => setEditingPlatform(null)}
              className="modal-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingPlatform}
              className="modal-submit-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={15} />
              <span>{isSubmittingPlatform ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
