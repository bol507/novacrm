import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClientForm } from '../components/ClientForm';
import { useCreateClient } from '../hooks/use-create-client';
import type { ClientFormData } from '../types/client';

/**
 * ClientCreatePage component for creating a new client.
 *
 * Features:
 * - Displays a form for creating a new client
 * - Handles form submission with loading state
 * - Converts boolean fields to string values expected by Vtiger API
 * - Shows success toast and navigates to client detail on success
 * - Shows error toast on failure
 * - Provides cancel button to return to clients list
 *
 * @component
 * @returns The rendered client creation page
 *
 * @example
 * // Route configuration
 * <Route path="/dashboard/clients/new" element={<ClientCreatePage />} />
 *
 * @example
 * // Navigate to creation page
 * navigate('/dashboard/clients/new');
 */
export const ClientCreatePage = () => {
  const navigate = useNavigate();
  const createClientMutation = useCreateClient();

  /**
   * Handles form submission to create a new client.
   * Converts boolean fields to string values expected by Vtiger API.
   * On success, shows a success toast and navigates to the new client's detail page.
   * On error, displays an error toast.
   *
   * @param data - Form data containing client information
   */
  const handleSubmit = async (data: ClientFormData) => {
    try {
      const payload = {
        ...data,
        emailoptout: data.emailoptout ? '1' : '0',
        notify_owner: data.notify_owner ? '1' : '0',
        isconvertedfromlead: data.isconvertedfromlead ? '1' : '0',
      };

      const result = await createClientMutation.mutateAsync(payload);
      
      toast.success('Client created successfully');
      
      if (result?.client_id) {
        navigate(`/dashboard/clients/${result.client_id}`);
      } else {
        navigate('/dashboard/clients');
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || 'Error creating client'
      );
    }
  };

  /**
   * Handles cancellation of the create operation.
   * Navigates back to the clients list.
   */
  const handleCancel = () => {
    navigate('/dashboard/clients');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            New Client
          </h1>
          <p className="text-muted-foreground">
            Complete the new client information
          </p>
        </div>
      </div>

      <ClientForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createClientMutation.isPending}
      />
    </div>
  );
};

export default ClientCreatePage;