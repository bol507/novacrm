import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuoteFormContent } from '../components/QuoteFormContent';
import { useUpdateQuote } from '../hooks/useUpdateQuote';
import { useQuoteDetail } from '../hooks/useQuoteDetail';
import { toast } from 'sonner';
import type { QuoteFormData } from '../types/quote';

/**
 * QuoteEditPage component for editing an existing quote.
 *
 * Fetches the quote data by ID from the URL parameters, displays a form
 * pre-populated with the quote's current information, and handles form
 * submission to update the quote. Shows loading and error states while
 * fetching data, and navigates back on success or cancel.
 *
 * @component
 * @returns The rendered quote edit page
 *
 * @example
 * // Route configuration
 * <Route path="/dashboard/quotes/:quoteId/edit" element={<QuoteEditPage />} />
 *
 * @example
 * // Navigate to edit page
 * navigate(`/dashboard/quotes/${quoteId}/edit`);
 */
export const QuoteEditPage = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();

  if (!quoteId) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Invalid quote ID</p>
        <Button variant="outline" onClick={() => navigate('/dashboard/quotes')}>
          Back to quotes
        </Button>
      </div>
    );
  }
  
  const { data: quote, isLoading: quoteLoading, error: quoteError } = useQuoteDetail(quoteId);
  const updateQuoteMutation = useUpdateQuote();

  /**
   * Handles form submission to update the quote.
   * On success, shows a success toast and navigates to the quote detail page.
   * On error, displays an error toast.
   *
   * @param values - Form data containing the updated quote information
   */
  const handleSubmit = async (values: QuoteFormData) => {
    try {
      await updateQuoteMutation.mutateAsync({
        id: parseInt(quoteId), 
        data: values
      });
      toast.success('Quote updated successfully');
      navigate(`/dashboard/quotes/${quoteId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error updating quote');
      throw error;
    }
  };

  /**
   * Handles cancellation of the edit operation.
   * If a mutation is in progress, shows a warning and prevents navigation.
   * Otherwise, navigates back to the previous page.
   */
  const handleCancel = () => {
    if (updateQuoteMutation.isPending) {
      toast.warning('Please wait for the current operation to complete');
      return;
    }
    navigate(-1);
  };

  if (quoteLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin text-2xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (quoteError || !quote) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Error loading quote</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleCancel}
          disabled={updateQuoteMutation.isPending}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Quote</h1>
          <p className="text-muted-foreground">
            #{quote.quoteno} • {quote.subject}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quote details</CardTitle>
        </CardHeader>
        <CardContent>
          <QuoteFormContent
            mode="edit"
            initialData={quote}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={updateQuoteMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default QuoteEditPage;