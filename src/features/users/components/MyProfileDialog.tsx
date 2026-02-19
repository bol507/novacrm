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
import { useMyProfile, useUpdateMyProfile } from "../hooks/use-my-profile";
import { useEffect } from "react";
import { Building2Icon, MailIcon, PhoneIcon, UserIcon } from "lucide-react";

const profileSchema = z.object({
  first_name: z.string().min(1, "Nombre requerido").max(50),
  last_name: z.string().min(1, "Apellido requerido").max(50),
  username: z.string().min(1, "Usuario requerido").max(50),
  email: z.string().email("Email inválido").max(100),
  department: z.string().max(50).optional(),
  phone: z.string().max(50).optional(),     
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface MyProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MyProfileDialog = ({ open, onOpenChange }: MyProfileDialogProps) => {
  const { data: profile, isLoading, refetch } = useMyProfile();
  const updateMutation = useUpdateMyProfile();
  
  useEffect(() => {
    if (open) {
      refetch(); 
    }
  }, [open, refetch]);

   const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      department: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (profile && open) {
      form.reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        username: profile.username || "",
        email: profile.email || "",
        department: profile.department || "",
        phone: profile.phone || "",
      });
    }
  }, [profile, open, form]);

  const handleSubmit = (data: ProfileFormValues) => {
    
    const backendData = {
      first_name: data.first_name,
      last_name: data.last_name,
      user_name: data.username, 
      email: data.email,
      department: data.department,
      phone_crm: data.phone, 
    };
    
    updateMutation.mutate(backendData, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  if (isLoading && open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cargando...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mi Cuenta</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Nombre completo */}
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

            {/* Usuario */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      Usuario *
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="usuario123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center gap-2">
                      <MailIcon className="w-4 h-4" />
                      Email *
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="correo@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Departamento */}
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center gap-2">
                      <Building2Icon className="w-4 h-4" />
                      Departamento
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ventas, Marketing, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Teléfono */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4" />
                      Teléfono
                    </div>
                  </FormLabel>
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
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MyProfileDialog;