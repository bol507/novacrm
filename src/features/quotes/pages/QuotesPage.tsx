import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileText } from "lucide-react";
import { toast } from "sonner";

import { useQuotes } from "../hooks/useQuotes";
import { useCreateQuote } from "../hooks/useCreateQuote";
import { useUpdateQuote } from "../hooks/useUpdateQuote";
import { useDeleteQuote } from "../hooks/useDeleteQuote";
import type { Quote, QuoteFormData } from "../types/quote";
import { QuoteCards } from "../components/QuoteCards";
import { Pagination } from "@/components/Pagination";
import { usePagination } from "@/shared/hooks/use-pagination";
import QuoteFormDialog from "../components/QuoteFormDialog";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { QuoteStats } from "../components/QuoteStats";
import { useConfirm } from "@/components/confirm-dialog";


const calculateStats = (quotes: Quote[]) => {
    const pending = quotes.filter(q => q.quote_stage === 'Draft' || q.quote_stage === 'Sent').length;
    const accepted = quotes.filter(q => q.quote_stage === 'Accepted').length;
    const totalValue = quotes.reduce((sum, q) => sum + q.total, 0);
    const acceptedValue = quotes
        .filter(q => q.quote_stage === 'Accepted')
        .reduce((sum, q) => sum + q.total, 0);

    return {
        pending,
        accepted,
        totalValue,
        acceptedValue
    };
};


const QuotesPage = () => {
    const { page, setPage, searchTerm, setSearchTerm } = usePagination();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingQuote, setEditingQuote] = useState<Quote | null>(null);

    const { data, isLoading, error, refetch } = useQuotes(page, 20, searchTerm);
    const createQuoteMutation = useCreateQuote();
    const updateQuoteMutation = useUpdateQuote();
    const deleteQuoteMutation = useDeleteQuote();
    const showConfirm = useConfirm();

    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    const filteredQuotes = data?.data || [];
    const totalPages = data?.meta?.last_page || 1;
    const totalItems = data?.meta?.total || 0;

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-destructive">Error al cargar cotizaciones: {error.message}</p>
                </div>
            </div>
        );
    }

    const handleCreateQuote = async (quoteData: QuoteFormData) => {
        try {
            await createQuoteMutation.mutateAsync(quoteData);
            setPage(1);
        } catch (error) {
            // El error ya se maneja en el hook
        }
    };

    const handleEditQuoteClick = (quote: Quote) => {
        setEditingQuote(quote);
    };

    const handleEditQuoteSubmit = async (quoteData: QuoteFormData) => {
        if (!editingQuote) {
            toast.error("No se pudo obtener la cotización para editar");
            return;
        }

        try {
            await updateQuoteMutation.mutateAsync({
                id: editingQuote.quoteid,
                data: quoteData
            });
            setEditingQuote(null);
        } catch (error) {
            // El error ya se maneja en el hook
        }
    };



    const handleDeleteQuote = async (quote: Quote) => {
        try {
            await deleteQuoteMutation.mutateAsync(quote.quoteid);
            toast.success('Cotización eliminada exitosamente');
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al eliminar la cotización");
        }
    };

    const stats = calculateStats(filteredQuotes);

    return (
        <ErrorBoundary>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Cotizaciones</h1>
                        <p className="text-muted-foreground">
                            Gestiona las cotizaciones de ventas
                        </p>
                    </div>
                    <Button
                        className="gap-2"
                        onClick={() => setIsCreateDialogOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Nueva Cotización
                    </Button>
                </div>

                {/* Stats */}
                <QuoteStats
                    pending={stats.pending}
                    accepted={stats.accepted}
                    totalValue={stats.totalValue}
                    acceptedValue={stats.acceptedValue}
                />

                {/* Search */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre o número de cotización..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Quotes Grid */}
                <QuoteCards
                    quotes={filteredQuotes}
                    isLoading={isLoading}
                    onEditQuote={handleEditQuoteClick}
                    onDeleteQuote={(quote) => {
                        showConfirm({
                            title: "¿Eliminar cotización?",
                            description: `¿Estás seguro de eliminar la cotización "${quote.subject}"? Esta acción no se puede deshacer.`,
                            confirmLabel: "Eliminar",
                            cancelLabel: "Cancelar",
                            onConfirm: () => handleDeleteQuote(quote),
                        });
                    }}
                />

                {/* Footer info y paginación */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {!isLoading && (
                        <div className="text-sm text-muted-foreground">
                            Mostrando {filteredQuotes.length} de {totalItems} cotizaciones
                        </div>
                    )}

                    {!isLoading && totalPages > 1 && (
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    )}
                </div>

                {/* Diálogos */}
                <QuoteFormDialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                    onSubmit={handleCreateQuote}
                    mode="create"
                />



                {editingQuote && (
                    <QuoteFormDialog
                        open={true}
                        onOpenChange={() => setEditingQuote(null)}
                        onSubmit={handleEditQuoteSubmit}
                        mode="edit"
                        initialData={editingQuote}
                    />
                )}
            </div>
        </ErrorBoundary>
    );
};

export default QuotesPage;