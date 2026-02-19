import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

import { opportunityService } from "../services/opportunityService";
import type { Opportunity } from "../types/opportunity";
import { useCreateOpportunity } from "../hooks/useCreateOpportunity";
import { useOpportunities } from "../hooks/useOpportunities";
import { toast } from "sonner";
import { OpportunityCards } from "../components/OpportunityCards";
import OpportunityFormDialog, { type OpportunityFormValues } from "../components/OpportunityFormDialog";
import { Pagination } from "@/components/Pagination";
import { usePagination } from "@/shared/hooks/use-pagination";
import OpportunityDetailDialog from "../components/OpportunityDetailDialog";
import { useUpdateOpportunity } from "../hooks/useUpdateOpportunity";
import { useConfirm } from "@/components/confirm-dialog";


const OpportunitiesPage = () => {
  const { page, setPage, searchTerm, setSearchTerm } = usePagination();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [viewingOpportunity, setViewingOpportunity] = useState<Opportunity | null>(null);

  const { data, isLoading, error, refetch } = useOpportunities(page, 20, searchTerm);
  const createOpportunityMutation = useCreateOpportunity();
  const updateOpportunityMutation = useUpdateOpportunity();
  const showConfirm = useConfirm();

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    console.log('editingOpportunity actualizado:', editingOpportunity);
  }, [editingOpportunity]);

  const filteredOpportunities = data?.data || [];
  const totalPages = data?.meta?.last_page || 1;
  const totalItems = data?.meta?.total || 0;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Error al cargar oportunidades: {error.message}</p>
        </div>
      </div>
    );
  }

  const handleCreateOpportunity = async (opportunityData: any) => {
    try {
      await createOpportunityMutation.mutateAsync(opportunityData);
      setPage(1);
    } catch (error) {
    }
  };

  const handleEditOpportunityClick = (opportunity: Opportunity) => {
  setEditingOpportunity(opportunity);
};

  const handleEditOpportunitySubmit = async (opportunityData: OpportunityFormValues) => {
  if (!editingOpportunity) {
    toast.error("No se pudo obtener la oportunidad para editar");
    return;
  }

  try {
    await updateOpportunityMutation.mutateAsync({
      id: editingOpportunity.potentialid,
      data: opportunityData
    });
    setEditingOpportunity(null);
  } catch (error) {
    // El error ya se maneja en el hook
  }
};
  const handleViewOpportunity = (opportunity: Opportunity) => {
    setViewingOpportunity(opportunity);
  };

  const handleDeleteOpportunity = (opportunity: Opportunity) => {
    showConfirm({
      title: "Eliminar oportunidad",
      description: `¿Estás seguro de eliminar la oportunidad "${opportunity.potentialname}"? Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      onConfirm: async () => {
        try {
          await opportunityService.deleteOpportunity(opportunity.potentialid);
          toast.success("Oportunidad eliminada exitosamente");
          refetch();
        } catch (error: any) {
          toast.error(error.response?.data?.error || "Error al eliminar la oportunidad");
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Oportunidades</h1>
          <p className="text-muted-foreground">
            Gestiona las oportunidades de venta
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nueva Oportunidad
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre de oportunidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Opportunities Grid */}
      <OpportunityCards
        opportunities={filteredOpportunities}
        isLoading={isLoading}
        onViewOpportunity={handleViewOpportunity}
        onEditOpportunity={handleEditOpportunityClick}
        onDeleteOpportunity={handleDeleteOpportunity}
      />

      {/* Footer info y paginación */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {!isLoading && (
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredOpportunities.length} de {totalItems} oportunidades
          </div>
        )}

        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Diálogos */}
      <OpportunityFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateOpportunity}
        mode="create"
      />
      {viewingOpportunity && (
        <OpportunityDetailDialog
          opportunity={viewingOpportunity}
          open={true}
          onOpenChange={() => setViewingOpportunity(null)}
           onEdit={handleEditOpportunityClick}
          onDelete={handleDeleteOpportunity}
        />
      )}

      {editingOpportunity && (
        <OpportunityFormDialog
          open={true}
          onOpenChange={() => setEditingOpportunity(null)}
          onSubmit={handleEditOpportunitySubmit} 
          mode="edit"
          initialData={editingOpportunity}
        />
      )}
    </div>
  );
};

export default OpportunitiesPage;