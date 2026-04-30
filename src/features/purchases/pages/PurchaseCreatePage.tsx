import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PurchaseFormContent } from '../components/PurchaseFormContent';
import { useCreatePurchase } from '../hooks/useCreatePurchase';
import { toast } from 'sonner';
import type { PurchaseFormData } from '../types/purchase';
import { useProjectName } from '@/features/projects/hooks/use-project-name';

/**
 * PurchaseCreatePage component for creating a new purchase order.
 *
 * Displays a form for creating a new purchase order and handles
 * form submission to create the purchase. Shows loading and error
 * states during submission, and navigates to the purchase detail
 * page on success or back on cancel.
 *
 * @component
 * @returns The rendered purchase create page
 */
export const PurchaseCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createPurchase = useCreatePurchase();
  const projectIdFromUrl = searchParams.get('projectId');
  const initialProjectId = projectIdFromUrl ? parseInt(projectIdFromUrl) : undefined;
  const { data: projectName } = useProjectName(initialProjectId || null);

  const handleSubmit = async (values: PurchaseFormData) => {
    try {
      const response = await createPurchase.mutateAsync(values);
      toast.success('Purchase order created successfully');
      navigate(`/dashboard/purchases/${response.data?.purchaseorderid}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error creating purchase order');
      throw error;
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          disabled={createPurchase.isPending}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Purchase Order</h1>
          <p className="text-muted-foreground">
            Add a new purchase order to track project expenses
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase details</CardTitle>
        </CardHeader>
        <CardContent>
          <PurchaseFormContent
            mode="create"
            initialProjectId={initialProjectId}
            initialProjectName={projectName || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createPurchase.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseCreatePage;