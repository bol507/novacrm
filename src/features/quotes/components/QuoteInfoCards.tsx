import { Calendar, Building2, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

/**
 * Props for QuoteInfoCards component
 */
export interface QuoteInfoCardsProps {
  /** Client name (optional) */
  accountName?: string;
  /** Assigned user name (optional) */
  assignedUserName?: string;
  /** Valid until date string (optional) */
  validUntil?: string | null;
  /** Date formatter function */
  formatDate: (date: string | null) => string;
}

/**
 * QuoteInfoCards Component
 * 
 * Displays three info cards: Client, Assigned To, and Valid Until.
 * Cards are only rendered if their respective data is available.
 * 
 * @component
 * @param {QuoteInfoCardsProps} props - Component props
 * @param {string} [props.accountName] - Client name
 * @param {string} [props.assignedUserName] - Assigned user name
 * @param {string | null} [props.validUntil] - Valid until date
 * @param {function} props.formatDate - Date formatting function
 * 
 * @returns {JSX.Element} Info cards section
 * 
 * @example
 * <QuoteInfoCards 
 *   accountName="Acme Corporation"
 *   assignedUserName="John Doe"
 *   validUntil="2026-03-31"
 *   formatDate={formatDate}
 * />
 */
export const QuoteInfoCards = ({ 
  accountName, 
  assignedUserName, 
  validUntil, 
  formatDate 
}: QuoteInfoCardsProps) => {
  return (
    <div className="space-y-4">
      {accountName && (
        <Card className="flex items-start gap-3 p-4 border border-border">
          <Building2 className="h-6 w-6 text-muted-foreground mt-1" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Client</p>
            <p className="text-lg font-semibold">{accountName}</p>
          </div>
        </Card>
      )}

      {assignedUserName && (
        <Card className="flex items-start gap-3 p-4 border border-border">
          <Users className="h-6 w-6 text-muted-foreground mt-1" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Assigned to</p>
            <p className="text-lg font-semibold">{assignedUserName}</p>
          </div>
        </Card>
      )}

      {validUntil && (
        <Card className="flex items-start gap-3 p-4 border border-border">
          <Calendar className="h-6 w-6 text-muted-foreground mt-1" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Valid until</p>
            <p className="text-lg font-semibold">{formatDate(validUntil)}</p>
          </div>
        </Card>
      )}
    </div>
  );
};