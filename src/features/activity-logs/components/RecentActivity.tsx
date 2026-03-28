import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useActivityLogs } from '../hooks/useActivityLogs';
import { Clock, Activity, RefreshCw,  Filter, X, Loader2Icon } from 'lucide-react';
import type { ActivityLog, EntityType, ActivityAction } from '../types/activity.types';
import { ENTITY_CONFIG, ACTION_CONFIG } from '../types/activity.types';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { ActivityLogItemExpanded } from './ActivityLogItemExpanded';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SearchInput } from '@/components/searchInput';

interface RecentActivityProps {
  /** Maximum number of activities to fetch per page (default: 20) */
  limit?: number;
  /** Whether to show the header with title (default: true) */
  showHeader?: boolean;
  /** Whether to allow manual refresh (default: true) */
  allowRefresh?: boolean;
  /** Whether to allow filter controls (default: true) */
  allowFilters?: boolean;
  /** Callback invoked when an activity is clicked */
  onActivityClick?: (activity: ActivityLog) => void;
  /** Additional CSS class for the container */
  className?: string;
}

/**
 * RecentActivity component for displaying system activities with filtering and pagination.
 *
 * Features:
 * - Automatic data fetching with React Query
 * - Infinite scroll / "Load more" pagination
 * - Skeleton loading state
 * - Error state with retry functionality
 * - Informative empty state
 * - Auto-refresh every 60 seconds
 * - Optional manual refresh
 * - Filter by entity type, action type, and search term
 * - Quick filter badges showing activity counts per entity type
 * - Responsive layout with full-width content
 *
 * @component
 * @param props - Component props
 * @param props.limit - Maximum number of activities to fetch per page (default: 20)
 * @param props.showHeader - Whether to show header with title (default: true)
 * @param props.allowRefresh - Whether to allow manual refresh (default: true)
 * @param props.allowFilters - Whether to allow filter controls (default: true)
 * @param props.onActivityClick - Callback invoked when an activity is clicked
 * @param props.className - Additional CSS class for the container
 * @returns The rendered recent activity component with filtering
 *
 * @example
 * // Basic usage
 * <RecentActivity />
 *
 * @example
 * // With custom options and filters disabled
 * <RecentActivity
 *   limit={30}
 *   allowFilters={false}
 *   onActivityClick={handleActivityClick}
 * />
 *
 * @example
 * // With filters enabled and custom styling
 * <RecentActivity
 *   limit={15}
 *   allowFilters={true}
 *   className="h-full"
 * />
 */
export const RecentActivity = ({
  limit = 20,
  showHeader = true,
  allowRefresh = true,
  allowFilters = true,
  onActivityClick,
  className,
}: RecentActivityProps) => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    entityType: 'all' as EntityType | 'all',
    action: 'all' as ActivityAction | 'all',
    search: '',
  });

  const {
    activities,
    total,
    isLoading,
    isError,
    error,
    refetch,
    hasData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useActivityLogs({
    limit,
    enabled: true,
    entityType: filters.entityType === 'all' ? undefined : filters.entityType,
    action: filters.action === 'all' ? undefined : filters.action,
    search: filters.search || undefined,
    refetchInterval: 1000 * 60,
  });

  const countByType = activities.reduce((acc, act) => {
    acc[act.entity_type] = (acc[act.entity_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleActivityClick = (activity: ActivityLog) => {
    if (onActivityClick) {
      onActivityClick(activity);
    } else {
      const routes: Record<string, string> = {
        project: `/dashboard/projects/${activity.entity_id}`,
        client: `/dashboard/clients/${activity.entity_id}`,
        quote: `/dashboard/quotes/${activity.entity_id}`,
        opportunity: `/dashboard/opportunities/${activity.entity_id}`,
        contact: `/dashboard/contacts/${activity.entity_id}`,
        task: `/dashboard/tasks/${activity.entity_id}`,
        activity: `/dashboard/tasks/${activity.entity_id}`,
        comment: `/dashboard/comments/${activity.entity_id}`,
      };

      const route = routes[activity.entity_type];
      if (route) {
        navigate(route);
      }
    }
  };

  const clearFilters = () => {
    setFilters({ entityType: 'all', action: 'all', search: '' });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value });
  };

  const handleSearchClear = () => {
    setFilters({ ...filters, search: '' });
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {[...Array(Math.min(limit, 10))].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="w-10 h-10 bg-muted rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 bg-muted w-full" />
                  <Skeleton className="h-3 bg-muted w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className={cn("w-full", className)}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-12">
            <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground mb-4">
              {error?.message ?? 'Failed to load activities'}
            </p>
            {allowRefresh && (
              <Button variant="outline" onClick={() => refetch()} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card className={cn("w-full", className)}>
        {showHeader && (
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              {allowRefresh && (
                <Button variant="ghost" size="icon" onClick={() => refetch()}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground mb-2">
              No recent activity
            </p>
            <p className="text-xs text-muted-foreground">
              Activities will appear here when changes are made
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  try {
    return (
      <ErrorBoundary>
        <Card className={cn("w-full", className)}>
          {showHeader && (
            <CardHeader className="space-y-4 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {total} {total === 1 ? 'activity' : 'activities'}
                  </Badge>
                  {allowRefresh && (
                    <Button variant="ghost" size="icon" onClick={() => refetch()}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  )}
                  {allowFilters && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowFilters(!showFilters)}
                      className={cn(showFilters && 'bg-muted')}
                    >
                      <Filter className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {allowFilters && showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="md:col-span-2">
                    <SearchInput
                      placeholder="Search by entity name..."
                      value={filters.search}
                      onSearch={handleSearchChange}
                      onClear={handleSearchClear}
                      isLoading={isLoading}
                      clearable
                      aria-label="Search activities by name"
                    />
                  </div>

                  <Select
                    value={filters.entityType}
                    onValueChange={(value) => {
                      setFilters({
                        ...filters,
                        entityType: value as EntityType | 'all'
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {Object.entries(ENTITY_CONFIG).map(([type, config]) => (
                        <SelectItem key={type} value={type}>
                          {config.icon} {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.action}
                    onValueChange={(value) => {
                      setFilters({
                        ...filters,
                        action: value as ActivityAction
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Action type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All actions</SelectItem>
                      {Object.entries(ACTION_CONFIG).map(([action, config]) => (
                        <SelectItem key={action} value={action}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {(filters.entityType !== 'all' || filters.action !== 'all' || filters.search) && (
                    <div className="md:col-span-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="w-full gap-2 hover:bg-muted/50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Clear all filters
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {Object.keys(countByType).length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(countByType).map(([type, count]) => {
                    const config = ENTITY_CONFIG[type as EntityType];
                    return (
                      <Badge
                        key={type}
                        variant="outline"
                        className="gap-1 cursor-pointer hover:bg-muted"
                        onClick={() => setFilters({ ...filters, entityType: type as EntityType })}
                      >
                        {config?.icon} {count}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </CardHeader>
          )}

          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {activities.map((activity) => (
                <ActivityLogItemExpanded
                  key={`${activity.entity_type}-${activity.entity_id}-${activity.created_at}`}
                  activity={activity}
                  onClick={handleActivityClick}
                />
              ))}
            </div>

            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-4">
                <Loader2Icon className="w-5 h-5 animate-spin text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">
                  Loading more activities...
                </span>
              </div>
            )}

            {hasNextPage && (
              <div className="mt-4 pt-4 border-t text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load more'
                  )}
                </Button>
              </div>
            )}

            {!hasNextPage && activities.length > 0 && (
              <div className="mt-4 pt-4 border-t text-center text-xs text-muted-foreground">
                No more activities to display
              </div>
            )}
          </CardContent>
        </Card>
      </ErrorBoundary>
    );
  } catch (err) {
    console.error('Error rendering activities:', err);
    return <div>Error rendering activities</div>;
  }
};