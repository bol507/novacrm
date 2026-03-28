import { ArrowUpDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { SortKey, SortOrder } from './types';

/**
 * Props interface for the ProjectsTableHeader presentational component.
 * 
 * This interface defines the contract for rendering a table header with
 * sortable columns, visual sort indicators, and conditional column visibility.
 * The component is purely presentational and delegates sort logic to the parent
 * via the onSortChange callback.
 * 
 * @remarks
 * - Follows controlled component pattern: parent manages sort state
 * - Visual indicators show active sort column and direction
 * - Column visibility is controlled via boolean flags for progressive disclosure
 * - Click handlers are only attached to sortable columns with callback defined
 * 
 * @see {@link SortKey} For allowed sorting column identifiers
 * @see {@link SortOrder} For sort direction values
 */
export interface ProjectsTableHeaderProps {
  /**
   * Current sort column key for ordering projects.
   * 
   * Determines which column displays the active sort indicator.
   * This prop is controlled by the parent component.
   * 
   * @remarks
   * - Must match one of the sortable column keys defined in COLUMNS
   * - Visual indicator (icon highlight) is shown when column.key === sortBy
   * - Default value is managed by parent; component does not set defaults
   * 
   * @example
   * // Sort by project name
   * <ProjectsTableHeader sortBy="projectname" sortOrder="asc" />
   */
  sortBy: SortKey;

  /**
   * Current sort direction for ordered results.
   * 
   * Controls the visual state of the sort indicator icon.
   * This prop is controlled by the parent component.
   * 
   * @remarks
   * - Works with sortBy to define complete sort criteria
   * - Icon rotation or color can reflect asc/desc state if customized
   * - Default value is managed by parent; component does not set defaults
   * 
   * @example
   * // Descending sort (newest first for dates)
   * <ProjectsTableHeader sortBy="targetenddate" sortOrder="desc" />
   */
  sortOrder: SortOrder;

  /**
   * Callback invoked when a sortable column header is clicked.
   * 
   * Fired to request a sort change when user interacts with column headers.
   * Parent component should update sort state and refetch data.
   * 
   * @param sortBy - The column key that was clicked for sorting
   * @param sortOrder - The new sort direction (toggled from current)
   * @returns void
   * 
   * @remarks
   * - If undefined, column headers are rendered as non-interactive (no click handler)
   * - Clicking same column toggles order; clicking different column sets new primary sort
   * - Parent is responsible for persisting preferences and API integration
   * 
   * @example
   * // Parent handler for sort changes with pagination reset
   * const handleSortChange = (newSortBy: SortKey, newSortOrder: SortOrder) => {
   *   setSortBy(newSortBy);
   *   setSortOrder(newSortOrder);
   *   setPage(1); // Reset pagination when sort criteria change
   * };
   */
  onSortChange?: (sortBy: SortKey, sortOrder: SortOrder) => void;

  /**
   * Flag to control visibility of the progress column.
   * 
   * When false, the progress column is excluded from the rendered header.
   * Must match the visibility state of the corresponding body column.
   * 
   * @default true
   * 
   * @remarks
   * - Hiding columns should be consistent between header and body rows
   * - Useful for contexts where progress tracking is not relevant
   * - Parent should persist column preferences if allowing user customization
   * 
   * @example
   * // Hide progress column for simplified view
   * <ProjectsTableHeader showProgress={false} showBudget={true} />
   */
  showProgress: boolean;

  /**
   * Flag to control visibility of the budget column.
   * 
   * When false, the budget column is excluded from the rendered header.
   * Must match the visibility state of the corresponding body column.
   * 
   * @default true
   * 
   * @remarks
   * - Budget visibility may be controlled by user permissions or roles
   * - Hiding financial columns simplifies table for non-financial stakeholders
   * - Parent should handle permission checks before rendering budget data
   * 
   * @example
   * // Hide budget for users without financial access
   * const canViewBudget = user.roles.includes('finance');
   * <ProjectsTableHeader showProgress={true} showBudget={canViewBudget} />
   */
  showBudget: boolean;
}

/**
 * Configuration interface for individual table columns.
 * 
 * Defines the properties that control column rendering, sorting behavior,
 * and styling in the table header. Used to generate header cells dynamically.
 * 
 * @remarks
 * - key: null for non-data columns (actions, row numbers); SortKey for sortable data columns
 * - label: Display text for the column header, typically localized
 * - className: Optional Tailwind utility classes for column-specific styling
 * - sortable: Determines if column responds to click events for sorting
 * 
 * @example
 * // Column configuration for a sortable text column
 * const nameColumn: ColumnConfig = {
 *   key: 'projectname',
 *   label: 'Project Name',
 *   className: 'min-w-48',
 *   sortable: true
 * };
 * 
 * @example
 * // Column configuration for a non-sortable actions column
 * const actionsColumn: ColumnConfig = {
 *   key: null,
 *   label: '',
 *   className: 'w-12 text-right',
 *   sortable: false
 * };
 */
export interface ColumnConfig {
  /**
   * Sort key identifier for the column, or null for non-sortable columns.
   * 
   * When non-null, must be a valid SortKey value that matches backend sort fields.
   * When null, the column is rendered as static content without sort interaction.
   * 
   * @remarks
   * - Used to match header clicks with sort state management
   * - Null keys are typically used for row numbers, checkboxes, or action menus
   * - Must be unique across columns to avoid ambiguous sort behavior
   */
  key: SortKey | null;

  /**
   * Display label for the column header.
   * 
   * Rendered as the visible text in the table header cell.
   * Should be localized if the application supports multiple languages.
   * 
   * @remarks
   * - Used as React key for list rendering; ensure uniqueness
   * - Can include icons or additional markup if needed via render function
   * - Keep labels concise for optimal table header layout
   */
  label: string;

  /**
   * Optional CSS class names for column-specific styling.
   * 
   * Applied to the th element to control width, alignment, or other visual properties.
   * Should use Tailwind utility classes for consistency with design system.
   * 
   * @remarks
   * - Common uses: width constraints (w-32), text alignment (text-right), padding adjustments
   * - Classes are merged with base styles via cn() utility function
   * - Avoid overriding critical layout classes that may break responsive behavior
   * 
   * @example
   * // Fixed width for progress column
   * className: 'w-32'
   * 
   * @example
   * // Right alignment for numeric budget values
   * className: 'text-right'
   */
  className?: string;

  /**
   * Flag indicating whether the column supports sorting interaction.
   * 
   * When true and onSortChange is provided, the column header is clickable
   * and displays a sort indicator icon when active.
   * 
   * @remarks
   * - Non-sortable columns (sortable: false) render as static text
   * - Sortable columns show visual feedback on hover when interactive
   * - Parent should ensure only meaningful columns are marked sortable
   * 
   * @example
   * // Date column that supports chronological sorting
   * sortable: true
   * 
   * @example
   * // Actions column with buttons, not sortable
   * sortable: false
   */
  sortable: boolean;
}

/**
 * Static configuration array defining the table column structure.
 * 
 * This constant defines the order, labels, and behavior of all columns
 * in the projects table header. Modified at build time, not runtime.
 * 
 * @remarks
 * - Order in array determines left-to-right column order in rendered table
 * - Each column's key must match a valid SortKey or be null for non-data columns
 * - className values use Tailwind utility classes for consistent styling
 * - sortable flag controls click interaction and visual sort indicators
 * 
 * @example
 * // Access column config for dynamic rendering
 * COLUMNS.filter(col => col.sortable).map(col => col.label);
 * // Output: ['Proyecto', 'Cliente', 'Estado', 'Progreso', 'Fecha límite', 'Presupuesto']
 */
const COLUMNS: ColumnConfig[] = [
  { key: null, label: '#', className: 'w-12', sortable: false },
  { key: 'projectname', label: 'Proyecto', sortable: true },
  { key: 'account_name', label: 'Cliente', sortable: true },
  { key: 'projectstatus', label: 'Estado', sortable: true },
  { key: 'progress', label: 'Progreso', className: 'w-32', sortable: true },
  { key: 'targetenddate', label: 'Fecha límite', sortable: true },
  { key: 'targetbudget', label: 'Presupuesto', className: 'text-right', sortable: true },
  { key: null, label: '', className: 'w-12', sortable: false },
];

/**
 * ProjectsTableHeader Component
 * 
 * A presentational component that renders the header row for the projects table.
 * 
 * This component handles:
 * - Rendering column headers with labels and optional sort indicators
 * - Handling click interactions for sortable columns
 * - Conditional column visibility based on configuration props
 * - Visual feedback for active sort column and direction
 * - Responsive styling via Tailwind CSS utility classes
 * 
 * The component is purely presentational and delegates all sort logic
 * and state management to the parent container via the onSortChange callback.
 * 
 * @component
 * @param {ProjectsTableHeaderProps} props - Component configuration props
 * @param {SortKey} props.sortBy - Current sort column key
 * @param {SortOrder} props.sortOrder - Current sort direction
 * @param {function} [props.onSortChange] - Callback for sort change requests
 * @param {boolean} props.showProgress - Flag to show/hide progress column
 * @param {boolean} props.showBudget - Flag to show/hide budget column
 * @returns {JSX.Element} The rendered table header section (thead)
 * 
 * @example
 * // Basic usage with sorting enabled
 * <ProjectsTableHeader
 *   sortBy="last_activity"
 *   sortOrder="desc"
 *   onSortChange={handleSortChange}
 *   showProgress={true}
 *   showBudget={true}
 * />
 * 
 * @example
 * // Usage without sorting (static header)
 * <ProjectsTableHeader
 *   sortBy="projectname"
 *   sortOrder="asc"
 *   showProgress={false}
 *   showBudget={false}
 * />
 * 
 * @remarks
 * - Renders a thead element containing a single tr with th cells
 * - Column order and configuration defined by COLUMNS constant
 * - Sort indicator icon (ArrowUpDown) shown only for active sortable column
 * - Click handlers attached only to sortable columns with onSortChange defined
 * - Uses cn() utility for conditional class name composition
 * - Visual feedback: hover effect on sortable columns, color highlight on active sort
 * - Column visibility filtering happens at render time, not via CSS display:none
 * 
 * @accessibility
 * - Sortable columns should include aria-sort attribute for screen readers
 * - Consider adding aria-label to sort icons for descriptive feedback
 * - Ensure sufficient color contrast for sort indicator visibility
 * 
 * @performance
 * - Column configuration is static; no runtime computation overhead
 * - Visible columns filtered via simple array filter; efficient for small column sets
 * - Click handlers are stable functions; no recreation on each render
 * 
 * @see {@link ColumnConfig} For column configuration structure
 * @see {@link SortKey} For allowed sorting column identifiers
 * @see {@link SortOrder} For sort direction values
 * @see {@link cn} For class name composition utility
 */
export const ProjectsTableHeader = ({
  sortBy,
  sortOrder,
  onSortChange,
  showProgress,
  showBudget,
}: ProjectsTableHeaderProps) => {
  /**
   * Handles click events on sortable column headers.
   * 
   * Toggles sort order when clicking the same column, or sets new primary
   * sort when clicking a different column. Invokes parent callback to
   * propagate the sort change request.
   * 
   * @param {SortKey} key - The column key that was clicked
   * @returns {void}
   * 
   * @remarks
   * - Early return if onSortChange is undefined (non-interactive mode)
   * - Sort order toggles: asc → desc → asc when clicking same column
   * - New column clicks default to ascending order for predictable UX
   * - Parent is responsible for updating state and refetching data
   * 
   * @example
   * // Click flow for sorting by project name
   * // Initial: sortBy=undefined, sortOrder=desc
   * // Click 'Proyecto': sortBy='projectname', sortOrder='asc'
   * // Click 'Proyecto' again: sortBy='projectname', sortOrder='desc'
   * // Click 'Cliente': sortBy='account_name', sortOrder='asc'
   */
  const handleSort = (key: SortKey) => {
    if (!onSortChange) return;
    const newOrder: SortOrder = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(key, newOrder);
  };

  /**
   * Filters the columns array based on visibility configuration props.
   * 
   * Excludes columns whose visibility is controlled by showProgress or
   * showBudget flags when those flags are false. All other columns
   * are always included in the rendered output.
   * 
   * @returns {ColumnConfig[]} Filtered array of columns to render
   * 
   * @remarks
   * - Filtering happens on each render; consider memoization for large column sets
   * - Column keys 'progress' and 'targetbudget' are the only conditionally visible
   * - Empty className or label columns (actions, row numbers) are always shown
   * 
   * @example
   * // With showProgress=false, showBudget=true
   * // Result: ['#', 'Proyecto', 'Cliente', 'Estado', 'Fecha límite', 'Presupuesto', '']
   * 
   * @example
   * // With showProgress=true, showBudget=false
   * // Result: ['#', 'Proyecto', 'Cliente', 'Estado', 'Progreso', 'Fecha límite', '']
   */
  const visibleColumns = COLUMNS.filter(col => {
    if (col.key === 'progress' && !showProgress) return false;
    if (col.key === 'targetbudget' && !showBudget) return false;
    return true;
  });

  return (
    <thead>
      <tr className="bg-muted/50">
        {visibleColumns.map((column) => {
          /**
           * Determines if this column is the currently active sort column.
           * Used to apply visual highlighting to the sort indicator icon.
           * 
           * @remarks
           * - isSorted is true only when column.key matches sortBy prop
           * - Null-key columns (actions, row numbers) are never sorted
           * - Visual feedback helps users identify current sort criteria
           */
          const isSorted = column.key && column.key === sortBy;
          
          return (
            <th
              key={column.label}
              className={cn(
                'px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider',
                column.className,
                column.sortable && onSortChange && 'cursor-pointer hover:bg-muted/80 transition-colors'
              )}
              /**
               * Click handler for sortable column headers.
               * 
               * @remarks
               * - Only attached when column has a key, is sortable, and callback is defined
               * - Prevents interaction on non-data columns (actions, row numbers)
               * - Click propagation is not stopped; parent may handle row-level interactions
               */
              onClick={() => column.key && column.sortable && handleSort(column.key)}
            >
              {column.sortable && onSortChange && column.key ? (
                /**
                 * Sortable column header content with indicator icon.
                 * 
                 * @remarks
                 * - Flex layout aligns label text and sort icon horizontally
                 * - Icon color indicates active sort state (primary vs muted)
                 * - Icon size (h-3 w-3) keeps visual weight subtle
                 */
                <div className="flex items-center gap-1">
                  {column.label}
                  <ArrowUpDown 
                    className={cn(
                      'h-3 w-3',
                      isSorted ? 'text-primary' : 'opacity-50'
                    )} 
                  />
                </div>
              ) : (
                /**
                 * Non-sortable column header content (static label only).
                 * 
                 * @remarks
                 * - Rendered for columns with sortable=false or onSortChange=undefined
                 * - No icon or interactive styling applied
                 * - Label text may be empty for action/row number columns
                 */
                column.label
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
};