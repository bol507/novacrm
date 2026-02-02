import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClients } from "@/features/clients/hooks/use-clients";
import { Search, Plus } from "lucide-react";
import ClientDetailDialog from "../components/ClientDetailDialog";
import type { Client } from "@/features/clients/types/client";
import { toast } from "sonner";
import { clientService } from "@/features/clients/services/client-service";
import ClientFormDialog from "../components/ClientFormDialog";
import { ClientCards } from "@/features/clients/components/ClientCards";

const ClientsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useClients(page, 20, searchTerm);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const filteredClients = data?.data || [];

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Error al cargar clientes: {error.message}</p>
        </div>
      </div>
    );
  }

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
  };

  const handleCreateClient = async (clientData: any) => {
    try {
      await clientService.createClient(clientData);
      await refetch();
      toast
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
  };

  const handleUpdateClient = async (data: any) => {
  try {
    await clientService.updateClient(editingClient!.accountid, data);
    setEditingClient(null);
    toast.success("Cliente actualizado exitosamente");
    refetch(); // Recargar lista
  } catch (error) {
    toast.error("Error al actualizar el cliente");
  }
};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona tu cartera de clientes
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Grid*/}
      <ClientCards
        clients={filteredClients}
        isLoading={isLoading}
        onClientClick={handleClientClick}
        onEditClient={handleEditClient}
      />

      {/* Footer info */}
      {!isLoading && data && (
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredClients.length} de {data.meta.total} clientes
        </div>
      )}

      {/* Dialog de detalle */}
      <ClientDetailDialog
        client={selectedClient}
        open={!!selectedClient}
        onOpenChange={(open) => {
          if (!open) setSelectedClient(null);
        }}
      />

      {/*  Diálogo de creación */}
      <ClientFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateClient}
      />

      {editingClient && (
        <ClientFormDialog
          open={true}
          onOpenChange={() => setEditingClient(null)}
          onSubmit={handleUpdateClient}
          mode="edit"
          initialData={editingClient}
        />
      )}

    </div>
  );
};

export default ClientsPage;