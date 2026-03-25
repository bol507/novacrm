import type { PaginatedResponse } from '@/features/clients/types/client';
import apiClient from '@/shared/lib/axios';
import type { User } from '../types/user';

export const userService = {
  /**
   * Get paginated list of active users
   * 
   * @param page Page number (1-based)
   * @param perPage Items per page
   * @param search Optional search term to filter by name/email
   * @returns Promise with paginated response of users
   * 
   * @example
   * const { data } = await userService.getUsers(1, 20, 'john');
   */
  async getUsers(
    page: number = 1,
    perPage: number = 20,
    search?: string
  ): Promise<PaginatedResponse<User>> {
    const params: Record<string, any> = { 
      page, 
      per_page: perPage  
    };
    
    if (search && search.trim()) {
      params.search = search.trim();
    }

    const response = await apiClient.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  },

  /**
   * Get single user by ID
   * 
   * @param id User ID to retrieve
   * @returns Promise with user data wrapped in { data: User }
   */
  async getUserById(id: number): Promise<{ data: User }> {
    const response = await apiClient.get<{ data: User }>(`/users/${id}`);
    return response.data;
  },

  /**
   * Get current authenticated user
   * 
   * @returns Promise with current user data
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ data: User }>('/auth/me');
    return response.data.data;
  },

  async createUser(userData: any) {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  async updateUserProfile(id: number, userData: any): Promise<void> {
    await apiClient.put(`/users/${id}/profile`, userData);
  },

  async changeUserPassword(id: number, newPassword: string): Promise<void> {
    await apiClient.put(`/users/${id}/password`, { new_password: newPassword });
  },

  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  async searchUsers(searchTerm: string) {
    const response = await apiClient.get('/users/search', {
      params: { q: searchTerm }
    });
    return response.data.data;
  },

  async findUserByFullName(fullName: string) {
    const response = await apiClient.get('/users/find-by-full-name', {
      params: { full_name: fullName }
    });
    return response.data.data;
  }
};