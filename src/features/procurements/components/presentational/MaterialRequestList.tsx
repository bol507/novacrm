import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Eye, CheckCircle, FileText, FileTextIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { MaterialRequest, MaterialRequestItem } from '../../types/procurement';

interface Props {
  requests: MaterialRequest[];
  isLoading: boolean;
  onNewRequest: () => void;
  onViewDetails: (id: number) => void;
  onApprove: (id: number) => void;
  canApprove: boolean;
  onViewQuotes?: (requestId: number) => void;
  onCreateRFQ?: (requestId: number, items: MaterialRequestItem[]) => void;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  submitted: { label: 'In Review', variant: 'default' },
  approved: { label: 'Approved', variant: 'default' },
  partially_approved: { label: 'Partial', variant: 'outline' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  procurement_in_progress: { label: 'In Quotation', variant: 'outline' },
  partially_procured: { label: 'In Procurement', variant: 'outline' },
  fully_procured: { label: 'Procured', variant: 'default' },
  closed: { label: 'Closed', variant: 'secondary' },
};

/**
 * MaterialRequestList component for displaying a paginated table of material requests.
 *
 * Features:
 * - Table view with request ID, status, requester, and date
 * - Loading state with spinner
 * - Empty state with action button
 * - View details action for all requests
 * - Approve action for users with permission on submitted requests
 * - Create RFQ action for approved requests
 * - View quotes action for requests in procurement progress
 *
 * @component
 * @param props - Component props
 * @param props.requests - Array of material requests
 * @param props.isLoading - Whether data is currently loading
 * @param props.onNewRequest - Callback to create a new request
 * @param props.onViewDetails - Callback to view request details
 * @param props.onApprove - Callback to approve a request
 * @param props.canApprove - Whether the current user can approve requests
 * @param props.onViewQuotes - Optional callback to view quotes for a request
 * @param props.onCreateRFQ - Optional callback to create RFQ from request
 * @returns The rendered material request list
 */
export const MaterialRequestList = ({
  requests,
  isLoading,
  onNewRequest,
  onViewDetails,
  onApprove,
  canApprove,
  onViewQuotes,
  onCreateRFQ,
}: Props) => {

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getApprovedItemsForRequest = (request: MaterialRequest): MaterialRequestItem[] => {
    return (request.items || []).filter(item => {
      const status = String(item.item_status || '').toLowerCase().trim();
      return ['approved', 'partially_approved'].includes(status);
    });
  };

  const canCreateRFQForRequest = (request: MaterialRequest): boolean => {
    const approvedItems = getApprovedItemsForRequest(request);
    return approvedItems.length > 0 &&
      ['approved', 'partially_approved'].includes(request.status) &&
      request.status !== 'procurement_in_progress';
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground mb-4">No material requests</p>
        {canApprove && (
          <Button onClick={onNewRequest}>
            <Plus className="mr-2 h-4 w-4" /> New request
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Material Requests</h2>
        {canApprove && (
          <Button onClick={onNewRequest} size="sm">
            <Plus className="mr-2 h-4 w-4" /> New request
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested by</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => {
              const config = statusConfig[req.status] || statusConfig.draft;
              return (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">#{req.id}</TableCell>
                  <TableCell>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </TableCell>
                  <TableCell>{req.requested_by_name}</TableCell>
                  <TableCell>
                    {format(new Date(req.created_at), 'PPP', { locale: es })}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => onViewDetails(req.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>

                    {req.status === 'procurement_in_progress' && onViewQuotes && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewQuotes(req.id);
                        }}
                        title="View quotes for this request"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}

                    {req.status === 'procurement_in_progress' && (
                      <Badge variant="outline" className="ml-1 text-[10px] bg-orange-50 text-orange-700 border-orange-200">
                        RFQ
                      </Badge>
                    )}

                    {canApprove && req.status === 'submitted' && (
                      <Button variant="ghost" size="icon" onClick={() => onApprove(req.id)}>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                    )}

                    {canCreateRFQForRequest(req) && onCreateRFQ && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-600 hover:text-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          const approvedItems = getApprovedItemsForRequest(req);
                          onCreateRFQ(req.id, approvedItems);
                        }}
                        title={`Create RFQ with ${getApprovedItemsForRequest(req).length} approved item(s)`}
                      >
                        <FileTextIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};