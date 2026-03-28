import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OpportunityForm, { type OpportunityPayload } from "../components/OpportunityForm";
import { useOpportunity } from "@/features/opportunity/hooks/useOpportunity";
import { useUpdateOpportunity } from "@/features/opportunity/hooks/useUpdateOpportunity";

export const OpportunityEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const opportunityId = id ? parseInt(id) : null;
  const { data: opportunity, isLoading: isLoadingOpportunity, error } = useOpportunity(opportunityId);
  const updateOpportunityMutation = useUpdateOpportunity();

  const handleSubmit = async (data: OpportunityPayload) => {
    if (!opportunityId) {
      toast.error("ID de oportunidad no válido");
      return;
    }

    try {
      await updateOpportunityMutation.mutateAsync({
        id: opportunityId,
        data: data,
      });

      toast.success("Oportunidad actualizada exitosamente");
      navigate(`/dashboard/opportunities/${opportunityId}`);
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Error al actualizar la oportunidad"
      );
    }
  };

  const handleCancel = () => {
    if (opportunity) {
      navigate(`/dashboard/opportunities/${opportunity.potentialid}`);
    } else {
      navigate("/dashboard/opportunities");
    }
  };

  // Estado de carga
  if (isLoadingOpportunity) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  // Estado de error
  if (error || !opportunity) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {error?.message || "Oportunidad no encontrada"}
            </p>
            <Button variant="outline" onClick={() => navigate("/dashboard/opportunities")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Oportunidades
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header con navegación */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Editar Oportunidad
          </h1>
          <p className="text-muted-foreground">
            {opportunity.potentialname} ({opportunity.potential_no})
          </p>
        </div>
      </div>

      {/* Formulario usando OpportunityForm directamente (sin Dialog) */}
      <OpportunityForm
        mode="edit"
        initialData={opportunity}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={updateOpportunityMutation.isPending}
      />
    </div>
  );
};

export default OpportunityEditPage;
