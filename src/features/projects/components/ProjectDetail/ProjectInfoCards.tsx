import { Calendar, Building2, Users, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

/**
 * Props for ProjectInfoCards component
 */
export interface ProjectInfoCardsProps {
  /** Client/account name (optional) */
  accountName?: string;
  /** Client/account ID for navigation (optional) */
  accountId?: number;
  /** Assigned user name */
  assignedUserName: string;
  /** Project start date (optional) */
  startDate?: string | null;
  /** Project target end date (optional) */
  targetEndDate?: string | null;
  /** Date formatter function */
  formatDate: (date: string | null) => string;
  /** Days remaining calculator */
  getDaysRemaining: (endDate: string | null) => number | null;
}

/**
 * ProjectInfoCards Component
 * 
 * Displays information cards for client, assigned user, start date, and due date.
 * Cards are only rendered if their respective data is available.
 * 
 * @component
 * @param {ProjectInfoCardsProps} props - Component props
 * @param {string} [props.accountName] - Client name
 * @param {number} [props.accountId] - Client ID for navigation link
 * @param {string} props.assignedUserName - Assigned user name
 * @param {string | null} [props.startDate] - Start date
 * @param {string | null} [props.targetEndDate] - Target end date
 * @param {function} props.formatDate - Date formatting function
 * @param {function} props.getDaysRemaining - Days remaining calculator
 * 
 * @returns {JSX.Element} Info cards section
 */
export const ProjectInfoCards = ({
  accountName,
  accountId,
  assignedUserName,
  startDate,
  targetEndDate,
  formatDate,
  getDaysRemaining,
}: ProjectInfoCardsProps) => {
  return (
    <div className="space-y-4">
      {accountName && accountId && (
        <Card className="flex items-start gap-3 p-4 border border-border">
          <Link to={`/dashboard/clients/${accountId}`} className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors rounded-lg border border-border">
            <Building2 className="h-6 w-6 text-muted-foreground mt-1" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Client</p>
              <p className="text-lg font-semibold">{accountName}</p>
            </div>
          </Link>
        </Card>
      )}
      
      {accountName && !accountId && (
        <Card className="flex items-start gap-3 p-4 border border-border">
          <Building2 className="h-6 w-6 text-muted-foreground mt-1" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Client</p>
            <p className="text-lg font-semibold">{accountName}</p>
          </div>
        </Card>
      )}

      <Card className="flex items-start gap-3 p-4 border border-border">
        <Users className="h-6 w-6 text-muted-foreground mt-1" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">Assigned to</p>
          <p className="text-lg font-semibold">{assignedUserName}</p>
        </div>
      </Card>

      {startDate && (
        <Card className="flex items-start gap-3 p-4 border border-border">
          <Calendar className="h-6 w-6 text-muted-foreground mt-1" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Start date</p>
            <p className="text-lg font-semibold">{formatDate(startDate)}</p>
          </div>
        </Card>
      )}

      {targetEndDate && (
        <Card className="flex items-start gap-3 p-4 border border-border">
          <Clock className="h-6 w-6 text-muted-foreground mt-1" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Due date</p>
            <p className="text-lg font-semibold">{formatDate(targetEndDate)}</p>
            <p className="text-xs text-muted-foreground">
              {getDaysRemaining(targetEndDate)} days remaining
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};