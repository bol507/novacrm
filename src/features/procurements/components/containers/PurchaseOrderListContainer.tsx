import { useNavigate } from 'react-router-dom';
import { usePurchaseOrders } from '../../hooks/use-purchase-order';
import { PurchaseOrderListPage } from '../presentational/PurchaseOrderListPage';
import { Loader2, AlertCircle } from 'lucide-react';

interface Props {
  projectId: string;
}

/**
 * PurchaseOrderListContainer component for displaying a list of purchase orders.
 *
 * Features:
 * - Fetches purchase orders for a project
 * - Shows loading state while fetching
 * - Displays error state on failure
 * - Navigates to PO detail view when a PO is selected
 *
 * @component
 * @param props - Component props
 * * @param props.projectId - ID of the project
 * @returns The rendered purchase order list container
 */
export const PurchaseOrderListContainer = ({ projectId }: Props) => {
  const navigate = useNavigate();
  const { data: orders, isLoading, error } = usePurchaseOrders.list(Number(projectId));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">Loading purchase orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
        <AlertCircle className="h-4 w-4" />
        <p className="text-sm">Error loading POs</p>
      </div>
    );
  }

  return (
    <PurchaseOrderListPage
      orders={orders?.data || []}
      isLoading={false}
      onViewDetail={(poId) => navigate(`procurement/purchase-orders/${poId}`)}
    />
  );
};