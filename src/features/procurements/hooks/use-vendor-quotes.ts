// src/features/procurement/hooks/useVendorQuotes.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { procurementService } from '../services/procurement-service';
import type { CreateRFQPayload, AcceptQuotePayload } from '../types/procurement';
import { toast } from 'sonner';

export const useVendorQuotes = {
  list: (projectId: number, params?: { page?: number; limit?: number; status?: string }) => {
    return useQuery({
      queryKey: ['procurement', 'vendor-quotes', projectId, params],
      queryFn: () => procurementService.listQuotes(projectId, params).then(res => res.data),
      enabled: !!projectId,
      staleTime: 2 * 60 * 1000,
    });
  },

  listByMR: (projectId: number, mrId: number) => {
    return useQuery({
      queryKey: ['procurement', 'vendor-quotes', 'by-mr', mrId],
      queryFn: () => procurementService.listQuotesByMR(projectId, mrId).then(res => res.data.data),
      enabled: !!projectId && !!mrId,
    });
  },

  get: (projectId: number, quoteId: number) => {
    return useQuery({
      queryKey: ['procurement', 'vendor-quote', quoteId],
      queryFn: () => procurementService.getQuote(projectId, quoteId).then(res => res.data.data),
      enabled: !!projectId && !!quoteId,
      staleTime: 1 * 60 * 1000,
    });
  },

  create: (projectId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: CreateRFQPayload) =>
        procurementService.createRFQ(projectId, payload).then(res => res.data),
      onSuccess: () => {
        toast.success(`RFQ  creada exitosamente`);
        queryClient.invalidateQueries({ queryKey: ['procurement', 'vendor-quotes', Number(projectId)] });
        queryClient.invalidateQueries({ queryKey: ['procurement', 'requests', Number(projectId)] });
      },
      onError: (err) => {
        toast.error(err.message || 'Error creando RFQ');
      },
    });
  },

  accept: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ quoteId, payload }: { quoteId: number; payload: AcceptQuotePayload }) =>
        procurementService.acceptQuote(quoteId, payload).then(res => res.data),
      onSuccess: (_, { quoteId }) => {
        queryClient.invalidateQueries({ queryKey: ['procurement', 'vendor-quote', quoteId] });
        queryClient.invalidateQueries({ queryKey: ['procurement', 'vendor-quotes'] });
        queryClient.invalidateQueries({ queryKey: ['procurement', 'requests'] });
      },
    });
  },

  send: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (quoteId: number) =>
        procurementService.sendQuote(quoteId).then(res => res.data),
      onSuccess: (_, quoteId) => {
        queryClient.invalidateQueries({ queryKey: ['procurement', 'vendor-quote', quoteId] });
        queryClient.invalidateQueries({ queryKey: ['procurement', 'vendor-quotes'] });
      },
    });
  },

  negotiate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ quoteId, payload }: { quoteId: number; payload: Partial<CreateRFQPayload> }) =>
        procurementService.negotiateQuote(quoteId, payload),
      onSuccess: async (response, variables) => {
        const updatedQuote = response.data.data;
        const queryKey = ['procurement', 'vendor-quote', variables.quoteId];
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: {
              ...old.data,
              ...updatedQuote,
              status: 'negotiated',

            }
          };
        }
        );

        queryClient.invalidateQueries({ queryKey: ['procurement', 'vendor-quotes'] });
        await queryClient.refetchQueries({
          queryKey,
          exact: true,
        });
      },
      onError: (error) => {
        console.error('Negotiation failed:', error);
        // React Query mantiene el estado anterior automáticamente (rollback implícito)
      },
    });
  },
};