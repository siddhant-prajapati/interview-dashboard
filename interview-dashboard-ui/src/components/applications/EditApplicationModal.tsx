import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { jobApplicationsApi } from '../../api/jobApplicationsApi';
import { platformsApi } from '../../api/platformsApi';
import { interviewsApi } from '../../api/interviewsApi';
import { DEFAULT_USER_ID, JobType, ApplicationStatus, Platform, JobApplication } from '../../types';
import { CompanyAutocomplete } from '../common/CompanyAutocomplete';
import { Save, AlertCircle } from 'lucide-react';

export interface EditApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: JobApplication | null;
  onSuccess?: (updatedApp: JobApplication) => void;
}

const DEFAULT_PLATFORMS = [
  { id: 1, name: 'LinkedIn' },
  { id: 2, name: 'Indeed' },
  { id: 3, name: 'Glassdoor' },
  { id: 4, name: 'Wellfound' },
  { id: 5, name: 'Monster' },
  { id: 6, name: 'Direct / Company Portal' },
];

export default function EditApplicationModal({
  isOpen,
  onClose,
  application,
  onSuccess,
}: EditApplicationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([]);

  const [formData, setFormData] = useState({
    role: '',
    companyName: '',
    location: '',
    platformId: '',
    platformName: '',
    jobType: 'REMOTE' as JobType,
    experience: '3',
    expectedSalary: '$120,000',
    postingDate: '',
    applyDate: '',
    status: 'APPLIED' as ApplicationStatus,
    about: '',
    jobUrl: '',
    followUpCount: '0',
    portfolioShared: true,
    linkedInProfileShared: true,
    technologies: 'Java 21, Spring Boot, React',
  });

  // Load platforms
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await platformsApi.getAll();
        if (!isMounted) return;
        if (res && res.content && res.content.length > 0) {
          setPlatforms(res.content);
        } else {
          setPlatforms(DEFAULT_PLATFORMS as any);
        }
      } catch {
        if (isMounted) {
          setPlatforms(DEFAULT_PLATFORMS as any);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Populate form when application prop changes
  useEffect(() => {
    if (application) {
      const coName =
        application.companyName || application.company?.name || '';
      const loc = application.company?.location || 'Remote';
      const pId =
        application.platformId ||
        (typeof application.platform === 'object' && application.platform
          ? String(application.platform.id || '')
          : '');
      const pName =
        typeof application.platform === 'object' && application.platform
          ? application.platform.name
          : (application.platform as string) || application.platformName || 'LinkedIn';

      const techs = (application.technologies || [])
        .map((t: any) => (typeof t === 'string' ? t : t.name))
        .join(', ');

      setFormData({
        role: application.role || '',
        companyName: coName,
        location: loc,
        platformId: pId ? String(pId) : '',
        platformName: pName,
        jobType: application.jobType || 'REMOTE',
        experience: String(application.experience ?? '3'),
        expectedSalary: application.expectedSalary || '$120,000',
        postingDate: application.postingDate || '',
        applyDate: application.applyDate || '',
        status: application.status || 'APPLIED',
        about: application.about || '',
        jobUrl: application.jobUrl || '',
        followUpCount: String(application.followUpCount ?? 0),
        portfolioShared: Boolean(application.portfolioShared),
        linkedInProfileShared: Boolean(application.linkedInProfileShared),
        technologies: techs || 'Java 21, Spring Boot',
      });
      setError(null);
    }
  }, [application, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;

    if (!formData.role.trim() || !formData.companyName.trim()) {
      setError('Please fill in both Target Role and Company Name');
      return;
    }

    setLoading(true);
    setError(null);

    const numericPlatformId = formData.platformId ? Number(formData.platformId) : undefined;
    const selectedPlatformObj = platforms.find((p) => p.id === numericPlatformId);
    const platformData = selectedPlatformObj
      ? selectedPlatformObj
      : { id: numericPlatformId || 1, name: formData.platformName || 'LinkedIn', userId: DEFAULT_USER_ID };

    const parsedTechs = formData.technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((name) => ({ name, type: 'LANGUAGE' }));

    const payload: any = {
      role: formData.role.trim(),
      platformId: numericPlatformId,
      platform: platformData,
      platformName: platformData.name,
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
      companyName: formData.companyName.trim(),
      company: {
        ...(application.company || {}),
        name: formData.companyName.trim(),
        location: formData.location.trim() || 'Remote',
      },
      technologies: parsedTechs,
    };

    const checkAndCreateInterview = async (targetAppId: number, status: ApplicationStatus) => {
      const stageMap: Record<string, string> = {
        HR_SCREENING: 'HR',
        TECHNICAL_ROUND: 'TECHNICAL',
        MANAGERIAL_ROUND: 'MANAGERIAL',
        HR_FINAL: 'HR_FINAL',
      };
      const targetStage = stageMap[status];
      if (!targetStage) return;

      try {
        const res = await interviewsApi.getAll();
        const existingList = res?.content || (Array.isArray(res) ? res : []);
        const exists = existingList.some(
          (i) => Number(i.jobApplicationId) === Number(targetAppId) && i.stage === targetStage
        );
        if (!exists) {
          await interviewsApi.create({
            jobApplicationId: targetAppId,
            stage: targetStage,
            status: 'SCHEDULED',
            interviewDate: new Date(Date.now() + 86400000 * 2).toISOString(),
            companyName: formData.companyName.trim(),
            role: formData.role.trim(),
            notes: `Auto-scheduled interview for ${targetStage} round (${formData.role.trim()} at ${formData.companyName.trim()})`,
          });
          window.dispatchEvent(new Event('interviews-updated'));
        }
      } catch (e) {
        console.warn('Auto interview verification / creation warning:', e);
      }
    };

    try {
      const updated = await jobApplicationsApi.update(application.id, payload);
      await checkAndCreateInterview(application.id, formData.status);
      setLoading(false);
      onClose();
      if (onSuccess) {
        onSuccess(updated || { ...application, ...payload });
      }
    } catch (err: any) {
      console.warn('Backend update failed, applying local state:', err);
      // Fallback for offline mode
      const fallbackUpdated: JobApplication = {
        ...application,
        ...payload,
      };
      await checkAndCreateInterview(application.id, formData.status);
      setLoading(false);
      onClose();
      if (onSuccess) {
        onSuccess(fallbackUpdated);
      }
    }
  };

  if (!application) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Application — ${application.role}`}
    >
      {error && (
        <div className="modal-error-alert" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

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
            <CompanyAutocomplete
              name="companyName"
              value={formData.companyName}
              onChange={(name, company) => {
                setFormData((prev) => ({
                  ...prev,
                  companyName: name,
                  location: company?.location && !prev.location ? company.location : prev.location,
                }));
              }}
              placeholder="e.g. Microsoft, Google, SmartBear..."
              required
            />
          </div>
        </div>

        {/* Row 2: Platform & Location */}
        <div className="modal-form-row">
          <div className="modal-form-group">
            <label className="modal-form-label">Platform</label>
            <select
              name="platformId"
              value={formData.platformId}
              onChange={(e) => {
                const val = e.target.value;
                const found = platforms.find((p) => String(p.id) === val);
                setFormData((prev) => ({
                  ...prev,
                  platformId: val,
                  platformName: found ? found.name : prev.platformName,
                }));
              }}
              className="modal-select-field"
            >
              <option value="">Default (LinkedIn)</option>
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Headquarters / Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="modal-input-field"
              placeholder="e.g. San Francisco, CA or Remote"
            />
          </div>
        </div>

        {/* Row 3: Stage Status & Work Arrangement */}
        <div className="modal-form-row">
          <div className="modal-form-group">
            <label className="modal-form-label">Stage Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="modal-select-field"
            >
              <option value="APPLIED">Applied</option>
              <option value="HR_SCREENING">HR Screening</option>
              <option value="TECHNICAL_ROUND">Technical Round</option>
              <option value="MANAGERIAL_ROUND">Managerial Round</option>
              <option value="HR_FINAL">HR Final Round</option>
              <option value="OFFER">Offer 🎉</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Work Policy / Arrangement</label>
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

        {/* Row 4: Compensation & Experience */}
        <div className="modal-form-row">
          <div className="modal-form-group">
            <label className="modal-form-label">Expected Salary / Compensation</label>
            <input
              type="text"
              name="expectedSalary"
              value={formData.expectedSalary}
              onChange={handleChange}
              className="modal-input-field"
              placeholder="e.g. $130,000 / ₹25 LPA"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Required Experience (Years)</label>
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="modal-input-field"
              min="0"
              max="50"
              step="0.5"
            />
          </div>
        </div>

        {/* Row 5: Dates */}
        <div className="modal-form-row">
          <div className="modal-form-group">
            <label className="modal-form-label">Applied Date</label>
            <input
              type="date"
              name="applyDate"
              value={formData.applyDate}
              onChange={handleChange}
              className="modal-input-field"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Job Posting Date</label>
            <input
              type="date"
              name="postingDate"
              value={formData.postingDate}
              onChange={handleChange}
              className="modal-input-field"
            />
          </div>
        </div>

        {/* Row 6: Tech Stack */}
        <div className="modal-form-group">
          <label className="modal-form-label">Tech Stack (Comma Separated)</label>
          <input
            type="text"
            name="technologies"
            value={formData.technologies}
            onChange={handleChange}
            className="modal-input-field"
            placeholder="e.g. Java 21, Spring Boot 3, React 19, MySQL, AWS"
          />
        </div>

        {/* Row 7: Job Listing URL & Follow-Ups */}
        <div className="modal-form-row">
          <div className="modal-form-group" style={{ flex: 2 }}>
            <label className="modal-form-label">Job Listing URL</label>
            <input
              type="url"
              name="jobUrl"
              value={formData.jobUrl}
              onChange={handleChange}
              className="modal-input-field"
              placeholder="https://..."
            />
          </div>

          <div className="modal-form-group" style={{ flex: 1 }}>
            <label className="modal-form-label">Follow-Up Count</label>
            <input
              type="number"
              name="followUpCount"
              value={formData.followUpCount}
              onChange={handleChange}
              className="modal-input-field"
              min="0"
              max="20"
            />
          </div>
        </div>

        {/* Row 8: About / Role Notes */}
        <div className="modal-form-group">
          <label className="modal-form-label">About the Role / Recruiter Notes</label>
          <textarea
            name="about"
            value={formData.about}
            onChange={handleChange}
            className="modal-textarea-field"
            placeholder="Key responsibilities, team details, interview expectations..."
            rows={3}
          />
        </div>

        {/* Checkbox Rows */}
        <div className="modal-form-row" style={{ marginTop: '4px' }}>
          <div className="checkbox-row" style={{ flex: 1 }}>
            <input
              type="checkbox"
              id="editPortfolioShared"
              name="portfolioShared"
              checked={formData.portfolioShared}
              onChange={handleChange}
            />
            <label htmlFor="editPortfolioShared" className="checkbox-label">
              Portfolio Shared with Recruiter
            </label>
          </div>

          <div className="checkbox-row" style={{ flex: 1 }}>
            <input
              type="checkbox"
              id="editLinkedInShared"
              name="linkedInProfileShared"
              checked={formData.linkedInProfileShared}
              onChange={handleChange}
            />
            <label htmlFor="editLinkedInShared" className="checkbox-label">
              LinkedIn Profile Included
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer-actions">
          <button type="button" onClick={onClose} className="modal-cancel-btn">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="modal-submit-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={16} />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
