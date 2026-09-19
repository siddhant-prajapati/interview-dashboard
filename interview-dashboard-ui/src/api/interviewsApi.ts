import { apiRequest } from './client';
import { Interview, PageResponse } from '../types';

export const interviewsApi = {
  async getAll(params: Record<string, any> = {}): Promise<PageResponse<Interview>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<PageResponse<Interview>>(`/interviews${queryString}`);
  },

  async getById(id: number): Promise<Interview> {
    return apiRequest<Interview>(`/interviews/${id}`);
  },

  async create(data: any): Promise<Interview> {
    return apiRequest<Interview>('/interviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: any): Promise<Interview> {
    return apiRequest<Interview>(`/interviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return apiRequest<void>(`/interviews/${id}`, {
      method: 'DELETE',
    });
  },
};
