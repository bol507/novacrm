
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import type { PurchaseOrder } from '../types/procurement';

interface Props {
  orders: PurchaseOrder[];
  isLoading: boolean;
  onViewDetail: (poId: number) => void;
}

export const PurchaseOrderListPage = ({ orders, isLoading, onViewDetail }: Props) => {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'sent_to_vendor': return 'bg-indigo-100 text-indigo-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>OC #</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha Orden</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={6} className="text-center py-4">Cargando...</TableCell></TableRow>
          ) : orders.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="text-center py-4 text-muted-foreground">No hay órdenes de compra</TableCell></TableRow>
          ) : (
            orders.map((po) => (
              <TableRow key={po.id}>
                <TableCell className="font-mono font-medium">{po.po_number}</TableCell>
                <TableCell>{po.vendor_name || `ID: ${po.vendor_id}`}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(po.status)}>
                    {po.status.replace(/_/g, ' ')}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(po.order_date).toLocaleDateString()}</TableCell>
                <TableCell className="text-right font-medium">${po.total_amount.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onViewDetail(po.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};