import { useState, useEffect } from 'react';
import { FormProvider, useForm,  } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useRoles } from '../hooks/use-roles';
import type { Role } from '../types/settings';
import { roleSchema, type RoleFormValues } from '../validations/settings';
import { settingsService } from '../services/settings-service';
import { useAsyncNameValidation } from '../hooks/use-async-name-validation';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface RoleFormDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  role?: Role | null;
  onSubmit: (data: { name: string; parent_id?: string | null; sharing_rule?: number }) => void;
  isPending: boolean;
}

const SHARING_RULES = [
  { value: 0, label: 'Private (Owner only)' },
  { value: 1, label: 'Role (Parent only)' },
  { value: 2, label: 'Role & Subordinates' },
  { value: 3, label: 'All Users' },
];

/**
 * Dialog component for creating or editing a role.
 *
 * Features:
 * - Form with role name, parent role selection, and sharing rule (edit mode)
 * - Async name uniqueness validation
 * - Parent role hierarchy management
 * - Loading states and error handling
 *
 * @component
 * @param props - Component props
 * @param props.trigger - Optional trigger button to open the dialog
 * @param props.open - Controlled open state (optional)
 * @param props.onOpenChange - Controlled open state change callback (optional)
 * @param props.role - Role data for edit mode (optional)
 * @param props.onSubmit - Callback when form is submitted
 * @param props.isPending - Whether a submit operation is in progress
 * @returns The rendered role form dialog component
 */
export const RoleFormDialog = ({
  trigger,
  open,
  onOpenChange,
  role,
  onSubmit,
  isPending,
}: RoleFormDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const { data: roles } = useRoles();

  const isOpen = open !== undefined ? open : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const methods = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: '', parent_id: '', sharing_rule: 1 },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (isOpen) {
      if (role) {
        const pathParts = role.parentrole.split('::').filter(Boolean);
        const directParentId = pathParts.length > 1 ? pathParts[pathParts.length - 2] : '';
        methods.reset({
          name: role.rolename,
          parent_id: directParentId || '',
          sharing_rule: role.sharing_rule,
        });
      } else {
        methods.reset({ name: '', parent_id: '', sharing_rule: 1 });
      }
    }
  }, [isOpen, role, methods]);

  const handleFormSubmit = (values: RoleFormValues) => {
    const payload = {
      name: values.name,
      parent_id: values.parent_id || null,
      sharing_rule: values.sharing_rule,
    };
    onSubmit(payload);
    if (open === undefined) {
      setInternalOpen(false);
    }
  };

  const { isChecking, cancel } = useAsyncNameValidation(
    (name) => settingsService.isRoleNameAvailable(name, role?.roleid),
    400
  );

  

  useEffect(() => {
    return () => { cancel(); };
  }, [cancel]);

  const availableParents = roles?.filter(r => r.roleid !== role?.roleid) || [];

  return (
    <ErrorBoundary>
      <Dialog open={isOpen} onOpenChange={setOpen}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{role ? 'Edit Role' : 'Create New Role'}</DialogTitle>
            <DialogDescription>
              {role
                ? 'Update role name, hierarchy position, and data sharing rules.'
                : 'Add a new role to the organizational structure.'}
            </DialogDescription>
          </DialogHeader>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleFormSubmit)} className="space-y-4">

              <FormField 
                control={methods.control} 
                name="name" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name *</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          
                          disabled={isPending}
                          placeholder="e.g., Sales Manager"
                        />
                      </FormControl>
                      {isChecking && (
                        <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} 
              />

              <FormField 
                control={methods.control} 
                name="parent_id" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Role</FormLabel>
                    <Select 
                      onValueChange={(val) => field.onChange(val)} 
                      value={field.value || ''}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent (or leave empty for root)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableParents.map(p => (
                          <SelectItem key={p.roleid} value={p.roleid}>
                            {p.rolename}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Leaving empty creates a top-level role.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} 
              />
               {/*  SHARING RULE FIELD */}
              
                <FormField 
                  control={methods.control} 
                  name="sharing_rule" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Sharing Rule</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={String(field.value)}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SHARING_RULES.map(rule => (
                            <SelectItem key={rule.value} value={String(rule.value)}>
                              {rule.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Controls visibility of records assigned to this role.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
             

              <DialogFooter className="gap-2 sm:gap-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)} 
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPending || !methods.formState.isValid}
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {role ? 'Save Changes' : 'Create Role'}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  );
};