import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, RefreshCw, LayoutGrid, List, X } from "lucide-react";
import type { Quote, QuoteViewMode } from "../types/quote";
import ListFooter from "@/components/ListFooter";
import { QuoteCards } from "../components/QuoteCards";
import QuoteTable from "../components/QuoteTable";
import { QuoteStats } from "../components/QuoteStats";

export interface QuoteViewProps {
  quotes: Quote[];
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
  onViewModeChange: (mode: QuoteViewMode) => void;
  onRefresh: () => void;
  onView?: (quote: Quote) => void;
  onEdit?: (quote: Quote) => void;
  onDelete?: (quote: Quote) => void;
  viewMode: QuoteViewMode;
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  quoteCount: number;
  clientIdNumber?: number | null;
  handleClearClientFilter?: () => void;
}

/**
 * Calculates quote statistics from the current list.
 *
 * @param quotes - Array of quotes to analyze
 * @returns Object containing pending count, accepted count, total value, and accepted value
 */
const calculateStats = (quotes: Quote[]) => {
  const pending = quotes.filter(q => q.quote_stage === 'Draft' || q.quote_stage === 'Sent').length;
  const accepted = quotes.filter(q => q.quote_stage === 'Accepted').length;
  const totalValue = quotes.reduce((sum, q) => sum + q.total, 0);
  const acceptedValue = quotes
      .filter(q => q.quote_stage === 'Accepted')
      .reduce((sum, q) => sum + q.total, 0);

  return {
      pending,
      accepted,
      totalValue,
      acceptedValue
  };
};

/**
 * QuoteView component - Main presentational component for the quotes page.
 *
 * Features:
 * - Displays quotes in either card or table view mode
 * - Search functionality with filter input
 * - Create, view, edit, and delete quote actions
 * - Statistics cards showing pending/accepted quotes and total values
 * - Client filter badge with clear button
 * - Pagination controls via ListFooter
 * - Error state handling with retry button
 * - Loading states for async operations
 *
 * @component
 * @param props - Component props
 * @returns The rendered quote view component
 *
 * @example
 * // Basic usage
 * <QuoteView
 *   quotes={quotes}
 *   isLoading={isLoading}
 *   error={null}
 *   searchTerm={searchTerm}
 *   onSearchChange={setSearchTerm}
 *   onCreateClick={handleCreate}
 *   onViewModeChange={setViewMode}
 *   onRefresh={refetch}
 *   onView={handleViewQuote}
 *   onEdit={handleEditQuote}
 *   onDelete={handleDeleteQuote}
 *   viewMode="cards"
 *   page={1}
 *   totalPages={5}
 *   totalItems={42}
 *   onPageChange={setPage}
 *   quoteCount={42}
 * />
 *
 * @example
 * // With client filter
 * <QuoteView
 *   // ... required props
 *   clientIdNumber={123}
 *   handleClearClientFilter={clearClientFilter}
 * />
 */
export const QuoteView = ({
  quotes,
  isLoading,
  error,
  searchTerm,
  onSearchChange,
  onCreateClick,
  onViewModeChange,
  viewMode,
  onRefresh,
  onView,
  onEdit,
  onDelete,
  page,
  totalPages,
  totalItems,
  onPageChange,
  quoteCount,
  clientIdNumber,
  handleClearClientFilter
}: QuoteViewProps) => {
  const stats = calculateStats(quotes);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Error loading quotes: {error.message}</p>
          <Button variant="outline" className="mt-4" onClick={onRefresh}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {quoteCount}
            </Badge>
            Quotes
          </h1>
          <p className="text-muted-foreground">
            Manage sales quotes
          </p>
          {clientIdNumber && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-sm font-normal">
                Client ID: {clientIdNumber}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearClientFilter}
                className="h-6 px-2 text-xs hover:bg-muted"
              >
                <X className="h-3 w-3 mr-1" />
                Clear filter
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh list"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>

          <div className="flex rounded-md border border-border overflow-hidden">
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange("cards")}
              className="rounded-none border-r border-border"
              title="Card view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange("table")}
              className="rounded-none"
              title="Table view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button className="gap-2" onClick={onCreateClick}>
            <Plus className="h-4 w-4" />
            New Quote
          </Button>
        </div>
      </div>

      <QuoteStats
        pending={stats.pending}
        accepted={stats.accepted}
        totalValue={stats.totalValue}
        acceptedValue={stats.acceptedValue}
      />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or quote number..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            aria-label="Search quotes"
          />
        </div>
      </div>

      {viewMode === "cards" ? (
        <QuoteCards
          quotes={quotes}
          isLoading={isLoading}
          onEditQuote={onEdit}
          onDeleteQuote={onDelete}
        />
      ) : (
        <QuoteTable
          quotes={quotes}
          isLoading={isLoading}
          searchValue={searchTerm}
          onSearchChange={onSearchChange}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onRefresh={onRefresh}
        />
      )}

      <ListFooter
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        displayedItems={quotes.length}
        onPageChange={onPageChange}
        isLoading={isLoading}
        entityLabel="quotes"
        className="mt-6"
      />
    </div>
  );
};

export default QuoteView;