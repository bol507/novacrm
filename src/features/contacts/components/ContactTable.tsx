import { useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Contact } from '../types/contact';

interface ContactTableProps {
  contacts: Contact[];
  isLoading: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onView?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
  showAccountLink?: boolean;
  className?: string;
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES');
};

const ContactTableSkeleton = ({ className = '' }: { className?: string }) => (
  <div className={`space-y-3 ${className}`}>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
        <div className="h-4 bg-muted rounded w-20" />
        <div className="h-4 bg-muted rounded w-16" />
      </div>
    ))}
  </div>
);

const ContactTableCard = ({
  contact,
  onView,
  showAccountLink,
}: {
  contact: Contact;
  onView?: (contact: Contact) => void;
  showAccountLink?: boolean;
}) => (
  <div 
    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
    onClick={() => onView?.(contact)}
  >
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="font-semibold truncate">{contact.firstname} {contact.lastname}</span>
      </div>
      <div className="text-sm text-muted-foreground">
        {contact.email || 'No email'} • {contact.phone || contact.mobile || 'No phone'}
      </div>
      {showAccountLink && contact.account_name && (
        <div className="text-sm text-muted-foreground">
          {contact.account_name}
        </div>
      )}
    </div>
    <div className="flex items-center gap-3">
      <div className="text-right">
        <span className="text-xs text-muted-foreground">
          {contact.assigned_user_name || '-'}
        </span>
      </div>
    </div>
  </div>
);

export const ContactTable = ({
  contacts,
  isLoading,
  searchValue = '',
  onSearchChange,
  onView,
  onEdit,
  onDelete,
  showAccountLink = true,
  className = '',
}: ContactTableProps) => {
  const filteredContacts = useMemo(() => {
    if (!searchValue) return contacts;
    const search = searchValue.toLowerCase();
    return contacts.filter(contact => 
      contact.firstname?.toLowerCase().includes(search) ||
      contact.lastname?.toLowerCase().includes(search) ||
      contact.email?.toLowerCase().includes(search) ||
      contact.phone?.includes(search) ||
      contact.mobile?.includes(search) ||
      contact.account_name?.toLowerCase().includes(search)
    );
  }, [contacts, searchValue]);

  if (isLoading) {
    return <ContactTableSkeleton className={className} />;
  }

  return (
    <div className={className}>
      {onSearchChange && (
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by name, email or client..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
              aria-label="Filter contacts"
            />
          </div>
          {searchValue && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              Clear
            </Button>
          )}
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {filteredContacts.length} of {contacts.length} contacts
          </span>
        </div>
      )}

      <div className="space-y-3 sm:hidden">
        {filteredContacts.map((contact) => (
          <ContactTableCard
            key={contact.contactid}
            contact={contact}
            onView={onView}
            showAccountLink={showAccountLink}
          />
        ))}
      </div>

      <div className="hidden sm:block rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Assigned To</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Created</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr 
                  key={contact.contactid}
                  className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onView?.(contact)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {contact.firstname} {contact.lastname}
                    </div>
                    {contact.title && (
                      <div className="text-xs text-muted-foreground">{contact.title}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="truncate max-w-32" title={contact.email || undefined}>
                      {contact.email || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{contact.phone || contact.mobile || '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="truncate max-w-32" title={contact.account_name || undefined}>
                      {contact.account_name || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {contact.assigned_user_name || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {formatDate(contact.createdtime)}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(contact)}>
                          <span className="sr-only">Edit</span>
                          ✏️
                        </Button>
                      )}
                      {onDelete && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(contact)}>
                          <span className="sr-only">Delete</span>
                          🗑️
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContactTable;