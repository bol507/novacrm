
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useVendorQuotes } from '../../hooks/use-vendor-quotes';
import { VendorQuoteListPage } from '../presentational/VendorQuoteListPage';

/**
 * VendorQuoteListContainer component for managing vendor quotes list.
 *
 * Features:
 * - Fetches and displays vendor quotes for a project
 * - Handles quote acceptance actions
 * - Navigates to quote detail view
 *
 * @component
 * @returns The rendered vendor quote list container
 */
export const VendorQuoteListContainer = () => {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();
    const { data: quotes, isLoading } = useVendorQuotes.list(Number(projectId));
    const { mutate: acceptQuote } = useVendorQuotes.accept();

    const handleAcceptQuote = (quoteId: number) => {
        acceptQuote({ quoteId, payload: {} }, {
            onSuccess: () => {
                toast.success('Quote accepted successfully');
            },
            onError: (err) => {
                toast.error(err.message || 'Error accepting quote');
            },
        });
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-start">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="h-8 w-8"
                    aria-label="Back"
                    title="Back to requests list"
                >
                    <ArrowLeftIcon className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-lg font-semibold">Vendor Quotes</h2>
                    <p className="text-sm text-muted-foreground">
                        Requests for Quotation (RFQ) and vendor responses
                    </p>
                </div>
            </div>

            <VendorQuoteListPage
                quotes={quotes?.data || []}
                isLoading={isLoading}
                onViewDetail={(quoteId) => navigate(`${quoteId}`)}
                onAccept={handleAcceptQuote}
            />
        </div>
    );
};

export default VendorQuoteListContainer;