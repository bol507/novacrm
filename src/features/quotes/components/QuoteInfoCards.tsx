import { Calendar, Building2, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

/**
 * Props for QuoteInfoCards component
 */
export interface QuoteInfoCardsProps {
  accountName?: string;
  accountId?: number | null; 
  assignedUserName?: string;
  validUntil?: string | null;
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
 * @param {number} [props.accountId] - Client ID for navigation
 * @param {string} [props.assignedUserName] - Assigned user name
 * @param {string | null} [props.validUntil] - Valid until date
 * @param {function} props.formatDate - Date formatting function
 * 
 * @returns {JSX.Element} Info cards section
 */
export const QuoteInfoCards = ({ 
  accountName, 
  accountId,
  assignedUserName, 
  validUntil, 
  formatDate 
}: QuoteInfoCardsProps) => {
  const navigate = useNavigate(); 
  const handleClientClick = () => {
    if (accountId && accountId > 0) {
      navigate(`/dashboard/clients/${accountId}`);  // ← Ajusta la ruta según tu router
    }
  };
  return (
    <div className="space-y-4">
      {accountName && (
        <Card 
          className={`flex items-start gap-3 p-4 border border-border ${
            accountId && accountId > 0 
              ? 'cursor-pointer hover:bg-muted/50 transition-colors'  
              : ''
          }`}
          onClick={accountId && accountId > 0 ? handleClientClick : undefined}
        >
          <Building2 className="h-6 w-6 text-muted-foreground mt-1" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Client</p>
            <p className={`text-lg font-semibold ${
              accountId && accountId > 0 
                ? 'text-primary hover:underline'
                : ''
            }`}>
              {accountName}
            </p>
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