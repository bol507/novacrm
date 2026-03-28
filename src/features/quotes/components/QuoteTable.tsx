import { useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Quote } from '../types/quote';
import { QUOTE_STAGE_COLORS, QUOTE_STAGE_LABELS } from '../types/quote';

interface QuoteTableProps {
  /** Array of quotes to display */
  quotes: Quote[];
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Current search term value for filtering */
  searchValue?: string;
  /** Callback for search input changes */
  onSearchChange?: (value: string) => void;
  /** Callback for viewing quote details */
  onView?: (quote: Quote) => void;
  /** Callback for editing a quote */
  onEdit?: (quote: Quote) => void;
  /** Callback for deleting a quote */
  onDelete?: (quote: Quote) => void;
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
const formatCurrency = (value: number | undefined): string => {
  if (!value) return '-';
  return new Intl.NumberFormat('es-PA', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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
 * Skeleton loader for the quote table.
 *
 * @param props - Component props
 * @param props.className - Additional CSS classes
 * @returns Skeleton loading placeholders
 */
const QuoteTableSkeleton = ({ className = '' }: { className?: string }) => (
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
 * Mobile card view for a single quote in the table view.
 *
 * @param props - Component props
 * @param props.quote - Quote object to display
 * @param props.onView - Callback for viewing quote details
 * @returns Mobile quote card component
 */
const QuoteTableCard = ({
  quote,
  onView,
}: {
  quote: Quote;
  onView?: (quote: Quote) => void;
  onEdit?: (quote: Quote) => void;
  onDelete?: (quote: Quote) => void;
}) => (
  <div 
    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
    onClick={() => onView?.(quote)}
  >
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="font-semibold truncate">{quote.subject}</span>
        <span className="text-xs text-muted-foreground">#{quote.quoteno}</span>
      </div>
      <div className="text-sm text-muted-foreground">
        {quote.account_name || 'No client'} • {formatCurrency(quote.total)}
      </div>
    </div>
    <div className="flex items-center gap-3">
      <span className={`text-xs px-2 py-1 rounded-full border ${QUOTE_STAGE_COLORS[quote.quote_stage]}`}>
        {QUOTE_STAGE_LABELS[quote.quote_stage]}
      </span>
    </div>
  </div>
);

/**
 * QuoteTable component for displaying quotes in a responsive table format.
 *
 * Features:
 * - Responsive design: mobile cards on small screens, full table on larger screens
 * - Search/filter input within the table component
 * - Skeleton loading state
 * - Clickable rows for viewing quote details
 * - Action buttons for view, edit, and delete
 * - Quote status badges with appropriate colors
 * - Currency formatting for monetary values
 * - Date formatting for validity dates
 *
 * @component
 * @param props - Component props
 * @param props.quotes - Array of quotes to display
 * @param props.isLoading - Whether data is currently loading
 * @param props.searchValue - Current search term value
 * @param props.onSearchChange - Callback for search input changes
 * @param props.onView - Callback for viewing quote details
 * @param props.onEdit - Callback for editing a quote
 * @param props.onDelete - Callback for deleting a quote
 * @param props.onRefresh - Callback for refresh action
 * @param props.className - Additional CSS classes
 * @returns The rendered quote table component
 *
 * @example
 * // Basic usage
 * <QuoteTable
 *   quotes={quotes}
 *   isLoading={isLoading}
 *   onView={handleViewQuote}
 *   onEdit={handleEditQuote}
 *   onDelete={handleDeleteQuote}
 * />
 *
 * @example
 * // With search functionality
 * <QuoteTable
 *   quotes={quotes}
 *   isLoading={isLoading}
 *   searchValue={searchTerm}
 *   onSearchChange={setSearchTerm}
 *   onView={handleViewQuote}
 * />
 */
export const QuoteTable = ({
  quotes,
  isLoading,
  searchValue = '',
  onSearchChange,
  onView,
  onEdit,
  onDelete,
  className = '',
}: QuoteTableProps) => {
  const filteredQuotes = useMemo(() => {
    if (!searchValue) return quotes;
    const search = searchValue.toLowerCase();
    return quotes.filter(quote => 
      quote.subject?.toLowerCase().includes(search) ||
      quote.account_name?.toLowerCase().includes(search) ||
      quote.quoteno?.toLowerCase().includes(search)
    );
  }, [quotes, searchValue]);

  if (isLoading) {
    return <QuoteTableSkeleton className={className} />;
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
              aria-label="Filter quotes"
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
            {filteredQuotes.length} of {quotes.length} quotes
          </span>
        </div>
      )}

      <div className="space-y-3 sm:hidden">
        {filteredQuotes.map((quote) => (
          <QuoteTableCard
            key={quote.quoteid}
            quote={quote}
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
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Client</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Subtotal</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Tax</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Valid Until</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
               </tr>
            </thead>
            <tbody>
              {filteredQuotes.map((quote) => (
                <tr 
                  key={quote.quoteid}
                  className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onView?.(quote)}
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {quote.quoteno}
                   </td>
                  <td className="px-4 py-3">
                    <div className="font-medium truncate max-w-48" title={quote.subject}>
                      {quote.subject}
                    </div>
                   </td>
                  <td className="px-4 py-3">
                    <div className="truncate max-w-32" title={quote.account_name || undefined}>
                      {quote.account_name || 'No client'}
                    </div>
                   </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(quote.subtotal)}
                   </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(quote.taxtotal)}
                   </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(quote.total)}
                   </td>
                  <td className="px-4 py-3">
                    {formatDate(quote.validtill)}
                   </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${QUOTE_STAGE_COLORS[quote.quote_stage]}`}>
                      {QUOTE_STAGE_LABELS[quote.quote_stage]}
                    </span>
                   </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView?.(quote)}>
                        <span className="sr-only">View</span>
                        👁
                      </Button>
                      {onEdit && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(quote)}>
                          <span className="sr-only">Edit</span>
                          ✏️
                        </Button>
                      )}
                      {onDelete && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(quote)}>
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

export default QuoteTable;
