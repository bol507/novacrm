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
import { useMemo } from "react";
import { toast } from "sonner";


interface BaseUserFormValues {
  first_name: string;
  last_name: string;
  user_name: string;
  email: string;
  role: 'Admin' | 'Usuario' | 'Cliente';
  department?: string;
  phone_crm?: string;
}

type CreateUserFormValues = BaseUserFormValues & {
  password: string;
};

type EditUserFormValues = BaseUserFormValues;

type UserFormValues = CreateUserFormValues | EditUserFormValues;

const getUserFormSchema = (mode: 'create' | 'edit') => {
  const baseSchema = z.object({
    first_name: z.string().min(1, "Nombre requerido").max(50),
    last_name: z.string().min(1, "Apellido requerido").max(50),
    user_name: z.string().min(1, "Usuario requerido").max(50),
    email: z.string().email("Email inválido").max(100),
    role: z.enum(USER_ROLES),
    department: z.string().max(50).optional(),
    phone_crm: z.string().max(50).optional(),
  });

  if (mode === 'create') {
    return baseSchema.extend({
      password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    });
  }

  return baseSchema;
};

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  mode?: 'create' | 'edit';
  initialData?: any;
}

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

  const handleSubmit = (data: any) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
    toast.success(
      mode === 'edit' ? "Usuario actualizado exitosamente" : "Usuario creado exitosamente"
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Editar Usuario' : 'Nuevo Usuario'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre" {...field} />
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
                    <FormLabel>Apellido *</FormLabel>
                    <FormControl>
                      <Input placeholder="Apellido" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="user_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de Usuario *</FormLabel>
                  <FormControl>
                    <Input placeholder="usuario123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="correo@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            {mode === 'create' && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña *</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar rol" />
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
                    <FormLabel>Departamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ventas, Marketing, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone_crm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="+52 555 123 4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {mode === 'edit' ? 'Actualizar Usuario' : 'Crear Usuario'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;