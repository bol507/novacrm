import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ProjectsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  filter: "all" | "active"; 
}

export const ProjectsPagination = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  isLoading,
  filter,
}: ProjectsPaginationProps) => {
  // ✅ Calcular ítems mostrados en la página actual
  const itemsPerPage = 6; // ✅ Debe coincidir con el limit usado en el hook
  const displayedItems = Math.min(currentPage * itemsPerPage, totalItems);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="text-sm text-muted-foreground">
        {/* ✅ CORREGIDO: Usar startItem y displayedItems en lugar de projects.length */}
        Mostrando {startItem}-{displayedItems} de {totalItems}{" "}
        {filter === "active" ? "proyectos activos" : "proyectos"}
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          Anterior
        </Button>
        <span className="text-sm">
          Página {currentPage} de {totalPages}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};