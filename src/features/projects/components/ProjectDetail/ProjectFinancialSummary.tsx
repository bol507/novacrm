/**
 * Props for ProjectFinancialSummary component
 */
export interface ProjectFinancialSummaryProps {
  /** Target budget amount */
  targetBudget: number;
  /** ITBMS tax amount */
  itbms: number;
  /** Total budget including tax */
  totalWithTax: number;
  /** Project progress percentage */
  progress: string | number;
  /** Currency formatter function */
  formatCurrency: (value: number) => string;
}

/**
 * ProjectFinancialSummary Component
 * 
 * Displays four financial metric cards: Budget, ITBMS, Total with tax, and Progress.
 * Uses responsive grid layout (1 column mobile, 4 columns desktop).
 * 
 * @component
 * @param {ProjectFinancialSummaryProps} props - Component props
 * @param {number} props.targetBudget - Target budget amount
 * @param {number} props.itbms - ITBMS tax amount
 * @param {number} props.totalWithTax - Grand total with tax
 * @param {string | number} props.progress - Progress percentage
 * @param {function} props.formatCurrency - Currency formatting function
 * 
 * @returns {JSX.Element} Financial summary section
 */
export const ProjectFinancialSummary = ({
  targetBudget,
  itbms,
  totalWithTax,
  progress,
  formatCurrency,
}: ProjectFinancialSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Budget</div>
        <div className="text-2xl font-bold">{formatCurrency(targetBudget)}</div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">ITBMS</div>
        <div className="text-2xl font-bold text-blue-600">
          {formatCurrency(itbms)}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Total with tax</div>
        <div className="text-2xl font-bold text-primary">
          {formatCurrency(totalWithTax)}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Progress</div>
        <div className="text-2xl font-bold text-green-600">
          {progress || '0'}%
        </div>
      </div>
    </div>
  );
};