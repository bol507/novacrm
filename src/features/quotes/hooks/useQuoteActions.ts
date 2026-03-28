import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useConfirm } from '@/components/confirm-dialog';
import { useUpdateQuote } from '../hooks/useUpdateQuote';
import { useDeleteQuote } from '../hooks/useDeleteQuote';
import { useDownloadPDF, usePreviewPDF } from '../hooks/useDownloadPDF';
import type { Quote } from '../types/quote';

/**
 * Payload type for updating a quote
 */
export interface UpdateQuotePayload {
  id: number;
  data: any;
}

/**
 * Return type for useQuoteActions hook
 */
export interface QuoteActions {
  /** Execute quote update mutation */
  updateQuote: (payload: UpdateQuotePayload) => Promise<void>;
  /** Show confirmation and execute delete */
  handleDeleteClick: (quote: Quote) => void;
  /** Execute PDF download */
  handleDownloadPDF: (quoteId: number, quoteNo: string) => Promise<void>;
  /** Execute PDF preview */
  handlePreviewPDF: (quoteId: number) => Promise<void>;
  /** Loading states */
  isDeleting: boolean;
  isUpdating: boolean;
  isDownloading: boolean;
  isPreviewing: boolean;
}

/**
 * Custom hook for quote action handlers
 * 
 * @returns Object with action handlers and loading states
 */
export const useQuoteActions = (): QuoteActions => {
  const navigate = useNavigate();
  const showConfirm = useConfirm();
  
  const updateQuoteMutation = useUpdateQuote();
  const deleteQuoteMutation = useDeleteQuote();
  const downloadPDFMutation = useDownloadPDF();
  const previewPDFMutation = usePreviewPDF();

  /**
   * Execute quote update mutation
   * 
   * @param payload - Object with quote id and update data
   */
  const updateQuote = async (payload: UpdateQuotePayload): Promise<void> => {
    await updateQuoteMutation.mutateAsync(payload);
  };

  /**
   * Show confirmation dialog and execute delete
   * 
   * @param quote - Quote object to delete
   */
  const handleDeleteClick = (quote: Quote) => {
    showConfirm({
      title: "Delete quote?",
      description: `Are you sure you want to delete the quote "${quote.subject}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          await deleteQuoteMutation.mutateAsync(quote.quoteid);
          navigate('/dashboard/quotes');
          toast.success('Quote deleted successfully');
        } catch (error) {
          console.error('Error deleting quote:', error);
          toast.error('Error deleting quote');
        }
      },
    });
  };

  /**
   * Execute PDF download
   * 
   * @param quoteId - Quote identifier
   */
  const handleDownloadPDF = async (quoteId: number, quoteNo: string): Promise<void> => {
    try {
      const $payload = { quoteId, quoteNo };
      await downloadPDFMutation.mutateAsync($payload);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Error downloading PDF');
    }
  };

  /**
   * Execute PDF preview
   * 
   * @param quoteId - Quote identifier
   */
  const handlePreviewPDF = async (quoteId: number): Promise<void> => {
    try {
      await previewPDFMutation.mutateAsync(quoteId);
    } catch (error) {
      console.error('Error previewing PDF:', error);
      toast.error('Error opening PDF');
    }
  };

  return {
    updateQuote,              
    handleDeleteClick,
    handleDownloadPDF,
    handlePreviewPDF,
    isDeleting: deleteQuoteMutation.isPending,
    isUpdating: updateQuoteMutation.isPending,
    isDownloading: downloadPDFMutation.isPending,
    isPreviewing: previewPDFMutation.isPending,
  };
};