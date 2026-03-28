/**
 * Props for QuoteFinancialSummary component
 */
export interface QuoteFinancialSummaryProps {
  /** Subtotal amount */
  subtotal: number;
  /** Total discount amount */
  totalDiscount: number;
  /** ITBMS tax amount (7%) */
  itbms: number;
  /** Grand total amount */
  total: number;
  /** Currency formatter function */
  formatCurrency: (value: number) => string;
}

/**
 * QuoteFinancialSummary Component
 * 
 * Displays four financial metric cards: Subtotal, Discount, ITBMS, and Total.
 * Uses responsive grid layout (1 column mobile, 4 columns desktop).
 * 
 * @component
 * @param {QuoteFinancialSummaryProps} props - Component props
 * @param {number} props.subtotal - Quote subtotal
 * @param {number} props.totalDiscount - Total discount amount
 * @param {number} props.itbms - ITBMS tax amount
 * @param {number} props.total - Grand total
 * @param {function} props.formatCurrency - Currency formatting function
 * 
 * @returns {JSX.Element} Financial summary section
 * 
 * @example
 * <QuoteFinancialSummary 
 *   subtotal={1000}
 *   totalDiscount={50}
 *   itbms={70}
 *   total={1020}
 *   formatCurrency={formatCurrency}
 * />
 */
export const QuoteFinancialSummary = ({
  subtotal,
  totalDiscount,
  itbms,
  total,
  formatCurrency,
}: QuoteFinancialSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Subtotal</div>
        <div className="text-2xl font-bold">{formatCurrency(subtotal)}</div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Discount</div>
        <div className="text-2xl font-bold text-destructive">
          {totalDiscount > 0 ? `-${formatCurrency(totalDiscount)}` : '-'}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">ITBMS</div>
        <div className="text-2xl font-bold text-blue-600">
          {formatCurrency(itbms)}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Total</div>
        <div className="text-4xl font-bold text-primary">
          {formatCurrency(total)}
        </div>
      </div>
    </div>
  );
};