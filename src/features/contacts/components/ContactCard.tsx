import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Building2, Pencil, Trash2, Eye } from 'lucide-react';
import type { Contact } from '../types/contact';
import { useNavigate } from 'react-router-dom';

interface ContactCardProps {
  /** The contact to display */
  contact: Contact;
  /** Callback for editing the contact (optional) */
  onEdit?: (contact: Contact) => void;
  /** Callback for deleting the contact (optional) */
  onDelete?: (contact: Contact) => void;
  /** Whether to show the account name link (default: true) */
  showAccountLink?: boolean;
}

/**
 * ContactCard component for displaying a single contact in card format.
 *
 * Features:
 * - Displays contact name, title, and status badge
 * - Shows associated account name (optional)
 * - Shows email and phone/mobile contact information
 * - Provides view, edit, and delete actions
 * - Clickable email link with mailto functionality
 * - Hover effects and shadow transitions
 *
 * @component
 * @param props - Component props
 * @param props.contact - The contact to display
 * @param props.onEdit - Optional callback for editing the contact
 * @param props.onDelete - Optional callback for deleting the contact
 * @param props.showAccountLink - Whether to show the account name link (default: true)
 * @returns The rendered contact card
 *
 * @example
 * // Basic usage
 * <ContactCard
 *   contact={contact}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 *
 * @example
 * // Read-only mode without account link
 * <ContactCard
 *   contact={contact}
 *   showAccountLink={false}
 * />
 *
 * @example
 * // With only view action
 * <ContactCard
 *   contact={contact}
 *   onEdit={undefined}
 *   onDelete={undefined}
 * />
 */
export const ContactCard = ({ 
  contact, 
  onEdit, 
  onDelete, 
  showAccountLink = true 
}: ContactCardProps) => {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/dashboard/contacts/${contact.contactid}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">
              {contact.firstname} {contact.lastname}
            </CardTitle>
            {contact.title && (
              <p className="text-sm text-muted-foreground">{contact.title}</p>
            )}
          </div>
          {contact.contact_status && (
            <Badge variant={contact.contact_status === 'Active' ? 'default' : 'secondary'}>
              {contact.contact_status}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {showAccountLink && contact.account_name && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{contact.account_name}</span>
          </div>
        )}

        <div className="space-y-2">
          {contact.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <a 
                href={`mailto:${contact.email}`}
                className="hover:underline truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {contact.email}
              </a>
            </div>
          )}
          {(contact.phone || contact.mobile) && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span>
                {contact.phone && <span>{contact.phone}</span>}
                {contact.phone && contact.mobile && <span className="mx-1">•</span>}
                {contact.mobile && <span>{contact.mobile}</span>}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button variant="ghost" size="sm" className="flex-1" onClick={handleView}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(contact)}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(contact)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};