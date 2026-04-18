import { useMutation } from '@tanstack/react-query';
import { quoteService } from '../services/quoteService';
import { toast } from 'sonner';

export interface DownloadPDFVariables {
  /** ID of the quote to download */
  quoteId: number;
  /** Quote number used for filename (e.g., "C-2026-00002") */
  quoteNo: string;
}

/**
 * Hook for downloading a quote as a PDF file.
 *
 * Provides mutation function to download a PDF version of a quote.
 * On success, creates a Blob from the response, triggers browser download
 * with the quote number as filename, and shows a success toast.
 * On error, displays an error toast with the quote number.
 *
 * @returns Mutation object with mutate function, loading state, and error state
 *
 * @example
 * // Basic usage
 * const downloadPDF = useDownloadPDF();
 *
 * const handleDownload = (quoteId: number, quoteNo: string) => {
 *   downloadPDF.mutate({ quoteId, quoteNo });
 * };
 *
 * @example
 * // With loading state
 * const downloadPDF = useDownloadPDF();
 *
 * <Button
 *   onClick={() => downloadPDF.mutate({ quoteId, quoteNo })}
 *   disabled={downloadPDF.isPending}
 * >
 *   {downloadPDF.isPending ? 'Downloading...' : 'Download PDF'}
 * </Button>
 */
export const useDownloadPDF = () => {
  return useMutation<Blob, Error, DownloadPDFVariables>({
    mutationFn: async ({ quoteId }: DownloadPDFVariables) => {
      return await quoteService.downloadPDF(quoteId);
    },
    onSuccess: (data: Blob, variables: DownloadPDFVariables) => {
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Quote_${variables.quoteNo}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded successfully');
    },
    onError: (_error: any, variables: DownloadPDFVariables) => {
      toast.error(`Error downloading quote ${variables.quoteNo}`);
    },
  });
};

/**
 * Hook for previewing a quote as a PDF.
 *
 * Provides mutation function to fetch a PDF version of a quote for preview.
 * The preview can be displayed in an iframe or new window.
 *
 * @returns Mutation object with mutate function, loading state, and error state
 *
 * @example
 * // Basic usage
 * const previewPDF = usePreviewPDF();
 *
 * const handlePreview = async (quoteId: number) => {
 *   const blob = await previewPDF.mutateAsync(quoteId);
 *   const url = URL.createObjectURL(blob);
 *   window.open(url, '_blank');
 * };
 *
 * @example
 * // With loading state
 * const previewPDF = usePreviewPDF();
 *
 * <Button
 *   onClick={() => previewPDF.mutate(quoteId)}
 *   disabled={previewPDF.isPending}
 * >
 *   {previewPDF.isPending ? 'Loading...' : 'Preview'}
 * </Button>
 */
export const usePreviewPDF = () => {
  return useMutation({
    mutationFn: (quoteId: number) => quoteService.previewPDF(quoteId),
    onError: (error: any) => {
      console.error('Error previewing PDF:', error);
    }
  });
};