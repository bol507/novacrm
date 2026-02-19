import { Badge } from "@/components/ui/badge";
import type { QuoteStage } from "../types/quote";

interface QuoteStatusBadgeProps {
  stage: QuoteStage;
}

export const QuoteStatusBadge = ({ stage }: QuoteStatusBadgeProps) => {
  const getBadgeVariant = () => {
    switch (stage) {
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

  const getStageLabel = () => {
    switch (stage) {
      case 'Draft': return 'Borrador';
      case 'Sent': return 'Enviada';
      case 'Accepted': return 'Aceptada';
      case 'Rejected': return 'Rechazada';
      default: return stage;
    }
  };

  return (
    <Badge variant="outline" className={getBadgeVariant()}>
      {getStageLabel()}
    </Badge>
  );
};