import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClients } from "@/features/clients/hooks/use-clients";
import { Search, Plus,  Settings,  LayoutGrid, List } from "lucide-react";
import type { Client, ClientViewMode } from "@/features/clients/types/client";
import { toast } from "sonner";
import { clientService } from "@/features/clients/services/client-service";
import { ClientCards } from "@/features/clients/components/ClientCards";
import { useNavigate } from "react-router-dom";
import ListFooter from "@/components/ListFooter";
import ClientTable from "../components/ClientTable";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem,  DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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
    <ErrorBoundary>
      <div className="space-y-4 sm:space-y-6">
        
        {/* ===== HEADER ===== */}
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Clients</h1>
            <p className="text-sm text-muted-foreground">
              Manage your client portfolio
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] sm:min-w-0 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 text-sm"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              
              {/* 🖥️ DESKTOP: Toggle Cards/Table (Oculto en móvil) */}
              <div className="hidden md:flex rounded-md border border-border overflow-hidden">
                <Button
                  variant={viewMode === "cards" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewModeChange("cards")}
                  className="rounded-none border-r border-border h-9 px-3"
                  title="Card view"
                >
                  <LayoutGrid className="h-4 w-4 mr-1" />
                  <span className="hidden lg:inline">Cards</span>
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewModeChange("table")}
                  className="rounded-none h-9 px-3"
                  title="Table view"
                >
                  <List className="h-4 w-4 mr-1" />
                  <span className="hidden lg:inline">Table</span>
                </Button>
              </div>

              {/* 📱 MOBILE: Dropdown compacto (Opcional, si prefieres botón directo, quítalo) */}
              <div className="flex md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <Settings className="h-4 w-4 mr-1" />
                      Options
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={handleCreateClick} className="text-primary font-medium">
                      <Plus className="h-4 w-4 mr-2" />
                      New Client
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* 🖥️ DESKTOP: New Client Button */}
              <Button 
                size="sm" 
                onClick={handleCreateClick} 
                className="hidden md:flex h-9 gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden lg:inline">New Client</span>
                <span className="lg:hidden">New</span>
              </Button>
            </div>
          </div>
        </div>

        {/* ===== CLIENT LIST: RESPONSIVE SWITCH ===== */}
        <div className="min-h-[200px]">
          
          {/* 📱 MOBILE: Fuerza siempre Cards/Grid (evita tabla rota) */}
          <div className="block md:hidden">
            <ClientCards
              clients={filteredClients}
              isLoading={isLoading}
              onView={handleViewClient}
              onEdit={handleEditClient}
              onDelete={handleDeleteClient}
            />
          </div>

          {/* 💻 DESKTOP: Respeta el toggle del usuario */}
          <div className="hidden md:block">
            {viewMode === "cards" ? (
              <ClientCards
                clients={filteredClients}
                isLoading={isLoading}
                onView={handleViewClient}
                onEdit={handleEditClient}
                onDelete={handleDeleteClient}
              />
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <ClientTable
                  clients={filteredClients}
                  isLoading={isLoading}
                  onView={handleViewClient}
                  onEdit={handleEditClient}
                  onDelete={handleDeleteClient}
                />
              </div>
            )}
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <ListFooter
          currentPage={page}
          totalPages={data?.meta?.last_page || 1}
          totalItems={data?.meta?.total || 0}
          displayedItems={filteredClients.length}
          onPageChange={setPage}
          isLoading={isLoading}
          entityLabel="clients"
          className="mt-4 sm:mt-6"
        />
      </div>
    </ErrorBoundary>
  );
};

export default ClientsPage;