import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import { PurchaseFormItemRow } from "./PurchaseFormItemRow";
import type { PurchaseFormData } from "../types/purchase";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
 type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export interface PurchaseFormItemsListProps {
  items: PurchaseFormData['items'];
  onUpdate: (index: number, field: string, value: any) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  formatCurrency: (value: number) => string;
  onReorder?: (reorderedItems: PurchaseFormData['items']) => void;
}

export const PurchaseFormItemsList = ({
  items,
  onUpdate,
  onAdd,
  onRemove,
  canRemove,
  formatCurrency,
  onReorder,
}: PurchaseFormItemsListProps) => {

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const itemIds = items.map((_, index) => `item-${index}`);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = itemIds.indexOf(active.id as string);
    const newIndex = itemIds.indexOf(over.id as string);

    const reordered = arrayMove(items, oldIndex, newIndex);

    const itemsWithNewSequence = reordered.map((item, idx) => ({
      ...item,
      sequence_no: idx + 1,
    }));

    onReorder?.(itemsWithNewSequence);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Package className="h-5 w-5" />
          Purchase Items *
        </h3>
        <Button type="button" variant="outline" size="sm" onClick={onAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {items.map((item, index) => (
              <PurchaseFormItemRow
                key={`item-${index}`}
                item={item}
                index={index}
                onUpdate={onUpdate}
                onRemove={onRemove}
                canRemove={canRemove}
                formatCurrency={formatCurrency}
                isDraggable={true}
                sortableId={itemIds[index]}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};