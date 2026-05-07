import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { procurementService } from '@/features/procurements/services/procurement-service';
import type {
  CreateMaterialRequestPayload,
  ApproveRequestPayload,
  GeneratePOPayload,
  MaterialRequest,
} from '@/features/procurements/types/procurement';
import type { ApiDataResponse } from '@/shared/types/api-response';

export const useProcurement = {
  //  MATERIAL REQUESTS
  listRequests: (projectId: number, params?: { page?: number; limit?: number; status?: string }) =>
    useQuery({
      queryKey: ['procurement', 'requests', projectId, params],
      queryFn: () => procurementService.listRequests(projectId, params).then(res => res.data),
      enabled: !!projectId,
      staleTime: 5 * 60 * 1000, // 5 min
    }),

  createRequest: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({ projectId, payload }: { projectId: number; payload: CreateMaterialRequestPayload }) => {
        const backendItems = payload.items.map(item => {
          const baseItem = {
            name: item.name,
            type: item.type,
            reason: item.reason,
            qty: item.qty,
            unit: item.unit,
            priority: item.priority,
            notes: item.notes,
          };


          if (item.reason === 'other' && item.reasonOther?.trim()) {
            return {
              ...baseItem,
              reason_other: item.reasonOther.trim(),
            };
          }

          return baseItem;
        });
        const response = await procurementService.createRequest(projectId, {
          items: backendItems,
        });
        return response.data;
      },
      onSuccess: (_, { projectId }) => {
        queryClient.invalidateQueries({ queryKey: ['procurement', 'requests', projectId] });
      },
    });
  },

  getRequest: (projectId: number, requestId: number) => {
    return useQuery({
      queryKey: ['procurement', 'request', requestId],
      queryFn: () => procurementService.getRequest(projectId, requestId)
        .then(res => res.data as ApiDataResponse<MaterialRequest>),
      enabled: !!projectId && !!requestId,
      staleTime: 0,
    });
  },

  approveRequest: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ projectId, requestId, payload }: { projectId: number; requestId: number; payload: ApproveRequestPayload }) =>
        procurementService.approveRequest(projectId, requestId, payload).then(res => res.data),
      onSuccess: (_, { requestId }) => {
        queryClient.invalidateQueries({ queryKey: ['procurement', 'requests'] });
        queryClient.invalidateQueries({ queryKey: ['procurement', 'request', requestId] });
      },
    });
  },

  //  PURCHASE ORDERS
  generatePO: (projectId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: GeneratePOPayload) => procurementService.generatePO(projectId, payload).then(res => res.data),
      onSuccess: () => {
        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: ['procurement', 'requests', projectId] });
        queryClient.invalidateQueries({ queryKey: ['procurement', 'purchase-orders', projectId] });
      },
    });
  },

  listPOs: (projectId: number, params?: { page?: number; limit?: number; status?: string }) => {
    return useQuery({
      queryKey: ['procurement', 'purchase-orders', projectId, params],
      queryFn: () => procurementService.listPOs(projectId, params).then(res => res.data),
      enabled: !!projectId,
      staleTime: 2 * 60 * 1000, // 2 min
    });
  },
  
  getPO: (projectId: number, poId: number) => {
    return useQuery({
      queryKey: ['procurement', 'purchase-order', poId],
      queryFn: () => procurementService.getPO(projectId, poId).then(res => res.data.data),
      enabled: !!projectId && !!poId,
      staleTime: 1 * 60 * 1000,
    });
  },
  // list of vendors
  listVendors: (projectId: number) => {
    return useQuery({
      queryKey: ['procurement', 'vendors', projectId],
      queryFn: () => procurementService.getVendors(projectId).then(res => res.data),
      enabled: !!projectId,
      staleTime: 5 * 60 * 1000,
      retry: 1,
      select: (response) => response.data,
    });
  },

  /*recordReception: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ itemId, payload }: { itemId: number; payload: RecordReceptionPayload }) =>
        procurementService.recordReception(itemId, payload).then(res => res.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['procurement', 'purchase-orders'] });
      },
    });
  },*/
};