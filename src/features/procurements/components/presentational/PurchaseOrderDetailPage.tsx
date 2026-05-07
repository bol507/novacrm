// src/features/procurement/components/presentational/PurchaseOrderDetailPage.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Calendar, Truck } from 'lucide-react';
import type { PurchaseOrder } from '../../types/procurement';

interface Props {
  po: PurchaseOrder;
  onBack: () => void;
}

export const PurchaseOrderDetailPage = ({ po, onBack }: Props) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">OC #{po.po_number}</h1>
            <p className="text-muted-foreground text-sm">Proyecto #{po.project_id}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-1">
          {po.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Principal */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ítems de la Orden</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ítem</TableHead>
                    <TableHead className="text-center">Cant.</TableHead>
                    <TableHead className="text-center">Unit.</TableHead>
                    <TableHead className="text-right">Costo Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {po.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.item_name}</TableCell>
                      <TableCell className="text-center">{item.quantity_ordered}</TableCell>
                      <TableCell className="text-center">{item.quantity_received}</TableCell>
                      <TableCell className="text-right">${item.unit_cost.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">${item.total_cost.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-bold">Gran Total</TableCell>
                    <TableCell className="text-right font-bold text-lg">${po.total_amount.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4 pt-6">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Proveedor</p>
                  <p className="font-medium">{po.vendor_name || `ID: ${po.vendor_id}`}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Fecha de Orden</p>
                  <p className="font-medium">{new Date(po.order_date).toLocaleDateString()}</p>
                </div>
              </div>

              {po.expected_delivery && (
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Entrega Esperada</p>
                    <p className="font-medium">{new Date(po.expected_delivery).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {po.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Notas Internas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{po.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};