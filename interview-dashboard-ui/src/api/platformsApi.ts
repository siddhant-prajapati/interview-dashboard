import { apiRequest } from './client';
import { Platform, PlatformFilter, PageResponse } from '../types';

export const platformsApi = {
  async getAll(params: PlatformFilter & { page?: number; size?: number; sort?: string } = {}): Promise<PageResponse<Platform>> {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return apiRequest<PageResponse<Platform>>(`/platforms${query ? `?${query}` : ''}`);
  },

  async getById(id: number): Promise<Platform> {
    return apiRequest<Platform>(`/platforms/${id}`);
  },

  async getByUserId(userId: number): Promise<Platform[]> {
    return apiRequest<Platform[]>(`/platforms/user/${userId}`);
  },

  async create(data: Partial<Platform>): Promise<Platform> {
    return apiRequest<Platform>('/platforms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async createBulk(data: Partial<Platform>[]): Promise<Platform[]> {
    return apiRequest<Platform[]>('/platforms/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: Partial<Platform>): Promise<Platform> {
    return apiRequest<Platform>(`/platforms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return apiRequest<void>(`/platforms/${id}`, {
      method: 'DELETE',
    });
  },
};
