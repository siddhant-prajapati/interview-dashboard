import { apiRequest } from './client';
import { PageResponse, User, UserUpdateRequest } from '../types';

/**
 * Default User ID used for profile operations prior to Spring Security integration.
 */
export const CURRENT_USER_ID = 1;

export type UserDTO = User;

export const usersApi = {
  async getAll(params: Record<string, any> = {}): Promise<PageResponse<User>> {
    const query = new URLSearchParams(params).toString();
    return apiRequest<PageResponse<User>>(`/users${query ? `?${query}` : ''}`);
  },

  async getById(id: number): Promise<User> {
    return apiRequest<User>(`/users/${id}`);
  },

  /**
   * Fetches the current logged-in user profile.
   * Defaults to userId = 1 until Spring Security authentication is configured.
   */
  async getCurrentUser(): Promise<User> {
    return apiRequest<User>(`/users/${CURRENT_USER_ID}`);
  },

  async create(data: Partial<User>): Promise<User> {
    return apiRequest<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: UserUpdateRequest): Promise<User> {
    return apiRequest<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return apiRequest<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};
