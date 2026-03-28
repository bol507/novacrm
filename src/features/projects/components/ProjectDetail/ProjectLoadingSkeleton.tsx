import { Skeleton } from '@/components/ui/skeleton';

/**
 * ProjectLoadingSkeleton Component
 * 
 * Displays skeleton loaders matching the project detail page structure.
 * Provides visual feedback while project data is being fetched.
 * 
 * @component
 * @returns {JSX.Element} Loading skeleton for project detail page
 */
export const ProjectLoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4 bg-muted" />
              <Skeleton className="h-4 w-1/4 bg-muted" />
            </div>
            <div className="sm:col-span-2 flex items-center justify-end gap-4">
              <Skeleton className="h-10 w-24 bg-muted" />
              <Skeleton className="h-10 w-48 bg-muted" />
            </div>
          </div>

          {/* Financial cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full bg-muted" />
            ))}
          </div>

          {/* Content cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-64 w-full bg-muted" />
            <Skeleton className="h-64 w-full bg-muted" />
            <Skeleton className="h-64 w-full bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
};