// src/features/procurement/components/presentational/GeneratePOModal.tsx

import { useState, useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { MaterialRequestItem } from '../../types/procurement';

interface VendorGroup {
  vendorId: number | null;
  vendorName?: string;
  items: MaterialRequestItem[];
  totalAmount: number;
  itemCount: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    approved_item_ids: number[];
    vendor_id?: number;  // Opcional: si se fuerza un solo proveedor
    po_notes?: string;
    expected_delivery?: string;
  }) => void;
  items: MaterialRequestItem[];
  isPending: boolean;
  // Opcional: mapa de vendor_id → vendor_name para mostrar nombres legibles
  vendorMap?:  Record<number, string>;
}

export const GeneratePOModal = ({
  open,
  onClose,
  onSubmit,
  items,
  isPending,
  vendorMap = {} as Record<number, string>,
}: Props) => {
  const [globalNotes, setGlobalNotes] = useState('');
  const [globalDelivery, setGlobalDelivery] = useState('');
  const [forceSingleVendor, setForceSingleVendor] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<number | undefined>();

  // 🔑 Agrupar items por vendor_id (auto-split logic preview)
  const groupedByVendor = useMemo(() => {
    const groups = new Map<number | null, MaterialRequestItem[]>();
    
    items.forEach(item => {
      // Si el item no tiene vendor_id, lo agrupamos como "Sin proveedor"
      const vendorId = item.vendor_id ?? null;
      const existing = groups.get(vendorId) || [];
      groups.set(vendorId, [...existing, item]);
    });

    // Convertir a array de VendorGroup con cálculos
    return Array.from(groups.entries()).map(([vendorId, vendorItems]): VendorGroup => {
      const total = vendorItems.reduce((sum, item) => {
        const cost = Number(item.estimated_cost ?? 0);
        const qty = Number(item.approved_quantity ?? item.quantity ?? 0);
        return sum + (cost * qty);
      }, 0);

      return {
        vendorId,
        vendorName: vendorId ? vendorMap[vendorId] : 'Sin proveedor asignado',
        items: vendorItems,
        totalAmount: total,
        itemCount: vendorItems.length,
      };
    });
  }, [items, vendorMap]);

  // Calcular total general
  const grandTotal = groupedByVendor.reduce((sum, g) => sum + g.totalAmount, 0);

  // Si se fuerza un solo proveedor, filtrar grupos
  const effectiveGroups = forceSingleVendor && selectedVendorId
    ? groupedByVendor.filter(g => g.vendorId === selectedVendorId)
    : groupedByVendor;

  const handleSubmit = () => {
    // Validación: si se fuerza vendor, asegurar que hay items válidos
    if (forceSingleVendor && !selectedVendorId) {
      return; // o mostrar error
    }

    onSubmit({
      approved_item_ids: items.map(i => i.id),
      vendor_id: forceSingleVendor ? selectedVendorId : undefined,
      po_notes: globalNotes || undefined,
      expected_delivery: globalDelivery || undefined,
    });
  };

  // Extraer lista única de vendors para el dropdown
  const uniqueVendors = useMemo(() => {
    const vendors = new Map<number, string>();
    items.forEach(item => {
      if (item.vendor_id && !vendors.has(item.vendor_id)) {
        vendors.set(item.vendor_id, vendorMap[item.vendor_id] || `Proveedor #${item.vendor_id}`);
      }
    });
    return Array.from(vendors.entries()).map(([id, name]) => ({ id, name }));
  }, [items, vendorMap]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Generar Orden(es) de Compra
          </DialogTitle>
          <DialogDescription>
            {groupedByVendor.length > 1 
              ? `Se generarán ${groupedByVendor.length} órdenes de compra (una por proveedor)`
              : 'Se generará 1 orden de compra'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          
          {/* 🔔 Alerta de auto-split */}
          {groupedByVendor.length > 1 && !forceSingleVendor && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md flex gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium">Múltiples proveedores detectados</p>
                <p>Los ítems se agruparán automáticamente por proveedor. 
                   Si prefieres forzar una sola PO para un proveedor específico, activa la opción abajo.
                </p>
              </div>
            </div>
          )}

          {/* Opción: Forzar un solo proveedor */}
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="forceVendor"
                  checked={forceSingleVendor}
                  onChange={(e) => setForceSingleVendor(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="forceVendor" className="font-medium cursor-pointer">
                  Forzar una sola PO para un proveedor específico
                </Label>
              </div>
              
              {forceSingleVendor && (
                <select
                  className="flex h-9 w-48 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={selectedVendorId || ''}
                  onChange={(e) => setSelectedVendorId(e.target.value ? Number(e.target.value) : undefined)}
                >
                  <option value="">Seleccionar proveedor...</option>
                  {uniqueVendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              )}
            </CardContent>
          </Card>

          {/* 📦 Vista previa: Grupos por proveedor */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">
              Vista previa de órdenes a generar ({effectiveGroups.length})
            </h4>
            
            {effectiveGroups.map((group, index) => (
              <Card key={group.vendorId ?? 'unknown'} className={groupedByVendor.length > 1 ? 'border-l-4 border-l-primary' : ''}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {group.vendorName || 'Sin proveedor'}
                        {groupedByVendor.length > 1 && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            PO #{index + 1}
                          </Badge>
                        )}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">${group.totalAmount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{group.itemCount} ítem(s)</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ítem</TableHead>
                        <TableHead className="text-center">Cant.</TableHead>
                        <TableHead className="text-center">Unit.</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.items.map((item) => {
                        const unitCost = Number(item.estimated_cost ?? 0);
                        const qty = Number(item.approved_quantity ?? item.quantity ?? 0);
                        const total = (unitCost * qty).toFixed(2);

                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.item_name}</TableCell>
                            <TableCell className="text-center">{qty}</TableCell>
                            <TableCell className="text-center">{item.unit}</TableCell>
                            <TableCell className="text-right">${total}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          {/* 📝 Datos globales de la(s) PO(s) */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="delivery">Fecha esperada de entrega</Label>
              <Input
                id="delivery"
                type="date"
                value={globalDelivery}
                onChange={(e) => setGlobalDelivery(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas internas (aplica a todas las POs)</Label>
            <Textarea
              id="notes"
              placeholder="Instrucciones para el equipo de compras, términos de pago, etc."
              value={globalNotes}
              onChange={(e) => setGlobalNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* 💰 Resumen final */}
          <div className="p-4 bg-muted/50 rounded-lg flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>
                {effectiveGroups.length} PO(s) • {items.length} ítem(s) total
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total estimado</p>
              <p className="text-xl font-bold">${grandTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isPending || effectiveGroups.length === 0 || (forceSingleVendor && !selectedVendorId)}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Package className="mr-2 h-4 w-4" />
                Generar {effectiveGroups.length === 1 ? 'Orden' : `${effectiveGroups.length} Órdenes`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};