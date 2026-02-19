import { useMutation } from '@tanstack/react-query';
import { quoteService } from '../services/quoteService';

export const useDownloadPDF = () => {
  return useMutation({
    mutationFn: (quoteId: number) => quoteService.downloadPDF(quoteId),
    onError: (error: any) => {
      console.error('Error al descargar PDF:', error);
      // Opcional: mostrar toast de error
    }
  });
};

export const usePreviewPDF = () => {
  return useMutation({
    mutationFn: (quoteId: number) => quoteService.previewPDF(quoteId),
    onError: (error: any) => {
      console.error('Error al previsualizar PDF:', error);
      // Opcional: mostrar toast de error
    }
  });
};