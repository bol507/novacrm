import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useProcurement } from '../../hooks/useProcurement';
import type { MaterialRequestItemInput } from '../../types/procurement';

const UNIT_OPTIONS = [
  { value: 'unidad', label: 'Unit' },
  { value: '1/4 galon', label: '1/4 gallon' },
  { value: '1/2 galon', label: '1/2 gallon' },
  { value: '1 galon', label: '1 gallon' },
  { value: 'caja', label: 'Box' },
  { value: 'bolsa', label: 'Bag' },
  { value: 'metro', label: 'Meter' },
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'litro', label: 'Liter' },
] as const;

const REASON_OPTIONS = [
  { value: 'new_requirement', label: 'New requirement' },
  { value: 'missing', label: 'Missing' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'lost', label: 'Lost' },
  { value: 'replacement', label: 'Replacement' },
  { value: 'other', label: 'Other' },
] as const;

interface Props {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * CreateMaterialRequestForm component for creating a new material request.
 *
 * Features:
 * - Dynamic item list management (add/remove items)
 * - Form fields for item name, type, reason, quantity, unit, priority, and notes
 * - Custom reason input when "Other" is selected
 * - Validation for required fields
 *
 * @component
 * @param props - Component props
 * @param props.projectId - ID of the project to create the request for
 * @param props.onClose - Callback when form is closed
 * @param props.onSuccess - Callback when request is successfully created
 * @returns The rendered create material request form
 */
export const CreateMaterialRequestForm = ({ projectId, onClose, onSuccess }: Props) => {
  const { mutate: createRequest, isPending } = useProcurement.createRequest();
  
  const [items, setItems] = useState<MaterialRequestItemInput[]>([
    { 
      name: '', 
      type: 'material', 
      reason: 'new_requirement', 
      reasonOther: '',
      qty: 1, 
      unit: 'unidad', 
      priority: 'medium',
      notes: undefined
    }
  ]);

  const addItem = () => {
    setItems(prev => [...prev, {
      name: '', type: 'material', reason: 'new_requirement', reasonOther: '',
      qty: 1, unit: 'unidad', priority: 'medium', notes: undefined
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = <K extends keyof MaterialRequestItemInput>(index: number, field: K, value: MaterialRequestItemInput[K]) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleSubmit = () => {
    const invalid = items.some(i => 
      !i.name.trim() || !i.reason || 
      (i.reason === 'other' && !i.reasonOther?.trim()) || 
      !i.qty || i.qty <= 0 || !i.unit
    );
    if (invalid) {
      toast.error('Please complete all required fields');
      return;
    }
    if (isPending) return;

    const payloadItems = items.map(item => {
      const { reasonOther, ...rest } = item;
      return {
        ...rest,
        reason: item.reason,
        ...(item.reason === 'other' && item.reasonOther?.trim() && { reasonOther: item.reasonOther.trim() }),
      };
    });

    createRequest(
      { projectId: Number(projectId), payload: { items: payloadItems } },
      {
        onSuccess: () => {
          toast.success('Request created successfully');
          onSuccess();
        },
        onError: (err: any) => toast.error(err.message || 'Error creating request'),
      }
    );
  };

  return (
    <div className="border rounded-lg bg-card p-4 sm:p-6 space-y-4 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">New Material Request</h3>
          <p className="text-sm text-muted-foreground">Project #{projectId}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4 relative bg-muted/30">
            {items.length > 1 && (
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeItem(index)} type="button">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Item Name *</Label>
                <Input value={item.name} onChange={(e) => updateItem(index, 'name', e.target.value)} placeholder="E.g., Cement" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={item.type} onChange={(e) => updateItem(index, 'type', e.target.value as MaterialRequestItemInput['type'])}>
                  <option value="material">Material</option>
                  <option value="tool">Tool</option>
                  <option value="consumable">Consumable</option>
                  <option value="service">Service</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reason / Justification *</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={item.reason} onChange={(e) => {
                const val = e.target.value as MaterialRequestItemInput['reason'];
                updateItem(index, 'reason', val);
                if (val !== 'other') updateItem(index, 'reasonOther', '');
              }}>
                {REASON_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              {item.reason === 'other' && (
                <div className="mt-2 p-3 bg-background rounded-md border border-dashed">
                  <Label className="text-xs text-muted-foreground">Specify the reason:</Label>
                  <Textarea value={item.reasonOther || ''} onChange={(e) => updateItem(index, 'reasonOther', e.target.value)} placeholder="Briefly describe..." className="min-h-[60px] text-sm mt-1" maxLength={255} />
                  <p className="text-[10px] text-muted-foreground text-right mt-1">{(item.reasonOther?.length || 0)}/255</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input type="number" min={1} value={item.qty} onChange={(e) => updateItem(index, 'qty', parseFloat(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label>Unit *</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={item.unit} onChange={(e) => updateItem(index, 'unit', e.target.value)}>
                  {UNIT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={item.priority} onChange={(e) => updateItem(index, 'priority', e.target.value as any)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea value={item.notes || ''} onChange={(e) => updateItem(index, 'notes', e.target.value)} placeholder="Additional information..." className="min-h-[60px] text-sm resize-none" maxLength={500} />
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addItem} className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Add another item
        </Button>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Request
        </Button>
      </div>
    </div>
  );
};