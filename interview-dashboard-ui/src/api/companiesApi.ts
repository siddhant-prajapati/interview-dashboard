import { apiRequest } from './client';
import { Company, PageResponse } from '../types';

export const companiesApi = {
  async getAll(params: Record<string, any> = {}): Promise<PageResponse<Company>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<PageResponse<Company>>(`/companies${queryString}`);
  },

  async getById(id: number): Promise<Company> {
    return apiRequest<Company>(`/companies/${id}`);
  },

  async create(data: any): Promise<Company> {
    return apiRequest<Company>('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: any): Promise<Company> {
    return apiRequest<Company>(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return apiRequest<void>(`/companies/${id}`, {
      method: 'DELETE',
    });
  },
};
