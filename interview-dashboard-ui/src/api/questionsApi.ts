import { apiRequest } from './client';
import { Question, PageResponse } from '../types';

export const questionsApi = {
  async getAll(params: Record<string, any> = {}): Promise<PageResponse<Question>> {
    const query = new URLSearchParams(params).toString();
    return apiRequest<PageResponse<Question>>(`/questions${query ? `?${query}` : ''}`);
  },

  async create(data: any): Promise<Question> {
    return apiRequest<Question>('/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return apiRequest<void>(`/questions/${id}`, {
      method: 'DELETE',
    });
  },
};
