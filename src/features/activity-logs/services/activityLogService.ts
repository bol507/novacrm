import apiClient from '@/shared/lib/axios';
import type { ActivityAction, ActivityLogsResponse, EntityType } from '../types/activity.types';

export interface GetRecentActivitiesOptions {
  /** Maximum number of activities to return (default: 50) */
  limit?: number;
  /** Offset for pagination (default: 0) */
  offset?: number;
  /** Filter by entity type */
  entityType?: EntityType;
  /** Filter by action type */
  action?: ActivityAction;
  /** Search term to filter by entity name */
  search?: string;
  /** Filter by user ID who performed the action */
  userId?: number;
  /** Start date in ISO 8601 format (YYYY-MM-DD) */
  dateFrom?: string;
  /** End date in ISO 8601 format (YYYY-MM-DD) */
  dateTo?: string;
}

/**
 * Service for managing system activities.
 *
 * Communicates with the GET /api/activity/activity-logs endpoint.
 * Supports pagination with offset/limit, filtering by entity type,
 * action type, search term, user ID, and date range.
 */
export const activityLogService = {
  /**
   * Retrieves recent system activities with optional filters and pagination.
   *
   * @param options - Query options for filtering and pagination
   * @param options.limit - Maximum number of activities to return (default: 50)
   * @param options.offset - Offset for pagination (default: 0)
   * @param options.entityType - Filter by entity type (e.g., 'project', 'client')
   * @param options.action - Filter by action type (e.g., 'created', 'updated')
   * @param options.search - Search term to match against entity name
   * @param options.userId - Filter by user ID who performed the action
   * @param options.dateFrom - Start date in ISO 8601 format (YYYY-MM-DD)
   * @param options.dateTo - End date in ISO 8601 format (YYYY-MM-DD)
   * @returns Promise resolving to the list of activities and total count
   *
   * @example
   * // Get first page of activities (default limit 50)
   * const { activities } = await activityLogService.getRecentActivities();
   *
   * @example
   * // Get next page with custom limit
   * const { activities } = await activityLogService.getRecentActivities({
   *   limit: 20,
   *   offset: 20
   * });
   *
   * @example
   * // Filter by entity type and action
   * const { activities } = await activityLogService.getRecentActivities({
   *   entityType: 'project',
   *   action: 'created'
   * });
   *
   * @example
   * // With search and date range
   * const { activities } = await activityLogService.getRecentActivities({
   *   search: 'project name',
   *   dateFrom: '2026-01-01',
   *   dateTo: '2026-03-31'
   * });
   *
   * @throws {AxiosError} If the network request fails or the server returns an error
   */
  async getRecentActivities(
    options: GetRecentActivitiesOptions = {}  
  ): Promise<ActivityLogsResponse> {
    const {
      limit = 50,
      offset = 0,
      entityType,
      action,
      search,
      userId,
      dateFrom,
      dateTo,
    } = options;

    const params: Record<string, string | number> = { limit, offset };

    if (entityType) params.entity_type = entityType;
    if (action) params.action = action;
    if (search) params.search = search;
    if (userId) params.user_id = userId;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;

    const response = await apiClient.get<ActivityLogsResponse>('/activity/activity-logs', {
      params,
    });

    return response.data;
  },
};