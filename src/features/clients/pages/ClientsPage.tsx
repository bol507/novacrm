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

/**
 * ClientsPage component for managing client records.
 *
 * Features:
 * - Displays paginated list of clients with search functionality
 * - Supports card and table view modes (persisted in localStorage)
 * - Create, view, edit, and delete client operations
 * - Responsive layout with proper loading and error states
 *
 * @component
 * @returns The rendered clients management page
 *
 * @example
 * // Route configuration
 * <Route path="/dashboard/clients" element={<ClientsPage />} />
 */
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

  // Reset to first page when search term changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  // Persist view mode preference to localStorage
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
          <p className="text-destructive">Error loading clients: {error.message}</p>
        </div>
      </div>
    );
  }

  /**
   * Navigates to the client creation page.
   */
  const handleCreateClick = () => {
    navigate('/dashboard/clients/new');
  };

  /**
   * Navigates to the client edit page.
   *
   * @param client - The client to edit
   */
  const handleEditClient = (client: Client) => {
    navigate(`/dashboard/clients/${client.accountid}/edit`);
  };

  /**
   * Deletes a client and shows success/error toast.
   *
   * @param client - The client to delete
   */
  const handleDeleteClient = async (client: Client) => {
    try {
      await clientService.deleteClient(client.accountid);
      toast.success("Client deleted successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Error deleting client");
    }
  };

  /**
   * Navigates to the client detail page.
   *
   * @param client - The client to view
   */
  const handleViewClient = (client: Client) => {
    navigate(`/dashboard/clients/${client.accountid}`);
  };

  /**
   * Handles view mode changes (cards/table) and resets pagination.
   *
   * @param mode - The new view mode
   */
  const handleViewModeChange = (mode: ClientViewMode) => {
    setViewMode(mode);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground">
            Manage your client portfolio
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
              title="Card view"
            >
              <LayoutGridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="icon"
              onClick={() => handleViewModeChange("table")}
              className="rounded-none"
              title="Table view"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
          
          {/* New Client Button */}
          <Button className="gap-2" onClick={handleCreateClick}>
            <Plus className="h-4 w-4" />
            New Client
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Client list based on view mode */}
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
        entityLabel="clients"
        className="mt-4"
      />
    </div>
  );
};

export default ClientsPage;