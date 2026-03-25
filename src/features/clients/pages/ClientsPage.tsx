import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClients } from "@/features/clients/hooks/use-clients";
import { Search, Plus, LayoutGridIcon, ListIcon } from "lucide-react";
import type { Client, ClientViewMode } from "@/features/clients/types/client";
import { toast } from "sonner";
import { clientService } from "@/features/clients/services/client-service";
import { ClientCards } from "@/features/clients/components/ClientCards";
import { useNavigate } from "react-router-dom";
import ListFooter from "@/components/ListFooter";
import ClientTable from "../components/ClientTable";

const ClientsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const [viewMode, setViewMode] = useState<ClientViewMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("clientsViewMode") as ClientViewMode) || "cards";
    }
    return "cards";
  });

  const { data, isLoading, error, refetch } = useClients(page, 20, searchTerm);
  const navigate = useNavigate();
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  // ✅ Persistir preferencia de vista
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("clientsViewMode", viewMode);
    }
  }, [viewMode]);

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



  const handleCreateClick = () => {
    navigate('/dashboard/clients/new');
  };



  const handleEditClient = (client: Client) => {
    //setEditingClient(client);
    navigate(`/dashboard/clients/${client.accountid}/edit`);
  };

  const handleDeleteClient = async (client: Client) => {
    try {
      await clientService.deleteClient(client.accountid);
      toast.success("Cliente eliminado exitosamente");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar el cliente");
    }
  };


  const handleViewClient = (client: Client) => {
    navigate(`/dashboard/clients/${client.accountid}`);
  };

  const handleViewModeChange = (mode: ClientViewMode) => {
    setViewMode(mode);
    setPage(1); // Resetear página al cambiar vista
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
        <div className="flex items-center gap-2">
          {/* Toggle Cards/Table */}
          <div className="flex rounded-md border border-border overflow-hidden">
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="icon"
              onClick={() => handleViewModeChange("cards")}
              className="rounded-none border-r border-border"
              title="Vista de tarjetas"
            >
              <LayoutGridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="icon"
              onClick={() => handleViewModeChange("table")}
              className="rounded-none"
              title="Vista de tabla"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Botón Nuevo Cliente */}
          <Button className="gap-2"  onClick={handleCreateClick}>
            <Plus className="h-4 w-4" />
            Nuevo Cliente
          </Button>
        </div>
      
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

      {/* ✅ Lista de clientes según viewMode */}
      {viewMode === "cards" ? (
        <ClientCards
          clients={filteredClients}
          isLoading={isLoading}
          onView={handleViewClient}
          onEdit={handleEditClient}
          onDelete={handleDeleteClient}
        />
      ) : (
        <ClientTable
          clients={filteredClients}
          isLoading={isLoading}
          onView={handleViewClient}
          onEdit={handleEditClient}
          onDelete={handleDeleteClient}
        />
      )}

      {/* Footer info */}
      <ListFooter
        currentPage={page}
        totalPages={data?.meta?.last_page || 1}
        totalItems={data?.meta?.total || 0}
        displayedItems={filteredClients.length}
        onPageChange={setPage}
        isLoading={isLoading}
        entityLabel="clientes"
        className="mt-4"
      />

      

    </div>
  );
};

export default ClientsPage;