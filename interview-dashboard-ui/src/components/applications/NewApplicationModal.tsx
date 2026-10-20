import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { jobApplicationsApi } from '../../api/jobApplicationsApi';
import { platformsApi } from '../../api/platformsApi';
import { DEFAULT_USER_ID, JobType, ApplicationStatus, Platform } from '../../types';

export interface NewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newApp: any) => void;
}

export default function NewApplicationModal({ isOpen, onClose, onSuccess }: NewApplicationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPlatforms, setUserPlatforms] = useState<Platform[]>([]);
  const [platformsLoading, setPlatformsLoading] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    role: '',
    companyName: '',
    location: 'United States',
    platformId: '' as string, // will hold the selected platform's id
    jobType: 'REMOTE' as JobType,
    experience: '4.0',
    expectedSalary: '$130,000',
    postingDate: todayStr,
    applyDate: todayStr,
    status: 'APPLIED' as ApplicationStatus,
    followUpCount: '0',
    jobUrl: '',
    technologies: 'Java 21, Spring Boot, MySQL',
    about: '',
    portfolioShared: true,
    linkedInProfileShared: true,
  });

  // Fetch user's platforms when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchPlatforms = async () => {
      setPlatformsLoading(true);
      try {
        const platforms = await platformsApi.getByUserId(DEFAULT_USER_ID);
        setUserPlatforms(platforms);
        // Default-select the first platform if available and none is selected
        if (platforms.length > 0 && !formData.platformId) {
          setFormData((prev) => ({ ...prev, platformId: String(platforms[0].id) }));
        }
      } catch (err) {
        console.error('Failed to fetch platforms:', err);
      } finally {
        setPlatformsLoading(false);
      }
    };

    fetchPlatforms();
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    const name = target.name;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role.trim() || !formData.companyName.trim()) {
      setError('Please fill in both Target Role and Company Name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build platform payload from the selected platform
      const selectedPlatform = userPlatforms.find(
        (p) => String(p.id) === formData.platformId
      );

      const platformId = selectedPlatform?.id ? Number(selectedPlatform.id) : undefined;
      const platformNested = !platformId
        ? {
            name: 'Other',
            userId: DEFAULT_USER_ID,
          }
        : undefined;

      const payload = {
        role: formData.role.trim(),
        platformId: platformId,
        platformNested: platformNested,
        jobType: formData.jobType,
        experience: parseFloat(formData.experience) || 0,
        expectedSalary: formData.expectedSalary.trim(),
        postingDate: formData.postingDate || formData.applyDate,
        applyDate: formData.applyDate,
        status: formData.status,
        about: formData.about.trim(),
        jobUrl: formData.jobUrl.trim(),
        followUpCount: parseInt(formData.followUpCount, 10) || 0,
        portfolioShared: Boolean(formData.portfolioShared),
        linkedInProfileShared: Boolean(formData.linkedInProfileShared),
        company: {
          name: formData.companyName.trim(),
          location: formData.location.trim() || 'Remote',
          allowedJobType: [formData.jobType],
          technologyTest: true,
        },
        resume: {
          resumeName: 'Primary_Resume.pdf',
          documentPath: '/resumes/Primary_Resume.pdf',
        },
        technologys: formData.technologies
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
          .map((name) => ({ name, type: 'LANGUAGE' })),
      };

      const result = await jobApplicationsApi.createComposite(payload);
      setLoading(false);
      onClose();
      if (onSuccess) onSuccess(result);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to create job application');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Job Application">
      {error && <div className="modal-error-alert">{error}</div>}

      <form onSubmit={handleSubmit} className="modal-form">
        {/* Row 1: Target Role & Company Name */}
        <div className="modal-form-row">
          <div className="modal-form-group">
            <label className="modal-form-label">Target Role *</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="modal-input-field"
              placeholder="e.g. Senior Java Engineer"
              required
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Company Name *</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="modal-input-field"
              placeholder="e.g. Microsoft / Tesla"
              required
            />
          </div>
        </div>

        {/* Row 2: Platform & Work Arrangement */}
        <div className="modal-form-row">
          <div className="modal-form-group">
            <label className="modal-form-label">Platform</label>
            <select
              name="platformId"
              value={formData.platformId}
              onChange={handleChange}
              className="modal-select-field"
              disabled={platformsLoading}
            >
              {platformsLoading ? (
                <option value="">Loading platforms...</option>
              ) : userPlatforms.length === 0 ? (
                <option value="">No platforms found</option>
              ) : (
                userPlatforms.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Work Arrangement (Job Type)</label>
            <select
              name="jobType"
              value={formData.jobType}
              onChange={handleChange}
              className="modal-select-field"
            >
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ON_SITE">On-Site</option>
            </select>
          </div>
        </div>

        {/* Row 3: Experience & Expected Salary */}
        <div className="modal-form-row">
          <div className="modal-form-group">
            <label className="modal-form-label">Experience (Years)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="modal-input-field"
              placeholder="e.g. 4.0"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Expected Salary</label>
            <input
              type="text"
              name="expectedSalary"
              value={formData.expectedSalary}
              onChange={handleChange}
              className="modal-input-field"
              placeholder="e.g. $130,000"
            />
          </div>
        </div>

        {/* Row 4: Posting Date & Apply Date */}
        <div className="modal-form-row">
          <div className="modal-form-group">
            <label className="modal-form-label">Posting Date</label>
            <input
              type="date"
              name="postingDate"
              value={formData.postingDate}
              onChange={handleChange}
              className="modal-input-field"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Apply Date</label>
            <input
              type="date"
              name="applyDate"
              value={formData.applyDate}
              onChange={handleChange}
              className="modal-input-field"
            />
          </div>
        </div>

        {/* Row 5: Initial Status & Follow-Up Count */}
        <div className="modal-form-row">
          <div className="modal-form-group">
            <label className="modal-form-label">Initial Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="modal-select-field"
            >
              <option value="SAVED">Saved</option>
              <option value="APPLIED">Applied</option>
              <option value="HR_SCREENING">HR Screening</option>
              <option value="TECHNICAL_ROUND">Technical Round</option>
              <option value="MANAGERIAL_ROUND">Managerial Round</option>
              <option value="HR_FINAL">HR Final</option>
              <option value="OFFER">Offer</option>
              <option value="REJECTED">Rejected</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Follow-Up Count</label>
            <input
              type="number"
              min="0"
              name="followUpCount"
              value={formData.followUpCount}
              onChange={handleChange}
              className="modal-input-field"
              placeholder="0"
            />
          </div>
        </div>

        {/* Row 6: Job Listing URL & Company Location */}
        <div className="modal-form-row">
          <div className="modal-form-group">
            <label className="modal-form-label">Job Listing URL</label>
            <input
              type="url"
              name="jobUrl"
              value={formData.jobUrl}
              onChange={handleChange}
              className="modal-input-field"
              placeholder="https://linkedin.com/jobs/view/..."
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Company Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="modal-input-field"
              placeholder="e.g. United States / Remote"
            />
          </div>
        </div>

        {/* Row 7: Key Technologies */}
        <div className="modal-form-group">
          <label className="modal-form-label">Key Technologies (comma separated)</label>
          <input
            type="text"
            name="technologies"
            value={formData.technologies}
            onChange={handleChange}
            className="modal-input-field"
            placeholder="Java 21, Spring Boot, MySQL, Docker"
          />
        </div>

        {/* Row 8: Job Description / About */}
        <div className="modal-form-group">
          <label className="modal-form-label">About / Job Description</label>
          <textarea
            name="about"
            rows={3}
            value={formData.about}
            onChange={handleChange}
            className="modal-textarea-field"
            placeholder="Key responsibilities, team details, or recruiter conversation notes..."
          />
        </div>

        {/* Row 9: Profile Sharing Checkboxes */}
        <div className="modal-checkbox-row">
          <label className="modal-checkbox-label">
            <input
              type="checkbox"
              name="portfolioShared"
              checked={formData.portfolioShared}
              onChange={handleChange}
              className="modal-checkbox-input"
            />
            <span>Portfolio Link Shared</span>
          </label>

          <label className="modal-checkbox-label">
            <input
              type="checkbox"
              name="linkedInProfileShared"
              checked={formData.linkedInProfileShared}
              onChange={handleChange}
              className="modal-checkbox-input"
            />
            <span>LinkedIn Profile Shared</span>
          </label>
        </div>

        {/* Modal Actions */}
        <div className="modal-footer-actions">
          <button type="button" onClick={onClose} className="modal-cancel-btn">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="modal-submit-btn">
            {loading ? 'Submitting...' : 'Create Application'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

