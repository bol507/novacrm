import { Package } from "lucide-react";
import type { QuoteItem } from "../types/quote";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableQuoteCard from "./sortable/SortableQuoteCard";
import SortableQuoteRow from "./sortable/SortableQuoteRow";

export interface QuoteItemsTableProps {
  items: QuoteItem[];
  formatCurrency: (value: number) => string;
  onReorder?: (reorderedItems: QuoteItem[]) => void;
  readOnly?: boolean;
}

/**
 * QuoteItemsTable Component
 * 
 * Displays quote items in a responsive table (desktop) or card list (mobile).
 * Each item shows product name, description, quantity, price, discount, and total.
 * 
 * @component
 * @param {QuoteItemsTableProps} props - Component props
 * @param {QuoteItem[]} props.items - Array of quote items
 * @param {function} props.formatCurrency - Currency formatting function
 * 
 * @returns {JSX.Element} Items table/card list section
 * 
 * @remarks
 * - Desktop: Traditional table layout with 5 columns
 * - Mobile: Vertical card layout with 2-column grid for details
 * - Descriptions use ExpandableText for long content
 * - Discounts displayed in red with percentage format
 * - Handles undefined total values gracefully (shows $0)
 * 
 * @example
 * <QuoteItemsTable 
 *   items={quote.items}
 *   formatCurrency={formatCurrency}
 * />
 */
export const QuoteItemsTable = ({ items, formatCurrency, onReorder, readOnly = false }: QuoteItemsTableProps) => {
   const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(i => i.sequence_no.toString() === active.id);
    const newIndex = items.findIndex(i => i.sequence_no.toString() === over.id);

    const reordered = arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
      ...item,
      sequence_no: idx + 1,
    }));

    onReorder?.(reordered);
  };

  const itemIds = items.map(i => i.sequence_no.toString());

  return (
    <div className="bg-card rounded-lg border border-border p-6 overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            Quote Items
          </h2>
          <span className="text-lg text-muted-foreground">
            {items.length} item{items.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div className="overflow-x-auto">
            {/* Mobile View */}
            <div className="sm:hidden mt-4">
              {items.map(item => (
                <SortableQuoteCard key={item.sequence_no} item={item} formatCurrency={formatCurrency} disabled={readOnly} />
              ))}
            </div>
            {/* Desktop View */}
            <div className="hidden sm:block mt-4">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b">
                    <th className="py-4 text-left font-semibold text-lg w-1/2">Product</th>
                    <th className="py-4 text-left font-semibold text-lg w-1/8">Quantity</th>
                    <th className="py-4 text-left font-semibold text-lg w-1/8">Price</th>
                    <th className="py-4 text-left font-semibold text-lg w-1/8">Discount</th>
                    <th className="py-4 text-left font-semibold text-lg w-1/8">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <SortableQuoteRow key={item.sequence_no} item={item} formatCurrency={formatCurrency} disabled={readOnly} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};