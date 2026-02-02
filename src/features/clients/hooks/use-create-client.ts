import { clientService } from '@/features/clients/services/client-service';
import { useMutation } from '@tanstack/react-query';


export const useCreateClient = () => {
  return useMutation({
    mutationFn: (clientData: any) => clientService.createClient(clientData),
  });
};