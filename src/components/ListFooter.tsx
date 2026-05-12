import { Pagination } from "@/components/Pagination";

/**
 * Props for the ListFooter component.
 */
export interface ListFooterProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  displayedItems: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  itemLabel?: string;
  entityLabel?: string;
  customInfoText?: string;
  className?: string;
}

/**
 * ListFooter Component
 *
 * A reusable presentational component for displaying list information
 * and pagination controls at the bottom of data tables or grids.
 *
 * Features:
 * - Responsive layout: stacked on mobile, horizontal on desktop
 * - Centered pagination with info text aligned to the left
 * - Loading state handling (hides content when loading)
 * - Customizable labels for different entity types
 * - Accessible markup with proper ARIA attributes
 *
 * @component
 * @param props - Component props
 * @returns The rendered footer or null if loading
 */
export const ListFooter = ({
  currentPage,
  totalPages,
  totalItems,
  displayedItems,
  onPageChange,
  isLoading = false,
  entityLabel = "items",
  customInfoText,
  className = "",
}: ListFooterProps) => {
  if (isLoading) {
    return null;
  }

  const infoText = customInfoText || `Showing ${displayedItems} of ${totalItems} ${entityLabel}`;
  const showPagination = totalPages > 1;

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {showPagination ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
          <div
            className="text-sm text-muted-foreground text-left order-2 sm:order-1"
            role="status"
            aria-live="polite"
          >
            {infoText}
          </div>

          <div className="flex justify-center order-1 sm:order-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>

          <div className="order-3 hidden sm:block" aria-hidden="true" />
        </div>
      ) : (
        <div
          className="text-sm text-muted-foreground text-left"
          role="status"
          aria-live="polite"
        >
          {infoText}
        </div>
      )}
    </div>
  );
};

export default ListFooter;