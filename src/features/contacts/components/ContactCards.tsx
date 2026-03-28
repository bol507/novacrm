import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ContactCard } from './ContactCard';
import type { Contact } from '../types/contact';

interface ContactCardsProps {
  /** Array of contacts to display */
  contacts: Contact[];
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Callback for editing a contact (optional) */
  onEditContact?: (contact: Contact) => void;
  /** Callback for deleting a contact (optional) */
  onDeleteContact?: (contact: Contact) => void;
  /** Whether to show the account name link (default: true) */
  showAccountLink?: boolean;
}

/**
 * ContactCards component for displaying contacts in a responsive card grid.
 *
 * Features:
 * - Skeleton loading state with animated placeholders
 * - Empty state with helpful message and icon
 * - Responsive grid layout (1 column on mobile, up to 4 on large screens)
 * - Delegates individual contact rendering to ContactCard component
 *
 * @component
 * @param props - Component props
 * @param props.contacts - Array of contacts to display
 * @param props.isLoading - Whether data is currently loading
 * @param props.onEditContact - Callback for editing a contact (optional)
 * @param props.onDeleteContact - Callback for deleting a contact (optional)
 * @param props.showAccountLink - Whether to show the account name link (default: true)
 * @returns The rendered contact cards grid
 *
 * @example
 * // Basic usage
 * <ContactCards
 *   contacts={contacts}
 *   isLoading={isLoading}
 *   onEditContact={handleEditContact}
 *   onDeleteContact={handleDeleteContact}
 * />
 *
 * @example
 * // Read-only mode without account link
 * <ContactCards
 *   contacts={contacts}
 *   isLoading={false}
 *   showAccountLink={false}
 * />
 *
 * @example
 * // Empty state
 * <ContactCards
 *   contacts={[]}
 *   isLoading={false}
 * />
 */
export const ContactCards = ({
  contacts,
  isLoading,
  onEditContact,
  onDeleteContact,
  showAccountLink = true,
}: ContactCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-5/6" />
              <div className="h-3 bg-muted rounded w-4/6" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">👤</span>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No contacts found</h3>
        <p className="text-muted-foreground">Create your first contact to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {contacts.map((contact) => (
        <ContactCard
          key={contact.contactid}
          contact={contact}
          onEdit={onEditContact}
          onDelete={onDeleteContact}
          showAccountLink={showAccountLink}
        />
      ))}
    </div>
  );
};