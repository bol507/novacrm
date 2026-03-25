import { useEffect, useMemo, useState } from "react";

import { opportunityService } from "../services/opportunityService";
import type { Opportunity, OpportunityViewMode } from "../types/opportunity";
import { useOpportunities } from "../hooks/useOpportunities";
import { toast } from "sonner";
import { useConfirm } from "@/components/confirm-dialog";
import { useSearchParams, useNavigate } from "react-router-dom";
import { usePagination } from "@/shared/hooks/use-pagination";
import { OpportunityView } from "../components/OpportunityView";

/**
 * OpportunitiesPage component for managing sales opportunities.
 *
 * Features:
 * - Displays paginated list of opportunities with search functionality
 * - Supports card and table view modes (persisted in localStorage)
 * - Filter opportunities by client ID via URL query parameter
 * - Create, view, edit, and delete opportunity operations
 * - Confirmation dialog for delete actions
 * - Clear client filter button when filtering by client
 * - Responsive layout with proper loading and error states
 *
 * @component
 * @returns The rendered opportunities management page
 *
 * @example
 * // Route configuration
 * <Route path="/dashboard/opportunities" element={<OpportunitiesPage />} />
 *
 * @example
 * // Navigate with client filter
 * navigate('/dashboard/opportunities?clientId=123');
 */
const OpportunitiesPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { page, setPage, searchTerm, setSearchTerm } = usePagination();
  const [viewMode, setViewMode] = useState<OpportunityViewMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("opportunitiesViewMode") as OpportunityViewMode) || "cards";
    }
    return "cards";
  });

  // Persist view mode preference to localStorage
  useMemo(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("opportunitiesViewMode", viewMode);
    }
  }, [viewMode]);

  const clientId = searchParams.get('clientId');
  const clientIdNumber = clientId ? parseInt(clientId, 10) : null;

  const { data, isLoading, error, refetch } = useOpportunities(
    page,
    20,
    searchTerm,
    clientIdNumber ? { clientId: clientIdNumber } : undefined
  );
  const showConfirm = useConfirm();
 
  // Reset to first page when search term or client filter changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, clientId, setPage]);

  const filteredOpportunities = data?.data || [];
  const totalPages = data?.meta?.last_page || 1;
  const totalItems = data?.meta?.total || 0;

  /**
   * Navigates to the opportunity creation page.
   */
  const handleCreateClick = () => {
    navigate('/dashboard/opportunities/new');
  };

  /**
   * Navigates to the opportunity detail page.
   *
   * @param opportunity - The opportunity to view
   */
  const handleViewOpportunity = (opportunity: Opportunity) => {
    navigate(`/dashboard/opportunities/${opportunity.potentialid}`);
  };

  /**
   * Navigates to the opportunity edit page.
   *
   * @param opportunity - The opportunity to edit
   */
  const handleEditOpportunityClick = (opportunity: Opportunity) => {
    navigate(`/dashboard/opportunities/${opportunity.potentialid}/edit`);
  };

  /**
   * Handles opportunity deletion with confirmation dialog.
   * Shows success or error toast based on the result and refreshes the list.
   *
   * @param opportunity - The opportunity to delete
   */
  const handleDeleteOpportunity = (opportunity: Opportunity) => {
    showConfirm({
      title: "Delete Opportunity",
      description: `Are you sure you want to delete the opportunity "${opportunity.potentialname}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          await opportunityService.deleteOpportunity(opportunity.potentialid);
          toast.success("Opportunity deleted successfully");
          refetch();
        } catch (error: any) {
          toast.error(error.response?.data?.error || "Error deleting opportunity");
        }
      },
    });
  };

  /**
   * Clears the client filter from the URL query parameters.
   */
  const handleClearClientFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('clientId');
    navigate(`?${newParams.toString()}`, { replace: true });
    setPage(1);
  };

  /**
   * Handles view mode changes (cards/table).
   *
   * @param mode - The new view mode
   */
  const handleViewModeChange = (mode: OpportunityViewMode) => {
    setViewMode(mode);
  };

  return (
    <OpportunityView
      opportunities={filteredOpportunities}
      isLoading={isLoading}
      error={error}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      onCreateClick={handleCreateClick}
      onViewModeChange={handleViewModeChange}
      onRefresh={refetch}
      onView={handleViewOpportunity}
      onEdit={handleEditOpportunityClick}
      onDelete={handleDeleteOpportunity}
      viewMode={viewMode}
      page={page}
      totalPages={totalPages}
      totalItems={totalItems}
      onPageChange={setPage}
      opportunityCount={totalItems}
      clientIdNumber={clientIdNumber}
      handleClearClientFilter={handleClearClientFilter}
    />
  );
};

export default OpportunitiesPage;