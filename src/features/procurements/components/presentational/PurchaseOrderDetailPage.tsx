import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Package, FileText, CheckCircle, Clock, Download, Printer } from 'lucide-react';
import type { PurchaseOrderDetailPageProps, PurchaseOrderItem } from '../../types/procurement';
import { ReceiptBadge } from '@/components/ReceiptBadge';
import { useNavigate } from 'react-router-dom';

const statusConfig: Record<string, {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
}> = {
    draft: { label: 'Draft', variant: 'secondary' },
    submitted: { label: 'Submitted', variant: 'default' },
    approved: {
        label: 'Approved',
        variant: 'default',
        className: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
    },
    rejected: { label: 'Rejected', variant: 'destructive' },
    partially_received: { label: 'Partial', variant: 'outline' },
    fully_received: {
        label: 'Received',
        variant: 'default',
        className: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
    },
    cancelled: { label: 'Cancelled', variant: 'destructive' },
};

const availableTransitions: Record<string, string[]> = {
    draft: ['submitted', 'cancelled'],
    submitted: ['approved', 'rejected'],
    approved: ['partially_received', 'fully_received'],
    partially_received: ['fully_received'],
    fully_received: [],
    rejected: [],
    cancelled: [],
};

/**
 * PurchaseOrderDetailPage component for displaying purchase order details.
 *
 * Features:
 * - Displays PO header with status badge and action buttons
 * - Shows key information cards (total, expected delivery, creation date, items count)
 * - Provides status transition buttons based on current state
 * - Displays item table with quantities, pricing, and receipt status
 * - Allows recording receipt for individual items
 * - Shows traceability links to related quotes and material requests
 *
 * @component
 * @param props - Component props
 * * @param props.po - Purchase order data
 * * @param props.onBack - Callback when back button is clicked
 * * @param props.onUpdateStatus - Callback to update PO status
 * * @param props.onRecordReceipt - Callback to record receipt for an item
 * * @param props.isUpdating - Whether a status update is in progress
 * * @param props.isRecording - Whether a receipt recording is in progress
 * @returns The rendered purchase order detail page
 */
export const PurchaseOrderDetailPage = ({ po, onBack, onUpdateStatus, onRecordReceipt, isUpdating, isRecording }: PurchaseOrderDetailPageProps) => {
    const navigate = useNavigate();
    const config = statusConfig[po.status] || statusConfig.draft;
    const nextStatuses = availableTransitions[po.status] || [];

    const formatCurrency = (value: number | string) => {
        return new Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            PO #{po.po_number}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Project #{po.project_id} • {po.vendor_name || `Vendor #${po.vendor_id}`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={config.variant} className={config.className}>{config.label}</Badge>

                    {nextStatuses.length > 0 && (
                        <div className="flex gap-1">
                            {nextStatuses.map(status => (
                                <Button
                                    key={status}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onUpdateStatus(status)}
                                    disabled={isUpdating}
                                    className="text-xs"
                                >
                                    {status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                                    {status === 'rejected' && <Clock className="h-3 w-3 mr-1" />}
                                    {status.replace('_', ' ').toUpperCase()}
                                </Button>
                            ))}
                        </div>
                    )}

                    <Button variant="ghost" size="icon" title="Print" disabled>
                        <Printer className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Download PDF" disabled>
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatCurrency(po.total_amount)}</p>
                        {po.subtotal !== po.total_amount && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Subtotal: {formatCurrency(po.subtotal)}
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Expected Delivery</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-medium">{formatDate(po.expected_delivery_date)}</p>
                        {po.expected_delivery_date && new Date(po.expected_delivery_date) < new Date() && (
                            <Badge variant="destructive" className="mt-1 text-xs">Overdue</Badge>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Created</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-medium">{formatDate(po.created_at)}</p>
                        <p className="text-xs text-muted-foreground mt-1">By user #{po.created_by}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-medium">{po.items?.length || 0} item(s)</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {po.items?.filter(i => i.receipt_status === 'complete').length || 0} received
                        </p>
                    </CardContent>
                </Card>
            </div>

            {(po.vendor_quote_id || po.material_request_id) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Traceability
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-4 text-sm">
                        {po.vendor_quote_id && (
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Quote:</span>
                                <Button
                                    variant="link"
                                    className="p-0 h-auto font-normal text-primary hover:underline"
                                    onClick={() => navigate(`/dashboard/projects/${po.project_id}/procurement/vendor-quotes/${po.vendor_quote_id}`)}
                                >
                                    #{po.vendor_quote_id}
                                </Button>
                            </div>
                        )}
                        {po.material_request_id && (
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Material Request:</span>
                                <Button
                                    variant="link"
                                    className="p-0 h-auto font-normal text-primary hover:underline"
                                    onClick={() => navigate(`/dashboard/projects/${po.project_id}/procurement/${po.material_request_id}`)}
                                >
                                    #{po.material_request_id}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {po.internal_notes && (
                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Internal Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{po.internal_notes}</p>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="text-center">Qty</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-right">Disc.</TableHead>
                                    <TableHead className="text-right">Subtotal</TableHead>
                                    <TableHead className="text-center">Received</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {po.items?.map((item: PurchaseOrderItem) => {
                                    const received = item.received_quantity || 0;
                                    const isComplete = received >= Number(item.quantity);

                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="space-y-0.5">
                                                    <p className="font-medium">{item.item_name}</p>
                                                    {item.notes && (
                                                        <p className="text-xs text-muted-foreground line-clamp-1">{item.notes}</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-mono">
                                                {Number(item.quantity).toFixed(2)} {item.unit}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatCurrency(item.unit_price)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {Number(item.discount_percent).toFixed(1)}%
                                            </TableCell>
                                            <TableCell className="text-right font-mono font-medium">
                                                {formatCurrency(item.line_total)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <ReceiptBadge received={received} total={Number(item.quantity)} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {!isComplete && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-xs h-7"
                                                        onClick={() => onRecordReceipt(item)}
                                                        disabled={isUpdating || isRecording}
                                                    >
                                                        Record
                                                    </Button>
                                                )}
                                                {isComplete && (
                                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                                        ✓ Complete
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {po.terms && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Terms</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{po.terms}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};