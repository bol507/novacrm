import { Badge } from "@/components/ui/badge";
import { Percent } from "lucide-react";

/**
 * Props for QuoteFormFinancialSummary component
 */
export interface QuoteFormFinancialSummaryProps {
  /** Calculated subtotal amount */
  subtotal: number;
  /** ITBMS tax amount */
  itbms: number;
  /** Grand total with tax */
  totalWithTax: number;
  /** Currency formatter function */
  formatCurrency: (value: number) => string;
}

/**
 * QuoteFormFinancialSummary Component
 * 
 * Displays the financial breakdown of a quote:
 * - Subtotal
 * - ITBMS (7% Panama tax)
 * - Grand total
 * Includes visual indicator that tax is calculated automatically.
 * 
 * @component
 * @param {QuoteFormFinancialSummaryProps} props - Component props
 * @param {number} props.subtotal - Subtotal amount
 * @param {number} props.itbms - ITBMS tax amount
 * @param {number} props.totalWithTax - Grand total
 * @param {function} props.formatCurrency - Currency formatter
 * 
 * @returns {JSX.Element} Financial summary section
 */
export const QuoteFormFinancialSummary = ({
  subtotal,
  itbms,
  totalWithTax,
  formatCurrency,
}: QuoteFormFinancialSummaryProps) => {
  return (
    <>
      {/* Financial Summary Cards */}
      <div className="bg-card p-4 rounded-lg border border-border">
        <h4 className="text-sm font-semibold mb-3">Resumen financiero</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Subtotal</div>
            <div className="font-bold text-lg">{formatCurrency(subtotal)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Percent className="h-3 w-3" />
              ITBMS (7%)
            </div>
            <div className="font-bold text-lg text-blue-600">{formatCurrency(itbms)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Total</div>
            <div className="font-bold text-lg text-primary">{formatCurrency(totalWithTax)}</div>
          </div>
        </div>
      </div>

      {/* Tax Information Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-3">
          <Percent className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 mb-1">ITBMS (7%)</p>
            <p className="text-xs text-blue-800">
              El impuesto ITBMS se aplicará automáticamente al total de la cotización.
            </p>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Automático
          </Badge>
        </div>
      </div>
    </>
  );
};