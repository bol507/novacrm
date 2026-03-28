import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import { QuoteFormItemRow } from "./QuoteFormItemRow";
import type { QuoteFormData } from "../../types/quote";

/**
 * Props for QuoteFormItemsList component
 */
export interface QuoteFormItemsListProps {
  /** Array of quote items to display */
  items: QuoteFormData['items'];
  /** Callback when an item field is updated */
  onUpdate: (index: number, field: string, value: any) => void;
  /** Callback to add a new item */
  onAdd: () => void;
  /** Callback to remove an item by index */
  onRemove: (index: number) => void;
  /** Whether items can be removed (more than 1) */
  canRemove: boolean;
  /** Currency formatter function */
  formatCurrency: (value: number) => string;
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
}: QuoteFormItemsListProps) => {
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

      {/* Items List */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <QuoteFormItemRow
            key={item.sequence_no || index}
            item={item}
            index={index}
            onUpdate={onUpdate}
            onRemove={onRemove}
            canRemove={canRemove}
            formatCurrency={formatCurrency}
          />
        ))}
      </div>
    </div>
  );
};