import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, DollarSign, TrendingUp } from "lucide-react";

/**
 * Props for QuoteStats component
 */
export interface QuoteStatsProps {
  /** Number of quotes in pending status */
  pending: number;
  /** Number of quotes in accepted status */
  accepted: number;
  /** Total monetary value of all quotes */
  totalValue: number;
  /** Total monetary value of accepted quotes only */
  acceptedValue: number;
}

/**
 * QuoteStats Component
 * 
 * Displays key quote statistics in a responsive grid of metric cards.
 * Shows pending quotes, accepted quotes, total value, and accepted value.
 * Each metric is presented with an icon, label, and formatted value.
 * 
 * @component
 * @param {QuoteStatsProps} props - Component props
 * @param {number} props.pending - Number of pending quotes
 * @param {number} props.accepted - Number of accepted quotes
 * @param {number} props.totalValue - Total value of all quotes in USD
 * @param {number} props.acceptedValue - Total value of accepted quotes in USD
 * 
 * @returns {JSX.Element} Grid of four statistic cards
 * 
 * @example
 * // Basic usage with quote statistics
 * <QuoteStats 
 *   pending={15}
 *   accepted={8}
 *   totalValue={125000}
 *   acceptedValue={67500}
 * />
 * 
 * @example
 * // Usage with API data
 * const { data: stats } = useQuoteStatistics();
 * <QuoteStats 
 *   pending={stats?.pending || 0}
 *   accepted={stats?.accepted || 0}
 *   totalValue={stats?.totalValue || 0}
 *   acceptedValue={stats?.acceptedValue || 0}
 * />
 * 
 * @remarks
 * - Displays 1 column on mobile, 2 on tablet, 4 on desktop
 * - Currency values are formatted in USD with Panama locale (es-PA)
 * - No decimal places shown for cleaner dashboard presentation
 * - Each card uses semantic colors: blue (pending), green (accepted), 
 *   blue (total), purple (accepted value)
 * - Icons from lucide-react provide visual context for each metric
 * - Component is purely presentational (no internal state or side effects)
 * 
 * @see {@link https://ui.shadcn.com/docs/components/card} for Card component documentation
 * @see {@link https://lucide.dev} for icon library documentation
 */
export const QuoteStats = ({ 
  pending, 
  accepted, 
  totalValue, 
  acceptedValue 
}: QuoteStatsProps) => {
  /**
   * Formats a numeric value as USD currency
   * 
   * Uses Panama Spanish locale (es-PA) with no decimal places
   * for consistent dashboard presentation.
   * 
   * @param value - Numeric value to format
   * @returns Formatted currency string (e.g., "$125,000")
   * 
   * @example
   * formatCurrency(125000) // returns "$125,000"
   * formatCurrency(0) // returns "$0"
   */
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Pending Quotes Card */}
      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Icon with blue background */}
              <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              {/* Label and value */}
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">{pending}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accepted Quotes Card */}
      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Icon with green background */}
              <div className="bg-green-50 text-green-600 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5" />
              </div>
              {/* Label and value */}
              <div>
                <p className="text-sm text-muted-foreground">Accepted</p>
                <p className="text-xl font-bold">{accepted}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Value Card */}
      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Icon with blue background */}
              <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                <DollarSign className="h-5 w-5" />
              </div>
              {/* Label and value */}
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accepted Value Card */}
      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Icon with purple background */}
              <div className="bg-purple-50 text-purple-600 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5" />
              </div>
              {/* Label and value */}
              <div>
                <p className="text-sm text-muted-foreground">Accepted Value</p>
                <p className="text-xl font-bold">{formatCurrency(acceptedValue)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};