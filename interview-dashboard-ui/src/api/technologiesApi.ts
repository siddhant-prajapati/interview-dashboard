import { apiRequest } from './client';
import { Technology, PageResponse } from '../types';

export const technologiesApi = {
  async getAll(params: Record<string, any> = {}): Promise<PageResponse<Technology>> {
    const query = new URLSearchParams(params).toString();
    return apiRequest<PageResponse<Technology>>(`/technologies${query ? `?${query}` : ''}`);
  },

  async create(data: any): Promise<Technology> {
    return apiRequest<Technology>('/technologies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return apiRequest<void>(`/technologies/${id}`, {
      method: 'DELETE',
    });
  },
};
