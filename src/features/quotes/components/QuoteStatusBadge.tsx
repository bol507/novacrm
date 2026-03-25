import { Badge } from "@/components/ui/badge";
import type { QuoteStage } from "../types/quote";

/**
 * Props for QuoteStatusBadge component
 */
export interface QuoteStatusBadgeProps {
  /**
   * Quote stage to display
   * Accepts QuoteStage type or string from backend (will be normalized)
   */
  stage: QuoteStage | string | null | undefined;
}

/**
 * Valid quote stages for normalization
 */
const VALID_STAGES: QuoteStage[] = [
  'Draft',
  'Sent',
  'Accepted',
  'Rejected',
];

/**
 * QuoteStatusBadge Component
 * 
 * Displays a colored badge representing the quote's current stage.
 * Automatically normalizes invalid or null stages to 'Draft' with fallback styling.
 * 
 * @component
 * @param {QuoteStatusBadgeProps} props - Component props
 * @param {QuoteStage | string | null | undefined} props.stage - Quote stage to display
 * 
 * @returns {JSX.Element} Styled badge with stage label
 * 
 * @example
 * // With valid stage
 * <QuoteStatusBadge stage="Accepted" />
 * 
 * @example
 * // With backend data (may be invalid)
 * <QuoteStatusBadge stage={quote.quote_stage} />
 * 
 * @remarks
 * - Valid stages: Draft, Sent, Accepted, Rejected
 * - Invalid or null stages default to 'Draft'
 * - Labels are displayed in Spanish for user-facing UI
 * - Color coding follows semantic conventions (green=success, red=error, etc.)
 */
export const QuoteStatusBadge = ({ stage }: QuoteStatusBadgeProps) => {
  /**
   * Normalize stage to valid QuoteStage or fallback to 'Draft'
   * 
   * @returns Valid QuoteStage value
   */
  const normalizeStage = (): QuoteStage => {
    if (!stage || !VALID_STAGES.includes(stage as QuoteStage)) {
      return 'Draft';
    }
    return stage as QuoteStage;
  };

  const normalizedStage = normalizeStage();

  /**
   * Get badge CSS classes based on stage
   * 
   * @returns Tailwind CSS class string for badge styling
   */
  const getBadgeVariant = () => {
    switch (normalizedStage) {
      case 'Draft':
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      case 'Sent':
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case 'Accepted':
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case 'Rejected':
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  /**
   * Get human-readable label for stage (Spanish)
   * 
   * @returns Display label for the badge
   */
  const getStageLabel = () => {
    switch (normalizedStage) {
      case 'Draft': return 'Borrador';
      case 'Sent': return 'Enviada';
      case 'Accepted': return 'Aceptada';
      case 'Rejected': return 'Rechazada';
      default: return 'Borrador';
    }
  };

  return (
    <Badge variant="outline" className={getBadgeVariant()}>
      {getStageLabel()}
    </Badge>
  );
};