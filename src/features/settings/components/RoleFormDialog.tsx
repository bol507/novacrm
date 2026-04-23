// src/features/settings/components/RoleFormDialog.tsx

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogTrigger, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useRoles } from '../hooks/use-roles';
import type { Role } from '../types/settings';

interface RoleFormDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  role?: Role | null;
  onSubmit: (data: { name: string; parent_id?: string | null; sharing_rule?: number }) => void;
  isPending: boolean;
}

const roleFormSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(100, 'Max 100 characters'),
  parent_id: z.string().nullable().optional(),
  sharing_rule: z.number().default(1),
});

type FormValues = z.infer<typeof roleFormSchema>;

const SHARING_RULES = [
  { value: 0, label: 'Private (Owner only)' },
  { value: 1, label: 'Role (Parent only)' },
  { value: 2, label: 'Role & Subordinates' },
  { value: 3, label: 'All Users' },
];

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

  const form = useForm<FormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { name: '', parent_id: '', sharing_rule: 1 },
  });

  // Soporte controlado y no controlado
  const isOpen = open !== undefined ? open : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Resetear formulario al abrir o cambiar el rol
  useEffect(() => {
    if (isOpen) {
      if (role) {
        // Extraer ID del padre directo desde "H1::H2::H3::" → "H2"
        const pathParts = role.parentrole.split('::').filter(Boolean);
        const directParentId = pathParts.length > 1 ? pathParts[pathParts.length - 2] : '';
        
        form.reset({
          name: role.rolename,
          parent_id: directParentId || '',
          sharing_rule: role.sharing_rule,
        });
      } else {
        form.reset({ name: '', parent_id: '', sharing_rule: 1 });
      }
    }
  }, [isOpen, role, form]);

  const handleFormSubmit = (values: FormValues) => {
    const payload = {
      name: values.name,
      parent_id: values.parent_id || null,
      ...(role && { sharing_rule: values.sharing_rule }),
    };
    
    onSubmit(payload);
    
    // Cerrar solo si el componente maneja su propio estado
    if (open === undefined) {
      setInternalOpen(false);
    }
  };

  // Evitar que un rol se asigne a sí mismo como padre
  const availableParents = roles?.filter(r => r.roleid !== role?.roleid) || [];

  return (
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            
            {/* Nombre del Rol */}
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Role Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Sales Manager" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Rol Padre */}
            <FormField control={form.control} name="parent_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Role</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent (or leave empty for root)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None (Root Level)</SelectItem>
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
            )} />

            {/* Regla de Compartición (Solo en edición) */}
            {role && (
              <FormField control={form.control} name="sharing_rule" render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Sharing Rule</FormLabel>
                  <Select 
                    onValueChange={(val) => field.onChange(Number(val))} 
                    value={String(field.value)}
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
              )} />
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !form.formState.isValid}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {role ? 'Save Changes' : 'Create Role'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};