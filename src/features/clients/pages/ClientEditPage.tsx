import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientForm } from '../components/ClientForm';
import type { ClientFormData } from '../types/client';
import { useClient } from '../hooks/use-client';
import { useUpdateClient } from '../hooks/use-update-client';

/**
 * Page component for editing an existing client.
 *
 * Fetches the client data by ID from the URL parameters, displays a form
 * pre-populated with the client's current information, and handles form
 * submission to update the client. Shows loading and error states while
 * fetching data, and navigates back to the clients list on success or cancel.
 *
 * @component
 * @returns The rendered client edit page
 *
 * @example
 * // Route configuration
 * <Route path="/dashboard/clients/:id/edit" element={<ClientEditPage />} />
 *
 * @example
 * // Navigate to edit page
 * navigate(`/dashboard/clients/${clientId}/edit`);
 */
export const ClientEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: client, isLoading: isLoadingClient, error } = useClient(
    id ? parseInt(id) : null
  );
  const updateClientMutation = useUpdateClient();

  /**
   * Handles form submission to update the client.
   *
   * Converts boolean fields to string values expected by Vtiger API
   * ('1' for true, '0' for false) and sends the update request.
   * On success, shows a success toast and navigates to the clients list.
   * On error, displays an error toast with the server response message.
   *
   * @param data - Form data containing client information
   */
  const handleSubmit = async (data: ClientFormData) => {
    if (!id) {
      toast.error('Invalid client ID');
      return;
    }

    try {
      const payload = {
        ...data,
        emailoptout: data.emailoptout ? '1' : '0',
        notify_owner: data.notify_owner ? '1' : '0',
        isconvertedfromlead: data.isconvertedfromlead ? '1' : '0',
      };

      await updateClientMutation.mutateAsync({
        id: parseInt(id),
        data: payload,
      });
      
      toast.success('Client updated successfully');
      navigate('/dashboard/clients');
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || 'Error updating client'
      );
    }
  };

  /**
   * Handles cancellation of the edit operation.
   * Navigates back to the clients list without saving changes.
   */
  const handleCancel = () => {
    navigate('/dashboard/clients');
  };

  if (isLoadingClient) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {error?.message || 'Client not found'}
            </p>
            <Button variant="outline" onClick={() => navigate('/dashboard/clients')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard/clients')}
          className="h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Edit Client
          </h1>
          <p className="text-muted-foreground">
            {client.accountname} ({client.account_no})
          </p>
        </div>
      </div>

      <ClientForm
        initialData={client}
        mode="edit"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={updateClientMutation.isPending}
      />
    </div>
  );
};

export default ClientEditPage;