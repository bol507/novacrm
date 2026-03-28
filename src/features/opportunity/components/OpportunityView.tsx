import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, RefreshCw, LayoutGrid, List, X } from "lucide-react";
import type { Opportunity, OpportunityViewMode } from "../types/opportunity";
import ListFooter from "@/components/ListFooter";
import { OpportunityCards } from "../components/OpportunityCards";
import OpportunityTable from "../components/OpportunityTable";

export interface OpportunityViewProps {
  opportunities: Opportunity[];
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
  onViewModeChange: (mode: OpportunityViewMode) => void;
  onRefresh: () => void;
  onView?: (opportunity: Opportunity) => void;
  onEdit?: (opportunity: Opportunity) => void;
  onDelete?: (opportunity: Opportunity) => void;
  viewMode: OpportunityViewMode;
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  opportunityCount: number;
  clientIdNumber?: number | null;
  handleClearClientFilter?: () => void;
}

export const OpportunityView = ({
  opportunities,
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
  opportunityCount,
  clientIdNumber,
  handleClearClientFilter
}: OpportunityViewProps) => {
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Error loading opportunities: {error.message}</p>
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
              {opportunityCount}
            </Badge>
            Oportunidades
          </h1>
          <p className="text-muted-foreground">
            Gestiona las oportunidades de venta
          </p>
          {clientIdNumber && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-sm font-normal">
                Cliente ID: {clientIdNumber}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearClientFilter}
                className="h-6 px-2 text-xs hover:bg-muted"
              >
                <X className="h-3 w-3 mr-1" />
                Limpiar filtro
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
            Nueva Oportunidad
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre de oportunidad..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            aria-label="Buscar oportunidades"
          />
        </div>
      </div>

      {viewMode === "cards" ? (
        <OpportunityCards
          opportunities={opportunities}
          isLoading={isLoading}
          onViewOpportunity={onView!}
          onEditOpportunity={onEdit}
          onDeleteOpportunity={onDelete}
        />
      ) : (
        <OpportunityTable
          opportunities={opportunities}
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
        displayedItems={opportunities.length}
        onPageChange={onPageChange}
        isLoading={isLoading}
        entityLabel="oportunidades"
        className="mt-6"
      />
    </div>
  );
};

export default OpportunityView;
