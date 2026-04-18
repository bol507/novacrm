/**
 * Skeleton loader for the user table.
 *
 * @param props - Component props
 * @param props.className - Additional CSS classes
 * @returns Skeleton loading placeholders
 */
export const UserTableSkeleton = ({ className = '' }: { className?: string }) => (
  <div className={`space-y-3 ${className}`}>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
        <div className="h-4 bg-muted rounded w-20" />
        <div className="h-4 bg-muted rounded w-16" />
      </div>
    ))}
  </div>
);