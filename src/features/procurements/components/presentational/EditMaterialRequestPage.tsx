// src/features/procurement/components/presentational/EditMaterialRequestPage.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, X, ArrowLeft, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useProcurement } from '../../hooks/use-procurement';
import type {
    MaterialRequestItem,
    MaterialRequestItemInput,
    UpdateMaterialRequestPayload
} from '../../types/procurement';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';

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
    { value: 'juego', label: 'Set' },
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
    requestId: number;
    requestNumber?: string;
    initialItems: MaterialRequestItem[];
    onSave: () => void;
    onCancel: () => void;
}

type OptionType = { value: string; label: string };

export const EditMaterialRequestPage = ({
    projectId,
    requestId,
    requestNumber,
    initialItems,
    onSave,
    onCancel,
}: Props) => {
    const { mutate: updateRequest, isPending } = useProcurement.updateRequest();

    // Estado para items editables
    const [items, setItems] = useState<Array<MaterialRequestItemInput & { id?: number; isLocked?: boolean }>>(
        initialItems.map(i => ({
            id: i.id,
            name: i.item_name,
            type: i.catalog_item_type as any,
            reason: i.catalog_reason_type as any,
            reasonOther: i.reason_other || '',
            qty: Number(i.quantity),
            unit: i.unit,
            priority: i.priority as any,
            notes: i.notes || undefined,
            isLocked: !['pending'].includes(i.item_status),
        }))
    );

    // ✅ Estado para controlar expansión de cards en móvil
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

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
            qty: 1, unit: 'unidad', priority: 'medium', notes: undefined, isLocked: false
        }]);
        setExpandedItems(prev => new Set(prev).add(newIndex)); // Auto-expand nuevo item
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(prev => prev.filter((_, i) => i !== index));
            setExpandedItems(prev => {
                const next = new Set(prev);
                // Re-indexar expanded items después de borrar
                return new Set(Array.from(next).filter(i => i < index).concat(
                    Array.from(next).filter(i => i > index).map(i => i - 1)
                ));
            });
        }
    };

    const updateItem = <K extends keyof MaterialRequestItemInput>(index: number, field: K, value: MaterialRequestItemInput[K]) => {
        setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    const handleSubmit = () => {
        // Validar solo ítems editables
        const invalid = items.some(i =>
            !i.isLocked && (
                !i.name.trim() || !i.reason ||
                (i.reason === 'other' && !i.reasonOther?.trim()) ||
                !i.qty || i.qty <= 0 || !i.unit
            )
        );
        if (invalid) {
            toast.error('Please complete all required fields');
            return;
        }
        if (isPending) return;

        // ✅ 1. Ítems editables para actualizar/crear
        const editableItems = items.filter(i => !i.isLocked);

        // ✅ 2. CORREGIDO: Calcular ítems a eliminar
        // - Eran pending en la MR original (initialItems)
        // - YA NO están en la lista actual de editables
        const originalPendingIds = new Set(
            initialItems
                ?.filter(i => i.item_status === 'pending')
                .map(i => i.id)
                .filter((id): id is number => id !== undefined) // Type guard
        );

        const currentEditableIds = new Set(
            editableItems
                .filter(i => i.id) // Solo ítems existentes (no nuevos)
                .map(i => i.id!)
        );

        // Los que estaban originalmente pero ya no están = a eliminar
        const itemsToDelete = Array.from(originalPendingIds).filter(
            id => !currentEditableIds.has(id)
        );

        // ✅ 3. Construir payload de ítems a actualizar/crear
        const payloadItems = editableItems.map(item => {
            const { reasonOther, id, isLocked, ...rest } = item;

            return {
                ...(id && { id }), // Incluir ID solo para updates
                ...rest,
                reason: item.reason,
                priority: item.priority || 'medium',
                qty: Number(item.qty) || 1,
                ...(item.reason === 'other' && item.reasonOther?.trim() && {
                    reason_other: item.reasonOther.trim()
                }),
            };
        });

        // ✅ 4. Payload final
        const payload: UpdateMaterialRequestPayload = {
            items: payloadItems,
            items_to_delete: itemsToDelete.length > 0 ? itemsToDelete : undefined,
        };

        updateRequest(
            { projectId: Number(projectId), requestId, payload },
            {
                onSuccess: () => {
                    toast.success('Material Request updated successfully');
                    onSave();
                },
                onError: (err: any) => toast.error(err?.message || 'Error updating request'),
            }
        );
    };

    const editableCount = items.filter(i => !i.isLocked).length;
    const lockedCount = items.filter(i => i.isLocked).length;

    // ✅ Componente reutilizable para inputs (evita duplicación)
    const renderField = (
        item: any,
        index: number,
        field: keyof MaterialRequestItemInput,
        label: string,
        options?: readonly OptionType[],
        isLocked?: boolean
    ) => (
        <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
            {options ? (
                <select
                    value={item[field] || ''}
                    onChange={(e) => !isLocked && updateItem(index, field, e.target.value as any)}
                    disabled={isLocked || isPending}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm disabled:opacity-50"
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            ) : field === 'notes' ? (
                <Textarea
                    value={item[field] || ''}
                    onChange={(e) => !isLocked && updateItem(index, field, e.target.value)}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    disabled={isLocked || isPending}
                    className="min-h-[60px] text-sm disabled:opacity-50"
                />
            ) : field === 'qty' ? (
                <Input
                    type="number"
                    min={1}
                    value={item[field]}
                    onChange={(e) => !isLocked && updateItem(index, field, parseFloat(e.target.value) || 0)}
                    disabled={isLocked || isPending}
                    className="h-9 text-sm"
                />
            ) : (
                <Input
                    value={item[field] || ''}
                    onChange={(e) => !isLocked && updateItem(index, field, e.target.value)}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    disabled={isLocked || isPending}
                    className="h-9 text-sm"
                />
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
                <div className="max-w-6xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-base font-semibold truncate">Edit Request</h1>
                            <p className="text-xs text-muted-foreground truncate">
                                #{requestNumber || requestId} • Project {projectId}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-4 space-y-4">
                {/* Info Banner */}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md flex gap-2">
                    <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-800 dark:text-blue-200">
                        <p className="font-medium">Editing Rules</p>
                        <p>
                            Only <strong>"Pending"</strong> items can be edited.
                            {lockedCount > 0 && ` ${lockedCount} locked.`}
                        </p>
                    </div>
                </div>

                {/* ✅ VISTA MÓVIL: Cards apiladas (visible en < md) */}
                <div className="md:hidden space-y-3">
                    {items.map((item, index) => {
                        const isLocked = item.isLocked;
                        const isExpanded = expandedItems.has(index);

                        return (
                            <Card key={item.id || index} className={`overflow-hidden ${isLocked ? 'bg-muted/20' : ''}`}>
                                {/* Header de la card: resumen + toggle */}
                                <button
                                    type="button"
                                    onClick={() => !isLocked && toggleExpand(index)}
                                    disabled={isLocked}
                                    className={`w-full p-3 flex items-center justify-between text-left ${isLocked ? 'cursor-default' : 'cursor-pointer hover:bg-muted/50'}`}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-lg">{isLocked ? '🔒' : '✏️'}</span>
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm truncate">{item.name || 'Unnamed item'}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.qty} {item.unit} • {item.priority}
                                            </p>
                                        </div>
                                    </div>
                                    {!isLocked && (
                                        <span className="text-muted-foreground">
                                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </span>
                                    )}
                                </button>

                                {/* Contenido expandible */}
                                {isExpanded && !isLocked && (
                                    <CardContent className="p-3 pt-0 space-y-3 border-t">
                                        {renderField(item, index, 'name', 'Item Name')}
                                        {renderField(item, index, 'type', 'Type', [
                                            { value: 'material', label: 'Material' },
                                            { value: 'tool', label: 'Tool' },
                                            { value: 'consumable', label: 'Consumable' },
                                            { value: 'service', label: 'Service' },
                                        ])}
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-muted-foreground">Reason</Label>
                                            <select
                                                value={item.reason}
                                                onChange={(e) => {
                                                    const val = e.target.value as any;
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
                                                <Input
                                                    value={item.reasonOther || ''}
                                                    onChange={(e) => updateItem(index, 'reasonOther', e.target.value)}
                                                    placeholder="Specify reason..."
                                                    className="h-9 text-xs mt-1"
                                                />
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {renderField(item, index, 'qty', 'Qty')}
                                            {renderField(item, index, 'unit', 'Unit', UNIT_OPTIONS)}
                                        </div>
                                        {renderField(item, index, 'priority', 'Priority', [
                                            { value: 'low', label: 'Low' },
                                            { value: 'medium', label: 'Medium' },
                                            { value: 'high', label: 'High' },
                                            { value: 'urgent', label: 'Urgent' },
                                        ])}
                                        {renderField(item, index, 'notes', 'Notes')}

                                        {/* Botón eliminar en móvil */}
                                        {items.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => removeItem(index)}
                                                disabled={isPending}
                                                className="w-full mt-2"
                                            >
                                                <Trash2 className="h-3 w-3 mr-1" /> Remove item
                                            </Button>
                                        )}
                                    </CardContent>
                                )}

                                {/* Footer para items bloqueados */}
                                {isLocked && (
                                    <div className="px-3 pb-3">
                                        <p className="text-xs text-muted-foreground">
                                            This item is locked and cannot be edited.
                                        </p>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>

                {/* ✅ VISTA DESKTOP: Tabla tradicional (visible en md+) */}
                <div className="hidden md:block rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">Status</TableHead>
                                <TableHead>Item Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead className="text-center">Qty</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead className="w-10"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item, index) => {
                                const isLocked = item.isLocked;
                                return (
                                    <TableRow key={item.id || index} className={isLocked ? 'bg-muted/30' : ''}>
                                        <TableCell>
                                            {isLocked ? (
                                                <span className="text-xs text-muted-foreground">🔒</span>
                                            ) : (
                                                <span className="text-xs text-green-600">✏️</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                value={item.name}
                                                onChange={(e) => !isLocked && updateItem(index, 'name', e.target.value)}
                                                placeholder="Item name"
                                                disabled={isLocked || isPending}
                                                className="h-8"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <select
                                                value={item.type}
                                                onChange={(e) => !isLocked && updateItem(index, 'type', e.target.value as any)}
                                                disabled={isLocked || isPending}
                                                className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                                            >
                                                <option value="material">Material</option>
                                                <option value="tool">Tool</option>
                                                <option value="consumable">Consumable</option>
                                                <option value="service">Service</option>
                                            </select>
                                        </TableCell>
                                        <TableCell>
                                            <select
                                                value={item.reason}
                                                onChange={(e) => {
                                                    if (isLocked) return;
                                                    const val = e.target.value as any;
                                                    updateItem(index, 'reason', val);
                                                    if (val !== 'other') updateItem(index, 'reasonOther', '');
                                                }}
                                                disabled={isLocked || isPending}
                                                className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                                            >
                                                {REASON_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                            {item.reason === 'other' && !isLocked && (
                                                <Input
                                                    value={item.reasonOther || ''}
                                                    onChange={(e) => updateItem(index, 'reasonOther', e.target.value)}
                                                    placeholder="Specify..."
                                                    className="h-7 mt-1 text-xs"
                                                    disabled={isPending}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={item.qty}
                                                onChange={(e) => !isLocked && updateItem(index, 'qty', parseFloat(e.target.value) || 0)}
                                                disabled={isLocked || isPending}
                                                className="h-8 text-center"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <select
                                                value={item.unit}
                                                onChange={(e) => !isLocked && updateItem(index, 'unit', e.target.value)}
                                                disabled={isLocked || isPending}
                                                className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                                            >
                                                {UNIT_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </TableCell>
                                        <TableCell>
                                            <select
                                                value={item.priority || 'medium'}
                                                onChange={(e) => !isLocked && updateItem(index, 'priority', e.target.value as any)}
                                                disabled={isLocked || isPending}
                                                className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                                <option value="urgent">Urgent</option>
                                            </select>
                                        </TableCell>
                                        <TableCell>
                                            {!isLocked && items.length > 1 && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeItem(index)}
                                                    disabled={isPending}
                                                    className="h-7 w-7"
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                {/* Add Item Button */}
                {editableCount > 0 && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={addItem}
                        disabled={isPending}
                        className="w-full md:w-auto"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add another item
                    </Button>
                )}
            </main>

            {/* Sticky Footer */}
            <footer className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t">
                <div className="max-w-6xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                            <span className="text-green-600">{editableCount} editable</span>
                            {lockedCount > 0 && <span className="ml-1">• {lockedCount} locked</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleSubmit} disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <X className="mr-1 h-3 w-3" />
                                        Save
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