import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { activityLogService, type GetRecentActivitiesOptions } from '../services/activityLogService';
import type { ActivityLogsResponse } from '../types/activity.types';

/**
 * Extended options for the useActivityLogs hook.
 */
interface UseActivityLogsOptions extends GetRecentActivitiesOptions {
  /** Whether the hook is enabled (default: true) */
  enabled?: boolean;

  /** Auto-refresh interval in ms (default: 60000) */
  refetchInterval?: number;
}

/**
 * Result of the useActivityLogs hook.
 */
interface UseActivityLogsResult {
  /** List of activities across all loaded pages */
  activities: ActivityLogsResponse['activities'];
  /** Total number of activities available on the server */
  total: number;
  /** Whether data is loading */
  isLoading: boolean;
  /** Whether an error occurred */
  isError: boolean;
  /** Error object if present */
  error: Error | null;
  /** Function to manually refresh data */
  refetch: () => void;
  /** Whether data exists */
  hasData: boolean;
  /** Whether there is a next page to load */
  hasNextPage: boolean;
  /** Whether the next page is currently being fetched */
  isFetchingNextPage: boolean;
  /** Function to load the next page of activities */
  fetchNextPage: () => void;
}

/**
 * Hook for fetching system activities with infinite scroll/pagination support.
 *
 * Uses React Query's useInfiniteQuery for efficient pagination with offset-based
 * cursor. Supports filtering by entity type, action, search term, user ID, and
 * date range. Provides auto-refresh functionality and caching.
 *
 * @param options - Configuration and filter options
 * @param options.limit - Number of activities per page (default: 20)
 * @param options.entityType - Filter by entity type (e.g., 'project', 'client')
 * @param options.action - Filter by action type (e.g., 'created', 'updated')
 * @param options.search - Search term to filter by entity name
 * @param options.userId - Filter by user ID who performed the action
 * @param options.dateFrom - Start date in ISO 8601 format
 * @param options.dateTo - End date in ISO 8601 format
 * @param options.enabled - Whether the query is enabled (default: true)
 * @param options.refetchInterval - Auto-refresh interval in ms (default: 60000)
 * @returns Result with activities, total count, loading states, and pagination controls
 *
 * @example
 * // Basic usage
 * const { activities, isLoading, fetchNextPage, hasNextPage } = useActivityLogs();
 *
 * @example
 * // With filters
 * const { activities, refetch } = useActivityLogs({
 *   limit: 50,
 *   entityType: 'project',
 *   action: 'created',
 *   refetchInterval: 30000,
 * });
 *
 * @example
 * // With search and date range
 * const { activities, total } = useActivityLogs({
 *   search: 'project name',
 *   dateFrom: '2026-01-01',
 *   dateTo: '2026-03-31',
 * });
 *
 * @example
 * // Infinite scroll implementation
 * const { activities, hasNextPage, fetchNextPage, isFetchingNextPage } = useActivityLogs();
 *
 * // In a scroll event listener
 * if (hasNextPage && !isFetchingNextPage) {
 *   fetchNextPage();
 * }
 */
export const useActivityLogs = (
  options: UseActivityLogsOptions = {}
): UseActivityLogsResult => {
  const {
    limit = 20,
    entityType,
    action,
    search,
    userId,
    dateFrom,
    dateTo,
    enabled = true,
    refetchInterval = 1000 * 60, // 1 minute
  } = options;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery<ActivityLogsResponse, Error, InfiniteData<ActivityLogsResponse>, (string | number)[]>({
    queryKey: [
      'activity-logs',
      limit,
      entityType ?? 'all',
      action ?? 'all',
      search ?? '',
      userId ?? 'all',
      dateFrom ?? '',
      dateTo ?? '',
    ],

    initialPageParam: 0,

    queryFn: ({ pageParam }) => {
      return activityLogService.getRecentActivities({
        limit,
        offset: pageParam as number,
        entityType,
        action,
        search,
        userId,
        dateFrom,
        dateTo,
      });
    },

    enabled,
    staleTime: 1000 * 30, // 30 seconds - data considered fresh
    gcTime: 1000 * 60 * 5, // 5 minutes - keep in cache
    refetchInterval,
    refetchOnWindowFocus: true,
    retry: 2,

    /**
     * Calculates the next page offset based on the total number of activities loaded.
     *
     * @param lastPage - The last page response from the API
     * @param allPages - All pages loaded so far
     * @returns The next offset, or undefined if there are no more pages
     */
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce((acc, page) => acc + page.activities.length, 0);
      if (totalLoaded >= lastPage.total) {
        return undefined;
      }
      return totalLoaded;
    },
  });

  const activities = data?.pages.flatMap(page => page.activities) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return {
    activities,
    total,
    isLoading,
    isError,
    error,
    refetch,
    hasData: activities.length > 0,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage: isFetchingNextPage ?? false,
    fetchNextPage,
  };
};