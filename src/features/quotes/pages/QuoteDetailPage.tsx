import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Custom hooks
import { useQuoteDetail } from "../hooks/useQuoteDetail";
import { useQuoteCalculations } from "../hooks/useQuoteCalculations";
import { useQuoteActions } from "../hooks/useQuoteActions";

// Presentational components
import { QuoteLoadingSkeleton } from "../components/QuoteLoadingSkeleton";
import { QuoteHeader } from "../components/QuoteHeader";
import { QuoteInfoCards } from "../components/QuoteInfoCards";
import { QuoteFinancialSummary } from "../components/QuoteFinancialSummary";
import { QuoteDescription } from "../components/QuoteDescription";
import { QuoteItemsTable } from "../components/QuoteItemsTable";
import { QuotePdfActions } from "../components/QuotePdfActions";
import { QuoteMainActions } from "../components/QuoteMainActions";

// Dialog components (solo para crear proyecto)
import { ProjectFormDialog } from "@/features/projects/components/ProjectFormDialog";



/**
 * QuoteDetailPage Container Component
 * 
 * Orchestrates data fetching, state management, and composition of presentational components
 * for displaying quote details. Handles loading, error, and empty states.
 * 
 * @component
 * @returns {JSX.Element} Complete quote detail page
 */
const QuoteDetailPage = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  
  
  if (!quoteId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">ID de cotización no válido</h2>
          <p className="text-muted-foreground mb-4">No se pudo identificar la cotización a mostrar.</p>
          <Button onClick={() => navigate('/dashboard/quotes')}>
            Volver a cotizaciones
          </Button>
        </div>
      </div>
    );
  }

  // Data fetching
  const { data: quote, isLoading, error } = useQuoteDetail(quoteId);
  
  
  const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false);
  
  // Custom hooks
  const calculations = useQuoteCalculations(quote);
  const actions = useQuoteActions();

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center max-w-md w-full">
          <h2 className="text-xl font-bold text-destructive mb-2">Error loading quote</h2>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => navigate('/dashboard/quotes')}>
            Back to quotes
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return <QuoteLoadingSkeleton />;
  }

  // Empty state
  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Quote not found</h2>
          <p className="text-muted-foreground mb-4">The quote you are looking for does not exist or has been deleted.</p>
          <Button onClick={() => navigate('/dashboard/quotes')}>
            Back to quotes
          </Button>
        </div>
      </div>
    );
  }

  // ✅ Action handlers
  const handleEditQuote = () => {
    navigate(`/dashboard/quotes/${quoteId}/edit`);
  };

  const handleCreateProjectSuccess = () => {
    toast.success("Project created successfully");
    setIsCreateProjectDialogOpen(false);
  };



  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          {/* Header Section */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            <QuoteHeader
              subject={quote.subject}
              quoteNo={quote.quoteno}
              quoteStage={quote.quote_stage}
              onBack={() => navigate('/dashboard/quotes')}
            />

            {/* Info Cards */}
            <QuoteInfoCards
              accountName={quote.account_name}
              assignedUserName={quote.assigned_user_name}
              validUntil={quote.validtill}
              formatDate={calculations.formatDate}
            />

            {/* Financial Summary */}
            <QuoteFinancialSummary
              subtotal={quote.subtotal}
              totalDiscount={calculations.totalDiscountAmount}
              itbms={calculations.itbms}
              total={quote.total}
              formatCurrency={calculations.formatCurrency}
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 gap-6">
            {/* Description */}
            <QuoteDescription description={quote.description || ''} />

            {/* Items Table */}
            <QuoteItemsTable
              items={quote.items}
              formatCurrency={calculations.formatCurrency}
            />
          </div>

          {/* PDF Actions */}
          <QuotePdfActions
            quoteId={quote.quoteid}
            quoteNo={quote.quoteno}
            onPreview={actions.handlePreviewPDF}
            onDownload={actions.handleDownloadPDF}
            isLoading={actions.isDownloading || actions.isPreviewing}
          />

          {/* Main Actions */}
          <QuoteMainActions
            onCreateProject={() => setIsCreateProjectDialogOpen(true)}
            onEdit={handleEditQuote} 
            onDelete={() => actions.handleDeleteClick(quote)}
            isDeleting={actions.isDeleting}
          />
        </div>

        

        {/* Create Project Dialog (se mantiene) */}
        <ProjectFormDialog
          open={isCreateProjectDialogOpen}
          onOpenChange={setIsCreateProjectDialogOpen}
          quoteId={quote?.quoteid}
          onSuccess={handleCreateProjectSuccess}
        />
      </div>
    </ErrorBoundary>
  );
};

export default QuoteDetailPage;