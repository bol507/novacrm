import type { PaginatedResponse } from '@/features/clients/types/client';
import apiClient from '@/shared/lib/axios';
import type { ChangePasswordRequest, CreateUserRequest, UpdateUserRequest, User } from '../types/user';



export const userService = {
  /**
   * Retrieves a paginated list of users.
   *
   * @param page - Page number to fetch (1-based, default: 1)
   * @param perPage - Number of items per page (default: 20)
   * @param search - Optional search term to filter by name or email
   * @param active - Filter by active status only (default: true)
   * @returns Promise resolving to paginated user list response
   *
   * @example
   * // Basic pagination
   * const { data } = await userService.getUsers(1, 20);
   *
   * @example
   * // With search term
   * const { data } = await userService.getUsers(1, 20, 'john');
   *
   * @example
   * // Include inactive users
   * const { data } = await userService.getUsers(1, 20, undefined, false);
   */
  async getUsers(
    page: number = 1,
    perPage: number = 20,
    search?: string,
    active: boolean = true
  ): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      active: active.toString(),
    });

    if (search && search.trim()) {
      params.append('search', search.trim());
    }

    const response = await apiClient.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  },

  /**
   * Retrieves a single user by ID.
   *
   * @param id - The ID of the user to retrieve
   * @returns Promise resolving to the user data wrapped in { data: User }
   *
   * @example
   * const { data } = await userService.getUserById(123);
   * const user = data.data;
   */
  async getUserById(id: number): Promise<{ data: User }> {
    const response = await apiClient.get<{ data: User }>(`/users/${id}`);
    return response.data;
  },

  /**
   * Retrieves the currently authenticated user.
   *
   * @returns Promise resolving to the current user data
   *
   * @example
   * const currentUser = await userService.getCurrentUser();
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ data: User }>('/auth/me');
    return response.data.data;
  },

  /**
   * Creates a new user.
   *
   * @param userData - The user data to create
   * @returns Promise resolving to the created user response
   *
   * @example
   * const newUser = await userService.createUser({
   *   first_name: 'John',
   *   last_name: 'Doe',
   *   email: 'john@example.com',
   *   role: 'Admin'
   * });
   */
  async createUser(userData: CreateUserRequest) {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  async updateUser(id: number, userData: UpdateUserRequest) {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },

  /**
   * Updates an existing user's profile information.
   *
   * @param id - The ID of the user to update
   * @param userData - The updated user data
   * @returns Promise that resolves when update is complete
   *
   * @example
   * await userService.updateUserProfile(123, {
   *   first_name: 'Jane',
   *   last_name: 'Smith'
   * });
   */
  async updateUserProfile(id: number, userData: any): Promise<void> {
    await apiClient.put(`/users/${id}/profile`, userData);
  },

  /**
   * Changes a user's password.
   *
   * @param id - The ID of the user
   * @param data - The new password to set
   * @returns Promise that resolves when password change is complete
   *
   * @example
   * await userService.changeUserPassword(123, { new_password: 'newSecurePassword123' });
   */
  async changeUserPassword(id: number, data: ChangePasswordRequest): Promise<void> {
    await apiClient.put(`/users/${id}/change-password`, data);
  },

  /**
   * Deletes a user (soft delete).
   *
   * @param id - The ID of the user to delete
   * @returns Promise that resolves when deletion is complete
   *
   * @example
   * await userService.deleteUser(123);
   */
  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  /**
   * Searches for users by name or email for autocomplete functionality.
   *
   * @param searchTerm - The search term to match against name or email
   * @returns Promise resolving to an array of matching users
   *
   * @example
   * const results = await userService.searchUsers('john');
   */
  async searchUsers(searchTerm: string) {
    const response = await apiClient.get('/users/search', {
      params: { q: searchTerm }
    });
    return response.data.data;
  },

  /**
   * Finds a user by their full name.
   *
   * @param fullName - The exact full name to search for
   * @returns Promise resolving to the matching user
   *
   * @example
   * const user = await userService.findUserByFullName('John Doe');
   */
  async findUserByFullName(fullName: string) {
    const response = await apiClient.get('/users/find-by-full-name', {
      params: { full_name: fullName }
    });
    return response.data.data;
  },

  async checkEmailDuplicates(email: string): Promise<{ hasDuplicates: boolean; count: number }> {
    if (!email) return { hasDuplicates: false, count: 0 };

    const response = await apiClient.get('/users/check-email', {
      params: { email }
    });
    return response.data;
  }
};