import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CheckCircleIcon, Loader2 } from 'lucide-react';
import { usePurchaseOrders } from '../../hooks/use-purchase-order';
import { PurchaseOrderDetailPage } from '../presentational/PurchaseOrderDetailPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { PurchaseOrderItem, ReceiptModalState, RecordReceiptPayload } from '../../types/procurement';

/**
 * PurchaseOrderDetailContainer component for managing purchase order details.
 *
 * Features:
 * - Fetches and displays purchase order details
 * - Handles status updates with confirmation modal
 * - Manages receipt recording for items
 * - Supports PDF download
 *
 * @component
 * @returns The rendered purchase order detail container
 */
export const PurchaseOrderDetailContainer = () => {
    const { projectId: projectIdStr, poId: poIdStr } = useParams<{ projectId: string; poId: string }>();
    const navigate = useNavigate();
    const projectId = Number(projectIdStr);
    const poId = Number(poIdStr);

    const { data: po, isLoading, error, refetch } = usePurchaseOrders.get(projectId, poId);
    const { mutate: updateStatus, isPending: isUpdating } = usePurchaseOrders.updateStatus();
    const { mutate: recordReceipt, isPending: isRecording } = usePurchaseOrders.recordReceipt();
    const { download: downloadPdf } = usePurchaseOrders.downloadPdf();

    const [statusModal, setStatusModal] = useState<{ open: boolean; newStatus?: string; notes: string }>({
        open: false, notes: ''
    });
    const [receiptModal, setReceiptModal] = useState<ReceiptModalState>({
        open: false,
        notes: '',
        receivedDate: new Date().toISOString().split('T')[0]
    });

    const handleBack = () => navigate(-1);

    const handleUpdateStatus = (newStatus: string) => {
        if (['submitted', 'approved', 'rejected'].includes(newStatus)) {
            setStatusModal({ open: true, newStatus, notes: '' });
            return;
        }
        executeStatusUpdate(newStatus, '');
    };

    const executeStatusUpdate = (newStatus: string, notes: string) => {
        updateStatus(
            { poId, status: newStatus, notes },
            {
                onSuccess: () => {
                    toast.success(`PO updated to "${newStatus}"`);
                    setStatusModal({ open: false, notes: '' });
                    refetch();
                },
                onError: (err: any) => {
                    toast.error(err?.response?.data?.error || 'Error updating status');
                    setStatusModal({ open: false, notes: '' });
                },
            }
        );
    };

    const handleOpenReceipt = (item: PurchaseOrderItem) => {
        setReceiptModal({
            open: true,
            itemId: item.id,
            itemName: item.item_name,
            orderedQty: Number(item.quantity),
            currentReceived: item.received_quantity || 0,
            notes: '',
            receivedDate: new Date().toISOString().split('T')[0],
        });
    };

    const handleConfirmReceipt = () => {
        if (!receiptModal.itemId || !receiptModal.orderedQty) return;

        const payload: RecordReceiptPayload = {
            quantity_received: receiptModal.orderedQty - (receiptModal.currentReceived || 0),
            received_date: receiptModal.receivedDate,
            notes: receiptModal.notes || undefined,
        };

        recordReceipt({
            poId,
            poItemId: receiptModal.itemId,
            payload,
        }, {
            onSuccess: () => {
                setReceiptModal({
                    open: false,
                    notes: '',
                    receivedDate: new Date().toISOString().split('T')[0]
                });
            },
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading purchase order...</p>
            </div>
        );
    }

    if (error || !po) {
        return (
            <div className="p-6 text-center border rounded-lg bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <p className="text-destructive font-medium">Error loading PO</p>
                <p className="text-sm text-muted-foreground mt-1">{error?.message || 'Please try again'}</p>
                <Button variant="outline" className="mt-4" onClick={handleBack}>Back</Button>
            </div>
        );
    }

    const purchaseOrder = po.data;
    const handleDownloadPdf = () => downloadPdf(poId);

    return (
        <ErrorBoundary>
            <PurchaseOrderDetailPage
                po={purchaseOrder}
                onBack={handleBack}
                onUpdateStatus={handleUpdateStatus}
                onRecordReceipt={(item: PurchaseOrderItem) => handleOpenReceipt(item)}
                isUpdating={isUpdating}
                onDownload={handleDownloadPdf}
            />

            <Dialog open={statusModal.open} onOpenChange={(o) => !o && setStatusModal(p => ({ ...p, open: o }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Status Change</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to change status to <strong>{statusModal.newStatus}</strong>?
                        </p>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Notes (optional)</label>
                            <Textarea
                                placeholder="Reason for change, additional instructions..."
                                value={statusModal.notes}
                                onChange={e => setStatusModal(p => ({ ...p, notes: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setStatusModal({ open: false, notes: '' })}>
                            Cancel
                        </Button>
                        <Button onClick={() => executeStatusUpdate(statusModal.newStatus!, statusModal.notes)} disabled={isUpdating}>
                            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={receiptModal.open}
                onOpenChange={(open) => !open && setReceiptModal(p => ({ ...p, open }))}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Record Receipt</DialogTitle>
                        <DialogDescription>
                            Item: <strong>{receiptModal.itemName}</strong><br />
                            Pending: <strong>{receiptModal.orderedQty && receiptModal.currentReceived !== undefined
                                ? receiptModal.orderedQty - receiptModal.currentReceived
                                : 0}</strong> of {receiptModal.orderedQty} {receiptModal.orderedQty === 1 ? 'unit' : 'units'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Receipt Date *</Label>
                            <Input
                                type="date"
                                value={receiptModal.receivedDate}
                                onChange={(e) => setReceiptModal(p => ({ ...p, receivedDate: e.target.value }))}
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Quantity to receive</Label>
                            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                                <span className="text-lg font-mono font-medium">
                                    {receiptModal.orderedQty && receiptModal.currentReceived !== undefined
                                        ? receiptModal.orderedQty - receiptModal.currentReceived
                                        : 0}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    (all pending)
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                For partial receipt, implement a numeric input with validation
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Notes (optional)</Label>
                            <Textarea
                                placeholder="E.g., Received at central warehouse, no damages..."
                                value={receiptModal.notes}
                                onChange={(e) => setReceiptModal(p => ({ ...p, notes: e.target.value }))}
                                className="min-h-[80px]"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setReceiptModal(p => ({ ...p, open: false }))}
                            disabled={isRecording}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmReceipt}
                            disabled={isRecording || !receiptModal.itemId}
                            className="gap-2"
                        >
                            {isRecording ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Recording...
                                </>
                            ) : (
                                <>
                                    <CheckCircleIcon className="h-4 w-4" />
                                    Confirm Receipt
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ErrorBoundary>
    );
};

export default PurchaseOrderDetailContainer;