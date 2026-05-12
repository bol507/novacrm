import { ArrowUpDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { SortKey, SortOrder } from './types';

export interface ProjectsTableHeaderProps {
  /**
   * Current sort column key for ordering projects.
   * Determines which column displays the active sort indicator.
   */
  sortBy: SortKey;

  /**
   * Current sort direction for ordered results.
   * Controls the visual state of the sort indicator icon.
   */
  sortOrder: SortOrder;

  /**
   * Callback invoked when a sortable column header is clicked.
   * Parent component should update sort state and refetch data.
   */
  onSortChange?: (sortBy: SortKey, sortOrder: SortOrder) => void;

  /**
   * Flag to control visibility of the progress column.
   * @default true
   */
  showProgress: boolean;

  /**
   * Flag to control visibility of the budget column.
   * @default true
   */
  showBudget: boolean;
}

export interface ColumnConfig {
  /** Sort key identifier for the column, or null for non-sortable columns */
  key: SortKey | null;
  /** Display label for the column header */
  label: string;
  /** Optional CSS class names for column-specific styling */
  className?: string;
  /** Flag indicating whether the column supports sorting interaction */
  sortable: boolean;
}

const COLUMNS: ColumnConfig[] = [
  { key: null, label: '#', className: 'w-12', sortable: false },
  { key: 'projectname', label: 'Project', sortable: true },
  { key: 'account_name', label: 'Client', sortable: true },
  { key: 'projectstatus', label: 'Status', sortable: true },
  { key: 'progress', label: 'Progress', className: 'w-32', sortable: true },
  { key: 'targetenddate', label: 'Due Date', sortable: true },
  { key: 'targetbudget', label: 'Budget', className: 'text-right', sortable: true },
  { key: null, label: '', className: 'w-12', sortable: false },
];

/**
 * ProjectsTableHeader Component
 *
 * A presentational component that renders the header row for the projects table.
 * Handles column rendering, sort interactions, and conditional column visibility.
 *
 * @component
 * @param props - Component props
 * @param props.sortBy - Current sort column key
 * @param props.sortOrder - Current sort direction
 * @param props.onSortChange - Callback for sort change requests
 * @param props.showProgress - Flag to show/hide progress column
 * @param props.showBudget - Flag to show/hide budget column
 * @returns The rendered table header
 */
export const ProjectsTableHeader = ({
  sortBy,
  sortOrder,
  onSortChange,
  showProgress,
  showBudget,
}: ProjectsTableHeaderProps) => {
  const handleSort = (key: SortKey) => {
    if (!onSortChange) return;
    const newOrder: SortOrder = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(key, newOrder);
  };

  const visibleColumns = COLUMNS.filter(col => {
    if (col.key === 'progress' && !showProgress) return false;
    if (col.key === 'targetbudget' && !showBudget) return false;
    return true;
  });

  return (
    <thead>
      <tr className="bg-muted/50">
        {visibleColumns.map((column) => {
          const isSorted = column.key && column.key === sortBy;
          
          return (
            <th
              key={column.label}
              className={cn(
                'px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider',
                column.className,
                column.sortable && onSortChange && 'cursor-pointer hover:bg-muted/80 transition-colors'
              )}
              onClick={() => column.key && column.sortable && handleSort(column.key)}
            >
              {column.sortable && onSortChange && column.key ? (
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
                column.label
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
};