import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attachmentService } from '../services/attachmentService';
import { toast } from 'sonner';

export const useDeleteAttachment = (module: string, recordId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachmentId: number) => attachmentService.deleteAttachment(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', module, recordId] });
      toast.success('Archivo eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al eliminar archivo');
    },
  });
};