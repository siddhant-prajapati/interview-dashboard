import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/layout/Header';
import DataTable, { Column } from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { companiesApi } from '../api/companiesApi';
import { mockStore } from '../api/client';
import { Plus, CheckCircle, XCircle } from 'lucide-react';
import { Company, JobType } from '../types';
import { AppOutletContext } from '../components/layout/AppLayout';

export default function CompaniesPage() {
  const { toggleMobileMenu } = useOutletContext<AppOutletContext>();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    workOn: '',
    email: '',
    contactNumber: '',
    technologyTest: true,
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
    const newCo: Company = {
      id: Date.now(),
      ...formData,
      allowedJobType: ['REMOTE', 'HYBRID'] as JobType[],
    };
    try {
      await companiesApi.create(newCo);
    } catch (err) {
      console.warn('Backend offline, saving locally:', err);
    }
    setCompanies((prev) => [newCo, ...prev]);
    setIsModalOpen(false);
  };

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
  ];

  return (
    <div className="animate-fade-in">
      <Header
        greeting="Target Companies 🏢"
        placeholder="Search companies by domain, name..."
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
        subtitle={`Catalog of ${companies.length} hiring organizations`}
        columns={columns}
        data={companies}
        totalEntries={companies.length}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Target Company"
      >
        <form onSubmit={handleCreateCompany} className="modal-form">
          <div className="modal-form-group">
            <label className="modal-form-label">Company Name</label>
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
