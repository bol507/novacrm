import { Button } from "@/components/ui/button";
import { QuoteStatusBadge } from "../components/QuoteStatusBadge";
import { normalizeQuoteStage } from "../types/quote";

/**
 * Props for QuoteHeader component
 */
export interface QuoteHeaderProps {
  /** Quote subject/title */
  subject: string;
  /** Quote number for display */
  quoteNo: string;
  /** Quote stage for status badge */
  quoteStage: string;
  /** Callback for back navigation */
  onBack: () => void;
}

/**
 * QuoteHeader Component
 * 
 * Displays the quote title, number, status badge, and back button.
 * 
 * @component
 * @param {QuoteHeaderProps} props - Component props
 * @param {string} props.subject - Quote subject/title
 * @param {string} props.quoteNo - Quote number
 * @param {string} props.quoteStage - Quote stage for status
 * @param {function} props.onBack - Back navigation callback
 * 
 * @returns {JSX.Element} Quote header section
 * 
 * @example
 * <QuoteHeader 
 *   subject="Website Development Project"
 *   quoteNo="QT-2026-001"
 *   quoteStage="Pending"
 *   onBack={() => navigate(-1)}
 * />
 */
export const QuoteHeader = ({ subject, quoteNo, quoteStage, onBack }: QuoteHeaderProps) => {
const normalizedStage = normalizeQuoteStage(quoteStage);
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-foreground line-clamp-1">
        {subject}
      </h1>
      <p className="text-muted-foreground text-lg">
        Quote #{quoteNo}
      </p>
      
      <div className="flex flex-col sm:items-end gap-4">
        <div className="flex items-center gap-3">
          <QuoteStatusBadge stage={normalizedStage} />
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            ← Back
          </Button>
        </div>
      </div>
    </div>
  );
};