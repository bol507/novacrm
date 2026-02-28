import { useQuery } from '@tanstack/react-query';
import { attachmentService } from '../services/attachmentService';

export const useAttachments = (module: string, recordId: number) => {
  return useQuery({
    queryKey: ['attachments', module, recordId],
    queryFn: () => attachmentService.getAttachments(module, recordId),
    staleTime: 5 * 60 * 1000, 
  });
};