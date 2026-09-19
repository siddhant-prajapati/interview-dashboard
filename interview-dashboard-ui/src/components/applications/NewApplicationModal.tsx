import React, { useState } from 'react';
import Modal from '../common/Modal';
import { jobApplicationsApi } from '../../api/jobApplicationsApi';

export interface NewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newApp: any) => void;
}

export default function NewApplicationModal({ isOpen, onClose, onSuccess }: NewApplicationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    candidateName: 'Jane Cooper',
    role: '',
    companyName: '',
    location: 'United States',
    platform: 'LinkedIn',
    jobType: 'REMOTE',
    experience: '4.0',
    expectedSalary: '$130,000',
    applyDate: new Date().toISOString().split('T')[0],
    status: 'APPLIED',
    technologies: 'Java 21, Spring Boot, MySQL',
    about: '',
    jobUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role || !formData.companyName) {
      setError('Please fill in Role and Company name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        candidateName: formData.candidateName,
        role: formData.role,
        platform: formData.platform,
        jobType: formData.jobType,
        experience: parseFloat(formData.experience) || 3.0,
        expectedSalary: formData.expectedSalary,
        postingDate: formData.applyDate,
        applyDate: formData.applyDate,
        status: formData.status,
        about: formData.about,
        jobUrl: formData.jobUrl,
        portfolioShared: true,
        linkedInProfileShared: true,
        company: {
          name: formData.companyName,
          location: formData.location,
          allowedJobType: [formData.jobType],
          technologyTest: true,
        },
        resume: {
          resumeName: `${formData.candidateName.replace(/\s+/g, '_')}_Resume.pdf`,
          documentPath: `/resumes/${formData.candidateName.replace(/\s+/g, '_')}.pdf`,
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
        <div className="modal-form-row">
          <div className="modal-form-group">
            <label className="modal-form-label">Candidate Name</label>
            <input
              type="text"
              name="candidateName"
              value={formData.candidateName}
              onChange={handleChange}
              className="modal-input-field"
              placeholder="e.g. Jane Cooper"
              required
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Target Role</label>
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
        </div>

        <div className="modal-form-row">
          <div className="modal-form-group">
            <label className="modal-form-label">Company Name</label>
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

        <div className="modal-form-row">
          <div className="modal-form-group">
            <label className="modal-form-label">Platform</label>
            <select
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              className="modal-select-field"
            >
              <option value="LinkedIn">LinkedIn</option>
              <option value="Wellfound">Wellfound (AngelList)</option>
              <option value="Indeed">Indeed</option>
              <option value="Referral">Referral</option>
              <option value="Company Portal">Company Portal</option>
            </select>
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Work Arrangement</label>
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

        <div className="modal-form-row">
          <div className="modal-form-group">
            <label className="modal-form-label">Experience (Years)</label>
            <input
              type="number"
              step="0.5"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="modal-input-field"
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
              placeholder="$130,000"
            />
          </div>
        </div>

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
              <option value="OFFER">Offer</option>
            </select>
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
