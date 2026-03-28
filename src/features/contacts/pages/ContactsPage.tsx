import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Building2, X, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

import { useContacts } from '../hooks/use-contacts';
import { useDeleteContact } from '../hooks/use-delete-contact';
import type { Contact, ContactViewMode } from '../types/contact';
import { ContactCards } from '../components/ContactCards';
import ContactTable from '../components/ContactTable';
import { usePagination } from '@/shared/hooks/use-pagination';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useConfirm } from '@/components/confirm-dialog';
import ListFooter from '@/components/ListFooter';

/**
 * ContactsPage component for managing contact records.
 *
 * Features:
 * - Displays paginated list of contacts with search functionality
 * - Filter contacts by account ID via URL query parameter
 * - Create, edit, view, and delete contact operations via pages
 * - Confirmation dialog for delete actions
 * - Clear account filter button when filtering by account
 * - Card and table view modes (persisted in localStorage)
 * - Responsive layout with proper loading and error states
 *
 * @component
 * @returns The rendered contacts management page
 *
 * @example
 * // Route configuration
 * <Route path="/dashboard/contacts" element={<ContactsPage />} />
 *
 * @example
 * // Navigate with account filter
 * navigate('/dashboard/contacts?accountId=123');
 */
const ContactsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { page, setPage, searchTerm, setSearchTerm } = usePagination();

  const [viewMode, setViewMode] = useState<ContactViewMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('contactsViewMode') as ContactViewMode) || 'cards';
    }
    return 'cards';
  });

  const accountId = searchParams.get('accountId');
  const accountIdNumber = accountId ? parseInt(accountId, 10) : null;

  const { data, isLoading, error } = useContacts(
    page,
    20,
    searchTerm,
    accountIdNumber ? { accountId: accountIdNumber } : undefined
  );

  const deleteContactMutation = useDeleteContact();
  const showConfirm = useConfirm();

  // Reset to first page when search term or account filter changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, accountId]);

  // Persist view mode preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('contactsViewMode', viewMode);
    }
  }, [viewMode]);

  const contacts = data?.data || [];
  const totalPages = data?.meta?.last_page || 1;
  const totalItems = data?.meta?.total || 0;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Error loading contacts: {error.message}</p>
        </div>
      </div>
    );
  }

  /**
   * Handles view mode changes (cards/table) and resets pagination.
   *
   * @param mode - The new view mode
   */
  const handleViewModeChange = (mode: ContactViewMode) => {
    setViewMode(mode);
    setPage(1);
  };

  /**
   * Navigates to the contact creation page.
   */
  const handleCreateClick = () => {
    navigate('/dashboard/contacts/create');
  };

  /**
   * Navigates to the contact detail page.
   *
   * @param contact - The contact to view
   */
  const handleViewContact = (contact: Contact) => {
    navigate(`/dashboard/contacts/${contact.contactid}`);
  };

  /**
   * Navigates to the contact edit page.
   *
   * @param contact - The contact to edit
   */
  const handleEditContact = (contact: Contact) => {
    navigate(`/dashboard/contacts/${contact.contactid}/edit`);
  };

  /**
   * Handles contact deletion.
   *
   * @param contact - The contact to delete
   */
  const handleDeleteContact = async (contact: Contact) => {
    try {
      await deleteContactMutation.mutateAsync(contact.contactid);
      toast.success('Contact deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error deleting contact');
    }
  };

  /**
   * Clears the account filter from the URL query parameters.
   */
  const handleClearAccountFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('accountId');
    navigate(`?${newParams.toString()}`, { replace: true });
    setPage(1);
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
            <p className="text-muted-foreground">
              Manage the people who work with your clients
            </p>
            {accountIdNumber && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-sm font-normal">
                  <Building2 className="h-3 w-3 mr-1" />
                  Client ID: {accountIdNumber}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAccountFilter}
                  className="h-6 px-2 text-xs hover:bg-muted"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear filter
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Toggle Cards/Table */}
            <div className="flex rounded-md border border-border overflow-hidden">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => handleViewModeChange('cards')}
                className="rounded-none border-r border-border"
                title="Card view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => handleViewModeChange('table')}
                className="rounded-none"
                title="Table view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              className="gap-2"
              onClick={handleCreateClick}
            >
              <Plus className="h-4 w-4" />
              New Contact
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

        {/* Contacts list based on view mode */}
        {viewMode === 'cards' ? (
          <ContactCards
            contacts={contacts}
            isLoading={isLoading}
            onEditContact={handleEditContact}
            onDeleteContact={(contact) => {
              showConfirm({
                title: "Delete Contact?",
                description: `Are you sure you want to delete "${contact.firstname} ${contact.lastname}"? This action cannot be undone.`,
                confirmLabel: "Delete",
                cancelLabel: "Cancel",
                onConfirm: () => handleDeleteContact(contact),
              });
            }}
            showAccountLink={!accountIdNumber}
          />
        ) : (
          <ContactTable
            contacts={contacts}
            isLoading={isLoading}
            onView={handleViewContact}
            onEdit={handleEditContact}
            onDelete={(contact) => {
              showConfirm({
                title: "Delete Contact?",
                description: `Are you sure you want to delete "${contact.firstname} ${contact.lastname}"? This action cannot be undone.`,
                confirmLabel: "Delete",
                cancelLabel: "Cancel",
                onConfirm: () => handleDeleteContact(contact),
              });
            }}
            showAccountLink={!accountIdNumber}
          />
        )}

        {/* Footer */}
        <ListFooter
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          displayedItems={contacts.length}
          onPageChange={setPage}
          isLoading={isLoading}
          entityLabel="contacts"
          className="mt-6"
        />
      </div>
    </ErrorBoundary>
  );
};

export default ContactsPage;