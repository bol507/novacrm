import apiClient from '@/shared/lib/axios';

export const userService = {
  async getUsers(page: number = 1, perPage: number = 20, search?: string) {
    const params: Record<string, any> = { page, per_page: perPage };
    if (search) params.search = search;

    const response = await apiClient.get('/users', { params });
    return response.data;
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
  }
};