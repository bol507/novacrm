import apiClient from '@/shared/lib/axios';
import type { AuthResponse, LoginCredentials, User } from '@/features/auth/types/auth';



export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('auth/login', credentials);
    const data: AuthResponse = response.data;
    
    // Guardar token
    localStorage.setItem('access_token', data.access_token);
    
    return data; 
  },

  async logout(): Promise<void> {
    localStorage.removeItem('access_token');
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
};