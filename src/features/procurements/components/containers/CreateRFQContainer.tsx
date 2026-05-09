import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useVendorQuotes } from '../../hooks/use-vendor-quotes';
import { useProcurement } from '../../hooks/use-procurement';
import { CreateRFQPage, type CreateRFQPayload } from '../presentational/CreateRFQPage';

/**
 * CreateRFQContainer component for creating a Request for Quotation.
 *
 * Features:
 * - Receives material request data via navigation state
 * - Fetches list of available vendors
 * - Handles RFQ creation and navigation back on success
 *
 * @component
 * @returns The rendered create RFQ container
 */
export const CreateRFQContainer = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { materialRequestId, items } = location.state || {};
  
  const { mutate: createRFQ, isPending } = useVendorQuotes.create(Number(projectId));
  const { data: vendors } = useProcurement.listVendors(Number(projectId));

  const handleSubmit = (payload: CreateRFQPayload) => {
    if (!projectId) return;
    
    createRFQ(payload, {
      onSuccess: () => {
        navigate(-1);
      }      
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (!projectId || !materialRequestId || !items?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No data found to create RFQ</p>
          <Button onClick={() => navigate(-1)}>Back</Button>
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