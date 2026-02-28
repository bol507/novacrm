import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attachmentService } from '../services/attachmentService';
import { toast } from 'sonner';

export const useUploadAttachment = (module: string, recordId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      file, 
      description 
    }: { 
      file: File; 
      description?: string 
    }) =>
      attachmentService.uploadAttachment(module, recordId, file, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', module, recordId] });
      toast.success('Archivo subido exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al subir archivo');
    },
  });
};