import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useQuotes } from "../hooks/useQuotes";
import { useDeleteQuote } from "../hooks/useDeleteQuote";
import { DEFAULT_QUOTE_SORT, type Quote, type QuoteSortConfig, type QuoteViewMode } from "../types/quote";
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


    useMemo(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("quotesViewMode", viewMode);
        }
    }, [viewMode]);

    const clientId = searchParams.get('clientId');
    const clientIdNumber = clientId ? parseInt(clientId, 10) : null;

    const [sortConfig, setSortConfig] = useState<QuoteSortConfig>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("quotesSortConfig");
            if (saved) {
                try {
                    return JSON.parse(saved) as QuoteSortConfig;
                } catch {
                    return DEFAULT_QUOTE_SORT;
                }
            }
        }
        return DEFAULT_QUOTE_SORT;
    });

    const { data, isLoading, error, refetch } = useQuotes(
        page,
        20,
        searchTerm,
        clientIdNumber ? { clientId: clientIdNumber } : undefined,
        sortConfig
    );

    const deleteQuoteMutation = useDeleteQuote();
    const showConfirm = useConfirm();


    useEffect(() => {
        setPage(1);
    }, [searchTerm, clientId, setPage]);

     useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("quotesSortConfig", JSON.stringify(sortConfig));
    }
  }, [sortConfig]);

    const filteredQuotes = data?.data || [];
    const totalPages = data?.meta?.last_page || 1;
    const totalItems = data?.meta?.total || 0;

    const handleCreateQuoteClick = () => {
        if (clientIdNumber) {
            navigate(`/dashboard/quotes/new?clientId=${clientIdNumber}`);
        } else {
            navigate('/dashboard/quotes/new');
        }
    };

    const handleViewQuote = (quote: Quote) => {
        navigate(`/dashboard/quotes/${quote.quoteid}`);
        //const url = `/dashboard/quotes/${quote.quoteid}`;
        // window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleEditQuoteClick = (quote: Quote) => {
        navigate(`/dashboard/quotes/${quote.quoteid}/edit`);
    };

    const handleDeleteQuote = async (quote: Quote) => {
        try {
            await deleteQuoteMutation.mutateAsync(quote.quoteid);
            toast.success('Quote deleted successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error deleting quote");
        }
    };

    const handleClearClientFilter = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('clientId');
        navigate(`?${newParams.toString()}`, { replace: true });
        setPage(1);
    };

    const handleViewModeChange = (mode: QuoteViewMode) => {
        setViewMode(mode);
    };

    const handleDeleteQuoteWrapper = (quote: Quote) => {
        showConfirm({
            title: "Delete Quote?",
            description: `Are you sure you want to delete the quote "${quote.subject}"? This action cannot be undone.`,
            confirmLabel: "Delete",
            cancelLabel: "Cancel",
            onConfirm: () => handleDeleteQuote(quote),
        });
    };

    

    const handleSortChange = (newConfig: QuoteSortConfig) => {
    setSortConfig(newConfig);
    setPage(1); // Resetear a primera página al cambiar el orden
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
                sortConfig={sortConfig}              
                onSortChange={handleSortChange}      
            />
        </ErrorBoundary>
    );
};

export default QuotesPage;