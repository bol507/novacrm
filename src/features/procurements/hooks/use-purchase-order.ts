import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { procurementService } from '../services/procurement-service';
import type { GeneratePOFromQuotePayload, RecordReceiptParams, RecordReceiptResponse, UpdatePOStatusPayload, UpdatePOStatusResponse } from '../types/procurement';
import type { AxiosResponse } from 'axios';
import { useState } from 'react';

export const usePurchaseOrders = {
  list: (projectId: number, params?: { status?: string; vendor_id?: number }) => {
    return useQuery({
      queryKey: ['procurement', 'purchase-orders', projectId, params],
      queryFn: () => procurementService.listPOs(projectId, params).then(res => res.data),
      enabled: !!projectId,
      staleTime: 1 * 60 * 1000,
    });
  },

  get: (projectId: number, poId: number) => {
    return useQuery({
      queryKey: ['procurement', 'purchase-order', poId],
      queryFn: () => procurementService.getPO(projectId, poId).then(res => res.data),
      enabled: !!projectId && !!poId,
      staleTime: 30 * 1000,
    });
  },

  createFromQuote: (projectId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: GeneratePOFromQuotePayload) =>
        procurementService.createPOFromQuote(projectId, payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['procurement', 'purchase-orders', projectId] });
        queryClient.invalidateQueries({ queryKey: ['procurement', 'vendor-quote'] });
      },
    });
  },

  updateStatus: () => {
    const queryClient = useQueryClient();
    return useMutation<AxiosResponse<UpdatePOStatusResponse>, Error, UpdatePOStatusPayload>({
      mutationFn: (payload) => procurementService.updatePOStatus(payload),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['procurement', 'purchase-order', variables.poId] });
        queryClient.invalidateQueries({ queryKey: ['procurement', 'purchase-orders'] });
      },
    });
  },

  recordReceipt: () => {
    const queryClient = useQueryClient();

    return useMutation<AxiosResponse<RecordReceiptResponse>, Error, RecordReceiptParams>({
      mutationFn: (params) => procurementService.recordReceipt(params),

      onSuccess: (_, variables) => {
        queryClient.refetchQueries({
          queryKey: ['procurement', 'purchase-order', variables.poId],
          exact: true,
        });
      },


    });
  },

  downloadPdf: () => {
    const [isDownloading, setIsDownloading] = useState(false);

    const download = async ( poId: number) => {
      setIsDownloading(true);
      try {
        await procurementService.downloadPOPdf( poId);
        // ... lógica de descarga ...
        //toast.success('PDF descargado');
      } catch (error) {
        //toast.error('Error al descargar PDF');
      } finally {
        setIsDownloading(false);
      }
    };

    return { download, isDownloading };
  },
};