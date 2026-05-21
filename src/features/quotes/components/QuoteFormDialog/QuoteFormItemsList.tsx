import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import { QuoteFormItemRow } from "./QuoteFormItemRow";
import type { QuoteFormData } from "../../types/quote";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";

/**
 * Props for QuoteFormItemsList component
 */
export interface QuoteFormItemsListProps {
  items: QuoteFormData['items'];
  onUpdate: (index: number, field: string, value: any) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  formatCurrency: (value: number) => string;
  onReorder?: (reorderedItems: QuoteFormData['items']) => void;
  fieldIds?: string[];
}

/**
 * QuoteFormItemsList Component
 * 
 * Displays the list of quote items with add/remove functionality.
 * Each item is rendered using QuoteFormItemRow component.
 * 
 * @component
 * @param {QuoteFormItemsListProps} props - Component props
 * @param {QuoteFormData['items']} props.items - Array of quote items
 * @param {function} props.onUpdate - Item field update callback
 * @param {function} props.onAdd - Add new item callback
 * @param {function} props.onRemove - Remove item callback
 * @param {boolean} props.canRemove - Whether items can be removed
 * @param {function} props.formatCurrency - Currency formatter
 * 
 * @returns {JSX.Element} Items list section with add button
 */
export const QuoteFormItemsList = ({
  items,
  onUpdate,
  onAdd,
  onRemove,
  canRemove,
  formatCurrency,
  onReorder,
  fieldIds=[],
}: QuoteFormItemsListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

   const itemIds = fieldIds.length > 0 ? fieldIds : items.map((_, i) => `item-${i}`);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    

    if (!over || active.id === over.id) return;


    const oldIndex = itemIds.indexOf(active.id as string);
    const newIndex = itemIds.indexOf(over.id as string);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex);

    const itemsWithNewSequence = reordered.map((item, idx) => ({
      ...item,
      sequence_no: idx + 1,
    }));


    onReorder?.(itemsWithNewSequence);
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Package className="h-5 w-5" />
          Quote Items *
        </h3>
        <Button type="button" variant="outline" size="sm" onClick={onAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/*  Items List wrapped with DnD Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={itemIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {items.map((item, index) => (
              <QuoteFormItemRow
                key={fieldIds[index] ?? item.sequence_no} 
                item={item}
                index={index}
                onUpdate={onUpdate}
                onRemove={onRemove}
                canRemove={canRemove}
                formatCurrency={formatCurrency}
                isDraggable={true}
                sortableId={fieldIds[index] ?? `item-${index}`} 
              />
            ))}
          </div>
        </SortableContext>
        
      </DndContext>
      <Button type="button" variant="outline" size="sm" onClick={onAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
    </div>
  );
};