import { Pagination } from "@/components/Pagination";

/**
 * Props for the ListFooter component.
 */
export interface ListFooterProps {
  /**
   * Current page number (1-based index).
   */
  currentPage: number;

  /**
   * Total number of pages available.
   */
  totalPages: number;

  /**
   * Total number of items across all pages.
   */
  totalItems: number;

  /**
   * Number of items currently displayed (after filtering).
   */
  displayedItems: number;

  /**
   * Callback fired when the page changes.
   * 
   * @param page - The new page number to navigate to
   */
  onPageChange: (page: number) => void;

  /**
   * Loading state indicator.
   * When true, hides the footer content.
   */
  isLoading?: boolean;

  /**
   * Custom label for the items being displayed.
   * Used in the "Showing X of Y [label]" text.
   * 
   * @default "items"
   */
  itemLabel?: string;

  /**
   * Custom label for the entity type in plural form.
   * Used in the "Showing X of Y [label]" text.
   * 
   * @default "items"
   */
  entityLabel?: string;

  /**
   * Optional custom text to display instead of the default "Showing X of Y" message.
   * If provided, overrides itemLabel and entityLabel.
   */
  customInfoText?: string;

  /**
   * Additional CSS classes to apply to the root container.
   */
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
 * @param {ListFooterProps} props - Component props
 * @returns {JSX.Element | null} The rendered footer or null if loading
 * 
 * @example
 * // Basic usage with projects
 * <ListFooter
 *   currentPage={1}
 *   totalPages={5}
 *   totalItems={42}
 *   displayedItems={10}
 *   onPageChange={setPage}
 *   entityLabel="projects"
 * />
 * 
 * @example
 * // Usage with custom labels for quotes
 * <ListFooter
 *   currentPage={2}
 *   totalPages={3}
 *   totalItems={25}
 *   displayedItems={10}
 *   onPageChange={handlePageChange}
 *   itemLabel="quote"
 *   entityLabel="quotes"
 * />
 * 
 * @example
 * // Usage with custom info text
 * <ListFooter
 *   currentPage={1}
 *   totalPages={1}
 *   totalItems={5}
 *   displayedItems={5}
 *   onPageChange={setPage}
 *   customInfoText="All tasks displayed"
 * />
 * 
 * @remarks
 * - Returns null when isLoading is true to prevent layout shift
 * - Uses CSS Grid for precise centering of pagination controls
 * - On mobile: pagination appears above info text (better touch target placement)
 * - On desktop: info text left-aligned, pagination centered in viewport
 * - Hides pagination controls automatically when totalPages <= 1
 * 
 * @see {@link Pagination} for the underlying pagination controls component
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
  // Hide footer completely when loading
  if (isLoading) {
    return null;
  }

  // Build the info text based on props
  const infoText = customInfoText || `Mostrando ${displayedItems} de ${totalItems} ${entityLabel}`;

  // Don't render pagination if there's only one page
  const showPagination = totalPages > 1;

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Grid layout: left (info) - center (pagination) - right (spacer) */}
      {showPagination ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
          
          {/* Left column: Items info text */}
          <div 
            className="text-sm text-muted-foreground text-left order-2 sm:order-1"
            role="status"
            aria-live="polite"
          >
            {infoText}
          </div>

          {/* Center column: Pagination controls */}
          <div className="flex justify-center order-1 sm:order-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>

          {/* Right column: Empty spacer for grid balance */}
          <div className="order-3 hidden sm:block" aria-hidden="true" />
        </div>
      ) : (
        /* Single page: show info text only, no pagination */
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