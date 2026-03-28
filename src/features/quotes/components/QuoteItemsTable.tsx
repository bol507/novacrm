import { Package } from "lucide-react";
import { ExpandableText } from "@/components/ExpandableText";
import type { QuoteItem } from "../types/quote";

/**
 * Props for QuoteItemsTable component
 */
export interface QuoteItemsTableProps {
  /** Array of quote items to display */
  items: QuoteItem[];
  /** Currency formatter function */
  formatCurrency: (value: number) => string;
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
export const QuoteItemsTable = ({ items, formatCurrency }: QuoteItemsTableProps) => {
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

      <div className="overflow-x-auto">
        {/* Mobile: Vertical card layout */}
        <div className="sm:hidden">
          {items.map((item, index) => (
            <div key={item.sequence_no || index} className="border-b last:border-b-0 hover:bg-muted/50 p-4">
              <div className="font-semibold text-lg mb-2">{item.productname}</div>
              {item.description && (
                <div className="mt-2">
                  <ExpandableText
                    text={item.description}
                    maxLines={2}
                    className="text-muted-foreground"
                    expandedClassName="text-muted-foreground whitespace-pre-line"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <div className="text-muted-foreground">Quantity</div>
                  <div className="font-medium">{item.quantity}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Price</div>
                  <div className="font-medium">{formatCurrency(item.listprice)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Discount</div>
                  <div className="font-medium text-destructive">
                    {item.discount_percent > 0 ? `-${item.discount_percent}%` : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total</div>
                  {/* ✅ FIX: Handle undefined total with fallback to 0 */}
                  <div className="font-medium">{formatCurrency(item.total ?? 0)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Table layout */}
        <div className="hidden sm:block">
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
              {items.map((item, index) => (
                <tr key={item.sequence_no || index} className="border-b last:border-b-0 hover:bg-muted/50">
                  <td className="py-5 pr-4">
                    <div className="font-semibold text-lg truncate">{item.productname}</div>
                    {item.description && (
                      <div className="mt-3">
                        <ExpandableText
                          text={item.description}
                          maxLines={2}
                          className="text-muted-foreground"
                          expandedClassName="text-muted-foreground whitespace-pre-line"
                        />
                      </div>
                    )}
                  </td>
                  <td className="py-5 min-w-[60px]">
                    <div className="text-lg font-medium text-right">{item.quantity}</div>
                  </td>
                  <td className="py-5 min-w-[100px]">
                    <div className="text-lg font-medium text-right">{formatCurrency(item.listprice)}</div>
                  </td>
                  <td className="py-5 min-w-[100px]">
                    <div className="text-lg font-medium text-right text-destructive">
                      {item.discount_percent > 0 ? `-${item.discount_percent}%` : '-'}
                    </div>
                  </td>
                  <td className="py-5 min-w-[120px]">
                    {/* ✅ FIX: Handle undefined total with fallback to 0 */}
                    <div className="text-lg font-medium text-right">{formatCurrency(item.total ?? 0)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};