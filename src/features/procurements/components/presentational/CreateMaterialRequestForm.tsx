// src/features/procurement/components/presentational/CreateMaterialRequestForm.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, X, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useProcurement } from '../../hooks/use-procurement';
import type { MaterialRequestItemInput } from '../../types/procurement';
import { Card, CardContent } from '@/components/ui/card';

// ✅ Tipar opciones para aceptar readonly
type OptionType = { value: string; label: string };

const UNIT_OPTIONS: readonly OptionType[] = [
  { value: 'unidad', label: 'Unit' },
  { value: '1/4 galon', label: '1/4 gallon' },
  { value: '1/2 galon', label: '1/2 gallon' },
  { value: '1 galon', label: '1 gallon' },
  { value: 'caja', label: 'Box' },
  { value: 'bolsa', label: 'Bag' },
  { value: 'metro', label: 'Meter' },
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'litro', label: 'Liter' },
  { value: 'juego', label: 'Set' },
] as const;

const REASON_OPTIONS: readonly OptionType[] = [
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

  // ✅ Estado para expansión de cards en móvil
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0])); // Primer item expandido por defecto

  const toggleExpand = (index: number) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const addItem = () => {
    const newIndex = items.length;
    setItems(prev => [...prev, {
      name: '', type: 'material', reason: 'new_requirement', reasonOther: '',
      qty: 1, unit: 'unidad', priority: 'medium', notes: undefined
    }]);
    setExpandedItems(prev => new Set(prev).add(newIndex)); // Auto-expand nuevo item
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
      setExpandedItems(prev => {
        const next = new Set(prev);
        // Re-indexar expanded items después de borrar
        return new Set(
          Array.from(next)
            .filter(i => i < index)
            .concat(Array.from(next).filter(i => i > index).map(i => i - 1))
        );
      });
    }
  };

  const updateItem = <K extends keyof MaterialRequestItemInput>(index: number, field: K, value: MaterialRequestItemInput[K]) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  // ✅ Helper para renderizar campos (evita duplicación)
  const renderField = (
    item: MaterialRequestItemInput,
    index: number,
    field: keyof MaterialRequestItemInput,
    label: string,
    options?: readonly OptionType[],
    placeholder?: string
  ) => {
    const value = item[field] as string | number | undefined;
    
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {options ? (
          <select
            value={value || ''}
            onChange={(e) => updateItem(index, field, e.target.value as any)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : field === 'notes' ? (
          <Textarea
            value={value || ''}
            onChange={(e) => updateItem(index, field, e.target.value)}
            placeholder={placeholder}
            className="min-h-[60px] text-sm"
          />
        ) : field === 'qty' ? (
          <Input
            type="number"
            min={1}
            value={value || ''}
            onChange={(e) => updateItem(index, field, parseFloat(e.target.value) || 0)}
            className="h-9 text-sm"
          />
        ) : (
          <Input
            value={value || ''}
            onChange={(e) => updateItem(index, field, e.target.value)}
            placeholder={placeholder}
            className="h-9 text-sm"
          />
        )}
      </div>
    );
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
    <div className="border rounded-lg bg-card p-3 sm:p-6 space-y-4 animate-in fade-in slide-in-from-top-2">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div>
          <h3 className="text-base sm:text-lg font-semibold">New Material Request</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Project #{projectId}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Info Banner */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md flex gap-2">
        <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800 dark:text-blue-200">
          <p className="font-medium">Tips</p>
          <p>Fill all required fields (*) for each item. Use "Other" reason to add custom justification.</p>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {items.map((item, index) => {
          const isExpanded = expandedItems.has(index);
          
          return (
            <Card key={index} className="overflow-hidden">
              {/* Card Header: Resumen + Toggle (visible en móvil) */}
              <button
                type="button"
                onClick={() => toggleExpand(index)}
                className="md:hidden w-full p-3 flex items-center justify-between text-left hover:bg-muted/50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">📦</span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{item.name || 'Unnamed item'}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.qty} {item.unit} • {item.priority}
                    </p>
                  </div>
                </div>
                <span className="text-muted-foreground">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </button>

              {/* Card Content */}
              <CardContent className={`p-3 space-y-3 ${isExpanded ? 'block' : 'hidden md:block'}`}>
                {/* Botón eliminar (visible siempre en desktop, solo en móvil si está expandido) */}
                {items.length > 1 && (
                  <div className={`${isExpanded ? 'block' : 'hidden md:block'} absolute top-2 right-2 md:static md:flex md:justify-end`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="h-7 w-7 md:h-8 md:w-8"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}

                {/* ✅ VISTA MÓVIL: Campos apilados */}
                <div className="md:hidden space-y-3">
                  {renderField(item, index, 'name', 'Item Name *', undefined, 'E.g., Cement')}
                  {renderField(item, index, 'type', 'Type', [
                    { value: 'material', label: 'Material' },
                    { value: 'tool', label: 'Tool' },
                    { value: 'consumable', label: 'Consumable' },
                    { value: 'service', label: 'Service' },
                  ])}
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Reason *</Label>
                    <select
                      value={item.reason}
                      onChange={(e) => {
                        const val = e.target.value as MaterialRequestItemInput['reason'];
                        updateItem(index, 'reason', val);
                        if (val !== 'other') updateItem(index, 'reasonOther', '');
                      }}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                    >
                      {REASON_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {item.reason === 'other' && (
                      <div className="p-2 bg-background rounded-md border border-dashed">
                        <Label className="text-[10px] text-muted-foreground">Specify reason:</Label>
                        <Textarea
                          value={item.reasonOther || ''}
                          onChange={(e) => updateItem(index, 'reasonOther', e.target.value)}
                          placeholder="Briefly describe..."
                          className="min-h-[50px] text-xs mt-1"
                          maxLength={255}
                        />
                        <p className="text-[9px] text-muted-foreground text-right mt-0.5">
                          {(item.reasonOther?.length || 0)}/255
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {renderField(item, index, 'qty', 'Qty *')}
                    {renderField(item, index, 'unit', 'Unit *', UNIT_OPTIONS)}
                  </div>
                  {renderField(item, index, 'priority', 'Priority', [
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'urgent', label: 'Urgent' },
                  ])}
                  {renderField(item, index, 'notes', 'Notes (optional)', undefined, 'Additional information...')}
                </div>

                {/* ✅ VISTA DESKTOP: Grid compacto */}
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Item Name *</Label>
                    <Input 
                      value={item.name} 
                      onChange={(e) => updateItem(index, 'name', e.target.value)} 
                      placeholder="E.g., Cement" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                      value={item.type} 
                      onChange={(e) => updateItem(index, 'type', e.target.value as MaterialRequestItemInput['type'])}
                    >
                      <option value="material">Material</option>
                      <option value="tool">Tool</option>
                      <option value="consumable">Consumable</option>
                      <option value="service">Service</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Reason / Justification *</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                      value={item.reason} 
                      onChange={(e) => {
                        const val = e.target.value as MaterialRequestItemInput['reason'];
                        updateItem(index, 'reason', val);
                        if (val !== 'other') updateItem(index, 'reasonOther', '');
                      }}
                    >
                      {REASON_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {item.reason === 'other' && (
                      <Input
                        value={item.reasonOther || ''}
                        onChange={(e) => updateItem(index, 'reasonOther', e.target.value)}
                        placeholder="Specify reason..."
                        className="h-9 mt-1 text-sm"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input 
                      type="number" 
                      min={1} 
                      value={item.qty} 
                      onChange={(e) => updateItem(index, 'qty', parseFloat(e.target.value) || 0)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit *</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                      value={item.unit} 
                      onChange={(e) => updateItem(index, 'unit', e.target.value)}
                    >
                      {UNIT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                      value={item.priority} 
                      onChange={(e) => updateItem(index, 'priority', e.target.value as any)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3 space-y-2">
                    <Label>Notes (optional)</Label>
                    <Textarea 
                      value={item.notes || ''} 
                      onChange={(e) => updateItem(index, 'notes', e.target.value)} 
                      placeholder="Additional information..." 
                      className="min-h-[60px] text-sm resize-none" 
                      maxLength={500} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Add Item Button */}
        <Button
          type="button"
          variant="outline"
          onClick={addItem}
          disabled={isPending}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" /> Add another item
        </Button>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose} disabled={isPending} size="sm">
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isPending} size="sm">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Request'
          )}
        </Button>
      </div>
    </div>
  );
};