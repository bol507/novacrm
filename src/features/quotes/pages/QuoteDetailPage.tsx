import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    FileText,
    DollarSign,
    Calendar,
    Building2,
    Users,
    CheckCircle,
    XCircle,
    Pencil,
    Trash2,
    Package,
    Percent,
    DownloadIcon,
    FileTextIcon,
    Folder
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate, useParams } from "react-router-dom";
import { QuoteStatusBadge } from "../components/QuoteStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuoteDetail } from "../hooks/useQuoteDetail";
import { ExpandableText } from "../../../components/ExpandableText";
import QuoteFormDialog from "../components/QuoteFormDialog";
import type { Quote } from "../types/quote";
import { useUpdateQuote } from "../hooks/useUpdateQuote";
import { toast } from "sonner";
import { useConfirm } from "@/components/confirm-dialog";
import { useDeleteQuote } from "../hooks/useDeleteQuote";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useDownloadPDF, usePreviewPDF } from "../hooks/useDownloadPDF";
import { ProjectFormDialog } from "@/features/projects/components/ProjectFormDialog";


const QuoteDetailPage = () => {
    const { quoteId } = useParams<{ quoteId: string }>();
    const navigate = useNavigate();
    const { data: quote, isLoading, error, refetch } = useQuoteDetail(quoteId || '');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false);
    const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
    const updateQuoteMutation = useUpdateQuote();
    const deleteQuoteMutation = useDeleteQuote();
    const showConfirm = useConfirm();
    const downloadPDFMutation = useDownloadPDF();
    const previewPDFMutation = usePreviewPDF();

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center max-w-md w-full">
                    <h2 className="text-xl font-bold text-destructive mb-2">Error al cargar cotización</h2>
                    <p className="text-muted-foreground mb-4">{error.message}</p>
                    <Button onClick={() => navigate(-1)}>Volver a cotizaciones</Button>
                </div>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto p-6">
                    {/* Header con información clave */}
                    <div className="grid grid-cols-1 gap-6 mb-6">
                        <div className="space-y-4">
                            {/* Título y número de cotización */}
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-3/4 rounded bg-muted" />
                                <Skeleton className="h-6 w-1/3 rounded bg-muted" />
                            </div>

                            {/* Estado y botón volver */}
                            <div className="flex flex-col sm:items-end gap-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-6 w-20 rounded-full bg-muted" />
                                    <Skeleton className="h-8 w-20 rounded bg-muted" />
                                </div>
                            </div>

                            {/* Información lateral - 3 tarjetas */}
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-start gap-3 bg-card rounded-lg p-4 border border-border">
                                        <Skeleton className="h-6 w-6 rounded bg-muted" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-1/3 rounded bg-muted" />
                                            <Skeleton className="h-5 w-1/2 rounded bg-muted" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Panel financiero - 4 tarjetas */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-1/2 rounded bg-muted" />
                                        <Skeleton className="h-8 w-3/4 rounded bg-muted" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Contenido principal */}
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-6">
                            {/* Descripción general */}
                            <div className="bg-card rounded-lg border border-border p-6 space-y-4">
                                <Skeleton className="h-8 w-1/4 rounded bg-muted" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full rounded bg-muted" />
                                    <Skeleton className="h-4 w-5/6 rounded bg-muted" />
                                    <Skeleton className="h-4 w-4/6 rounded bg-muted" />
                                </div>
                            </div>

                            {/* Ítems de la cotización */}
                            <div className="bg-card rounded-lg border border-border p-6">
                                <div className="p-4 border-b border-border space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="h-8 w-1/3 rounded bg-muted" />
                                        <Skeleton className="h-6 w-16 rounded bg-muted" />
                                    </div>
                                </div>

                                {/* Versión desktop: tabla */}
                                <div className="hidden sm:block mt-4">
                                    <div className="space-y-4">
                                        {[...Array(3)].map((_, rowIndex) => (
                                            <div key={rowIndex} className="grid grid-cols-5 gap-4 py-4 border-b last:border-b-0">
                                                <div className="col-span-2 space-y-2">
                                                    <Skeleton className="h-5 w-1/2 rounded bg-muted" />
                                                    <Skeleton className="h-4 w-full rounded bg-muted" />
                                                    <Skeleton className="h-4 w-4/5 rounded bg-muted" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-full rounded bg-muted" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-full rounded bg-muted" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-full rounded bg-muted" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Versión mobile: tarjetas verticales */}
                                <div className="sm:hidden mt-4 space-y-4">
                                    {[...Array(2)].map((_, cardIndex) => (
                                        <div key={cardIndex} className="border-b last:border-b-0 p-4 space-y-3">
                                            <Skeleton className="h-5 w-1/2 rounded bg-muted" />
                                            <div className="grid grid-cols-2 gap-3 mt-2">
                                                {[...Array(4)].map((_, cellIndex) => (
                                                    <div key={cellIndex} className="space-y-1">
                                                        <Skeleton className="h-3 w-1/2 rounded bg-muted" />
                                                        <Skeleton className="h-4 w-full rounded bg-muted" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botones PDF */}
                    <div className="flex gap-3 mb-6">
                        <Skeleton className="h-10 w-48 rounded bg-muted" />
                        <Skeleton className="h-10 w-48 rounded bg-muted" />
                    </div>

                    {/* Botones de acción */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <Skeleton className="h-12 flex-1 rounded bg-muted" />
                        <Skeleton className="h-12 flex-1 rounded bg-muted" />
                    </div>
                </div>
            </div>
        );
    }

    if (!quote) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground mb-2">Cotización no encontrada</h2>
                    <p className="text-muted-foreground mb-4">La cotización que buscas no existe o ha sido eliminada.</p>
                    <Button onClick={() => navigate(-1)}>Volver a cotizaciones</Button>
                </div>
            </div>
        );
    }

    // Calcular monto de impuestos
    const taxes = quote.taxes || [];
    const taxAmount = quote.total - quote.subtotal;
    const hasTaxes = taxes.length > 0 || taxAmount > 0;

    // Calcular ITBMS (7%)
    const itbms = quote.subtotal * 0.07;

    // Calcular descuento total (suma de descuentos individuales)
    const totalDiscountAmount = quote.items.reduce((sum, item) => {
        const itemDiscount = (item.listprice * item.quantity) * (item.discount_percent / 100);
        return sum + itemDiscount;
    }, 0);

    // Formateo de moneda
    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('es-PA', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    // Formateo de fecha
    const formatDate = (dateString: string | null): string => {
        if (!dateString) return '-';
        return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
    };

    // Acciones
    const handleEditQuote = () => {
        setEditingQuote(quote);
        setIsEditDialogOpen(true);
    };
    const handleDeleteQuote = async () => {
        try {
            await deleteQuoteMutation.mutateAsync(quote.quoteid);
            navigate('/dashboard/quotes');
            toast.success('Cotización eliminada exitosamente');
        } catch (error) {
            console.error('Error al eliminar cotización:', error);
            toast.error('Error al eliminar la cotización');
        }
    };
    const handleDeleteClick = () => {
        showConfirm({
            title: "¿Eliminar cotización?",
            description: `¿Estás seguro de eliminar la cotización "${quote.subject}"? Esta acción no se puede deshacer.`,
            confirmLabel: "Eliminar",
            cancelLabel: "Cancelar",
            onConfirm: handleDeleteQuote,
        });
    };

    const handleDownloadPDF = async () => {
        try {
            await downloadPDFMutation.mutateAsync(quote.quoteid);
            // toast.success('PDF descargado exitosamente');
        } catch (error) {
            console.error('Error al descargar PDF:', error);
            // toast.error('Error al descargar el PDF');
        }
    };

    const handlePreviewPDF = async () => {
        try {
            await previewPDFMutation.mutateAsync(quote.quoteid);
            // toast.success('Abriendo PDF...');
        } catch (error) {
            console.error('Error al previsualizar PDF:', error);
            // toast.error('Error al abrir el PDF');
        }
    };

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-background">
                <div className="container mx-auto p-6">
                    {/* Header con información clave */}
                    <div className="grid grid-cols-1 gap-6 mb-6">
                        {/* Información principal */}
                        <div className="space-y-4">
                            <h1 className="text-3xl font-bold text-foreground line-clamp-1">
                                {quote.subject}
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Cotización #{quote.quoteno}
                            </p>
                            {/* Acciones y estado */}
                            <div className="flex flex-col sm:items-end gap-4">
                                <div className="flex items-center gap-3">
                                    <QuoteStatusBadge stage={quote.quote_stage} />

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(-1)}
                                        className="gap-2"
                                    >
                                        ← Volver
                                    </Button>
                                </div>
                            </div>

                            {/* Información lateral */}
                            <div className="space-y-4">
                                {quote.account_name && (
                                    <div className="flex items-start gap-3 bg-card rounded-lg p-4 border border-border">
                                        <Building2 className="h-6 w-6 text-muted-foreground mt-1" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                                            <p className="text-lg font-semibold">{quote.account_name}</p>
                                        </div>
                                    </div>
                                )}

                                {quote.assigned_user_name && (
                                    <div className="flex items-start gap-3 bg-card rounded-lg p-4 border border-border">
                                        <Users className="h-6 w-6 text-muted-foreground mt-1" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Asignado a</p>
                                            <p className="text-lg font-semibold">{quote.assigned_user_name}</p>
                                        </div>
                                    </div>
                                )}

                                {quote.validtill && (
                                    <div className="flex items-start gap-3 bg-card rounded-lg p-4 border border-border">
                                        <Calendar className="h-6 w-6 text-muted-foreground mt-1" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Válida hasta</p>
                                            <p className="text-lg font-semibold">{formatDate(quote.validtill)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Panel financiero - estilo de tu ejemplo */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">Subtotal</div>
                                    <div className="text-2xl font-bold">{formatCurrency(quote.subtotal)}</div>
                                </div>

                                {/* Descuento total de todos los productos */}
                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">Descuento</div>
                                    <div className="text-2xl font-bold text-destructive">
                                        {totalDiscountAmount > 0
                                            ? `-${formatCurrency(totalDiscountAmount)}`
                                            : '-'}
                                    </div>
                                </div>

                                {/* ITBMS */}
                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">ITBMS</div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {formatCurrency(itbms)}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">Total</div>
                                    <div className="text-4xl font-bold text-primary">
                                        {formatCurrency(quote.total)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contenido principal */}
                    <div className="grid grid-cols-1 gap-6">
                        {/* Columna izquierda: Descripción y ítems */}
                        <div className="space-y-6">
                            {/* Descripción general */}
                            <div className="bg-card rounded-lg border border-border p-6">
                                <h2 className="text-2xl font-bold mb-4">Descripción general</h2>
                                <ExpandableText
                                    text={quote.description || ''}
                                    maxLines={3}
                                    className="text-lg"
                                    expandedClassName="text-lg whitespace-pre-line"
                                />
                            </div>

                            {/* Ítems de la cotización - CON PADDING CONSISTENTE */}
                            {/* Ítems de la cotización - ESPACIADO MEJORADO */}
                            <div className="bg-card rounded-lg border border-border p-6 overflow-hidden">
                                <div className="p-4 border-b border-border bg-muted/30">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-bold flex items-center gap-2">
                                            <Package className="h-6 w-6" />
                                            Ítems de la cotización
                                        </h2>
                                        <span className="text-lg text-muted-foreground">
                                            {quote.items.length} ítem{quote.items.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    {/* ✅ Mobile: Layout vertical (responsive) */}
                                    <div className="sm:hidden">
                                        {quote.items.map((item, index) => (
                                            <div key={index} className="border-b last:border-b-0 hover:bg-muted/50 p-4">
                                                <div className="font-semibold text-lg mb-2">{item.productname}</div>
                                                {item.description && (
                                                    <div className="mt-2">
                                                        <ExpandableText
                                                            text={item.description}
                                                            maxLines={2}
                                                            className="text-muted-foreground"
                                                            expandedClassName="text-muted-foreground whitespace-pre-line"
                                                        />
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-2 gap-4 mt-3">
                                                    <div>
                                                        <div className="text-muted-foreground">Cantidad</div>
                                                        <div className="font-medium">{item.quantity}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-muted-foreground">Precio</div>
                                                        <div className="font-medium">{formatCurrency(item.listprice)}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-muted-foreground">Descuento</div>
                                                        <div className="font-medium text-destructive">
                                                            {item.discount_percent > 0 ? `-${item.discount_percent}%` : '-'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-muted-foreground">Total</div>
                                                        <div className="font-medium">{formatCurrency(item.total)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* ✅ Desktop: Layout tabular */}
                                    <div className="hidden sm:block">
                                        <table className="w-full table-fixed">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="py-4 text-left font-semibold text-lg w-1/2">Producto</th>
                                                    <th className="py-4 text-left font-semibold text-lg w-1/8">Cantidad</th>
                                                    <th className="py-4 text-left font-semibold text-lg w-1/8">Precio</th>
                                                    <th className="py-4 text-left font-semibold text-lg w-1/8">Descuento</th>
                                                    <th className="py-4 text-left font-semibold text-lg w-1/8">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {quote.items.map((item, index) => (
                                                    <tr key={index} className="border-b last:border-b-0 hover:bg-muted/50">
                                                        <td className="py-5 pr-4">
                                                            <div className="font-semibold text-lg truncate">{item.productname}</div>
                                                            {item.description && (
                                                                <div className="mt-3">
                                                                    <ExpandableText
                                                                        text={item.description}
                                                                        maxLines={2}
                                                                        className="text-muted-foreground"
                                                                        expandedClassName="text-muted-foreground whitespace-pre-line"
                                                                    />
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-5 min-w-[60px]">
                                                            <div className="text-lg font-medium text-right">{item.quantity}</div>
                                                        </td>
                                                        <td className="py-5 min-w-[100px]">
                                                            <div className="text-lg font-medium text-right">{formatCurrency(item.listprice)}</div>
                                                        </td>
                                                        <td className="py-5 min-w-[100px]">
                                                            <div className="text-lg font-medium text-right text-destructive">
                                                                {item.discount_percent > 0 ? `-${item.discount_percent}%` : '-'}
                                                            </div>
                                                        </td>
                                                        <td className="py-5 min-w-[120px]">
                                                            <div className="text-lg font-medium text-right">{formatCurrency(item.total)}</div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="flex gap-3 mb-6">
                        <Button
                            variant="outline"
                            onClick={handlePreviewPDF}
                            disabled={downloadPDFMutation.isPending}
                            className="gap-2"
                        >
                            <FileTextIcon className="h-5 w-5" />
                            Previsualizar PDF
                        </Button>
                        <Button
                            onClick={handleDownloadPDF}
                            disabled={downloadPDFMutation.isPending}
                            className="gap-2"
                        >
                            <DownloadIcon className="h-5 w-5" />
                            Descargar PDF
                        </Button>
                    </div>




                    {/* Acciones */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <Button
                            variant="outline"
                            className="flex-1 gap-2 text-lg py-6"
                            onClick={() => setIsCreateProjectDialogOpen(true)}
                        >
                            <Folder className="h-6 w-6" />
                            Crear Proyecto
                        </Button>
                        <Button
                            className="flex-1 gap-2 text-lg py-6"
                            onClick={handleEditQuote}
                        >
                            <Pencil className="h-6 w-6" />
                            Editar cotización
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1 gap-2 text-lg py-6"
                            onClick={handleDeleteClick}
                        >
                            <Trash2 className="h-6 w-6" />
                            Eliminar
                        </Button>
                    </div>
                </div>

                {/* Diálogo de edición */}
                {editingQuote && (
                    <QuoteFormDialog
                        open={isEditDialogOpen}
                        onOpenChange={setIsEditDialogOpen}
                        onSubmit={async (data) => {
                            console.log('🚀 onSubmit llamado con:', data);
                            console.log('ID a actualizar:', editingQuote.quoteid);

                            try {
                                console.log('⏳ Enviando petición al backend...');

                                await updateQuoteMutation.mutateAsync({
                                    id: editingQuote.quoteid,
                                    data
                                });

                                console.log('✅ Cotización actualizada exitosamente');

                                // Cerrar diálogo y actualizar datos
                                setIsEditDialogOpen(false);
                                setEditingQuote(null);
                                refetch();
                            } catch (error) {
                                console.error('❌ Error al actualizar cotización:', error);
                            }
                        }}
                        mode="edit"
                        initialData={editingQuote}
                    />
                )}

                {/* Diálogo para crear proyecto */}
                <ProjectFormDialog
                    open={isCreateProjectDialogOpen}
                    onOpenChange={setIsCreateProjectDialogOpen}
                    quoteId={quote?.quoteid} // 
                    onSuccess={() => {
                       
                        toast.success("Proyecto creado exitosamente");
                    }}
                />
            </div>
        </ErrorBoundary>
    );
};

export default QuoteDetailPage;