import apiClient from '@/shared/lib/axios';

const ACTIVITIES_API = '/calendar/activities';

export const activitiesService = {
  /**
   * Retrieves a single activity by ID.
   *
   * @param id - The activity ID
   * @returns Promise with activity data
   */
  getActivity: (id: number) => apiClient.get<any>(`${ACTIVITIES_API}/${id}`),

  /**
   * Retrieves a paginated list of activities with optional filters.
   *
   * @param page - Page number (1-indexed)
   * @param limit - Items per page
   * @param filters - Optional query filters (status, priority, user, date range, etc.)
   * @returns Promise with paginated activities response
   */
  getActivities: (page: number, limit: number, filters?: Record<string, any>) =>
    apiClient.get<any>(`${ACTIVITIES_API}`, {
      params: {
        page,
        limit,
        ...filters,
      },
    }),

  /**
   * Creates a new activity.
   *
   * @param data - Activity data
   * @returns Promise with created activity response
   */
  createActivity: (data: any) => apiClient.post<any>(`${ACTIVITIES_API}`, data),

  /**
   * Updates an existing activity.
   *
   * @param id - Activity ID
   * @param data - Updated activity data
   * @returns Promise with updated activity response
   */
  updateActivity: (id: number, data: any) => apiClient.patch<any>(`${ACTIVITIES_API}/${id}`, data),

  /**
   * Deletes an activity.
   *
   * @param id - Activity ID
   * @returns Promise that resolves when deletion is complete
   */
  deleteActivity: (id: number) => apiClient.delete<any>(`${ACTIVITIES_API}/${id}`),
};