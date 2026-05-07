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
    <div className="space-y-4 sm:space-y-6">
      
      {/* ===== HEADER ===== */}
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
              {opportunityCount}
            </Badge>
            <span className="truncate">Oportunidades</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las oportunidades de venta
          </p>
          
          {clientIdNumber && (
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs font-normal">
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

        {/* Barra de acciones responsive */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Búsqueda - adaptable */}
          <div className="relative flex-1 min-w-[200px] sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar oportunidad..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9 text-sm"
              aria-label="Buscar oportunidades"
            />
          </div>

          {/* 🖥️ DESKTOP: Controles completos (Ocultos en móvil) */}
          <div className="hidden md:flex items-center gap-2 ml-auto md:ml-0">
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-9 w-9"
              title="Actualizar lista"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>

            <div className="flex rounded-md border border-border overflow-hidden">
              <Button
                variant={viewMode === "cards" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("cards")}
                className="rounded-none border-r border-border h-9 px-3"
                title="Vista tarjetas"
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                <span className="hidden lg:inline">Tarjetas</span>
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("table")}
                className="rounded-none h-9 px-3"
                title="Vista tabla"
              >
                <List className="h-4 w-4 mr-1" />
                <span className="hidden lg:inline">Tabla</span>
              </Button>
            </div>

            <Button size="sm" onClick={onCreateClick} className="h-9 gap-1.5">
              <Plus className="h-4 w-4" />
              <span className="hidden lg:inline">Nueva Oportunidad</span>
              <span className="lg:hidden">Nueva</span>
            </Button>
          </div>

          {/* 📱 MOBILE: Controles compactos (Solo actualizar + crear) */}
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
              <span>Nueva</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ===== LISTA: CAMBIO AUTOMÁTICO POR BREAKPOINT ===== */}
      <div className="min-h-[200px]">
        
        {/* 📱 MOBILE: Fuerza siempre Tarjetas (evita tabla rota) */}
        <div className="block md:hidden">
          <OpportunityCards
            opportunities={opportunities}
            isLoading={isLoading}
            onViewOpportunity={onView!}
            onEditOpportunity={onEdit}
            onDeleteOpportunity={onDelete}
          />
        </div>

        {/* 💻 DESKTOP: Respeta el toggle del usuario */}
        <div className="hidden md:block">
          {viewMode === "cards" ? (
            <OpportunityCards
              opportunities={opportunities}
              isLoading={isLoading}
              onViewOpportunity={onView!}
              onEditOpportunity={onEdit}
              onDeleteOpportunity={onDelete}
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border">
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
            </div>
          )}
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <ListFooter
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        displayedItems={opportunities.length}
        onPageChange={onPageChange}
        isLoading={isLoading}
        entityLabel="oportunidades"
        className="mt-4 sm:mt-6"
      />
    </div>
  );
};

export default OpportunityView;
