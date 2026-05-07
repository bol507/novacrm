// src/features/procurement/containers/CreateRFQContainer.tsx

import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useVendorQuotes } from '../../hooks/use-vendor-quotes';
import { useProcurement } from '../../hooks/useProcurement';
import { CreateRFQPage, type CreateRFQPayload } from '../presentational/CreateRFQPage';

export const CreateRFQContainer = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Datos pasados desde la lista (via state)
  const { materialRequestId, items } = location.state || {};
  
  const { mutate: createRFQ, isPending } = useVendorQuotes.create(Number(projectId));
  const {  data: vendors } = useProcurement.listVendors(Number(projectId));

  const handleSubmit = (payload: CreateRFQPayload) => {
    if (!projectId) return;
    
    createRFQ(payload, {
      onSuccess: (res) => {
        toast.success(`RFQ #${res.id} creada exitosamente`);
        // Navegar a la lista de cotizaciones o al detalle de la nueva RFQ
        //navigate(`/projects/${projectId}/vendor-quotes`, { replace: true });
        navigate(-1);
      },
      onError: (err) => {
        toast.error(err.message || 'Error creando RFQ');
      },
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // Validar que tenemos los datos necesarios
  if (!projectId || !materialRequestId || !items?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No se encontraron los datos para crear la RFQ</p>
          <Button onClick={() => navigate(-1)}>Volver</Button>
        </div>
      </div>
    );
  }

  return (
    <CreateRFQPage
      projectId={projectId}
      materialRequestId={materialRequestId}
      items={items}
      vendors={vendors || []}
      isPending={isPending}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};

export default CreateRFQContainer;  