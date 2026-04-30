import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Phone, 
  Building2, 
  User as UserIcon,
} from "lucide-react";
import type { User } from "../types/user";

/**
 * Props for UserDetailDialog component
 */
interface UserDetailDialogProps {
  /** User object to display details for */
  user: User | null;
  /** Controls dialog visibility */
  open: boolean;
  /** Callback to change dialog visibility */
  onOpenChange: (open: boolean) => void;
}

/**
 * Gets the CSS classes for status badge styling based on user status
 * 
 * @param status - User status string ('Active' or 'Inactive')
 * @returns CSS class string for badge styling
 * 
 * @example
 * getStatusColor('Active') // returns green styling classes
 * getStatusColor('Inactive') // returns red styling classes
 */
const getStatusColor = (status: string) => {
  return status === "Active"
    ? "bg-green-500/10 text-green-600 border-green-500/20"
    : "bg-red-500/10 text-red-600 border-red-500/20";
};

/**
 * UserDetailDialog Component
 * 
 * Displays detailed information about a user in a modal dialog.
 * Shows personal information, contact details, and organization data.
 * 
 * @component
 * @param {UserDetailDialogProps} props - Component props
 * @param {User | null} props.user - User object to display details for
 * @param {boolean} props.open - Controls dialog visibility
 * @param {function} props.onOpenChange - Callback to change dialog visibility
 * 
 * @returns {JSX.Element|null} User detail dialog component or null if no user
 * 
 * @example
 * // Basic usage
 * <UserDetailDialog 
 *   user={selectedUser} 
 *   open={isDialogOpen} 
 *   onOpenChange={setIsDialogOpen} 
 * />
 * 
 * @remarks
 * - Returns null if user is null or undefined
 * - Dialog is responsive with max-width of 2xl and max-height of 90vh
 * - Content is scrollable for long user details
 * - Status badge color changes based on active/inactive status
 * - Admin users display a shield icon next to their role
 * 
 * @see {@link User} for user object structure
 * @see {@link Dialog} for underlying dialog component
 */
export const UserDetailDialog = ({ user, open, onOpenChange }: UserDetailDialogProps) => {
  // Return null if no user data to display
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {/* Header with user avatar and status badge */}
          <div className="flex items-start justify-between gap-4">
            {/* User avatar with initials */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-lg font-semibold text-primary">
                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                </span>
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {user.first_name} {user.last_name}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">@{user.user_name}</p>
              </div>
            </div>
            
            {/* Status badge */}
            <Badge variant="outline" className={getStatusColor(user.status)}>
              {user.status === "Active" ? "Active" : "Inactive"}
            </Badge>
          </div>
        </DialogHeader>

        {/* Main content area */}
        <div className="space-y-6 py-4">
          {/* Personal Information Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">First Name</p>
                <p className="font-medium">{user.first_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Name</p>
                <p className="font-medium">{user.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="font-medium">@{user.user_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Information
            </h3>
            <div className="space-y-2">
              {user.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
              )}
              {user.phone_crm && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.phone_crm}</span>
                </div>
              )}
            </div>
          </div>

          {/* Organization Section (conditional rendering) */}
          {(user.department || user.reports_to_id) && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Organization
              </h3>
              <div className="space-y-2">
                {user.department && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{user.department}</span>
                  </div>
                )}
                {user.reports_to_id && (
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Reports to: ID {user.reports_to_id}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
