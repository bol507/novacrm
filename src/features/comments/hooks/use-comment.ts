import { commentService } from '@/features/comments/services/commentService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useComments = (module: string, relatedId: number) => {
  return useQuery({
    queryKey: ['comments', module, relatedId],
    queryFn: () => commentService.getComments(module, relatedId),
    staleTime: 2 * 60 * 1000, 
  });
};

export const useCreateComment = (module: string, relatedId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { commentcontent: string; parent_commentid?: number }) => 
      commentService.createComment(module, relatedId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', module, relatedId] });
      toast.success('Comentario agregado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al agregar comentario');
    },
  });
};