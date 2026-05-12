import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useVendorQuotes } from '../../hooks/use-vendor-quotes';
import { VendorQuoteDetailPage } from '../presentational/VendorQuoteDetailPage';
import type { GeneratePOFromQuotePayload, VendorQuoteItem } from '../../types/procurement';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { GeneratePOFromQuoteModal } from '../presentational/GeneratePOFromQuoteModal';
import { usePurchaseOrders } from '../../hooks/use-purchase-order';
import { ErrorBoundary } from '@/components/ErrorBoundary';



/**
 * VendorQuoteDetailContainer component for managing vendor quote details.
 *
 * Features:
 * - Fetches and displays vendor quote details
 * - Handles quote status actions: send, accept, negotiate
 * - Provides negotiation modal for requesting changes
 * - Generates purchase orders from accepted quotes
 *
 * @component
 * @returns The rendered vendor quote detail container
 */
export const VendorQuoteDetailContainer = () => {
    const { projectId: projectIdStr, quoteId: quoteIdStr } = useParams<{
        projectId: string;
        quoteId: string;
    }>();
    const navigate = useNavigate();
    const projectId = Number(projectIdStr);
    const quoteId = Number(quoteIdStr);

    const { data: quote, isLoading, error } = useVendorQuotes.get(projectId, quoteId);
    const { mutate: send, isPending: isSending } = useVendorQuotes.send();
    const { mutate: accept, isPending: isAccepting } = useVendorQuotes.accept();
    const { mutate: negotiate, isPending: isNegotiating } = useVendorQuotes.negotiate();
    const { mutate: createPO, isPending: isCreatingPO } = usePurchaseOrders.createFromQuote(Number(projectId));

    const [negotiateModal, setNegotiateModal] = useState({ open: false, notes: '', terms: '' });
    const [poModal, setPoModal] = useState<{
        open: boolean;
        quoteId?: number;
        items?: VendorQuoteItem[];
    }>({ open: false });
    const [acceptModal, setAcceptModal] = useState({ open: false, notes: '' });

    const handleSend = () => {
        send(quoteId, {
            onSuccess: () => toast.success('Quote sent to vendor'),
            onError: (err) => toast.error(err.message || 'Error sending'),
        });
    };

    const handleOpenAcceptModal = () => setAcceptModal({ open: true, notes: '' });

    const handleConfirmAccept = () => {
        accept(
            { quoteId: Number(quoteId), payload: { notes: acceptModal.notes } },
            {
                onSuccess: () => {
                    toast.success('Quote accepted successfully. You can now generate the Purchase Order.');
                    setAcceptModal({ open: false, notes: '' });
                },
                onError: (err: any) => toast.error(err?.response?.data?.error || 'Error accepting quote'),
            }
        );
    };

    const handleNegotiate = () => {
        setNegotiateModal({ open: true, notes: '', terms: '' });
    };

    const handleNegotiateSubmit = () => {
        negotiate({ quoteId, payload: { notes: negotiateModal.notes, new_terms: negotiateModal.terms } }, {
            onSuccess: () => {
                toast.success('Quote marked as negotiating');
                setNegotiateModal({ open: false, notes: '', terms: '' });
            },
            onError: (err) => toast.error(err.message || 'Error negotiating'),
        });
    };

    const handleOpenGeneratePO = () => {
        if (!quote?.items?.length) {
            toast.info('No items in this quote to generate PO');
            return;
        }
        setPoModal({ open: true });
    };

    const handlePOSubmit = (payload: GeneratePOFromQuotePayload) => {
        createPO(payload, {
            onSuccess: (res) => {
                setPoModal({ open: false, items: [] });
                navigate(`/dashboard/projects/${projectId}/procurement/purchase-orders/${res.data?.data?.id}`);
            },
            onError: (err) => toast.error(err.message || 'Error generating PO'),
        });
    };

    if (isLoading) return <div className="p-10 text-center text-muted-foreground">Loading quote...</div>;
    if (error || !quote) return <div className="p-10 text-center text-destructive">Error or quote not found</div>;

    return (
        <ErrorBoundary>
            {quote.status === 'submitted' && (
                <Button onClick={handleOpenAcceptModal} variant="default" className="w-full gap-2" disabled={isAccepting}>
                    <CheckCircle2 className="h-4 w-4" />
                    {isAccepting ? 'Accepting...' : 'Accept Quote'}
                </Button>
            )}

            <VendorQuoteDetailPage
                quote={quote}
                onBack={() => navigate(-1)}
                onSend={handleSend}
                onAccept={handleOpenAcceptModal}
                onNegotiate={handleNegotiate}
                onGeneratePO={handleOpenGeneratePO}
                isSending={isSending}
                isAccepting={isAccepting}
                isNegotiating={isNegotiating}
            />

            <Dialog open={acceptModal.open} onOpenChange={(o) => !o && setAcceptModal(p => ({ ...p, open: o }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Quote Acceptance</DialogTitle>
                        <DialogDescription>
                            This action will lock prices and terms. The quote will move to <strong>Accepted</strong> status and enable Purchase Order generation.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Label>Approval notes (optional)</Label>
                        <Textarea
                            placeholder="E.g., Prices approved by management. Deliver before the 15th."
                            value={acceptModal.notes}
                            onChange={e => setAcceptModal(p => ({ ...p, notes: e.target.value }))}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAcceptModal(p => ({ ...p, open: false }))}>Cancel</Button>
                        <Button onClick={handleConfirmAccept} disabled={isAccepting}>
                            {isAccepting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            Confirm Acceptance
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={negotiateModal.open} onOpenChange={(o) => !o && setNegotiateModal(prev => ({ ...prev, open: o }))}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Start Negotiation</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-2">
                        <Textarea
                            placeholder="Negotiation reasons / Counter-proposal..."
                            value={negotiateModal.notes}
                            onChange={e => setNegotiateModal(p => ({ ...p, notes: e.target.value }))}
                        />
                        <Textarea
                            placeholder="New terms (optional)..."
                            value={negotiateModal.terms}
                            onChange={e => setNegotiateModal(p => ({ ...p, terms: e.target.value }))}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNegotiateModal(p => ({ ...p, open: false }))}>Cancel</Button>
                        <Button onClick={handleNegotiateSubmit} disabled={isNegotiating || !negotiateModal.notes.trim()}>Confirm Negotiation</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {poModal.open && quote && (
                <GeneratePOFromQuoteModal
                    open
                    onClose={() => setPoModal({ open: false, items: [] })}
                    onSubmit={handlePOSubmit}
                    quoteId={poModal.quoteId ?? quote?.id ?? 0}
                    items={poModal.items ?? quote?.items ?? []}
                    vendorName={quote.vendor_name || `Vendor #${quote.vendor_id}`}
                    isPending={isCreatingPO}
                />
            )}
        </ErrorBoundary>
    );
};

export default VendorQuoteDetailContainer;