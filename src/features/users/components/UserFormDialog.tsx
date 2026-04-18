import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USER_ROLES } from "@/features/users/types/user";
import { toast } from "sonner";

/**
 * Base form values shared between create and edit user modes
 */
interface BaseUserFormValues {
  first_name: string;
  last_name: string;
  user_name: string;
  email: string;
  role: 'Admin' | 'Usuario' | 'Cliente';
  department?: string;
  phone_crm?: string;
}

/**
 * Form values for creating a new user (includes password)
 */
type CreateUserFormValues = BaseUserFormValues & {
  password: string;
};

/**
 * Creates a Zod schema for user form validation based on mode
 * 
 * @param mode - Form mode: 'create' or 'edit'
 * @returns Zod schema object for form validation
 * 
 * @remarks
 * - Create mode requires password field with minimum 6 characters
 * - Edit mode excludes password field
 * - All text fields have max length validation
 * - Email field uses built-in email validation
 */
const getUserFormSchema = (mode: 'create' | 'edit') => {
  const baseSchema = z.object({
    first_name: z.string().min(1, "First name is required").max(30),
    last_name: z.string().min(1, "Last name is required").max(30),

    user_name: z.string().min(1, "Username is required").max(50),
    email: z.string().email("Invalid email address").max(100),
    role: z.enum(USER_ROLES),

    department: z.string().max(50).optional().or(z.literal("")),
    phone_crm: z.string().max(50).optional().or(z.literal("")),
  });

  if (mode === 'create') {
    return baseSchema.extend({
      password: z.string().min(6, "Password must be at least 6 characters"),
    });
  }

  return baseSchema;
};

/**
 * Props for UserFormDialog component
 */
interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  mode?: 'create' | 'edit';
  initialData?: any;
}

/**
 * UserFormDialog Component
 * 
 * A reusable dialog form for creating and editing users in the CRM system.
 * Supports two modes: create (with password field) and edit (without password).
 * 
 * @component
 * @param {UserFormDialogProps} props - Component props
 * @param {boolean} props.open - Controls dialog visibility
 * @param {function} props.onOpenChange - Callback to change dialog visibility
 * @param {function} props.onSubmit - Callback fired when form is submitted
 * @param {'create' | 'edit'} [props.mode='create'] - Form mode
 * @param {object} [props.initialData] - Initial data for edit mode
 * 
 * @returns {JSX.Element} User form dialog component
 * 
 * @example
 * // Create mode
 * <UserFormDialog 
 *   open={isOpen} 
 *   onOpenChange={setIsOpen} 
 *   onSubmit={handleCreateUser} 
 *   mode="create" 
 * />
 * 
 * @example
 * // Edit mode with existing user data
 * <UserFormDialog 
 *   open={isOpen} 
 *   onOpenChange={setIsOpen} 
 *   onSubmit={handleUpdateUser} 
 *   mode="edit" 
 *   initialData={selectedUser} 
 * />
 * 
 * @remarks
 * - Uses react-hook-form for form state management
 * - Uses zod for schema validation
 * - Automatically resets form after successful submission
 * - Shows success toast notification on submit
 */
const UserFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  mode = 'create',
  initialData
}: UserFormDialogProps) => {
  const formSchema = getUserFormSchema(mode);
  const getDefaultValues = (): Partial<CreateUserFormValues> => {
    if (mode === 'edit' && initialData) {
      return {
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        user_name: initialData.user_name || '',
        email: initialData.email || '',
        role: initialData.role || 'Usuario',
        department: initialData.department || '',
        phone_crm: initialData.phone_crm || '',
      };
    }

    return {
      first_name: "",
      last_name: "",
      user_name: "",
      email: "",
      password: "",
      role: "Usuario",
      department: "",
      phone_crm: "",
    };
  };

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(formSchema as any),
    defaultValues: getDefaultValues(),
  });

  const handleSubmit = (data: CreateUserFormValues) => {
    const sanitized = {
      ...data,
      department: data.department?.trim() || null,
      phone_crm: data.phone_crm?.trim() || null,
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      user_name: data.user_name.trim(),
      email: data.email.trim().toLowerCase(),
    };
    onSubmit(sanitized);
    form.reset();
    onOpenChange(false);
    toast.success(
      mode === 'edit' ? "User updated successfully" : "User created successfully"
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit User' : 'New User'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* First Name and Last Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="First name"
                        {...field}
                        onBlur={(e) => {
                          field.onChange(e.target.value.trim());
                          field.onBlur?.();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Last name"
                        {...field}
                        onBlur={(e) => {
                          field.onChange(e.target.value.trim());
                          field.onBlur?.();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Username Field */}
            <FormField
              control={form.control}
              name="user_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Username123"
                      {...field}
                      onBlur={(e) => {
                        field.onChange(e.target.value.trim());
                        field.onBlur?.();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@company.com"
                      {...field}
                      onBlur={(e) => {
                        field.onChange(e.target.value.trim());
                        field.onBlur?.();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field (Create Mode Only) */}
            {mode === 'create' && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password *</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Role and Department Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {USER_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input
                      placeholder="Sales, Marketing, etc."
                      {...field}
                      onBlur={(e) => {
                        field.onChange(e.target.value.trim());
                        field.onBlur?.();
                      }}
                    />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Phone Field */}
            <FormField
              control={form.control}
              name="phone_crm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+1 555 123 456"
                      {...field}
                      onBlur={(e) => {
                        field.onChange(e.target.value.trim());
                        field.onBlur?.();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {mode === 'edit' ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;