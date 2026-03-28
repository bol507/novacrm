import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OpportunityForm, { type OpportunityPayload } from '../components/OpportunityForm';
import { useCreateOpportunity } from '../hooks/useCreateOpportunity';

export const OpportunityCreatePage = () => {
  const navigate = useNavigate();
  const createOpportunityMutation = useCreateOpportunity();

  const handleSubmit = async (data: OpportunityPayload) => {
    try {
      const result = await createOpportunityMutation.mutateAsync(data);
      
      toast.success('Oportunidad creada exitosamente');
      
      // Navigate to detail page if we have the ID
      if (result?.potentialid) {
        navigate(`/dashboard/opportunities/${result.potentialid}`);
      } else {
        navigate('/dashboard/opportunities');
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || 'Error al crear la oportunidad'
      );
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/opportunities');
  };

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
            Nueva Oportunidad
          </h1>
          <p className="text-muted-foreground">
            Complete la información de la nueva oportunidad
          </p>
        </div>
      </div>

      {/* Formulario usando OpportunityForm directamente (sin Dialog) */}
      <OpportunityForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createOpportunityMutation.isPending}
      />
    </div>
  );
};

export default OpportunityCreatePage;
