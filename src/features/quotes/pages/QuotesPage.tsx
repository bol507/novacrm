import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useQuotes } from "../hooks/useQuotes";
import { useDeleteQuote } from "../hooks/useDeleteQuote";
import type { Quote, QuoteViewMode } from "../types/quote";
import { usePagination } from "@/shared/hooks/use-pagination";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useConfirm } from "@/components/confirm-dialog";
import { useNavigate, useSearchParams } from "react-router-dom";
import { QuoteView } from "../components/QuoteView";

/**
 * QuotesPage component for managing quotes.
 *
 * Features:
 * - Displays paginated list of quotes with search functionality
 * - Supports card and table view modes (persisted in localStorage)
 * - Filter quotes by client ID via URL query parameter
 * - Create, view, edit, and delete quote operations
 * - Confirmation dialog for delete actions
 * - Clear client filter button when filtering by client
 * - Responsive layout with proper loading and error states
 *
 * @component
 * @returns The rendered quotes management page
 *
 * @example
 * // Route configuration
 * <Route path="/dashboard/quotes" element={<QuotesPage />} />
 *
 * @example
 * // Navigate with client filter
 * navigate('/dashboard/quotes?clientId=123');
 */
const QuotesPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { page, setPage, searchTerm, setSearchTerm } = usePagination();
    const [viewMode, setViewMode] = useState<QuoteViewMode>(() => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem("quotesViewMode") as QuoteViewMode) || "cards";
        }
        return "cards";
    });

    // Persist view mode preference to localStorage
    useMemo(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("quotesViewMode", viewMode);
        }
    }, [viewMode]);

    const clientId = searchParams.get('clientId');
    const clientIdNumber = clientId ? parseInt(clientId, 10) : null;

    const { data, isLoading, error, refetch } = useQuotes(
        page,
        20,
        searchTerm,
        clientIdNumber ? { clientId: clientIdNumber } : undefined
    );

    const deleteQuoteMutation = useDeleteQuote();
    const showConfirm = useConfirm();

    // Reset to first page when search term or client filter changes
    useEffect(() => {
        setPage(1);
    }, [searchTerm, clientId, setPage]);

    const filteredQuotes = data?.data || [];
    const totalPages = data?.meta?.last_page || 1;
    const totalItems = data?.meta?.total || 0;

    /**
     * Navigates to the quote creation page.
     */
    const handleCreateQuoteClick = () => {
        if (clientIdNumber) {
            navigate(`/dashboard/quotes/new?clientId=${clientIdNumber}`);
        } else {
            navigate('/dashboard/quotes/new');
        }
    };

    /**
     * Navigates to the quote detail page.
     *
     * @param quote - The quote to view
     */
    const handleViewQuote = (quote: Quote) => {
        navigate(`/dashboard/quotes/${quote.quoteid}`);
       //const url = `/dashboard/quotes/${quote.quoteid}`;
       // window.open(url, '_blank', 'noopener,noreferrer');
    };

    /**
     * Navigates to the quote edit page.
     *
     * @param quote - The quote to edit
     */
    const handleEditQuoteClick = (quote: Quote) => {
        navigate(`/dashboard/quotes/${quote.quoteid}/edit`);
    };

    /**
     * Deletes a quote and shows success/error toast.
     *
     * @param quote - The quote to delete
     */
    const handleDeleteQuote = async (quote: Quote) => {
        try {
            await deleteQuoteMutation.mutateAsync(quote.quoteid);
            toast.success('Quote deleted successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error deleting quote");
        }
    };

    /**
     * Clears the client filter from the URL query parameters.
     */
    const handleClearClientFilter = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('clientId');
        navigate(`?${newParams.toString()}`, { replace: true });
        setPage(1);
    };

    /**
     * Handles view mode changes (cards/table).
     *
     * @param mode - The new view mode
     */
    const handleViewModeChange = (mode: QuoteViewMode) => {
        setViewMode(mode);
    };

    /**
     * Wrapper for delete quote that shows confirmation dialog before deletion.
     *
     * @param quote - The quote to delete
     */
    const handleDeleteQuoteWrapper = (quote: Quote) => {
        showConfirm({
            title: "Delete Quote?",
            description: `Are you sure you want to delete the quote "${quote.subject}"? This action cannot be undone.`,
            confirmLabel: "Delete",
            cancelLabel: "Cancel",
            onConfirm: () => handleDeleteQuote(quote),
        });
    };

    return (
        <ErrorBoundary>
            <QuoteView
                quotes={filteredQuotes}
                isLoading={isLoading}
                error={error}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onCreateClick={handleCreateQuoteClick}
                onViewModeChange={handleViewModeChange}
                onRefresh={refetch}
                onView={handleViewQuote}
                onEdit={handleEditQuoteClick}
                onDelete={handleDeleteQuoteWrapper}
                viewMode={viewMode}
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={setPage}
                quoteCount={totalItems}
                clientIdNumber={clientIdNumber}
                handleClearClientFilter={handleClearClientFilter}
            />
        </ErrorBoundary>
    );
};

export default QuotesPage;