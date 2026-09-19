import { apiRequest } from './client';
import { PreparationTopic, PreparationItem, PageResponse } from '../types';

export const preparationApi = {
  async getTopics(params: Record<string, any> = {}): Promise<PageResponse<PreparationTopic>> {
    const query = new URLSearchParams(params).toString();
    return apiRequest<PageResponse<PreparationTopic>>(`/preparation-topics${query ? `?${query}` : ''}`);
  },

  async createTopic(data: any): Promise<PreparationTopic> {
    return apiRequest<PreparationTopic>('/preparation-topics', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteTopic(id: number): Promise<void> {
    return apiRequest<void>(`/preparation-topics/${id}`, {
      method: 'DELETE',
    });
  },

  async getItems(params: Record<string, any> = {}): Promise<PageResponse<PreparationItem>> {
    const query = new URLSearchParams(params).toString();
    return apiRequest<PageResponse<PreparationItem>>(`/preparation-items${query ? `?${query}` : ''}`);
  },

  async createItem(data: any): Promise<PreparationItem> {
    return apiRequest<PreparationItem>('/preparation-items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getUserProgress(params: Record<string, any> = {}): Promise<any> {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/user-topic-progress${query ? `?${query}` : ''}`);
  },

  async updateUserProgress(id: number, data: any): Promise<any> {
    return apiRequest(`/user-topic-progress/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
