import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import type { QuoteFormData } from "../../types/quote";
import { cn } from "@/shared/lib/utils";
import type { QuoteFormValues } from "../../types/quote"; 

/**
 * Props for QuoteFormItemRow component
 */
export interface QuoteFormItemRowProps {
  /** Item data to display and edit */
  item: QuoteFormData['items'][0];
  /** Item index in the list */
  index: number;
  /** Callback when any field is updated */
  onUpdate: (index: number, field: string, value: any) => void;
  /** Callback to remove this item */
  onRemove: (index: number) => void;
  /** Whether this item can be removed */
  canRemove: boolean;
  /** Currency formatter function */
  formatCurrency: (value: number) => string;
}

/**
 * QuoteFormItemRow component for editing a single quote line item.
 *
 * Features:
 * - Editable fields: product name, quantity, unit price, discount percentage, description
 * - Calculated net total based on quantity, price, and discount
 * - Validation for required fields (product name, quantity > 0, price > 0)
 * - Error indicators with validation messages
 * - Remove button with visual feedback
 * - Responsive grid layout for fields
 *
 * @component
 * @param props - Component props
 * @param props.item - Item data to display and edit
 * @param props.index - Item index in the list
 * @param props.onUpdate - Callback when any field is updated
 * @param props.onRemove - Callback to remove this item
 * @param props.canRemove - Whether this item can be removed
 * @param props.formatCurrency - Currency formatter function
 * @returns The rendered quote form item row
 *
 * @example
 * // Basic usage
 * <QuoteFormItemRow
 *   item={item}
 *   index={0}
 *   onUpdate={handleItemUpdate}
 *   onRemove={handleItemRemove}
 *   canRemove={items.length > 1}
 *   formatCurrency={formatCurrency}
 * />
 */
export const QuoteFormItemRow = ({
  item,
  index,
  onUpdate,
  onRemove,
  canRemove,
  formatCurrency,
}: QuoteFormItemRowProps) => {

  const form = useFormContext<QuoteFormValues>();
  
  const netTotal = item.quantity * item.listprice * (1 - (item.discount_percent || 0) / 100);

  const hasNameError = !item.productname?.trim() && form?.formState.isSubmitted;
  const hasQuantityError = item.quantity <= 0 && form?.formState.isSubmitted;
  const hasPriceError = item.listprice <= 0 && form?.formState.isSubmitted;
  const hasRootError = !!form?.formState.errors.root;

  return (
    <div className="border rounded-lg p-4 bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Product Name */}
        <div className="lg:col-span-2">
          <label className="text-sm font-medium mb-2 block">
            Item Name *
          </label>
          <Textarea
            placeholder="E.g., SUPPLY AND INSTALLATION OF WPC DOORS..."
            className={cn(
              "min-h-[60px]",
              hasNameError && "border-destructive focus-visible:ring-destructive"
            )}
            value={item.productname}
            onChange={(e) => {
              onUpdate(index, 'productname', e.target.value);
              if (hasRootError && form) {
                form.clearErrors('root');
              }
            }}
          />
          {hasNameError && (
            <p className="text-xs text-destructive mt-1">This field is required</p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="text-sm font-medium mb-2 block">Quantity *</label>
          <Input
            type="number"
            min="0.001"
            step="0.001"
            value={item.quantity}
            className={cn(
              hasQuantityError && "border-destructive focus-visible:ring-destructive"
            )}
            onChange={(e) => {
              let value = e.target.value;
              if (value.length > 1 && value.startsWith('0') && !value.startsWith('0.')) {
                value = value.replace(/^0+/, '');
              }
              const parsedValue = parseFloat(value) || 0;
              onUpdate(index, 'quantity', parsedValue);
              if (hasQuantityError && form) {
                form.clearErrors('root');
              }
            }}
          />
          {hasQuantityError && (
            <p className="text-xs text-destructive mt-1">Quantity must be greater than 0</p>
          )}
        </div>

        {/* Unit Price */}
        <div>
          <label className="text-sm font-medium mb-2 block">Unit Price ($) *</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={item.listprice}
            className={cn(
              hasPriceError && "border-destructive focus-visible:ring-destructive"
            )}
            onChange={(e) => {
              let value = e.target.value;
              if (value.length > 1 && value.startsWith('0') && !value.startsWith('0.')) {
                value = value.replace(/^0+/, '');
              }
              const parsedValue = parseFloat(value) || 0;
              onUpdate(index, 'listprice', parsedValue);
              if (hasPriceError && form) {
                form.clearErrors('root');
              }
            }}
          />
          {hasPriceError && (
            <p className="text-xs text-destructive mt-1">Price must be greater than 0</p>
          )}
        </div>

        {/* Discount */}
        <div>
          <label className="text-sm font-medium mb-2 block">Discount (%)</label>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={item.discount_percent}
            onChange={(e) => onUpdate(index, 'discount_percent', parseFloat(e.target.value) || 0)}
          />
        </div>

        {/* Calculated Net Total (read-only) */}
        <div>
          <label className="text-sm font-medium mb-2 block">Net Total</label>
          <div className="font-mono font-medium p-2 bg-muted rounded">
            {formatCurrency(netTotal)}
          </div>
        </div>
      </div>

      {/* Additional Description */}
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">Additional Description</label>
        <Textarea
          placeholder="Additional notes for this item..."
          value={item.description || ''}
          onChange={(e) => onUpdate(index, 'description', e.target.value)}
        />
      </div>

      {/* Remove Button */}
      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          className="text-destructive gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Remove item
        </Button>
      )}
    </div>
  );
};