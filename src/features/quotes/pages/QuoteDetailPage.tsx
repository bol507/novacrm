import { useNavigate, useParams } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
import { useDuplicateQuote } from "../hooks/use-duplicate-quote";
import { toast } from "sonner";
import { useUpdateQuote } from "../hooks/useUpdateQuote";
import type { QuoteItem } from "../types/quote";

/**
 * QuoteDetailPage component for displaying detailed information about a quote.
 *
 * Features:
 * - Fetches and displays quote details by ID from URL parameters
 * - Shows loading skeleton while fetching data
 * - Displays error state with retry option on failure
 * - Shows empty state when quote not found
 * - Presents quote information in organized sections: header, info cards, financial summary, description, items table
 * - Provides PDF download and preview actions
 * - Allows edit, delete, and create project actions
 * - Handles navigation back to quotes list
 *
 * @component
 * @returns The rendered quote detail page
 *
 * @example
 * // Route configuration
 * <Route path="/dashboard/quotes/:quoteId" element={<QuoteDetailPage />} />
 *
 * @example
 * // Navigate to detail page
 * navigate(`/dashboard/quotes/${quoteId}`);
 */
const QuoteDetailPage = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const { 
    mutateAsync: duplicateQuote, 
    isPending: isDuplicating 
  } = useDuplicateQuote();
   const updateQuoteMutation = useUpdateQuote();

  if (!quoteId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Invalid Quote ID</h2>
          <p className="text-muted-foreground mb-4">Could not identify the quote to display.</p>
          <Button onClick={() => navigate('/dashboard/quotes')}>
            Back to quotes
          </Button>
        </div>
      </div>
    );
  }

  const { data: quote, isLoading, error } = useQuoteDetail(quoteId);

  const calculations = useQuoteCalculations(quote);
  const actions = useQuoteActions();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center max-w-md w-full">
          <h2 className="text-xl font-bold text-destructive mb-2">Error Loading Quote</h2>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => navigate('/dashboard/quotes')}>
            Back to quotes
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <QuoteLoadingSkeleton />;
  }

  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Quote Not Found</h2>
          <p className="text-muted-foreground mb-4">The quote you are looking for does not exist or has been deleted.</p>
          <Button onClick={() => navigate('/dashboard/quotes')}>
            Back to quotes
          </Button>
        </div>
      </div>
    );
  }

  /**
   * Navigates to the quote edit page.
   */
  const handleEditQuote = () => {
    navigate(`/dashboard/quotes/${quoteId}/edit`);
  };

  const handleCreateProject = () => {
    const params = new URLSearchParams({
      fromQuote: quote?.quoteid?.toString() ?? '',
      accountId: quote?.accountid?.toString() ?? '',
      accountName: quote?.account_name ?? '',
      subject: quote?.subject ?? '',
      description: quote?.description ?? '',
    });
    navigate(`/dashboard/projects/new?${params.toString()}`);
  };

  const handleDuplicateQuote = async () => {
    if (!quoteId) return;
    console.log(quoteId);
    try {
      const payload ={
        quoteId: parseInt(quoteId, 10),
        suffix: '(Copy)',  // Optional: ready to use suffix for the new quote
      }
      const newQuoteId = await duplicateQuote(payload);
      
      toast.success('Quote duplicated successfully');
      navigate(`/dashboard/quotes/${newQuoteId}`);
      
    } catch (error) {
      // Handle error
    }
  };

  const handleItemsReorder = async (reorderedItems: QuoteItem[]) => {
    if (!quoteId) return;
    try {
      await updateQuoteMutation.mutateAsync({
        id: parseInt(quoteId),
        data: {
          subject: quote.subject,
          quote_stage: quote.quote_stage || "Draft",
          accountid: quote.accountid,
          assigned_user_id: quote.assigned_user_id,
          validtill: quote.validtill,
          description: quote.description,
          potentialid: quote.potentialid || null,
          items: reorderedItems.map(i => ({
            productid: i.productid,
            sequence_no: i.sequence_no,
            productname: i.productname,
            quantity: i.quantity,
            listprice: i.listprice,
            discount_percent: i.discount_percent,
            description: i.description,
          }))
        }
      });
      toast.success('Items reordered successfully');
    } catch (error) {
      toast.error('Failed to reorder items');
    }
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
              accountId={quote.accountid}
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
              onReorder={handleItemsReorder} 
              readOnly={quote.quote_stage === 'Accepted'} 
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
            onCreateProject={handleCreateProject}
            onEdit={handleEditQuote}
            onDelete={() => actions.handleDeleteClick(quote)}
            isDeleting={actions.isDeleting}
            onDuplicate={handleDuplicateQuote}
            isDuplicating={isDuplicating}
          />
        </div>


      </div>
    </ErrorBoundary>
  );
};

export default QuoteDetailPage;