import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Clock, User, FileText, CheckCircle2, XCircle, AlertTriangle, InfoIcon, TagIcon, FolderOpen, CheckCircle } from 'lucide-react';
import type { MaterialRequest, MaterialRequestItem } from '../../types/procurement';
import { useNavigate } from 'react-router-dom';

interface Props {
    request: MaterialRequest;
    onBack: () => void;
    canApprove?: boolean;
    onApprove?: () => void;
}

/**
 * MaterialRequestDetailPage component for displaying a single material request.
 *
 * Features:
 * - Header with request ID, project info, and status badge
 * - Items table with quantities and statuses
 * - Sidebar with metadata (requester, dates, rejection notes)
 * - Summary statistics for approved/partial items
 *
 * @component
 * @param props - Component props
 * @param props.request - Material request data to display
 * @param props.onBack - Callback when back button is clicked
 * @returns The rendered material request detail page
 */
export const MaterialRequestDetailPage = ({ request, onBack, canApprove, onApprove }: Props) => {
    const navigate = useNavigate();

    const handleGoToProject = () => {
        navigate(`/dashboard/projects/${request.project_id}`);
    };

    const statusColors: Record<string, string> = {
        draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        partially_approved: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        partially_procured: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        fully_procured: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
        closed: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    };

    const statusIcons: Record<string, React.ReactNode> = {
        draft: <Clock className="h-4 w-4" />,
        submitted: <Clock className="h-4 w-4" />,
        approved: <CheckCircle2 className="h-4 w-4" />,
        rejected: <XCircle className="h-4 w-4" />,
        partially_approved: <AlertTriangle className="h-4 w-4" />,
        partially_procured: <AlertTriangle className="h-4 w-4" />,
        fully_procured: <CheckCircle2 className="h-4 w-4" />,
        closed: <FileText className="h-4 w-4" />,
    };

    const getItemStatusBadge = (item: MaterialRequestItem) => {
        const baseClass = 'text-xs font-medium';

        switch (item.item_status) {
            case 'approved':
                return <Badge className={`${baseClass} bg-green-100 text-green-800`}>Approved</Badge>;
            case 'rejected':
                return <Badge className={`${baseClass} bg-red-100 text-red-800`}>Rejected</Badge>;
            case 'partially_approved':
                return (
                    <Badge className={`${baseClass} bg-yellow-100 text-yellow-800 flex items-center gap-1`}>
                        <AlertTriangle className="h-3 w-3" />
                        Partial
                        {item.approved_quantity && (
                            <span className="ml-1 text-[10px] opacity-80">
                                ({item.approved_quantity}/{item.quantity})
                            </span>
                        )}
                    </Badge>
                );
            case 'pending':
                return <Badge variant="outline" className={baseClass}>Pending</Badge>;
            default:
                return <Badge variant="secondary" className={baseClass}>{String(item.item_status ?? 'unknown').replace('_', ' ')}</Badge>;
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-0">

      {/* Header con botón de aprobar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onBack} className="h-9 w-9 flex-shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Request #{request.id}
            </h1>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-sm text-muted-foreground hover:text-primary"
              onClick={handleGoToProject}
            >
              <FolderOpen className="h-3.5 w-3.5 mr-1" />
              Project #{request.project_id}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* ✅ Botón de aprobar - solo si tiene permiso y está en status submitted */}
          {canApprove && request.status === 'submitted' && onApprove && (
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={onApprove}
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
          )}

          <Badge className={`${statusColors[request.status] || 'bg-muted'} px-3 py-1.5 text-sm flex items-center gap-1.5 font-medium`}>
            {statusIcons[request.status]}
            {request.status.replace('_', ' ').charAt(0).toUpperCase() + request.status.replace('_', ' ').slice(1)}
          </Badge>
        </div>
      </div>

      {/* ... resto del componente sin cambios ... */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Requested Items
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[35%]">Item</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead className="text-center">Requested</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">Approved</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {request.items?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No items in this request
                      </TableCell>
                    </TableRow>
                  ) : (
                    request.items?.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="font-medium truncate" title={item.item_name}>
                              {item.item_name}
                            </p>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground line-clamp-1" title={item.notes}>
                                {item.notes}
                              </p>
                            )}
                            {item.catalog_reason_type === 'other' && item.reason_other && (
                              <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                                <InfoIcon className="h-3 w-3" />
                                {item.reason_other}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="hidden sm:table-cell">
                          <div className="flex flex-col gap-1">
                            <span className="capitalize text-sm">{item.catalog_item_type}</span>
                            {item.priority && (
                              <Badge variant="outline" className="text-[10px] w-fit px-1.5 py-0">
                                <TagIcon className="h-2.5 w-2.5 mr-0.5" />
                                {item.priority}
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-semibold">{item.quantity}</span>
                            <span className="text-[10px] text-muted-foreground">{item.unit}</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-center hidden sm:table-cell">
                          {item.item_status === 'partially_approved' || item.item_status === 'approved' ? (
                            <div className="flex flex-col items-center">
                              <span className="font-semibold text-green-600">
                                {item.approved_quantity ?? item.quantity}
                              </span>
                              <span className="text-[10px] text-muted-foreground">{item.unit}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            {getItemStatusBadge(item)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Requested by</p>
                  <p className="font-medium truncate" title={request.requested_by_name || `User #${request.requested_by}`}>
                    {request.requested_by_name || `User #${request.requested_by}`}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm font-medium">{formatDate(request.created_at)}</p>
                  </div>
                </div>

                {request.submitted_at && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Submitted</p>
                      <p className="text-sm font-medium">{formatDate(request.submitted_at)}</p>
                    </div>
                  </div>
                )}

                {request.approved_at && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Processed</p>
                      <p className="text-sm font-medium">{formatDate(request.approved_at)}</p>
                      {request.approved_by_name && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          by {request.approved_by_name}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {request.rejection_notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  Rejection Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="font-medium text-red-800 dark:text-red-200 mb-1 flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" />
                    Rejection reason:
                  </p>
                  <p className="whitespace-pre-wrap">{request.rejection_notes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {request.items?.some(i => i.notes) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Item Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {request.items
                  .filter(item => item.notes)
                  .map(item => (
                    <div key={item.id} className="p-2 bg-muted/30 rounded-md text-sm">
                      <span className="font-medium">{item.item_name}:</span>{' '}
                      <span className="text-muted-foreground">{item.notes}</span>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

          {request.items && request.items.length > 0 && (
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {request.items.filter(i => i.item_status === 'approved').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Approved</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {request.items.filter(i => i.item_status === 'partially_approved').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Partial</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialRequestDetailPage;