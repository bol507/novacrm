import { Skeleton } from "@/components/ui/skeleton";

/**
 * QuoteLoadingSkeleton Component
 * 
 * Displays skeleton loaders matching the quote detail page structure.
 * Provides visual feedback while quote data is being fetched.
 * 
 * @component
 * @returns {JSX.Element} Loading skeleton for quote detail page
 * 
 * @remarks
 * Skeleton structure includes:
 * - Header with title and quote number placeholders
 * - Status badge and back button placeholders
 * - Three info card placeholders
 * - Four financial metric card placeholders
 * - Description section placeholder
 * - Items table with 3 row placeholders (desktop) / 2 card placeholders (mobile)
 * - PDF action button placeholders
 * - Main action button placeholders
 * 
 * @example
 * {isLoading && <QuoteLoadingSkeleton />}
 */
export const QuoteLoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header with key information */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div className="space-y-4">
            {/* Title and quote number */}
            <div className="space-y-2">
              <Skeleton className="h-10 w-3/4 rounded bg-muted" />
              <Skeleton className="h-6 w-1/3 rounded bg-muted" />
            </div>

            {/* Status and back button */}
            <div className="flex flex-col sm:items-end gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-20 rounded-full bg-muted" />
                <Skeleton className="h-8 w-20 rounded bg-muted" />
              </div>
            </div>

            {/* Side information - 3 cards */}
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 bg-card rounded-lg p-4 border border-border">
                  <Skeleton className="h-6 w-6 rounded bg-muted" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3 rounded bg-muted" />
                    <Skeleton className="h-5 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>

            {/* Financial panel - 4 cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-1/2 rounded bg-muted" />
                  <Skeleton className="h-8 w-3/4 rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-6">
            {/* Description */}
            <div className="bg-card rounded-lg border border-border p-6 space-y-4">
              <Skeleton className="h-8 w-1/4 rounded bg-muted" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded bg-muted" />
                <Skeleton className="h-4 w-5/6 rounded bg-muted" />
                <Skeleton className="h-4 w-4/6 rounded bg-muted" />
              </div>
            </div>

            {/* Items table */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="p-4 border-b border-border space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-8 w-1/3 rounded bg-muted" />
                  <Skeleton className="h-6 w-16 rounded bg-muted" />
                </div>
              </div>

              {/* Desktop table skeleton */}
              <div className="hidden sm:block mt-4">
                <div className="space-y-4">
                  {[...Array(3)].map((_, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-5 gap-4 py-4 border-b last:border-b-0">
                      <div className="col-span-2 space-y-2">
                        <Skeleton className="h-5 w-1/2 rounded bg-muted" />
                        <Skeleton className="h-4 w-full rounded bg-muted" />
                        <Skeleton className="h-4 w-4/5 rounded bg-muted" />
                      </div>
                      {[...Array(3)].map((_, colIndex) => (
                        <div key={colIndex} className="space-y-2">
                          <Skeleton className="h-4 w-full rounded bg-muted" />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile cards skeleton */}
              <div className="sm:hidden mt-4 space-y-4">
                {[...Array(2)].map((_, cardIndex) => (
                  <div key={cardIndex} className="border-b last:border-b-0 p-4 space-y-3">
                    <Skeleton className="h-5 w-1/2 rounded bg-muted" />
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {[...Array(4)].map((_, cellIndex) => (
                        <div key={cellIndex} className="space-y-1">
                          <Skeleton className="h-3 w-1/2 rounded bg-muted" />
                          <Skeleton className="h-4 w-full rounded bg-muted" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PDF buttons */}
        <div className="flex gap-3 mb-6">
          <Skeleton className="h-10 w-48 rounded bg-muted" />
          <Skeleton className="h-10 w-48 rounded bg-muted" />
        </div>

        {/* Main action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Skeleton className="h-12 flex-1 rounded bg-muted" />
          <Skeleton className="h-12 flex-1 rounded bg-muted" />
          <Skeleton className="h-12 flex-1 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
};