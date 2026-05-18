import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Package, CheckCircle2 } from 'lucide-react';
import type { GeneratePOFromQuotePayload, VendorQuoteItem } from '../../types/procurement';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: GeneratePOFromQuotePayload) => void;
  quoteId: number;
  items: VendorQuoteItem[];
  vendorName: string;
  isPending: boolean;
}

const toNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

/**
 * GeneratePOFromQuoteModal component for creating a Purchase Order from an accepted vendor quote.
 *
 * Features:
 * - Displays items from the quote with checkboxes for selection
 * - Shows locked prices from the accepted quote
 * - Allows PO number override (optional)
 * - Includes internal notes field for procurement team
 * - Calculates total amount based on selected items
 *
 * @component
 * @param props - Component props
 * @param props.open - Whether the modal is open
 * @param props.onClose - Callback when modal closes
 * @param props.onSubmit - Callback when PO generation is confirmed
 * @param props.quoteId - ID of the vendor quote
 * @param props.items - Array of quote items
 * @param props.vendorName - Name of the vendor
 * @param props.isPending - Whether submission is in progress
 * @returns The rendered generate PO from quote modal
 */
export const GeneratePOFromQuoteModal = ({
  open, onClose, onSubmit, quoteId, items, vendorName, isPending
}: Props) => {
  const [poNumberOverride, setPoNumberOverride] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<number, boolean>>(
    Object.fromEntries(items.map(i => [i.id, true]))
  );

  const totalAmount = items
    .filter(i => selectedItems[i.id] !== false)
    .reduce((sum, i) => {
      const lineTotal = toNumber(i.line_total);
      return sum + lineTotal;
    }, 0);

  const handleSubmit = () => {
    const filteredItems = items
      .filter(i => selectedItems[i.id] !== false)
      .map(i => ({
        vendor_quote_item_id: i.id,
        material_request_item_id: i.material_request_item_id,
        item_name: i.item_name ?? 'Item without name',
        unit: i.unit ?? 'unit',
        quantity: toNumber(i.quantity),
        unit_price: toNumber(i.unit_price),
        discount_percent: toNumber(i.discount_percent),
        line_total: toNumber(i.line_total),
        expected_delivery_date: i.delivery_date ?? undefined,
        terms: i.terms ?? undefined,
        notes: i.notes ?? undefined,
      }));

    onSubmit({
      vendor_quote_id: quoteId,
      items: filteredItems,
      po_number_override: poNumberOverride || undefined,
      internal_notes: internalNotes || undefined,
    });
  };

  const selectedCount = items.filter(i => selectedItems[i.id] !== false).length;
  const isFormValid = selectedCount > 0 && totalAmount > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Generate Purchase Order
          </DialogTitle>
          <DialogDescription>
            Create PO from accepted quote from <strong>{vendorName}</strong>.
            Prices and terms are copied immutably from the quote.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md flex gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-800 dark:text-green-200">
              <p className="font-medium">Locked prices</p>
              <p>The prices in this PO are copied directly from the accepted quote.
                Any future changes to the quote will not affect this Purchase Order.
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="poNumber">PO Number (optional)</Label>
                  <Input
                    id="poNumber"
                    placeholder="E.g., PO-2026-CUSTOM"
                    value={poNumberOverride}
                    onChange={(e) => setPoNumberOverride(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Leave empty for auto-generation</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="internalNotes">Internal notes (procurement team)</Label>
                <Textarea
                  id="internalNotes"
                  placeholder="Special instructions, contacts, references..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">
              Items to include in PO
            </h4>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">✓</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Disc.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedItems[item.id] ?? true}
                          onChange={(e) => setSelectedItems(prev => ({
                            ...prev,
                            [item.id]: e.target.checked,
                          }))}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="font-medium">{item.item_name}</p>
                          {item.notes && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{item.notes}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {toNumber(item.quantity)} {item.unit || 'unit'}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${toNumber(item.unit_price).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {toNumber(item.discount_percent).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        ${toNumber(item.line_total).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator />

          <div className="p-4 bg-muted/50 rounded-lg flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4 text-primary" />
              <span>
                {selectedCount} item(s) selected
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">PO Total</p>
              <p className="text-xl font-bold text-primary">${Number(totalAmount ?? 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !isFormValid}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PO...
              </>
            ) : (
              <>
                <Package className="h-4 w-4" />
                Generate Purchase Order
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};