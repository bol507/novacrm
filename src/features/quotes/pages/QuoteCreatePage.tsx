import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuoteFormContent } from '../components/QuoteFormContent';
import { useCreateQuote } from '../hooks/useCreateQuote';
import { toast } from 'sonner';
import type { QuoteFormData } from '../types/quote';

/**
 * QuoteCreatePage component for creating a new quote.
 *
 * Features:
 * - Accepts an optional clientId from URL query parameters to pre-select a client
 * - Displays a form for creating a new quote
 * - Handles form submission and navigation on success
 * - Shows loading state during submission
 * - Provides cancel functionality with warning if submission is in progress
 *
 * @component
 * @returns The rendered quote creation page
 *
 * @example
 * // Route configuration
 * <Route path="/dashboard/quotes/new" element={<QuoteCreatePage />} />
 *
 * @example
 * // Navigate with client pre-selected
 * navigate('/dashboard/quotes/new?clientId=123');
 */
export const QuoteCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createQuoteMutation = useCreateQuote();

  const clientId = searchParams.get('clientId');
  const initialClientId = clientId ? parseInt(clientId, 10) : undefined;

  /**
   * Handles form submission to create a new quote.
   * On success, shows a success toast and navigates to the quotes list.
   * On error, displays an error toast and re-throws the error for the form to handle.
   *
   * @param values - Form data for the new quote
   */
  const handleSubmit = async (values: QuoteFormData) => {
    try {
      await createQuoteMutation.mutateAsync(values);
      toast.success('Quote created successfully');
      navigate(`/dashboard/quotes`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error creating quote');
      throw error;
    }
  };

  /**
   * Handles cancellation of the create operation.
   * If a mutation is in progress, shows a warning and prevents navigation.
   * Otherwise, navigates back to the previous page.
   */
  const handleCancel = () => {
    if (createQuoteMutation.isPending) {
      toast.warning('Please wait for the current operation to complete');
      return;
    }
    navigate(-1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleCancel}
          disabled={createQuoteMutation.isPending}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Quote</h1>
          <p className="text-muted-foreground">Create a new sales quote</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quote details</CardTitle>
        </CardHeader>
        <CardContent>
          <QuoteFormContent
            mode="create"
            initialClientId={initialClientId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createQuoteMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default QuoteCreatePage;