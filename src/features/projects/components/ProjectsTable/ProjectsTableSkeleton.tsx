import { cn } from '@/shared/lib/utils';

interface ProjectsTableSkeletonProps {
  compact?: boolean;
  className?: string;
  count?: number;
}

export const ProjectsTableSkeleton = ({
  compact = false,
  className = '',
  count = 5,
}: ProjectsTableSkeletonProps) => {
  return (
    <>
      {/* Desktop Skeleton */}
      <div className={cn('rounded-lg border hidden sm:block', className)}>
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              {[...Array(compact ? 5 : 7)].map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(count)].map((_, rowIndex) => (
              <tr key={rowIndex} className="border-t">
                {[...Array(compact ? 5 : 7)].map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-3">
                    <div className={cn(
                      'h-4 bg-muted rounded animate-pulse',
                      colIndex === 0 ? 'w-8' : 'w-full'
                    )} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Skeleton */}
      <div className={cn('space-y-3 sm:hidden', className)}>
        {[...Array(count)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3 animate-pulse">
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
              <div className="h-6 w-20 bg-muted rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-48 bg-muted rounded" />
              <div className="h-3 w-32 bg-muted rounded" />
            </div>
            {compact || <div className="h-2 w-full bg-muted rounded" />}
            <div className="flex justify-between">
              <div className="h-4 w-16 bg-muted rounded" />
              <div className="flex gap-1">
                <div className="h-8 w-8 bg-muted rounded" />
                <div className="h-8 w-8 bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};