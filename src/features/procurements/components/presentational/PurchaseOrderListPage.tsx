import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Package } from 'lucide-react';
import type { PurchaseOrder } from '../../types/procurement';

interface Props {
  orders: PurchaseOrder[];
  isLoading: boolean;
  onViewDetail: (poId: number) => void;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  submitted: { label: 'Submitted', variant: 'default' },
  approved: { label: 'Approved', variant: 'default' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  partially_received: { label: 'Partial', variant: 'outline' },
  fully_received: { label: 'Received', variant: 'outline' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
};

/**
 * PurchaseOrderListPage component for displaying a paginated list of purchase orders.
 *
 * Features:
 * - Table view with PO number, vendor, status, total, and expected delivery date
 * - Clickable rows for viewing PO details
 * - Status badges with appropriate colors
 * - Empty state when no POs exist
 *
 * @component
 * @param props - Component props
 * @param props.orders - Array of purchase orders
 * @param props.isLoading - Whether data is currently loading
 * @param props.onViewDetail - Callback to view PO details
 * @returns The rendered purchase order list page
 */
export const PurchaseOrderListPage = ({ orders, onViewDetail }: Props) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <Package className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No purchase orders registered</p>
        <p className="text-xs text-muted-foreground mt-1">They will be generated automatically when accepting quotes</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PO #</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Expected Delivery</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((po) => {
            const config = statusConfig[po.status] || statusConfig.draft;
            return (
              <TableRow 
                key={po.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onViewDetail(po.id)}
              >
                <TableCell className="font-mono font-medium text-primary">{po.po_number}</TableCell>
                <TableCell>{po.vendor_name || `Vendor #${po.vendor_id}`}</TableCell>
                <TableCell>
                  <Badge variant={config.variant}>{config.label}</Badge>
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                  ${Number(po.total_amount ?? 0).toFixed(2)}
                </TableCell>
                <TableCell>
                  {po.expected_delivery_date ? (
                    <span className={new Date(po.expected_delivery_date) < new Date() ? 'text-destructive' : ''}>
                      {new Date(po.expected_delivery_date).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" onClick={() => onViewDetail(po.id)} title="View details">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default PurchaseOrderListPage;