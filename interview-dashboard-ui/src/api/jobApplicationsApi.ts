import { apiRequest } from './client';
import { JobApplication, PageResponse } from '../types';

export const jobApplicationsApi = {
  async getAll(params: Record<string, any> = {}): Promise<PageResponse<JobApplication>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<PageResponse<JobApplication>>(`/job-applications${queryString}`);
  },

  async getById(id: number): Promise<JobApplication> {
    return apiRequest<JobApplication>(`/job-applications/${id}`);
  },

  async create(data: any): Promise<JobApplication> {
    return apiRequest<JobApplication>('/job-applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async createComposite(compositeData: any): Promise<JobApplication> {
    return apiRequest<JobApplication>('/job-applications/composite', {
      method: 'POST',
      body: JSON.stringify(compositeData),
    });
  },

  async update(id: number, data: any): Promise<JobApplication> {
    return apiRequest<JobApplication>(`/job-applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return apiRequest<void>(`/job-applications/${id}`, {
      method: 'DELETE',
    });
  },
};
