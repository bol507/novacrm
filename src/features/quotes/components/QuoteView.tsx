
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, RefreshCw, LayoutGrid, List, X } from "lucide-react";
import { DEFAULT_QUOTE_SORT, type Quote, type QuoteSortConfig, type QuoteViewMode } from "../types/quote";
import ListFooter from "@/components/ListFooter";
import { QuoteCards } from "../components/QuoteCards";
import QuoteTable from "../components/QuoteTable";
import { QuoteStats } from "../components/QuoteStats";
import { QuoteSortControl } from "./QuoteSortControl";

export interface QuoteViewProps {
  quotes: Quote[];
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
  onViewModeChange: (mode: QuoteViewMode) => void;
  onRefresh: () => void;

  viewMode: QuoteViewMode;
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  quoteCount: number;
  sortConfig: QuoteSortConfig;
  onSortChange: (config: QuoteSortConfig) => void;

  onView?: (quote: Quote) => void;
  onEdit?: (quote: Quote) => void;
  onDelete?: (quote: Quote) => void;
  clientIdNumber?: number | null;
  handleClearClientFilter?: () => void;

}

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
 * - Responsive design with mobile-specific layouts
 *
 * @component
 * @param props - Component props
 * @returns The rendered quote view component
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
  handleClearClientFilter,
  sortConfig = DEFAULT_QUOTE_SORT,
  onSortChange = () => { },
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
    <div className="space-y-4 sm:space-y-6">

      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
              {quoteCount}
            </Badge>
            <span className="truncate">Quotes</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage sales quotes
          </p>

          {clientIdNumber && (
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs font-normal">
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

          
        {/* ✅ Barra de controles: Search + Sort + View Mode + Actions */}  
        <div className="flex flex-wrap items-center gap-2">

              
          {/* Search input */}
          <div className="relative flex-1 min-w-[200px] sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quotes..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9 text-sm"
              aria-label="Search quotes"
            />
          </div>
          
          {/* ✅ NUEVO: Sort control */}
          <QuoteSortControl 
            sortConfig={sortConfig}
            onSortChange={onSortChange}
            className="ml-auto md:ml-2"
          />

          <div className="hidden md:flex items-center gap-2 ml-auto md:ml-0">
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-9 w-9"
              title="Refresh list"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>

            <div className="flex rounded-md border border-border overflow-hidden">
              <Button
                variant={viewMode === "cards" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("cards")}
                className="rounded-none border-r border-border h-9 px-3"
                title="Card view"
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                <span className="hidden lg:inline">Cards</span>
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("table")}
                className="rounded-none h-9 px-3"
                title="Table view"
              >
                <List className="h-4 w-4 mr-1" />
                <span className="hidden lg:inline">Table</span>
              </Button>
            </div>

            <Button size="sm" onClick={onCreateClick} className="h-9 gap-1.5">
              <Plus className="h-4 w-4" />
              <span className="hidden lg:inline">New Quote</span>
              <span className="lg:hidden">New</span>
            </Button>
          </div>

          <div className="flex md:hidden items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-9 w-9"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button size="sm" onClick={onCreateClick} className="h-9 gap-1.5">
              <Plus className="h-4 w-4" />
              <span>New</span>
            </Button>
          </div>
        </div>
      </div>

      <QuoteStats
        pending={stats.pending}
        accepted={stats.accepted}
        totalValue={stats.totalValue}
        acceptedValue={stats.acceptedValue}
      />

      <div className="min-h-[200px]">

        <div className="block md:hidden">
          <QuoteCards
            quotes={quotes}
            isLoading={isLoading}
            onEditQuote={onEdit}
            onDeleteQuote={onDelete}
          />
        </div>

        <div className="hidden md:block">
          {viewMode === "cards" ? (
            <QuoteCards
              quotes={quotes}
              isLoading={isLoading}
              onEditQuote={onEdit}
              onDeleteQuote={onDelete}
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border">
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
            </div>
          )}
        </div>
      </div>

      <ListFooter
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        displayedItems={quotes.length}
        onPageChange={onPageChange}
        isLoading={isLoading}
        entityLabel="quotes"
        className="mt-4 sm:mt-6"
      />
    </div>
  );
};

export default QuoteView;