import { useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Opportunity } from '../types/opportunity';

interface OpportunityTableProps {
  /** Array of opportunities to display */
  opportunities: Opportunity[];
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Current search term value for filtering */
  searchValue?: string;
  /** Callback for search input changes */
  onSearchChange?: (value: string) => void;
  /** Callback for viewing opportunity details */
  onView?: (opportunity: Opportunity) => void;
  /** Callback for editing an opportunity */
  onEdit?: (opportunity: Opportunity) => void;
  /** Callback for deleting an opportunity */
  onDelete?: (opportunity: Opportunity) => void;
  /** Callback for refresh action */
  onRefresh?: () => void;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Formats a number as USD currency with Panamanian locale.
 *
 * @param value - The number to format
 * @returns Formatted currency string or '-' if value is falsy
 */
const formatCurrency = (value: number | null | undefined): string => {
  if (!value) return '-';
  return new Intl.NumberFormat('es-PA', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Formats a date string to Spanish locale format.
 *
 * @param dateString - ISO date string or null
 * @returns Formatted date string or '-' if date is null
 */
const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES');
};

/**
 * Returns stage badge color classes based on sales stage.
 *
 * @param stage - The sales stage string
 * @returns Tailwind CSS classes for the stage badge
 */
const getStageColor = (stage: string) => {
  switch (stage) {
    case 'Closed Won':
      return "bg-green-500/10 text-green-600 border-green-500/20";
    case 'Closed Lost':
      return "bg-red-500/10 text-red-600 border-red-500/20";
    case 'Proposal/Price Quote':
    case 'Negotiation/Review':
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    default:
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
  }
};

/**
 * Skeleton loader for the opportunity table.
 *
 * @param props - Component props
 * @param props.className - Additional CSS classes
 * @returns Skeleton loading placeholders
 */
const OpportunityTableSkeleton = ({ className = '' }: { className?: string }) => (
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

/**
 * Mobile card view for a single opportunity in the table view.
 *
 * @param props - Component props
 * @param props.opportunity - Opportunity object to display
 * @param props.onView - Callback for viewing opportunity details
 * @returns Mobile opportunity card component
 */
const OpportunityTableCard = ({
  opportunity,
  onView,
}: {
  opportunity: Opportunity;
  onView?: (opportunity: Opportunity) => void;
  onEdit?: (opportunity: Opportunity) => void;
  onDelete?: (opportunity: Opportunity) => void;
}) => (
  <div 
    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
    onClick={() => onView?.(opportunity)}
  >
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="font-semibold truncate">{opportunity.potentialname}</span>
        <span className="text-xs text-muted-foreground">#{opportunity.potential_no}</span>
      </div>
      <div className="text-sm text-muted-foreground">
        {opportunity.related_to_name || 'No client'} • {formatCurrency(opportunity.amount)}
      </div>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-sm">{opportunity.probability ? `${opportunity.probability}%` : '-'}</span>
      <div className="text-right">
        <span className={`text-xs px-2 py-1 rounded-full border ${getStageColor(opportunity.sales_stage)}`}>
          {opportunity.sales_stage}
        </span>
      </div>
    </div>
  </div>
);

/**
 * OpportunityTable component for displaying opportunities in a responsive table format.
 *
 * Features:
 * - Responsive design: mobile cards on small screens, full table on larger screens
 * - Search/filter input within the table component
 * - Skeleton loading state
 * - Clickable rows for viewing opportunity details
 * - Action buttons for view, edit, and delete
 * - Stage badges with appropriate colors
 * - Currency formatting for monetary values
 * - Date formatting for closing dates
 *
 * @component
 * @param props - Component props
 * @param props.opportunities - Array of opportunities to display
 * @param props.isLoading - Whether data is currently loading
 * @param props.searchValue - Current search term value
 * @param props.onSearchChange - Callback for search input changes
 * @param props.onView - Callback for viewing opportunity details
 * @param props.onEdit - Callback for editing an opportunity
 * @param props.onDelete - Callback for deleting an opportunity
 * @param props.onRefresh - Callback for refresh action
 * @param props.className - Additional CSS classes
 * @returns The rendered opportunity table component
 *
 * @example
 * // Basic usage
 * <OpportunityTable
 *   opportunities={opportunities}
 *   isLoading={isLoading}
 *   onView={handleViewOpportunity}
 *   onEdit={handleEditOpportunity}
 *   onDelete={handleDeleteOpportunity}
 * />
 *
 * @example
 * // With search functionality
 * <OpportunityTable
 *   opportunities={opportunities}
 *   isLoading={isLoading}
 *   searchValue={searchTerm}
 *   onSearchChange={setSearchTerm}
 *   onView={handleViewOpportunity}
 * />
 */
export const OpportunityTable = ({
  opportunities,
  isLoading,
  searchValue = '',
  onSearchChange,
  onView,
  onEdit,
  onDelete,
  className = '',
}: OpportunityTableProps) => {
  const filteredOpportunities = useMemo(() => {
    if (!searchValue) return opportunities;
    const search = searchValue.toLowerCase();
    return opportunities.filter(opp => 
      opp.potentialname?.toLowerCase().includes(search) ||
      opp.related_to_name?.toLowerCase().includes(search) ||
      opp.potential_no?.toLowerCase().includes(search)
    );
  }, [opportunities, searchValue]);

  if (isLoading) {
    return <OpportunityTableSkeleton className={className} />;
  }

  return (
    <div className={className}>
      {onSearchChange && (
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by name, client or number..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
              aria-label="Filter opportunities"
            />
          </div>
          {searchValue && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              Clear
            </Button>
          )}
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {filteredOpportunities.length} of {opportunities.length} opportunities
          </span>
        </div>
      )}

      <div className="space-y-3 sm:hidden">
        {filteredOpportunities.map((opportunity) => (
          <OpportunityTableCard
            key={opportunity.potentialid}
            opportunity={opportunity}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <div className="hidden sm:block rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Client</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Value</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Probability</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Closing Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Stage</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOpportunities.map((opportunity) => (
                <tr 
                  key={opportunity.potentialid}
                  className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onView?.(opportunity)}
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {opportunity.potential_no}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium truncate max-w-48" title={opportunity.potentialname}>
                      {opportunity.potentialname}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="truncate max-w-32" title={opportunity.related_to_name || undefined}>
                      {opportunity.related_to_name || 'No client'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(opportunity.amount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {opportunity.probability ? `${opportunity.probability}%` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {formatDate(opportunity.closingdate)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStageColor(opportunity.sales_stage)}`}>
                      {opportunity.sales_stage}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView?.(opportunity)}>
                        <span className="sr-only">View</span>
                        👁
                      </Button>
                      {onEdit && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(opportunity)}>
                          <span className="sr-only">Edit</span>
                          ✏️
                        </Button>
                      )}
                      {onDelete && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(opportunity)}>
                          <span className="sr-only">Delete</span>
                          🗑️
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OpportunityTable;