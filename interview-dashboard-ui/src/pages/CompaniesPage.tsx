import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/layout/Header';
import DataTable, { Column } from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { companiesApi } from '../api/companiesApi';
import { mockStore } from '../api/client';
import {
  Plus,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Edit3,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  ExternalLink,
  Save,
  Check,
  AlertCircle
} from 'lucide-react';
import { Company, JobType } from '../types';
import { AppOutletContext } from '../components/layout/AppLayout';

const ALL_JOB_TYPES: JobType[] = ['REMOTE', 'HYBRID', 'ON_SITE'];

export default function CompaniesPage() {
  const { toggleMobileMenu } = useOutletContext<AppOutletContext>();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchFilter, setSearchFilter] = useState('');

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    workOn: '',
    email: '',
    contactNumber: '',
    technologyTest: true,
    allowedJobType: ['REMOTE', 'HYBRID'] as JobType[],
  });

  // Show Details Modal State
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Edit Modal State
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    location: '',
    workOn: '',
    email: '',
    contactNumber: '',
    technologyTest: true,
    allowedJobType: ['REMOTE', 'HYBRID'] as JobType[],
  });

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await companiesApi.getAll();
        if (!isMounted) return;
        if (res && res.content) {
          setCompanies(res.content);
        } else if (Array.isArray(res)) {
          setCompanies(res);
        } else {
          setCompanies(mockStore.companies);
        }
      } catch {
        if (isMounted) {
          setCompanies(mockStore.companies);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      allowedJobType: formData.allowedJobType.length > 0 ? formData.allowedJobType : (['REMOTE'] as JobType[]),
    };
    try {
      const created = await companiesApi.create(payload);
      setCompanies((prev) => [created || { id: Date.now(), ...payload }, ...prev]);
    } catch (err: any) {
      console.warn('Backend create fallback:', err);
      setCompanies((prev) => [{ id: Date.now(), ...payload }, ...prev]);
    }
    setFormData({
      name: '',
      location: '',
      workOn: '',
      email: '',
      contactNumber: '',
      technologyTest: true,
      allowedJobType: ['REMOTE', 'HYBRID'],
    });
    setIsModalOpen(false);
  };

  const handleOpenShow = (e: React.MouseEvent | undefined, company: Company) => {
    if (e) e.stopPropagation();
    setViewingCompany(company);
    setIsViewModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent | undefined, company: Company) => {
    if (e) e.stopPropagation();
    setEditingCompany(company);
    setEditFormData({
      name: company.name || '',
      location: company.location || '',
      workOn: company.workOn || '',
      email: company.email || '',
      contactNumber: company.contactNumber || '',
      technologyTest: company.technologyTest ?? true,
      allowedJobType: company.allowedJobType && company.allowedJobType.length > 0
        ? [...company.allowedJobType]
        : (['REMOTE', 'HYBRID'] as JobType[]),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany || !editingCompany.id) return;
    setIsSubmitting(true);
    const payload = {
      ...editFormData,
      allowedJobType: editFormData.allowedJobType.length > 0 ? editFormData.allowedJobType : (['REMOTE'] as JobType[]),
    };
    try {
      const updated = await companiesApi.update(editingCompany.id, payload);
      const finalUpdated: Company = updated || { ...editingCompany, ...payload };
      setCompanies((prev) => prev.map((c) => (c.id === editingCompany.id ? finalUpdated : c)));
      if (viewingCompany?.id === editingCompany.id) {
        setViewingCompany(finalUpdated);
      }
    } catch (err: any) {
      console.warn('Backend update fallback:', err);
      const fallbackUpdated: Company = { ...editingCompany, ...payload };
      setCompanies((prev) => prev.map((c) => (c.id === editingCompany.id ? fallbackUpdated : c)));
      if (viewingCompany?.id === editingCompany.id) {
        setViewingCompany(fallbackUpdated);
      }
    } finally {
      setIsSubmitting(false);
      setIsEditModalOpen(false);
      setEditingCompany(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id?: number) => {
    e.stopPropagation();
    if (!id) return;
    if (!window.confirm('Delete this company record?')) return;
    try {
      await companiesApi.delete(id);
    } catch (err) {
      console.warn('Backend delete fallback:', err);
    }
    setCompanies((prev) => prev.filter((c) => c.id !== id));
    if (viewingCompany?.id === id) {
      setIsViewModalOpen(false);
      setViewingCompany(null);
    }
  };

  const toggleJobTypeCreate = (jt: JobType) => {
    setFormData((prev) => {
      const exists = prev.allowedJobType.includes(jt);
      const next = exists ? prev.allowedJobType.filter((t) => t !== jt) : [...prev.allowedJobType, jt];
      return { ...prev, allowedJobType: next.length > 0 ? next : [jt] };
    });
  };

  const toggleJobTypeEdit = (jt: JobType) => {
    setEditFormData((prev) => {
      const exists = prev.allowedJobType.includes(jt);
      const next = exists ? prev.allowedJobType.filter((t) => t !== jt) : [...prev.allowedJobType, jt];
      return { ...prev, allowedJobType: next.length > 0 ? next : [jt] };
    });
  };

  const filteredCompanies = companies.filter((c) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.workOn && c.workOn.toLowerCase().includes(term)) ||
      (c.location && c.location.toLowerCase().includes(term))
    );
  });

  const columns: Column<Company>[] = [
    {
      key: 'name',
      label: 'Company Name',
      render: (row) => (
        <span className="table-cell-title">{row.name}</span>
      ),
    },
    {
      key: 'workOn',
      label: 'Core Domain',
      render: (row) => row.workOn || 'Technology & Services',
    },
    {
      key: 'allowedJobType',
      label: 'Work Policy',
      render: (row) => (
        <div className="table-cell-row-flex">
          {(row.allowedJobType || ['REMOTE']).map((jt, idx) => (
            <span key={idx} className="policy-badge-pill">{jt}</span>
          ))}
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Headquarters',
      render: (row) => row.location || 'Global',
    },
    {
      key: 'email',
      label: 'Contact Details',
      render: (row) => (
        <div>
          <div className="table-cell-email">{row.email || 'careers@domain.com'}</div>
          <div className="table-cell-subtitle">{row.contactNumber || '—'}</div>
        </div>
      ),
    },
    {
      key: 'technologyTest',
      label: 'Technical Test Required',
      render: (row) => (
        <div className="table-cell-row-flex">
          {row.technologyTest ? (
            <>
              <CheckCircle size={16} color="#00AC4F" />
              <span className="text-success-strong">Yes</span>
            </>
          ) : (
            <>
              <XCircle size={16} color="#9197B3" />
              <span className="text-muted-tag">Direct Interview</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="table-action-btn-group">
          <button
            type="button"
            onClick={(e) => handleOpenShow(e, row)}
            className="table-action-icon-btn action-show-btn"
            title="View Company Details"
            aria-label={`View details for ${row.name}`}
          >
            <Eye size={16} color="#5932EA" />
          </button>
          <button
            type="button"
            onClick={(e) => handleOpenEdit(e, row)}
            className="table-action-icon-btn action-edit-btn"
            title="Edit Company"
            aria-label={`Edit ${row.name}`}
          >
            <Edit3 size={16} color="#2563EB" />
          </button>
          <button
            type="button"
            onClick={(e) => handleDelete(e, row.id)}
            className="table-action-icon-btn action-delete-btn"
            title="Delete Company"
            aria-label={`Delete ${row.name}`}
          >
            <Trash2 size={16} color="#DF0404" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <Header
        greeting="Target Companies 🏢"
        placeholder="Search companies by domain, name..."
        searchValue={searchFilter}
        onSearchChange={setSearchFilter}
        onToggleMobileMenu={toggleMobileMenu}
        actionButton={
          <button 
            type="button" 
            onClick={() => setIsModalOpen(true)} 
            className="action-primary-btn"
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
            <span>Add Company</span>
          </button>
        }
      />

      <DataTable
        title="All Companies"
        subtitle={`Catalog of ${filteredCompanies.length} hiring organizations`}
        columns={columns}
        data={filteredCompanies}
        totalEntries={filteredCompanies.length}
        onRowClick={(row) => handleOpenShow(undefined, row)}
      />

      {/* Show Company Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingCompany(null);
        }}
        title="Company Profile"
        maxWidth="620px"
      >
        {viewingCompany && (
          <div className="company-view-container animate-fade-in">
            {/* Hero Header */}
            <div className="company-view-hero">
              <div className="company-view-avatar">
                {viewingCompany.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="company-view-header-info">
                <div className="company-view-title-row">
                  <h3 className="company-view-name">{viewingCompany.name}</h3>
                  {viewingCompany.technologyTest ? (
                    <span className="table-cell-row-flex" style={{ background: '#ECFDF5', padding: '4px 10px', borderRadius: '8px' }}>
                      <CheckCircle size={14} color="#00AC4F" />
                      <span className="text-success-strong" style={{ fontSize: '12px' }}>Coding Test Required</span>
                    </span>
                  ) : (
                    <span className="table-cell-row-flex" style={{ background: '#F1F5F9', padding: '4px 10px', borderRadius: '8px' }}>
                      <XCircle size={14} color="#64748B" />
                      <span className="text-muted-tag" style={{ fontSize: '12px' }}>Direct Interview</span>
                    </span>
                  )}
                </div>
                <div className="company-view-domain">{viewingCompany.workOn || 'Technology & Engineering Services'}</div>
                <div className="company-view-badge-row">
                  {(viewingCompany.allowedJobType || ['REMOTE']).map((jt, idx) => (
                    <span key={idx} className="policy-badge-pill">{jt}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div className="company-view-grid">
              <div className="company-view-card">
                <span className="company-view-card-label">
                  <MapPin size={14} color="#5932EA" />
                  Headquarters
                </span>
                <span className="company-view-card-value">
                  {viewingCompany.location || 'Global / Remote'}
                </span>
              </div>

              <div className="company-view-card">
                <span className="company-view-card-label">
                  <Briefcase size={14} color="#5932EA" />
                  Work Model
                </span>
                <span className="company-view-card-value">
                  {(viewingCompany.allowedJobType || ['REMOTE']).join(' • ')}
                </span>
              </div>

              <div className="company-view-card">
                <span className="company-view-card-label">
                  <Mail size={14} color="#5932EA" />
                  Recruiting Email
                </span>
                {viewingCompany.email ? (
                  <a href={`mailto:${viewingCompany.email}`} className="company-view-card-link">
                    <span>{viewingCompany.email}</span>
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="company-view-card-value">—</span>
                )}
              </div>

              <div className="company-view-card">
                <span className="company-view-card-label">
                  <Phone size={14} color="#5932EA" />
                  Contact Number
                </span>
                <span className="company-view-card-value">
                  {viewingCompany.contactNumber || '—'}
                </span>
              </div>
            </div>

            {/* Interview & Assessment Notice */}
            <div className={`company-view-notice ${viewingCompany.technologyTest ? 'notice-tech-test' : 'notice-direct-interview'}`}>
              <div className="company-view-notice-icon">
                {viewingCompany.technologyTest ? (
                  <CheckCircle size={18} color="#00AC4F" />
                ) : (
                  <AlertCircle size={18} color="#64748B" />
                )}
              </div>
              <div>
                <strong>{viewingCompany.technologyTest ? 'Technical Assessment Pipeline' : 'Direct Conversation Round'}: </strong>
                {viewingCompany.technologyTest
                  ? 'Candidates applying to this organization typically complete an algorithmic or hands-on technology assessment before behavioral and system design rounds.'
                  : 'This company bypasses initial automated test screenings in favor of direct engineering discussions, portfolio deep-dives, and technical architecture interviews.'}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modal-footer-actions">
              <button
                type="button"
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingCompany(null);
                }}
                className="modal-cancel-btn"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const toEdit = viewingCompany;
                  setIsViewModalOpen(false);
                  setViewingCompany(null);
                  handleOpenEdit(undefined, toEdit);
                }}
                className="action-primary-btn"
                style={{ padding: '9px 18px', fontSize: '13.5px' }}
              >
                <Edit3 size={15} color="#FFFFFF" />
                <span>Edit Company</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Company Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCompany(null);
        }}
        title={`Edit Company: ${editingCompany?.name || ''}`}
        maxWidth="600px"
      >
        <form onSubmit={handleUpdateCompany} className="modal-form">
          <div className="modal-form-group">
            <label className="modal-form-label">Company Name *</label>
            <input
              type="text"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              className="modal-input-field"
              placeholder="e.g. Netflix / Datadog"
              required
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Core Engineering Focus / Domain</label>
            <input
              type="text"
              value={editFormData.workOn}
              onChange={(e) => setEditFormData({ ...editFormData, workOn: e.target.value })}
              className="modal-input-field"
              placeholder="e.g. Cloud & AI Platforms"
            />
          </div>

          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-form-label">Headquarters Location</label>
              <input
                type="text"
                value={editFormData.location}
                onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                className="modal-input-field"
                placeholder="San Francisco, CA"
              />
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">Recruiting Email</label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="modal-input-field"
                placeholder="jobs@company.com"
              />
            </div>
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Phone Number</label>
            <input
              type="text"
              value={editFormData.contactNumber}
              onChange={(e) => setEditFormData({ ...editFormData, contactNumber: e.target.value })}
              className="modal-input-field"
              placeholder="(555) 019-2831"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Work Policy (Allowed Job Models)</label>
            <div className="policy-selector-wrap">
              {ALL_JOB_TYPES.map((jt) => {
                const isSelected = editFormData.allowedJobType.includes(jt);
                return (
                  <button
                    key={jt}
                    type="button"
                    onClick={() => toggleJobTypeEdit(jt)}
                    className={`policy-toggle-chip ${isSelected ? 'active' : ''}`}
                  >
                    {isSelected && <Check size={14} color="#5932EA" />}
                    <span>{jt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="checkbox-row">
            <input
              type="checkbox"
              id="editTechTest"
              checked={editFormData.technologyTest}
              onChange={(e) => setEditFormData({ ...editFormData, technologyTest: e.target.checked })}
            />
            <label htmlFor="editTechTest" className="checkbox-label">
              Includes Coding Assessment / Technology Test
            </label>
          </div>

          <div className="modal-footer-actions">
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingCompany(null);
              }}
              className="modal-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="modal-submit-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Save size={16} />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Create / Register Target Company Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Target Company"
      >
        <form onSubmit={handleCreateCompany} className="modal-form">
          <div className="modal-form-group">
            <label className="modal-form-label">Company Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="modal-input-field"
              placeholder="e.g. Netflix / Datadog"
              required
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Core Engineering Focus / Domain</label>
            <input
              type="text"
              value={formData.workOn}
              onChange={(e) => setFormData({ ...formData, workOn: e.target.value })}
              className="modal-input-field"
              placeholder="e.g. Real-Time Observability"
            />
          </div>

          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-form-label">Headquarters Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="modal-input-field"
                placeholder="San Francisco, CA"
              />
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">Recruiting Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="modal-input-field"
                placeholder="jobs@company.com"
              />
            </div>
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Phone Number</label>
            <input
              type="text"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              className="modal-input-field"
              placeholder="(555) 019-2831"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Work Policy (Allowed Job Models)</label>
            <div className="policy-selector-wrap">
              {ALL_JOB_TYPES.map((jt) => {
                const isSelected = formData.allowedJobType.includes(jt);
                return (
                  <button
                    key={jt}
                    type="button"
                    onClick={() => toggleJobTypeCreate(jt)}
                    className={`policy-toggle-chip ${isSelected ? 'active' : ''}`}
                  >
                    {isSelected && <Check size={14} color="#5932EA" />}
                    <span>{jt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="checkbox-row">
            <input
              type="checkbox"
              id="techTest"
              checked={formData.technologyTest}
              onChange={(e) => setFormData({ ...formData, technologyTest: e.target.checked })}
            />
            <label htmlFor="techTest" className="checkbox-label">
              Includes Coding Assessment / Technology Test
            </label>
          </div>

          <div className="modal-footer-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="modal-cancel-btn">
              Cancel
            </button>
            <button type="submit" className="modal-submit-btn">
              Register Company
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
