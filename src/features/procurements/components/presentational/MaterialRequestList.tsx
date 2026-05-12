import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
 * MaterialRequestList component for displaying material requests.
 * Responsive: Table on desktop, Cards on mobile.
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

  // Componente reutilizable para los botones de acción
  const RequestActions = ({ req, className = '' }: { req: MaterialRequest; className?: string }) => {
    const approvedItems = getApprovedItemsForRequest(req);
    
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onViewDetails(req.id)}>
          <Eye className="h-4 w-4" />
        </Button>

        {req.status === 'procurement_in_progress' && onViewQuotes && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-600 hover:text-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              onViewQuotes(req.id);
            }}
            title="View quotes for this request"
          >
            <FileText className="h-4 w-4" />
          </Button>
        )}

        {canApprove && req.status === 'submitted' && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onApprove(req.id)}>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </Button>
        )}

        {canCreateRFQForRequest(req) && onCreateRFQ && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-600 hover:text-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              onCreateRFQ(req.id, approvedItems);
            }}
            title={`Create RFQ with ${approvedItems.length} approved item(s)`}
          >
            <FileTextIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

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

      {/* Vista TABLE - Desktop (md y arriba) */}
      <div className="rounded-md border hidden md:block">
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
                    {req.status === 'procurement_in_progress' && (
                      <Badge variant="outline" className="ml-1 text-[10px] bg-orange-50 text-orange-700 border-orange-200">
                        RFQ
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{req.requested_by_name}</TableCell>
                  <TableCell>
                    {format(new Date(req.created_at), 'PPP', { locale: es })}
                  </TableCell>
                  <TableCell className="text-right">
                    <RequestActions req={req} className="justify-end" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Vista CARDS - Mobile (menor a md) */}
      <div className="md:hidden space-y-3">
        {requests.map((req) => {
          const config = statusConfig[req.status] || statusConfig.draft;
          return (
            <Card key={req.id} className="overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">Request #{req.id}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {req.requested_by_name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant={config.variant}>{config.label}</Badge>
                    {req.status === 'procurement_in_progress' && (
                      <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-700 border-orange-200">
                        RFQ
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xs text-muted-foreground mb-3">
                  {format(new Date(req.created_at), 'PPP', { locale: es })}
                </p>
                <Separator className="mb-3" />
                <RequestActions req={req} className="justify-end" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};