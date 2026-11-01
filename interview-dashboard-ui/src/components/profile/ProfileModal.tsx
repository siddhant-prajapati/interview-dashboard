import React, { useState, useEffect } from 'react';
import {
  X, User as UserIcon, Mail, Briefcase, Globe, Code,
  ExternalLink, Save, CheckCircle, Plus, Trash2, Edit3,
  AlertCircle, Link as LinkIcon, Layers
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { UserUpdateRequest, Platform } from '../../types';
import { GithubIcon, LinkedinIcon } from '../common/BrandIcons';
import { platformsApi } from '../../api/platformsApi';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { currentUser, updateUser } = useUser();
  const [activeTab, setActiveTab] = useState<'view' | 'edit' | 'platforms'>('view');
  
  // Edit form state
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

  // Platform management state
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);
  const [isAddingPlatform, setIsAddingPlatform] = useState(false);
  const [newPlatform, setNewPlatform] = useState({ name: '', accountLink: '', jobPostCount: '0' });
  const [editingPlatformId, setEditingPlatformId] = useState<number | null>(null);
  const [editingPlatformData, setEditingPlatformData] = useState({ name: '', accountLink: '', jobPostCount: '0' });
  const [platformMessage, setPlatformMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPlatforms = async () => {
    try {
      setLoadingPlatforms(true);
      const userId = currentUser?.id || 1;
      const res = await platformsApi.getByUserId(userId);
      if (Array.isArray(res) && res.length > 0) {
        setPlatforms(res);
      } else {
        const all = await platformsApi.getAll();
        if (all && all.content) {
          setPlatforms(all.content);
        }
      }
    } catch (err) {
      console.warn('Could not load platforms:', err);
    } finally {
      setLoadingPlatforms(false);
    }
  };

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
    setSaveSuccess(false);
    setSaveError(null);
  }, [currentUser, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchPlatforms();
    }
  }, [isOpen, currentUser?.id]);

  if (!isOpen) return null;

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
      }, 1200);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Platform handlers
  const handleAddPlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlatform.name.trim()) return;

    try {
      const created = await platformsApi.create({
        name: newPlatform.name.trim(),
        accountLink: newPlatform.accountLink.trim(),
        jobPostCount: parseInt(newPlatform.jobPostCount, 10) || 0,
        userId: currentUser?.id || 1,
      });

      const enriched: Platform = {
        id: created?.id || Date.now(),
        name: newPlatform.name.trim(),
        accountLink: newPlatform.accountLink.trim(),
        jobPostCount: parseInt(newPlatform.jobPostCount, 10) || 0,
        userId: currentUser?.id || 1,
      };

      setPlatforms((prev) => [...prev, created || enriched]);
      setIsAddingPlatform(false);
      setNewPlatform({ name: '', accountLink: '', jobPostCount: '0' });
      setPlatformMessage({ type: 'success', text: `Platform "${enriched.name}" added successfully!` });
      setTimeout(() => setPlatformMessage(null), 3000);
      window.dispatchEvent(new Event('platforms-updated'));
    } catch (err: any) {
      setPlatformMessage({ type: 'error', text: err.message || 'Failed to add platform' });
    }
  };

  const handleStartEdit = (p: Platform) => {
    setEditingPlatformId(p.id || null);
    setEditingPlatformData({
      name: p.name || '',
      accountLink: p.accountLink || '',
      jobPostCount: String(p.jobPostCount ?? 0),
    });
  };

  const handleSaveEdit = async (id: number) => {
    if (!editingPlatformData.name.trim()) return;

    try {
      const payload = {
        name: editingPlatformData.name.trim(),
        accountLink: editingPlatformData.accountLink.trim(),
        jobPostCount: parseInt(editingPlatformData.jobPostCount, 10) || 0,
        userId: currentUser?.id || 1,
      };

      const updated = await platformsApi.update(id, payload);
      setPlatforms((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...payload, ...(updated || {}) } : p))
      );
      setEditingPlatformId(null);
      setPlatformMessage({ type: 'success', text: `Platform "${payload.name}" updated successfully!` });
      setTimeout(() => setPlatformMessage(null), 3000);
      window.dispatchEvent(new Event('platforms-updated'));
    } catch (err: any) {
      setPlatformMessage({ type: 'error', text: err.message || 'Failed to update platform' });
    }
  };

  const handleDeletePlatform = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from your profile platforms?`)) return;

    try {
      await platformsApi.delete(id);
      setPlatforms((prev) => prev.filter((p) => p.id !== id));
      setPlatformMessage({ type: 'success', text: `Platform "${name}" removed.` });
      setTimeout(() => setPlatformMessage(null), 3000);
      window.dispatchEvent(new Event('platforms-updated'));
    } catch (err: any) {
      setPlatformMessage({ type: 'error', text: err.message || 'Failed to remove platform' });
    }
  };

  // Reusable platform manager component
  const renderPlatformManager = () => (
    <div className="profile-platforms-section">
      <div className="profile-platforms-header">
        <div>
          <div className="profile-platforms-title">
            <Layers size={16} color="#5932EA" />
            <span>Job Platforms & Job Boards</span>
            <span className="profile-platform-count-tag">{platforms.length}</span>
          </div>
          <div className="profile-platforms-subtitle">
            Manage platforms where you actively apply (e.g. LinkedIn, Wellfound, Naukri, Indeed)
          </div>
        </div>
        {!isAddingPlatform && (
          <button
            type="button"
            onClick={() => setIsAddingPlatform(true)}
            className="profile-add-platform-btn"
          >
            <Plus size={14} />
            <span>Add Platform</span>
          </button>
        )}
      </div>

      {platformMessage && (
        <div
          className={`profile-save-status ${platformMessage.type}`}
          style={{ padding: '8px 12px', fontSize: '12px' }}
        >
          {platformMessage.type === 'success' ? (
            <CheckCircle size={14} color="#059669" />
          ) : (
            <AlertCircle size={14} color="#991B1B" />
          )}
          <span>{platformMessage.text}</span>
        </div>
      )}

      {/* Add Platform Form */}
      {isAddingPlatform && (
        <div className="profile-platform-form-card">
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
            Add New Job Platform
          </div>
          <div className="modal-form-row">
            <div className="modal-form-group" style={{ flex: 1.2 }}>
              <label className="modal-form-label">Platform Name *</label>
              <input
                type="text"
                required
                value={newPlatform.name}
                onChange={(e) => setNewPlatform({ ...newPlatform, name: e.target.value })}
                className="modal-input-field"
                placeholder="e.g. Wellfound, Dice, Indeed"
                autoFocus
              />
            </div>
            <div className="modal-form-group" style={{ flex: 0.8 }}>
              <label className="modal-form-label">Job Post Count</label>
              <input
                type="number"
                min="0"
                value={newPlatform.jobPostCount}
                onChange={(e) => setNewPlatform({ ...newPlatform, jobPostCount: e.target.value })}
                className="modal-input-field"
                placeholder="0"
              />
            </div>
          </div>
          <div className="modal-form-group">
            <label className="modal-form-label">Account / Profile URL</label>
            <input
              type="url"
              value={newPlatform.accountLink}
              onChange={(e) => setNewPlatform({ ...newPlatform, accountLink: e.target.value })}
              className="modal-input-field"
              placeholder="https://..."
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                setIsAddingPlatform(false);
                setNewPlatform({ name: '', accountLink: '', jobPostCount: '0' });
              }}
              className="modal-cancel-btn"
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddPlatform}
              className="modal-submit-btn"
              style={{ padding: '6px 16px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>Save Platform</span>
            </button>
          </div>
        </div>
      )}

      {/* Platform List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {platforms.length === 0 && !isAddingPlatform ? (
          <div className="profile-link-empty" style={{ padding: '14px', background: '#F9FAFB', borderRadius: '10px', textAlign: 'center' }}>
            No platforms added yet. Click &quot;Add Platform&quot; above to connect your job portals.
          </div>
        ) : (
          platforms.map((plat) => {
            const isEditing = editingPlatformId === plat.id;

            if (isEditing) {
              return (
                <div key={plat.id} className="profile-platform-form-card" style={{ borderColor: '#C4B5FD' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                    Edit Platform: {plat.name}
                  </div>
                  <div className="modal-form-row">
                    <div className="modal-form-group" style={{ flex: 1.2 }}>
                      <label className="modal-form-label">Platform Name *</label>
                      <input
                        type="text"
                        required
                        value={editingPlatformData.name}
                        onChange={(e) => setEditingPlatformData({ ...editingPlatformData, name: e.target.value })}
                        className="modal-input-field"
                      />
                    </div>
                    <div className="modal-form-group" style={{ flex: 0.8 }}>
                      <label className="modal-form-label">Job Post Count</label>
                      <input
                        type="number"
                        min="0"
                        value={editingPlatformData.jobPostCount}
                        onChange={(e) => setEditingPlatformData({ ...editingPlatformData, jobPostCount: e.target.value })}
                        className="modal-input-field"
                      />
                    </div>
                  </div>
                  <div className="modal-form-group">
                    <label className="modal-form-label">Account / Profile URL</label>
                    <input
                      type="url"
                      value={editingPlatformData.accountLink}
                      onChange={(e) => setEditingPlatformData({ ...editingPlatformData, accountLink: e.target.value })}
                      className="modal-input-field"
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setEditingPlatformId(null)}
                      className="modal-cancel-btn"
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(plat.id!)}
                      className="modal-submit-btn"
                      style={{ padding: '6px 16px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Save size={14} />
                      <span>Update</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={plat.id} className="profile-platform-card">
                <div className="profile-platform-left">
                  <div className="profile-platform-avatar">
                    {(plat.name || 'P').charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-platform-info">
                    <div className="profile-platform-name-row">
                      <span className="profile-platform-name">{plat.name}</span>
                      {plat.jobPostCount != null && plat.jobPostCount > 0 && (
                        <span className="platform-post-count">{plat.jobPostCount} posts</span>
                      )}
                    </div>
                    {plat.accountLink ? (
                      <a
                        href={plat.accountLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="profile-platform-link"
                      >
                        <LinkIcon size={11} />
                        <span>{plat.accountLink}</span>
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#9CA3AF' }}>No URL configured</span>
                    )}
                  </div>
                </div>

                <div className="profile-platform-actions">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(plat)}
                    className="platform-action-icon-btn edit"
                    title={`Edit ${plat.name}`}
                    aria-label={`Edit ${plat.name}`}
                  >
                    <Edit3 size={14} color="#2563EB" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePlatform(plat.id!, plat.name)}
                    className="platform-action-icon-btn delete"
                    title={`Remove ${plat.name}`}
                    aria-label={`Remove ${plat.name}`}
                  >
                    <Trash2 size={14} color="#DF0404" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div 
        className="modal-box-card" 
        style={{ maxWidth: '680px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="modal-title-text">
              {activeTab === 'view'
                ? 'Candidate Profile'
                : activeTab === 'edit'
                ? 'Edit Candidate Profile'
                : 'Manage Job Platforms'}
            </span>
            <span className="profile-user-id-tag">ID: #{currentUser?.id || 1}</span>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="modal-close-btn" 
            aria-label="Close dialog"
          >
            <X size={18} color="#7E7E7E" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', gap: '8px', padding: '14px 30px 0 30px', borderBottom: '1px solid #F0F0F0' }}>
          <button
            type="button"
            className={`filter-tab-btn ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => setActiveTab('view')}
            style={{ borderRadius: '8px 8px 0 0', padding: '8px 18px' }}
          >
            Overview
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit')}
            style={{ borderRadius: '8px 8px 0 0', padding: '8px 18px' }}
          >
            Edit Profile
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${activeTab === 'platforms' ? 'active' : ''}`}
            onClick={() => setActiveTab('platforms')}
            style={{ borderRadius: '8px 8px 0 0', padding: '8px 18px' }}
          >
            Job Platforms ({platforms.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-content">
          {saveSuccess && (
            <div className="profile-save-status success" style={{ marginBottom: '16px' }}>
              <CheckCircle size={18} color="#059669" />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          {saveError && (
            <div className="profile-save-status error" style={{ marginBottom: '16px' }}>
              <span>{saveError}</span>
            </div>
          )}

          {activeTab === 'view' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* User Header Summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <div className="user-avatar-badge large">
                  {getInitials(currentUser?.name, currentUser?.username)}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                    {currentUser?.name || 'Unnamed Candidate'}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: '2px 0 6px 0' }}>
                    @{currentUser?.username} • {currentUser?.email}
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {(currentUser?.roles || []).map((r, i) => (
                      <span key={i} className="profile-role-tag">
                        {r}
                      </span>
                    ))}
                    {currentUser?.experience != null && (
                      <span className="tag-pill" style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}>
                        {currentUser.experience} yrs exp
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Notice Chip */}
              <div className="user-security-badge" style={{ width: '100%' }}>
                <span>🔒 Current active session: User ID {currentUser?.id || 1} (Default mock login until Spring Security enabled)</span>
              </div>

              {/* Profiles & Links */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '10px' }}>
                  Professional Portfolios & Socials
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentUser?.portfolioLink && (
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
                  )}

                  {currentUser?.githubLink && (
                    <a 
                      href={currentUser.githubLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="profile-link-item"
                    >
                      <div className="profile-link-left">
                        <div className="profile-link-icon-box">
                          <GithubIcon size={18} color="#1F2937" />
                        </div>
                        <div>
                          <div className="profile-link-title">GitHub Profile</div>
                          <div className="profile-link-url">{currentUser.githubLink}</div>
                        </div>
                      </div>
                      <ExternalLink size={16} color="#9CA3AF" />
                    </a>
                  )}

                  {currentUser?.linkedInLink && (
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
                          <div className="profile-link-title">LinkedIn Profile</div>
                          <div className="profile-link-url">{currentUser.linkedInLink}</div>
                        </div>
                      </div>
                      <ExternalLink size={16} color="#9CA3AF" />
                    </a>
                  )}

                  {currentUser?.leetcodeLink && (
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
                  )}

                  {!currentUser?.portfolioLink && !currentUser?.githubLink && !currentUser?.linkedInLink && (
                    <div className="profile-link-empty" style={{ padding: '12px' }}>
                      No links added yet. Click &quot;Edit Profile&quot; to configure your portfolio and accounts.
                    </div>
                  )}
                </div>
              </div>

              {/* Connected Platforms Overview */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', margin: 0 }}>
                    Connected Job Platforms ({platforms.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => setActiveTab('platforms')}
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary, #5932EA)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Manage Platforms →
                  </button>
                </div>
                {platforms.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                    {platforms.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          backgroundColor: '#F9FAFB',
                          border: '1px solid #F3F4F6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <span style={{
                            width: '24px', height: '24px', borderRadius: '6px',
                            background: 'var(--color-primary-light, #EEF2FF)', color: 'var(--color-primary, #5932EA)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700
                          }}>
                            {(p.name || 'P').charAt(0).toUpperCase()}
                          </span>
                          <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#1F2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.name}
                          </span>
                        </div>
                        {p.jobPostCount != null && p.jobPostCount > 0 && (
                          <span style={{ fontSize: '10.5px', color: '#6B7280', fontWeight: 600 }}>
                            {p.jobPostCount}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="profile-link-empty">No platforms associated with this candidate yet.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'edit' && (
            /* Edit Form */
            <form onSubmit={handleSave} className="modal-form">
              <div className="modal-form-row">
                <div className="modal-form-group">
                  <label className="modal-form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="modal-input-field"
                    placeholder="e.g. Siddhant Prajapati"
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
                    placeholder="e.g. siddhant"
                  />
                </div>
              </div>

              <div className="modal-form-row">
                <div className="modal-form-group">
                  <label className="modal-form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="modal-input-field"
                    placeholder="e.g. user@example.com"
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
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Roles (comma-separated)</label>
                <input
                  type="text"
                  value={rolesInput}
                  onChange={(e) => setRolesInput(e.target.value)}
                  className="modal-input-field"
                  placeholder="Java Developer, Full Stack Developer"
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Portfolio Website URL</label>
                <input
                  type="url"
                  value={formData.portfolioLink || ''}
                  onChange={(e) => setFormData({ ...formData, portfolioLink: e.target.value })}
                  className="modal-input-field"
                  placeholder="https://my-portfolio.com"
                />
              </div>

              <div className="modal-form-row">
                <div className="modal-form-group">
                  <label className="modal-form-label">GitHub URL</label>
                  <input
                    type="url"
                    value={formData.githubLink || ''}
                    onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                    className="modal-input-field"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div className="modal-form-group">
                  <label className="modal-form-label">LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData.linkedInLink || ''}
                    onChange={(e) => setFormData({ ...formData, linkedInLink: e.target.value })}
                    className="modal-input-field"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>

              <div className="modal-form-row">
                <div className="modal-form-group">
                  <label className="modal-form-label">LeetCode URL</label>
                  <input
                    type="url"
                    value={formData.leetcodeLink || ''}
                    onChange={(e) => setFormData({ ...formData, leetcodeLink: e.target.value })}
                    className="modal-input-field"
                    placeholder="https://leetcode.com/u/..."
                  />
                </div>
                <div className="modal-form-group">
                  <label className="modal-form-label">HackerRank URL</label>
                  <input
                    type="url"
                    value={formData.hackerrankLink || ''}
                    onChange={(e) => setFormData({ ...formData, hackerrankLink: e.target.value })}
                    className="modal-input-field"
                    placeholder="https://hackerrank.com/..."
                  />
                </div>
              </div>

              {/* Embedded Platform Manager inside Edit Profile */}
              {renderPlatformManager()}

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
                  <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'platforms' && (
            <div>
              {renderPlatformManager()}
              <div className="modal-footer-actions" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('view')}
                  className="modal-cancel-btn"
                >
                  Back to Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className="modal-submit-btn"
                >
                  Edit Profile Info
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
