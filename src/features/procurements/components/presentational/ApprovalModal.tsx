import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { ApproveRequestPayload, MaterialRequestItem } from '../../types/procurement';

interface ApprovalItem {
  id: number;
  itemName: string;
  quantity: number;
  unit: string;
  decision: 'approve' | 'reject' | 'partial';
  approvedQuantity: number;
}

interface Props {
  open: boolean;
  requestId: number;
  items: MaterialRequestItem[];
  onClose: () => void;
  onSubmit: (payload: ApproveRequestPayload) => void; 
  isPending: boolean;
}

export const ApprovalModal = ({
  open,
  requestId,
  items,
  onClose,
  onSubmit,
  isPending,
}: Props) => {
  const [notes, setNotes] = useState('');


  const [approvalItems, setApprovalItems] = useState<ApprovalItem[]>([]);

  useEffect(() => {
    if (items.length > 0) {
      setApprovalItems(
        items.map(item => ({
          id: item.id,
          itemName: item.item_name,
          quantity: item.quantity,
          unit: item.unit,
          decision: 'approve' as const,
          approvedQuantity: item.quantity,
        }))
      );
    }
  }, [items]);

  // Actualizar decisión de un ítem
  const updateDecision = (itemId: number, decision: 'approve' | 'reject' | 'partial') => {
    setApprovalItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            decision,
            // Si es approve o reject, la cantidad aprobada es 0 o total
            approvedQuantity: decision === 'reject' ? 0 : item.quantity,
          };
        }
        return item;
      })
    );
  };

  // Actualizar cantidad aprobada
  const updateApprovedQuantity = (itemId: number, value: string) => {
    const num = parseFloat(value);
    const item = approvalItems.find(i => i.id === itemId);

    if (!item) return;

    // Limitar entre 0 y cantidad solicitada
    const validQty = Math.max(0, Math.min(num || 0, item.quantity));

    setApprovalItems(prev =>
      prev.map(i => i.id === itemId ? { ...i, approvedQuantity: validQty } : i)
    );
  };

  const handleSubmit = () => {
  const payload: ApproveRequestPayload = {
    items: approvalItems.map(item => ({
      itemId: item.id,
      decision: item.decision,
      approvedQuantity: item.decision === 'partial' ? item.approvedQuantity : null,
    })),
    notes: notes.trim() || undefined,
  };

  onSubmit(payload);
};
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aprobar Solicitud #{requestId}</DialogTitle>
          <DialogDescription>
            Revisa los ítems solicitados y decide cuáles aprobar
          </DialogDescription>
        </DialogHeader>

        {/* Tabla de ítems */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Ítem</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-center">Decisión</TableHead>
                <TableHead className="text-center">Cantidad Aprobada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvalItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No hay ítems en esta solicitud
                  </TableCell>
                </TableRow>
              ) : (
                approvalItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p>{item.itemName}</p>
                        <p className="text-xs text-muted-foreground">{item.unit}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-center">
                      <Select
                        value={item.decision}
                        onValueChange={(val) => {
                          // Validar que el valor sea uno de los permitidos
                          const decisions = ['approve', 'reject', 'partial'] as const;
                          if (decisions.includes(val as any)) {
                            updateDecision(item.id, val as typeof decisions[number]);
                          }
                        }}
                        disabled={isPending}
                      >
                        <SelectTrigger className="w-32 mx-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approve" className="text-green-600">
                            ✅ Aprobar
                          </SelectItem>
                          <SelectItem value="partial" className="text-yellow-600">
                            ⚠️ Parcial
                          </SelectItem>
                          <SelectItem value="reject" className="text-red-600">
                            ❌ Rechazar
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.decision === 'partial' ? (
                        <input
                          type="number"
                          min={0}
                          max={item.quantity}
                          value={item.approvedQuantity}
                          onChange={(e) => updateApprovedQuantity(item.id, e.target.value)}
                          className="w-24 px-2 py-1 text-center border rounded-md text-sm"
                          disabled={isPending}
                        />
                      ) : item.decision === 'approve' ? (
                        <span className="text-green-600 font-medium">{item.quantity}</span>
                      ) : (
                        <span className="text-red-600 font-medium">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Notas */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notas de aprobación/rechazo</Label>
          <Textarea
            id="notes"
            placeholder="Motivo de rechazo o comentarios adicionales..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px]"
            disabled={isPending}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              'Confirmar decisión'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};