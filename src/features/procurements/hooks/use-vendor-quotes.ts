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
      onSuccess: (data) => {
        toast.success(`RFQ #${data.id} creada exitosamente`);
        queryClient.invalidateQueries({ queryKey: ['procurement', 'vendor-quotes', projectId] });
        queryClient.invalidateQueries({ queryKey: ['procurement', 'requests', projectId] });
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
      onSuccess: (_, { quoteId }) => {
        queryClient.invalidateQueries({ queryKey: ['procurement', 'quote', quoteId] });
        queryClient.invalidateQueries({ queryKey: ['procurement', 'vendor-quotes'] });
      },
    });
  },
};