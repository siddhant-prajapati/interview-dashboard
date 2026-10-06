import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, Mail, Briefcase, Globe, Code, ExternalLink, Save, CheckCircle } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { UserUpdateRequest } from '../../types';
import { GithubIcon, LinkedinIcon } from '../common/BrandIcons';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { currentUser, updateUser } = useUser();
  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');
  
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

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div 
        className="modal-box-card" 
        style={{ maxWidth: '640px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="modal-title-text">
              {activeTab === 'view' ? 'Candidate Profile' : 'Edit Candidate Profile'}
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

          {activeTab === 'view' ? (
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
            </div>
          ) : (
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
        </div>
      </div>
    </div>
  );
}
