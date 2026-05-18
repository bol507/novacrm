import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, Building2, Calendar, Info, AlertCircle, Loader2Icon } from 'lucide-react';
import type { MaterialRequestItem } from '../../types/procurement';

interface Vendor {
  id: number;
  name: string;
}

interface Props {
  projectId: string;
  materialRequestId: number;
  requestNumber: string;
  items: MaterialRequestItem[];
  vendors: Vendor[];
  isPending: boolean;
  onSubmit: (payload: CreateRFQPayload) => void;
  onCancel: () => void;
}

export interface CreateRFQPayload {
  material_request_id: number;
  vendor_id: number;
  items: Array<{
    material_request_item_id: number;
    quantity: number;
    unit: string;
    unit_price: number;
    discount_percent?: number;
    delivery_date?: string;
    terms?: string;
    notes?: string;
  }>;
  valid_until?: string;
  terms?: string;
  notes?: string;
}

/**
 * CreateRFQPage component for creating a Request for Quotation.
 *
 * Features:
 * - Vendor selection
 * - Item-wise pricing configuration with selection checkboxes
 * - Select/deselect all items functionality
 * - Global terms and notes
 * - Calculated totals with real-time updates
 * - Sticky footer with summary and submit actions
 *
 * @component
 * @param props - Component props
 * @param props.projectId - Project ID
 * @param props.materialRequestId - Material request ID
 * @param props.requestNumber - Request number for display
 * @param props.items - Array of material request items
 * @param props.vendors - Array of available vendors
 * @param props.isPending - Whether submission is in progress
 * @param props.onSubmit - Callback when RFQ is submitted
 * @param props.onCancel - Callback when cancelled
 * @returns The rendered create RFQ page
 */
export const CreateRFQPage = ({
  projectId,
  materialRequestId,
  requestNumber,
  items,
  vendors,
  isPending,
  onSubmit,
  onCancel,
}: Props) => {

  const [selectedVendorId, setSelectedVendorId] = useState<number | undefined>();
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(
    new Set(items.map(i => i.id))
  );

  const [validUntil, setValidUntil] = useState('');
  const [globalTerms, setGlobalTerms] = useState('');
  const [globalNotes, setGlobalNotes] = useState('');
  const [itemAssignments, setItemAssignments] = useState<Record<number, {
    unit_price: string;
    discount_percent?: string;
    delivery_date?: string;
    terms?: string;
    notes?: string;
  }>>({});

  const handleItemChange = (itemId: number, field: string, value: string) => {
    setItemAssignments(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }));
  };

  const selectedItems = useMemo(() =>
    items.filter(item => selectedItemIds.has(item.id)),
    [items, selectedItemIds]
  );

  const totalEstimated = useMemo(() => {
    return selectedItems.reduce((sum, item) => {
      const assignment = itemAssignments[item.id];
      const price = Number(assignment?.unit_price || 0);
      const discount = Number(assignment?.discount_percent || 0);
      const qty = Number(item.approved_quantity ?? item.quantity ?? 0);
      const lineTotal = price * (1 - discount / 100) * qty;
      return sum + lineTotal;
    }, 0);
  }, [selectedItems, itemAssignments]);

  const handleSubmit = () => {
    if (!selectedVendorId || selectedItemIds.size === 0) return;

    const payload: CreateRFQPayload = {
      material_request_id: materialRequestId,
      vendor_id: selectedVendorId,
      items: selectedItems.map(item => {
        const assignment = itemAssignments[item.id] || {};
        return {
          material_request_item_id: item.id,
          quantity: Number(item.approved_quantity ?? item.quantity ?? 0),
          unit: item.unit,
          unit_price: Number(assignment.unit_price || 0),
          item_name: item.item_name,
          catalog_item_type: item.catalog_item_type,
          discount_percent: assignment.discount_percent ? Number(assignment.discount_percent) : undefined,
          delivery_date: assignment.delivery_date || undefined,
          terms: assignment.terms || globalTerms || undefined,
          notes: assignment.notes || globalNotes || undefined,
        };
      }),
      valid_until: validUntil || undefined,
      terms: globalTerms || undefined,
      notes: globalNotes || undefined,
    };

    onSubmit(payload);
  };

  const isFormValid = selectedVendorId && selectedItemIds.size > 0 &&
    selectedItems.every(item => {
      const price = itemAssignments[item.id]?.unit_price;
      return price && Number(price) > 0;
    });

  const selectedVendorName = vendors.find(v => v.id === selectedVendorId)?.name;

  const toggleItemSelection = (itemId: number) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItemIds.size === items.length) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(items.map(i => i.id)));
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onCancel} className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold truncate">Create Request for Quotation</h1>
              <p className="text-sm text-muted-foreground truncate">
                Project #{projectId} • <span className="font-medium">{requestNumber}</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium">What is an RFQ?</p>
              <p>A Request for Quotation formalizes the price request to a vendor.
                The items defined here can be compared with other quotes before generating the Purchase Order.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Vendor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor">Select vendor <span className="text-destructive">*</span></Label>
                  <select
                    id="vendor"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedVendorId || ''}
                    onChange={(e) => setSelectedVendorId(e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">Select...</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                  {!selectedVendorId && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Required to continue
                    </p>
                  )}
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="validUntil" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Quote validity
                  </Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="globalTerms">General terms</Label>
                  <Textarea
                    id="globalTerms"
                    placeholder="E.g., Payment within 30 days, delivery on site..."
                    value={globalTerms}
                    onChange={(e) => setGlobalTerms(e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="globalNotes">Internal notes</Label>
                  <Textarea
                    id="globalNotes"
                    placeholder="Comments for the procurement team..."
                    value={globalNotes}
                    onChange={(e) => setGlobalNotes(e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Set prices per item</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px] text-center">
                          <input
                            type="checkbox"
                            checked={selectedItemIds.size === items.length && items.length > 0}
                            onChange={toggleSelectAll}
                            className="h-4 w-4 rounded border-gray-300"
                            title={selectedItemIds.size === items.length ? 'Deselect all' : 'Select all'}
                          />
                        </TableHead>
                        <TableHead className="w-[40%]">Item</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead>Unit Price <span className="text-destructive">*</span></TableHead>
                        <TableHead className="text-center hidden sm:table-cell">Disc. (%)</TableHead>
                        <TableHead className="text-center hidden md:table-cell">Delivery</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => {
                        const assignment = itemAssignments[item.id] || {};
                        const isSelected = selectedItemIds.has(item.id);
                        const qty = Number(item.approved_quantity ?? item.quantity ?? 0);
                        const price = Number(assignment.unit_price || 0);
                        const discount = Number(assignment.discount_percent || 0);
                        const lineTotal = price * (1 - discount / 100) * qty;

                        return (
                          <TableRow
                            key={item.id}
                            className={isSelected ? '' : 'bg-muted/30 opacity-60'}
                          >
                            <TableCell className="text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleItemSelection(item.id)}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="space-y-0.5">
                                <p className={`font-medium truncate ${!isSelected ? 'line-through text-muted-foreground' : ''}`} title={item.item_name}>
                                  {item.item_name}
                                </p>
                                {item.notes && (
                                  <p className="text-xs text-muted-foreground line-clamp-1" title={item.notes}>
                                    {item.notes}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-mono text-sm">
                              {qty} <span className="text-muted-foreground">{item.unit}</span>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={assignment.unit_price || ''}
                                onChange={(e) => handleItemChange(item.id, 'unit_price', e.target.value)}
                                className="h-8 text-right font-mono text-sm"
                                disabled={!isSelected}
                              />
                            </TableCell>
                            <TableCell className="text-center hidden sm:table-cell">
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                placeholder="0"
                                value={assignment.discount_percent || ''}
                                onChange={(e) => handleItemChange(item.id, 'discount_percent', e.target.value)}
                                className="h-8 text-center font-mono text-sm w-14 mx-auto"
                                disabled={!isSelected}
                              />
                            </TableCell>
                            <TableCell className="text-center hidden md:table-cell">
                              <Input
                                type="date"
                                value={assignment.delivery_date || ''}
                                onChange={(e) => handleItemChange(item.id, 'delivery_date', e.target.value)}
                                className="h-8 text-center text-sm"
                                disabled={!isSelected}
                              />
                            </TableCell>
                            <TableCell className={`text-right font-mono font-medium text-sm ${!isSelected ? 'text-muted-foreground' : ''}`}>
                              ${lineTotal.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {selectedItemIds.size === 0 && items.length > 0 && (
        <div className="p-4 border rounded-md bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Select at least one item to create the RFQ
          </p>
        </div>
      )}
      
      <footer className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>
                  {selectedItemIds.size} of {items.length} item(s) selected
                </span>
              </div>
              {selectedVendorName && (
                <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{selectedVendorName}</span>
                </div>
              )}
              <div className="font-semibold text-primary">
                Total: ${totalEstimated.toFixed(2)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onCancel} disabled={isPending} className="min-w-[100px]">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending || !isFormValid}
                className="min-w-[140px] gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4" />
                    Create RFQ
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};