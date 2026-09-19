import { apiRequest } from './client';
import { PageResponse } from '../types';

export interface UserDTO {
  id?: number;
  username: string;
  email?: string;
  createdAt?: string;
}

export const usersApi = {
  async getAll(params: Record<string, any> = {}): Promise<PageResponse<UserDTO>> {
    const query = new URLSearchParams(params).toString();
    return apiRequest<PageResponse<UserDTO>>(`/users${query ? `?${query}` : ''}`);
  },

  async getById(id: number): Promise<UserDTO> {
    return apiRequest<UserDTO>(`/users/${id}`);
  },

  async create(data: UserDTO): Promise<UserDTO> {
    return apiRequest<UserDTO>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
