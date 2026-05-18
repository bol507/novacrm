import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { procurementService } from '@/features/procurements/services/procurement-service';
import type {
  CreateMaterialRequestPayload,
  ApproveRequestPayload,
  MaterialRequest,
  UpdateMaterialRequestPayload,
} from '@/features/procurements/types/procurement';
import type { ApiDataResponse } from '@/shared/types/api-response';
import { toast } from 'sonner';

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

  updateRequest: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ projectId, requestId, payload }: {
        projectId: number;
        requestId: number;
        payload: UpdateMaterialRequestPayload
      }) => procurementService.updateRequest(projectId, requestId, payload),

      onSuccess: (_, { requestId }) => {
        queryClient.invalidateQueries({ queryKey: ['procurement', 'request', requestId] });
        queryClient.invalidateQueries({ queryKey: ['procurement', 'requests'] });
        toast.success('Solicitud actualizada exitosamente');
      },

      onError: (err: any) => {
        toast.error(err?.response?.data?.error || 'Error actualizando la solicitud');
      },
    });
  },


};