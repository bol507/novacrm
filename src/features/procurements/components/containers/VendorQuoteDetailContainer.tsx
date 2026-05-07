import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useVendorQuotes } from '../../hooks/use-vendor-quotes';
import { VendorQuoteDetailPage } from '../presentational/VendorQuoteDetailPage';
import type { GeneratePOFromQuotePayload, VendorQuoteItem } from '../../types/procurement';
import { PackageIcon } from 'lucide-react';
import { GeneratePOFromQuoteModal } from '../presentational/GeneratePOFromQuoteModal';
import { usePurchaseOrders } from '../../hooks/use-purchase-order';

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

    const [negotiateModal, setNegotiateModal] = useState({ open: false, notes: '', terms: '' });
    const [poModal, setPoModal] = useState<{ open: boolean; quoteId?: number; items: VendorQuoteItem[] }>({
        open: false, items: []
    });

    const handleSend = () => {
        send(quoteId, {
            onSuccess: () => toast.success('Quote sent to vendor'),
            onError: (err) => toast.error(err.message || 'Error sending'),
        });
    };

    const handleAccept = () => {
        accept({ quoteId, payload: {} }, {
            onSuccess: () => toast.success('Quote accepted successfully. You can now generate the PO.'),
            onError: (err) => toast.error(err.message || 'Error accepting'),
        });
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

    const handleGeneratePO = () => {
        if (!quote?.items?.length) {
            toast.info('No items in this quote to generate PO');
            return;
        }
        setPoModal({ open: true, quoteId: quote.id, items: quote.items });
    };

    const { mutate: createPO, isPending: isCreatingPO } = usePurchaseOrders.createFromQuote(Number(projectId));

    const handlePOSubmit = (payload: GeneratePOFromQuotePayload) => {
        createPO(payload, {
            onSuccess: (res) => {
                toast.success(`PO #${res.data.po_number} generated successfully`);
                setPoModal({ open: false, items: [] });
                navigate(`/dashboard/projects/${projectId}/procurement/purchase-orders/${res.data.id}`);
            },
            onError: (err) => toast.error(err.message || 'Error generating PO'),
        });
    };

    if (isLoading) return <div className="p-10 text-center text-muted-foreground">Loading quote...</div>;
    if (error || !quote) return <div className="p-10 text-center text-destructive">Error or quote not found</div>;

    return (
        <>
            {quote.status === 'accepted' && (
                <Button onClick={handleGeneratePO} variant="default" className="w-full gap-2">
                    <PackageIcon className="h-4 w-4" />
                    Generate Purchase Order
                </Button>
            )}
            <VendorQuoteDetailPage
                quote={quote}
                onBack={() => navigate(-1)}
                onSend={handleSend}
                onAccept={handleAccept}
                onNegotiate={handleNegotiate}
                isSending={isSending}
                isAccepting={isAccepting}
                isNegotiating={isNegotiating}
            />

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
                    quoteId={poModal.quoteId!}
                    items={poModal.items}
                    vendorName={quote.vendor_name || `Vendor #${quote.vendor_id}`}
                    isPending={isCreatingPO}
                />
            )}
        </>
    );
};

export default VendorQuoteDetailContainer;