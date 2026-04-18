import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PurchaseFormContent } from '../components/PurchaseFormContent';
import { useUpdatePurchase } from '../hooks/useUpdatePurchase';
import { usePurchaseDetail } from '../hooks/usePurchaseDetail';
import { toast } from 'sonner';
import type { PurchaseFormData } from '../types/purchase';

/**
 * PurchaseEditPage component for editing an existing purchase order.
 *
 * Fetches the purchase data by ID from the URL parameters, displays a form
 * pre-populated with the purchase's current information, and handles form
 * submission to update the purchase. Shows loading and error states while
 * fetching data, and navigates back on success or cancel.
 *
 * @component
 * @returns The rendered purchase edit page
 */
export const PurchaseEditPage = () => {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const navigate = useNavigate();

  if (!purchaseId) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Invalid purchase ID</p>
        <Button variant="outline" onClick={() => navigate('/dashboard/purchases')}>
          Back to purchases
        </Button>
      </div>
    );
  }

  const { data: purchase, isLoading: purchaseLoading, error: purchaseError } = usePurchaseDetail(purchaseId);
  const updatePurchase = useUpdatePurchase();

  const handleSubmit = async (values: PurchaseFormData) => {
    try {
      await updatePurchase.mutateAsync({
        id: parseInt(purchaseId),
        data: values
      });
      toast.success('Purchase order updated successfully');
      navigate(`/dashboard/purchases/${purchaseId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error updating purchase order');
      throw error;
    }
  };

  const handleCancel = () => {
    if (updatePurchase.isPending) {
      toast.warning('Please wait for the current operation to complete');
      return;
    }
    navigate(-1);
  };

  if (purchaseLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin text-2xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading purchase...</p>
        </div>
      </div>
    );
  }

  if (purchaseError || !purchase) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Error loading purchase</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          disabled={updatePurchase.isPending}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Purchase Order</h1>
          <p className="text-muted-foreground">
            #{purchase.ponumber} • {purchase.subject}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase details</CardTitle>
        </CardHeader>
        <CardContent>
          <PurchaseFormContent
            mode="edit"
            initialData={purchase}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={updatePurchase.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseEditPage;